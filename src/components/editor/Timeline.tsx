import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as React from "react";
import { Film, Volume2, Scissors, Hand, Move, Type, ZoomIn, Magnet, Link2, Lock, Eye, VolumeX, Plus, Minus, Headphones, ChevronsUpDown, ArrowLeftToLine, ArrowRightToLine, MousePointer2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Mock ProjectContext for demo
const useProject = () => {
  const [zoom, setZoom] = useState(192);
  return {
    data: { zoom },
    setZoom,
  };
};

// Draggable/Resizable clip sample with basic snapping
const ClipSample = React.memo(({
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
  gridPx?: number;
  snapTargets?: number[];
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
  const thresholdPx = 8;

  const snapTargetsStr = snapTargets.join(',');
  const applySnap = useCallback((px: number) => {
    if (!snapping) return px;
    let best = px;
    let bestDist = thresholdPx + 1;
    if (gridPx > 0) {
      const g = Math.round(px / gridPx) * gridPx;
      const d = Math.abs(px - g);
      if (d < bestDist) { best = g; bestDist = d; }
    }
    const targets = snapTargetsStr ? snapTargetsStr.split(',').map(Number) : [];
    for (const t of targets) {
      const d = Math.abs(px - t);
      if (d < bestDist) { best = t; bestDist = d; }
    }
    return best;
  }, [snapping, gridPx, snapTargetsStr]);

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
      className={`absolute top-1 h-14 ${colorClasses} border rounded-sm flex items-center px-2 select-none ${selected ? 'ring-1 ring-blue-400/70' : ''}`}
      style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-handle]')) return;
        setSelected(true);
        setDrag({ kind: 'move', startX: e.clientX, startLeft: leftPx, startWidth: widthPx });
        e.stopPropagation();
      }}
      onClick={(e) => { e.stopPropagation(); setSelected((s) => !s); }}
    >
      {selected && (
        <>
          <div
            data-handle
            className="absolute left-[-3px] top-1/2 -translate-y-1/2 w-[6px] h-5 bg-blue-500 rounded-sm cursor-ew-resize"
            onMouseDown={(e) => { setDrag({ kind: 'left', startX: e.clientX, startLeft: leftPx, startWidth: widthPx }); e.stopPropagation(); }}
          />
          <div
            data-handle
            className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-[6px] h-5 bg-blue-500 rounded-sm cursor-ew-resize"
            onMouseDown={(e) => { setDrag({ kind: 'right', startX: e.clientX, startLeft: leftPx, startWidth: widthPx }); e.stopPropagation(); }}
          />
        </>
      )}
      <span className="text-white text-[10px] font-medium truncate">my_awesome_clip.mp4</span>
    </div>
  );
});

ClipSample.displayName = 'ClipSample';

export default function Timeline() {
  const { data, setZoom } = useProject();
  const zoom = data.zoom;
  const BASE_ZOOM = 192;
  const ZOOM_MIN_PX = 1;
  const ZOOM_MAX_PX = BASE_ZOOM * 5;
  const zoomPercent = useMemo(() => {
    const pct = (zoom / BASE_ZOOM) * 100;
    return Math.max(0, Math.min(500, pct));
  }, [zoom]);
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
  const [playheadX, setPlayheadX] = useState(0);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [inPoint, setInPoint] = useState<number | null>(null);
  const [outPoint, setOutPoint] = useState<number | null>(null);
  const [spaceHand, setSpaceHand] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; scrollLeft: number } | null>(null);
  const [draggingPlayhead, setDraggingPlayhead] = useState(false);
  const [clipStartSec, setClipStartSec] = useState<number>(1);
  const [clipDurSec, setClipDurSec] = useState<number>(3);
  
  const snapTargets = useMemo(() => {
    const targets = [playheadX];
    if (inPoint != null) targets.push(inPoint);
    if (outPoint != null) targets.push(outPoint);
    return targets;
  }, [playheadX, inPoint, outPoint]);
  
  const timelineSec = useMemo(() => {
    const clipEndSec = clipStartSec + clipDurSec;
    return Math.max(60, Math.ceil((clipEndSec + 10) / 10) * 10);
  }, [clipStartSec, clipDurSec]);

  const containerRef = scrollRef;
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.clientWidth));
    setContainerWidth(el.clientWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  const TRACK_HEADER_PX = 160;
  const visibleStartPx = Math.max(0, scrollLeft - 160);
  const visibleEndPx = visibleStartPx + containerWidth + 400;
  const visibleStartSec = visibleStartPx / PX_PER_SEC;
  const visibleEndSec = Math.min(timelineSec, Math.max(visibleStartSec, visibleEndPx / PX_PER_SEC));
  const timelineWidthPx = Math.max(timelineSec * PX_PER_SEC, scrollLeft + containerWidth);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    lastScrollLeftRef.current = el.scrollLeft;
    const onScroll = () => {
      const prev = lastScrollLeftRef.current;
      const curr = el.scrollLeft;
      const delta = curr - prev;
      lastScrollLeftRef.current = curr;
      setScrollLeft(curr);
      if (programmaticScrollRef.current) {
        return;
      }
      if (pinPlayheadOnScrollRef.current && !programmaticScrollRef.current && delta !== 0) {
        setPlayheadX((x) => Math.max(0, x + delta));
      }
      if (skimmerEnabled && hoverActive.current && lastPointerClientX.current !== null) {
        const rect = el.getBoundingClientRect();
        const x = lastPointerClientX.current - rect.left;
        const minX = Math.round(TRACK_HEADER_PX - el.scrollLeft);
        setHoverX(Math.max(minX, Math.round(x)));
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [skimmerEnabled]);

  const pxPerSecRef = useRef(PX_PER_SEC);
  useEffect(() => { pxPerSecRef.current = PX_PER_SEC; }, [PX_PER_SEC]);
  const playheadSecRef = useRef(0);
  useEffect(() => { playheadSecRef.current = playheadX / pxPerSecRef.current; }, [playheadX]);

  const applyZoomAtX = useCallback((newZoom: number, xWithin: number, opts?: { preservePlayhead?: boolean; anchorTimeSec?: number }) => {
    const el = scrollRef.current;
    if (!el) { setZoom(newZoom); return; }
    const oldPxPerSec = pxPerSecRef.current;
    const oldPlayheadSec = playheadSecRef.current;
    const x = Math.max(TRACK_HEADER_PX, Math.min(el.clientWidth, xWithin));
    const anchorSec = (opts?.anchorTimeSec != null)
      ? opts.anchorTimeSec
      : Math.max(0, el.scrollLeft - TRACK_HEADER_PX + x) / oldPxPerSec;
    
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
      requestAnimationFrame(() => {
        const elCurrent = scrollRef.current;
        if (!elCurrent) {
          programmaticScrollRef.current = false;
          return;
        }
        const desiredScrollLeft = TRACK_HEADER_PX + anchorSec * newPxPerSec - x;
        const timelineSecCurrent = Math.max(60, Math.ceil((clipStartSec + clipDurSec + 10) / 10) * 10);
        const contentWidth = TRACK_HEADER_PX + timelineSecCurrent * newPxPerSec;
        const maxScrollLeft = Math.max(0, contentWidth - elCurrent.clientWidth);
        const clamped = Math.max(0, Math.min(maxScrollLeft, desiredScrollLeft));
        elCurrent.scrollLeft = clamped;
        requestAnimationFrame(() => { 
          programmaticScrollRef.current = false; 
        });
      });
    });
  }, [ZOOM_MIN_PX, scrollRef, setZoom, clipStartSec, clipDurSec]);

  const sliderActiveRef = useRef<boolean>(false);
  const zoomAnchorLockRef = useRef<null | { xWithin: number; anchorTimeSec: number }>(null);

  const applyZoomSmart = useCallback((newZoom: number) => {
    const el = scrollRef.current;
    if (!el) { setZoom(newZoom); return; }

    const playheadSec = playheadSecRef.current;
    const currentPxPerSec = pxPerSecRef.current;
    const playheadViewX = (TRACK_HEADER_PX - el.scrollLeft) + playheadSec * currentPxPerSec;
    const epsilon = 0.5;
    const visible = playheadViewX >= TRACK_HEADER_PX - epsilon && playheadViewX <= el.clientWidth + epsilon;
    
    const clipCenterSec = clipStartSec + (clipDurSec / 2);
    const clipCenterPx = clipCenterSec * currentPxPerSec;
    const clipCenterViewX = (TRACK_HEADER_PX - el.scrollLeft) + clipCenterPx;
    const clipVisible = clipCenterViewX >= TRACK_HEADER_PX - epsilon && clipCenterViewX <= el.clientWidth + epsilon;
    
    let xWithin: number;
    let anchorTimeSec: number;
    
    if (clipVisible) {
      xWithin = Math.max(TRACK_HEADER_PX, Math.min(el.clientWidth, clipCenterViewX));
      anchorTimeSec = clipCenterSec;
    } else if (visible) {
      xWithin = Math.max(TRACK_HEADER_PX, Math.min(el.clientWidth, playheadViewX));
      anchorTimeSec = playheadSec;
    } else {
      const contentCenter = TRACK_HEADER_PX + Math.max(0, el.clientWidth - TRACK_HEADER_PX) / 2;
      xWithin = contentCenter;
      anchorTimeSec = playheadSec;
    }

    const anchor = sliderActiveRef.current && zoomAnchorLockRef.current
      ? zoomAnchorLockRef.current
      : { xWithin, anchorTimeSec };

    applyZoomAtX(newZoom, anchor.xWithin, { preservePlayhead: true, anchorTimeSec: anchor.anchorTimeSec });

    if (sliderActiveRef.current) {
      requestAnimationFrame(() => {
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
      });
    }

    if (!sliderActiveRef.current) {
      zoomAnchorLockRef.current = null;
    }
  }, [applyZoomAtX, setZoom, clipStartSec, clipDurSec]);

  const tickConfig = useMemo(() => {
    const desiredMajorPx = 120;
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

  const ticks = useMemo(() => {
    const { majorSec, minorSec } = tickConfig;
    const firstMajor = Math.floor(visibleStartSec / majorSec) * majorSec;
    const list: Array<{ sec: number; kind: 'major' | 'minor' }> = [];
    for (let s = firstMajor; s <= visibleEndSec; s += minorSec) {
      const isMajor = Math.abs((s / minorSec) % 4) < 1e-6;
      list.push({ sec: s, kind: isMajor ? 'major' : 'minor' });
    }
    return list;
  }, [tickConfig, visibleStartSec, visibleEndSec]);

  const handleRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let px = Math.max(0, x - TRACK_HEADER_PX + el.scrollLeft);
    if (snapping) {
      const step = tickConfig.minorPx;
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
    const x = e.clientX - rect.left;
    const minX = Math.round(TRACK_HEADER_PX - el.scrollLeft);
    setHoverX(Math.max(minX, Math.round(x)));
  }, []);

  const handleRulerLeave = useCallback(() => { 
    setHoverX(null); 
    hoverActive.current = false; 
    lastPointerClientX.current = null; 
  }, []);

  const handleContentMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!skimmerEnabled || draggingPlayhead || isPanning) return;
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    lastPointerClientX.current = e.clientX;
    hoverActive.current = true;
    const x = e.clientX - rect.left;
    const minX = Math.round(TRACK_HEADER_PX - el.scrollLeft);
    setHoverX(Math.max(minX, Math.round(x)));
  }, [skimmerEnabled, draggingPlayhead, isPanning]);

  const handleContentLeave = useCallback(() => { 
    if (hoverX !== null) setHoverX(null); 
    hoverActive.current = false; 
    lastPointerClientX.current = null; 
  }, [hoverX]);

  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (tool === "hand") return;
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const px = Math.max(0, x - TRACK_HEADER_PX + el.scrollLeft);
    setPlayheadX(px);
    if (playing) setPlaying(false);
  }, [tool, playing]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

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
      else if (k === "i") setInPoint(playheadSecRef.current * pxPerSecRef.current);
      else if (k === "o") setOutPoint(playheadSecRef.current * pxPerSecRef.current);
      else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const frames = e.shiftKey ? 5 : 1;
        const deltaPx = (frames / FPS) * pxPerSecRef.current;
        setPlayheadX((x) => Math.max(0, e.key === "ArrowLeft" ? x - deltaPx : x + deltaPx));
        e.preventDefault();
      }
      else if (e.key === "Home") {
        setPlayheadX(0);
        e.preventDefault();
      }
      else if (e.key === "End") {
        const timelineSecCurrent = Math.max(60, Math.ceil((clipStartSec + clipDurSec + 10) / 10) * 10);
        setPlayheadX(timelineSecCurrent * pxPerSecRef.current);
        e.preventDefault();
      }
      else if (e.key === "+" || e.key === "=") {
        const currentPct = (zoom / BASE_ZOOM) * 100;
        const nextPct = Math.min(500, currentPct + 10);
        const targetZoom = Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, (nextPct / 100) * BASE_ZOOM));
        applyZoomSmart(targetZoom);
        e.preventDefault();
      }
      else if (e.key === "-" || e.key === "_") {
        const currentPct = (zoom / BASE_ZOOM) * 100;
        const nextPct = Math.max(0, currentPct - 10);
        const targetZoom = Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, (nextPct / 100) * BASE_ZOOM));
        applyZoomSmart(targetZoom);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zoom, ZOOM_MIN_PX, ZOOM_MAX_PX, BASE_ZOOM, FPS, applyZoomSmart, clipStartSec, clipDurSec]);

  const onContentMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!(tool === "hand" || spaceHand)) return;
    const el = scrollRef.current;
    if (!el) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    e.preventDefault();
  }, [tool, spaceHand]);

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

  const onPlayheadMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setDraggingPlayhead(true);
    e.preventDefault();
    e.stopPropagation();
  }, []);

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

  useEffect(() => { playheadXRef.current = playheadX; }, [playheadX]);

  useEffect(() => {
    if (!playing) {
      if (playRaf.current) {
        cancelAnimationFrame(playRaf.current);
        playRaf.current = null;
      }
      lastTsRef.current = null;
      return;
    }
    
    const timelineSecCurrent = Math.max(60, Math.ceil((clipStartSec + clipDurSec + 10) / 10) * 10);
    
    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const currentPxPerSec = pxPerSecRef.current;
      const newX = playheadXRef.current + dt * currentPxPerSec;
      const maxX = timelineSecCurrent * currentPxPerSec;
      
      if (newX >= maxX) {
        setPlayheadX(maxX);
        setPlaying(false);
        return;
      }
      
      setPlayheadX(newX);
      
      const el = scrollRef.current;
      if (el) {
        const ctiViewX = (TRACK_HEADER_PX - el.scrollLeft) + newX;
        const rightThreshold = el.clientWidth - 120;
        const leftThreshold = TRACK_HEADER_PX + 20;
        if (ctiViewX > rightThreshold) {
          programmaticScrollRef.current = true;
          el.scrollLeft += ctiViewX - rightThreshold;
          requestAnimationFrame(() => {
            programmaticScrollRef.current = false;
          });
        } else if (ctiViewX < leftThreshold) {
          programmaticScrollRef.current = true;
          el.scrollLeft -= (leftThreshold - ctiViewX);
          requestAnimationFrame(() => {
            programmaticScrollRef.current = false;
          });
        }
      }
      playRaf.current = requestAnimationFrame(step);
    };
    playRaf.current = requestAnimationFrame(step);
    return () => { 
      if (playRaf.current) {
        cancelAnimationFrame(playRaf.current); 
        playRaf.current = null; 
      }
      lastTsRef.current = null; 
    };
  }, [playing, clipStartSec, clipDurSec]);

  const formatTimecode = useCallback((seconds: number) => {
    const fps = FPS;
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);
    const frames = Math.floor((seconds - Math.floor(seconds)) * fps);
    const pad = (n: number, l = 2) => n.toString().padStart(l, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`;
  }, [FPS]);

  // Clip pixel positions
  const clipLeftPx = clipStartSec * PX_PER_SEC;
  const clipWidthPx = clipDurSec * PX_PER_SEC;

  const handleClipChange = (newLeft: number, newWidth: number) => {
    setClipStartSec(newLeft / PX_PER_SEC);
    setClipDurSec(newWidth / PX_PER_SEC);
  };

  // Button class helper
  const btnClass = (active: boolean) =>
    `p-1 rounded hover:bg-white/10 ${
      active ? "bg-white/10 text-blue-400" : "text-white/70"
    }`;

  // Zoom button handlers
  const zoomIn = useCallback(() => {
    const currentPct = (zoom / BASE_ZOOM) * 100;
    const nextPct = Math.min(500, currentPct + 10);
    const target = Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, (nextPct / 100) * BASE_ZOOM));
    applyZoomSmart(target);
  }, [zoom, BASE_ZOOM, ZOOM_MIN_PX, ZOOM_MAX_PX, applyZoomSmart]);

  const zoomOut = useCallback(() => {
    const currentPct = (zoom / BASE_ZOOM) * 100;
    const nextPct = Math.max(0, currentPct - 10);
    const target = Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, (nextPct / 100) * BASE_ZOOM));
    applyZoomSmart(target);
  }, [zoom, BASE_ZOOM, ZOOM_MIN_PX, ZOOM_MAX_PX, applyZoomSmart]);

  const resetZoom = useCallback(() => {
    applyZoomSmart(BASE_ZOOM);
  }, [BASE_ZOOM, applyZoomSmart]);

  const zoomToFit = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const availableWidth = el.clientWidth - TRACK_HEADER_PX;
    const requiredPxPerSec = availableWidth / timelineSec;
    const targetZoom = requiredPxPerSec * 5; // Convert back to zoom units
    applyZoomSmart(Math.max(ZOOM_MIN_PX, Math.min(ZOOM_MAX_PX, targetZoom)));
  }, [timelineSec, ZOOM_MIN_PX, ZOOM_MAX_PX, applyZoomSmart, TRACK_HEADER_PX]);

  const currentSeconds = playheadX / PX_PER_SEC;

  return (
    <div className="bg-studio-panel border-t w-full h-full flex flex-col select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-studio-panel-alt border-b">
        <Tooltip>
          <TooltipTrigger>
            <button className={btnClass(tool === "selection")} onClick={() => setTool("selection")}>
              <MousePointer2 size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Selection (V)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className={btnClass(tool === "razor")} onClick={() => setTool("razor")}>
              <Scissors size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Razor (C)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className={btnClass(tool === "hand")} onClick={() => setTool("hand")}>
              <Hand size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Hand (H)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className={btnClass(tool === "type")} onClick={() => setTool("type")}>
              <Type size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Type (T)</TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <Tooltip>
          <TooltipTrigger>
            <button className={btnClass(snapping)} onClick={() => setSnapping((s) => !s)}>
              <Magnet size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Snap (S)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className={btnClass(linked)} onClick={() => setLinked((l) => !l)}>
              <Link2 size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Linked Selection</TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <Tooltip>
          <TooltipTrigger>
            <button className={btnClass(skimmerEnabled)} onClick={() => setSkimmerEnabled((v) => !v)}>
              <MousePointer2 size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Skimmer</TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <Tooltip>
          <TooltipTrigger>
            <button className={btnClass(false)} onClick={() => setInPoint(playheadX)}>
              <ArrowLeftToLine size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Mark In (I)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <button className={btnClass(false)} onClick={() => setOutPoint(playheadX)}>
              <ArrowRightToLine size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Mark Out (O)</TooltipContent>
        </Tooltip>

        <div className="ml-auto flex items-center gap-2">
          {/* Zoom Out */}
          <Tooltip>
            <TooltipTrigger>
              <button className={btnClass(false)} onClick={zoomOut}>
                <Minus size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out (- / Ctrl/Cmd -)</TooltipContent>
          </Tooltip>

          {/* Zoom Percentage Display */}
          <span className="text-[10px] text-white/70 font-mono min-w-[40px] text-center">
            {Math.round(zoomPercent)}%
          </span>

          {/* Reset */}
          <Tooltip>
            <TooltipTrigger>
              <button className={btnClass(false)} onClick={resetZoom}>
                <Film size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom (Ctrl/Cmd 0)</TooltipContent>
          </Tooltip>

          {/* Zoom In */}
          <Tooltip>
            <TooltipTrigger>
              <button className={btnClass(false)} onClick={zoomIn}>
                <Plus size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Zoom In (+ / Ctrl/Cmd +)</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-white/20 mx-1" />

          {/* Timecode Display */}
          <span className="text-[11px] text-white/90 font-mono bg-black/20 px-2 py-0.5 rounded">
            {formatTimecode(currentSeconds)}
          </span>
        </div>
      </div>

      {/* Ruler */}
      <div
        className="relative border-b bg-studio-panel-alt h-6"
        onMouseMove={handleRulerMove}
        onMouseLeave={handleRulerLeave}
        onClick={handleRulerClick}
      >
        {/* Tick marks */}
        {ticks.map((t, i) => {
          const x = TRACK_HEADER_PX + t.sec * PX_PER_SEC - scrollLeft;
          if (x < TRACK_HEADER_PX - 50 || x > containerWidth + 50) return null;

          return (
            <div
              key={i}
              className="absolute top-0 border-l border-white/40 text-[10px] text-white/70"
              style={{ left: `${x}px`, height: t.kind === "major" ? "100%" : "50%" }}
            >
              {t.kind === "major" && (
                <div className="absolute top-0 translate-x-1">{formatTimecode(t.sec)}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline Scroll Region */}
      <div 
        ref={scrollRef}
        className="relative flex-1 overflow-auto bg-studio-panel"
        onMouseMove={handleContentMove}
        onMouseLeave={handleContentLeave}
        onMouseDown={onContentMouseDown}
        onClick={handleContentClick}
      >
        {/* Track Headers */}
        <div className="absolute left-0 top-0 w-[160px] h-full bg-studio-panel-alt border-r flex flex-col z-10">
          <div className="h-20 flex items-center justify-between px-3 text-white/70 text-xs border-b">
            <div className="flex items-center gap-2">
              <Film size={14} />
              <span>V1</span>
            </div>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-white/10 rounded">
                <Eye size={12} />
              </button>
              <button className="p-1 hover:bg-white/10 rounded">
                <Lock size={12} />
              </button>
            </div>
          </div>
          <div className="h-20 flex items-center justify-between px-3 text-white/70 text-xs">
            <div className="flex items-center gap-2">
              <Volume2 size={14} />
              <span>A1</span>
            </div>
            <div className="flex gap-1">
              <button 
                className={`p-1 rounded ${audioMute ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10'}`}
                onClick={() => setAudioMute(m => !m)}
              >
                {audioMute ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
              <button 
                className={`p-1 rounded ${audioSolo ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10'}`}
                onClick={() => setAudioSolo(s => !s)}
              >
                <Headphones size={12} />
              </button>
              <button className="p-1 hover:bg-white/10 rounded">
                <Lock size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Track Area */}
        <div
          className="absolute top-0 left-[160px]"
          style={{ width: `${timelineWidthPx}px`, height: "100%" }}
        >
          {/* Video Track */}
          <div className="relative border-b h-20 border-white/20">
            {/* Grid lines */}
            {ticks.map((t, i) => {
              const x = t.sec * PX_PER_SEC;
              return (
                <div
                  key={`v-grid-${i}`}
                  className={`absolute top-0 h-full border-l ${
                    t.kind === "major" ? "border-white/10" : "border-white/5"
                  }`}
                  style={{ left: `${x}px` }}
                />
              );
            })}
            <ClipSample
              leftPx={clipLeftPx}
              widthPx={clipWidthPx}
              color="blue"
              snapping={snapping}
              gridPx={tickConfig.minorPx}
              snapTargets={snapTargets}
              onChange={handleClipChange}
            />
          </div>

          {/* Audio Track */}
          <div className="relative h-20 border-white/20">
            {/* Grid lines */}
            {ticks.map((t, i) => {
              const x = t.sec * PX_PER_SEC;
              return (
                <div
                  key={`a-grid-${i}`}
                  className={`absolute top-0 h-full border-l ${
                    t.kind === "major" ? "border-white/10" : "border-white/5"
                  }`}
                  style={{ left: `${x}px` }}
                />
              );
            })}
            {/* Linked audio clip */}
            <div
              className="absolute top-1 h-[72px] bg-emerald-500/10 border border-emerald-400/60 rounded-sm flex items-center px-2 overflow-hidden"
              style={{ left: `${clipLeftPx}px`, width: `${clipWidthPx}px` }}
            >
              <div className="w-full h-8 flex items-end gap-[2px] opacity-80">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-[2px] bg-emerald-400/70" 
                    style={{ height: `${(Math.sin(i / 3) * 0.5 + 0.5) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Playhead */}
        <div
          onMouseDown={onPlayheadMouseDown}
          className="absolute w-[2px] bg-red-400 top-0 bottom-0 cursor-col-resize z-20"
          style={{ left: `${TRACK_HEADER_PX + playheadX - scrollLeft}px` }}
        >
          <div className="absolute -top-1 -left-1 w-4 h-4 rotate-45 bg-red-400" />
        </div>

        {/* Hover Skimmer */}
        {hoverX != null && skimmerEnabled && (
          <div
            className="absolute w-[1px] bg-white/50 top-0 bottom-0 pointer-events-none z-10"
            style={{ left: `${hoverX}px` }}
          />
        )}

        {/* In / Out region highlight */}
        {inPoint != null && outPoint != null && outPoint > inPoint && (
          <div
            className="absolute top-0 bottom-0 bg-emerald-300/10 pointer-events-none z-5"
            style={{
              left: `${TRACK_HEADER_PX + inPoint - scrollLeft}px`,
              width: `${outPoint - inPoint}px`,
            }}
          />
        )}
      </div>
    </div>
  );
}
