// Public surface of the Web Processing feature. Routes and shared code should
// import from here rather than reaching into the folder.

export { Workbench } from "./components/Workbench";
export { CATEGORIES, NODES, NODES_BY_ID, PORT_COLORS } from "./data/nodes-catalog";
export { TEMPLATES } from "./data/pipeline-templates";
export type { Category, CategoryId, NodeSpec, Param, Port, PortType } from "./data/nodes-catalog";
export { uploadArtifactFn } from "./api/upload";
export { runGraphFn } from "./api/run";
export type {
  ArtifactKind,
  ArtifactRef,
  GraphPayload,
  NodeRunResult,
  RunResult,
} from "./api/types";
