"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { VideoPreview } from "./video-preview";
import { ChatWindow } from "./chat/chat-window";
import { AspectRatioProvider } from "@/context/aspect-ratio-context";
import { TextOverlayProvider } from "@/context/text-overlay-context";
import { DebugOverlay } from "./debug-overlay";
import { useRef, useState, useEffect } from "react";
import { PlayerRef } from "@remotion/player";
import { TimelineSection } from "./timeline-section";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationInFrames, setDurationInFrames] = useState(300);
  const fps = 30;
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (isPlaying && playerRef.current) {
      const interval = setInterval(() => {
        const frame = Math.floor(playerRef.current?.getCurrentFrame() ?? 0);
        if (frame !== currentFrame) {
          setCurrentFrame(frame);
        }
        if (frame >= durationInFrames) {
          setIsPlaying(false);
          clearInterval(interval);
        }
      }, 1000 / fps);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentFrame, durationInFrames, fps]);

  return (
    <AspectRatioProvider>
      <TextOverlayProvider>
        <div className="grid grid-rows-[minmax(0,1fr),64px] h-screen overflow-hidden">
          {/* Main content area with video preview and chat */}
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Assets Panel */}
            <ResizablePanel defaultSize={20} minSize={15}>
              <div className="h-full border-r border-muted-foreground/20 bg-muted/50 p-4">
                <div className="space-y-4">
                  <div className="font-medium">Assets</div>
                  {/* Placeholder asset items */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-video bg-muted-foreground/10 rounded-lg p-2 cursor-pointer hover:bg-muted-foreground/20 transition-colors"
                    >
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                        Video {i}.mp4
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              {/* Video Preview Section */}
              <div className="h-full">
                <VideoPreview playerRef={playerRef} />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={30} minSize={20}>
              {/* Chat Section */}
              <div className="h-full">
                <ChatWindow />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
          
          {/* Timeline Section */}
          <div className="border-t border-muted-foreground/20 bg-background">
            <TimelineSection
              playerRef={playerRef}
              currentFrame={currentFrame}
              setCurrentFrame={setCurrentFrame}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              durationInFrames={durationInFrames}
              fps={fps}
            />
          </div>
          
          {/* Debug overlay to help diagnose issues */}
          <DebugOverlay />
        </div>
      </TextOverlayProvider>
    </AspectRatioProvider>
  );
}
