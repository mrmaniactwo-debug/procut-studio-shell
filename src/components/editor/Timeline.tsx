import { Film, Volume2, Scissors, Hand, Move, Type, Zap, Lock, Eye, VolumeX } from "lucide-react";

/**
 * Timeline Component
 * Bottom panel - toolbar, ruler, video tracks, audio tracks
 */
export const Timeline = () => {
  return (
    <div className="h-full bg-studio-timeline flex flex-col border-t border-border">
      {/* Panel Header with Toolbar */}
      <div className="shrink-0 bg-studio-panel border-b border-border h-10 flex items-center px-3">
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 flex items-center justify-center text-accent bg-studio-panel-alt rounded">
            <Move className="w-3.5 h-3.5 animated-gradient-stroke" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
            <Scissors className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-5 bg-border/50 mx-1"></div>
          <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
            <Hand className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
            <Zap className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors">
            <Type className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Timeline Content */}
      <div className="flex-1 overflow-auto relative">
        {/* Ruler / Time Scale */}
        <div className="h-8 bg-studio-panel border-b border-border flex items-end sticky top-0 z-20">
          <div className="w-40 shrink-0"></div> {/* Spacer for track headers */}
          <div className="flex-1 h-full relative">
            {/* Time markers */}
            <div className="flex items-end h-full">
              {["00:00", "00:05", "00:10", "00:15", "00:20", "00:25", "00:30", "00:35", "00:40", "00:45"].map((time, i) => (
                <div key={i} className="w-48 h-full flex flex-col justify-end items-start">
                  <span className="text-[10px] text-muted-foreground font-mono -translate-x-1/2">{time}</span>
                  <div className="w-px h-2 bg-muted-foreground"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Playhead */}
        <div className="absolute top-8 left-40 z-10 h-full w-px animated-gradient-bg" style={{ left: 'calc(10rem + 100px)' }}>
          <div className="w-3 h-3 animated-gradient-bg rounded-full absolute -top-1 -left-[5px]"></div>
        </div>
        
        {/* Tracks */}
        <div className="relative">
          {/* Video Track */}
          <div className="h-16 border-b border-border flex">
            <div className="w-40 bg-studio-panel flex items-center px-2 border-r border-border shrink-0">
              <div className="flex items-center gap-2">
                <button className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                <button className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"><Lock className="w-3.5 h-3.5" /></button>
              </div>
              <div className="ml-2">
                <Film className="w-3.5 h-3.5 text-muted-foreground mb-0.5" />
                <span className="text-[9px] text-muted-foreground/70 font-medium">V1</span>
              </div>
            </div>
            <div className="flex-1 bg-studio-timeline relative p-1">
              {/* Sample Clip */}
              <div className="absolute top-1 left-24 w-72 h-14 bg-blue-500/30 border border-blue-400 rounded-sm flex items-center px-2">
                <span className="text-white text-[10px] font-medium truncate">my_awesome_clip.mp4</span>
              </div>
            </div>
          </div>
          
          {/* Audio Track */}
          <div className="h-16 border-b border-border flex">
            <div className="w-40 bg-studio-panel flex items-center px-2 border-r border-border shrink-0">
              <div className="flex items-center gap-2">
                <button className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"><VolumeX className="w-3.5 h-3.5" /></button>
                <button className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"><Lock className="w-3.5 h-3.5" /></button>
              </div>
              <div className="ml-2">
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground mb-0.5" />
                <span className="text-[9px] text-muted-foreground/70 font-medium">A1</span>
              </div>
            </div>
            <div className="flex-1 bg-studio-timeline relative">
              {/* Empty track area */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
