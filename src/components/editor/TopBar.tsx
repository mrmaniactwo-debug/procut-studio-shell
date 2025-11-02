import { Maximize2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

/**
 * TopBar Component
 * Main header for ProCut editor - displays app branding, project title, and fullscreen toggle
 */
export const TopBar = () => {
  return (
    <header className="h-12 bg-studio-panel border-b border-border grid grid-cols-[1fr_auto_1fr] items-center px-4 shrink-0">
      <div className="flex items-center gap-2">
        <BrandLogo size={20} />
        <h1 className="text-base font-bold tracking-tight animated-gradient-text">
          ProCut
        </h1>
      </div>
      
      {/* Project Title */}
      <div className="justify-self-center">
        <span className="text-sm text-muted-foreground font-medium">Untitled Project</span>
      </div>
      
      {/* Fullscreen Toggle */}
      <div className="flex items-center justify-self-end">
        <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
