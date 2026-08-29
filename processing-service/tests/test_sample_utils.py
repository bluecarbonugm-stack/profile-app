from __future__ import annotations

import io

import numpy as np
import pytest
import rasterio
from pyproj import CRS, Transformer
from rasterio.transform import from_origin

from app.nodes.sample_utils import extract_samples_from_artifact


def test_extract_samples_returns_valid_array(store, tiny_geotiff_bytes):
    ref = store.save("src.tif", "raster", tiny_geotiff_bytes)
    samples, meta = extract_samples_from_artifact(
        store=store,
        artifact_id=ref.id,
        sample_points=[{"lat": 2.0, "lon": 1.0}, {"lat": 3.0, "lon": 0.0}],
    )
    assert samples.shape == (2, 2)
    assert samples.dtype == np.float32
    np.testing.assert_allclose(samples, 1.0)
    assert meta["width"] == 4
    assert meta["height"] == 4


def test_extract_samples_rejects_missing_points(store, tiny_geotiff_bytes):
    ref = store.save("src.tif", "raster", tiny_geotiff_bytes)
    with pytest.raises(ValueError):
        extract_samples_from_artifact(store=store, artifact_id=ref.id, sample_points=[])


def test_extract_samples_skips_out_of_bounds_points(store, tiny_geotiff_bytes):
    ref = store.save("src.tif", "raster", tiny_geotiff_bytes)
    samples, _ = extract_samples_from_artifact(
        store=store,
        artifact_id=ref.id,
        sample_points=[{"lat": -5.0, "lon": 110.0}, {"lat": 2.0, "lon": 2.0}],
    )
    assert samples.shape == (1, 2)


def test_extract_samples_rejects_when_no_point_falls_inside(store, tiny_geotiff_bytes):
    ref = store.save("src.tif", "raster", tiny_geotiff_bytes)
    with pytest.raises(ValueError):
        extract_samples_from_artifact(
            store=store,
            artifact_id=ref.id,
            sample_points=[{"lat": -5.0, "lon": 110.0}],
        )


def test_extract_samples_skips_nonfinite_pixels(store):
    """A ROI point on a nodata/NaN pixel must be dropped, not propagated as
    NaN into the regression design matrix (sklearn rejects NaN input)."""
    data = np.full((1, 4, 4), 5.0, dtype="float32")
    data[0, 0, 0] = np.nan
    buffer = io.BytesIO()
    with rasterio.open(
        buffer,
        "w",
        driver="GTiff",
        height=4,
        width=4,
        count=1,
        dtype="float32",
        crs="EPSG:4326",
        transform=from_origin(0, 4, 1, 1),
    ) as dst:
        dst.write(data)
    ref = store.save("nan.tif", "raster", buffer.getvalue())

    samples, _ = extract_samples_from_artifact(
        store=store,
        artifact_id=ref.id,
        # first point lands on the NaN pixel at row 0, col 0
        sample_points=[{"lat": 3.5, "lon": 0.5}, {"lat": 2.5, "lon": 1.5}],
    )
    assert samples.shape == (1, 1)
    assert float(samples[0, 0]) == 5.0


def test_extract_samples_reprojects_wgs84_points(store):
    data = np.arange(2 * 4 * 4, dtype="uint8").reshape(2, 4, 4)
    x_min, y_max, pixel = 12_000_000.0, -500_000.0, 100.0
    buffer = io.BytesIO()
    with rasterio.open(
        buffer,
        "w",
        driver="GTiff",
        height=4,
        width=4,
        count=2,
        dtype="uint8",
        crs="EPSG:3857",
        transform=from_origin(x_min, y_max, pixel, pixel),
    ) as dst:
        dst.write(data)
    ref = store.save("mercator.tif", "raster", buffer.getvalue())

    to_wgs84 = Transformer.from_crs(CRS.from_epsg(3857), CRS.from_epsg(4326), always_xy=True)
    lon, lat = to_wgs84.transform(x_min + 2 * pixel, y_max - 2 * pixel)

    samples, meta = extract_samples_from_artifact(
        store=store,
        artifact_id=ref.id,
        sample_points=[{"lat": lat, "lon": lon}],
    )
    assert meta["crs"] == "EPSG:3857"
    assert samples.shape == (1, 2)
    assert int(samples[0, 0]) == int(data[0, 2, 2])
    assert int(samples[0, 1]) == int(data[1, 2, 2])
