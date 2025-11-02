import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Film, Volume2, Scissors, Hand, Move, Type, ZoomIn, Magnet, Link2, Lock, Eye, VolumeX, Plus, Minus, Headphones, ChevronsUpDown, ArrowLeftToLine, ArrowRightToLine, MousePointer2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useProject } from "@/context/ProjectContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Draggable/Resizable clip sample with basic snapping
function ClipSample({
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
}) {
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
    window.addEventListener('mouseup', onUp, { once: true });
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
}

/**
 * Timeline Component
 * Bottom panel - toolbar, ruler, video tracks, audio tracks
 */
export const Timeline = () => {
  const { data, setZoom } = useProject();
  const zoom = data.zoom; // px per 5 seconds (base scale)
  // Zoom mapping 0–500% => px per 5 seconds
  const BASE_ZOOM = 192; // 100%
  const ZOOM_MIN_PX = 1; // treat 0% as ~1px per 5s to avoid zero
  const ZOOM_MAX_PX = BASE_ZOOM * 5; // 500%
  const zoomPercent = useMemo(() => {
    const pct = (zoom / BASE_ZOOM) * 100;
    return Math.max(0, Math.min(500, pct));
  }, [zoom]);
  // Derived timeline scale
  const PX_PER_SEC = useMemo(() => Math.max(zoom, ZOOM_MIN_PX) / 5, [zoom]);
  const FPS = 30;
  const [tool, setTool] = useState<"selection" | "razor" | "hand" | "type" | "zoom">("selection");
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
  const pinPlayheadOnScrollRef = useRef<boolean>(true);
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
  // Growable timeline length (seconds). Auto-extends as you scroll near the right edge.
  const [timelineSec, setTimelineSec] = useState<number>(60); // start with 1 minute
  // Simple linked A/V clip demo state (seconds)
  const [clipStartSec, setClipStartSec] = useState<number>(1);
  const [clipDurSec, setClipDurSec] = useState<number>(3);

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
      // Auto-extend when near the far right to simulate an "infinite" timeline
      const totalContentPx = TRACK_HEADER_PX + timelineSec * PX_PER_SEC;
      if (el.scrollLeft + el.clientWidth > totalContentPx - 800) {
        setTimelineSec((s) => s + 60); // extend by 60s chunks
      }
      // Keep skimmer under the cursor while scrolling
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

  // Track the most recent px-per-sec so time conversions stay accurate across rapid zoom changes
  const pxPerSecRef = useRef(PX_PER_SEC);
  useEffect(() => { pxPerSecRef.current = PX_PER_SEC; }, [PX_PER_SEC]);
  const playheadSecRef = useRef(0);
  useEffect(() => { playheadSecRef.current = playheadX / pxPerSecRef.current; }, [playheadX]);

  // Helper: zoom anchored at a screen X within the scroll container
  // Options:
  //  - preservePlayhead: keep the current playhead time constant across zoom
  //  - anchorTimeSec: explicitly set which timeline time should remain under xWithin after zoom
  const applyZoomAtX = useCallback((newZoom: number, xWithin: number, opts?: { preservePlayhead?: boolean; anchorTimeSec?: number }) => {
    const el = scrollRef.current;
    if (!el) { setZoom(newZoom); return; }
    const oldPxPerSec = PX_PER_SEC;
    const oldPlayheadSec = playheadX / oldPxPerSec;
  // Ensure the anchor x is in the scrollable content area (to avoid negative anchor when center < header)
  const x = Math.max(TRACK_HEADER_PX, Math.min(el.clientWidth, xWithin));
    const anchorSec = (opts?.anchorTimeSec != null)
      ? opts.anchorTimeSec
      : Math.max(0, el.scrollLeft - TRACK_HEADER_PX + x) / oldPxPerSec; // based on current scale
    // Guard programmatic side-effects across zoom + scrollLeft and next frame
    programmaticScrollRef.current = true;
    setZoom(newZoom);
    const newPxPerSec = Math.max(newZoom, ZOOM_MIN_PX) / 5;
    pxPerSecRef.current = newPxPerSec;
    if (opts?.preservePlayhead) {
      const newPlayheadX = oldPlayheadSec * newPxPerSec;
      setPlayheadX(newPlayheadX);
      playheadSecRef.current = oldPlayheadSec;
    }
    requestAnimationFrame(() => {
      const desiredScrollLeft = TRACK_HEADER_PX + anchorSec * newPxPerSec - x;
      const contentWidth = TRACK_HEADER_PX + timelineSec * newPxPerSec;
      const maxScrollLeft = Math.max(0, contentWidth - el.clientWidth);
      const clamped = Math.max(0, Math.min(maxScrollLeft, desiredScrollLeft));
      el.scrollLeft = clamped;
      // Clear on next frame to allow any scroll events due to relayout to settle
      requestAnimationFrame(() => { programmaticScrollRef.current = false; });
    });
  }, [PX_PER_SEC, ZOOM_MIN_PX, scrollRef, setZoom, playheadX, timelineSec]);

  // Lock anchor during slider drags so repeated updates reuse the same screen position
  const sliderActiveRef = useRef<boolean>(false);
  const zoomAnchorLockRef = useRef<null | { xWithin: number; anchorTimeSec: number }>(null);

  // Helper: anchor all non-wheel zooms at the playhead and apply zoom immediately
  const applyZoomSmart = useCallback((newZoom: number) => {
    const el = scrollRef.current;
    if (!el) { setZoom(newZoom); return; }

  const playheadSec = playheadSecRef.current;
    const playheadViewX = (TRACK_HEADER_PX - el.scrollLeft) + playheadX;
  const epsilon = 0.5;
  const visible = playheadViewX >= TRACK_HEADER_PX - epsilon && playheadViewX <= el.clientWidth + epsilon;
    const contentCenter = TRACK_HEADER_PX + Math.max(0, el.clientWidth - TRACK_HEADER_PX) / 2;
    const xWithin = visible
      ? Math.max(TRACK_HEADER_PX, Math.min(el.clientWidth, playheadViewX))
      : contentCenter;

    const anchor = sliderActiveRef.current && zoomAnchorLockRef.current
      ? zoomAnchorLockRef.current
  : { xWithin, anchorTimeSec: playheadSec };

    applyZoomAtX(newZoom, anchor.xWithin, { preservePlayhead: true, anchorTimeSec: anchor.anchorTimeSec });

    // After the zoom lands, read back where that anchor ended up so the next tick
    // nudges from the actual post-layout position. This minimizes visible “jumping”.
    if (sliderActiveRef.current) {
      requestAnimationFrame(() => {
        const elAfter = scrollRef.current;
        if (!elAfter) return;
        const anchorTimelineX = anchor.anchorTimeSec * pxPerSecRef.current;
        const viewX = (TRACK_HEADER_PX - elAfter.scrollLeft) + anchorTimelineX;
        const clampedViewX = Math.max(TRACK_HEADER_PX, Math.min(elAfter.clientWidth, viewX));
        zoomAnchorLockRef.current = {
          xWithin: clampedViewX,
          anchorTimeSec: anchor.anchorTimeSec,
        };
      });
    }

    if (!sliderActiveRef.current) {
      zoomAnchorLockRef.current = null;
    }
  }, [applyZoomAtX, playheadX, setZoom]);

  // Tick spacing based on zoom to keep labels readable
  const tickConfig = useMemo(() => {
    const desiredMajorPx = 120; // target distance between major ticks
    const candidates = [0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    let majorSec = candidates[candidates.length - 1];
    for (const c of candidates) {
      if (c * PX_PER_SEC >= desiredMajorPx) { majorSec = c; break; }
    }
    const minorSec = majorSec / 4;
    const majorPx = majorSec * PX_PER_SEC;
    const minorPx = minorSec * PX_PER_SEC;
    return { majorSec, minorSec, majorPx, minorPx };
  }, [PX_PER_SEC]);

  // Generate ticks only for the visible range
  const ticks = useMemo(() => {
    const { majorSec, minorSec } = tickConfig;
    const firstMajor = Math.floor(visibleStartSec / majorSec) * majorSec;
    const list: Array<{ sec: number; kind: 'major' | 'minor' }> = [];
    for (let s = firstMajor; s <= visibleEndSec; s += minorSec) {
      const isMajor = Math.abs((s / minorSec) % 4) < 1e-6; // every 4 minors
      list.push({ sec: s, kind: isMajor ? 'major' : 'minor' });
    }
    return list;
  }, [tickConfig, visibleStartSec, visibleEndSec]);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };

  const handleRulerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    lastPointerClientX.current = e.clientX;
    hoverActive.current = true;
    const x = e.clientX - rect.left; // relative to scroll container
    const minX = Math.round(TRACK_HEADER_PX - el.scrollLeft);
    setHoverX(Math.max(minX, Math.round(x)));
  };

  const handleRulerLeave = () => { setHoverX(null); hoverActive.current = false; lastPointerClientX.current = null; };

  // Content skimmer (follows mouse across ruler and tracks when enabled)
  const handleContentMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!skimmerEnabled || draggingPlayhead || isPanning) return;
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    lastPointerClientX.current = e.clientX;
    hoverActive.current = true;
    const x = e.clientX - rect.left; // relative to scroll container
    const minX = Math.round(TRACK_HEADER_PX - el.scrollLeft);
    setHoverX(Math.max(minX, Math.round(x)));
  };
  const handleContentLeave = () => { if (hoverX !== null) setHoverX(null); hoverActive.current = false; lastPointerClientX.current = null; };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Set playhead where clicked (like NLEs). Ignore if panning tool active.
    if (tool === "hand") return;
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const px = Math.max(0, x - TRACK_HEADER_PX + el.scrollLeft);
    setPlayheadX(px);
    if (playing) setPlaying(false);
  };

  // Keyboard shortcuts similar to NLEs
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setPlaying((p) => !p);
        e.preventDefault();
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "v") setTool("selection");
      else if (k === "c") setTool("razor");
      else if (k === "h") setTool("hand");
      else if (k === "z") setTool("zoom");
      else if (k === "t") setTool("type");
      else if (k === "s") setSnapping((s) => !s);
      else if (k === "i") setInPoint(playheadX);
      else if (k === "o") setOutPoint(playheadX);
      // Playhead nudge by frame
      else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const frames = e.shiftKey ? 5 : 1;
        const deltaPx = (frames / FPS) * PX_PER_SEC;
        setPlayheadX((x) => Math.max(0, e.key === "ArrowLeft" ? x - deltaPx : x + deltaPx));
        e.preventDefault();
      }
      else if (e.key === "Home") {
        setPlayheadX(0);
        e.preventDefault();
      }
      else if (e.key === "End") {
        setPlayheadX(timelineSec * PX_PER_SEC);
        e.preventDefault();
      }
      else if (e.key === "+" || e.key === "=") {
        const nextPct = Math.min(500, zoomPercent + 10);
        const targetZoom = Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, (nextPct / 100) * BASE_ZOOM));
        applyZoomSmart(targetZoom);
      }
      else if (e.key === "-") {
        const nextPct = Math.max(0, zoomPercent - 10);
        const targetZoom = Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, (nextPct / 100) * BASE_ZOOM));
        applyZoomSmart(targetZoom);
      }
    };
    const onKeyUp = (_e: KeyboardEvent) => {};
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [playheadX, setZoom, zoomPercent, ZOOM_MIN_PX, ZOOM_MAX_PX, BASE_ZOOM, FPS, PX_PER_SEC, timelineSec, setPlaying, applyZoomSmart]);
  // Hand tool panning
  const onContentMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(tool === "hand" || spaceHand)) return;
    const el = scrollRef.current;
    if (!el) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    e.preventDefault();
  };
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
    window.addEventListener("mouseup", onUp, { once: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPanning]);

  // Playhead drag
  const onPlayheadMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDraggingPlayhead(true);
    e.preventDefault();
  };
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
    window.addEventListener("mouseup", onUp, { once: true });
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
          programmaticScrollRef.current = false;
        } else if (ctiViewX < leftThreshold) {
          programmaticScrollRef.current = true;
          el.scrollLeft -= (leftThreshold - ctiViewX);
          programmaticScrollRef.current = false;
        }
      }
      playRaf.current = requestAnimationFrame(step);
    };
    playRaf.current = requestAnimationFrame(step);
    return () => { if (playRaf.current) cancelAnimationFrame(playRaf.current); playRaf.current = null; lastTsRef.current = null; };
  }, [playing, PX_PER_SEC]);

  const formatTimecode = (seconds: number) => {
    const fps = FPS;
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);
    const frames = Math.floor((seconds - Math.floor(seconds)) * fps);
    const pad = (n: number, l = 2) => n.toString().padStart(l, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`;
  };

  const currentSeconds = playheadX / PX_PER_SEC;
  const trackHeight = tallTracks ? 96 : 64;

  const btnBase = "w-7 h-7 flex items-center justify-center rounded transition-colors";
  const btnClass = (active: boolean) =>
    `${btnBase} ${active ? "text-accent bg-studio-panel-alt" : "text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt"}`;

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

          {/* Zoom always anchors at playhead; no toggle */}

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
              <button className={btnClass(tool === "zoom")} onClick={() => setTool("zoom")} aria-pressed={tool === "zoom"} aria-label="Zoom Tool (Z)">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Zoom Tool (Z)</TooltipContent>
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

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors"
            onClick={() => {
              const nextPct = Math.max(0, zoomPercent - 10);
              const targetZoom = Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, (nextPct / 100) * BASE_ZOOM));
              applyZoomSmart(targetZoom);
            }}
            aria-label="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="w-72 px-1 flex items-center gap-2">
            <Slider
              value={[zoomPercent]}
              min={0}
              max={500}
              step={1}
              onPointerDown={() => { sliderActiveRef.current = true; zoomAnchorLockRef.current = null; }}
              onPointerUp={() => { sliderActiveRef.current = false; zoomAnchorLockRef.current = null; }}
              onValueCommit={() => { sliderActiveRef.current = false; zoomAnchorLockRef.current = null; }}
              onValueChange={(v) => {
                const pct = v[0];
                const targetZoom = Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, (pct / 100) * BASE_ZOOM));
                applyZoomSmart(targetZoom);
              }}
            />
            <span className="w-12 text-right tabular-nums text-[11px] text-muted-foreground">{Math.round(zoomPercent)}%</span>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-studio-panel-alt rounded transition-colors"
            onClick={() => {
              const nextPct = Math.min(500, zoomPercent + 10);
              const targetZoom = Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, (nextPct / 100) * BASE_ZOOM));
              applyZoomSmart(targetZoom);
            }}
            aria-label="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
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
            // Ctrl/Cmd + wheel => zoom anchored at playhead (re-centers if off-screen)
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              // wheel: deltaY > 0 => zoom out, < 0 => zoom in
              const factor = Math.exp(-e.deltaY * 0.0015);
              const raw = zoom * factor;
              const newZoom = Math.min(ZOOM_MAX_PX, Math.max(ZOOM_MIN_PX, raw));
              // Anchor wheel zoom at the playhead when visible; otherwise recenter it
              const playheadViewX = (TRACK_HEADER_PX - el.scrollLeft) + playheadX;
              const epsilon = 0.5;
              const visible = playheadViewX > TRACK_HEADER_PX - epsilon && playheadViewX < el.clientWidth + epsilon;
              const contentCenter = TRACK_HEADER_PX + Math.max(0, el.clientWidth - TRACK_HEADER_PX) / 2;
              const xWithin = visible
                ? Math.max(TRACK_HEADER_PX + 0.5, Math.min(el.clientWidth, playheadViewX))
                : contentCenter;
              const anchorTimeSec = playheadX / PX_PER_SEC;
              applyZoomAtX(newZoom, xWithin, { preservePlayhead: true, anchorTimeSec });
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
          {/* Track header spacer (scrolls with content) */}
          <div className="w-40 h-full shrink-0 bg-studio-panel border-r border-border"></div>
          {/* Timeline canvas for ticks */}
          <div className="relative bg-studio-panel" style={{ width: `${timelineWidthPx}px`, height: '100%' }}>
            {ticks.map((t, idx) => {
              const left = Math.round(t.sec * PX_PER_SEC);
              const isMajor = t.kind === 'major';
              const label = isMajor ? formatLabel(t.sec) : null;
              return (
                <div key={idx} className="absolute bottom-0 z-10" style={{ left }}>
                  {isMajor && (
                    <span className="absolute bottom-[14px] text-[10px] text-muted-foreground font-mono -translate-x-1/2">
                      {label}
                    </span>
                  )}
                  <div className={`w-px ${isMajor ? 'h-2 bg-muted-foreground' : 'h-1.5 bg-muted-foreground/60'}`}></div>
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
                  snapTargets={[playheadX, ...(inPoint != null ? [inPoint] : []), ...(outPoint != null ? [outPoint] : [])]}
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
  <span>Zoom: {Math.round(zoomPercent)}%</span>
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
