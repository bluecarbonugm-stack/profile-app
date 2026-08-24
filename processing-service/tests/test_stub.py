from __future__ import annotations

from app.artifacts import ArtifactStore
from app.nodes.stub import execute_stub


def test_stub_forwards_first_input_to_every_output_port(store: ArtifactStore, tiny_csv_bytes: bytes) -> None:
    ref = store.save("data.csv", "table", tiny_csv_bytes)
    result = execute_stub(store, "train-test-split", {}, {"table": ref.id}, ["train", "test"])
    assert result["implemented"] is False
    assert set(result["outputs"].keys()) == {"train", "test"}
    assert result["outputs"]["train"] != result["outputs"]["test"]
    for artifact_id in result["outputs"].values():
        assert store.get(artifact_id).filename == "data.csv"


def test_stub_with_no_inputs_produces_no_outputs(store: ArtifactStore) -> None:
    result = execute_stub(store, "some-node", {}, {}, ["out"])
    assert result["implemented"] is False
    assert result["outputs"] == {}
