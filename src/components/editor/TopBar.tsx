import { Maximize2, LayoutGrid, Save, Loader2, Check, Download } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import AnimatedIcon from "@/components/AnimatedIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from "@/context/ProjectContext";

/**
 * TopBar Component
 * Main header for ProCut editor - displays app branding, project title, and fullscreen toggle
 */
export const TopBar = () => {
  const { saving, dirty, lastSavedAt, exportProject } = useProject();
  const saved = !dirty && !saving;
  return (
    <header className="h-12 bg-studio-panel border-b border-border grid grid-cols-[1fr_auto_1fr] items-center px-4 shrink-0">
      <div className="flex items-center gap-3">
  <BrandLogo size={20} className="animated-gradient-icon" />
        <h1 className="text-base font-bold tracking-tight animated-gradient-text">
          ProCut
        </h1>
        {/* Workspace Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 h-7 px-2 rounded bg-studio-panel-alt text-xs text-muted-foreground hover:text-foreground hover:bg-studio-panel transition-colors inline-flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5" />
            Workspace
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Editing</DropdownMenuItem>
            <DropdownMenuItem>Color</DropdownMenuItem>
            <DropdownMenuItem>Audio</DropdownMenuItem>
            <DropdownMenuItem>Effects</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Project Title */}
      <div className="justify-self-center">
        <span className="text-sm text-muted-foreground font-medium">Untitled Project</span>
      </div>
      
      {/* Fullscreen Toggle */}
      <div className="flex items-center justify-self-end gap-2">
        {/* Autosave status */}
        <div className="h-8 px-2 rounded bg-studio-panel-alt text-xs text-muted-foreground inline-flex items-center gap-1">
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{saving ? "Saving…" : saved ? "Saved" : "Save"}</span>
        </div>

        {/* Export */}
        <button
          className="h-8 px-3 rounded bg-studio-panel-alt text-xs text-muted-foreground hover:text-foreground hover:bg-studio-panel transition-colors inline-flex items-center gap-1"
          onClick={exportProject}
          title="Export Project"
        >
          <AnimatedIcon>
            <Download className="w-3.5 h-3.5" />
          </AnimatedIcon>
          Export
        </button>

        <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors" title="Fullscreen">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
