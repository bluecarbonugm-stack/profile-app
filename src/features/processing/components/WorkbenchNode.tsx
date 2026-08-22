import { Handle, Position, type NodeProps } from "@xyflow/react";

import { NODES_BY_ID, PORT_COLORS, type PortType } from "@/features/processing/data/nodes-catalog";
import { cn } from "@/shared/lib/utils";

export interface WorkbenchNodeData {
  specId: string;
  params: Record<string, string | number | boolean>;
  status?: "idle" | "running" | "success" | "error" | "blocked";
  [key: string]: unknown;
}

type Status = NonNullable<WorkbenchNodeData["status"]>;

const STATUS_COLOR: Record<Status, string> = {
  idle: "bg-muted-foreground/40",
  running: "bg-amber-400 animate-pulse",
  success: "bg-emerald-400",
  error: "bg-destructive",
  blocked: "bg-muted-foreground/40",
};

const STATUS_LABEL: Record<Status, string> = {
  idle: "Belum dijalankan",
  running: "Sedang berjalan",
  success: "Selesai",
  error: "Gagal",
  blocked: "Diblokir",
};

/** Vertical rhythm of the port rows, shared by the labels and the handles. */
const HEADER_OFFSET = 62;
const PORT_SPACING = 22;

function PortDot({ type }: { type: PortType }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2 w-2 shrink-0 rounded-full ring-1 ring-black/40"
      style={{ background: PORT_COLORS[type] }}
    />
  );
}

export function WorkbenchNode({ data, selected }: NodeProps) {
  const d = data as WorkbenchNodeData;
  const spec = NODES_BY_ID[d.specId];
  if (!spec) return null;

  const status = d.status ?? "idle";
  const rows = Math.max(spec.inputs.length, spec.outputs.length, 1);

  return (
    <div
      className={cn(
        "min-w-[216px] rounded-md border bg-card/95 text-card-foreground shadow-lg backdrop-blur-sm",
        "transition-colors",
        selected ? "border-accent ring-2 ring-accent/35" : "border-border",
      )}
      style={{ minHeight: HEADER_OFFSET + rows * PORT_SPACING + 12 }}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span
          title={STATUS_LABEL[status]}
          className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_COLOR[status])}
        />
        <span className="truncate text-[13px] font-semibold leading-tight">{spec.name}</span>
      </div>

      <p className="line-clamp-2 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
        {spec.description}
      </p>

      {spec.inputs.map((port, i) => (
        <div
          key={port.id}
          className="absolute left-0 flex items-center gap-1.5 text-[10px] text-muted-foreground"
          style={{ top: HEADER_OFFSET + i * PORT_SPACING }}
        >
          <Handle
            id={port.id}
            type="target"
            position={Position.Left}
            style={{ background: PORT_COLORS[port.type], top: 6 }}
          />
          <span className="ml-4 flex items-center gap-1.5">
            <PortDot type={port.type} />
            {port.label}
          </span>
        </div>
      ))}

      {spec.outputs.map((port, i) => (
        <div
          key={port.id}
          className="absolute right-0 flex items-center gap-1.5 text-[10px] text-muted-foreground"
          style={{ top: HEADER_OFFSET + i * PORT_SPACING }}
        >
          <span className="mr-4 flex items-center gap-1.5">
            {port.label}
            <PortDot type={port.type} />
          </span>
          <Handle
            id={port.id}
            type="source"
            position={Position.Right}
            style={{ background: PORT_COLORS[port.type], top: 6 }}
          />
        </div>
      ))}
    </div>
  );
}
