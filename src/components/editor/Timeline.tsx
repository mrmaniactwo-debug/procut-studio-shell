import { Film, Volume2 } from "lucide-react";

/**
 * Timeline Component
 * Bottom panel - ruler, video tracks, audio tracks (empty placeholders)
 */
export const Timeline = () => {
  return (
    <div className="h-full bg-studio-timeline flex flex-col border-t border-border">
      {/* Panel Header */}
      <div className="h-9 px-3 flex items-center border-b border-border shrink-0 bg-studio-panel">
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Timeline
        </h2>
      </div>
      
      {/* Timeline Content */}
      <div className="flex-1 overflow-auto">
        {/* Ruler / Time Scale */}
        <div className="h-8 bg-studio-panel border-b border-border flex items-center px-3">
          <div className="flex gap-12 text-[10px] text-muted-foreground font-mono">
            <span>00:00</span>
            <span>00:05</span>
            <span>00:10</span>
            <span>00:15</span>
            <span>00:20</span>
            <span>00:25</span>
            <span>00:30</span>
          </div>
        </div>
        
        {/* Video Track */}
        <div className="h-16 border-b border-border flex">
          <div className="w-16 bg-studio-panel flex flex-col items-center justify-center border-r border-border shrink-0">
            <Film className="w-3.5 h-3.5 text-muted-foreground mb-0.5" />
            <span className="text-[9px] text-muted-foreground/70 font-medium">V1</span>
          </div>
          <div className="flex-1 bg-studio-timeline relative">
            {/* Empty track area */}
          </div>
        </div>
        
        {/* Audio Track */}
        <div className="h-16 border-b border-border flex">
          <div className="w-16 bg-studio-panel flex flex-col items-center justify-center border-r border-border shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-muted-foreground mb-0.5" />
            <span className="text-[9px] text-muted-foreground/70 font-medium">A1</span>
          </div>
          <div className="flex-1 bg-studio-timeline relative">
            {/* Empty track area */}
          </div>
        </div>
        
        <div className="p-3 text-center">
          <p className="text-[11px] text-muted-foreground/50">
            Timeline — V1 / A1 placeholders
          </p>
        </div>
      </div>
    </div>
  );
};
