from __future__ import annotations

from app.artifacts import ArtifactStore


def execute_stub(
    store: ArtifactStore,
    node_type: str,
    params: dict,
    inputs: dict,
    output_ports: list[str],
) -> dict:
    """Phase 1 fallback for every node type without a real implementation yet
    (preproc/field/ml/accuracy/temporal categories). Forwards the first available
    upstream artifact to every declared output port, unchanged."""
    outputs: dict[str, str] = {}
    source_id = next(iter(inputs.values()), None)
    if source_id:
        for port_id in output_ports:
            outputs[port_id] = store.copy_as_new(source_id).id
    return {
        "implemented": False,
        "summary": {"note": f"'{node_type}' belum diimplementasikan — data diteruskan apa adanya"},
        "outputs": outputs,
    }
