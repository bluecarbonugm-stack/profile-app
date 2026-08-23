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
            result = executor(store, request.params, request.inputs, request.output_ports)
        else:
            result = execute_stub(store, node_type, request.params, request.inputs, request.output_ports)
    except (ValueError, KeyError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return ExecuteResponse(**result)
