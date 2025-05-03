'use client';

import { TextOverlay } from './text-overlay-renderer';
import { cn } from '@/lib/utils';

interface TextOverlayTrackProps {
  overlay: TextOverlay;
  durationInFrames: number;
  fps: number;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export function TextOverlayTrack({
  overlay,
  durationInFrames,
  fps,
  onSelect,
  isSelected = false
}: TextOverlayTrackProps) {
  const startPercent = (overlay.at * fps / durationInFrames) * 100;
  const widthPercent = (overlay.duration * fps / durationInFrames) * 100;
  
  // Ensure the track is at least 10px wide for visibility
  const minWidthPercent = (10 / durationInFrames) * 100;
  const finalWidthPercent = Math.max(widthPercent, minWidthPercent);
  
  return (
    <div 
      className={cn(
        "absolute h-6 rounded-sm cursor-pointer flex items-center justify-center text-xs text-white overflow-hidden",
        isSelected ? "ring-2 ring-primary" : "",
        "bg-blue-600 hover:bg-blue-700 transition-colors"
      )}
      style={{
        left: `${startPercent}%`,
        width: `${finalWidthPercent}%`,
        top: '4px'
      }}
      onClick={() => onSelect?.(overlay.id)}
      title={`${overlay.text} (${overlay.at}s - ${overlay.at + overlay.duration}s)`}
    >
      <span className="truncate px-1">
        {overlay.text}
      </span>
    </div>
  );
}
