from __future__ import annotations

import geopandas as gpd
import pandas as pd
import rasterio

from app.artifacts import ArtifactStore


def execute_raster_input(
    store: ArtifactStore, params: dict, inputs: dict, output_ports: list[str] | None = None
) -> dict:
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
    port_id = (output_ports or ["raster"])[0]
    return {"implemented": True, "summary": summary, "outputs": {port_id: ref.id}}


def execute_vector_input(
    store: ArtifactStore, params: dict, inputs: dict, output_ports: list[str] | None = None
) -> dict:
    artifact_id = params.get("file")
    if not artifact_id:
        raise ValueError("vector-input requires a 'file' param with an uploaded artifact id")
    ref = store.get(str(artifact_id))
    try:
        gdf = gpd.read_file(str(ref.path))
    except Exception:
        import json
        import shapely.geometry
        with open(ref.path, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)
        features = geojson_data.get("features", [])
        geoms = [shapely.geometry.shape(feat["geometry"]) for feat in features]
        gdf = gpd.GeoDataFrame(geometry=geoms)
    summary = {
        "featureCount": len(gdf),
        "geometryType": gdf.geom_type.iloc[0] if len(gdf) else None,
        "crs": str(gdf.crs) if hasattr(gdf, "crs") else None,
        "bounds": list(gdf.total_bounds) if len(gdf) else None,
    }
    port_id = (output_ports or ["vector"])[0]
    return {"implemented": True, "summary": summary, "outputs": {port_id: ref.id}}


def execute_table_input(
    store: ArtifactStore, params: dict, inputs: dict, output_ports: list[str] | None = None
) -> dict:
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
    port_id = (output_ports or ["table"])[0]
    return {"implemented": True, "summary": summary, "outputs": {port_id: ref.id}}


def _execute_export(store: ArtifactStore, params: dict, inputs: dict) -> dict:
    artifact_id = next(iter(inputs.values()), None)
    if not artifact_id:
        raise ValueError("export node requires a connected input")
    ref = store.get(artifact_id)
    return {
        "implemented": True,
        "summary": {"savedAs": params.get("filename", ref.filename), "sourceArtifact": artifact_id},
        "outputs": {},
    }


def execute_raster_export(
    store: ArtifactStore, params: dict, inputs: dict, output_ports: list[str] | None = None
) -> dict:
    return _execute_export(store, params, inputs)


def execute_vector_export(
    store: ArtifactStore, params: dict, inputs: dict, output_ports: list[str] | None = None
) -> dict:
    return _execute_export(store, params, inputs)


def execute_table_export(
    store: ArtifactStore, params: dict, inputs: dict, output_ports: list[str] | None = None
) -> dict:
    return _execute_export(store, params, inputs)
