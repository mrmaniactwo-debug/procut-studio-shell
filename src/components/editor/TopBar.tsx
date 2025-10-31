import { Film } from "lucide-react";

/**
 * TopBar Component
 * Main header for ProCut editor - displays app branding and future controls
 */
export const TopBar = () => {
  return (
    <header className="h-12 bg-studio-panel border-b border-border flex items-center px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Film className="w-5 h-5 text-primary" />
        <h1 className="text-base font-semibold text-foreground tracking-tight">
          ProCut
        </h1>
      </div>
      
      {/* Future: toolbar controls will go here */}
      <div className="flex-1" />
    </header>
  );
};
