'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { VideoPreview } from "./video-preview";
import { ChatWindow } from "./chat/chat-window";

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
        <div className="h-screen p-4">
          {/* Chat Section */}
          <div className="h-full">
            <ChatWindow />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
