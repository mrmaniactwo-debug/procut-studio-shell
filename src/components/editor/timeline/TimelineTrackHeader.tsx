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

  return (
    <div
      className="flex items-center h-12 px-2 bg-background border-b border-border select-none"
      onClick={() => onSelectTrack(id)}
    >
      <div className="flex items-center gap-1 flex-grow">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(id);
          }}
        >
          <AnimatedIcon>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </AnimatedIcon>
        </Button>
        <span className="font-mono text-xs font-bold cursor-pointer w-6 text-center">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <Toggle
          size="sm"
          pressed={isLocked}
          onPressedChange={() => onToggleLock(id)}
          aria-label="Toggle lock"
          className="w-6 h-6"
        >
          <AnimatedIcon>
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </AnimatedIcon>
        </Toggle>
        {type === "video" && (
          <Toggle
            size="sm"
            pressed={!isVisible}
            onPressedChange={() => onToggleVisibility(id)}
            aria-label="Toggle visibility"
            className="w-6 h-6"
          >
            <AnimatedIcon>
              {!isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </AnimatedIcon>
          </Toggle>
        )}
        {type === "audio" && (
          <Toggle
            size="sm"
            pressed={isMuted}
            onPressedChange={() => onToggleMute(id)}
            aria-label="Toggle mute"
            className="w-6 h-6"
          >
            <AnimatedIcon>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </AnimatedIcon>
          </Toggle>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleTarget(id);
          }}
          className={cn("w-6 h-6 transition-colors", {
            "bg-accent text-accent-foreground": isTargeted,
            "hover:bg-muted/50": !isTargeted,
          })}
        >
          <span className="font-bold text-xs">{label}</span>
        </Button>
      </div>
    </div>
  );
};
