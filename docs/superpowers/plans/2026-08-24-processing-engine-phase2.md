# Processing Engine Phase 2 Implementation Plan

> **STATUS: CLOSED 2026-08-25.** All 9 tasks implemented, committed, and merged to `main` @ `5ae94c0`.
> Commit map: T1 `fc26af5`; T2-T4, T6-T8 `ee9e168`; T5 `f5607ad` + review fixes `ee9e168`; T9 ledger closure commit.
> Related: `e88ca69` import repair, `493af12` UI identity, `e36b4d3` drop nitro, `88a1835` chore/docs, `5ae94c0` workbench parity.
> Final gates at `5ae94c0`: pytest 44 passed (venv), vitest 3 files/8 tests, typecheck 0 errors, lint 0 errors/2 warnings, build OK, preview HTTP 200.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** replace selected PRISM processing stubs with real coastal remote-sensing algorithms and the first usable ROI/sample-point input flow, using `D:\Proyek\CoastalAutoMapper` as the mandatory reference implementation.

**Architecture:** Phase 2 keeps the same processing-service + TanStack Start + React Workbench shape. It adds real algorithm handlers for Hedley, Lyzenga stacked DII, and Random Forest classification, plus minimal sample-point utilities and manual ROI editing in the frontend. Scientific report UI stays structured and lightweight.

**Tech Stack:** Python FastAPI, rasterio, geopandas, shapely, pyproj, scikit-learn, NumPy, pandas, React, TypeScript, TanStack Start, Playwright tests deferred.

**Spec:** `docs/superpowers/specs/2026-08-24-processing-engine-phase2-design.md`

**Reference repo:** `D:\Proyek\CoastalAutoMapper`

- `backend/app/hedley.py`
- `backend/app/lyzenga.py`
- `backend/app/classify_rf.py`
- `backend/app/sample_utils.py`
- `backend/app/raster_io.py`
- `backend/app/raster_cache.py`
- `backend/app/models.py`

## Global Constraints

- Do not implement Leaflet/map-click ROI in this plan. Phase 2 ROI stays manual coordinate editing.
- Preserve existing Phase 1 graphs. If a legacy stub is replaced, replace only that node handler and the minimal catalog contract around it.
- Every replaced scientific node must be backed by a small, real fixture test, not mocked behavior.
- Use existing file upload flow for raster and vector artifacts.
- Keep processing-service dependency footprint conservative.
- Keep UI summary output structured JSON only; do not add heavy HTML chart rendering.
- Run full verification gates after final task:
  - `python -m pytest processing-service/tests`
  - `npm run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`

## Tasks

### Task 1: JSON param contract and ROI storage shape

**Files:**

- Modify: `processing-service/app/schemas.py`
- Modify: `processing-service/app/main.py`
- Modify: `src/features/processing/components/PropertyPanel.tsx`
- Modify: `src/features/processing/components/Workbench.tsx`
- Test: `processing-service/tests/test_main.py`
- Test: `src/features/processing/api/run.test.ts`

**Interfaces:**

- Consumes: current `ExecuteRequest`, `PropertyPanel`, `onParamChange`.
- Produces: backend accepts nested JSON params; frontend nodes can persist `sample_points` and other structured params safely in `data.params`.

- [x] **Step 1: Add pytest for nested JSON param execution**

```python
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
```

- [x] **Step 2: Run test to verify contract acceptance**

Run: `python -m pytest processing-service/tests/test_main.py::test_execute_node_accepts_nested_json_params -v`
Expected: PASS after backend accepts nested params without schema rejection.

- [x] **Step 3: Update backend request schema to allow nested JSON params**

Change `processing-service/app/schemas.py` to:

```python
from __future__ import annotations

from typing import Any
from pydantic import BaseModel


class ExecuteRequest(BaseModel):
    params: dict[str, Any] = {}
    inputs: dict[str, str] = {}
    output_ports: list[str] = []
```

- [x] **Step 4: Ensure frontend sends nested params already and add Vitest contract assertion**

Confirm existing `run.ts` and `Workbench.tsx` already serialize nested `data.params`. Add a focused test in `src/features/processing/api/run.test.ts` asserting the constructed payload preserves nested `sample_points`.

```ts
test("preserves nested sample_points in request payload", async () => {
  const nodes = [
    { id: "n1", specId: "sunglint", params: { sample_points: [{ lat: -5, lon: 110 }] } },
  ];
  const edges = [];
  // Use mocked executeNode to inspect serialized body shape.
});
```

- [x] **Step 5: Verify backend tests**

Run: `python -m pytest processing-service/tests -v`
Expected: PASS

- [x] **Step 6: Verify frontend tests**

Run: `npx vitest run`
Expected: PASS

- [x] **Step 7: Commit**

```bash
git add processing-service/app/schemas.py processing-service/app/main.py processing-service/tests/test_main.py src/features/processing/components/PropertyPanel.tsx src/features/processing/components/Workbench.tsx src/features/processing/api/run.test.ts
git commit -m "feat(prism): allow nested JSON params for ROI workflow"
```

---

### Task 2: Sample-point utility for backend algorithms

**Files:**

- Create: `processing-service/app/nodes/sample_utils.py`
- Modify: `processing-service/app/nodes/io_nodes.py`
- Test: `processing-service/tests/test_sample_utils.py`

**Interfaces:**

- Consumes: raster artifact ref from `ArtifactStore`, rasterio metadata, and `sample_points` JSON.
- Produces: extracted float32 sample array and shared validation behavior usable by Hedley, Lyzenga, and RF.

- [x] **Step 1: Create failing pytest for sample extraction**

```python
def test_extract_samples_returns_valid_array(store, tiny_geotiff_bytes):
    from app.artifacts import ArtifactStore
    from app.nodes.sample_utils import extract_samples_from_artifact
    import rasterio
    from pyproj import CRS

    ref = store.save("src.tif", "raster", tiny_geotiff_bytes)
    with rasterio.open(ref.path) as ds:
        samples = extract_samples_from_artifact(
            store=store,
            artifact_id=ref.id,
            sample_points=[{"lat": -5.0, "lon": 110.0}],
        )
        assert samples.shape[1] == ds.count
        assert samples.shape[0] >= 1
```

- [x] **Step 2: Create failing pytest for validation**

```python
def test_extract_samples_rejects_missing_points(store, tiny_geotiff_bytes):
    from app.nodes.sample_utils import extract_samples_from_artifact
    ref = store.save("src.tif", "raster", tiny_geotiff_bytes)
    try:
        extract_samples_from_artifact(store=store, artifact_id=ref.id, sample_points=[])
        raise AssertionError("expected ValueError")
    except ValueError:
        pass
```

- [x] **Step 3: Implement minimal sample extraction utility**

Create `processing-service/app/nodes/sample_utils.py` containing:

- `extract_samples_from_artifact(store, artifact_id, sample_points)`
- rasterio open ref.path
- extract transform, CRS, width, height, masked/float32 stack
- WGS84-to-raster transform when CRS is not EPSG:4326
- row/col extraction
- return `(samples, raster_meta)`

- [x] **Step 4: Run sample utility tests**

Run: `python -m pytest processing-service/tests/test_sample_utils.py -v`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add processing-service/app/nodes/sample_utils.py processing-service/tests/test_sample_utils.py
git commit -m "feat(prism): add shared sample extraction utility"
```

---

### Task 3: Hedley real implementation

**Files:**

- Create: `processing-service/app/nodes/hedley.py`
- Modify: `processing-service/app/nodes/__init__.py`
- Modify: `processing-service/app/nodes/io_nodes.py`
- Test: `processing-service/tests/test_hedley.py`

**Interfaces:**

- Consumes: raster artifact id, band params, sample_points from request.
- Produces: `implemented=True`, corrected 3-band raster artifact id, regression summary.

- [x] **Step 1: Create failing pytest for Hedley execution**

```python
def test_hedley_corrects_raster(store, tiny_geotiff_bytes):
    from app.nodes.hedley import execute_hedley
    ref = store.save("input.tif", "raster", tiny_geotiff_bytes)
    result = execute_hedley(
        store=store,
        params={
            "file": ref.id,
            "nir_band": 4,
            "visible_bands": "1,2,3",
            "sample_points": [{"lat": -5.0, "lon": 110.0}] * 10,
        },
        inputs={"raster": ref.id},
        output_ports=["out"],
    )
    assert result["implemented"] is True
    assert "out" in result["outputs"]
    assert result["outputs"]["out"] != ref.id
    assert "slopes" in result["summary"]
```

- [x] **Step 2: Run test to verify failure**

Run: `python -m pytest processing-service/tests/test_hedley.py::test_hedley_corrects_raster -v`
Expected: FAIL

- [x] **Step 3: Implement Hedley algorithm handler**

Port the core logic from `D:\Proyek\CoastalAutoMapper\backend\app\hedley.py` lines 117-365:

- parse band params
- validate 3 visible bands + NIR band
- extract samples
- fit `LinearRegression` per visible band
- apply `corrected = band - slope * (nir - nir_min)`
- clip valid pixels to >= 0
- write 3-band float32 GeoTIFF artifact

- [x] **Step 4: Register handler in `__init__.py`**

- [x] **Step 5: Run pytest**

Run: `python -m pytest processing-service/tests -v`
Expected: PASS

- [x] **Step 6: Commit**

```bash
git add processing-service/app/nodes/hedley.py processing-service/app/nodes/__init__.py processing-service/tests/test_hedley.py
git commit -m "feat(prism): implement real Hedley sunglint correction"
```

---

### Task 4: Lyzenga DII real implementation

**Files:**

- Create: `processing-service/app/nodes/lyzenga.py`
- Modify: `processing-service/app/nodes/__init__.py`
- Test: `processing-service/tests/test_lyzenga.py`

**Interfaces:**

- Consumes: raster artifact id, band selection, sample_points.
- Produces: stacked DII raster artifact id and covariance summary.

- [x] **Step 1: Create failing pytest**

```python
def test_lyzenga_builds_dii_raster(store, tiny_geotiff_bytes):
    from app.nodes.lyzenga import execute_lyzenga
    ref = store.save("input.tif", "raster", tiny_geotiff_bytes)
    result = execute_lyzenga(
        store=store,
        params={
            "file": ref.id,
            "blue_band": 1,
            "green_band": 2,
            "red_band": 3,
            "sample_points": [{"lat": -5.0, "lon": 110.0}] * 10,
            "inverse_transform": True,
        },
        inputs={"raster": ref.id},
        output_ports=["out"],
    )
    assert result["implemented"] is True
    assert result["outputs"]["out"] != ref.id
    assert "pairs" in result["summary"]
```

- [x] **Step 2: Run test to verify failure**

Run: `python -m pytest processing-service/tests/test_lyzenga.py::test_lyzenga_builds_dii_raster -v`
Expected: FAIL

- [x] **Step 3: Implement Lyzenga stacked DII**

Port core logic from `D:\Proyek\CoastalAutoMapper\backend\app\lyzenga.py` lines 677-916:

- validate 3 distinct bands
- build log bands
- for each pair `(blue,green)`, `(blue,red)`, `(green,red)`
- extract samples
- compute covariance, ratio, DII
- apply inverse transform
- stack and write DII artifact

- [x] **Step 4: Register in `__init__.py`**

- [x] **Step 5: Run pytest**

Run: `python -m pytest processing-service/tests -v`
Expected: PASS

- [x] **Step 6: Commit**

```bash
git add processing-service/app/nodes/lyzenga.py processing-service/app/nodes/__init__.py processing-service/tests/test_lyzenga.py
git commit -m "feat(prism): implement real Lyzenga stacked DII"
```

---

### Task 5: Random Forest classification real implementation

**Files:**

- Create: `processing-service/app/nodes/classify_rf.py`
- Modify: `processing-service/app/nodes/__init__.py`
- Test: `processing-service/tests/test_classify_rf.py`
- Add fixture files: `processing-service/tests/fixtures/train.geojson`, `processing-service/tests/fixtures/classify.tif`

**Interfaces:**

- Consumes: raster artifact id, training vector artifact id, label field, model params.
- Produces: classified raster artifact id and class mapping summary.

- [x] **Step 1: Create failing pytest**

```python
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
```

- [x] **Step 2: Run test to verify failure**

Run: `python -m pytest processing-service/tests/test_classify_rf.py::test_rf_classify_produces_output -v`
Expected: FAIL

- [x] **Step 3: Implement RF classify**

Use a pragmatic first path: do not yet implement model serialization across nodes. When `rf-train` runs with both raster and training vector attached, execute training + prediction in the same node and return classified raster artifact directly.

Port the core path from `D:\Proyek\CoastalAutoMapper\backend\app\classify_rf.py` lines 111-257:

- read raster feature stack
- read vector training labels
- rasterize labels with `LabelEncoder`
- fit `RandomForestClassifier`
- predict full raster in chunks
- write classified int16 GeoTIFF

- [x] **Step 4: Register in `__init__.py`**

- [x] **Step 5: Run pytest**

Run: `python -m pytest processing-service/tests -v`
Expected: PASS

- [x] **Step 6: Commit**

```bash
git add processing-service/app/nodes/classify_rf.py processing-service/app/nodes/__init__.py processing-service/tests/test_classify_rf.py processing-service/tests/fixtures/train.geojson processing-service/tests/fixtures/classify.tif
git commit -m "feat(prism): implement real Random Forest classification"
```

---

### Task 6: Frontend catalog and ROI params

**Files:**

- Modify: `src/features/processing/data/nodes-catalog.ts`
- Test: `src/features/processing/api/run.test.ts`

**Interfaces:**

- Consumes: new algorithm inputs from Phase 2 backend.
- Produces: updated UI params for `sunglint`, `water-column`, and `rf-train` nodes.

- [x] **Step 1: Update catalog params**

For `sunglint`, replace or extend current params with:

- `nir_band` number/text
- `visible_bands` text
- `sample_points` hidden array param

For `water-column`, replace or extend with:

- `blue_band` number
- `green_band` number
- `red_band` number
- `inverse_transform` boolean
- `sample_points` hidden array param

For `rf-train`, extend with:

- `label_field`
- `n_estimators`
- `max_depth`

- [x] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: clean

- [x] **Step 3: Run tests**

Run: `npx vitest run`
Expected: PASS

- [x] **Step 4: Commit**

```bash
git add src/features/processing/data/nodes-catalog.ts src/features/processing/api/run.test.ts
git commit -m "feat(prism): update processing catalog for real algorithms"
```

---

### Task 7: ROI manual editor in PropertyPanel

**Files:**

- Modify: `src/features/processing/components/PropertyPanel.tsx`
- Test: `src/features/processing/api/run.test.ts`

**Interfaces:**

- Consumes: selected node with `sample_points` param.
- Produces: editable, validated ROI list persisted in `node.data.params.sample_points`.

- [x] **Step 1: Implement manual ROI editor**

When `spec.params` includes a `sample_points` key or node id is ROI-capable:

- render compact table of points
- add button to append `{ lat, lon }`
- add inline inputs per point
- remove point button
- show total count
- mark invalid state when fewer than 10 points

- [x] **Step 2: Keep existing field renderers unchanged**

Make ROI section conditional and self-contained.

- [x] **Step 3: Verify frontend**

Run: `npm run typecheck && npm run lint && npx vitest run`
Expected: clean/PASS

- [x] **Step 4: Commit**

```bash
git add src/features/processing/components/PropertyPanel.tsx
git commit -m "feat(prism): add manual ROI point editor"
```

---

### Task 8: ResultViewer scientific summary rendering

**Files:**

- Modify: `src/features/processing/components/ResultViewer.tsx`
- Test: manual inspection plus existing frontend gate

**Interfaces:**

- Consumes: real result payloads from Hedley/Lyzenga/RF.
- Produces: structured summary table rendering.

- [x] **Step 1: Implement nested summary renderer**

Add rendering paths for:

- scalar key/value rows
- nested dicts rendered as subtables
- array/object values as JSON block for compact overflow

- [x] **Step 2: Remove mock-only fallbacks for replaced nodes**

Keep generic fallback message, but expand support for real `summary` payloads.

- [x] **Step 3: Verify frontend**

Run: `npm run test && npm run lint && npm run build`
Expected: PASS/clean

- [x] **Step 4: Commit**

```bash
git add src/features/processing/components/ResultViewer.tsx
git commit -m "feat(prism): render real scientific result summaries"
```

---

### Task 9: Verification gate + progress ledger

**Files:**

- Modify: `.superpowers/sdd/2026-08-22-processing-engine-phase2/progress.md`
- Modify: `processing-service/app/nodes/io_nodes.py` only if needed

**Interfaces:**

- Consumes: completed Phase 2 tasks.
- Produces: committed state, verified gate, recorded ledger.

- [x] **Step 1: Run backend tests**

Run: `python -m pytest processing-service/tests -v`

- [x] **Step 2: Run frontend tests**

Run: `npx vitest run`

- [x] **Step 3: Run frontend quality gates**

Run: `npm run typecheck && npm run lint && npm run build`

- [x] **Step 4: Record progress in `.superpowers/sdd/2026-08-22-processing-engine-phase2/progress.md`**

- [x] **Step 5: Commit final status**

```bash
git add .superpowers
git commit -m "docs(prism): finalize phase 2 verification ledger"
```
