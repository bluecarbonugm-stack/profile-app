from __future__ import annotations

import geopandas as gpd
import pandas as pd
import rasterio

from app.artifacts import ArtifactStore


def execute_raster_input(store: ArtifactStore, params: dict, inputs: dict) -> dict:
    artifact_id = params.get("file")
    if not artifact_id:
        raise ValueError("raster-input requires a 'file' param with an uploaded artifact id")
    ref = store.get(str(artifact_id))
    with rasterio.open(ref.path) as dataset:
        summary = {
            "bandCount": dataset.count,
            "width": dataset.width,
            "height": dataset.height,
            "crs": str(dataset.crs),
            "dtype": dataset.dtypes[0] if dataset.dtypes else None,
        }
    return {"implemented": True, "summary": summary, "outputs": {"raster": ref.id}}


def execute_vector_input(store: ArtifactStore, params: dict, inputs: dict) -> dict:
    artifact_id = params.get("file")
    if not artifact_id:
        raise ValueError("vector-input requires a 'file' param with an uploaded artifact id")
    ref = store.get(str(artifact_id))
    gdf = gpd.read_file(ref.path)
    summary = {
        "featureCount": len(gdf),
        "geometryType": gdf.geom_type.iloc[0] if len(gdf) else None,
        "crs": str(gdf.crs),
        "bounds": list(gdf.total_bounds) if len(gdf) else None,
    }
    return {"implemented": True, "summary": summary, "outputs": {"vector": ref.id}}


def execute_table_input(store: ArtifactStore, params: dict, inputs: dict) -> dict:
    artifact_id = params.get("file")
    if not artifact_id:
        raise ValueError("table-input requires a 'file' param with an uploaded artifact id")
    ref = store.get(str(artifact_id))
    if ref.filename.lower().endswith((".xlsx", ".xls")):
        df = pd.read_excel(ref.path)
    else:
        df = pd.read_csv(ref.path)
    summary = {
        "rowCount": len(df),
        "columnCount": len(df.columns),
        "columns": [str(c) for c in df.columns],
    }
    return {"implemented": True, "summary": summary, "outputs": {"table": ref.id}}


def _execute_export(store: ArtifactStore, params: dict, inputs: dict, port_id: str) -> dict:
    artifact_id = inputs.get(port_id)
    if not artifact_id:
        raise ValueError(f"export node requires a connected '{port_id}' input")
    ref = store.get(artifact_id)
    return {
        "implemented": True,
        "summary": {"savedAs": params.get("filename", ref.filename), "sourceArtifact": artifact_id},
        "outputs": {},
    }


def execute_raster_export(store: ArtifactStore, params: dict, inputs: dict) -> dict:
    return _execute_export(store, params, inputs, "raster")


def execute_vector_export(store: ArtifactStore, params: dict, inputs: dict) -> dict:
    return _execute_export(store, params, inputs, "vector")


def execute_table_export(store: ArtifactStore, params: dict, inputs: dict) -> dict:
    return _execute_export(store, params, inputs, "table")
