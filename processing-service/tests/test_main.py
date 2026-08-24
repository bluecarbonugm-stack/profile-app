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


def test_execute_node_accepts_nested_json_params(client: TestClient) -> None:
    response = client.post(
        "/nodes/table-input/execute",
        json={
            "params": {
                "file": "dummy",
                "sample_points": [{"lat": -5.0, "lon": 110.0}],
                "options": {"mode": "manual"},
            },
            "inputs": {},
            "output_ports": ["table"],
        },
    )
    # The stub executor should still respond; contract is validated by schema parsing.
    assert response.status_code in (200, 400)


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


def test_raster_input_to_export_wiring_carries_real_data(
    client: TestClient, tiny_geotiff_bytes: bytes
) -> None:
    """Regression guard for the port-id contract: raster-input's output must be
    keyed by the catalog's real output port id ("out") so that wiring it into
    raster-export's input port ("in") actually carries the artifact through."""
    upload = client.post(
        "/artifacts",
        files={"file": ("source.tif", tiny_geotiff_bytes, "image/tiff")},
        data={"kind": "raster"},
    ).json()

    input_response = client.post(
        "/nodes/raster-input/execute",
        json={"params": {"file": upload["id"]}, "inputs": {}, "output_ports": ["out"]},
    )
    assert input_response.status_code == 200
    input_body = input_response.json()
    assert "out" in input_body["outputs"]

    # Simulate the graph runner: the artifact produced on raster-input's "out"
    # port is fed into raster-export's "in" port via the edge map.
    export_response = client.post(
        "/nodes/raster-export/execute",
        json={
            "params": {"filename": "hasil.tif"},
            "inputs": {"in": input_body["outputs"]["out"]},
            "output_ports": [],
        },
    )
    assert export_response.status_code == 200
    export_body = export_response.json()
    assert export_body["implemented"] is True
    assert export_body["summary"]["sourceArtifact"] == input_body["outputs"]["out"]
    assert export_body["summary"]["savedAs"] == "hasil.tif"
