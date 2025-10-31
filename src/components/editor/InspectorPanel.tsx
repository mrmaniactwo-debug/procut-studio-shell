import { Settings } from "lucide-react";

/**
 * InspectorPanel Component
 * Right sidebar - placeholder for properties/settings
 */
export const InspectorPanel = () => {
  return (
    <div className="h-full bg-studio-panel flex flex-col">
      {/* Panel Header */}
      <div className="h-10 px-3 flex items-center border-b border-border shrink-0">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Inspector
        </h2>
      </div>
      
      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-xs text-muted-foreground">
            No selection
          </p>
        </div>
      </div>
    </div>
  );
};
