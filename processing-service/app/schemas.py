from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class ExecuteRequest(BaseModel):
    params: dict[str, Any] = {}
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
