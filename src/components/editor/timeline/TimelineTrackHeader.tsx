import React from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import AnimatedIcon from "@/components/AnimatedIcon";

interface TimelineTrackHeaderProps {
  track: {
    id: string;
    label: string;
    type: "video" | "audio";
    isLocked: boolean;
    isVisible: boolean;
    isMuted: boolean;
    isTargeted: boolean;
    isExpanded: boolean;
  };
  onToggleLock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleMute: (id: string) => void;
  onToggleTarget: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onSelectTrack: (id: string) => void;
}

export const TimelineTrackHeader: React.FC<TimelineTrackHeaderProps> = ({
  track,
  onToggleLock,
  onToggleVisibility,
  onToggleMute,
  onToggleTarget,
  onToggleExpand,
  onSelectTrack,
}) => {
  const {
    id,
    label,
    type,
    isLocked,
    isVisible,
    isMuted,
    isTargeted,
    isExpanded,
  } = track;

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 border-b border-border/30 select-none cursor-pointer transition-all group",
        {
          "h-20": !isExpanded,
          "h-32": isExpanded,
          "bg-accent/10": isTargeted,
          "hover:bg-studio-panel/20": !isTargeted,
        }
      )}
      onClick={() => onSelectTrack(id)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${label} track`}
    >
      {/* Left Section: Expand + Label */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 shrink-0 hover:bg-accent/10"
          onClick={(e) => {
            stopPropagation(e);
            onToggleExpand(id);
          }}
          aria-label={isExpanded ? "Collapse track" : "Expand track"}
        >
          <AnimatedIcon>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 animated-gradient-stroke" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 animated-gradient-stroke" />
            )}
          </AnimatedIcon>
        </Button>
        <span
          className={cn(
            "font-mono text-xs font-semibold tracking-wider truncate",
            type === "video" ? "text-blue-400/90" : "text-emerald-400/90"
          )}
        >
          {label}
        </span>
      </div>

      {/* Right Section: Controls */}
      <div className="flex items-center gap-0.5 shrink-0" onClick={stopPropagation}>
        {/* Lock Toggle */}
        <Toggle
          size="sm"
          pressed={isLocked}
          onPressedChange={() => onToggleLock(id)}
          aria-label={isLocked ? "Unlock track" : "Lock track"}
          className={cn(
            "w-7 h-7 hover:bg-accent/10 data-[state=on]:bg-accent/20",
            isLocked && "text-amber-400"
          )}
        >
          <AnimatedIcon>
            {isLocked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Unlock className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            )}
          </AnimatedIcon>
        </Toggle>

        {/* Video: Visibility Toggle */}
        {type === "video" && (
          <Toggle
            size="sm"
            pressed={!isVisible}
            onPressedChange={() => onToggleVisibility(id)}
            aria-label={isVisible ? "Hide track" : "Show track"}
            className={cn(
              "w-7 h-7 hover:bg-accent/10 data-[state=on]:bg-accent/20",
              !isVisible && "text-red-400"
            )}
          >
            <AnimatedIcon>
              {!isVisible ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </AnimatedIcon>
          </Toggle>
        )}

        {/* Audio: Mute Toggle */}
        {type === "audio" && (
          <Toggle
            size="sm"
            pressed={isMuted}
            onPressedChange={() => onToggleMute(id)}
            aria-label={isMuted ? "Unmute track" : "Mute track"}
            className={cn(
              "w-7 h-7 hover:bg-accent/10 data-[state=on]:bg-accent/20",
              isMuted && "text-red-400"
            )}
          >
            <AnimatedIcon>
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </AnimatedIcon>
          </Toggle>
        )}

        {/* Target Toggle */}
        <Toggle
          size="sm"
          pressed={isTargeted}
          onPressedChange={() => onToggleTarget(id)}
          aria-label={isTargeted ? "Untarget track" : "Target track"}
          className={cn(
            "w-7 h-7 hover:bg-accent/10 transition-all",
            isTargeted
              ? "bg-accent text-accent-foreground data-[state=on]:bg-accent"
              : "data-[state=off]:opacity-60 hover:opacity-100"
          )}
        >
          <AnimatedIcon>
            <Target className="w-3.5 h-3.5" />
          </AnimatedIcon>
        </Toggle>
      </div>
    </div>
  );
}