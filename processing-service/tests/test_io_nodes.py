from __future__ import annotations

from app.artifacts import ArtifactStore
from app.nodes.io_nodes import (
    execute_raster_export,
    execute_raster_input,
    execute_table_export,
    execute_table_input,
    execute_vector_export,
    execute_vector_input,
)


def test_raster_input_reads_real_metadata(store: ArtifactStore, tiny_geotiff_bytes: bytes) -> None:
    ref = store.save("source.tif", "raster", tiny_geotiff_bytes)
    result = execute_raster_input(store, {"file": ref.id}, {}, ["out"])
    assert result["implemented"] is True
    assert result["summary"]["bandCount"] == 2
    assert result["summary"]["width"] == 4
    assert result["summary"]["height"] == 4
    assert result["outputs"] == {"out": ref.id}


def test_raster_input_requires_file_param(store: ArtifactStore) -> None:
    try:
        execute_raster_input(store, {}, {}, ["out"])
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_vector_input_reads_real_metadata(store: ArtifactStore, tiny_geojson_bytes: bytes) -> None:
    ref = store.save("points.geojson", "vector", tiny_geojson_bytes)
    result = execute_vector_input(store, {"file": ref.id}, {}, ["out"])
    assert result["implemented"] is True
    assert result["summary"]["featureCount"] == 3
    assert result["outputs"] == {"out": ref.id}


def test_table_input_reads_real_csv(store: ArtifactStore, tiny_csv_bytes: bytes) -> None:
    ref = store.save("data.csv", "table", tiny_csv_bytes)
    result = execute_table_input(store, {"file": ref.id}, {}, ["table"])
    assert result["implemented"] is True
    assert result["summary"]["rowCount"] == 3
    assert result["summary"]["columnCount"] == 2
    assert result["summary"]["columns"] == ["id", "value"]
    assert result["outputs"] == {"table": ref.id}


def test_raster_export_requires_connected_input(store: ArtifactStore) -> None:
    try:
        execute_raster_export(store, {}, {})
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_raster_export_records_source_artifact(store: ArtifactStore, tiny_geotiff_bytes: bytes) -> None:
    ref = store.save("source.tif", "raster", tiny_geotiff_bytes)
    result = execute_raster_export(store, {"filename": "hasil.tif"}, {"in": ref.id})
    assert result["implemented"] is True
    assert result["summary"]["savedAs"] == "hasil.tif"
    assert result["outputs"] == {}


def test_vector_export_records_source_artifact(store: ArtifactStore, tiny_geojson_bytes: bytes) -> None:
    ref = store.save("points.geojson", "vector", tiny_geojson_bytes)
    result = execute_vector_export(store, {"filename": "hasil.geojson"}, {"in": ref.id})
    assert result["summary"]["savedAs"] == "hasil.geojson"


def test_table_export_records_source_artifact(store: ArtifactStore, tiny_csv_bytes: bytes) -> None:
    ref = store.save("data.csv", "table", tiny_csv_bytes)
    result = execute_table_export(store, {"filename": "hasil.csv"}, {"in": ref.id})
    assert result["summary"]["savedAs"] == "hasil.csv"
