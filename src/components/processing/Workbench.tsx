import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow, ReactFlowProvider, addEdge, Background, BackgroundVariant, Controls, MiniMap,
  useEdgesState, useNodesState, type Connection, type Edge, type Node, type NodeMouseHandler,
  type OnConnect, type NodeTypes,
} from "@xyflow/react";
import { WorkbenchNode, type WorkbenchNodeData } from "./WorkbenchNode";
import { NodePalette } from "./NodePalette";
import { PropertyPanel } from "./PropertyPanel";
import { ConsolePanel, type LogEntry } from "./ConsolePanel";
import { ResultViewer } from "./ResultViewer";
import { Toolbar } from "./Toolbar";
import { NODES_BY_ID, PORT_COLORS } from "@/lib/nodes-catalog";
import { TEMPLATES } from "@/lib/pipeline-templates";
import { toast } from "sonner";

const nodeTypes: NodeTypes = { workbench: WorkbenchNode };

const STORAGE_KEY = "bcrg.workbench.v1";

let idCounter = 1;
const nextId = () => `wn_${Date.now().toString(36)}_${idCounter++}`;

function nowTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

function buildDefaultParams(specId: string): Record<string, string | number | boolean> {
  const spec = NODES_BY_ID[specId];
  if (!spec) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const p of spec.params) if (p.default !== undefined) out[p.key] = p.default;
  return out;
}

function InnerWorkbench() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [viewer, setViewer] = useState<{ nodeId: string; specId: string } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const log = useCallback((entry: Omit<LogEntry, "time">) => {
    setLogs((prev) => [...prev, { ...entry, time: nowTime() }].slice(-500));
  }, []);

  const onConnect: OnConnect = useCallback((conn: Connection) => {
    const src = nodes.find((n) => n.id === conn.source);
    const tgt = nodes.find((n) => n.id === conn.target);
    if (!src || !tgt) return;
    const srcSpec = NODES_BY_ID[(src.data as WorkbenchNodeData).specId];
    const tgtSpec = NODES_BY_ID[(tgt.data as WorkbenchNodeData).specId];
    const srcPort = srcSpec.outputs.find((p) => p.id === conn.sourceHandle);
    const tgtPort = tgtSpec.inputs.find((p) => p.id === conn.targetHandle);
    if (!srcPort || !tgtPort) return;
    if (srcPort.type !== tgtPort.type && srcPort.type !== "any" && tgtPort.type !== "any") {
      toast.error(`Port tidak kompatibel: ${srcPort.type} → ${tgtPort.type}`);
      log({ level: "warn", message: `Koneksi ditolak — ${srcPort.type} tidak cocok dengan ${tgtPort.type}` });
      return;
    }
    setEdges((eds) => addEdge({
      ...conn,
      style: { stroke: PORT_COLORS[srcPort.type], strokeWidth: 2 },
      animated: false,
    }, eds));
  }, [nodes, setEdges, log]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const specId = e.dataTransfer.getData("application/x-node-spec");
    if (!specId || !NODES_BY_ID[specId]) return;
    const bounds = wrapperRef.current?.getBoundingClientRect();
    const x = e.clientX - (bounds?.left ?? 0);
    const y = e.clientY - (bounds?.top ?? 0);
    const id = nextId();
    setNodes((nds) => [...nds, {
      id, type: "workbench",
      position: { x: x - 100, y: y - 30 },
      data: { specId, params: buildDefaultParams(specId), status: "idle" } as WorkbenchNodeData,
    }]);
    log({ level: "info", message: `Node ditambahkan: ${NODES_BY_ID[specId].name}` });
  }, [setNodes, log]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const onNodeDoubleClick: NodeMouseHandler = useCallback((_, node) => {
    const specId = (node.data as WorkbenchNodeData).specId;
    setViewer({ nodeId: node.id, specId });
  }, []);

  const onParamChange = useCallback((nodeId: string, key: string, value: string | number | boolean) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId
      ? { ...n, data: { ...(n.data as WorkbenchNodeData), params: { ...(n.data as WorkbenchNodeData).params, [key]: value } } }
      : n));
  }, [setNodes]);

  const setNodeStatus = useCallback((id: string, status: WorkbenchNodeData["status"]) => {
    setNodes((nds) => nds.map((n) => n.id === id
      ? { ...n, data: { ...(n.data as WorkbenchNodeData), status } }
      : n));
  }, [setNodes]);

  const runAll = useCallback(async () => {
    if (nodes.length === 0) {
      toast.info("Kanvas kosong. Muat template atau tambahkan node.");
      return;
    }
    // topological-ish order: use current node list, mock execution.
    log({ level: "info", message: `▶ Menjalankan pipeline (${nodes.length} node)…` });
    for (const n of nodes) {
      const spec = NODES_BY_ID[(n.data as WorkbenchNodeData).specId];
      setNodeStatus(n.id, "running");
      log({ level: "info", node: spec.name, message: "Running…" });
      await new Promise((r) => setTimeout(r, 220 + Math.random() * 260));
      setNodeStatus(n.id, "success");
      const detail =
        spec.id === "rf-train" ? "OOB accuracy = 0.882, Kappa = 0.845"
        : spec.id === "confusion-matrix" ? "Overall Accuracy = 90.4%, Kappa = 0.87"
        : spec.id === "sunglint" ? "R² per band: B2=0.71, B3=0.68, B4=0.63"
        : spec.id === "water-column" ? "ki/kj ratio B2/B3 = 0.87"
        : "Success";
      log({ level: "success", node: spec.name, message: detail });
    }
    log({ level: "success", message: "✓ Pipeline selesai." });
    toast.success("Pipeline selesai dijalankan.");
  }, [nodes, log, setNodeStatus]);

  const loadTemplate = useCallback((templateId: string) => {
    const t = TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    const idMap = new Map<string, string>();
    const newNodes: Node[] = t.nodes.map((tn) => {
      const id = nextId();
      idMap.set(tn.id, id);
      return {
        id, type: "workbench",
        position: { x: tn.x, y: tn.y },
        data: { specId: tn.specId, params: buildDefaultParams(tn.specId), status: "idle" } as WorkbenchNodeData,
      };
    });
    const newEdges: Edge[] = t.edges.map((te, i) => {
      const src = idMap.get(te.source)!;
      const tgt = idMap.get(te.target)!;
      const specSrc = NODES_BY_ID[t.nodes.find((n) => n.id === te.source)!.specId];
      const port = specSrc.outputs.find((p) => p.id === te.sourceHandle);
      return {
        id: `e_${i}_${Date.now()}`,
        source: src, target: tgt,
        sourceHandle: te.sourceHandle, targetHandle: te.targetHandle,
        style: { stroke: PORT_COLORS[port?.type ?? "any"], strokeWidth: 2 },
      };
    });
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedId(null);
    log({ level: "info", message: `Template dimuat: ${t.name}` });
    toast.success(`Template "${t.name}" dimuat.`);
  }, [setNodes, setEdges, log]);

  const clearCanvas = useCallback(() => {
    setNodes([]); setEdges([]); setSelectedId(null);
    log({ level: "info", message: "Kanvas dibersihkan." });
  }, [setNodes, setEdges, log]);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
    toast.success("Workflow tersimpan di browser.");
    log({ level: "success", message: "Workflow disimpan (localStorage)." });
  }, [nodes, edges, log]);

  const load = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { toast.info("Belum ada workflow tersimpan."); return; }
    try {
      const parsed = JSON.parse(raw) as { nodes: Node[]; edges: Edge[] };
      setNodes(parsed.nodes ?? []);
      setEdges(parsed.edges ?? []);
      toast.success("Workflow dimuat.");
      log({ level: "success", message: "Workflow dimuat dari localStorage." });
    } catch {
      toast.error("Gagal memuat workflow.");
    }
  }, [setNodes, setEdges, log]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  // Delete key removes selected node/edge
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        setNodes((nds) => nds.filter((n) => n.id !== selectedId));
        setEdges((eds) => eds.filter((ed) => ed.source !== selectedId && ed.target !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, setNodes, setEdges]);

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        onNew={clearCanvas}
        onSave={save}
        onLoad={load}
        onRunAll={runAll}
        onClear={clearCanvas}
        onLoadTemplate={loadTemplate}
      />
      <div className="flex flex-1 min-h-0">
        <NodePalette />
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={wrapperRef} className="flex-1 min-h-0 workbench" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              onPaneClick={() => setSelectedId(null)}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="oklch(0.35 0.05 240)" />
              <Controls />
              <MiniMap
                pannable zoomable
                nodeColor={() => "var(--teal)"}
                maskColor="oklch(0.14 0.03 245 / 0.7)"
              />
            </ReactFlow>
          </div>
          <ConsolePanel logs={logs} onClear={() => setLogs([])} />
        </div>
        <PropertyPanel node={selectedNode} onParamChange={onParamChange} />
      </div>
      <ResultViewer
        nodeId={viewer?.nodeId ?? null}
        specId={viewer?.specId ?? null}
        onClose={() => setViewer(null)}
      />
    </div>
  );
}

export function Workbench() {
  return (
    <ReactFlowProvider>
      <InnerWorkbench />
    </ReactFlowProvider>
  );
}
