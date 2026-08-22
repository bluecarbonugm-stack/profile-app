import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TEMPLATES } from "@/lib/pipeline-templates";
import { FilePlus2, Save, FolderOpen, Play, Trash2, LayoutTemplate } from "lucide-react";

interface Props {
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
  onRunAll: () => void;
  onClear: () => void;
  onLoadTemplate: (templateId: string) => void;
}

export function Toolbar({ onNew, onSave, onLoad, onRunAll, onClear, onLoadTemplate }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-border bg-card/80 px-3 py-1.5">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onNew}>
          <FilePlus2 className="h-3.5 w-3.5" /> New
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onSave}>
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onLoad}>
          <FolderOpen className="h-3.5 w-3.5" /> Load
        </Button>
      </div>
      <div className="h-5 w-px bg-border mx-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <LayoutTemplate className="h-3.5 w-3.5" /> Load Template
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
            Preset Workflow
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {TEMPLATES.map((t) => (
            <DropdownMenuItem key={t.id} onClick={() => onLoadTemplate(t.id)} className="flex-col items-start py-2">
              <div className="text-sm font-medium">{t.name}</div>
              <div className="text-[11px] text-muted-foreground">{t.description}</div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="h-5 w-px bg-border mx-1" />
      <Button size="sm" className="h-8 gap-1.5 text-xs bg-accent text-accent-foreground hover:bg-accent/90" onClick={onRunAll}>
        <Play className="h-3.5 w-3.5" /> Run All
      </Button>
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onClear}>
        <Trash2 className="h-3.5 w-3.5" /> Clear canvas
      </Button>
      <div className="ml-auto text-[10px] text-muted-foreground">
        Workflow tersimpan sementara di browser (localStorage).
      </div>
    </div>
  );
}
