'use client';

import { Player, PlayerRef } from '@remotion/player';
import {
  AbsoluteFill,
  Composition,
  Sequence,
} from 'remotion';
import { Timeline } from './timeline';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AspectRatioToggle } from './aspect-ratio-toggle';
import { AspectRatio, aspectRatios } from '@/lib/aspect-ratios';

interface VideoPreviewProps {}

const VideoComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Sequence from={0}>
        {/* Video content will be rendered here */}
        <AbsoluteFill style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          color: 'white',
          fontSize: 'min(2rem, 5vw)'
        }}>
          Video Preview
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export function VideoPreview({}: VideoPreviewProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(aspectRatios[0]);
  const playerRef = useRef<PlayerRef>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fps = 30;
  const durationInFrames = 150;

  const handleFrameChange = useCallback((frame: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(frame);
      setCurrentFrame(frame);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    const player = playerRef.current;
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleReset = useCallback(() => {
    const player = playerRef.current;
    if (player) {
      player.seekTo(0);
      setCurrentFrame(0);
      setIsPlaying(false);
    }
  }, []);

  // Use seekTo for frame updates from the timeline
  useEffect(() => {
    const player = playerRef.current;
    if (player) {
      const checkFrame = () => {
        const frame = Math.floor(player.getCurrentFrame());
        if (frame !== currentFrame) {
          setCurrentFrame(frame);
        }
      };
      const interval = setInterval(checkFrame, 1000 / fps);
      return () => clearInterval(interval);
    }
  }, [currentFrame, fps]);

  return (
    <div className="w-full h-full flex flex-col gap-8">
      <div className="h-[calc(100vh-14rem)] relative bg-zinc-950 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 flex items-center justify-center overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <AspectRatioToggle
            value={aspectRatio.value}
            onValueChange={setAspectRatio}
          />
        </div>
        <div className="relative w-full h-full flex items-center justify-center">
          <div 
            className="relative bg-black" 
            style={{
              height: aspectRatio.height > aspectRatio.width ? '100%' : 'auto',
              width: aspectRatio.width > aspectRatio.height ? '100%' : 'auto',
              aspectRatio: aspectRatio.value.replace(':', '/'),
            }}
          >
        <Player
          ref={playerRef}
          component={VideoComposition}
          durationInFrames={durationInFrames}
          fps={fps}
          compositionWidth={aspectRatio.width}
          compositionHeight={aspectRatio.height}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            position: 'absolute',
            inset: 0,
          }}
          controls={false}
          loop
          allowFullscreen
          renderLoading={() => null}
          errorFallback={() => null}
          inputProps={{}}
          playbackRate={1}
        />
          </div>
        </div>
      </div>
      <Timeline
        durationInFrames={durationInFrames}
        fps={fps}
        currentFrame={currentFrame}
        onFrameChange={handleFrameChange}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
      />
    </div>
  );
}
