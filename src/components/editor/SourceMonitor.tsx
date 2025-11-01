import { Play, SkipBack, SkipForward } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
    <div className="h-full flex flex-col p-2">
      {/* Monitor Label */}
      <div className="h-6 px-2 flex items-center shrink-0">
        <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Source
        </h3>
      </div>
      
      {/* 16:9 Video Preview */}
      <div className="px-2 pb-2">
        <AspectRatio ratio={16 / 9}>
          <div className="w-full h-full bg-black rounded flex items-center justify-center">
            <div className="text-center">
              <Play className="w-8 h-8 text-muted-foreground opacity-20 mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground/60">Drop media here</p>
            </div>
          </div>
        </AspectRatio>
      </div>
      
      {/* Playback Controls Bar */}
      <div className="h-12 bg-studio-panel rounded border border-border/30 shrink-0 flex flex-col">
        {/* Scrub Bar with In/Out Markers */}
        <div className="h-6 px-2 flex items-center border-b border-border/30">
          <div className="flex-1 h-1 bg-studio-timeline rounded-sm relative">
            <div className="absolute top-0 left-[20%] w-0.5 h-2 bg-accent -translate-y-[2px]" />
            <div className="absolute top-0 left-[60%] w-0.5 h-2 bg-accent -translate-y-[2px]" />
            <div className="absolute top-0 left-0 h-full w-0 bg-primary rounded-sm" />
          </div>
        </div>
        
        {/* Controls */}
        <div className="h-6 flex items-center justify-between px-2">
          {/* Mark Controls */}
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-6 h-6 flex items-center justify-center text-[9px] text-muted-foreground hover:text-foreground rounded transition-colors font-medium">
                  I
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Mark In (I)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-6 h-6 flex items-center justify-center text-[9px] text-muted-foreground hover:text-foreground rounded transition-colors font-medium">
                  O
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Mark Out (O)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded transition-colors">
                  <span className="text-[10px]">➜</span>
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Insert</p></TooltipContent>
            </Tooltip>
          </div>
          
          {/* Transport */}
          <div className="flex items-center gap-0.5">
            <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <SkipBack className="w-3 h-3" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center text-foreground hover:text-accent transition-colors">
              <Play className="w-3.5 h-3.5" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <SkipForward className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
