import { cn } from "@/lib/utils";
import { Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="h-48 flex flex-col border-t border-border bg-[oklch(0.14_0.03_245)] text-slate-100 font-mono">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border">
        <Terminal className="h-3.5 w-3.5 text-teal" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Console / Log</span>
        <span className="ml-2 text-[10px] text-muted-foreground">{logs.length} entri</span>
        <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto h-6 text-[11px] gap-1">
          <X className="h-3 w-3" /> Clear
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto text-[11px] leading-relaxed p-2 space-y-0.5">
        {logs.length === 0 && (
          <div className="text-muted-foreground italic px-1">
            Belum ada log. Jalankan node atau muat template untuk mulai.
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-muted-foreground shrink-0">{log.time}</span>
            <span className={cn("uppercase text-[10px] shrink-0 w-14", LEVEL_COLOR[log.level])}>
              {log.level}
            </span>
            {log.node && <span className="text-teal shrink-0">[{log.node}]</span>}
            <span className="whitespace-pre-wrap break-words">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
