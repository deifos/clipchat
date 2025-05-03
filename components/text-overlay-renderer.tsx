'use client';

import { useCallback, useEffect, useState } from 'react';

export interface TextOverlay {
  id: string;
  text: string;
  at: number;
  duration: number;
  position: 'top' | 'center' | 'bottom';
  preset?: 'flashy' | 'minimal' | 'elegant' | 'playful';
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: string;
  borderRadius?: string;
  shadow?: string;
}

interface TextOverlayRendererProps {
  overlays: TextOverlay[];
  currentTime: number;
  fps: number;
}

export function TextOverlayRenderer({ overlays, currentTime, fps }: TextOverlayRendererProps) {
  // Filter overlays that should be visible at the current time
  const visibleOverlays = overlays.filter(overlay => {
    const startTime = overlay.at;
    const endTime = startTime + overlay.duration;
    return currentTime >= startTime && currentTime < endTime;
  });

  if (visibleOverlays.length === 0) return null;

  return (
    <>
      {visibleOverlays.map(overlay => (
        <div
          key={overlay.id}
          className="absolute z-10 px-4 max-w-[90%] text-center"
          style={{
            top: overlay.position === 'top' ? '10%' : 
                 overlay.position === 'bottom' ? 'auto' : '50%',
            bottom: overlay.position === 'bottom' ? '10%' : 'auto',
            left: '50%',
            transform: overlay.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
            color: overlay.color || 'white',
            backgroundColor: overlay.backgroundColor || 'rgba(0, 0, 0, 0.5)',
            fontSize: overlay.fontSize || '24px',
            fontFamily: overlay.fontFamily || 'sans-serif',
            fontWeight: overlay.fontWeight || 'bold',
            textAlign: overlay.textAlign || 'center',
            padding: overlay.padding || '8px 16px',
            borderRadius: overlay.borderRadius || '4px',
            textShadow: overlay.shadow || '1px 1px 2px rgba(0, 0, 0, 0.8)',
          }}
        >
          {overlay.text}
        </div>
      ))}
    </>
  );
}
