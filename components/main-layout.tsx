'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

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
        <div className="h-full p-6">
          {/* Video Preview Section */}
          <div className="h-full flex flex-col gap-4">
            <div className="flex-grow bg-muted rounded-lg">
              {/* Video Preview Component will go here */}
            </div>
            <div className="h-32 bg-muted rounded-lg">
              {/* Timeline Component will go here */}
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={35} minSize={25}>
        <div className="h-full p-6">
          {/* Chat Section */}
          <div className="h-full flex flex-col gap-4 bg-muted rounded-lg p-4">
            {/* Chat Component will go here */}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
