import { Film, Volume2, Scissors, Hand, Move, Type, Zap } from "lucide-react";

/**
 * Timeline Component
 * Bottom panel - toolbar, ruler, video tracks, audio tracks
 */
export const Timeline = () => {
  return (
    <div className="h-full bg-studio-timeline flex flex-col border-t border-border">
      {/* Panel Header with Toolbar */}
      <div className="shrink-0 bg-studio-panel border-b border-border">
        <div className="h-8 px-3 flex items-center justify-between border-b border-border/30">
          <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Timeline
          </h2>
        </div>
        
        {/* Toolbar */}
        <div className="h-9 px-3 flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
            <Hand className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-accent bg-studio-panel-alt rounded">
            <Move className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
            <Scissors className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
            <Zap className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
            <Type className="w-3.5 h-3.5" />
          </button>
        </div>
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
