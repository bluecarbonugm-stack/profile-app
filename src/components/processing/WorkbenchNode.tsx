import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NODES_BY_ID, PORT_COLORS, type PortType } from "@/lib/nodes-catalog";
import { cn } from "@/lib/utils";

export interface WorkbenchNodeData {
  specId: string;
  params: Record<string, string | number | boolean>;
  status?: "idle" | "running" | "success" | "error";
  [key: string]: unknown;
}

const STATUS_COLORS: Record<NonNullable<WorkbenchNodeData["status"]>, string> = {
  idle: "bg-muted-foreground/40",
  running: "bg-amber-400 animate-pulse",
  success: "bg-emerald-400",
  error: "bg-destructive",
};

function PortDot({ type }: { type: PortType }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/40"
      style={{ background: PORT_COLORS[type] }}
    />
  );
}

export function WorkbenchNode({ data, selected }: NodeProps) {
  const d = data as WorkbenchNodeData;
  const spec = NODES_BY_ID[d.specId];
  if (!spec) return null;
  const status = d.status ?? "idle";

  const inputSlots = Math.max(spec.inputs.length, 1);
  const outputSlots = Math.max(spec.outputs.length, 1);
  const height = 20 + Math.max(inputSlots, outputSlots) * 22;

  return (
    <div
      className={cn(
        "rounded-md border bg-card/95 backdrop-blur text-card-foreground shadow-lg min-w-[210px]",
        "border-border transition-colors",
        selected && "border-accent ring-2 ring-accent/40",
      )}
      style={{ minHeight: 60 + height }}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className={cn("h-2 w-2 rounded-full", STATUS_COLORS[status])} />
        <div className="text-[13px] font-semibold leading-tight">{spec.name}</div>
      </div>
      <div className="px-3 py-2 text-[11px] text-muted-foreground leading-snug line-clamp-2">
        {spec.description}
      </div>

      {/* Input handles */}
      {spec.inputs.map((port, i) => {
        const top = 60 + i * 22;
        return (
          <div key={port.id} className="absolute left-0 text-[10px]" style={{ top }}>
            <Handle
              id={port.id}
              type="target"
              position={Position.Left}
              style={{ background: PORT_COLORS[port.type], top: 6 }}
            />
            <span className="ml-4 flex items-center gap-1 text-muted-foreground">
              <PortDot type={port.type} />
              {port.label}
            </span>
          </div>
        );
      })}

      {/* Output handles */}
      {spec.outputs.map((port, i) => {
        const top = 60 + i * 22;
        return (
          <div key={port.id} className="absolute right-0 text-[10px]" style={{ top }}>
            <span className="mr-4 flex items-center gap-1 text-muted-foreground justify-end">
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
        );
      })}
    </div>
  );
}
