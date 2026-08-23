import { createServerFn } from "@tanstack/react-start";

import { NODES_BY_ID } from "../data/nodes-catalog";
import { executeNode, SERVICE_URL } from "./service-client";
import { topoSort } from "./topo-sort";
import type { GraphPayload, NodeRunResult, RunResult } from "./types";

const REAL_IO_FILE_NODES = new Set(["raster-input", "vector-input", "table-input"]);

function validateGraph(payload: GraphPayload): string[] {
  const errors: string[] = [];
  for (const node of payload.nodes) {
    if (REAL_IO_FILE_NODES.has(node.specId) && !node.params.file) {
      errors.push(`Node "${node.id}" belum memiliki file yang diunggah`);
    }
  }
  return errors;
}

async function checkServiceAvailable(): Promise<boolean> {
  try {
    const response = await fetch(SERVICE_URL, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}

export const runGraphFn = createServerFn({ method: "POST" })
  .validator((data: GraphPayload) => data)
  .handler(async ({ data }): Promise<RunResult> => {
    const validationErrors = validateGraph(data);
    if (validationErrors.length > 0) {
      return { order: [], results: [], graphError: validationErrors.join("; ") };
    }

    if (!(await checkServiceAvailable())) {
      return { order: [], results: [], graphError: "Processing service tidak dapat dihubungi" };
    }

    const sorted = topoSort(
      data.nodes.map((n) => ({ id: n.id })),
      data.edges.map((e) => ({ source: e.source, target: e.target })),
    );
    if (!sorted.ok) {
      return {
        order: [],
        results: [],
        graphError: "Graph mengandung siklus dan tidak bisa dijalankan",
      };
    }

    const artifactByOutput = new Map<string, string>();
    const results: NodeRunResult[] = [];

    for (const nodeId of sorted.order) {
      const node = data.nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      const spec = NODES_BY_ID[node.specId];
      const upstreamEdges = data.edges.filter((e) => e.target === nodeId);
      const blocked = upstreamEdges.some(
        (e) => results.find((r) => r.nodeId === e.source)?.status === "error",
      );
      if (blocked) {
        results.push({
          nodeId,
          status: "blocked",
          implemented: false,
          error: "Node upstream gagal",
        });
        continue;
      }

      const inputs: Record<string, string> = {};
      for (const edge of upstreamEdges) {
        const artifactId = artifactByOutput.get(`${edge.source}:${edge.sourceHandle}`);
        if (artifactId) inputs[edge.targetHandle] = artifactId;
      }

      try {
        const outputPorts = spec?.outputs.map((port) => port.id) ?? [];
        const result = await executeNode(node.specId, node.params, inputs, outputPorts);
        for (const [portId, artifactId] of Object.entries(result.outputs)) {
          artifactByOutput.set(`${nodeId}:${portId}`, artifactId);
        }
        results.push({
          nodeId,
          status: "success",
          implemented: result.implemented,
          summary: result.summary,
        });
      } catch (error) {
        results.push({
          nodeId,
          status: "error",
          implemented: false,
          error: error instanceof Error ? error.message : "Node gagal dieksekusi",
        });
      }
    }

    return { order: sorted.order, results };
  });
