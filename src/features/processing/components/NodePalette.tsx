import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

import { CATEGORIES, NODES, type CategoryId } from "@/features/processing/data/nodes-catalog";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

export function NodePalette() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<CategoryId, boolean>>({
    io: true,
    preproc: true,
    field: false,
    ml: false,
    accuracy: false,
    temporal: false,
    utility: false,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NODES;
    return NODES.filter(
      (n) => n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q),
    );
  }, [query]);

  const onDragStart = (e: React.DragEvent, specId: string) => {
    e.dataTransfer.setData("application/x-node-spec", specId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-card">
      <div className="shrink-0 border-b border-border p-3">
        <h2 className="eyebrow mb-2.5 text-muted-foreground">Node Palette</h2>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari node…"
            aria-label="Cari node"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Tidak ada node yang cocok dengan “{query}”.
          </p>
        )}

        {CATEGORIES.map((cat) => {
          const items = filtered.filter((n) => n.category === cat.id);
          if (items.length === 0) return null;
          // While searching, every matching group is forced open - collapsed
          // results look like no results.
          const isOpen = query ? true : open[cat.id];

          return (
            <div key={cat.id} className="mb-0.5">
              <button
                type="button"
                onClick={() => setOpen((s) => ({ ...s, [cat.id]: !s[cat.id] }))}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/60"
              >
                {isOpen ? (
                  <ChevronDown
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 text-muted-foreground"
                  />
                ) : (
                  <ChevronRight
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 text-muted-foreground"
                  />
                )}
                <span className="eyebrow text-accent">{cat.code}</span>
                <span className="truncate text-xs font-medium">{cat.label}</span>
                <span className="eyebrow tabular ml-auto text-muted-foreground/60">
                  {items.length}
                </span>
              </button>

              {isOpen && (
                <ul className="pb-1">
                  {items.map((node) => (
                    <li key={node.id}>
                      <div
                        draggable
                        onDragStart={(e) => onDragStart(e, node.id)}
                        title={node.description}
                        className={cn(
                          "mx-2 my-0.5 cursor-grab rounded border border-transparent px-2.5 py-1.5",
                          "text-xs transition-colors hover:border-border hover:bg-muted active:cursor-grabbing",
                        )}
                      >
                        {node.name}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className="shrink-0 border-t border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
        Drag node ke kanvas untuk memulai. Sambungkan port berwarna sesuai tipe data.
      </p>
    </aside>
  );
}
