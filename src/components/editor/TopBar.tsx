import { Film, Minimize2, Maximize2, X } from "lucide-react";

/**
 * TopBar Component
 * Main header for ProCut editor - displays app branding, future controls, and window chrome
 */
export const TopBar = () => {
  return (
    <header className="h-12 bg-studio-panel border-b border-border flex items-center px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Film className="w-5 h-5 text-accent" />
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          ProCut
        </h1>
      </div>
      
      {/* Future: toolbar controls will go here */}
      <div className="flex-1" />
      
      {/* Fake Window Controls (visual only) */}
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
          <Minimize2 className="w-3.5 h-3.5" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-destructive/20 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
