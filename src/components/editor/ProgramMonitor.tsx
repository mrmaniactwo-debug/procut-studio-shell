import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

/**
 * ProgramMonitor Component
 * Right viewer - shows the final output/timeline preview
 */
export const ProgramMonitor = () => {
  return (
    <div className="h-full bg-studio-main flex flex-col">
      {/* Panel Header */}
      <div className="h-9 px-3 flex items-center border-b border-border shrink-0 bg-studio-panel">
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Program
        </h2>
      </div>
      
      {/* Video Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-20 h-20 border border-border/50 rounded flex items-center justify-center mb-2">
            <Play className="w-8 h-8 text-muted-foreground opacity-20" />
          </div>
          <p className="text-[11px] text-muted-foreground/60">Preview Output</p>
        </div>
      </div>
      
      {/* Playback Controls */}
      <div className="h-16 bg-studio-panel border-t border-border shrink-0">
        {/* Scrub Bar */}
        <div className="h-7 px-3 flex items-center border-b border-border/50">
          <div className="flex-1 h-1 bg-studio-timeline rounded-sm relative">
            <div className="absolute top-0 left-0 h-full w-0 bg-primary rounded-sm" />
          </div>
        </div>
        
        {/* Transport Controls */}
        <div className="h-9 flex items-center justify-center gap-1">
          <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-foreground hover:text-accent transition-colors">
            <Play className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
