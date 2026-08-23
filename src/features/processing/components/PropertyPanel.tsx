import type { Node } from "@xyflow/react";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  CATEGORIES,
  NODES_BY_ID,
  PORT_COLORS,
  type Port,
} from "@/features/processing/data/nodes-catalog";
import { uploadArtifactFn } from "@/features/processing";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { WorkbenchNodeData } from "./WorkbenchNode";

interface Props {
  node: Node | null;
  onParamChange: (nodeId: string, key: string, value: string | number | boolean) => void;
}

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, `${c.code} · ${c.label}`]));

export function PropertyPanel({ node, onParamChange }: Props) {
  const data = node?.data as WorkbenchNodeData | undefined;
  const spec = data ? NODES_BY_ID[data.specId] : undefined;

  if (!node || !data || !spec) {
    return (
      <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-card">
        <header className="flex h-9 shrink-0 items-center border-b border-border px-4">
          <h2 className="eyebrow text-muted-foreground">Properties</h2>
        </header>
        <div className="grid flex-1 place-items-center p-6">
          <div className="text-center">
            <SlidersHorizontal
              aria-hidden="true"
              className="mx-auto h-5 w-5 text-muted-foreground/50"
            />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Pilih sebuah node di kanvas untuk melihat dan mengedit parameternya.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const valueOf = (key: string) =>
    (data.params[key] ?? spec.params.find((p) => p.key === key)?.default ?? "") as
      string | number | boolean;

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-card">
      <header className="shrink-0 border-b border-border p-4">
        <p className="eyebrow text-accent">{CATEGORY_LABEL[spec.category] ?? spec.category}</p>
        <h2 className="mt-2 text-sm font-semibold">{spec.name}</h2>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          {spec.description}
        </p>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {spec.params.length === 0 ? (
          <p className="text-xs text-muted-foreground">Node ini tidak memerlukan parameter.</p>
        ) : (
          spec.params.map((param) => {
            const id = `${node.id}-${param.key}`;
            return (
              <div key={param.key} className="space-y-2">
                <label htmlFor={id} className="eyebrow block text-muted-foreground">
                  {param.label}
                </label>

                {param.type === "text" && (
                  <Input
                    id={id}
                    className="h-8 text-xs"
                    value={String(valueOf(param.key) ?? "")}
                    onChange={(e) => onParamChange(node.id, param.key, e.target.value)}
                  />
                )}

                {param.type === "number" && (
                  <Input
                    id={id}
                    type="number"
                    className="tabular h-8 text-xs"
                    value={Number(valueOf(param.key) ?? 0)}
                    onChange={(e) => onParamChange(node.id, param.key, Number(e.target.value))}
                  />
                )}

                {param.type === "select" && param.options && (
                  <Select
                    value={String(valueOf(param.key) ?? "")}
                    onValueChange={(v) => onParamChange(node.id, param.key, v)}
                  >
                    <SelectTrigger id={id} className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {param.options.map((o) => (
                        <SelectItem key={o} value={o} className="text-xs">
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {param.type === "file" && (
                  <div className="space-y-1.5">
                    <Input
                      id={id}
                      type="file"
                      accept={param.accept}
                      className="h-8 text-xs file:text-xs"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const kind =
                          data.specId === "raster-input"
                            ? "raster"
                            : data.specId === "vector-input"
                              ? "vector"
                              : "table";
                        const formData = new FormData();
                        formData.set("file", file);
                        formData.set("kind", kind);
                        try {
                          const artifact = await uploadArtifactFn({ data: formData });
                          onParamChange(node.id, param.key, artifact.id);
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Gagal mengunggah file",
                          );
                        }
                      }}
                    />
                    {typeof valueOf(param.key) === "string" &&
                    valueOf(param.key) !== param.default &&
                    valueOf(param.key) !== "" ? (
                      <p className="text-[11px] text-muted-foreground">
                        File terunggah (id: {String(valueOf(param.key)).slice(0, 8)}…)
                      </p>
                    ) : null}
                  </div>
                )}

                {param.type === "checkbox" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={Boolean(valueOf(param.key))}
                      onCheckedChange={(v) => onParamChange(node.id, param.key, Boolean(v))}
                    />
                    <label htmlFor={id} className="text-xs text-muted-foreground">
                      Aktif
                    </label>
                  </div>
                )}

                {param.help && (
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{param.help}</p>
                )}
              </div>
            );
          })
        )}

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
          <PortList title="Input" ports={spec.inputs} />
          <PortList title="Output" ports={spec.outputs} />
        </div>
      </div>
    </aside>
  );
}

function PortList({ title, ports }: { title: string; ports: Port[] }) {
  return (
    <div>
      <h3 className="eyebrow mb-2.5 text-muted-foreground">{title}</h3>
      {ports.length === 0 ? (
        <p className="text-[11px] text-muted-foreground/60">—</p>
      ) : (
        <ul className="space-y-1.5">
          {ports.map((port) => (
            <li key={port.id} className="flex items-center gap-2 text-[11px]">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: PORT_COLORS[port.type] }}
              />
              <span className="truncate">{port.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
