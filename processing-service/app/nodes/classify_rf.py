from __future__ import annotations

import logging
from pathlib import Path

import geopandas as gpd
import numpy as np
import rasterio
from rasterio import features
from rasterio.io import MemoryFile
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

from app.artifacts import ArtifactStore

logger = logging.getLogger(__name__)

NODATA_SENTINEL = -1


def execute_classify_rf(
    store: ArtifactStore,
    params: dict,
    inputs: dict,
    output_ports: list[str] | None = None,
) -> dict:
    raster_id = (
        params.get("raster")
        or params.get("file")
        or inputs.get("raster")
        or inputs.get("image")
    )
    if not raster_id:
        raise ValueError("rf-train requires a raster artifact id via params or inputs")

    vector_id = params.get("training_vector") or inputs.get("labels")
    if not vector_id:
        raise ValueError("rf-train requires a training vector artifact id via params or inputs")

    label_field = (
        params.get("label_field")
        or params.get("labelField")
        or params.get("field")
        or "class"
    )

    try:
        n_estimators = int(params.get("n_estimators") or params.get("nTree") or 200)
    except (TypeError, ValueError):
        n_estimators = 200
    n_estimators = max(10, min(1000, n_estimators))

    raw_depth = params.get("max_depth") or params.get("maxDepth")
    max_depth: int | None
    try:
        max_depth = int(raw_depth) if raw_depth is not None else None
    except (TypeError, ValueError):
        max_depth = None

    raster_ref = store.get(str(raster_id))
    vector_ref = store.get(str(vector_id))

    with rasterio.open(raster_ref.path) as dataset:
        crs = dataset.crs
        if crs is None:
            raise ValueError(
                "Raster has no CRS defined. Assign a CRS to the raster before "
                "running classification (e.g. via a reproject node)."
            )
        data = dataset.read().astype("float32")
        transform = dataset.transform
        height = dataset.height
        width = dataset.width
        n_bands = dataset.count
        out_profile = dataset.profile

    if n_bands == 1:
        features_stack = data[0][..., np.newaxis]
    else:
        features_stack = np.moveaxis(data, 0, -1)

    gdf = gpd.read_file(vector_ref.path)
    if label_field not in gdf.columns:
        raise ValueError(
            f"Label field '{label_field}' not found in training vector."
            f" Available: {list(gdf.columns)}"
        )
    if gdf.crs is not None and crs is not None:
        gdf = gdf.to_crs(crs)

    raw_labels = []
    geom_list = []
    for _, row in gdf.iterrows():
        geom = row.geometry
        if geom is None or geom.is_empty:
            continue
        geom_list.append(geom)
        raw_labels.append(row[label_field])

    if not geom_list:
        raise ValueError("No valid geometries found in training vector.")

    encoder = LabelEncoder()
    codes = encoder.fit_transform(raw_labels)

    label_raster = features.rasterize(
        shapes=[(geom, int(code)) for geom, code in zip(geom_list, codes)],
        out_shape=(height, width),
        transform=transform,
        fill=NODATA_SENTINEL,
        dtype="int32",
    )

    mask_train = label_raster >= 0
    if not np.any(mask_train):
        raise ValueError("No training pixels were rasterized from the provided polygons.")

    X_train = features_stack[mask_train]
    y_train = label_raster[mask_train]

    clf_kwargs: dict = {
        "n_estimators": n_estimators,
        "n_jobs": -1,
        "random_state": 42,
    }
    if max_depth is not None:
        clf_kwargs["max_depth"] = max_depth
    clf = RandomForestClassifier(**clf_kwargs)
    clf.fit(X_train, y_train)

    flat = features_stack.reshape(-1, n_bands)
    classified = np.full(height * width, NODATA_SENTINEL, dtype="int16")
    all_finite = np.isfinite(flat).all(axis=1)
    finite_idx = np.flatnonzero(all_finite)

    chunk_size = 100_000
    for start in range(0, finite_idx.size, chunk_size):
        chunk_idx = finite_idx[start : start + chunk_size]
        classified[chunk_idx] = clf.predict(flat[chunk_idx]).astype("int16")

    classified = classified.reshape(height, width)

    write_profile = {
        k: v
        for k, v in {**out_profile, "count": 1, "dtype": "int16"}.items()
        if k not in ("blockxsize", "blockysize", "tiled")
    }
    write_profile["nodata"] = NODATA_SENTINEL

    with MemoryFile() as memfile:
        with memfile.open(**write_profile) as dst:
            dst.write(classified, 1)
        tif_bytes = memfile.read()

    out_ref = store.save(
        f"classified_rf_{Path(raster_ref.filename).stem}.tif", "raster", tif_bytes
    )

    port_id = (output_ports or ["out"])[0]
    class_mapping = {
        str(idx): str(label) for idx, label in enumerate(encoder.classes_)
    }

    return {
        "implemented": True,
        "summary": {
            "class_mapping": class_mapping,
            "nEstimators": n_estimators,
            "maxDepth": max_depth,
            "sampleCount": int(X_train.shape[0]),
            "nFeatures": int(n_bands),
        },
        "outputs": {port_id: out_ref.id},
    }
