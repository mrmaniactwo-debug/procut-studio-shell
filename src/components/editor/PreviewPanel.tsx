import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

/**
 * PreviewPanel Component
 * Center panel - video preview screen + playback controls placeholder
 */
export const PreviewPanel = () => {
  return (
    <div className="h-full bg-studio-main flex flex-col">
      {/* Panel Header */}
      <div className="h-10 px-3 flex items-center border-b border-border shrink-0">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Preview
        </h2>
      </div>
      
      {/* Video Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-24 h-24 border-2 border-border rounded-lg flex items-center justify-center mb-3">
            <Play className="w-10 h-10 text-muted-foreground opacity-20" />
          </div>
          <p className="text-xs text-muted-foreground">No preview</p>
        </div>
      </div>
      
      {/* Playback Controls */}
      <div className="h-20 bg-studio-panel border-t border-border shrink-0">
        {/* Scrub Bar */}
        <div className="h-8 px-3 flex items-center border-b border-border">
          <div className="flex-1 h-1 bg-studio-timeline rounded-full relative">
            <div className="absolute top-0 left-0 h-full w-0 bg-primary rounded-full" />
          </div>
        </div>
        
        {/* Transport Controls */}
        <div className="h-12 flex items-center justify-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors">
            <Play className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
