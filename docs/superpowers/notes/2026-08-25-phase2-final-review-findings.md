# Phase 2 Final Review Findings (2026-08-25)

Range reviewed: `fa002e1..5ae94c0`. Verdict: **NOT ready to merge** until Critical 1-3 + Important 4 fixed.
Gates all green (pytest 44, vitest 8, typecheck 0, lint 0/2 warn, build ok) - they MASK the gap
because no test crosses the frontend-catalog / backend-param boundary.

## Critical (must fix)

1. **sunglint keys mismatch** - `nodes-catalog.ts:253-254` emits `nir: "B8"`, `visible: "B2,B3,B4"`.
   `hedley.py:44,49` reads `nir_band` / `visible_bands` and wants **1-based integer indices**.
   Verified: UI params -> `ValueError: visible_bands must be a comma-separated string or a list of integers`.
   Fix: rename keys AND emit integer indices (or map `B8` -> index before dispatch).

2. **water-column params never wired** - catalog exposes `pairs: "B2-B3, ..."` which backend ignores.
   `lyzenga.py:40-42` silently defaults blue=2, green=3, red=4. On 4-band rasters it SUCCEEDS with
   wrong bands (bad science, no error). Fix: add `blue_band`/`green_band`/`red_band`/`inverse_transform`,
   make required rather than silently defaulted.

3. **rf-train structurally unreachable** - `nodes-catalog.ts:491-525`:
   - `labels` port typed `raster` but `classify_rf.py:82` does `gpd.read_file()` (vector).
     `Workbench.tsx:71-72` validates by port type -> vector node CANNOT connect.
   - No raster output port; outputs are `model`/`importance`/`oob`, and `classify_rf.py:159` uses
     `output_ports[0]`, so the classified GeoTIFF publishes under `model`.
   - No `label_field` param; silently defaults to `"class"`.

   Root cause 1-3: diff adds only ~15 lines to `nodes-catalog.ts` (the two `sample_points` blocks).
   Plan Task 6 was marked closed but was ~20% done.

## Important

4. **min-10 sample points never enforced** (spec lines 62, 95). No `< 10` check anywhere in
   `processing-service/app`. `RoiPointEditor.tsx:29` only renders a warning; `run.ts:10-18`
   `validateGraph` checks only `params.file`. `PropertyPanel.test.tsx` asserts the warning STRING
   renders, never that a run is blocked. Fix in `hedley.py`/`lyzenga.py` (authoritative) + `validateGraph`.
5. **NaN crash** - `sample_utils.py:30` reads `masked=True` + `np.ma.filled(..., np.nan)`; reference used
   raw `.data`. ROI point on nodata -> `ValueError: Input X contains NaN` from sklearn (opaque HTTP 400).
   Fix: drop NaN rows in `_extract_samples`, report dropped count.
6. **event loop blocking** - `main.py:38-52` `async def execute_node` runs CPU-bound work inline;
   blocks health check `run.ts:22` relies on. Fix: drop `async` or `await run_in_threadpool(...)`.
7. **`sample_points` typed `text` default `"[]"` (string)** - `Workbench.tsx:45` seeds string; `hedley.py:53`
   `or []` doesn't catch it. `PropertyPanel.tsx:39` `normalizeSamplePoints` masks it. Add `json`/hidden type.
8. Missing tests: CRS validation (`classify_rf.py:65-69`), vector CRS reprojection (`:88-89`),
   `labelField` camelCase alias (`:42`).

## Minor

9. `classify_rf.py:47-58` silently coerces/clamps `n_estimators`.
10. `lyzenga.py:134-138` drops `nodata` from output profile (hedley restores it).
11. `classify_rf.py:88` assumes matching CRS when vector has none.
12. `test_classify_rf.py:85-98,104-107` bare try/except instead of `pytest.raises`;
    `test_hedley.py:140` passes for the wrong reason (0 valid samples, not the count threshold).
13. `ResultViewer.tsx:27-51` still keeps mock fallbacks + "Hasil disimulasikan" footer.
14. `vite.config.ts` now hand-rolled vs Lovable-managed; verified safe (server-only env not in
    `dist/client`) but will drift from upstream - note it in PR description.

## Strengths (keep)

Algorithm ports faithful to reference (`sample_utils` transformer/rowcol/skip semantics, hedley OLS
per band, lyzenga a/ratio/dii formula). Tests use real rasters + real CRS math.
`test_classify_rf.py:47-78` asserts spatial correctness. Artifact store path handling is secure
(name stripping + allowlist + 200MB cap + UUID manifest keys) - no traversal surface.
