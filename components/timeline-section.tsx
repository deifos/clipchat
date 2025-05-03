'use client';

import { useCallback, useEffect, useState } from 'react';
import { Timeline } from './timeline';
import { useTextOverlay } from '@/context/text-overlay-context';
import { PlayerRef } from '@remotion/player';

interface TimelineSectionProps {
  playerRef: React.RefObject<PlayerRef | null>;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  durationInFrames: number;
  fps: number;
}

export function TimelineSection({
  playerRef,
  currentFrame,
  setCurrentFrame,
  isPlaying,
  setIsPlaying,
  durationInFrames,
  fps
}: TimelineSectionProps) {
  const { textOverlays } = useTextOverlay();

  const handleFrameChange = useCallback((frame: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(frame);
      setCurrentFrame(frame);
    }
  }, [playerRef, setCurrentFrame]);

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
  }, [isPlaying, playerRef, setIsPlaying]);

  const handleReset = useCallback(() => {
    const player = playerRef.current;
    if (player) {
      player.seekTo(0);
      setCurrentFrame(0);
      setIsPlaying(false);
    }
  }, [playerRef, setCurrentFrame, setIsPlaying]);

  return (
    <div className="w-full px-4 py-1 h-16">
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
