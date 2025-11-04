import { Play, Pause, SkipBack, SkipForward, ArrowLeftToLine, ArrowRightToLine, Settings, X, Circle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useEditor } from "@/context/EditorContext";
import { toast } from "@/components/ui/use-toast";

/**
 * SourceMonitor Component
 * Premiere Pro-style source monitor for clip preview
 */
export const SourceMonitor = () => {
  const FPS = 30;
  const DURATION = 10; // seconds (mock)

  const { timelinePlayheadSec } = useEditor();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [inPoint, setInPoint] = useState<number | null>(null);
  const [outPoint, setOutPoint] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const isAtEnd = (p: number) => p >= (outPoint ?? DURATION) - (1 / FPS) * 0.5;

  const togglePlay = () => {
    setIsPlaying((playing) => {
      if (playing) return false;
      // if currently at end, restart from inPoint or start
      setPlayhead((p) => (isAtEnd(p) ? (inPoint ?? 0) : p));
      return true;
    });
  };

  const barRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<null | { type: 'playhead' | 'in' | 'out' }>(null);

  const formatTimecode = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * FPS);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      const last = lastTsRef.current ?? ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;

      let shouldContinue = true;
      let computedNext = 0;
      setPlayhead((p) => {
        let next = p + dt;
        const end = outPoint ?? DURATION;
        if (next > end) {
          next = end; // stop at Out (or end of clip) by default
          shouldContinue = false;
          setIsPlaying(false);
        }
        computedNext = Math.max(0, Math.min(DURATION, next));
        return computedNext;
      });

      if (shouldContinue) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTsRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [isPlaying, inPoint, outPoint]);

  const secondsFromClientX = (clientX: number) => {
    const el = barRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = rect.width === 0 ? 0 : x / rect.width;
    return Math.max(0, Math.min(DURATION * ratio, DURATION));
  };

  // Mouse interactions on bar
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const sec = secondsFromClientX(e.clientX);
      if (dragState.current.type === 'playhead') setPlayhead(sec);
      if (dragState.current.type === 'in') setInPoint((prev) => Math.max(0, Math.min(sec, (outPoint ?? DURATION) - (1 / FPS))));
      if (dragState.current.type === 'out') setOutPoint((prev) => Math.max((inPoint ?? 0) + (1 / FPS), Math.min(sec, DURATION)));
    };
    const onUp = () => {
      dragState.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [DURATION, FPS, inPoint, outPoint]);

  const startDrag = (type: 'playhead' | 'in' | 'out') => (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragState.current = { type };
    document.body.style.userSelect = "none";
  };

  const onBarMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const sec = secondsFromClientX(e.clientX);
    setIsPlaying(false);
    setPlayhead(sec);
    dragState.current = { type: 'playhead' };
    document.body.style.userSelect = "none";
  };

  const markIn = useCallback(() => setInPoint(Math.min(playhead, outPoint ?? DURATION)), [playhead, outPoint, DURATION]);
  const markOut = useCallback(() => setOutPoint(Math.max(playhead, inPoint ?? 0)), [playhead, inPoint]);
  const clearMarks = () => { setInPoint(null); setOutPoint(null); };

  const insertRange = (mode: 'insert' | 'overwrite') => {
    const start = inPoint ?? 0;
    const end = outPoint ?? DURATION;
    if (end <= start) {
      toast({ title: 'Invalid range', description: 'Out point must be after In point.' });
      return;
    }
    toast({
      title: mode === 'insert' ? 'Insert to Timeline' : 'Overwrite in Timeline',
      description: `Range ${formatTimecode(start)} - ${formatTimecode(end)} at playhead ${formatTimecode(timelinePlayheadSec)}`,
    });
  };

  // Keyboard shortcuts for trimmer: I/O, Space, arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        markIn();
      } else if (e.key.toLowerCase() === 'o') {
        e.preventDefault();
        markOut();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        const dir = e.code === 'ArrowRight' ? 1 : -1;
        const frames = e.shiftKey ? 10 : 1;
        const delta = (frames / FPS) * dir;
        setPlayhead((p) => Math.max(0, Math.min(DURATION, p + delta)));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [FPS, DURATION, markIn, markOut]);

  const inPx = (inPoint ?? 0) / DURATION * 100;
  const outPx = (outPoint ?? DURATION) / DURATION * 100;
  const playheadPx = (playhead / DURATION) * 100;

  return (
    <div className="h-full flex flex-col bg-studio-panel">
      {/* Monitor Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-border/30 shrink-0">
        <span className="text-[11px] font-medium text-muted-foreground">Source</span>
        <div className="flex items-center gap-3">
    <span className="text-[11px] font-mono text-muted-foreground">{formatTimecode(playhead)}</span>
          <button className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Settings">
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Video Display - 16:9 */}
      <div className="flex-1 flex items-center justify-center p-3 bg-studio-main">
        <AspectRatio ratio={16 / 9} className="w-full">
          <div className="w-full h-full bg-black flex items-center justify-center cursor-pointer" onClick={togglePlay}>
            <Circle className="w-10 h-10 text-muted-foreground/30" />
          </div>
        </AspectRatio>
      </div>
      
      {/* Controls Bar */}
      <div className="h-14 border-t border-border/30 shrink-0 flex flex-col">
        {/* Scrubber */}
        <div className="h-7 px-3 flex items-center gap-2 border-b border-border/20 select-none">
          <span className="text-[10px] font-mono text-muted-foreground/60 w-16">{formatTimecode(inPoint ?? 0)}</span>
          <div ref={barRef} className="flex-1 h-1 bg-studio-timeline relative cursor-pointer" onMouseDown={onBarMouseDown}>
            {/* In/Out range fill */}
            <div className="absolute top-0 h-full bg-accent/30" style={{ left: `${inPx}%`, width: `${Math.max(0, outPx - inPx)}%` }} />
            {/* In marker handle */}
            <div
              className="absolute -top-[6px] w-2.5 h-2.5 rounded-sm bg-emerald-400 cursor-ew-resize z-10"
              style={{ left: `calc(${inPx}% - 4px)` }}
              title="In"
              onMouseDown={startDrag('in')}
            />
            {/* Out marker handle */}
            <div
              className="absolute -top-[6px] w-2.5 h-2.5 rounded-sm bg-rose-400 cursor-ew-resize z-10"
              style={{ left: `calc(${outPx}% - 4px)` }}
              title="Out"
              onMouseDown={startDrag('out')}
            />
            {/* Trimmer playhead vertical line */}
            <div
              className="absolute top-[-6px] bottom-[-6px] w-[2px] animated-gradient-bg"
              style={{ left: `${playheadPx}%` }}
            />
            {/* Trimmer playhead head (triangle) */}
            <div
              className="absolute -top-3 left-0 -translate-x-1/2 w-3 h-3 animated-gradient-bg shadow-[0_0_6px_rgba(52,211,153,0.6)] cursor-ew-resize"
              style={{ left: `${playheadPx}%`, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
              title="Trimmer Playhead"
              onMouseDown={startDrag('playhead')}
            />
            {/* Trimmer playhead circle (slightly below center to avoid overlap with In/Out) */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full animated-gradient-bg z-20 cursor-ew-resize"
              style={{ left: `${playheadPx}%`, top: '50%', transform: 'translate(-50%, -35%)' }}
              onMouseDown={startDrag('playhead')}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/60 w-16 text-right">{formatTimecode(outPoint ?? DURATION)}</span>
        </div>
        
        {/* Playback Controls */}
        <div className="h-7 px-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Mark In" onClick={markIn}>
              <ArrowLeftToLine className="w-3.5 h-3.5 animated-gradient-icon" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Mark Out" onClick={markOut}>
              <ArrowRightToLine className="w-3.5 h-3.5 animated-gradient-icon" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Clear In/Out" onClick={clearMarks}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex items-center gap-0.5">
            <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" onClick={() => setPlayhead((p) => Math.max(0, p - (1 / FPS)))}>
              <SkipBack className="w-3 h-3" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center text-foreground hover:text-accent transition-colors" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-3.5 h-3.5 animated-gradient-stroke" /> : <Play className="w-3.5 h-3.5 animated-gradient-stroke" />}
            </button>
            <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" onClick={() => setPlayhead((p) => Math.min(DURATION, p + (1 / FPS)))}>
              <SkipForward className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="h-6 px-2 text-[10px] font-medium rounded border border-border/50 hover:bg-accent/10" onClick={() => insertRange('insert')}>
              Insert
            </button>
            <button className="h-6 px-2 text-[10px] font-medium rounded border border-border/50 hover:bg-accent/10" onClick={() => insertRange('overwrite')}>
              Overwrite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
