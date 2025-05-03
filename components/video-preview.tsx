'use client';

import { Player, PlayerRef } from '@remotion/player';
import { AbsoluteFill, Composition, Sequence } from 'remotion';
import { Timeline } from './timeline';
import { useCallback, useEffect, useRef, useState, useMemo, memo } from 'react';
import { AspectRatioToggle } from "./aspect-ratio-toggle";
import { useAspectRatio } from "../context/aspect-ratio-context";
import { useTextOverlay } from "../context/text-overlay-context";
import { AspectRatio, aspectRatios } from '../lib/aspect-ratios';
import { TextOverlayRenderer, TextOverlay } from './text-overlay-renderer';

interface VideoPreviewProps {
  playerRef?: React.RefObject<PlayerRef | null>;
}

interface VideoCompositionProps {
  textOverlays: TextOverlay[];
  currentFrame: number;
  fps: number;
}

// Memoize the text overlay component to prevent unnecessary re-renders
const TextOverlayItem = memo(({ overlay }: { overlay: TextOverlay }) => {
  // Apply preset styles if specified
  let styles: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    maxWidth: '90%',
    top: overlay.position === 'top' ? '10%' : 
         overlay.position === 'bottom' ? 'auto' : '50%',
    bottom: overlay.position === 'bottom' ? '10%' : 'auto',
    left: '50%',
    transform: overlay.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    fontSize: '24px',
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    padding: '8px 16px',
    borderRadius: '4px',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
  };
  
  // Apply preset styles if specified
  if (overlay.preset) {
    console.log(`Applying ${overlay.preset} preset to text overlay:`, overlay.id);
    
    switch (overlay.preset) {
      case 'flashy':
        styles = {
          ...styles,
          color: '#FF00FF', // Hot pink
          backgroundColor: 'rgba(0, 255, 255, 0.3)', // Cyan with transparency
          fontSize: '72px',
          fontWeight: 'bold',
          padding: '15px 30px',
          borderRadius: '20px',
          textShadow: '0 0 10px #FF00FF, 0 0 20px #00FFFF, 0 0 30px #FFFFFF', // Enhanced neon glow effect
          transform: overlay.position === 'center' ? 'translate(-50%, -50%) scale(1.1)' : 'translateX(-50%) scale(1.1)',
          border: '3px solid #00FFFF',
          letterSpacing: '2px',
        };
        break;
      case 'minimal':
        styles = {
          ...styles,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          fontSize: '36px',
          fontWeight: '300',
          padding: '10px 20px',
          borderRadius: '4px',
          textShadow: 'none',
          letterSpacing: '1px',
        };
        break;
      case 'elegant':
        styles = {
          ...styles,
          color: '#FFD700', // Gold
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          fontSize: '48px',
          fontFamily: 'Playfair Display, serif',
          fontWeight: 'normal',
          padding: '20px 40px',
          borderRadius: '8px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          border: '1px solid #FFD700',
          letterSpacing: '1px',
        };
        break;
      case 'playful':
        styles = {
          ...styles,
          color: '#FF6B6B', // Brighter pink
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          fontSize: '52px',
          fontFamily: 'Comic Sans MS, cursive',
          fontWeight: 'bold',
          padding: '15px 30px',
          borderRadius: '999px', // Pill shape
          textShadow: '4px 4px 0px #FF69B4', // Offset shadow
          border: '3px dashed #FF69B4',
          transform: overlay.position === 'center' ? 'translate(-50%, -50%) rotate(-2deg)' : 'translateX(-50%) rotate(-2deg)',
        };
        break;
    }
    
    console.log(`Applied styles for ${overlay.preset} preset:`, styles);
  }
  
  // Override with any custom styles specified
  if (overlay.color) styles.color = overlay.color;
  if (overlay.backgroundColor) styles.backgroundColor = overlay.backgroundColor;
  if (overlay.fontSize) styles.fontSize = overlay.fontSize;
  if (overlay.fontFamily) styles.fontFamily = overlay.fontFamily;
  if (overlay.fontWeight) styles.fontWeight = overlay.fontWeight as any;
  if (overlay.textAlign) styles.textAlign = overlay.textAlign as any;
  if (overlay.padding) styles.padding = overlay.padding;
  if (overlay.borderRadius) styles.borderRadius = overlay.borderRadius;
  if (overlay.shadow) styles.textShadow = overlay.shadow;
  
  return (
    <div
      key={overlay.id}
      style={styles}
    >
      {overlay.text}
    </div>
  );
});

// Define the VideoComposition component as a regular function for Remotion compatibility
function VideoComposition({ textOverlays, currentFrame, fps }: VideoCompositionProps) {
  // Calculate current time in seconds
  const currentTimeInSeconds = currentFrame / fps;
  
  // Filter overlays that should be visible at the current time
  // Use useMemo to prevent recalculation on every render
  const visibleOverlays = useMemo(() => {
    return textOverlays.filter(overlay => {
      const startTime = overlay.at;
      const endTime = startTime + overlay.duration;
      return currentTimeInSeconds >= startTime && currentTimeInSeconds < endTime;
    });
  }, [textOverlays, currentTimeInSeconds]);
  
  // Only log when visible overlays change to reduce console spam
  useEffect(() => {
    if (visibleOverlays.length > 0) {
      console.log('Visible overlays changed:', visibleOverlays);
    }
  }, [visibleOverlays]);
  
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
      
      {/* Render text overlays directly in the composition */}
      {visibleOverlays.map((overlay, index) => (
        <TextOverlayItem 
          key={`${overlay.id}_${index}_${overlay.text?.substring(0, 10)}`} 
          overlay={overlay} 
        />
      ))}
    </AbsoluteFill>
  );
}

export function VideoPreview({ playerRef: externalPlayerRef }: VideoPreviewProps) {
  const { aspectRatio, setAspectRatio } = useAspectRatio();
  const { textOverlays } = useTextOverlay();
  const internalPlayerRef = useRef<PlayerRef>(null);
  const playerRef = externalPlayerRef || internalPlayerRef;
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationInFrames, setDurationInFrames] = useState(300);
  const fps = 30;
  
  // Memoize the component props to prevent unnecessary re-renders
  const compositionProps = useMemo(() => ({
    textOverlays,
    currentFrame,
    fps
  }), [textOverlays, currentFrame, fps]);
  
  const handleRatioChange = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
  };

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
    <div className="w-full h-full relative">
      <div className="absolute top-4 right-4 z-10">
        <AspectRatioToggle
          value={aspectRatio.value}
          onValueChange={handleRatioChange}
        />
      </div>
      <div className="h-full bg-zinc-950 border border-dashed border-muted-foreground/25 rounded-lg p-4 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <div 
            className="relative bg-black" 
            style={{
              height: '90%',
              aspectRatio: aspectRatio.value.replace(':', '/'),
            }}
          >
            <Player
              ref={playerRef}
              component={VideoComposition}
              inputProps={compositionProps}
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
              acknowledgeRemotionLicense
            />
          </div>
        </div>
      </div>
    </div>
  );
}
