# Processing Engine Phase 2 — Scientific Algorithms + ROI Workflow

## Context

Phase 1 made the PRISM workbench execute real graphs with real artifact I/O. Phase 2 replaces selected stubs with real coastal remote-sensing algorithms, using `D:\Proyek\CoastalAutoMapper` as the required reference implementation.

Reference files:

- `backend/app/hedley.py`
- `backend/app/lyzenga.py`
- `backend/app/classify_rf.py`
- `backend/app/sample_utils.py`
- `backend/app/raster_io.py`
- `backend/app/raster_cache.py`
- `backend/app/models.py`

## Goal

Implement the first real scientific processing layer for PRISM:

1. Hedley sunglint correction.
2. Lyzenga stacked depth-invariant index.
3. Random Forest raster classification.
4. ROI/sample-point input flow from the UI into backend node execution.
5. Result summaries suitable for `ResultViewer`.

## Non-goals

- Supabase storage migration.
- SSE/WebSocket streaming.
- Full HTML report generation parity with CoastalAutoMapper.
- Accuracy assessment node implementation.
- Batch execution.
- Rich GIS map viewer parity with CoastalAutoMapper desktop.

## Backend Design

### 1. Shared sample utilities

Add `processing-service/app/nodes/sample_utils.py` with a minimal port of CoastalAutoMapper’s `extract_samples()`:

- Input: `sample_points`, raster stack `(bands, rows, cols)`, raster transform, CRS, width, height.
- Points are WGS84 `{ lat, lon }`.
- If raster CRS is not EPSG:4326, transform points with `pyproj.Transformer`.
- Convert map coordinates to raster row/col using `rasterio.transform.rowcol`.
- Skip out-of-bounds points.
- Raise `ValueError` when no valid samples remain.

### 2. Hedley node

Use existing catalog node `sunglint` as the real Hedley implementation.

Inputs:

- `inputs["raster"]`: uploaded raster artifact id.
- `params.visible`: comma list of visible bands. Accept numeric values (`1,2,3`) and existing text style (`B2,B3,B4`).
- `params.nir`: NIR band. Accept numeric and `B8` style.
- `params.sample_points`: list of `{ lat, lon }`.

Validation:

- Require at least 10 sample points.
- Require exactly 3 visible bands.
- Reject visible bands equal to the NIR band.
- Reject out-of-range bands.

Algorithm:

- Read raster as masked float32 stack.
- Extract samples at points.
- For each visible band, fit `LinearRegression` against NIR samples.
- Correct each visible band with:
  `corrected = original - slope * (nir - nir_min)`
- Clip valid pixels to minimum 0.
- Write a 3-band float32 GeoTIFF artifact.

Output:

- `outputs.out`: corrected raster artifact id.
- `summary`: slopes, intercepts, r2, rmse, sample count, input/output band mapping.
- No chart artifact in Phase 2 unless cheap; include chart-ready regression arrays in summary if compact.

### 3. Lyzenga node

Use existing catalog node `water-column` as the real Lyzenga DII implementation.

Inputs:

- `inputs["raster"]`: raster artifact id.
- `params.pairs`: existing text pair list may stay for UI, but backend should primarily use `blue_band`, `green_band`, `red_band` if added later.
- `params.sample_points`: homogeneous substrate points.

Validation:

- Require at least 10 sample points.
- Require 3 distinct bands.
- Reject out-of-range bands.
- Require positive reflectance for usable sample pixels.

Algorithm from `run_lyzenga_stacked()`:

- Build log bands for three selected bands.
- Compute DII for pairs: blue/green, blue/red, green/red.
- For each pair:
  - Extract sample values from log-band stack.
  - Filter finite values.
  - Compute covariance matrix.
  - Compute attenuation ratio:
    `a = (var_i - var_j) / (2 * cov_ij)`
    `ratio = a + sqrt(a*a + 1)`
  - Compute `dii = log_i - ratio * log_j`.
  - Apply inverse transform by default: `exp(dii)`.
- Stack the three DII bands into a float32 GeoTIFF artifact.

Output:

- `outputs.out`: DII raster artifact id.
- `summary`: band pairs, covariance stats, ratio per pair, r2 per pair, sample count.

### 4. Random Forest node

Use existing catalog node `rf-train` or current closest ML node. If the existing catalog separates train/classify, Phase 2 should implement the smallest useful path: train and classify in one execution when raster + training vector are connected.

Inputs:

- Raster artifact id from input port.
- Training vector artifact id from input port.
- Params: `labelField`, `n_estimators`, `max_depth`, optional `band_indices`.

Validation:

- Training vector must contain `labelField`.
- Raster must have CRS.
- Training geometries must rasterize to at least one pixel.

Algorithm:

- Load raster feature stack as `(rows, cols, n_features)` float32.
- Read training vector with GeoPandas, reproject to raster CRS.
- Rasterize vector labels to an integer label raster using `LabelEncoder`.
- Train `RandomForestClassifier` with `random_state=42`, `n_jobs=-1`.
- Predict full raster in chunks of up to 100,000 pixels.
- Write classified int16 GeoTIFF with nodata `-1`.

Output:

- `outputs.out`: classified raster artifact id.
- `summary`: class label mapping, training pixel count, feature count, n_estimators, max_depth, optionally OOB score if enabled later.

## API Contract

Update `ExecuteRequest.params` to allow nested JSON:

- strings
- numbers
- booleans
- null
- arrays
- objects

This is required for `sample_points: Array<{lat:number, lon:number}>`.

Frontend `JsonValue` already exists in TypeScript. Mirror that shape in Pydantic by relaxing `params: dict` or using a JSON-compatible type alias.

## Frontend Design

### 1. Catalog params

Add a new param type only if needed:

- Preferred minimal option: store ROI points as a hidden-ish JSON param key `sample_points` managed by `PropertyPanel`, not hand-edited.
- Add explicit numeric params for band indices where current text fields are ambiguous.

Recommended mapping:

- `sunglint`: `nir_band`, `visible_bands`, `sample_points`.
- `water-column`: `blue_band`, `green_band`, `red_band`, `sample_points`, `inverse_transform`.
- `rf-train`: `labelField`, `n_estimators`, `max_depth`, `band_indices`.

### 2. ROI panel

In `PropertyPanel`, when selected node requires sample points:

- Show a compact ROI editor block.
- Users can add points manually via lat/lon inputs first.
- Full map click UI can follow once map dependency is approved.

Reason: no current map library exists in this repo. Adding Leaflet/React-Leaflet is a dependency decision and should not block backend algorithm correctness. The first Phase 2 implementation can accept manual coordinate rows and remain fully testable.

If adding map UI in the same phase is approved:

- Add `leaflet` and `react-leaflet`.
- Render a mini-map in `PropertyPanel` only for ROI-capable nodes.
- On click, append `{lat, lon}` to `sample_points`.
- Allow deleting points.
- Show count and validation state (`minimum 10`).

### 3. ResultViewer

Render summary payloads generically:

- Metadata table for scalar values.
- Nested table for covariance / class mappings.
- For RF, show label mapping and training pixel count.
- For Hedley, show per-band slopes and R2.
- For Lyzenga, show per-pair ratio and R2.

No full HTML report generation in Phase 2. Keep output structured and small.

## Data Flow

1. User uploads raster/vector with existing file upload controls.
2. User connects nodes in graph.
3. User selects Hedley/Lyzenga node and enters or clicks ROI points.
4. `params.sample_points` is stored on the node.
5. `runGraphFn` sends nested params to the backend service.
6. Backend executes real algorithm and writes new artifact.
7. Downstream nodes consume the artifact by existing edge map.
8. UI renders real summary in `ResultViewer`.

## Testing

Backend tests:

- Sample extraction CRS and bounds behavior.
- Hedley on tiny synthetic raster with known correlation.
- Lyzenga on tiny positive raster with valid sample points.
- RF on tiny raster + GeoJSON polygons with string labels.
- Contract tests for missing/too-few sample points.

Frontend tests:

- `sample_points` can be added/removed in `PropertyPanel`.
- Graph payload preserves nested `sample_points`.
- `ResultViewer` renders nested scientific summaries.

Verification gate:

- `python -m pytest processing-service/tests`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Recommended Implementation Slices

1. Backend JSON param contract + sample utility tests.
2. Hedley real node + tests.
3. Lyzenga real node + tests.
4. RF real node + tests.
5. Frontend catalog param cleanup.
6. ROI point editor without map dependency.
7. ResultViewer scientific summary rendering.
8. Optional Leaflet mini-map if approved after the manual ROI editor works.
