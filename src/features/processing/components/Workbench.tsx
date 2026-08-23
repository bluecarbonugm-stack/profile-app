import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type OnConnect,
  type NodeTypes,
} from "@xyflow/react";
import { WorkbenchNode, type WorkbenchNodeData } from "./WorkbenchNode";
import { NodePalette } from "./NodePalette";
import { PropertyPanel } from "./PropertyPanel";
import { ConsolePanel, type LogEntry } from "./ConsolePanel";
import { ResultViewer } from "./ResultViewer";
import { Toolbar } from "./Toolbar";
import { NODES_BY_ID, PORT_COLORS } from "@/features/processing/data/nodes-catalog";
import { TEMPLATES } from "@/features/processing/data/pipeline-templates";
import { runGraphFn } from "@/features/processing";
import type { NodeRunResult, RunResult } from "@/features/processing";
import { toast } from "sonner";
import { MousePointerSquareDashed } from "lucide-react";

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
  const [runResults, setRunResults] = useState<NodeRunResult[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const log = useCallback((entry: Omit<LogEntry, "time">) => {
    setLogs((prev) => [...prev, { ...entry, time: nowTime() }].slice(-500));
  }, []);

  const onConnect: OnConnect = useCallback(
    (conn: Connection) => {
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
        log({
          level: "warn",
          message: `Koneksi ditolak — ${srcPort.type} tidak cocok dengan ${tgtPort.type}`,
        });
        return;
      }
      setEdges((eds) =>
        addEdge(
          {
            ...conn,
            style: { stroke: PORT_COLORS[srcPort.type], strokeWidth: 2 },
            animated: false,
          },
          eds,
        ),
      );
    },
    [nodes, setEdges, log],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const specId = e.dataTransfer.getData("application/x-node-spec");
      if (!specId || !NODES_BY_ID[specId]) return;
      const bounds = wrapperRef.current?.getBoundingClientRect();
      const x = e.clientX - (bounds?.left ?? 0);
      const y = e.clientY - (bounds?.top ?? 0);
      const id = nextId();
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "workbench",
          position: { x: x - 100, y: y - 30 },
          data: { specId, params: buildDefaultParams(specId), status: "idle" } as WorkbenchNodeData,
        },
      ]);
      log({ level: "info", message: `Node ditambahkan: ${NODES_BY_ID[specId].name}` });
    },
    [setNodes, log],
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const onNodeDoubleClick: NodeMouseHandler = useCallback((_, node) => {
    const specId = (node.data as WorkbenchNodeData).specId;
    setViewer({ nodeId: node.id, specId });
  }, []);

  const onParamChange = useCallback(
    (nodeId: string, key: string, value: string | number | boolean) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...(n.data as WorkbenchNodeData),
                  params: { ...(n.data as WorkbenchNodeData).params, [key]: value },
                },
              }
            : n,
        ),
      );
    },
    [setNodes],
  );

  const runAll = useCallback(async () => {
    const graphNodes = nodes.map((n) => ({
      id: n.id,
      specId: (n.data as WorkbenchNodeData).specId,
      params: (n.data as WorkbenchNodeData).params,
    }));
    const graphEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle ?? "",
      target: e.target,
      targetHandle: e.targetHandle ?? "",
    }));

    setNodes((current) =>
      current.map((n) => ({ ...n, data: { ...(n.data as WorkbenchNodeData), status: "running" } })),
    );
    log({ level: "info", message: "Menjalankan seluruh pipeline..." });

    let result: RunResult;
    try {
      result = await runGraphFn({ data: { nodes: graphNodes, edges: graphEdges } });
    } catch (error) {
      log({
        level: "error",
        message: error instanceof Error ? error.message : "Gagal menjalankan pipeline",
      });
      setNodes((current) =>
        current.map((n) => ({ ...n, data: { ...(n.data as WorkbenchNodeData), status: "error" } })),
      );
      setRunResults([]);
      return;
    }

    if (result.graphError) {
      log({ level: "error", message: result.graphError });
      setNodes((current) =>
        current.map((n) => ({ ...n, data: { ...(n.data as WorkbenchNodeData), status: "idle" } })),
      );
      setRunResults([]);
      return;
    }

    setNodes((current) =>
      current.map((n) => {
        const nodeResult = result.results.find((r) => r.nodeId === n.id);
        if (!nodeResult)
          return { ...n, data: { ...(n.data as WorkbenchNodeData), status: "idle" } };
        return {
          ...n,
          data: {
            ...(n.data as WorkbenchNodeData),
            status:
              nodeResult.status === "error" && nodeResult.error === "Node upstream gagal"
                ? "blocked"
                : nodeResult.status,
          },
        };
      }),
    );
    setRunResults(result.results);

    for (const nodeResult of result.results) {
      if (nodeResult.status === "success") {
        log({
          level: nodeResult.implemented ? "success" : "info",
          message: nodeResult.implemented
            ? `${nodeResult.nodeId}: selesai`
            : `${nodeResult.nodeId}: belum diimplementasikan, data diteruskan apa adanya`,
        });
      } else {
        log({ level: "error", message: `${nodeResult.nodeId}: ${nodeResult.error ?? "gagal"}` });
      }
    }
  }, [nodes, edges, log, setNodes]);

  const loadTemplate = useCallback(
    (templateId: string) => {
      const t = TEMPLATES.find((x) => x.id === templateId);
      if (!t) return;
      const idMap = new Map<string, string>();
      const newNodes: Node[] = t.nodes.map((tn) => {
        const id = nextId();
        idMap.set(tn.id, id);
        return {
          id,
          type: "workbench",
          position: { x: tn.x, y: tn.y },
          data: {
            specId: tn.specId,
            params: buildDefaultParams(tn.specId),
            status: "idle",
          } as WorkbenchNodeData,
        };
      });
      const newEdges: Edge[] = t.edges.map((te, i) => {
        const src = idMap.get(te.source)!;
        const tgt = idMap.get(te.target)!;
        const specSrc = NODES_BY_ID[t.nodes.find((n) => n.id === te.source)!.specId];
        const port = specSrc.outputs.find((p) => p.id === te.sourceHandle);
        return {
          id: `e_${i}_${Date.now()}`,
          source: src,
          target: tgt,
          sourceHandle: te.sourceHandle,
          targetHandle: te.targetHandle,
          style: { stroke: PORT_COLORS[port?.type ?? "any"], strokeWidth: 2 },
        };
      });
      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedId(null);
      log({ level: "info", message: `Template dimuat: ${t.name}` });
      toast.success(`Template "${t.name}" dimuat.`);
    },
    [setNodes, setEdges, log],
  );

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
    log({ level: "info", message: "Kanvas dibersihkan." });
  }, [setNodes, setEdges, log]);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
    toast.success("Workflow tersimpan di browser.");
    log({ level: "success", message: "Workflow disimpan (localStorage)." });
  }, [nodes, edges, log]);

  const load = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      toast.info("Belum ada workflow tersimpan.");
      return;
    }
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
      <div className="flex min-h-0 flex-1">
        <NodePalette />
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            ref={wrapperRef}
            className="workbench relative min-h-0 flex-1"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
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
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="oklch(0.35 0.05 240)"
              />
              <Controls />
              <MiniMap
                pannable
                zoomable
                nodeColor={() => "var(--teal)"}
                maskColor="oklch(0.14 0.03 245 / 0.7)"
              />
            </ReactFlow>
            {nodes.length === 0 && <EmptyCanvasHint />}
          </div>
          <ConsolePanel logs={logs} onClear={() => setLogs([])} />
        </div>
        <PropertyPanel node={selectedNode} onParamChange={onParamChange} />
      </div>
      <ResultViewer
        nodeId={viewer?.nodeId ?? null}
        specId={viewer?.specId ?? null}
        onClose={() => setViewer(null)}
        result={runResults.find((r) => r.nodeId === viewer?.nodeId)}
      />
    </div>
  );
}

/**
 * Shown over the canvas while it is empty. `pointer-events-none` is essential:
 * the hint sits on top of the drop target, so it must not intercept the drag it
 * is asking for.
 */
function EmptyCanvasHint() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center p-8">
      <div className="max-w-xs text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-md border border-dashed border-border bg-card/60 text-accent">
          <MousePointerSquareDashed className="h-5 w-5" />
        </span>
        <p className="eyebrow mt-4 text-accent">Kanvas kosong</p>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          Tarik node dari palette di kiri, atau muat salah satu preset lewat{" "}
          <span className="text-foreground">Template</span> di toolbar.
        </p>
      </div>
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
