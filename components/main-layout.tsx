'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { VideoPreview } from "./video-preview";

export function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen"
    >
      <ResizablePanel defaultSize={65} minSize={40}>
        <div className="h-screen p-6">
          {/* Video Preview Section */}
          <div className="h-full bg-muted rounded-lg overflow-hidden">
            <VideoPreview />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={35} minSize={25}>
        <div className="h-full p-6">
          {/* Chat Section */}
          <div className="h-full flex flex-col gap-4 bg-muted rounded-lg p-4">
            {/* Chat Component will go here */}
            {children}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
