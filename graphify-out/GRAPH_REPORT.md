# Graph Report - bluecarbonwebprofile (2026-08-24)

## Corpus Check

- 102 files · ~41,998 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 646 nodes · 1030 edges · 48 communities (27 shown, 21 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `f5607adf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- profile/types.ts
- Workbench.tsx
- dependencies
- cn
- devDependencies
- compilerOptions
- routeTree.gen.ts
- server.ts
- components.json
- WorkbenchPage
- 4. Sistem Desain — Terverifikasi dari CSS Asli ✅
- ProfilePage
- scripts
- vite.config.ts
- test_artifacts.py
- Processing Engine Phase 1 — Real Execution + Real I/O
- processing-service
- processing-service
- Konten Web Profile dari Google Spreadsheet
- ArtifactStore
- Processing Engine Phase 1 Implementation Plan
- Panduan kontribusi (manusia & agen)
- CLAUDE.md
- supabase.ts
- test_main.py
- schemas.py
- fixture
- package.json
- Path
- eslint-config-prettier
- @eslint/js
- eslint-plugin-react-refresh
- globals
- @playwright/test
- @types/node
- @types/react
- @types/react-dom
- typescript
- typescript-eslint
- vite
- @vitejs/plugin-react
- vitest

## God Nodes (most connected - your core abstractions)

1. `cn()` - 41 edges
2. `ArtifactStore` - 39 edges
3. `WorkbenchPage` - 21 edges
4. `compilerOptions` - 17 edges
5. `ProfilePage` - 14 edges
6. `Processing Engine Phase 1 Implementation Plan` - 14 edges
7. `4. Sistem Desain — Terverifikasi dari CSS Asli ✅` - 11 edges
8. `resolveImageUrl()` - 10 edges
9. `Section()` - 10 edges
10. `Button` - 10 edges

## Surprising Connections (you probably didn't know these)

- `get_store()` --uses--> `ArtifactStore` [INFERRED]
  processing-service/app/main.py → processing-service/app/artifacts.py
- `make_store()` --uses--> `ArtifactStore` [INFERRED]
  processing-service/tests/test_artifacts.py → processing-service/app/artifacts.py
- `test_manifest_persists_across_store_instances()` --uses--> `ArtifactStore` [INFERRED]
  processing-service/tests/test_artifacts.py → processing-service/app/artifacts.py
- `client()` --calls--> `ArtifactStore` [INFERRED]
  processing-service/tests/test_main.py → processing-service/app/artifacts.py
- `test_rf_classify_produces_output()` --calls--> `execute_classify_rf()` [EXTRACTED]
  processing-service/tests/test_classify_rf.py → processing-service/app/nodes/classify_rf.py

## Import Cycles

- 3-file cycle: `src/features/processing/components/ResultViewer.tsx -> src/features/processing/index.ts -> src/features/processing/components/Workbench.tsx -> src/features/processing/components/ResultViewer.tsx`
- 3-file cycle: `src/features/processing/components/PropertyPanel.tsx -> src/features/processing/index.ts -> src/features/processing/components/Workbench.tsx -> src/features/processing/components/PropertyPanel.tsx`

## Communities (48 total, 21 thin omitted)

### Community 0 - "profile/types.ts"

Cohesion: 0.05
Nodes (57): CacheEntry, definedOnly(), env(), fallbackPayload(), fetchFromSheet(), loadProfileContent(), mergeWithFallback(), ttlMs() (+49 more)

### Community 1 - "Workbench.tsx"

Cohesion: 0.05
Nodes (57): checkServiceAvailable(), executeGraph(), REAL_IO_FILE_NODES, runGraphFn, mockedExecuteNode, validateGraph(), executeNode(), NodeExecuteResult (+49 more)

### Community 2 - "dependencies"

Cohesion: 0.04
Nodes (47): class-variance-authority, clsx, lucide-react, dependencies, class-variance-authority, clsx, lucide-react, @radix-ui/react-checkbox (+39 more)

### Community 3 - "cn"

Cohesion: 0.06
Nodes (42): ConsolePanel(), LEVEL_COLOR, LogEntry, Props, CATEGORY_LABEL, Props, Toolbar(), ErrorComponent() (+34 more)

### Community 4 - "devDependencies"

Cohesion: 0.18
Nodes (11): eslint, eslint-plugin-prettier, eslint-plugin-react-hooks, nitro, devDependencies, eslint, eslint-plugin-prettier, eslint-plugin-react-hooks (+3 more)

### Community 5 - "compilerOptions"

Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2022, eslint.config.js, src/**/\*.ts, src/**/*.tsx, vite/client, vite.config.ts (+18 more)

### Community 6 - "routeTree.gen.ts"

Cohesion: 0.10
Nodes (20): getRouter(), Route, Route, Workbench, Route, FileRoutesByFullPath, FileRoutesById, FileRoutesByPath (+12 more)

### Community 7 - "server.ts"

Cohesion: 0.18
Nodes (13): fetch(), getServerEntry(), isH3SwallowedErrorBody(), normalizeCatastrophicSsrResponse(), ServerEntry, consumeLastCapturedError(), describeError(), describeStatus() (+5 more)

### Community 8 - "components.json"

Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 10 - "4. Sistem Desain — Terverifikasi dari CSS Asli ✅"

Cohesion: 0.09
Nodes (22): 1. Ringkasan Eksekutif, 2. Struktur Halaman (Terverifikasi dari Konten Live), 3.1 Live Git Activity Feed, 3.2 Panel Demo Agentic Coding, 3.3 Terminal ASCII Branding, 3.4 Video Preview per Fitur, 3.5 Extension Cards, 3. Elemen UI yang Perlu Diperhatikan Tim (Unik ke Zed) (+14 more)

### Community 12 - "scripts"

Cohesion: 0.22
Nodes (9): scripts, build, build:dev, dev, format, lint, preview, test (+1 more)

### Community 17 - "test_artifacts.py"

Cohesion: 0.53
Nodes (8): make_store(), Path, test_copy_as_new_duplicates_content_under_a_new_id(), test_get_returns_saved_artifact(), test_get_unknown_id_raises_key_error(), test_manifest_persists_across_store_instances(), test_save_creates_artifact_with_generated_id(), test_save_rejects_unknown_kind()

### Community 18 - "Processing Engine Phase 1 — Real Execution + Real I/O"

Cohesion: 0.15
Nodes (12): 1. `processing-service` (Python/FastAPI), 2. TanStack Start server routes (new, under `src/features/processing/api/`), 3. Client changes (`src/features/processing/components/`), Architecture, Components, Context, Data flow, Error handling (+4 more)

### Community 19 - "processing-service"

Cohesion: 0.40
Nodes (4): processing-service, Run (dev), Setup, Test

### Community 23 - "Konten Web Profile dari Google Spreadsheet"

Cohesion: 0.08
Nodes (24): Blue Carbon Research Group, Konten Web Profile (Google Sheets), Menjalankan secara lokal, Sistem desain, Skrip yang tersedia, Struktur kode, Teknologi, 1. Buat spreadsheet (+16 more)

### Community 24 - "ArtifactStore"

Cohesion: 0.08
Nodes (45): ArtifactUploadResponse, ExecuteRequest, ExecuteResponse, get, post, ArtifactRef, ArtifactStore, Path (+37 more)

### Community 25 - "Processing Engine Phase 1 Implementation Plan"

Cohesion: 0.13
Nodes (14): Global Constraints, Processing Engine Phase 1 Implementation Plan, Task 10: Rewrite Workbench.tsx runAll() to call the real engine, Task 11: Real result rendering in ResultViewer, Task 12: Update e2e coverage + full verification, Task 1: Python service scaffold + artifact store, Task 2: Real I/O node executors + stub executor, Task 3: FastAPI app wiring (+6 more)

### Community 27 - "Panduan kontribusi (manusia & agen)"

Cohesion: 0.20
Nodes (8): Aturan arsitektur, Aturan UI, Data konten profil, Panduan kontribusi (manusia & agen), Routing, Sebelum commit, Conventions, Routes

### Community 30 - "test_main.py"

Cohesion: 0.19
Nodes (15): fixture, Path, ArtifactStore, tiny_classify_bundle(), client(), Regression guard for the port-id contract: raster-input's output must be keyed…, test_execute_missing_file_param_returns_400(), test_execute_node_accepts_nested_json_params() (+7 more)

### Community 31 - "schemas.py"

Cohesion: 0.60
Nodes (4): BaseModel, ArtifactUploadResponse, ExecuteRequest, ExecuteResponse

### Community 33 - "package.json"

Cohesion: 0.40
Nodes (4): name, private, sideEffects, type

## Knowledge Gaps

- **225 isolated node(s):** `Tone`, `TopoSortEdge`, `TopoSortNode`, `TopoSortResult`, `GraphEdgeInput` (+220 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `profile/types.ts`, `Workbench.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `Button` connect `cn` to `profile/types.ts`, `Workbench.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `ArtifactStore` (e.g. with `execute_node()` and `get_store()`) actually correct?**
  _`ArtifactStore` has 25 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Tone`, `TopoSortEdge`, `TopoSortNode` to the rest of the system?**
  _225 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `profile/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05389942788316772 - nodes in this community are weakly interconnected._
- **Should `Workbench.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
