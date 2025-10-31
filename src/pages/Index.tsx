import { TopBar } from "@/components/editor/TopBar";
import { MediaPanel } from "@/components/editor/MediaPanel";
import { PreviewPanel } from "@/components/editor/PreviewPanel";
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
 * Layout: Top bar + 3-column (Media | Preview | Inspector) + Timeline bottom
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
          {/* Upper Section: Media | Preview | Inspector */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="horizontal">
              {/* Left: Media Library */}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                <MediaPanel />
              </ResizablePanel>
              
              <ResizableHandle className="w-[1px] bg-border hover:bg-primary transition-colors" />
              
              {/* Center: Preview */}
              <ResizablePanel defaultSize={55} minSize={40}>
                <PreviewPanel />
              </ResizablePanel>
              
              <ResizableHandle className="w-[1px] bg-border hover:bg-primary transition-colors" />
              
              {/* Right: Inspector */}
              <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
                <InspectorPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle className="h-[1px] bg-border hover:bg-primary transition-colors" />
          
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
