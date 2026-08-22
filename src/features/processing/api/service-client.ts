import type { ArtifactKind, ArtifactRef } from "./types"

export const SERVICE_URL = process.env.PROCESSING_SERVICE_URL ?? "http://127.0.0.1:8787"

export async function uploadArtifact(file: File, kind: ArtifactKind): Promise<ArtifactRef> {
  const body = new FormData()
  body.set("file", file)
  body.set("kind", kind)
  const response = await fetch(`${SERVICE_URL}/artifacts`, { method: "POST", body })
  if (!response.ok) {
    throw new Error(`Gagal mengunggah file (${response.status})`)
  }
  return (await response.json()) as ArtifactRef
}

export interface NodeExecuteResult {
  implemented: boolean
  summary: Record<string, unknown>
  outputs: Record<string, string>
}

export async function executeNode(
  nodeType: string,
  params: Record<string, string | number | boolean>,
  inputs: Record<string, string>,
  outputPorts: string[],
): Promise<NodeExecuteResult> {
  const response = await fetch(`${SERVICE_URL}/nodes/${nodeType}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params, inputs, output_ports: outputPorts }),
  })
  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as { detail?: string } | null
    throw new Error(detail?.detail ?? `Node ${nodeType} gagal dieksekusi (${response.status})`)
  }
  return (await response.json()) as NodeExecuteResult
}
