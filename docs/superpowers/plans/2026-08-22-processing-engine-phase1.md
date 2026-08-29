# Processing Engine Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fully-simulated Workbench pipeline execution with a real engine — real topological order from the graph's edges, real data flowing between connected nodes, and real raster/vector/table file I/O via a new Python backend.

**Architecture:** A new `processing-service/` FastAPI service does the actual file reading (rasterio/geopandas/pandas) and exposes one generic `POST /nodes/{nodeType}/execute` endpoint plus `POST /artifacts` for uploads. The existing TanStack Start server orchestrates: it topologically sorts the graph, walks it node-by-node calling the Python service, and resolves each node's real inputs from its upstream node's real outputs via the edge map (not list order — the bug being fixed). Every node type without a real implementation yet (`preproc`/`field`/`ml`/`accuracy`/`temporal`) gets a stub executor that forwards its input artifact unchanged and is clearly labeled "not yet implemented," so later phases only swap stub logic for real logic per node.

**Tech Stack:** FastAPI + rasterio + geopandas + shapely + pandas (Python service, new); TanStack Start `createServerFn` (existing pattern, see `src/features/profile/api/profile-content.ts`); vitest (new, for the topological-sort unit tests); pytest + httpx (Python tests).

**Spec:** `docs/superpowers/specs/2026-08-22-processing-engine-phase1-design.md`

## Global Constraints

- Features don't cross-import (`src/features/profile/**` ↔ `src/features/processing/**` forbidden); shared code goes to `src/shared/`.
- Each feature exports through its own `index.ts`.
- Import internal modules via the `@/` alias, matching existing files.
- Pre-commit gate: `npm run typecheck && npm run lint && npm run build` must pass before any commit that touches TS/TSX.
- `src/routeTree.gen.ts` is generated — never hand-edit it.
- Artifact storage in Phase 1 is a local temp dir with a JSON manifest — not durable, not cloud. Durable storage (Supabase) is explicitly out of scope until those credentials exist.
- Real implementations in Phase 1 are limited to: `raster-input`, `vector-input`, `table-input` (new), `raster-export`, `vector-export`, `table-export`. Every other node type is a stub in Phase 1 — do not implement real algorithms for `preproc`/`field`/`ml`/`accuracy`/`temporal` nodes in this plan.
- All user-facing strings (labels, error messages, toasts) are in Indonesian, matching the existing UI.
- The committed spec refers to the save nodes as `raster-output`/`vector-output`/`table-output`; the catalog's actual ids are `raster-export`/`vector-export`/`table-export`. This plan uses the real ids throughout — treat the spec's naming as informal, the catalog as authoritative.
- The spec's Component 3 section implies `field-import` gets real CSV I/O; the actual catalog has no node that reads a file directly for tabular data (`field-import`'s input is already a `table` port, not a file param). This plan instead adds a new `table-input` node (Task 7) to fill that gap — `field-import` itself stays a Phase 1 stub.
- The spec lists `ConsolePanel.tsx` as needing to "log real per-node messages." No task modifies that file: it is a dumb renderer of log entries already passed to it as props, and Task 10 makes the entries `runAll()` feeds it real (service responses, not canned strings) by construction — there is nothing left in `ConsolePanel.tsx` itself that is fake. If code review during Task 10 finds `ConsolePanel.tsx` itself contains hardcoded content (not just consuming hardcoded input), add a step there before commit.

---

## Task 1: Python service scaffold + artifact store

**Files:**

- Create: `processing-service/pyproject.toml`
- Create: `processing-service/app/__init__.py`
- Create: `processing-service/app/artifacts.py`
- Create: `processing-service/tests/__init__.py`
- Create: `processing-service/tests/test_artifacts.py`
- Create: `processing-service/.gitignore`
- Create: `processing-service/README.md`

**Interfaces:**

- Produces: `ArtifactStore` class with `save(filename: str, kind: str, data: bytes) -> ArtifactRef`, `get(artifact_id: str) -> ArtifactRef`, `copy_as_new(source_id: str) -> ArtifactRef`. `ArtifactRef` dataclass with fields `id, kind, filename, path, created_at`. `VALID_KINDS = {"raster", "vector", "table"}`.

- [ ] **Step 1: Create the Python project file**

`processing-service/pyproject.toml`:

```toml
[project]
name = "processing-service"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.32",
    "python-multipart>=0.0.12",
    "rasterio>=1.3",
    "geopandas>=1.0",
    "shapely>=2.0",
    "pandas>=2.2",
    "openpyxl>=3.1",
]

[dependency-groups]
dev = [
    "pytest>=8.3",
    "httpx>=0.27",
    "numpy>=1.26",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["app"]
```

- [ ] **Step 2: Create package init and gitignore**

`processing-service/app/__init__.py`:

```python

```

`processing-service/tests/__init__.py`:

```python

```

`processing-service/.gitignore`:

```
.venv/
__pycache__/
*.pyc
data/artifacts/
```

- [ ] **Step 3: Write the failing tests for the artifact store**

`processing-service/tests/test_artifacts.py`:

```python
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
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd processing-service && uv sync --extra dev 2>/dev/null; uv run pytest tests/test_artifacts.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.artifacts'` (or `app` module not found).

- [ ] **Step 5: Implement the artifact store**

`processing-service/app/artifacts.py`:

```python
from __future__ import annotations

import json
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

ARTIFACT_ROOT = Path(__file__).resolve().parent.parent / "data" / "artifacts"

VALID_KINDS = {"raster", "vector", "table"}


@dataclass(frozen=True)
class ArtifactRef:
    id: str
    kind: str
    filename: str
    path: str
    created_at: str


class ArtifactStore:
    def __init__(self, root: Path = ARTIFACT_ROOT) -> None:
        self.root = root
        self.manifest_path = root / "manifest.json"
        self.root.mkdir(parents=True, exist_ok=True)
        if not self.manifest_path.exists():
            self.manifest_path.write_text("{}", encoding="utf-8")

    def _read_manifest(self) -> dict:
        return json.loads(self.manifest_path.read_text(encoding="utf-8"))

    def _write_manifest(self, manifest: dict) -> None:
        self.manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    def save(self, filename: str, kind: str, data: bytes) -> ArtifactRef:
        if kind not in VALID_KINDS:
            raise ValueError(f"Unknown artifact kind: {kind}")
        artifact_id = uuid.uuid4().hex
        artifact_dir = self.root / artifact_id
        artifact_dir.mkdir(parents=True, exist_ok=True)
        dest = artifact_dir / filename
        dest.write_bytes(data)
        ref = ArtifactRef(
            id=artifact_id,
            kind=kind,
            filename=filename,
            path=str(dest),
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        manifest = self._read_manifest()
        manifest[artifact_id] = asdict(ref)
        self._write_manifest(manifest)
        return ref

    def get(self, artifact_id: str) -> ArtifactRef:
        manifest = self._read_manifest()
        if artifact_id not in manifest:
            raise KeyError(f"Unknown artifact id: {artifact_id}")
        return ArtifactRef(**manifest[artifact_id])

    def copy_as_new(self, source_id: str) -> ArtifactRef:
        """Used by stub nodes to forward an upstream artifact unchanged as their own output."""
        source = self.get(source_id)
        data = Path(source.path).read_bytes()
        return self.save(source.filename, source.kind, data)
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd processing-service && uv run pytest tests/test_artifacts.py -v`
Expected: 6 passed.

- [ ] **Step 7: Write the dev README**

`processing-service/README.md`:

```markdown
# processing-service

Python backend for the BCRG Workbench (`/processing`). Reads real raster/vector/table
files and executes pipeline nodes. See `docs/superpowers/specs/2026-08-22-processing-engine-phase1-design.md`
for the design.

## Setup

    cd processing-service
    uv sync --extra dev

## Run (dev)

    uv run uvicorn app.main:app --reload --port 8787

Run this in a separate terminal alongside `npm run dev`. The TanStack Start server
expects the service at `http://127.0.0.1:8787` by default (override with the
`PROCESSING_SERVICE_URL` env var).

## Test

    uv run pytest -v
```

- [ ] **Step 8: Commit**

```bash
git add processing-service/
git commit -m "feat(processing-service): scaffold Python service with artifact store

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Real I/O node executors + stub executor

**Files:**

- Create: `processing-service/app/nodes/__init__.py`
- Create: `processing-service/app/nodes/io_nodes.py`
- Create: `processing-service/app/nodes/stub.py`
- Create: `processing-service/tests/conftest.py`
- Create: `processing-service/tests/test_io_nodes.py`
- Create: `processing-service/tests/test_stub.py`

**Interfaces:**

- Consumes: `ArtifactStore` from Task 1 (`app.artifacts.ArtifactStore`, `.save`, `.get`, `.copy_as_new`).
- Produces: `execute_raster_input`, `execute_vector_input`, `execute_table_input`, `execute_raster_export`, `execute_vector_export`, `execute_table_export` — each `(store: ArtifactStore, params: dict, inputs: dict) -> dict` returning `{"implemented": bool, "summary": dict, "outputs": dict[str, str]}`. `execute_stub(store, node_type: str, params: dict, inputs: dict, output_ports: list[str]) -> dict` with the same return shape. `REAL_EXECUTORS: dict[str, Callable]` registry keyed by node spec id.

- [ ] **Step 1: Write fixtures for real small test files**

`processing-service/tests/conftest.py`:

```python
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
```

- [ ] **Step 2: Write the failing tests for real I/O nodes**

`processing-service/tests/test_io_nodes.py`:

```python
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
    result = execute_raster_input(store, {"file": ref.id}, {})
    assert result["implemented"] is True
    assert result["summary"]["bandCount"] == 2
    assert result["summary"]["width"] == 4
    assert result["summary"]["height"] == 4
    assert result["outputs"] == {"raster": ref.id}


def test_raster_input_requires_file_param(store: ArtifactStore) -> None:
    try:
        execute_raster_input(store, {}, {})
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_vector_input_reads_real_metadata(store: ArtifactStore, tiny_geojson_bytes: bytes) -> None:
    ref = store.save("points.geojson", "vector", tiny_geojson_bytes)
    result = execute_vector_input(store, {"file": ref.id}, {})
    assert result["implemented"] is True
    assert result["summary"]["featureCount"] == 3
    assert result["outputs"] == {"vector": ref.id}


def test_table_input_reads_real_csv(store: ArtifactStore, tiny_csv_bytes: bytes) -> None:
    ref = store.save("data.csv", "table", tiny_csv_bytes)
    result = execute_table_input(store, {"file": ref.id}, {})
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
    result = execute_raster_export(store, {"filename": "hasil.tif"}, {"raster": ref.id})
    assert result["implemented"] is True
    assert result["summary"]["savedAs"] == "hasil.tif"
    assert result["outputs"] == {}


def test_vector_export_records_source_artifact(store: ArtifactStore, tiny_geojson_bytes: bytes) -> None:
    ref = store.save("points.geojson", "vector", tiny_geojson_bytes)
    result = execute_vector_export(store, {"filename": "hasil.geojson"}, {"vector": ref.id})
    assert result["summary"]["savedAs"] == "hasil.geojson"


def test_table_export_records_source_artifact(store: ArtifactStore, tiny_csv_bytes: bytes) -> None:
    ref = store.save("data.csv", "table", tiny_csv_bytes)
    result = execute_table_export(store, {"filename": "hasil.csv"}, {"table": ref.id})
    assert result["summary"]["savedAs"] == "hasil.csv"
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd processing-service && uv run pytest tests/test_io_nodes.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.nodes'`.

- [ ] **Step 4: Implement the real I/O node executors**

`processing-service/app/nodes/__init__.py`:

```python
from __future__ import annotations

from app.nodes.io_nodes import (
    execute_raster_export,
    execute_raster_input,
    execute_table_export,
    execute_table_input,
    execute_vector_export,
    execute_vector_input,
)

REAL_EXECUTORS = {
    "raster-input": execute_raster_input,
    "vector-input": execute_vector_input,
    "table-input": execute_table_input,
    "raster-export": execute_raster_export,
    "vector-export": execute_vector_export,
    "table-export": execute_table_export,
}
```

`processing-service/app/nodes/io_nodes.py`:

```python
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd processing-service && uv run pytest tests/test_io_nodes.py -v`
Expected: 8 passed.

- [ ] **Step 6: Write the failing test for the stub executor**

`processing-service/tests/test_stub.py`:

```python
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
```

- [ ] **Step 7: Run test to verify it fails**

Run: `cd processing-service && uv run pytest tests/test_stub.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.nodes.stub'`.

- [ ] **Step 8: Implement the stub executor**

`processing-service/app/nodes/stub.py`:

```python
from __future__ import annotations

from app.artifacts import ArtifactStore


def execute_stub(
    store: ArtifactStore,
    node_type: str,
    params: dict,
    inputs: dict,
    output_ports: list[str],
) -> dict:
    """Phase 1 fallback for every node type without a real implementation yet
    (preproc/field/ml/accuracy/temporal categories). Forwards the first available
    upstream artifact to every declared output port, unchanged."""
    outputs: dict[str, str] = {}
    source_id = next(iter(inputs.values()), None)
    if source_id:
        for port_id in output_ports:
            outputs[port_id] = store.copy_as_new(source_id).id
    return {
        "implemented": False,
        "summary": {"note": f"'{node_type}' belum diimplementasikan — data diteruskan apa adanya"},
        "outputs": outputs,
    }
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `cd processing-service && uv run pytest tests/ -v`
Expected: all tests pass (14 total across Task 1 + Task 2).

- [ ] **Step 10: Commit**

```bash
git add processing-service/
git commit -m "feat(processing-service): real io node executors + stub fallback

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: FastAPI app wiring

**Files:**

- Create: `processing-service/app/schemas.py`
- Create: `processing-service/app/main.py`
- Create: `processing-service/tests/test_main.py`

**Interfaces:**

- Consumes: `ArtifactStore` (Task 1), `REAL_EXECUTORS` (Task 2), `execute_stub` (Task 2).
- Produces: FastAPI `app` object. `GET /` health check. `POST /artifacts` (multipart `file` + form `kind`) → `{id, kind, filename}`. `POST /nodes/{node_type}/execute` (JSON body `{params, inputs, output_ports}`) → `{implemented, summary, outputs}`. `get_store` FastAPI dependency, overridable in tests via `app.dependency_overrides`.

- [ ] **Step 1: Write the schemas**

`processing-service/app/schemas.py`:

```python
from __future__ import annotations

from pydantic import BaseModel


class ExecuteRequest(BaseModel):
    params: dict[str, str | float | bool | None] = {}
    inputs: dict[str, str] = {}
    output_ports: list[str] = []


class ExecuteResponse(BaseModel):
    implemented: bool
    summary: dict
    outputs: dict[str, str]


class ArtifactUploadResponse(BaseModel):
    id: str
    kind: str
    filename: str
```

- [ ] **Step 2: Write the failing integration tests**

`processing-service/tests/test_main.py`:

```python
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd processing-service && uv run pytest tests/test_main.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'app.main'`.

- [ ] **Step 4: Implement the FastAPI app**

`processing-service/app/main.py`:

```python
from __future__ import annotations

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile

from app.artifacts import ArtifactStore
from app.nodes import REAL_EXECUTORS
from app.nodes.stub import execute_stub
from app.schemas import ArtifactUploadResponse, ExecuteRequest, ExecuteResponse

app = FastAPI(title="BCRG Processing Service")

_default_store = ArtifactStore()


def get_store() -> ArtifactStore:
    return _default_store


@app.get("/")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/artifacts", response_model=ArtifactUploadResponse)
async def upload_artifact(
    file: UploadFile = File(...),
    kind: str = Form(...),
    store: ArtifactStore = Depends(get_store),
) -> ArtifactUploadResponse:
    data = await file.read()
    try:
        ref = store.save(file.filename or "unnamed", kind, data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ArtifactUploadResponse(id=ref.id, kind=ref.kind, filename=ref.filename)


@app.post("/nodes/{node_type}/execute", response_model=ExecuteResponse)
async def execute_node(
    node_type: str,
    request: ExecuteRequest,
    store: ArtifactStore = Depends(get_store),
) -> ExecuteResponse:
    executor = REAL_EXECUTORS.get(node_type)
    try:
        if executor is not None:
            result = executor(store, request.params, request.inputs)
        else:
            result = execute_stub(store, node_type, request.params, request.inputs, request.output_ports)
    except (ValueError, KeyError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ExecuteResponse(**result)
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd processing-service && uv run pytest tests/ -v`
Expected: all tests pass (20 total).

- [ ] **Step 6: Commit**

```bash
git add processing-service/
git commit -m "feat(processing-service): wire FastAPI endpoints for upload + node execution

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: TS topological sort (vitest)

**Files:**

- Create: `vitest.config.ts`
- Modify: `package.json` (add `vitest` devDependency and a `test` script)
- Create: `src/features/processing/api/topo-sort.ts`
- Create: `src/features/processing/api/topo-sort.test.ts`

**Interfaces:**

- Produces: `topoSort(nodes: {id: string}[], edges: {source: string; target: string}[]): {ok: true; order: string[]} | {ok: false; cycle: string[]}`.

- [ ] **Step 1: Add vitest**

Run: `npm install -D vitest`

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
```

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing tests**

`src/features/processing/api/topo-sort.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { topoSort } from "./topo-sort";

describe("topoSort", () => {
  it("orders a linear chain", () => {
    const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
    ];
    expect(topoSort(nodes, edges)).toEqual({ ok: true, order: ["a", "b", "c"] });
  });

  it("orders a branching graph consistently with all edges", () => {
    const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
    const edges = [
      { source: "a", target: "b" },
      { source: "a", target: "c" },
      { source: "b", target: "d" },
      { source: "c", target: "d" },
    ];
    const result = topoSort(nodes, edges);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.indexOf("a")).toBeLessThan(result.order.indexOf("b"));
      expect(result.order.indexOf("a")).toBeLessThan(result.order.indexOf("c"));
      expect(result.order.indexOf("b")).toBeLessThan(result.order.indexOf("d"));
      expect(result.order.indexOf("c")).toBeLessThan(result.order.indexOf("d"));
    }
  });

  it("detects a two-node cycle", () => {
    const nodes = [{ id: "a" }, { id: "b" }];
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "a" },
    ];
    const result = topoSort(nodes, edges);
    expect(result.ok).toBe(false);
  });

  it("handles nodes with no edges", () => {
    expect(topoSort([{ id: "a" }], [])).toEqual({ ok: true, order: ["a"] });
  });

  it("handles an empty graph", () => {
    expect(topoSort([], [])).toEqual({ ok: true, order: [] });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/features/processing/api/topo-sort.test.ts`
Expected: FAIL — `topo-sort.ts` does not exist.

- [ ] **Step 4: Implement topoSort**

`src/features/processing/api/topo-sort.ts`:

```ts
export interface TopoSortNode {
  id: string;
}

export interface TopoSortEdge {
  source: string;
  target: string;
}

export type TopoSortResult = { ok: true; order: string[] } | { ok: false; cycle: string[] };

export function topoSort(nodes: TopoSortNode[], edges: TopoSortEdge[]): TopoSortResult {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue = [...inDegree.entries()].filter(([, degree]) => degree === 0).map(([id]) => id);
  const order: string[] = [];

  while (queue.length > 0) {
    const id = queue.shift() as string;
    order.push(id);
    for (const next of adjacency.get(id) ?? []) {
      const degree = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, degree);
      if (degree === 0) queue.push(next);
    }
  }

  if (order.length !== nodes.length) {
    const cycle = nodes.map((n) => n.id).filter((id) => !order.includes(id));
    return { ok: false, cycle };
  }

  return { ok: true, order };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/features/processing/api/topo-sort.test.ts`
Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/features/processing/api/topo-sort.ts src/features/processing/api/topo-sort.test.ts
git commit -m "feat(processing): add topological sort with cycle detection

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Shared types + Python service client

**Files:**

- Create: `src/features/processing/api/types.ts`
- Create: `src/features/processing/api/service-client.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks (pure new module), but Task 6 consumes `uploadArtifact`, `executeNode`, and every exported type here.
- Produces: `ArtifactKind`, `ArtifactRef`, `GraphNodeInput`, `GraphEdgeInput`, `GraphPayload`, `NodeRunResult`, `RunResult` types. `uploadArtifact(file: File, kind: ArtifactKind): Promise<ArtifactRef>`. `executeNode(nodeType: string, params: Record<string, string|number|boolean>, inputs: Record<string,string>, outputPorts: string[]): Promise<{implemented: boolean; summary: Record<string, unknown>; outputs: Record<string,string>}>`.

- [ ] **Step 1: Write the shared types**

`src/features/processing/api/types.ts`:

```ts
export type ArtifactKind = "raster" | "vector" | "table";

export interface ArtifactRef {
  id: string;
  kind: ArtifactKind;
  filename: string;
}

export interface GraphNodeInput {
  id: string;
  specId: string;
  params: Record<string, string | number | boolean>;
}

export interface GraphEdgeInput {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface GraphPayload {
  nodes: GraphNodeInput[];
  edges: GraphEdgeInput[];
}

export interface NodeRunResult {
  nodeId: string;
  status: "success" | "error";
  implemented: boolean;
  summary?: Record<string, unknown>;
  error?: string;
}

export interface RunResult {
  order: string[];
  results: NodeRunResult[];
  graphError?: string;
}
```

- [ ] **Step 2: Write the service client**

`src/features/processing/api/service-client.ts`:

```ts
import type { ArtifactKind, ArtifactRef } from "./types";

export const SERVICE_URL = process.env.PROCESSING_SERVICE_URL ?? "http://127.0.0.1:8787";

export async function uploadArtifact(file: File, kind: ArtifactKind): Promise<ArtifactRef> {
  const body = new FormData();
  body.set("file", file);
  body.set("kind", kind);
  const response = await fetch(`${SERVICE_URL}/artifacts`, { method: "POST", body });
  if (!response.ok) {
    throw new Error(`Gagal mengunggah file (${response.status})`);
  }
  return (await response.json()) as ArtifactRef;
}

export interface NodeExecuteResult {
  implemented: boolean;
  summary: Record<string, unknown>;
  outputs: Record<string, string>;
}

export async function executeNode(
  nodeType: string,
  params: Record<string, string | number | boolean>,
  inputs: Record<string, string>,
  outputPorts: string[],
): Promise<NodeExecuteResult> {
  const response = await fetch(`${SERVICE_URL}/nodes/${nodeType}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params, inputs, output_ports: outputPorts }),
  });
  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(detail?.detail ?? `Node ${nodeType} gagal dieksekusi (${response.status})`);
  }
  return (await response.json()) as NodeExecuteResult;
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no new errors from these two files.

- [ ] **Step 4: Commit**

```bash
git add src/features/processing/api/types.ts src/features/processing/api/service-client.ts
git commit -m "feat(processing): add shared graph types and Python service client

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: TanStack Start server routes (upload + run)

**Files:**

- Create: `src/features/processing/api/upload.ts`
- Create: `src/features/processing/api/run.ts`
- Modify: `src/features/processing/index.ts` (export the new server functions)

**Interfaces:**

- Consumes: `uploadArtifact`, `executeNode` (Task 5 `service-client.ts`), `topoSort` (Task 4), `GraphPayload`/`RunResult`/`NodeRunResult` (Task 5 `types.ts`), `NODES_BY_ID` (existing `data/nodes-catalog.ts`).
- Produces: `uploadArtifactFn` — `createServerFn` accepting `FormData` with `file` + `kind` fields, returns `ArtifactRef`. `runGraphFn` — `createServerFn` accepting a `GraphPayload`, returns `RunResult`.

- [ ] **Step 1: Write the upload server function**

`src/features/processing/api/upload.ts`:

```ts
import { createServerFn } from "@tanstack/react-start";

import { uploadArtifact } from "./service-client";
import type { ArtifactKind } from "./types";

export const uploadArtifactFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get("file");
    const kind = data.get("kind");
    if (!(file instanceof File)) {
      throw new Error("Field 'file' wajib diisi");
    }
    if (kind !== "raster" && kind !== "vector" && kind !== "table") {
      throw new Error("Field 'kind' harus raster, vector, atau table");
    }
    return uploadArtifact(file, kind as ArtifactKind);
  });
```

- [ ] **Step 2: Write the run server function**

`src/features/processing/api/run.ts`:

```ts
import { createServerFn } from "@tanstack/react-start";

import { NODES_BY_ID } from "../data/nodes-catalog";
import { executeNode, SERVICE_URL } from "./service-client";
import { topoSort } from "./topo-sort";
import type { GraphPayload, NodeRunResult, RunResult } from "./types";

const REAL_IO_FILE_NODES = new Set(["raster-input", "vector-input", "table-input"]);

function validateGraph(payload: GraphPayload): string[] {
  const errors: string[] = [];
  for (const node of payload.nodes) {
    if (REAL_IO_FILE_NODES.has(node.specId) && !node.params.file) {
      errors.push(`Node "${node.id}" belum memiliki file yang diunggah`);
    }
  }
  return errors;
}

async function checkServiceAvailable(): Promise<boolean> {
  try {
    const response = await fetch(SERVICE_URL, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}

export const runGraphFn = createServerFn({ method: "POST" })
  .validator((data: GraphPayload) => data)
  .handler(async ({ data }): Promise<RunResult> => {
    const validationErrors = validateGraph(data);
    if (validationErrors.length > 0) {
      return { order: [], results: [], graphError: validationErrors.join("; ") };
    }

    if (!(await checkServiceAvailable())) {
      return { order: [], results: [], graphError: "Processing service tidak dapat dihubungi" };
    }

    const sorted = topoSort(
      data.nodes.map((n) => ({ id: n.id })),
      data.edges.map((e) => ({ source: e.source, target: e.target })),
    );
    if (!sorted.ok) {
      return {
        order: [],
        results: [],
        graphError: "Graph mengandung siklus dan tidak bisa dijalankan",
      };
    }

    const artifactByOutput = new Map<string, string>();
    const results: NodeRunResult[] = [];

    for (const nodeId of sorted.order) {
      const node = data.nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      const spec = NODES_BY_ID[node.specId];
      const upstreamEdges = data.edges.filter((e) => e.target === nodeId);
      const blocked = upstreamEdges.some(
        (e) => results.find((r) => r.nodeId === e.source)?.status === "error",
      );
      if (blocked) {
        results.push({ nodeId, status: "error", implemented: false, error: "Node upstream gagal" });
        continue;
      }

      const inputs: Record<string, string> = {};
      for (const edge of upstreamEdges) {
        const artifactId = artifactByOutput.get(`${edge.source}:${edge.sourceHandle}`);
        if (artifactId) inputs[edge.targetHandle] = artifactId;
      }

      try {
        const outputPorts = spec?.outputs.map((port) => port.id) ?? [];
        const result = await executeNode(node.specId, node.params, inputs, outputPorts);
        for (const [portId, artifactId] of Object.entries(result.outputs)) {
          artifactByOutput.set(`${nodeId}:${portId}`, artifactId);
        }
        results.push({
          nodeId,
          status: "success",
          implemented: result.implemented,
          summary: result.summary,
        });
      } catch (error) {
        results.push({
          nodeId,
          status: "error",
          implemented: false,
          error: error instanceof Error ? error.message : "Node gagal dieksekusi",
        });
      }
    }

    return { order: sorted.order, results };
  });
```

- [ ] **Step 3: Export from the feature barrel**

Read `src/features/processing/index.ts`, then add these two exports alongside the existing ones (do not remove or reorder anything already there):

```ts
export { uploadArtifactFn } from "./api/upload";
export { runGraphFn } from "./api/run";
export type {
  ArtifactKind,
  ArtifactRef,
  GraphPayload,
  NodeRunResult,
  RunResult,
} from "./api/types";
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors. If `NODES_BY_ID` or `Param`/`NodeSpec` types don't match what Task 7 defines yet, revisit after Task 7 — these two tasks touch adjacent surface area.

- [ ] **Step 5: Commit**

```bash
git add src/features/processing/api/upload.ts src/features/processing/api/run.ts src/features/processing/index.ts
git commit -m "feat(processing): add upload and run-graph server functions

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Catalog changes — real file params + new table-input node

**Files:**

- Modify: `src/features/processing/data/nodes-catalog.ts`

**Interfaces:**

- Produces: `Param` type gains a `"file"` variant with an optional `accept?: string` field. New `NodeSpec` with `id: "table-input"` in the `io` category, single `table`-typed output, one `file`-type param.
- Consumes: nothing new — this is the source-of-truth catalog other tasks already read from (`NODES_BY_ID`, `Param`, `NodeSpec`).

- [ ] **Step 1: Read the current file param type and io category**

Run: `grep -n "type: \"text\" | \"number\" | \"select\" | \"checkbox\"" src/features/processing/data/nodes-catalog.ts` (or open the file) to find the exact current `Param` type union, and `grep -n "id: \"raster-input\"" -A 15 src/features/processing/data/nodes-catalog.ts` / `id: \"vector-input\"` to see their current `params` arrays verbatim.

- [ ] **Step 2: Extend the Param type with a "file" variant**

In the `Param` type/interface, add `"file"` to the `type` union and add an optional `accept?: string` field (used as the native `<input accept>` attribute later). Keep every other field (`key`, `label`, `default`, `options`) unchanged. Example of the shape after the change:

```ts
export interface Param {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "file";
  default?: string | number | boolean;
  options?: string[];
  accept?: string;
}
```

- [ ] **Step 3: Switch raster-input and vector-input's file params to type "file"**

In the `raster-input` node's `params` array, find the param with `key: "file"` (currently `type: "text"`) and change only its `type` to `"file"`, adding `accept: ".tif,.tiff"`. Keep its existing `label` and `default` exactly as they are.

Do the same for `vector-input`'s `file` param, with `accept: ".shp,.geojson,.json"`.

- [ ] **Step 4: Add the new table-input node**

Directly after the `vector-input` node definition (still inside the `io` category block), insert:

```ts
{
  id: "table-input",
  name: "Muat Tabel",
  category: "io",
  description: "Membaca berkas tabel (CSV/XLSX) untuk digunakan sebagai data lapangan.",
  inputs: [],
  outputs: [{ id: "table", label: "Tabel", type: "table" }],
  params: [
    { key: "file", label: "File", type: "file", accept: ".csv,.xlsx", default: "data_lapangan.csv" },
  ],
},
```

Match the exact object-literal style (trailing commas, quote style) already used by the surrounding nodes in the file.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors. `NODES_BY_ID["table-input"]` now resolves.

- [ ] **Step 6: Commit**

```bash
git add src/features/processing/data/nodes-catalog.ts
git commit -m "feat(processing): add file param type and table-input node

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: WorkbenchNode "blocked" status

**Files:**

- Modify: `src/features/processing/components/WorkbenchNode.tsx`

**Interfaces:**

- Produces: `WorkbenchNodeData["status"]` gains `"blocked"` alongside the existing `"idle" | "running" | "success" | "error"`.
- Consumes: nothing new.

- [ ] **Step 1: Locate the status type and status maps**

Run: `grep -n "status" src/features/processing/components/WorkbenchNode.tsx` to find the `status` field in `WorkbenchNodeData` and any `STATUS_LABEL` / `STATUS_COLOR` (or similarly-named) lookup objects used to render it.

- [ ] **Step 2: Add the "blocked" status**

Add `"blocked"` to the `status` union type. Add a `"blocked"` entry to every status-keyed lookup object in the file (label map, color/className map, icon map — whichever exist), following the exact pattern of the existing `"error"` entry but with:

- Label text: `"Diblokir"`
- Visual treatment: reuse the same Tailwind class structure as the existing `"idle"` entry (a neutral/gray treatment), not the `"error"` (red) one — a blocked node hasn't failed itself, its upstream did.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/processing/components/WorkbenchNode.tsx
git commit -m "feat(processing): add blocked node status

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: Real file upload control in PropertyPanel

**Files:**

- Modify: `src/features/processing/components/PropertyPanel.tsx`

**Interfaces:**

- Consumes: `uploadArtifactFn` (Task 6, via `@/features/processing`), `param.type === "file"` and `param.accept` (Task 7).
- Produces: no new exports — internal rendering change only. The `file` param's stored value becomes an artifact id string (via `onParamChange(nodeId, param.key, artifactRef.id)`), instead of free text.

- [ ] **Step 1: Locate the param-rendering switch**

Run: `grep -n "param.type" -A 6 src/features/processing/components/PropertyPanel.tsx` to see the exact current `case "text"` / `"number"` / `"select"` / `"checkbox"` branches, the component's props interface, and the exact `onParamChange` call signature already in use.

- [ ] **Step 2: Add the file upload case**

Add a `case "file":` branch (matching the existing branches' structure — same wrapping label/container markup as the `"text"` case) that renders a native file input plus the currently-stored filename/artifact state:

```tsx
case "file": {
  const kind =
    node.specId === "raster-input" ? "raster" : node.specId === "vector-input" ? "vector" : "table"
  return (
    <div key={param.key} className="space-y-1">
      <label className="text-sm font-medium">{param.label}</label>
      <input
        type="file"
        accept={param.accept}
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          const formData = new FormData()
          formData.set("file", file)
          formData.set("kind", kind)
          try {
            const artifact = await uploadArtifactFn({ data: formData })
            onParamChange(node.id, param.key, artifact.id)
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal mengunggah file")
          }
        }}
      />
      {typeof node.data.params[param.key] === "string" && node.data.params[param.key] !== param.default ? (
        <p className="text-xs text-muted-foreground">File terunggah (id: {String(node.data.params[param.key]).slice(0, 8)}…)</p>
      ) : null}
    </div>
  )
}
```

Adjust the surrounding className/markup to match whatever wrapper the existing `"text"` case uses exactly — reuse it, don't invent a new layout. Adjust the `toast.error` call to match however this file already surfaces errors (it already imports and uses a toast helper — reuse that import, don't add a new one).

- [ ] **Step 3: Import uploadArtifactFn**

Add to the file's imports:

```ts
import { uploadArtifactFn } from "@/features/processing";
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/processing/components/PropertyPanel.tsx
git commit -m "feat(processing): real file upload control for file-type params

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 10: Rewrite Workbench.tsx runAll() to call the real engine

**Files:**

- Modify: `src/features/processing/components/Workbench.tsx`

**Interfaces:**

- Consumes: `runGraphFn` (Task 6, via `@/features/processing`), `RunResult`/`NodeRunResult` (Task 5), `"blocked"` status (Task 8).
- Produces: no new exports — `runAll()`'s implementation changes; its call site (the Toolbar's "Run All" button) is unaffected since the function signature stays the same.

- [ ] **Step 1: Locate the current runAll implementation**

Run: `grep -n "const runAll" -A 30 src/features/processing/components/Workbench.tsx` to confirm the exact current body (the mock `setTimeout` loop with hardcoded results), and `grep -n "const log = \|setNodes(" src/features/processing/components/Workbench.tsx` to confirm the exact `log(...)` helper signature and the `setNodes` updater pattern already used elsewhere in the file (status updates must go through the same pattern the rest of the file uses, for consistency).

- [ ] **Step 2: Replace runAll with a real call to runGraphFn**

Replace the entire `runAll` function body with:

```tsx
const runAll = useCallback(async () => {
  const graphNodes = nodes.map((n) => ({
    id: n.id,
    specId: n.data.specId,
    params: n.data.params,
  }));
  const graphEdges = edges.map((e) => ({
    id: e.id,
    source: e.source,
    sourceHandle: e.sourceHandle ?? "",
    target: e.target,
    targetHandle: e.targetHandle ?? "",
  }));

  setNodes((current) => current.map((n) => ({ ...n, data: { ...n.data, status: "running" } })));
  log("info", "Menjalankan seluruh pipeline...");

  let result: RunResult;
  try {
    result = await runGraphFn({ data: { nodes: graphNodes, edges: graphEdges } });
  } catch (error) {
    log("error", error instanceof Error ? error.message : "Gagal menjalankan pipeline");
    setNodes((current) => current.map((n) => ({ ...n, data: { ...n.data, status: "error" } })));
    return;
  }

  if (result.graphError) {
    log("error", result.graphError);
    setNodes((current) => current.map((n) => ({ ...n, data: { ...n.data, status: "idle" } })));
    return;
  }

  setNodes((current) =>
    current.map((n) => {
      const nodeResult = result.results.find((r) => r.nodeId === n.id);
      if (!nodeResult) return { ...n, data: { ...n.data, status: "idle" } };
      return {
        ...n,
        data: {
          ...n.data,
          status:
            nodeResult.status === "error" && nodeResult.error === "Node upstream gagal"
              ? "blocked"
              : nodeResult.status,
        },
      };
    }),
  );

  for (const nodeResult of result.results) {
    if (nodeResult.status === "success") {
      log(
        nodeResult.implemented ? "success" : "info",
        nodeResult.implemented
          ? `${nodeResult.nodeId}: selesai`
          : `${nodeResult.nodeId}: belum diimplementasikan, data diteruskan apa adanya`,
      );
    } else {
      log("error", `${nodeResult.nodeId}: ${nodeResult.error ?? "gagal"}`);
    }
  }
}, [nodes, edges, log, setNodes]);
```

Keep the function's name (`runAll`) and its hookup to the Toolbar's `onRunAll` prop unchanged — only the body changes. If the existing `log` helper's signature differs from `log(level, message)` (confirmed in Step 1), adjust the calls above to match the real signature rather than the one shown here.

- [ ] **Step 3: Import runGraphFn and RunResult**

Add to the file's imports:

```ts
import { runGraphFn } from "@/features/processing";
import type { RunResult } from "@/features/processing";
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Manual smoke test**

Run `processing-service` (`cd processing-service && uv run uvicorn app.main:app --reload --port 8787`) and `npm run dev` in separate terminals. Open `/processing`, drag a `table-input` node onto the canvas, upload a small CSV, click Run All, and confirm the console shows a real row/column count rather than a canned string.

- [ ] **Step 6: Commit**

```bash
git add src/features/processing/components/Workbench.tsx
git commit -m "feat(processing): runAll executes the real graph via runGraphFn

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 11: Real result rendering in ResultViewer

**Files:**

- Modify: `src/features/processing/components/ResultViewer.tsx`
- Modify: `src/features/processing/components/Workbench.tsx` (pass the real result through to the viewer)

**Interfaces:**

- Consumes: `NodeRunResult` (Task 5).
- Produces: `ResultViewer` gains a `result?: NodeRunResult` prop; when `result.implemented` is `true` it renders `result.summary` as a key/value table, when `false` it renders a single "belum diimplementasikan" placeholder card instead of the previously-hardcoded chart/table content.

- [ ] **Step 1: Locate current ResultViewer props and canned content**

Run: `grep -n "interface\|Props\|varImportance\|timeseries\|confusion" src/features/processing/components/ResultViewer.tsx` to confirm the exact current props interface and where the hardcoded mock constants are rendered.

- [ ] **Step 2: Add a result prop and branch on implemented**

Add `result?: NodeRunResult` to the component's props interface (import `NodeRunResult` from `@/features/processing`). At the top of the render, before the existing hasChart/hasTable/etc. logic:

```tsx
if (result && !result.implemented) {
  return (
    <div className="p-4 text-sm text-muted-foreground">
      Node ini belum diimplementasikan secara ilmiah pada Phase 1 — data hanya diteruskan apa adanya
      dari node sebelumnya.
    </div>
  );
}

if (result?.implemented && result.summary) {
  return (
    <div className="p-4">
      <table className="w-full text-sm">
        <tbody>
          {Object.entries(result.summary).map(([key, value]) => (
            <tr key={key} className="border-b">
              <td className="py-1 pr-4 font-medium">{key}</td>
              <td className="py-1">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Leave the existing hardcoded-content branch in place below this as the fallback for when `result` is `undefined` (e.g. the viewer opened before any run has happened) — don't delete it, since it's still the pre-run placeholder.

- [ ] **Step 3: Thread the real result through from Workbench.tsx**

In `Workbench.tsx`, find where `ResultViewer` is rendered (it's opened keyed by `{nodeId, specId}` per the existing modal state). Store the latest `RunResult["results"]` array in a piece of state after each `runAll()` completes (add a `runResults` state variable next to the existing modal/selection state), and pass the matching entry down:

```tsx
<ResultViewer
  {/* ...existing props... */}
  result={runResults.find((r) => r.nodeId === selectedResultNodeId)}
/>
```

Adjust the prop name for "which node's result to show" to match whatever the file already calls that piece of state (confirmed in Step 1 of Task 10's exploration) — don't introduce a second, differently-named piece of state for the same thing.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/processing/components/ResultViewer.tsx src/features/processing/components/Workbench.tsx
git commit -m "feat(processing): render real per-node results in ResultViewer

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 12: Update e2e coverage + full verification

**Files:**

- Modify: `e2e/workbench.spec.ts`
- Modify: `e2e/pages/workbench.page.ts` (if it needs new page-object helpers for file upload)

**Interfaces:**

- Consumes: everything from Tasks 1-11.
- Produces: no new exports — test coverage only.

- [ ] **Step 1: Read the current e2e spec and page object**

Run: `grep -n "test(\|Run All\|runAll" e2e/workbench.spec.ts e2e/pages/workbench.page.ts` to see what's already covered and the existing page-object method names/patterns to follow.

- [ ] **Step 2: Add a real-execution e2e test**

Add a test to `e2e/workbench.spec.ts` (following the file's existing test structure and page-object usage) that: drags a `table-input` node onto the canvas, uploads a small fixture CSV (add one at `e2e/fixtures/sample-table.csv` with a couple of rows), clicks Run All, and asserts the console/result panel shows a real row count rather than the old hardcoded accuracy string. If `workbench.page.ts` doesn't yet have a helper for "upload a file into a node's property panel," add one there following the file's existing method style, and use it from the new test.

`e2e/fixtures/sample-table.csv`:

```
id,value
1,10
2,20
3,30
```

- [ ] **Step 3: Run the e2e suite**

Ensure `processing-service` is running (`cd processing-service && uv run uvicorn app.main:app --reload --port 8787`), then run: `npx playwright test e2e/workbench.spec.ts`
Expected: all tests pass, including the new one.

- [ ] **Step 4: Run the full verification gate**

Run: `npm run typecheck && npm run lint && npm run build && npx vitest run && cd processing-service && uv run pytest -v`
Expected: everything passes.

- [ ] **Step 5: Commit**

```bash
git add e2e/
git commit -m "test(processing): cover real file upload + graph execution in e2e

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
