from __future__ import annotations

import io
from pathlib import Path

import numpy as np
import pytest
import rasterio

from app.artifacts import ArtifactStore

SIZE = 8
FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture()
def tiny_classify_bundle(store: ArtifactStore) -> tuple:
    raster_ref = store.save(
        "classify.tif", "raster", (FIXTURES_DIR / "classify.tif").read_bytes()
    )
    vector_ref = store.save(
        "train.geojson", "vector", (FIXTURES_DIR / "train.geojson").read_bytes()
    )
    return raster_ref, vector_ref


def test_rf_classify_produces_output(store, tiny_classify_bundle):
    from app.nodes.classify_rf import execute_classify_rf

    raster_ref, vector_ref = tiny_classify_bundle
    result = execute_classify_rf(
        store=store,
        params={
            "raster": raster_ref.id,
            "training_vector": vector_ref.id,
            "label_field": "class",
            "n_estimators": 20,
            "max_depth": 3,
        },
        inputs={"raster": raster_ref.id, "labels": vector_ref.id},
        output_ports=["out"],
    )
    assert result["implemented"] is True
    assert result["outputs"]["out"] != raster_ref.id
    assert "class_mapping" in result["summary"]


def test_rf_writes_int16_classification_with_two_classes(store, tiny_classify_bundle):
    from app.nodes.classify_rf import execute_classify_rf

    raster_ref, vector_ref = tiny_classify_bundle
    result = execute_classify_rf(
        store=store,
        params={
            "raster": raster_ref.id,
            "training_vector": vector_ref.id,
            "label_field": "class",
            "n_estimators": 20,
            "max_depth": 3,
        },
        inputs={},
        output_ports=["out"],
    )

    mapping = result["summary"]["class_mapping"]
    assert set(mapping.values()) == {"air", "darat"}

    out_ref = store.get(result["outputs"]["out"])
    with rasterio.open(out_ref.path) as dataset:
        assert dataset.count == 1
        assert dataset.dtypes[0] == "int16"
        assert dataset.nodata == -1
        classified = dataset.read(1)

    air_code = next(int(code) for code, label in mapping.items() if label == "air")
    land_code = next(int(code) for code, label in mapping.items() if label == "darat")
    assert set(np.unique(classified)) <= {air_code, land_code}
    assert (classified[:, :4] == air_code).all()
    assert (classified[:, 4:] == land_code).all()


def test_rf_rejects_missing_label_field(store, tiny_classify_bundle):
    from app.nodes.classify_rf import execute_classify_rf

    raster_ref, vector_ref = tiny_classify_bundle
    with pytest.raises(ValueError):
        execute_classify_rf(
            store=store,
            params={
                "raster": raster_ref.id,
                "training_vector": vector_ref.id,
                "label_field": "tidak_ada",
            },
            inputs={},
            output_ports=["out"],
        )


def test_rf_accepts_camelcase_labelfield_alias(store, tiny_classify_bundle):
    """The UI sends labelField; the backend must accept it as label_field."""
    from app.nodes.classify_rf import execute_classify_rf

    raster_ref, vector_ref = tiny_classify_bundle
    result = execute_classify_rf(
        store=store,
        params={
            "raster": raster_ref.id,
            "training_vector": vector_ref.id,
            "labelField": "class",
        },
        inputs={},
        output_ports=["out"],
    )
    assert result["implemented"] is True


def test_rf_rejects_raster_without_crs(store):
    """A CRS-less raster cannot be aligned with the training vector; fail loud."""
    from app.nodes.classify_rf import execute_classify_rf

    data = np.zeros((1, 4, 4), dtype="uint8")
    buffer = io.BytesIO()
    with rasterio.open(
        buffer,
        "w",
        driver="GTiff",
        height=4,
        width=4,
        count=1,
        dtype="uint8",
    ) as dst:
        dst.write(data)
    raster_ref = store.save("nocrs.tif", "raster", buffer.getvalue())
    vector_ref = store.save(
        "train.geojson", "vector", (FIXTURES_DIR / "train.geojson").read_bytes()
    )

    with pytest.raises(ValueError, match="no CRS"):
        execute_classify_rf(
            store=store,
            params={
                "raster": raster_ref.id,
                "training_vector": vector_ref.id,
                "label_field": "class",
            },
            inputs={},
            output_ports=["out"],
        )


def test_rf_requires_raster_and_vector(store, tiny_classify_bundle):
    from app.nodes.classify_rf import execute_classify_rf

    with pytest.raises(ValueError):
        execute_classify_rf(store, {}, {}, ["out"])
