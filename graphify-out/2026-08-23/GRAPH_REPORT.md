# Graph Report - bluecarbonwebprofile (2026-08-23)

## Corpus Check

- 91 files · ~34,943 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 625 nodes · 1007 edges · 30 communities (24 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `3dbc6c8d`
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

## God Nodes (most connected - your core abstractions)

1. `cn()` - 41 edges
2. `ArtifactStore` - 40 edges
3. `WorkbenchPage` - 21 edges
4. `compilerOptions` - 17 edges
5. `ProfilePage` - 14 edges
6. `Processing Engine Phase 1 Implementation Plan` - 14 edges
7. `4. Sistem Desain — Terverifikasi dari CSS Asli ✅` - 11 edges
8. `resolveImageUrl()` - 10 edges
9. `Section()` - 10 edges
10. `Button` - 10 edges

## Surprising Connections (you probably didn't know these)

- `make_store()` --uses--> `ArtifactStore` [INFERRED]
  processing-service/tests/test_artifacts.py → processing-service/app/artifacts.py
- `test_manifest_persists_across_store_instances()` --uses--> `ArtifactStore` [INFERRED]
  processing-service/tests/test_artifacts.py → processing-service/app/artifacts.py
- `CacheEntry` --references--> `ProfilePayload` [EXTRACTED]
  src/features/profile/api/content-source.ts → src/features/profile/types.ts
- `Props` --references--> `NodeRunResult` [EXTRACTED]
  src/features/processing/components/ResultViewer.tsx → src/features/processing/api/types.ts
- `execute_node()` --uses--> `ArtifactStore` [INFERRED]
  processing-service/app/main.py → processing-service/app/artifacts.py

## Import Cycles

- 3-file cycle: `src/features/processing/components/PropertyPanel.tsx -> src/features/processing/index.ts -> src/features/processing/components/Workbench.tsx -> src/features/processing/components/PropertyPanel.tsx`
- 3-file cycle: `src/features/processing/components/ResultViewer.tsx -> src/features/processing/index.ts -> src/features/processing/components/Workbench.tsx -> src/features/processing/components/ResultViewer.tsx`

## Communities (30 total, 6 thin omitted)

### Community 0 - "profile/types.ts"

Cohesion: 0.05
Nodes (57): CacheEntry, definedOnly(), env(), fallbackPayload(), fetchFromSheet(), loadProfileContent(), mergeWithFallback(), ttlMs() (+49 more)

### Community 1 - "Workbench.tsx"

Cohesion: 0.05
Nodes (58): checkServiceAvailable(), REAL_IO_FILE_NODES, runGraphFn, validateGraph(), executeNode(), NodeExecuteResult, SERVICE_URL, uploadArtifact() (+50 more)

### Community 2 - "dependencies"

Cohesion: 0.04
Nodes (47): class-variance-authority, clsx, lucide-react, dependencies, class-variance-authority, clsx, lucide-react, @radix-ui/react-checkbox (+39 more)

### Community 3 - "cn"

Cohesion: 0.07
Nodes (39): ConsolePanel(), LEVEL_COLOR, LogEntry, Props, Props, ErrorComponent(), RootComponent(), NAV (+31 more)

### Community 4 - "devDependencies"

Cohesion: 0.05
Nodes (37): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, nitro (+29 more)

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

Cohesion: 0.14
Nodes (13): name, private, scripts, build, build:dev, dev, format, lint (+5 more)

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

Cohesion: 0.07
Nodes (50): BaseModel, get, post, ArtifactRef, ArtifactStore, Path, Used by stub nodes to forward an upstream artifact unchanged as their own…, execute_node() (+42 more)

### Community 25 - "Processing Engine Phase 1 Implementation Plan"

Cohesion: 0.13
Nodes (14): Global Constraints, Processing Engine Phase 1 Implementation Plan, Task 10: Rewrite Workbench.tsx runAll() to call the real engine, Task 11: Real result rendering in ResultViewer, Task 12: Update e2e coverage + full verification, Task 1: Python service scaffold + artifact store, Task 2: Real I/O node executors + stub executor, Task 3: FastAPI app wiring (+6 more)

### Community 27 - "Panduan kontribusi (manusia & agen)"

Cohesion: 0.20
Nodes (8): Aturan arsitektur, Aturan UI, Data konten profil, Panduan kontribusi (manusia & agen), Routing, Sebelum commit, Conventions, Routes

## Knowledge Gaps

- **224 isolated node(s):** `SAMPLE_TABLE_CSV`, `Tone`, `TopoSortEdge`, `TopoSortNode`, `TopoSortResult` (+219 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `profile/types.ts`, `Workbench.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `Button` connect `cn` to `profile/types.ts`, `Workbench.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `ArtifactStore` (e.g. with `execute_node()` and `get_store()`) actually correct?**
  _`ArtifactStore` has 25 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SAMPLE_TABLE_CSV`, `Tone`, `TopoSortEdge` to the rest of the system?**
  _224 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `profile/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05389942788316772 - nodes in this community are weakly interconnected._
- **Should `Workbench.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05322947095098994 - nodes in this community are weakly interconnected._
