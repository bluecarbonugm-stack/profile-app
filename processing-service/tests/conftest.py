from __future__ import annotations

from pathlib import Path

import geopandas as gpd
import numpy as np
import pytest
import rasterio
from rasterio.transform import from_origin
from shapely.geometry import Point

from app.artifacts import ArtifactStore


@pytest.fixture()
def store(tmp_path: Path) -> ArtifactStore:
    return ArtifactStore(root=tmp_path / "artifacts")


@pytest.fixture()
def tiny_geotiff_bytes(tmp_path: Path) -> bytes:
    path = tmp_path / "source.tif"
    data = np.ones((2, 4, 4), dtype="uint8")
    transform = from_origin(0, 4, 1, 1)
    with rasterio.open(
        path,
        "w",
        driver="GTiff",
        height=4,
        width=4,
        count=2,
        dtype="uint8",
        crs="EPSG:4326",
        transform=transform,
    ) as dst:
        dst.write(data)
    return path.read_bytes()


@pytest.fixture()
def tiny_geojson_bytes() -> bytes:
    gdf = gpd.GeoDataFrame(
        {"name": ["a", "b", "c"]},
        geometry=[Point(0, 0), Point(1, 1), Point(2, 2)],
        crs="EPSG:4326",
    )
    return gdf.to_json().encode("utf-8")


@pytest.fixture()
def tiny_csv_bytes() -> bytes:
    return b"id,value\n1,10\n2,20\n3,30\n"
