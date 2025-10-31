import { Folder } from "lucide-react";

/**
 * MediaPanel Component
 * Left sidebar - placeholder for media library grid
 */
export const MediaPanel = () => {
  return (
    <div className="h-full bg-studio-panel flex flex-col">
      {/* Panel Header */}
      <div className="h-9 px-3 flex items-center border-b border-border shrink-0 bg-studio-panel">
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Media
        </h2>
      </div>
      
      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Folder className="w-11 h-11 text-muted-foreground mx-auto mb-2 opacity-25" />
          <p className="text-[11px] text-muted-foreground/70">
            Drop media here (future)
          </p>
        </div>
      </div>
    </div>
  );
};
