from __future__ import annotations

import numpy as np
import pytest
import rasterio
from rasterio.transform import from_origin

from app.artifacts import ArtifactStore

SIZE = 8


@pytest.fixture()
def three_band_geotiff_bytes(tmp_path) -> bytes:
    """3-band float32 raster (B,G,R) with strongly co-varying log-radiance so
    the Lyzenga covariance/attenuation-ratio computation has real signal."""
    base = np.linspace(5.0, 40.0, SIZE * SIZE, dtype="float32").reshape(1, SIZE, SIZE)
    blue = base
    green = 2.0 * base + 4.0
    red = 0.5 * base + 8.0
    data = np.concatenate([blue, green, red], axis=0).astype("float32")
    path = tmp_path / "substrate.tif"
    with rasterio.open(
        path,
        "w",
        driver="GTiff",
        height=SIZE,
        width=SIZE,
        count=3,
        dtype="float32",
        crs="EPSG:4326",
        transform=from_origin(0, SIZE, 1, 1),
    ) as dst:
        dst.write(data)
    return path.read_bytes()


def _grid_points(size: int = SIZE) -> list[dict[str, float]]:
    return [
        {"lat": float(size - row - 0.5), "lon": float(col + 0.5)}
        for row in range(size)
        for col in range(size)
    ]


def test_lyzenga_builds_dii_raster(
    store: ArtifactStore, three_band_geotiff_bytes: bytes
) -> None:
    from app.nodes.lyzenga import execute_lyzenga

    ref = store.save("input.tif", "raster", three_band_geotiff_bytes)
    result = execute_lyzenga(
        store=store,
        params={
            "file": ref.id,
            "blue_band": 1,
            "green_band": 2,
            "red_band": 3,
            "sample_points": _grid_points(),
            "inverse_transform": True,
        },
        inputs={"raster": ref.id},
        output_ports=["out"],
    )
    assert result["implemented"] is True
    assert result["outputs"]["out"] != ref.id
    assert set(result["summary"]["pairs"]) == {"dii_12", "dii_13", "dii_23"}
    assert result["summary"]["transform"] == "exp"
    assert result["summary"]["sampleCount"] == len(_grid_points())

    pair = result["summary"]["pairs"]["dii_12"]
    assert pair["ratioIj"] > 0.0
    assert 0.0 <= pair["r2"] <= 1.0

    out_ref = store.get(result["outputs"]["out"])
    with rasterio.open(out_ref.path) as dataset:
        assert dataset.count == 3
        assert dataset.dtypes[0] == "float32"
        dii = dataset.read()

    # every input pixel is positive, so exp(DII) must be finite and positive
    assert np.isfinite(dii).all()
    assert float(dii.min()) > 0.0


def test_lyzenga_keeps_log_domain_without_inverse(
    store: ArtifactStore, three_band_geotiff_bytes: bytes
) -> None:
    from app.nodes.lyzenga import execute_lyzenga

    ref = store.save("input.tif", "raster", three_band_geotiff_bytes)
    result = execute_lyzenga(
        store=store,
        params={
            "file": ref.id,
            "blue_band": 1,
            "green_band": 2,
            "red_band": 3,
            "sample_points": _grid_points(),
            "inverse_transform": False,
        },
        inputs={"raster": ref.id},
        output_ports=["out"],
    )
    assert result["implemented"] is True
    assert result["summary"]["transform"] == "log"


def test_lyzenga_requires_file_param(store: ArtifactStore) -> None:
    from app.nodes.lyzenga import execute_lyzenga

    try:
        execute_lyzenga(store, {"blue_band": 1, "green_band": 2, "red_band": 3}, {}, ["out"])
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_lyzenga_rejects_duplicate_bands(
    store: ArtifactStore, three_band_geotiff_bytes: bytes
) -> None:
    from app.nodes.lyzenga import execute_lyzenga

    ref = store.save("input.tif", "raster", three_band_geotiff_bytes)
    try:
        execute_lyzenga(
            store=store,
            params={
                "file": ref.id,
                "blue_band": 1,
                "green_band": 1,
                "red_band": 3,
                "sample_points": _grid_points(),
            },
            inputs={},
            output_ports=["out"],
        )
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_lyzenga_rejects_band_out_of_range(
    store: ArtifactStore, three_band_geotiff_bytes: bytes
) -> None:
    from app.nodes.lyzenga import execute_lyzenga

    ref = store.save("input.tif", "raster", three_band_geotiff_bytes)
    try:
        execute_lyzenga(
            store=store,
            params={
                "file": ref.id,
                "blue_band": 1,
                "green_band": 2,
                "red_band": 9,
                "sample_points": _grid_points(),
            },
            inputs={},
            output_ports=["out"],
        )
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_lyzenga_raises_without_valid_samples(
    store: ArtifactStore, three_band_geotiff_bytes: bytes
) -> None:
    from app.nodes.lyzenga import execute_lyzenga

    ref = store.save("input.tif", "raster", three_band_geotiff_bytes)
    try:
        execute_lyzenga(
            store=store,
            params={
                "file": ref.id,
                "blue_band": 1,
                "green_band": 2,
                "red_band": 3,
                "sample_points": [{"lat": -5.0, "lon": 110.0}] * 10,
            },
            inputs={},
            output_ports=["out"],
        )
        raise AssertionError("expected ValueError")
    except ValueError:
        pass
