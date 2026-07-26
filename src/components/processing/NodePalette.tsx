import { useMemo, useState } from "react";
import { CATEGORIES, NODES, type CategoryId } from "@/lib/nodes-catalog";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function NodePalette() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<CategoryId, boolean>>({
    io: true, preproc: true, field: false, ml: false, accuracy: false, temporal: false, utility: false,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NODES.filter((n) =>
      !q || n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q),
    );
  }, [query]);

  const onDragStart = (e: React.DragEvent, specId: string) => {
    e.dataTransfer.setData("application/x-node-spec", specId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-3 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Node Palette
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari node…"
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {CATEGORIES.map((cat) => {
          const items = filtered.filter((n) => n.category === cat.id);
          if (query && items.length === 0) return null;
          const isOpen = query ? true : open[cat.id];
          return (
            <div key={cat.id} className="mb-1">
              <button
                onClick={() => setOpen((s) => ({ ...s, [cat.id]: !s[cat.id] }))}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/60"
              >
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <span className="text-accent">{cat.code}.</span>
                <span className="text-foreground">{cat.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{items.length}</span>
              </button>
              {isOpen && (
                <ul className="mt-0.5">
                  {items.map((node) => (
                    <li key={node.id}>
                      <div
                        draggable
                        onDragStart={(e) => onDragStart(e, node.id)}
                        className={cn(
                          "cursor-grab active:cursor-grabbing mx-2 my-0.5 px-2 py-1.5 rounded",
                          "text-xs border border-transparent hover:border-border hover:bg-muted",
                        )}
                        title={node.description}
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

      <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
        Drag node ke kanvas untuk memulai. Sambungkan port berwarna sesuai tipe data.
      </div>
    </aside>
  );
}
