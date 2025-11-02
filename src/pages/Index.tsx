import { TopBar } from "@/components/editor/TopBar";
import { MediaPanel } from "@/components/editor/MediaPanel";
import { SourceMonitor } from "@/components/editor/SourceMonitor";
import { ProgramMonitor } from "@/components/editor/ProgramMonitor";
import { Timeline } from "@/components/editor/Timeline";
import { InspectorPanel } from "@/components/editor/InspectorPanel";
import { AudioMeters } from "@/components/editor/AudioMeters";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";

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
          <ResizablePanel defaultSize={55} minSize={30}>
            <ResizablePanelGroup direction="horizontal">
              {/* Left: Media Library */}
              <ResizablePanel defaultSize={14} minSize={12} maxSize={30}>
                <MediaPanel />
              </ResizablePanel>
              
              <ResizableHandle />
              
              {/* Center: Dual Monitors */}
              <ResizablePanel defaultSize={72} minSize={40}>
                <div className="h-full bg-studio-panel flex">
                  <div className="flex-1 flex flex-col">
                    {/* Shared Panel Header */}
                    <div className="h-7 px-3 flex items-center border-b border-border/50 bg-studio-panel-alt">
                      <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Monitors
                      </h2>
                    </div>
                    
                    {/* Side-by-side monitors centered and allowed to grow */}
                    <div className="flex flex-1 items-center justify-center gap-4 px-6">
                      <div className="flex-1">
                        <SourceMonitor />
                      </div>
                      <Separator orientation="vertical" className="bg-border/50 w-[1px]" />
                      <div className="flex-1">
                        <ProgramMonitor />
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
              
              <ResizableHandle />
              
              {/* Right: Inspector */}
              <ResizablePanel defaultSize={14} minSize={12} maxSize={30}>
                <InspectorPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Bottom: Timeline */}
          <ResizablePanel defaultSize={45} minSize={20} maxSize={60}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel>
                <Timeline />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={4} minSize={3} maxSize={8}>
                <AudioMeters />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
