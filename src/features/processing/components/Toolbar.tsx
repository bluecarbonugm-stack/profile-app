import { FilePlus2, FolderOpen, LayoutTemplate, Play, Save, Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import { TEMPLATES } from "@/features/processing/data/pipeline-templates";

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
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-card px-3">
      <div className="mr-2 flex items-baseline gap-2 border-r border-border pr-3">
        <span className="text-sm font-semibold tracking-tight text-primary">PRISM</span>
        <span className="eyebrow hidden text-muted-foreground/80 lg:inline">
          Shallow-water Mapping Workbench
        </span>
      </div>
      <ToolbarButton icon={FilePlus2} onClick={onNew}>
        New
      </ToolbarButton>
      <ToolbarButton icon={Save} onClick={onSave}>
        Save
      </ToolbarButton>
      <ToolbarButton icon={FolderOpen} onClick={onLoad}>
        Load
      </ToolbarButton>

      <Divider />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <LayoutTemplate className="h-3.5 w-3.5" /> Template
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="eyebrow text-muted-foreground">
            Preset workflow
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {TEMPLATES.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onLoadTemplate(template.id)}
              className="flex-col items-start gap-1 py-2.5"
            >
              <span className="text-sm font-medium">{template.name}</span>
              <span className="text-xs leading-snug text-muted-foreground">
                {template.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />

      <Button
        size="sm"
        onClick={onRunAll}
        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Play className="h-3.5 w-3.5" /> Run All
      </Button>
      <ToolbarButton icon={Trash2} onClick={onClear}>
        Clear
      </ToolbarButton>

      <p className="eyebrow ml-auto hidden text-muted-foreground/70 xl:block">
        Tersimpan di browser · localStorage
      </p>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  onClick,
  children,
}: {
  icon: React.ElementType;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="gap-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-border" />;
}
