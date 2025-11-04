import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

export const Timeline = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [timelineDuration, setTimelineDuration] = useState(60);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playheadRef.current = window.setInterval(() => {
        setPlayheadPosition((prev) => {
          const next = prev + 0.1;
          if (next >= timelineDuration) {
            setIsPlaying(false);
            return timelineDuration;
          }
          return next;
        });
      }, 100);
    } else {
      if (playheadRef.current) {
        clearInterval(playheadRef.current);
        playheadRef.current = null;
      }
    }
    return () => {
      if (playheadRef.current) clearInterval(playheadRef.current);
    };
  }, [isPlaying, timelineDuration]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const skipToStart = () => {
    setPlayheadPosition(0);
    setIsPlaying(false);
  };
  const skipToEnd = () => {
    setPlayheadPosition(timelineDuration);
    setIsPlaying(false);
  };

  const formatTimecode = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  const playheadPercent = (playheadPosition / timelineDuration) * 100;

  return (
    <div className="h-full bg-studio-timeline flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-studio-panel-alt">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-semibold animated-gradient-text uppercase tracking-wider">Timeline</h2>
          
          <div className="flex items-center gap-1.5 ml-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-accent/10 transition-colors" 
              onClick={skipToStart}
            >
              <SkipBack className="h-4 w-4 animated-gradient-stroke" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-accent/10 transition-colors" 
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 animated-gradient-stroke" />
              ) : (
                <Play className="h-4 w-4 animated-gradient-stroke" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-accent/10 transition-colors" 
              onClick={skipToEnd}
            >
              <SkipForward className="h-4 w-4 animated-gradient-stroke" />
            </Button>
          </div>

          <div className="flex items-center gap-1 ml-3 px-3 py-1 bg-studio-panel rounded border border-border/50">
            <span className="text-xs font-mono tracking-wider text-foreground tabular-nums">
              {formatTimecode(playheadPosition)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Duration</span>
          <Slider 
            value={[timelineDuration]} 
            onValueChange={(val) => setTimelineDuration(val[0])} 
            min={60} 
            max={600} 
            step={10} 
            className="w-40" 
          />
          <div className="flex items-center gap-1 px-3 py-1 bg-studio-panel rounded border border-border/50 min-w-[100px] justify-center">
            <span className="text-xs font-mono tracking-wider text-foreground tabular-nums">
              {formatTimecode(timelineDuration)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto" ref={timelineRef}>
        <div className="relative min-w-full" style={{ width: `${timelineDuration * 20}px` }}>
          {/* Enhanced Ruler */}
          <div className="h-8 bg-studio-panel border-b border-border relative">
            {/* Grid lines every second */}
            {Array.from({ length: Math.ceil(timelineDuration) + 1 }).map((_, i) => (
              <div
                key={`grid-${i}`}
                className="absolute top-0 bottom-0 w-px bg-border/30"
                style={{ left: `${(i / timelineDuration) * 100}%` }}
              />
            ))}
            
            {/* Major markers every 5 seconds */}
            {Array.from({ length: Math.ceil(timelineDuration / 5) + 1 }).map((_, i) => {
              const seconds = i * 5;
              return (
                <div
                  key={`marker-${i}`}
                  className="absolute top-0 flex flex-col items-start"
                  style={{ left: `${(seconds / timelineDuration) * 100}%` }}
                >
                  <div className="w-px h-3 bg-border" />
                  <span className="text-[10px] text-muted-foreground ml-1 font-mono tracking-wider tabular-nums">
                    {formatTimecode(seconds)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Track Area */}
          <div className="relative min-h-[200px] bg-studio-timeline">
            {/* Vertical grid lines */}
            {Array.from({ length: Math.ceil(timelineDuration) + 1 }).map((_, i) => (
              <div
                key={`track-grid-${i}`}
                className="absolute top-0 bottom-0 w-px bg-border/10"
                style={{ left: `${(i / timelineDuration) * 100}%` }}
              />
            ))}
            
            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] animated-gradient-bg z-20 pointer-events-none shadow-[0_0_12px_rgba(52,211,153,0.5)]" 
              style={{ left: `${playheadPercent}%` }}
            >
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 animated-gradient-bg shadow-[0_0_10px_rgba(52,211,153,0.6)]" 
                style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} 
              />
            </div>

            {/* Video Track */}
            <div className="h-20 border-b border-border/30 flex items-center gap-2 px-3 bg-studio-panel/20 hover:bg-studio-panel/30 transition-colors">
              <span className="text-xs font-semibold animated-gradient-text min-w-[24px]">V1</span>
              <div className="flex-1 h-12 border border-border/40 rounded bg-studio-panel/40" />
            </div>

            {/* Audio Track */}
            <div className="h-20 border-b border-border/30 flex items-center gap-2 px-3 bg-studio-panel/20 hover:bg-studio-panel/30 transition-colors">
              <span className="text-xs font-semibold animated-gradient-text min-w-[24px]">A1</span>
              <div className="flex-1 h-12 border border-border/40 rounded bg-studio-panel/40" />
            </div>

            {/* Additional Video Track */}
            <div className="h-20 border-b border-border/30 flex items-center gap-2 px-3 bg-studio-panel/20 hover:bg-studio-panel/30 transition-colors">
              <span className="text-xs font-semibold text-muted-foreground/50 min-w-[24px]">V2</span>
            </div>

            {/* Additional Audio Track */}
            <div className="h-20 border-b border-border/30 flex items-center gap-2 px-3 bg-studio-panel/20 hover:bg-studio-panel/30 transition-colors">
              <span className="text-xs font-semibold text-muted-foreground/50 min-w-[24px]">A2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
