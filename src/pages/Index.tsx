import { TopBar } from "@/components/editor/TopBar";
import { MediaPanel } from "@/components/editor/MediaPanel";
import { SourceMonitor } from "@/components/editor/SourceMonitor";
import { ProgramMonitor } from "@/components/editor/ProgramMonitor";
import { Timeline } from "@/components/editor/Timeline";
import { InspectorPanel } from "@/components/editor/InspectorPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

/**
 * ProCut Video Editor - Main Layout
 * 
 * Shell-only implementation with Premiere Pro-inspired theme
 * Layout: Top bar + 3-column (Media | Source/Program Monitors | Inspector) + Timeline bottom
 * All panels are resizable for flexible workspace
 */
const Index = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-studio-main overflow-hidden">
      {/* Top Bar - Fixed */}
      <TopBar />
      
      {/* Main Editor Area - Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="vertical">
          {/* Upper Section: Media | Source/Program | Inspector */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="horizontal">
              {/* Left: Media Library */}
              <ResizablePanel defaultSize={18} minSize={15} maxSize={30}>
                <MediaPanel />
              </ResizablePanel>
              
              <ResizableHandle className="w-[1px] bg-border hover:bg-accent/50 transition-colors" />
              
              {/* Center: Dual Monitors (Source | Program) */}
              <ResizablePanel defaultSize={60} minSize={40}>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={50} minSize={35}>
                    <SourceMonitor />
                  </ResizablePanel>
                  
                  <ResizableHandle className="w-[1px] bg-border hover:bg-accent/50 transition-colors" />
                  
                  <ResizablePanel defaultSize={50} minSize={35}>
                    <ProgramMonitor />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              
              <ResizableHandle className="w-[1px] bg-border hover:bg-accent/50 transition-colors" />
              
              {/* Right: Inspector */}
              <ResizablePanel defaultSize={22} minSize={15} maxSize={30}>
                <InspectorPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle className="h-[1px] bg-border hover:bg-accent/50 transition-colors" />
          
          {/* Bottom: Timeline */}
          <ResizablePanel defaultSize={40} minSize={20} maxSize={60}>
            <Timeline />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
