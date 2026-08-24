# Processing Engine Phase 1 — Real Execution + Real I/O

## Context

The `/processing` Workbench (`src/features/processing/`) is a React Flow node-pipeline
editor for BCRG coastal remote-sensing workflows (sunglint correction, Lyzenga water-column
correction, Random Forest classification, accuracy testing, multi-temporal change analysis).
~30 node types across 7 categories live in `data/nodes-catalog.ts`.

Today the whole thing is simulated:

- `Workbench.tsx` `runAll()` iterates nodes in **list order, not the graph's real topological
  order** (edges are visual only — no data actually flows between connected nodes), sleeps a
  random delay per node, and logs **hardcoded fake results** (e.g. RF OOB accuracy is always
  `0.882`) regardless of params or input.
- "File" params on `raster-input`/`vector-input` are plain text fields with fake default
  filenames — no upload control, no file is ever read.
- No backend/server route for processing exists.

This is the first of three independent sub-projects (UI/UX fixes and a client→Supabase
migration are the other two, brainstormed separately). Within processing, this is Phase 1
of a phased rebuild — later phases replace stub node logic with real remote-sensing
algorithms; Phase 1 only has to make the _engine_ and _I/O_ real.

## Goal / Non-goals

**Goal:** the Workbench actually executes — real topological order derived from edges, real
artifact data flowing between connected nodes, and real file I/O (raster/vector/table)
through a Python backend, so a user's uploaded file is genuinely read and its metadata is
genuinely returned.

**Non-goal (deferred):** real scientific algorithms for `preproc`/`field`/`ml`/`accuracy`/
`temporal` nodes (sunglint regression, Lyzenga DII, RF training, confusion matrix,
multi-temporal overlay). In Phase 1 these are stub/pass-through nodes wired correctly
through the real engine, so later phases only swap stub logic for real logic per node —
they don't touch the engine.

## Architecture

- New `processing-service/` Python service (FastAPI), run as a sibling process in dev
  (e.g. `uv run uvicorn` alongside `npm run dev`, wired via a root dev script). No Docker
  for Phase 1 — kept out to minimize local dev friction until there's a real deploy target.
- Libraries: `rasterio` (raster I/O), `geopandas`/`fiona`/`shapely` (vector I/O), `pandas`
  (tabular). `scikit-learn` is a dependency already anticipated for later ML phases but
  unused in Phase 1.
- TanStack Start server is the orchestrator: it receives the "Run All" request (full graph:
  nodes, params, edges) from the client, computes topological order itself (so cycle errors
  surface before any Python call happens), then calls the Python service once per node in
  order and relays real per-node results back to the client. Polling via a run id, not SSE —
  simplest thing that works for Phase 1.
- File upload: client uploads raw files through a new TanStack Start server route
  (multipart), which stores them via the Python service and gets back an artifact id; that
  id becomes the `file` param's value instead of a free-text filename.

## Components

### 1. `processing-service` (Python/FastAPI)

- `POST /nodes/{nodeType}/execute` — generic per-node execution endpoint. Input: node spec
  id, params, input artifact ref(s). Output: output artifact ref(s) + a result summary.
- **Real in Phase 1:** `raster-input` (rasterio open → band count, dims, CRS, dtype, quick
  stats), `vector-input` (geopandas read → feature count, geometry type, CRS, bounds), the
  `field`-category CSV/survey-table ingestion node (pandas read → row/col count, dtype
  summary), `raster-output`/`vector-output`/`table-output` (write artifact to the requested
  format).
- **Stub in Phase 1:** every other node type. Validates required inputs are present, echoes
  the upstream artifact unchanged as output, and returns a result summary explicitly labeled
  as not-yet-implemented so the UI can visually distinguish real results from stubbed ones.
- Artifact storage: local temp dir on the service host, keyed by a uuid, with a small JSON
  manifest (id → path, type, created_at). Not durable — durable storage (Supabase or
  similar) is out of scope until those credentials exist.

### 2. TanStack Start server routes (new, under `src/features/processing/api/`)

- Upload route: proxies multipart upload to the Python service, returns an artifact id to
  the client.
- Run route: accepts the graph, computes topological order (Kahn's algorithm), rejects
  non-DAGs with a validation error before calling anything, then calls the Python service
  node-by-node using the **edge map** to resolve each node's real input artifacts (not node
  list order — this is the actual bug being fixed), and returns real per-node results.

### 3. Client changes (`src/features/processing/components/`)

- `PropertyPanel.tsx`: `raster-input`/`vector-input`/CSV field nodes get a real file-upload
  control instead of a text field — uploads on file select, stores the returned artifact id
  as the param value, displays the filename once uploaded.
- `Workbench.tsx`: `runAll()` rewritten to build the graph payload from current nodes/edges,
  POST to the new Run route, and consume real per-node results as they arrive — replacing
  the current `setTimeout`-random-delay/hardcoded-string loop. Node status updates reflect
  real success/failure.
- `ResultViewer.tsx`: renders whatever real result payload comes back per node (a metadata
  table for io nodes; a "not yet implemented" placeholder for stub nodes) instead of fully
  canned content.
- `ConsolePanel.tsx`: logs real per-node messages/errors from service responses.

## Data flow

1. User selects a file on `raster-input` in PropertyPanel → uploaded immediately → artifact
   id stored as the node's param.
2. User wires nodes with edges as today (port-type validation unchanged).
3. User clicks Run All → client sends `{nodes, edges, params}` to the Run route.
4. Run route topologically sorts from edges; a cycle produces a validation error and nothing
   executes.
5. Run route calls the Python service once per node in order, passing each node's params
   plus the artifact ref(s) produced by its upstream nodes (resolved via the edge map).
6. Python service executes (real for io nodes, stub/echo otherwise) and returns an output
   artifact ref + result summary per call.
7. Run route relays each node's real result to the client as it completes; client updates
   node status, console log, and result viewer incrementally.
8. On any node failure, downstream nodes are skipped and marked "blocked"; the real error
   message from the service is shown in the console.

## Error handling

- Cycle in graph → validation error before execution starts (toast + console entry); nothing
  runs.
- Missing required upload (io node param has no artifact id) → validation error before
  execution starts; that node is highlighted.
- Node execution failure (bad file, unreadable format, service exception) → real error
  message in the console, node status set to "error", downstream nodes marked "blocked"
  rather than silently run.
- Python service unreachable → Run route returns a clear "processing service unavailable"
  error instead of hanging.

## Testing

- `processing-service`: pytest suite with small real fixture files (a tiny GeoTIFF, a tiny
  SHP/GeoJSON, a tiny CSV) covering the real io node implementations, plus a contract test
  for the stub-node behavior.
- Run route: unit tests for topological sort (linear, branching, cycle-detection),
  independent of the Python service (mock the service call).
- `e2e/workbench.spec.ts`: updated to cover real file upload + Run All against a running
  `processing-service` instance. CI needs the service available (docker-compose, or a
  launched uvicorn process for the test run) — a real CI addition, not free.

## Explicitly deferred

Real algorithms for `preproc`/`field`-processing/`ml`/`accuracy`/`temporal` categories;
durable/cloud artifact storage (Supabase, once credentials arrive); SSE/streaming run
updates; auth/multi-user isolation of artifacts.
