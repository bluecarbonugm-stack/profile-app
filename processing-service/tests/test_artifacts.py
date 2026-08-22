from __future__ import annotations

from pathlib import Path

import pytest

from app.artifacts import ArtifactStore


def make_store(tmp_path: Path) -> ArtifactStore:
    return ArtifactStore(root=tmp_path / "artifacts")


def test_save_creates_artifact_with_generated_id(tmp_path: Path) -> None:
    store = make_store(tmp_path)
    ref = store.save("sample.tif", "raster", b"fake-bytes")
    assert ref.id
    assert ref.kind == "raster"
    assert ref.filename == "sample.tif"
    assert Path(ref.path).read_bytes() == b"fake-bytes"


def test_save_rejects_unknown_kind(tmp_path: Path) -> None:
    store = make_store(tmp_path)
    with pytest.raises(ValueError):
        store.save("sample.tif", "not-a-kind", b"data")


def test_get_returns_saved_artifact(tmp_path: Path) -> None:
    store = make_store(tmp_path)
    saved = store.save("points.geojson", "vector", b"{}")
    fetched = store.get(saved.id)
    assert fetched == saved


def test_get_unknown_id_raises_key_error(tmp_path: Path) -> None:
    store = make_store(tmp_path)
    with pytest.raises(KeyError):
        store.get("does-not-exist")


def test_copy_as_new_duplicates_content_under_a_new_id(tmp_path: Path) -> None:
    store = make_store(tmp_path)
    original = store.save("data.csv", "table", b"a,b\n1,2\n")
    copy = store.copy_as_new(original.id)
    assert copy.id != original.id
    assert copy.kind == original.kind
    assert copy.filename == original.filename
    assert Path(copy.path).read_bytes() == b"a,b\n1,2\n"


def test_manifest_persists_across_store_instances(tmp_path: Path) -> None:
    root = tmp_path / "artifacts"
    store_a = ArtifactStore(root=root)
    ref = store_a.save("sample.tif", "raster", b"fake-bytes")
    store_b = ArtifactStore(root=root)
    assert store_b.get(ref.id) == ref
