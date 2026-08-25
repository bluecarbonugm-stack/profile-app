from __future__ import annotations

from typing import Any, Mapping, Sequence

import numpy as np
import rasterio
from pyproj import CRS, Transformer
from rasterio.transform import rowcol

from app.artifacts import ArtifactStore

#: Scientific minimum: regressions over fewer points are meaningless. Enforced
#: by the sunglint/water-column executors after extraction.
MIN_ROI_SAMPLE_POINTS = 10


def extract_samples_from_artifact(
    store: ArtifactStore,
    artifact_id: str,
    sample_points: Sequence[Mapping[str, float]],
) -> tuple[np.ndarray, dict[str, Any]]:
    """Extract float32 per-point band samples from a stored raster artifact.

    Sample points are given as WGS84 lat/lon dicts and reprojected to the
    raster CRS when needed. Points outside the raster bounds or landing on
    non-finite (nodata/NaN) pixels are skipped; a ``ValueError`` is raised when
    no valid sample remains.

    Returns ``(samples, raster_meta)`` where ``samples`` has shape
    ``(n_valid_points, n_bands)`` and ``raster_meta`` carries the georeferencing
    needed to write derived rasters back to disk.
    """
    ref = store.get(str(artifact_id))
    with rasterio.open(ref.path) as dataset:
        stack = dataset.read(masked=True).astype("float32")
        raster_meta: dict[str, Any] = {
            "transform": dataset.transform,
            "crs": str(dataset.crs) if dataset.crs else None,
            "width": dataset.width,
            "height": dataset.height,
        }
    samples = _extract_samples(
        points=sample_points,
        data=np.ma.filled(stack, np.nan),
        transform=raster_meta["transform"],
        crs=raster_meta["crs"],
        width=raster_meta["width"],
        height=raster_meta["height"],
    )
    return samples, raster_meta


def _extract_samples(
    points: Sequence[Mapping[str, float]],
    data: np.ndarray,
    transform: Any,
    crs: str | None,
    width: int,
    height: int,
) -> np.ndarray:
    """Port of CoastalAutoMapper ``sample_utils.extract_samples``."""
    points_list = list(points)
    n_bands = data.shape[0]

    samples = np.empty((len(points_list), n_bands), dtype=np.float32)
    valid_count = 0

    raster_crs = CRS.from_user_input(crs) if crs is not None else None
    if raster_crs is not None and raster_crs.to_epsg() != 4326:
        wgs84 = CRS.from_epsg(4326)
        transformer: Transformer | None = Transformer.from_crs(wgs84, raster_crs, always_xy=True)
    else:
        transformer = None

    for pt in points_list:
        try:
            lat = float(pt["lat"])
            lon = float(pt["lon"])

            if transformer is None:
                x, y = lon, lat
            else:
                x, y = transformer.transform(lon, lat)

            r, c = rowcol(transform, x, y)
            if r < 0 or r >= height or c < 0 or c >= width:
                continue

            values = data[:, r, c]
            # A ROI point on a nodata pixel would poison the regression with
            # NaN (sklearn rejects NaN input with an opaque error), so drop it
            # here alongside out-of-bounds points.
            if not np.all(np.isfinite(values)):
                continue
            samples[valid_count, :] = values
            valid_count += 1
        except Exception:
            continue

    if valid_count == 0:
        raise ValueError("No valid samples could be extracted from the provided points.")

    return samples[:valid_count, :]
