import { Play, SkipBack, SkipForward, Volume2, Settings } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

/**
 * ProgramMonitor Component
 * Premiere Pro-style program monitor for timeline output
 */
export const ProgramMonitor = () => {
  return (
    <div className="h-full flex flex-col bg-studio-panel">
      {/* Monitor Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-border/30 shrink-0">
        <span className="text-[11px] font-medium text-muted-foreground">Program</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-muted-foreground">00:00:00:00</span>
          <button className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Video Display - 16:9 */}
      <div className="flex-1 flex items-center justify-center p-3 bg-studio-main relative">
        <AspectRatio ratio={16 / 9} className="w-full">
          <div className="w-full h-full bg-black flex items-center justify-center">
            <Play className="w-12 h-12 text-muted-foreground/20" />
          </div>
        </AspectRatio>
        
        {/* Audio Level Bar */}
        <div className="absolute bottom-6 right-6 w-6 h-32 bg-studio-panel border border-border/30 rounded flex flex-col-reverse p-1 gap-0.5">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={`h-full w-full rounded-sm ${
                i < 3 ? 'bg-accent/60' : 'bg-studio-timeline'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Controls Bar */}
      <div className="h-14 border-t border-border/30 shrink-0 flex flex-col">
        {/* Scrubber */}
        <div className="h-7 px-3 flex items-center gap-2 border-b border-border/20">
          <span className="text-[10px] font-mono text-muted-foreground/60 w-16">00:00:00:00</span>
          <div className="flex-1 h-1 bg-studio-timeline relative cursor-pointer">
            <div className="absolute top-0 left-0 h-full w-0 bg-accent"></div>
            <div className="absolute top-1/2 left-0 w-2 h-2 -translate-y-1/2 -translate-x-1/2 bg-accent rounded-full"></div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/60 w-16 text-right">00:00:30:00</span>
        </div>
        
        {/* Playback Controls */}
        <div className="h-7 px-3 flex items-center justify-center gap-0.5">
          <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-3 h-3" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-foreground hover:text-accent transition-colors">
            <Play className="w-3.5 h-3.5" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-3 h-3" />
          </button>
          <div className="w-px h-4 bg-border/50 mx-1"></div>
          <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Volume2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
