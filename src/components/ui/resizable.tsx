import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle>) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      // Base layout and focus
      "group relative flex items-center justify-center bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
      // Interactive hit area (larger but invisible)
      "data-[panel-group-direction=vertical]:h-2 data-[panel-group-direction=horizontal]:w-2",
      // Cursors
      "data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=horizontal]:cursor-col-resize",
      className
    )}
    {...props}
  >
    {/* Animated gradient line that appears and thickens on hover */}
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute animated-gradient-bg transition-all duration-200 opacity-0 group-hover:opacity-100",
        // Horizontal handle gradient line
        "group-data-[panel-group-direction=vertical]:left-0 group-data-[panel-group-direction=vertical]:top-1/2 group-data-[panel-group-direction=vertical]:w-full group-data-[panel-group-direction=vertical]:h-px group-data-[panel-group-direction=vertical]:-translate-y-1/2 group-data-[panel-group-direction=vertical]:group-hover:h-[3px]",
        // Vertical handle gradient line
        "group-data-[panel-group-direction=horizontal]:top-0 group-data-[panel-group-direction=horizontal]:left-1/2 group-data-[panel-group-direction=horizontal]:h-full group-data-[panel-group-direction=horizontal]:w-px group-data-[panel-group-direction=horizontal]:-translate-x-1/2 group-data-[panel-group-direction=horizontal]:group-hover:w-[3px]"
      )}
    />
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
