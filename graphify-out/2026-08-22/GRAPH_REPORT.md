# Graph Report - bluecarbonwebprofile (2026-08-22)

## Corpus Check

- 88 files · ~32,320 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 545 nodes · 907 edges · 27 communities (23 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `09df0d9b`
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
- content-source.ts
- ProfilePage
- scripts
- vite.config.ts
- ArtifactStore
- Processing Engine Phase 1 — Real Execution + Real I/O
- processing-service
- processing-service
- test_io_nodes.py
- main.py
- run.ts

## God Nodes (most connected - your core abstractions)

1. `cn()` - 41 edges
2. `WorkbenchPage` - 17 edges
3. `compilerOptions` - 17 edges
4. `ProfilePage` - 14 edges
5. `ArtifactStore` - 10 edges
6. `resolveImageUrl()` - 10 edges
7. `Section()` - 10 edges
8. `Button` - 10 edges
9. `scripts` - 9 edges
10. `Processing Engine Phase 1 — Real Execution + Real I/O` - 9 edges

## Surprising Connections (you probably didn't know these)

- `execute_node()` --calls--> `execute_stub()` [INFERRED]
  processing-service/app/main.py → processing-service/app/nodes/stub.py
- `CacheEntry` --references--> `ProfilePayload` [EXTRACTED]
  src/features/profile/api/content-source.ts → src/features/profile/types.ts
- `make_store()` --uses--> `ArtifactStore` [INFERRED]
  processing-service/tests/test_artifacts.py → processing-service/app/artifacts.py
- `test_manifest_persists_across_store_instances()` --uses--> `ArtifactStore` [INFERRED]
  processing-service/tests/test_artifacts.py → processing-service/app/artifacts.py
- `upload_artifact()` --uses--> `ArtifactUploadResponse` [INFERRED]
  processing-service/app/main.py → processing-service/app/schemas.py

## Import Cycles

- None detected.

## Communities (27 total, 4 thin omitted)

### Community 0 - "profile/types.ts"

Cohesion: 0.06
Nodes (46): AboutSection(), CaseStudySection(), CLASS_LEGEND, SPECS, ContactSection(), FocusSection(), ICONS, GallerySection() (+38 more)

### Community 1 - "Workbench.tsx"

Cohesion: 0.07
Nodes (37): ConsolePanel(), LEVEL_COLOR, LogEntry, Props, NodePalette(), PropertyPanel(), confusion, Props (+29 more)

### Community 2 - "dependencies"

Cohesion: 0.04
Nodes (45): class-variance-authority, clsx, lucide-react, dependencies, class-variance-authority, clsx, lucide-react, @radix-ui/react-checkbox (+37 more)

### Community 3 - "cn"

Cohesion: 0.07
Nodes (36): CATEGORY_LABEL, Props, Props, Toolbar(), ErrorComponent(), RootComponent(), NAV, NavLink() (+28 more)

### Community 4 - "devDependencies"

Cohesion: 0.05
Nodes (37): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, nitro (+29 more)

### Community 5 - "compilerOptions"

Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2022, eslint.config.js, src/**/\*.ts, src/**/*.tsx, vite/client, vite.config.ts (+18 more)

### Community 6 - "routeTree.gen.ts"

Cohesion: 0.10
Nodes (19): getRouter(), Route, Workbench, Route, FileRoutesByFullPath, FileRoutesById, FileRoutesByPath, FileRoutesByTo (+11 more)

### Community 7 - "server.ts"

Cohesion: 0.18
Nodes (13): fetch(), getServerEntry(), isH3SwallowedErrorBody(), normalizeCatastrophicSsrResponse(), ServerEntry, consumeLastCapturedError(), describeError(), describeStatus() (+5 more)

### Community 8 - "components.json"

Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 10 - "content-source.ts"

Cohesion: 0.19
Nodes (15): CacheEntry, definedOnly(), env(), fallbackPayload(), fetchFromSheet(), loadProfileContent(), mergeWithFallback(), ttlMs() (+7 more)

### Community 12 - "scripts"

Cohesion: 0.14
Nodes (13): name, private, scripts, build, build:dev, dev, format, lint (+5 more)

### Community 17 - "ArtifactStore"

Cohesion: 0.15
Nodes (18): ArtifactRef, ArtifactStore, Path, Used by stub nodes to forward an upstream artifact unchanged as their own…, execute_stub(), ArtifactStore, Phase 1 fallback for every node type without a real implementation yet…, make_store() (+10 more)

### Community 18 - "Processing Engine Phase 1 — Real Execution + Real I/O"

Cohesion: 0.15
Nodes (12): 1. `processing-service` (Python/FastAPI), 2. TanStack Start server routes (new, under `src/features/processing/api/`), 3. Client changes (`src/features/processing/components/`), Architecture, Components, Context, Data flow, Error handling (+4 more)

### Community 19 - "processing-service"

Cohesion: 0.40
Nodes (4): processing-service, Run (dev), Setup, Test

### Community 23 - "test_io_nodes.py"

Cohesion: 0.29
Nodes (17): _execute_export(), execute_raster_export(), execute_raster_input(), execute_table_export(), execute_table_input(), execute_vector_export(), execute_vector_input(), ArtifactStore (+9 more)

### Community 24 - "main.py"

Cohesion: 0.11
Nodes (27): ArtifactStore, BaseModel, fixture, get, Path, post, execute_node(), get_store() (+19 more)

### Community 27 - "run.ts"

Cohesion: 0.13
Nodes (21): checkServiceAvailable(), REAL_IO_FILE_NODES, runGraphFn, validateGraph(), executeNode(), NodeExecuteResult, SERVICE_URL, uploadArtifact() (+13 more)

## Knowledge Gaps

- **164 isolated node(s):** `ParamType`, `Tone`, `ButtonProps`, `Props`, `Props` (+159 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `profile/types.ts`, `Workbench.tsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Button` connect `profile/types.ts` to `Workbench.tsx`, `cn`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `ParamType`, `Tone`, `ButtonProps` to the rest of the system?**
  _164 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `profile/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06340326340326341 - nodes in this community are weakly interconnected._
- **Should `Workbench.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06938775510204082 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
