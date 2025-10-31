import { Folder } from "lucide-react";

/**
 * MediaPanel Component
 * Left sidebar - placeholder for media library grid
 */
export const MediaPanel = () => {
  return (
    <div className="h-full bg-studio-panel flex flex-col">
      {/* Panel Header */}
      <div className="h-10 px-3 flex items-center border-b border-border shrink-0">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Media
        </h2>
      </div>
      
      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-xs text-muted-foreground">
            No media yet
          </p>
        </div>
      </div>
    </div>
  );
};
