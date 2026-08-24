from __future__ import annotations

import logging
import math
from pathlib import Path

import numpy as np
import rasterio
from rasterio.io import MemoryFile

from app.artifacts import ArtifactStore
from app.nodes.sample_utils import extract_samples_from_artifact

logger = logging.getLogger(__name__)


def _log_band(raw: np.ndarray) -> np.ndarray:
    log_band = np.full_like(raw, np.nan, dtype="float32")
    positive = np.isfinite(raw) & (raw > 0)
    log_band[positive] = np.log(raw[positive])
    return log_band


def execute_lyzenga(
    store: ArtifactStore,
    params: dict,
    inputs: dict,
    output_ports: list[str] | None = None,
) -> dict:
    """Port of CoastalAutoMapper ``lyzenga.run_lyzenga_stacked`` (Lyzenga 1981
    stacked depth-invariant index): per band pair, fit the variance/covariance
    attenuation ratio on homogeneous-substrate samples and combine log bands
    into DII23/DII24/DII34. Report/preview scaffolding is not ported."""
    artifact_id = params.get("file") or next(iter(inputs.values()), None)
    if not artifact_id:
        raise ValueError("water-column requires a 'file' param or a connected raster input")

    # Defaults follow the Sentinel-2 convention: B2=Blue, B3=Green, B4=Red.
    try:
        b_blue = int(params.get("blue_band") or 2)
        b_green = int(params.get("green_band") or 3)
        b_red = int(params.get("red_band") or 4)
    except (TypeError, ValueError) as exc:
        raise ValueError("blue_band/green_band/red_band must be 1-based band indices") from exc

    sample_points = params.get("sample_points") or []
    inverse_transform = bool(params.get("inverse_transform", True))

    ref = store.get(str(artifact_id))
    with rasterio.open(ref.path) as dataset:
        stack = np.ma.filled(dataset.read(masked=True).astype("float32"), np.nan)
        profile = dataset.profile
        n_bands = dataset.count

    for name, band in (
        ("blue_band", b_blue),
        ("green_band", b_green),
        ("red_band", b_red),
    ):
        if band < 1 or band > n_bands:
            raise ValueError(
                f"Configured {name} index {band} is out of range for input raster"
                f" with {n_bands} bands."
            )

    distinct_bands = {b_blue, b_green, b_red}
    if len(distinct_bands) != 3:
        raise ValueError(
            "Lyzenga stacked requires three distinct bands for Blue, Green, and Red "
            f"(got blue={b_blue}, green={b_green}, red={b_red})."
        )

    log_bands = {band: _log_band(stack[band - 1]) for band in distinct_bands}

    samples, _ = extract_samples_from_artifact(store, str(artifact_id), sample_points)

    # Standard band pairs for coastal mapping: (Blue,Green), (Blue,Red), (Green,Red)
    band_pairs = [(b_blue, b_green), (b_blue, b_red), (b_green, b_red)]
    dii_bands: list[np.ndarray] = []
    pairs_summary: dict[str, dict[str, float]] = {}

    for band_i_1b, band_j_1b in band_pairs:
        raw_i = samples[:, band_i_1b - 1]
        raw_j = samples[:, band_j_1b - 1]
        usable = np.isfinite(raw_i) & np.isfinite(raw_j) & (raw_i > 0) & (raw_j > 0)
        x_log = np.log(raw_i[usable])
        y_log = np.log(raw_j[usable])

        if x_log.size < 2:
            raise ValueError(
                f"Sand samples contain no valid values for bands {band_i_1b}/{band_j_1b} "
                f"(after removing NaN/inf). Ensure sampling points fall on pixels "
                f"with positive reflectance in both bands."
            )

        cov = np.cov([x_log, y_log], bias=False)
        var_ii = float(cov[0, 0])
        var_jj = float(cov[1, 1])
        cov_ij = float(cov[0, 1])

        if np.isclose(cov_ij, 0.0):
            raise ValueError(f"Covariance near zero for bands {band_i_1b}/{band_j_1b}")

        denom = math.sqrt(var_ii * var_jj) if var_ii > 0.0 and var_jj > 0.0 else 0.0
        r2 = float((cov_ij / denom) ** 2) if denom > 0.0 else 0.0
        if r2 < 0.8:
            logger.warning(
                "R²=%.4f < 0.8 for bands %d/%d. Theory (Lyzenga 1981) recommends "
                "R² > 0.8. Proceeding with caution.",
                r2,
                band_i_1b,
                band_j_1b,
            )

        a = (var_ii - var_jj) / (2.0 * cov_ij)
        ratio_ij = float(a + math.sqrt(a * a + 1.0))

        dii = log_bands[band_i_1b] - ratio_ij * log_bands[band_j_1b]
        if inverse_transform:
            dii = np.exp(dii)
        dii_bands.append(dii.astype("float32"))

        pairs_summary[f"dii_{band_i_1b}{band_j_1b}"] = {
            "varIi": var_ii,
            "varJj": var_jj,
            "covIj": cov_ij,
            "ratioIj": ratio_ij,
            "r2": r2,
        }

    dii_stack = np.stack(dii_bands, axis=0).astype("float32")
    transform_suffix = "exp" if inverse_transform else "log"

    profile_out = {
        key: value
        for key, value in {**profile, "count": dii_stack.shape[0], "dtype": "float32"}.items()
        if key not in ("blockxsize", "blockysize", "tiled", "nodata")
    }
    with MemoryFile() as memfile:
        with memfile.open(**profile_out) as dst:
            dst.write(dii_stack)
        tif_bytes = memfile.read()

    new_ref = store.save(
        f"lyzenga_dii_stack_{transform_suffix}_{Path(ref.filename).stem}.tif",
        "raster",
        tif_bytes,
    )

    port_id = (output_ports or ["out"])[0]
    return {
        "implemented": True,
        "summary": {
            "pairs": pairs_summary,
            "sampleCount": int(samples.shape[0]),
            "transform": transform_suffix,
        },
        "outputs": {port_id: new_ref.id},
    }
