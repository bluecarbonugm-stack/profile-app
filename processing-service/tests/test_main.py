from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.artifacts import ArtifactStore
from app.main import app, get_store


@pytest.fixture()
def client(tmp_path: Path) -> TestClient:
    test_store = ArtifactStore(root=tmp_path / "artifacts")
    app.dependency_overrides[get_store] = lambda: test_store
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_health_check(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200


def test_upload_artifact(client: TestClient, tiny_csv_bytes: bytes) -> None:
    response = client.post(
        "/artifacts",
        files={"file": ("data.csv", tiny_csv_bytes, "text/csv")},
        data={"kind": "table"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["kind"] == "table"
    assert body["filename"] == "data.csv"
    assert body["id"]


def test_upload_artifact_rejects_bad_kind(client: TestClient, tiny_csv_bytes: bytes) -> None:
    response = client.post(
        "/artifacts",
        files={"file": ("data.csv", tiny_csv_bytes, "text/csv")},
        data={"kind": "not-a-kind"},
    )
    assert response.status_code == 400


def test_execute_real_io_node(client: TestClient, tiny_csv_bytes: bytes) -> None:
    upload = client.post(
        "/artifacts",
        files={"file": ("data.csv", tiny_csv_bytes, "text/csv")},
        data={"kind": "table"},
    ).json()
    response = client.post(
        "/nodes/table-input/execute",
        json={"params": {"file": upload["id"]}, "inputs": {}, "output_ports": ["table"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["implemented"] is True
    assert body["summary"]["rowCount"] == 3


def test_execute_unknown_node_type_falls_back_to_stub(client: TestClient) -> None:
    response = client.post(
        "/nodes/sunglint-correction/execute",
        json={"params": {}, "inputs": {}, "output_ports": ["raster"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["implemented"] is False


def test_execute_missing_file_param_returns_400(client: TestClient) -> None:
    response = client.post(
        "/nodes/raster-input/execute",
        json={"params": {}, "inputs": {}, "output_ports": ["raster"]},
    )
    assert response.status_code == 400
