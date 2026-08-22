from __future__ import annotations

import json
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

ARTIFACT_ROOT = Path(__file__).resolve().parent.parent / "data" / "artifacts"

VALID_KINDS = {"raster", "vector", "table"}


@dataclass(frozen=True)
class ArtifactRef:
    id: str
    kind: str
    filename: str
    path: str
    created_at: str


class ArtifactStore:
    def __init__(self, root: Path = ARTIFACT_ROOT) -> None:
        self.root = root
        self.manifest_path = root / "manifest.json"
        self.root.mkdir(parents=True, exist_ok=True)
        if not self.manifest_path.exists():
            self.manifest_path.write_text("{}", encoding="utf-8")

    def _read_manifest(self) -> dict:
        return json.loads(self.manifest_path.read_text(encoding="utf-8"))

    def _write_manifest(self, manifest: dict) -> None:
        self.manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    def save(self, filename: str, kind: str, data: bytes) -> ArtifactRef:
        if kind not in VALID_KINDS:
            raise ValueError(f"Unknown artifact kind: {kind}")
        artifact_id = uuid.uuid4().hex
        artifact_dir = self.root / artifact_id
        artifact_dir.mkdir(parents=True, exist_ok=True)
        dest = artifact_dir / filename
        dest.write_bytes(data)
        ref = ArtifactRef(
            id=artifact_id,
            kind=kind,
            filename=filename,
            path=str(dest),
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        manifest = self._read_manifest()
        manifest[artifact_id] = asdict(ref)
        self._write_manifest(manifest)
        return ref

    def get(self, artifact_id: str) -> ArtifactRef:
        manifest = self._read_manifest()
        if artifact_id not in manifest:
            raise KeyError(f"Unknown artifact id: {artifact_id}")
        return ArtifactRef(**manifest[artifact_id])

    def copy_as_new(self, source_id: str) -> ArtifactRef:
        """Used by stub nodes to forward an upstream artifact unchanged as their own output."""
        source = self.get(source_id)
        data = Path(source.path).read_bytes()
        return self.save(source.filename, source.kind, data)
