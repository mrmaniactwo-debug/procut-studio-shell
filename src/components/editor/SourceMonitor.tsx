import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * SourceMonitor Component
 * Left viewer - for reviewing source clips before editing
 */
export const SourceMonitor = () => {
  return (
    <div className="h-full bg-studio-main flex flex-col border-r border-border">
      {/* Panel Header */}
      <div className="h-9 px-3 flex items-center border-b border-border shrink-0 bg-studio-panel">
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Source
        </h2>
      </div>
      
      {/* Video Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-20 h-20 border border-border/50 rounded flex items-center justify-center mb-2">
            <Play className="w-8 h-8 text-muted-foreground opacity-20" />
          </div>
          <p className="text-[11px] text-muted-foreground/60">Drop media here (future)</p>
        </div>
      </div>
      
      {/* Playback Controls */}
      <div className="bg-studio-panel border-t border-border shrink-0">
        {/* Scrub Bar with In/Out Markers */}
        <div className="h-7 px-3 flex items-center border-b border-border/50">
          <div className="flex-1 h-1 bg-studio-timeline rounded-sm relative">
            {/* Dummy In Marker */}
            <div className="absolute top-0 left-[20%] w-0.5 h-3 bg-accent -translate-y-1" />
            {/* Dummy Out Marker */}
            <div className="absolute top-0 left-[60%] w-0.5 h-3 bg-accent -translate-y-1" />
            {/* Progress */}
            <div className="absolute top-0 left-0 h-full w-0 bg-primary rounded-sm" />
          </div>
        </div>
        
        {/* Transport + Mark Controls */}
        <div className="h-11 flex items-center justify-between px-3">
          {/* Mark In/Out Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-7 h-7 flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors font-medium">
                  I
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark In (I)</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-7 h-7 flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors font-medium">
                  O
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark Out (O)</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
                  <span className="text-xs">➜</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Transport Controls */}
          <div className="flex items-center gap-1">
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
    </div>
  );
};
