import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { TimelineTrackHeader } from "./timeline/TimelineTrackHeader";
import { cn } from "@/lib/utils";

type Track = {
  id: string;
  label: string;
  type: "video" | "audio";
  isLocked: boolean;
  isVisible: boolean;
  isMuted: boolean;
  isTargeted: boolean;
  isExpanded: boolean;
};

export const Timeline = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [timelineDuration, setTimelineDuration] = useState(60);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<number | null>(null);

  const [videoTracks, setVideoTracks] = useState<Track[]>([
    { id: "v2", label: "V2", type: "video", isLocked: true, isVisible: false, isMuted: false, isTargeted: false, isExpanded: false },
    { id: "v1", label: "V1", type: "video", isLocked: false, isVisible: true, isMuted: false, isTargeted: true, isExpanded: true },
  ]);

  const [audioTracks, setAudioTracks] = useState<Track[]>([
    { id: "a1", label: "A1", type: "audio", isLocked: false, isVisible: true, isMuted: false, isTargeted: true, isExpanded: true },
    { id: "a2", label: "A2", type: "audio", isLocked: false, isVisible: true, isMuted: true, isTargeted: false, isExpanded: false },
  ]);

  const [selectedTrack, setSelectedTrack] = useState<string | null>("v1");

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

  const handleTrackUpdate = (id: string, updates: Partial<Track>) => {
    const allTracks = [...videoTracks, ...audioTracks];
    const trackToUpdate = allTracks.find(t => t.id === id);
    if (!trackToUpdate) return;

    const updater = (tracks: Track[]) =>
      tracks.map(t => t.id === id ? { ...t, ...updates } : t);

    if (trackToUpdate.type === 'video') {
      setVideoTracks(updater);
    } else {
      setAudioTracks(updater);
    }
  };

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const skipToStart = () => setPlayheadPosition(0);
  const skipToEnd = () => setPlayheadPosition(timelineDuration);

  const formatTimecode = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  const playheadPercent = (playheadPosition / timelineDuration) * 100;

  const renderTracks = (tracks: Track[], type: 'video' | 'audio') => {
    return tracks.map(track => (
      <div
        key={track.id}
        className={cn("flex items-center border-b border-border/30 transition-all", {
          "h-20": !track.isExpanded,
          "h-32": track.isExpanded,
        })}
      >
        <div className={cn("w-full h-full flex items-center gap-2 px-3 transition-colors", {
          "bg-studio-panel/20 hover:bg-studio-panel/30": selectedTrack !== track.id,
          "bg-accent/10": selectedTrack === track.id,
          "opacity-50": type === 'video' ? !track.isVisible : track.isMuted,
        })}>
          {track.id === 'v1' || track.id === 'a1' ? (
            <div className="flex-1 h-12 border border-border/40 rounded bg-studio-panel/40" />
          ) : (
            <div className="flex-1 h-12" />
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="h-full bg-studio-timeline flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-studio-panel-alt z-30">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-semibold animated-gradient-text uppercase tracking-wider">Timeline</h2>
          <div className="flex items-center gap-1.5 ml-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/10" onClick={skipToStart}>
              <SkipBack className="h-4 w-4 animated-gradient-stroke" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/10" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4 animated-gradient-stroke" /> : <Play className="h-4 w-4 animated-gradient-stroke" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent/10" onClick={skipToEnd}>
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
          <Slider value={[timelineDuration]} onValueChange={(val) => setTimelineDuration(val[0])} min={60} max={600} step={10} className="w-40" />
          <div className="flex items-center gap-1 px-3 py-1 bg-studio-panel rounded border border-border/50 min-w-[100px] justify-center">
            <span className="text-xs font-mono tracking-wider text-foreground tabular-nums">
              {formatTimecode(timelineDuration)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-auto">
        {/* Track Headers */}
        <div className="w-48 bg-background border-r border-border z-20">
          <div className="h-8 border-b border-border" />
          {/* Video Tracks */}
          <div>
            {videoTracks.map(track => (
              <TimelineTrackHeader
                key={track.id}
                track={track}
                onToggleLock={(id) => handleTrackUpdate(id, { isLocked: !track.isLocked })}
                onToggleVisibility={(id) => handleTrackUpdate(id, { isVisible: !track.isVisible })}
                onToggleMute={() => {}}
                onToggleTarget={(id) => handleTrackUpdate(id, { isTargeted: !track.isTargeted })}
                onToggleExpand={(id) => handleTrackUpdate(id, { isExpanded: !track.isExpanded })}
                onSelectTrack={setSelectedTrack}
              />
            ))}
          </div>
          <div className="h-px bg-border" />
          {/* Audio Tracks */}
          <div>
            {audioTracks.map(track => (
              <TimelineTrackHeader
                key={track.id}
                track={track}
                onToggleLock={(id) => handleTrackUpdate(id, { isLocked: !track.isLocked })}
                onToggleVisibility={() => {}}
                onToggleMute={(id) => handleTrackUpdate(id, { isMuted: !track.isMuted })}
                onToggleTarget={(id) => handleTrackUpdate(id, { isTargeted: !track.isTargeted })}
                onToggleExpand={(id) => handleTrackUpdate(id, { isExpanded: !track.isExpanded })}
                onSelectTrack={setSelectedTrack}
              />
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden" ref={timelineRef}>
          <div className="relative min-w-full h-full" style={{ width: `${timelineDuration * 20}px` }}>
            <div className="h-8 bg-studio-panel border-b border-border relative">
              {Array.from({ length: Math.ceil(timelineDuration) + 1 }).map((_, i) => (
                <div key={`grid-${i}`} className="absolute top-0 bottom-0 w-px bg-border/30" style={{ left: `${(i / timelineDuration) * 100}%` }} />
              ))}
              {Array.from({ length: Math.ceil(timelineDuration / 5) + 1 }).map((_, i) => {
                const seconds = i * 5;
                return (
                  <div key={`marker-${i}`} className="absolute top-0 flex flex-col items-start" style={{ left: `${(seconds / timelineDuration) * 100}%` }}>
                    <div className="w-px h-3 bg-border" />
                    <span className="text-[10px] text-muted-foreground ml-1 font-mono tracking-wider tabular-nums">{formatTimecode(seconds)}</span>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              {/* Vertical grid lines */}
              {Array.from({ length: Math.ceil(timelineDuration) + 1 }).map((_, i) => (
                <div key={`track-grid-${i}`} className="absolute top-0 bottom-0 w-px bg-border/10" style={{ left: `${(i / timelineDuration) * 100}%` }} />
              ))}
              
              {/* Video Tracks */}
              <div>{renderTracks(videoTracks, 'video')}</div>
              <div className="h-px bg-border" />
              {/* Audio Tracks */}
              <div>{renderTracks(audioTracks, 'audio')}</div>

              {/* Playhead */}
              <div className="absolute top-0 bottom-0 w-[2px] animated-gradient-bg z-20 pointer-events-none shadow-[0_0_12px_rgba(52,211,153,0.5)]" style={{ left: `${playheadPercent}%` }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 animated-gradient-bg shadow-[0_0_10px_rgba(52,211,153,0.6)]" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
