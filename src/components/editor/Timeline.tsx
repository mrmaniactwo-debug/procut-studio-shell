import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { Film, Volume2, Scissors, Hand, Move, Type, Magnet, Link2, Lock, Eye, VolumeX, Headphones, ChevronsUpDown, ArrowLeftToLine, ArrowRightToLine, MousePointer2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";


import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

// Draggable/Resizable clip sample with basic snapping
const ClipSampleInner = ({
  leftPx,
  widthPx,
  color = "blue",
  onChange,
  snapping = true,
  gridPx = 24,
  snapTargets = [],
}: {
  leftPx: number;
  widthPx: number;
  color?: string;
  onChange?: (leftPx: number, widthPx: number) => void;
  snapping?: boolean;
  gridPx?: number; // minor tick spacing
  snapTargets?: number[]; // additional absolute px to snap to (e.g., playhead, in/out)
}) => {
  const [selected, setSelected] = useState(false);
  const [drag, setDrag] = useState<null | {
    kind: 'move' | 'left' | 'right';
    startX: number;
    startLeft: number;
    startWidth: number;
  }>(null);
  const colorClasses = color === "blue"
    ? "bg-blue-500/30 border-blue-400"
    : "bg-emerald-500/10 border-emerald-400/60";

  const minWidthPx = 24;
  const thresholdPx = 8; // snap threshold

  const applySnap = useCallback((px: number) => {
    if (!snapping) return px;
    let best = px;
    let bestDist = thresholdPx + 1;
    // Snap to grid
    if (gridPx > 0) {
      const g = Math.round(px / gridPx) * gridPx;
      const d = Math.abs(px - g);
      if (d < bestDist) { best = g; bestDist = d; }
    }
    // Snap to targets
    for (const t of snapTargets) {
      const d = Math.abs(px - t);
      if (d < bestDist) { best = t; bestDist = d; }
    }
    return best;
  }, [snapping, gridPx, snapTargets]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - drag.startX;
      if (drag.kind === 'move') {
        const nextLeft = applySnap(drag.startLeft + dx);
        onChange?.(Math.max(0, nextLeft), widthPx);
      } else if (drag.kind === 'left') {
        let nextLeft = applySnap(drag.startLeft + dx);
        let nextWidth = drag.startWidth - (nextLeft - drag.startLeft);
        if (nextWidth < minWidthPx) {
          nextWidth = minWidthPx;
          nextLeft = drag.startLeft + (drag.startWidth - minWidthPx);
        }
        onChange?.(Math.max(0, nextLeft), nextWidth);
      } else if (drag.kind === 'right') {
        let nextWidth = drag.startWidth + dx;
        const snappedRight = applySnap(drag.startLeft + nextWidth);
        nextWidth = snappedRight - drag.startLeft;
        if (nextWidth < minWidthPx) nextWidth = minWidthPx;
        onChange?.(leftPx, nextWidth);
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, leftPx, widthPx, applySnap, onChange]);

  return (
    <div
      className={`absolute top-1 h-14 ${colorClasses} border rounded-sm flex items-center px-2 select-none ${selected ? 'ring-1 ring-accent/70' : ''}`}
      style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
      onMouseDown={(e) => {
        // ignore if clicking handles
        const target = e.target as HTMLElement;
        if (target.closest('[data-handle]')) return;
        setSelected(true);
        setDrag({ kind: 'move', startX: e.clientX, startLeft: leftPx, startWidth: widthPx });
        e.stopPropagation();
      }}
      onClick={(e) => { e.stopPropagation(); setSelected((s) => !s); }}
    >
      {/* Resize handles */}
      {selected && (
        <>
          <div
            data-handle
            className="absolute left-[-3px] top-1/2 -translate-y-1/2 w-[6px] h-5 bg-accent rounded-sm cursor-ew-resize"
            onMouseDown={(e) => { setDrag({ kind: 'left', startX: e.clientX, startLeft: leftPx, startWidth: widthPx }); e.stopPropagation(); }}
          />
          <div
            data-handle
            className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-[6px] h-5 bg-accent rounded-sm cursor-ew-resize"
            onMouseDown={(e) => { setDrag({ kind: 'right', startX: e.clientX, startLeft: leftPx, startWidth: widthPx }); e.stopPropagation(); }}
          />
        </>
      )}
      <span className="text-white text-[10px] font-medium truncate">my_awesome_clip.mp4</span>
    </div>
  );
};

ClipSampleInner.displayName = 'ClipSample';

// Memoize to prevent unnecessary re-renders
const ClipSample = memo(ClipSampleInner, (prev, next) => {
  return (
    prev.leftPx === next.leftPx &&
    prev.widthPx === next.widthPx &&
    prev.color === next.color &&
    prev.snapping === next.snapping &&
    prev.gridPx === next.gridPx &&
    JSON.stringify(prev.snapTargets) === JSON.stringify(next.snapTargets)
  );
});

/**
 * Timeline Component
 * Bottom panel - toolbar, ruler, video tracks, audio tracks
 */
export const Timeline = () => {
  // ============================================================================
  // ZOOM CONSTANTS & STATE
  // ============================================================================
  const FPS = 30;
  const MIN_ZOOM = 0.1; // 10% - very zoomed out (3.84 px/sec)
  const MAX_ZOOM = 20; // 2000% - very zoomed in (768 px/sec)
  const DEFAULT_ZOOM = 1; // 100% - default scale (38.4 px/sec)
  const BASE_PX_PER_SEC = 38.4; // Base pixels per second at 100% zoom
  
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM); // 0.1 to 20 (logarithmic scale)
  const PX_PER_SEC = BASE_PX_PER_SEC * zoomLevel; // Dynamic pixels per second based on zoom
  
  // Track height zoom (vertical)
  const MIN_TRACK_HEIGHT = 40;
  const MAX_TRACK_HEIGHT = 200;
  const DEFAULT_TRACK_HEIGHT = 64;
  const [trackHeightZoom, setTrackHeightZoom] = useState(DEFAULT_TRACK_HEIGHT);
  
  // ============================================================================
  // EXISTING STATE
  // ============================================================================
  const [tool, setTool] = useState<"selection" | "razor" | "hand" | "type">("selection");
  const [snapping, setSnapping] = useState(true);
  const [linked, setLinked] = useState(true);
  const [audioMute, setAudioMute] = useState(false);
  const [audioSolo, setAudioSolo] = useState(false);
  const [tallTracks, setTallTracks] = useState(false);
  const [skimmerEnabled, setSkimmerEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const playRaf = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const playheadXRef = useRef<number>(0);
  const lastPointerClientX = useRef<number | null>(null);
  const hoverActive = useRef<boolean>(false);
  const pinPlayheadOnScrollRef = useRef<boolean>(false);
  const lastScrollLeftRef = useRef(0);
  const programmaticScrollRef = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [playheadX, setPlayheadX] = useState(0); // pixels from timeline start (after headers)
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [inPoint, setInPoint] = useState<number | null>(null);
  const [outPoint, setOutPoint] = useState<number | null>(null);
  const [spaceHand, setSpaceHand] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; scrollLeft: number } | null>(null);
  const [draggingPlayhead, setDraggingPlayhead] = useState(false);
  // Simple linked A/V clip demo state (seconds)
  const [clipStartSec, setClipStartSec] = useState<number>(1);
  const [clipDurSec, setClipDurSec] = useState<number>(3);
  
  // Timeline duration with auto-extend (starts at 60s)
  const [timelineSec, setTimelineSec] = useState(60);
  useEffect(() => {
    const clipEndSec = clipStartSec + clipDurSec;
    const desired = Math.max(60, Math.ceil((clipEndSec + 10) / 10) * 10);
    setTimelineSec((prev) => (desired > prev ? desired : prev));
  }, [clipStartSec, clipDurSec]);

  // Visible window (seconds) computed from scroll + container width
  const containerRef = scrollRef; // alias
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    setContainerWidth(el.clientWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  const visibleStartPx = Math.max(0, scrollLeft - 160); // after headers
  const visibleEndPx = visibleStartPx + containerWidth + 400; // small buffer
  const visibleStartSec = visibleStartPx / PX_PER_SEC;
  const visibleEndSec = Math.min(timelineSec, Math.max(visibleStartSec, visibleEndPx / PX_PER_SEC));
  // Ensure ruler/track canvases span at least the visible viewport so borders are continuous
  const timelineWidthPx = Math.max(timelineSec * PX_PER_SEC, scrollLeft + containerWidth);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Initialize last scroll position to avoid a large first-delta jump
    lastScrollLeftRef.current = el.scrollLeft;
    const onScroll = () => {
      const prev = lastScrollLeftRef.current;
      const curr = el.scrollLeft;
      const delta = curr - prev;
      lastScrollLeftRef.current = curr;
      setScrollLeft(curr);
      // If this scroll is programmatic (e.g., from zoom anchoring), skip auto-extend and skimmer updates
      if (programmaticScrollRef.current) {
        return;
      }
      // Optionally pin playhead during manual scroll so the CTI stays visually fixed
      if (pinPlayheadOnScrollRef.current && !programmaticScrollRef.current && delta !== 0) {
        setPlayheadX((x) => Math.max(0, x + delta));
      }
      // Auto-extend when scrolling near the right edge
      const contentEnd = TRACK_HEADER_PX + timelineSec * PX_PER_SEC;
      if (curr + el.clientWidth > contentEnd - 200) {
        setTimelineSec((s) => s + 60);
      }
      if (skimmerEnabled && hoverActive.current && lastPointerClientX.current !== null) {
        const rect = el.getBoundingClientRect();
        const x = lastPointerClientX.current - rect.left;
        const minX = Math.round(TRACK_HEADER_PX - el.scrollLeft);
        setHoverX(Math.max(minX, Math.round(x)));
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [PX_PER_SEC, timelineSec, skimmerEnabled, draggingPlayhead, playing]);

  const TRACK_HEADER_PX = 160; // w-40

  // ============================================================================
  // ZOOM ANCHOR LOGIC
  // ============================================================================
  
  /**
   * Determine the best anchor point for zooming:
   * 1. Playhead if visible in viewport
   * 2. Mouse cursor position if available
   * 3. Timeline center as fallback
   */
  const getZoomAnchor = useCallback((mouseClientX?: number): { timeSec: number; viewportX: number } => {
    const el = scrollRef.current;
    if (!el) return { timeSec: 0, viewportX: TRACK_HEADER_PX };
    
    const playheadViewX = TRACK_HEADER_PX - el.scrollLeft + playheadX;
    const isPlayheadVisible = playheadViewX >= TRACK_HEADER_PX && playheadViewX <= el.clientWidth;
    
    // Priority 1: Playhead if visible
    if (isPlayheadVisible) {
      const timeSec = playheadX / PX_PER_SEC;
      return { timeSec, viewportX: playheadViewX };
    }
    
    // Priority 2: Mouse cursor if provided
    if (mouseClientX !== undefined) {
      const rect = el.getBoundingClientRect();
      const viewportX = Math.max(TRACK_HEADER_PX, Math.min(el.clientWidth, mouseClientX - rect.left));
      const timelineX = viewportX - TRACK_HEADER_PX + el.scrollLeft;
      const timeSec = timelineX / PX_PER_SEC;
      return { timeSec, viewportX };
    }
    
    // Priority 3: Timeline center
    const centerViewportX = TRACK_HEADER_PX + (el.clientWidth - TRACK_HEADER_PX) / 2;
    const timelineX = centerViewportX - TRACK_HEADER_PX + el.scrollLeft;
    const timeSec = timelineX / PX_PER_SEC;
    return { timeSec, viewportX: centerViewportX };
  }, [playheadX, PX_PER_SEC]);
  
  /**
   * Apply zoom while preserving the anchor point's visual position
   */
  const applyZoom = useCallback((newZoom: number, anchorTimeSec: number, anchorViewportX: number) => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Clamp zoom to valid range
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    setZoomLevel(clampedZoom);
    
    // Calculate new timeline position for the anchor time
    const newPxPerSec = BASE_PX_PER_SEC * clampedZoom;
    const newTimelineX = anchorTimeSec * newPxPerSec;
    
    // Calculate required scroll to keep anchor at same viewport position
    const newScrollLeft = newTimelineX - (anchorViewportX - TRACK_HEADER_PX);
    
    // Apply scroll in next frame to allow zoom state to update
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        programmaticScrollRef.current = true;
        scrollRef.current.scrollLeft = Math.max(0, newScrollLeft);
        requestAnimationFrame(() => {
          programmaticScrollRef.current = false;
        });
      }
    });
  }, []);
  
  /**
   * Zoom to fit entire timeline in viewport
   */
  const zoomToFit = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const availableWidth = el.clientWidth - TRACK_HEADER_PX;
    const requiredZoom = (availableWidth / timelineSec) / BASE_PX_PER_SEC;
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, requiredZoom));
    
    setZoomLevel(clampedZoom);
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        programmaticScrollRef.current = true;
        scrollRef.current.scrollLeft = 0;
        requestAnimationFrame(() => {
          programmaticScrollRef.current = false;
        });
      }
    });
  }, [timelineSec]);
  
  /**
   * Reset zoom to 100%
   */
  const resetZoom = useCallback(() => {
    const anchor = getZoomAnchor();
    applyZoom(DEFAULT_ZOOM, anchor.timeSec, anchor.viewportX);
  }, [getZoomAnchor, applyZoom]);
  
  /**
   * Zoom in (increase zoom level)
   */
  const zoomIn = useCallback(() => {
    const anchor = getZoomAnchor();
    applyZoom(zoomLevel * 1.5, anchor.timeSec, anchor.viewportX);
  }, [zoomLevel, getZoomAnchor, applyZoom]);
  
  /**
   * Zoom out (decrease zoom level)
   */
  const zoomOut = useCallback(() => {
    const anchor = getZoomAnchor();
    applyZoom(zoomLevel / 1.5, anchor.timeSec, anchor.viewportX);
  }, [zoomLevel, getZoomAnchor, applyZoom]);

  // Tick spacing based on zoom to keep labels readable
  const tickConfig = useMemo(() => {
    const desiredMajorPx = 120; // target distance between major ticks
    
    // At very high zoom (>10x), show frame-level grid
    if (zoomLevel >= 10) {
      const frameSec = 1 / FPS;
      const framePx = frameSec * PX_PER_SEC;
      
      // Show every frame if pixels per frame > 20
      if (framePx >= 20) {
        return {
          majorSec: frameSec * 10, // Every 10 frames
          minorSec: frameSec,
          majorPx: frameSec * 10 * PX_PER_SEC,
          minorPx: framePx,
        };
      }
      // Show every 5 frames
      return {
        majorSec: frameSec * 30, // Every 30 frames (1 sec at 30fps)
        minorSec: frameSec * 5,
        majorPx: frameSec * 30 * PX_PER_SEC,
        minorPx: frameSec * 5 * PX_PER_SEC,
      };
    }
    
    // Standard time-based intervals for normal zoom levels
    const candidates = [
      1/FPS,      // 1 frame
      1/FPS * 5,  // 5 frames
      0.25,       // quarter second
      0.5,        // half second
      1,          // 1 second
      2, 5, 10, 15, 30, 60, 120, 300, 600  // seconds/minutes
    ];
    
    let majorSec = candidates[candidates.length - 1];
    for (const c of candidates) {
      if (c * PX_PER_SEC >= desiredMajorPx) { majorSec = c; break; }
    }
    const minorSec = majorSec / 4;
    const majorPx = majorSec * PX_PER_SEC;
    const minorPx = minorSec * PX_PER_SEC;
    return { majorSec, minorSec, majorPx, minorPx };
  }, [PX_PER_SEC, zoomLevel, FPS]);

  // Generate ticks only for the visible range
  const ticks = useMemo(() => {
    const { majorSec, minorSec } = tickConfig;
    const firstMajor = Math.floor(visibleStartSec / majorSec) * majorSec;
    const list: Array<{ sec: number; kind: 'major' | 'minor' | 'frame' }> = [];
    
    // At very high zoom, mark frames explicitly
    const isFrameLevel = zoomLevel >= 10;
    
    for (let s = firstMajor; s <= visibleEndSec; s += minorSec) {
      const isMajor = Math.abs((s / minorSec) % 4) < 1e-6; // every 4 minors
      list.push({ 
        sec: s, 
        kind: isFrameLevel ? (isMajor ? 'major' : 'frame') : (isMajor ? 'major' : 'minor')
      });
    }
    return list;
  }, [tickConfig, visibleStartSec, visibleEndSec, zoomLevel]);

  // Memoize snap targets to prevent recreation
  const snapTargets = useMemo(() => {
    const targets = [playheadX];
    if (inPoint != null) targets.push(inPoint);
    if (outPoint != null) targets.push(outPoint);
    return targets;
  }, [playheadX, inPoint, outPoint]);

  // Memoize formatTimecode
  const formatTimecode = useCallback((seconds: number) => {
    const fps = FPS;
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);
    const frames = Math.floor((seconds - Math.floor(seconds)) * fps);
    const pad = (n: number, l = 2) => n.toString().padStart(l, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`;
  }, [FPS]);

  // Memoize btnClass
  const btnClass = useCallback((active: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded transition-colors ${active ? "text-accent bg-studio-panel-alt" : "text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt"}`, []);

  const handleRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // x within scroll container
    let px = Math.max(0, x - TRACK_HEADER_PX + el.scrollLeft);
    if (snapping) {
      const step = tickConfig.minorPx; // minor tick
      px = Math.round(px / step) * step;
    }
    setPlayheadX(px);
  }, [snapping, tickConfig.minorPx]);

  const handleRulerMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    lastPointerClientX.current = e.clientX;
    hoverActive.current = true;
    const x = e.clientX - rect.left; // relative to scroll container
    const minX = Math.round(TRACK_HEADER_PX - el.scrollLeft);
    setHoverX(Math.max(minX, Math.round(x)));
  }, []);

  const handleRulerLeave = useCallback(() => { 
    setHoverX(null); 
    hoverActive.current = false; 
    lastPointerClientX.current = null; 
  }, []);

  // Content skimmer (follows mouse across ruler and tracks when enabled)
  const handleContentMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!skimmerEnabled || draggingPlayhead || isPanning) return;
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    lastPointerClientX.current = e.clientX;
    hoverActive.current = true;
    const x = e.clientX - rect.left; // relative to scroll container
    const minX = Math.round(TRACK_HEADER_PX - el.scrollLeft);
    setHoverX(Math.max(minX, Math.round(x)));
  }, [skimmerEnabled, draggingPlayhead, isPanning]);

  const handleContentLeave = useCallback(() => { 
    if (hoverX !== null) setHoverX(null); 
    hoverActive.current = false; 
    lastPointerClientX.current = null; 
  }, [hoverX]);

  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Set playhead where clicked (like NLEs). Ignore if panning tool active.
    if (tool === "hand") return;
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const px = Math.max(0, x - TRACK_HEADER_PX + el.scrollLeft);
    setPlayheadX(px);
    if (playing) setPlaying(false);
  }, [tool, playing]);

  // Hand tool panning  
  const onContentMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!(tool === "hand" || spaceHand)) return;
    const el = scrollRef.current;
    if (!el) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    e.preventDefault();
  }, [tool, spaceHand]);

  // Keyboard shortcuts similar to NLEs
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === " ") {
        setPlaying((p) => !p);
        e.preventDefault();
        return;
      }
      const k = e.key.toLowerCase();
      
      // Zoom shortcuts
      if ((k === "=" || k === "+") && (e.ctrlKey || e.metaKey)) {
        zoomIn();
        e.preventDefault();
        return;
      } else if ((k === "-" || k === "_") && (e.ctrlKey || e.metaKey)) {
        zoomOut();
        e.preventDefault();
        return;
      } else if (k === "0" && (e.ctrlKey || e.metaKey)) {
        resetZoom();
        e.preventDefault();
        return;
      } else if (k === "f" && (e.ctrlKey || e.metaKey)) {
        zoomToFit();
        e.preventDefault();
        return;
      }
      
      // Tool shortcuts
      if (k === "v") setTool("selection");
      else if (k === "c") setTool("razor");
      else if (k === "h") setTool("hand");
      else if (k === "t") setTool("type");
      else if (k === "s") setSnapping((s) => !s);
      else if (k === "i") setInPoint(playheadX);
      else if (k === "o") setOutPoint(playheadX);
      else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const frames = e.shiftKey ? 5 : 1;
        const deltaPx = (frames / FPS) * PX_PER_SEC;
        setPlayheadX((x) => Math.max(0, e.key === "ArrowLeft" ? x - deltaPx : x + deltaPx));
        e.preventDefault();
      } else if (e.key === "Home") {
        setPlayheadX(0);
        e.preventDefault();
      } else if (e.key === "End") {
        setPlayheadX(timelineSec * PX_PER_SEC);
        e.preventDefault();
      }
    };
    const onKeyUp = (_e: KeyboardEvent) => {};
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [playheadX, FPS, PX_PER_SEC, timelineSec, setPlaying, zoomIn, zoomOut, resetZoom, zoomToFit]);
  
  // Playhead drag
  const onPlayheadMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setDraggingPlayhead(true);
    e.preventDefault();
    e.stopPropagation(); // Prevent other handlers
  }, []);

  useEffect(() => {
    if (!isPanning) return;
    const el = scrollRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      if (!panStart.current) return;
      const dx = e.clientX - panStart.current.x;
      el.scrollLeft = panStart.current.scrollLeft - dx;
    };
    const onUp = () => {
      setIsPanning(false);
      panStart.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPanning]);

  useEffect(() => {
    if (!draggingPlayhead) return;
    const el = scrollRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let px = Math.max(0, x - TRACK_HEADER_PX + el.scrollLeft);
      if (snapping) {
        const step = tickConfig.minorPx;
        px = Math.round(px / step) * step;
      }
      setPlayheadX(px);
    };
    const onUp = () => setDraggingPlayhead(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [draggingPlayhead, snapping, tickConfig.minorPx]);

  // Keep a ref of playhead for RAF loop
  useEffect(() => { playheadXRef.current = playheadX; }, [playheadX]);

  // Playback loop (30fps-ish using rAF and dt)
  useEffect(() => {
    if (!playing) {
      if (playRaf.current) cancelAnimationFrame(playRaf.current);
      playRaf.current = null;
      lastTsRef.current = null;
      return;
    }
    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const newX = playheadXRef.current + dt * PX_PER_SEC;
      
      // Auto-extend at end instead of stopping
      const timelineEndPx = timelineSec * PX_PER_SEC;
      if (newX >= timelineEndPx - 1) {
        setTimelineSec((s) => s + 60);
      }
      
      setPlayheadX(newX);
      // Follow playhead near right/left edges
      const el = scrollRef.current;
      if (el) {
        const ctiViewX = (TRACK_HEADER_PX - el.scrollLeft) + newX;
        const rightThreshold = el.clientWidth - 120;
        const leftThreshold = TRACK_HEADER_PX + 20;
        if (ctiViewX > rightThreshold) {
          programmaticScrollRef.current = true;
          el.scrollLeft += ctiViewX - rightThreshold;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              programmaticScrollRef.current = false;
            });
          });
        } else if (ctiViewX < leftThreshold) {
          programmaticScrollRef.current = true;
          el.scrollLeft -= (leftThreshold - ctiViewX);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              programmaticScrollRef.current = false;
            });
          });
        }
      }
      playRaf.current = requestAnimationFrame(step);
    };
    playRaf.current = requestAnimationFrame(step);
    return () => { if (playRaf.current) cancelAnimationFrame(playRaf.current); playRaf.current = null; lastTsRef.current = null; };
  }, [playing, PX_PER_SEC, timelineSec]);

  const currentSeconds = playheadX / PX_PER_SEC;
  const trackHeight = trackHeightZoom; // Use dynamic track height from zoom

  return (
    <div className="h-full bg-studio-timeline flex flex-col">
      {/* Panel Header with Toolbar */}
  <div className="shrink-0 bg-studio-panel h-10 flex items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(tool === "selection")} onClick={() => setTool("selection")} aria-pressed={tool === "selection"} aria-label="Selection (V)">
                <Move className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Selection (V)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(tool === "razor")} onClick={() => setTool("razor")} aria-pressed={tool === "razor"} aria-label="Razor (C)">
                <Scissors className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Razor (C)</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border/50 mx-1"></div>

          {/* Skimmer Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(skimmerEnabled)} onClick={() => setSkimmerEnabled((v) => !v)} aria-pressed={skimmerEnabled} aria-label="Skimmer">
                <MousePointer2 className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Skimmer</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border/50 mx-1"></div>

          {/* Zoom Controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(false)} onClick={zoomOut} aria-label="Zoom Out">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out (Ctrl/⌘ + Scroll)</TooltipContent>
          </Tooltip>

          {/* Zoom Slider */}
          <div className="flex items-center gap-2 px-2">
            <Slider
              value={[Math.log(zoomLevel) / Math.log(MAX_ZOOM / MIN_ZOOM) * 100]}
              onValueChange={(values) => {
                const normalizedValue = values[0] / 100; // 0 to 1
                const newZoom = MIN_ZOOM * Math.pow(MAX_ZOOM / MIN_ZOOM, normalizedValue);
                const anchor = getZoomAnchor();
                applyZoom(newZoom, anchor.timeSec, anchor.viewportX);
              }}
              max={100}
              step={0.1}
              className="w-24"
              aria-label="Zoom level"
            />
            <span className="text-[10px] text-muted-foreground font-mono w-10 text-right">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(false)} onClick={zoomIn} aria-label="Zoom In">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Zoom In (Ctrl/⌘ + Scroll)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(false)} onClick={zoomToFit} aria-label="Fit Timeline">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Fit Timeline</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border/50 mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(tool === "hand")} onClick={() => setTool("hand")} aria-pressed={tool === "hand"} aria-label="Hand (H)">
                <Hand className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Hand (H)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(tool === "type")} onClick={() => setTool("type")} aria-pressed={tool === "type"} aria-label="Type (T)">
                <Type className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Type (T)</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border/50 mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(snapping)} onClick={() => setSnapping((s) => !s)} aria-pressed={snapping} aria-label="Snapping (S)">
                <Magnet className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Snapping (S)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(linked)} onClick={() => setLinked((l) => !l)} aria-pressed={linked} aria-label="Linked Selection">
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Linked Selection</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className={btnClass(tallTracks)} onClick={() => setTallTracks((t) => !t)} aria-pressed={tallTracks} aria-label="Toggle Track Height">
                <ChevronsUpDown className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Track Height</TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-border/50 mx-1"></div>

          {/* Mark In/Out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={btnClass(false)}
                onClick={() => setInPoint(playheadX)}
                aria-label="Mark In (I)"
              >
                <ArrowLeftToLine className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Mark In (I)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={btnClass(false)}
                onClick={() => setOutPoint(playheadX)}
                aria-label="Mark Out (O)"
              >
                <ArrowRightToLine className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Mark Out (O)</TooltipContent>
          </Tooltip>
        </div>

      </div>
      
      {/* Timeline Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto relative bg-studio-panel"
          onMouseDown={onContentMouseDown}
          onMouseMove={handleContentMove}
          onMouseLeave={handleContentLeave}
          onClick={handleContentClick}
          onWheel={(e) => {
            const el = scrollRef.current;
            if (!el) return;
            
            // Alt/Option + wheel => vertical track height zoom
            if (e.altKey) {
              e.preventDefault();
              const delta = -e.deltaY; // Invert for natural direction
              const zoomFactor = 1 + (Math.abs(delta) / 500); // Smooth scaling
              const newHeight = delta > 0
                ? trackHeightZoom * zoomFactor
                : trackHeightZoom / zoomFactor;
              setTrackHeightZoom(Math.max(MIN_TRACK_HEIGHT, Math.min(MAX_TRACK_HEIGHT, newHeight)));
              return;
            }
            
            // Ctrl/Cmd + wheel => horizontal timeline zoom
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              
              // Get current anchor point (prefer playhead, fallback to mouse)
              const anchor = getZoomAnchor(e.clientX);
              
              // Logarithmic zoom with acceleration
              const delta = -e.deltaY; // Invert for natural direction (up = zoom in)
              const scrollSpeed = Math.abs(delta);
              
              // Accelerated zoom: faster scrolling = bigger zoom jumps
              const baseZoomFactor = scrollSpeed > 50 ? 1.15 : 1.08;
              const zoomFactor = delta > 0 ? baseZoomFactor : 1 / baseZoomFactor;
              
              const newZoom = zoomLevel * zoomFactor;
              applyZoom(newZoom, anchor.timeSec, anchor.viewportX);
              return;
            }
            
            // Shift + wheel => horizontal scroll
            if (e.shiftKey) {
              el.scrollLeft += e.deltaY;
            }
          }}
          style={{ cursor: tool === "hand" || spaceHand ? (isPanning ? "grabbing" : "grab") : "default" }}
        >
        {/* Ruler / Time Scale */}
        <div
          className="h-8 bg-studio-panel flex items-end sticky top-0 z-20"
          onClick={handleRulerClick}
          onMouseMove={handleRulerMove}
          onMouseLeave={handleRulerLeave}
        >
          // Track header spacer (scrolls with content)
          <div className="w-40 h-full shrink-0 bg-studio-panel border-r border-border"></div>
          // Timeline canvas for ticks
          <div className="relative bg-studio-panel" style={{ width: `${timelineWidthPx}px`, height: '100%' }}>
            {ticks.map((t, idx) => {
              const left = Math.round(t.sec * PX_PER_SEC);
              const isMajor = t.kind === 'major';
              const isFrame = t.kind === 'frame';
              
              // At high zoom, show frame numbers; otherwise show time
              let label = null;
              if (isMajor) {
                if (zoomLevel >= 10) {
                  // Show frame number
                  const frameNum = Math.round(t.sec * FPS);
                  label = `${frameNum}`;
                } else {
                  // Show timecode
                  label = formatLabel(t.sec);
                }
              }
              
              return (
                <div key={idx} className="absolute bottom-0 z-10" style={{ left }}>
                  {label && (
                    <span className="absolute bottom-[14px] text-[10px] text-muted-foreground font-mono -translate-x-1/2">
                      {label}
                    </span>
                  )}
                  <div className={`w-px ${
                    isMajor ? 'h-2 bg-muted-foreground' : 
                    isFrame ? 'h-1.5 bg-accent/40' : 
                    'h-1.5 bg-muted-foreground/60'
                  }`}></div>
                </div>
              );
            })}
          </div>
          {/* Continuous bottom line under the ruler (header + tick canvas) */}
          <div
            className="absolute bottom-0 left-0 h-px bg-border pointer-events-none"
            style={{ width: `${TRACK_HEADER_PX + timelineWidthPx}px` }}
          />
        </div>

        {/* Playhead (CTI) */}
        <div
          className="absolute top-8 z-20 h-[calc(100%-2rem)] w-px bg-accent cursor-col-resize"
          style={{ left: `${TRACK_HEADER_PX - scrollLeft + playheadX}px` }}
          onMouseDown={onPlayheadMouseDown}
        >
          {/* Playhead cap (triangle) */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "8px solid hsl(var(--accent))",
            }}
          />
          <div className="w-3 h-3 bg-accent rounded-full absolute -top-1 -left-[5px]"></div>
        </div>

        {/* Playhead timecode while dragging */}
        {draggingPlayhead && (
          <div
            className="absolute top-0 z-30 -translate-x-1/2 px-1.5 py-0.5 rounded bg-studio-panel-alt border border-border text-[10px] text-muted-foreground"
            style={{ left: `${TRACK_HEADER_PX - scrollLeft + playheadX}px` }}
          >
            {formatTimecode(currentSeconds)}
          </div>
        )}

        {/* Skimmer */}
        {hoverX !== null && skimmerEnabled && !draggingPlayhead && (
          <div
            className="absolute top-8 z-10 h-[calc(100%-2rem)] w-px bg-border/60"
            style={{ left: `${Math.round(hoverX)}px` }}
          />
        )}
        {hoverX !== null && skimmerEnabled && !draggingPlayhead && (
          <div
            className="absolute top-0 z-20 -translate-x-1/2 px-1.5 py-0.5 rounded bg-studio-panel-alt border border-border text-[10px] text-muted-foreground"
            style={{ left: `${Math.round(hoverX)}px` }}
          >
            {formatTimecode(Math.max(0, (hoverX - TRACK_HEADER_PX + scrollLeft) / PX_PER_SEC))}
          </div>
        )}
        
        {/* Tracks */}
        <div className="relative">
          {/* Video Track */}
          <div className="flex" style={{ height: `${trackHeight}px` }}>
            <div className="w-40 bg-studio-panel flex items-center px-2 border-r border-border border-b shrink-0">
              <div className="flex items-center gap-3 text-muted-foreground">
                <button className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                <button className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"><Lock className="w-3.5 h-3.5" /></button>
              </div>
              <div className="ml-2">
                <Film className="w-3.5 h-3.5 text-muted-foreground mb-0.5" />
                <span className="text-[10px] text-muted-foreground font-medium">V1</span>
              </div>
            </div>
            <div className="flex-1 bg-studio-timeline relative">
              {/* Timeline canvas area for grid and clips */}
              <div className="relative p-1" style={{ width: `${timelineWidthPx}px` }}>
                {/* Gridlines - only render visible */}
                {ticks.map((t, i) => (
                  <div key={`v-${i}`} className={`absolute top-0 ${t.kind === 'major' ? 'bg-white/10' : 'bg-white/5'}`} style={{ left: `${Math.round(t.sec * PX_PER_SEC)}px`, width: '1px', height: `${trackHeight}px` }} />
                ))}
                {/* Sample Clip */}
                <ClipSample
                  leftPx={clipStartSec * PX_PER_SEC}
                  widthPx={clipDurSec * PX_PER_SEC}
                  color="blue"
                  snapping={snapping}
                  gridPx={tickConfig.minorPx}
                  snapTargets={snapTargets}
                  onChange={(leftPx, widthPx) => {
                    setClipStartSec(Math.max(0, leftPx / PX_PER_SEC));
                    setClipDurSec(Math.max(0.1, widthPx / PX_PER_SEC));
                  }}
                />
              </div>
              {/* Continuous separator between Video and Audio across scrollable content */}
              <div
                className="absolute bottom-0 left-0 h-px bg-border pointer-events-none"
                style={{ width: `${timelineWidthPx}px` }}
              />
            </div>
          </div>
          
          {/* Audio Track */}
          <div className="flex" style={{ height: `${trackHeight}px` }}>
            <div className="w-40 bg-studio-panel flex items-center px-2 border-r border-border shrink-0">
              <div className="flex items-center gap-3 text-muted-foreground">
                <button
                  className={`w-5 h-5 flex items-center justify-center ${audioMute ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setAudioMute(m => !m)}
                  title="Mute"
                >
                  {audioMute ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  className={`w-5 h-5 flex items-center justify-center ${audioSolo ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setAudioSolo(s => !s)}
                  title="Solo"
                >
                  <Headphones className="w-3.5 h-3.5" />
                </button>
                <button className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground" title="Lock Track"><Lock className="w-3.5 h-3.5" /></button>
              </div>
              <div className="ml-2">
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground mb-0.5" />
                <span className="text-[10px] text-muted-foreground font-medium">A1</span>
              </div>
            </div>
            <div className="flex-1 bg-studio-timeline relative">
              <div className="relative" style={{ width: `${timelineWidthPx}px`, height: '100%' }}>
                {/* Gridlines */}
                {ticks.map((t, i) => (
                  <div key={`a-${i}`} className={`absolute top-0 ${t.kind === 'major' ? 'bg-white/10' : 'bg-white/5'}`} style={{ left: `${Math.round(t.sec * PX_PER_SEC)}px`, width: '1px', height: `${trackHeight}px` }} />
                ))}
                {/* Faux waveform clip */}
                <div
                  className="absolute top-1 h-14 bg-emerald-500/10 border border-emerald-400/60 rounded-sm flex items-center px-2 overflow-hidden"
                  style={{ left: `${clipStartSec * PX_PER_SEC}px`, width: `${clipDurSec * PX_PER_SEC}px` }}
                >
                  <div className="w-full h-8 flex items-end gap-[2px] opacity-80">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div key={i} className="w-[2px] bg-emerald-400/70" style={{ height: `${(Math.sin(i / 3) * 0.5 + 0.5) * 100}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marked In/Out highlight */}
          {inPoint !== null && outPoint !== null && outPoint > inPoint && (
            <div
              className="absolute top-8 left-40 right-0 h-[calc(100%-2rem)] pointer-events-none"
            >
              <div
                className="absolute top-0 h-full bg-accent/10 border-x border-accent/40"
                style={{
                  left: `${Math.round(TRACK_HEADER_PX - scrollLeft + inPoint)}px`,
                  width: `${outPoint - inPoint}px`,
                }}
              />
            </div>
          )}
        </div>
      </div>

  {/* Status Bar */}
  <div className="h-6 bg-studio-panel-alt shrink-0 px-3 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span>Ready</span>
        <span>Timecode: {formatTimecode(currentSeconds)}</span>
      </div>
    </div>
  );
};

// Time label formatter for ruler major ticks (MM:SS or HH:MM:SS)
function formatLabel(sec: number) {
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  const pad = (n: number, l = 2) => n.toString().padStart(l, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}
