import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface LogEntry {
  time: string;
  level: "info" | "success" | "warn" | "error";
  node?: string;
  message: string;
}

interface Props {
  logs: LogEntry[];
  onClear: () => void;
}

const LEVEL_COLOR: Record<LogEntry["level"], string> = {
  info: "text-sky-300",
  success: "text-emerald-300",
  warn: "text-amber-300",
  error: "text-red-300",
};

export function ConsolePanel({ logs, onClear }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  // A run appends a dozen lines at once; without this the newest output sits
  // below the fold and the panel looks frozen.
  useEffect(() => {
    if (!collapsed) endRef.current?.scrollIntoView({ block: "end" });
  }, [logs.length, collapsed]);

  if (collapsed) {
    return (
      <section className="shrink-0 border-t border-border bg-card">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Buka console"
          aria-expanded={false}
          className="flex h-9 w-full items-center gap-2.5 px-3 text-left transition-colors hover:bg-muted/60"
        >
          <Terminal aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
          <h2 className="eyebrow text-muted-foreground">Console</h2>
          <span className="eyebrow tabular text-muted-foreground/60">
            {String(logs.length).padStart(3, "0")}
          </span>
          {logs.length > 0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          )}
          <ChevronUp aria-hidden="true" className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </section>
    );
  }

  return (
    <section className="flex h-48 shrink-0 flex-col border-t border-border bg-ocean-deep text-slate-100">
      <header className="flex h-9 shrink-0 items-center gap-2.5 border-b border-white/10 px-3">
        <Terminal aria-hidden="true" className="h-3.5 w-3.5 text-sky-300" />
        <h2 className="eyebrow text-slate-400">Console</h2>
        <span className="eyebrow tabular text-slate-500">
          {String(logs.length).padStart(3, "0")}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={logs.length === 0}
          className="ml-auto h-6 gap-1.5 px-2 text-xs text-slate-300 hover:bg-white/10 hover:text-slate-100"
        >
          Clear
        </Button>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Tutup console"
          aria-expanded={true}
          className="grid h-7 w-7 place-items-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
        {logs.length === 0 ? (
          <p className="text-slate-500">Belum ada log. Muat template atau jalankan pipeline.</p>
        ) : (
          <ol className="space-y-0.5">
            {logs.map((log, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="tabular shrink-0 text-slate-500">{log.time}</span>
                <span className={cn("w-14 shrink-0 uppercase", LEVEL_COLOR[log.level])}>
                  {log.level}
                </span>
                {log.node && <span className="shrink-0 text-sky-300">[{log.node}]</span>}
                <span className="break-words whitespace-pre-wrap">{log.message}</span>
              </li>
            ))}
          </ol>
        )}
        <div ref={endRef} />
      </div>
    </section>
  );
}
