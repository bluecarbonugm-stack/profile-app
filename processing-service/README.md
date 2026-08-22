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
