from __future__ import annotations

from pathlib import Path
from typing import Any, Sequence

import numpy as np
import rasterio
from rasterio.io import MemoryFile
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

from app.artifacts import ArtifactStore
from app.nodes.sample_utils import extract_samples_from_artifact


def _parse_band_list(raw: Any, param_name: str) -> list[int]:
    if isinstance(raw, str):
        parts = [part.strip() for part in raw.split(",") if part.strip()]
        try:
            return [int(part) for part in parts]
        except ValueError as exc:
            raise ValueError(f"{param_name} must be comma-separated band indices") from exc
    if isinstance(raw, Sequence):
        try:
            return [int(band) for band in raw]
        except (TypeError, ValueError) as exc:
            raise ValueError(f"{param_name} must contain integer band indices") from exc
    raise ValueError(f"{param_name} must be a comma-separated string or a list of integers")


def execute_hedley(
    store: ArtifactStore,
    params: dict,
    inputs: dict,
    output_ports: list[str] | None = None,
) -> dict:
    """Port of CoastalAutoMapper ``hedley.run_hedley`` (Hedley 2005 sunglint
    correction): regress each visible band against deep-water NIR samples and
    remove the correlated glint offset. Report/preview scaffolding is not ported."""
    artifact_id = params.get("file") or next(iter(inputs.values()), None)
    if not artifact_id:
        raise ValueError("sunglint requires a 'file' param or a connected raster input")

    vis_bands_1b = _parse_band_list(params.get("visible_bands"), "visible_bands")
    if not vis_bands_1b:
        raise ValueError("At least one visible band index must be provided.")

    try:
        nir_band_1b = int(params["nir_band"])
    except (KeyError, TypeError, ValueError) as exc:
        raise ValueError("nir_band must be a 1-based band index") from exc

    sample_points = params.get("sample_points") or []
    ref = store.get(str(artifact_id))

    with rasterio.open(ref.path) as dataset:
        data = dataset.read(masked=False).astype("float32")
        nodata = dataset.nodata
        profile = dataset.profile
        n_bands = dataset.count

    nir_idx = nir_band_1b - 1
    if nir_idx < 0 or nir_idx >= n_bands:
        raise ValueError("nir_band index is out of range for the loaded raster.")

    vis_indices = [band - 1 for band in vis_bands_1b]
    if (
        len(vis_indices) != 3
        or any(idx < 0 or idx >= n_bands for idx in vis_indices)
        or nir_idx in vis_indices
    ):
        raise ValueError(
            "Hedley correction requires exactly 3 visible bands within raster range,"
            " different from the NIR band (e.g. blue, green, red)."
        )

    valid_mask = np.isfinite(data)
    if nodata is not None:
        valid_mask &= data != float(nodata)

    samples, _ = extract_samples_from_artifact(store, str(artifact_id), sample_points)

    X_nir = samples[:, nir_idx].reshape(-1, 1)
    nir_min = float(np.min(X_nir))
    nir_pixels = data[nir_idx]

    slopes: dict[int, float] = {}
    intercepts: dict[int, float] = {}
    r2_scores: dict[int, float] = {}
    rmse_scores: dict[int, float] = {}

    for b_1b, b_idx in zip(vis_bands_1b, vis_indices):
        y = samples[:, b_idx]
        model = LinearRegression()
        model.fit(X_nir, y)
        y_pred = model.predict(X_nir)

        slope = float(model.coef_[0])
        slopes[b_1b] = slope
        intercepts[b_1b] = float(model.intercept_)
        r2_scores[b_1b] = float(r2_score(y, y_pred))
        rmse_scores[b_1b] = float(np.sqrt(np.mean((y - y_pred) ** 2)))

        # corrected = band - slope * (nir - nir_min); clip only valid pixels so
        # nodata sentinels survive for the fill step at write time.
        data[b_idx] = data[b_idx] - slope * (nir_pixels - nir_min)
        band_valid_mask = valid_mask[b_idx]
        if band_valid_mask.any():
            np.clip(data[b_idx], 0.0, None, out=data[b_idx], where=band_valid_mask)

    vis_order = [band - 1 for band in vis_bands_1b]
    stacked = data[vis_order]
    if nodata is not None:
        stacked = np.where(valid_mask[vis_order], stacked, float(nodata))

    profile_out = {
        key: value
        for key, value in {**profile, "count": stacked.shape[0], "dtype": "float32"}.items()
        if key not in ("blockxsize", "blockysize", "tiled", "nodata")
    }
    if nodata is not None:
        profile_out["nodata"] = float(nodata)

    with MemoryFile() as memfile:
        with memfile.open(**profile_out) as dst:
            dst.write(stacked.astype("float32"))
        tif_bytes = memfile.read()

    new_ref = store.save(f"hedley_corrected_{Path(ref.filename).stem}.tif", "raster", tif_bytes)

    port_id = (output_ports or ["out"])[0]
    return {
        "implemented": True,
        "summary": {
            "slopes": {str(band): slope for band, slope in slopes.items()},
            "intercepts": {str(band): value for band, value in intercepts.items()},
            "r2Scores": {str(band): value for band, value in r2_scores.items()},
            "rmseScores": {str(band): value for band, value in rmse_scores.items()},
            "nirMin": nir_min,
            "sampleCount": int(samples.shape[0]),
        },
        "outputs": {port_id: new_ref.id},
    }
