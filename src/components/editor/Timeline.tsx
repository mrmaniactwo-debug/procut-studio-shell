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
      <div className="h-10 px-3 flex items-center justify-between border-b border-border bg-studio-panel-alt">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Timeline</h2>
          <div className="flex items-center gap-1 ml-4">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={skipToStart}>
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={skipToEnd}>
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="text-xs font-mono text-foreground ml-2">{formatTimecode(playheadPosition)}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Duration:</span>
          <Slider value={[timelineDuration]} onValueChange={(val) => setTimelineDuration(val[0])} min={60} max={600} step={10} className="w-32" />
          <span className="text-xs font-mono text-foreground min-w-[60px]">{formatTimecode(timelineDuration)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto" ref={timelineRef}>
        <div className="relative min-w-full" style={{ width: `${timelineDuration * 20}px` }}>
          <div className="h-6 bg-studio-panel border-b border-border relative">
            {Array.from({ length: Math.ceil(timelineDuration) + 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 h-full flex items-center" style={{ left: `${(i / timelineDuration) * 100}%` }}>
                <div className="w-px h-2 bg-border" />
                <span className="text-[9px] text-muted-foreground ml-1 font-mono">{formatTimecode(i)}</span>
              </div>
            ))}
          </div>

          <div className="relative min-h-[200px] bg-studio-timeline">
            <div className="absolute top-0 bottom-0 w-[2px] animated-gradient-bg z-10 pointer-events-none shadow-[0_0_12px_rgba(52,211,153,0.5)]" style={{ left: `${playheadPercent}%` }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 animated-gradient-bg shadow-[0_0_8px_rgba(52,211,153,0.5)]" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
            </div>
            <div className="h-16 border-b border-border/20 flex items-center px-2 bg-studio-panel/30">
              <span className="text-xs text-muted-foreground font-medium">V1</span>
            </div>
            <div className="h-16 border-b border-border/20 flex items-center px-2 bg-studio-panel/30">
              <span className="text-xs text-muted-foreground font-medium">A1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
