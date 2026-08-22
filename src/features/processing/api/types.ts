export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type ArtifactKind = "raster" | "vector" | "table";

export interface ArtifactRef {
  id: string;
  kind: ArtifactKind;
  filename: string;
}

export interface GraphNodeInput {
  id: string;
  specId: string;
  params: Record<string, string | number | boolean>;
}

export interface GraphEdgeInput {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface GraphPayload {
  nodes: GraphNodeInput[];
  edges: GraphEdgeInput[];
}

export interface NodeRunResult {
  nodeId: string;
  status: "success" | "error";
  implemented: boolean;
  summary?: Record<string, JsonValue>;
  error?: string;
}

export interface RunResult {
  order: string[];
  results: NodeRunResult[];
  graphError?: string;
}
