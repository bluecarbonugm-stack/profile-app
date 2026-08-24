import { useEffect, useRef } from "react";
import { Terminal, X } from "lucide-react";

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
  const endRef = useRef<HTMLDivElement>(null);

  // A run appends a dozen lines at once; without this the newest output sits
  // below the fold and the panel looks frozen.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [logs.length]);

  return (
    <section className="flex h-48 shrink-0 flex-col border-t border-border bg-[oklch(0.13_0.03_245)] text-slate-100">
      <header className="flex h-9 shrink-0 items-center gap-2.5 border-b border-border px-3">
        <Terminal aria-hidden="true" className="h-3.5 w-3.5 text-teal" />
        <h2 className="eyebrow text-muted-foreground">Console</h2>
        <span className="eyebrow tabular text-muted-foreground/60">
          {String(logs.length).padStart(3, "0")}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={logs.length === 0}
          className="ml-auto h-6 gap-1.5 px-2 text-xs text-muted-foreground"
        >
          <X className="h-3 w-3" /> Clear
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
        {logs.length === 0 ? (
          <p className="text-muted-foreground/70">
            Belum ada log. Muat template atau jalankan pipeline untuk mulai.
          </p>
        ) : (
          <ol className="space-y-0.5">
            {logs.map((log, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="tabular shrink-0 text-muted-foreground/60">{log.time}</span>
                <span className={cn("w-14 shrink-0 uppercase", LEVEL_COLOR[log.level])}>
                  {log.level}
                </span>
                {log.node && <span className="shrink-0 text-teal">[{log.node}]</span>}
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
