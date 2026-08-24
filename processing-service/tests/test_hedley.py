from __future__ import annotations

import numpy as np
import pytest
import rasterio
from rasterio.transform import from_origin

from app.artifacts import ArtifactStore

SIZE = 8


@pytest.fixture()
def four_band_geotiff_bytes(tmp_path) -> bytes:
    """4-band uint8 raster (B,G,R,NIR) whose visible bands depend linearly on
    NIR, simulating sunglint so the Hedley regression has real signal."""
    nir = np.arange(SIZE * SIZE, dtype="float32").reshape(1, SIZE, SIZE)
    blue = 0.5 * nir + 10.0
    green = 0.7 * nir + 5.0
    red = 0.3 * nir + 20.0
    data = np.concatenate([blue, green, red, nir], axis=0).astype("uint8")
    path = tmp_path / "glinty.tif"
    with rasterio.open(
        path,
        "w",
        driver="GTiff",
        height=SIZE,
        width=SIZE,
        count=4,
        dtype="uint8",
        crs="EPSG:4326",
        transform=from_origin(0, SIZE, 1, 1),
        # without this GDAL treats a 4-band uint8 raster as RGBA and masks
        # pixels where the NIR band (read as alpha) is 0
        photometric="multiband",
    ) as dst:
        dst.write(data)
    return path.read_bytes()


def _grid_points(size: int = SIZE) -> list[dict[str, float]]:
    return [
        {"lat": float(size - row - 0.5), "lon": float(col + 0.5)}
        for row in range(size)
        for col in range(size)
    ]


def test_hedley_corrects_raster(
    store: ArtifactStore, four_band_geotiff_bytes: bytes
) -> None:
    from app.nodes.hedley import execute_hedley

    ref = store.save("input.tif", "raster", four_band_geotiff_bytes)
    result = execute_hedley(
        store=store,
        params={
            "file": ref.id,
            "nir_band": 4,
            "visible_bands": "1,2,3",
            "sample_points": _grid_points(),
        },
        inputs={"raster": ref.id},
        output_ports=["out"],
    )
    assert result["implemented"] is True
    assert "out" in result["outputs"]
    assert result["outputs"]["out"] != ref.id
    assert "slopes" in result["summary"]
    assert result["summary"]["slopes"]["1"] == pytest.approx(0.5, abs=0.05)

    out_ref = store.get(result["outputs"]["out"])
    with rasterio.open(out_ref.path) as dataset:
        assert dataset.count == 3
        assert dataset.dtypes[0] == "float32"
        corrected = dataset.read()

    assert float(corrected.min()) >= 0.0
    assert np.ptp(corrected[0]) < 1.0


def test_hedley_requires_file_param(store: ArtifactStore) -> None:
    from app.nodes.hedley import execute_hedley

    try:
        execute_hedley(
            store, {"nir_band": 4, "visible_bands": "1,2,3"}, {}, ["out"]
        )
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_hedley_rejects_wrong_visible_band_count(
    store: ArtifactStore, four_band_geotiff_bytes: bytes
) -> None:
    from app.nodes.hedley import execute_hedley

    ref = store.save("input.tif", "raster", four_band_geotiff_bytes)
    try:
        execute_hedley(
            store=store,
            params={
                "file": ref.id,
                "nir_band": 4,
                "visible_bands": "1,2",
                "sample_points": _grid_points(),
            },
            inputs={},
            output_ports=["out"],
        )
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_hedley_rejects_nir_band_out_of_range(
    store: ArtifactStore, four_band_geotiff_bytes: bytes
) -> None:
    from app.nodes.hedley import execute_hedley

    ref = store.save("input.tif", "raster", four_band_geotiff_bytes)
    try:
        execute_hedley(
            store=store,
            params={
                "file": ref.id,
                "nir_band": 9,
                "visible_bands": "1,2,3",
                "sample_points": _grid_points(),
            },
            inputs={},
            output_ports=["out"],
        )
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_hedley_raises_without_valid_samples(
    store: ArtifactStore, four_band_geotiff_bytes: bytes
) -> None:
    from app.nodes.hedley import execute_hedley

    ref = store.save("input.tif", "raster", four_band_geotiff_bytes)
    try:
        execute_hedley(
            store=store,
            params={
                "file": ref.id,
                "nir_band": 4,
                "visible_bands": "1,2,3",
                "sample_points": [{"lat": -5.0, "lon": 110.0}],
            },
            inputs={},
            output_ports=["out"],
        )
        raise AssertionError("expected ValueError")
    except ValueError:
        pass
