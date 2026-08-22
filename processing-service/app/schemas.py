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
