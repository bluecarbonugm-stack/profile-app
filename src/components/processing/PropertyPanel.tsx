import type { Node } from "@xyflow/react";
import { NODES_BY_ID, PORT_COLORS } from "@/lib/nodes-catalog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { WorkbenchNodeData } from "./WorkbenchNode";

interface Props {
  node: Node | null;
  onParamChange: (nodeId: string, key: string, value: string | number | boolean) => void;
}

export function PropertyPanel({ node, onParamChange }: Props) {
  if (!node) {
    return (
      <aside className="w-80 border-l border-border bg-card p-4 text-xs text-muted-foreground">
        <div className="text-[10px] uppercase tracking-wider mb-2">Properties</div>
        <p>Pilih sebuah node di kanvas untuk melihat & mengedit parameter.</p>
      </aside>
    );
  }
  const data = node.data as WorkbenchNodeData;
  const spec = NODES_BY_ID[data.specId];
  if (!spec) return null;
  const value = (key: string) => (data.params[key] ?? spec.params.find((p) => p.key === key)?.default ?? "") as string | number | boolean;

  return (
    <aside className="w-80 h-full flex flex-col border-l border-border bg-card">
      <div className="border-b border-border p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {spec.category}
        </div>
        <h3 className="text-sm font-semibold mt-1">{spec.name}</h3>
        <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{spec.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {spec.params.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Node ini tidak memerlukan parameter.</p>
        )}
        {spec.params.map((param) => (
          <div key={param.key} className="space-y-1.5">
            <Label className="text-[11px] font-medium">{param.label}</Label>
            {param.type === "text" && (
              <Input
                className="h-8 text-xs"
                value={String(value(param.key) ?? "")}
                onChange={(e) => onParamChange(node.id, param.key, e.target.value)}
              />
            )}
            {param.type === "number" && (
              <Input
                type="number"
                className="h-8 text-xs"
                value={Number(value(param.key) ?? 0)}
                onChange={(e) => onParamChange(node.id, param.key, Number(e.target.value))}
              />
            )}
            {param.type === "select" && param.options && (
              <Select
                value={String(value(param.key) ?? "")}
                onValueChange={(v) => onParamChange(node.id, param.key, v)}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {param.options.map((o) => (
                    <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {param.type === "checkbox" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={Boolean(value(param.key))}
                  onCheckedChange={(v) => onParamChange(node.id, param.key, Boolean(v))}
                />
                <span className="text-xs text-muted-foreground">Aktif</span>
              </div>
            )}
            {param.help && <p className="text-[10px] text-muted-foreground">{param.help}</p>}
          </div>
        ))}

        <div className="pt-3 mt-3 border-t border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Ports</div>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <div className="text-muted-foreground mb-1">Input</div>
              {spec.inputs.length === 0 && <span className="text-muted-foreground italic">—</span>}
              {spec.inputs.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 mb-0.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: PORT_COLORS[p.type] }} />
                  {p.label}
                </div>
              ))}
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Output</div>
              {spec.outputs.length === 0 && <span className="text-muted-foreground italic">—</span>}
              {spec.outputs.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 mb-0.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: PORT_COLORS[p.type] }} />
                  {p.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
