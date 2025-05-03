'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Play, Pause, RotateCcw, Type } from "lucide-react";
import { useTextOverlay } from "@/context/text-overlay-context";
import { TextOverlayTrack } from "./text-overlay-track";

interface TimelineProps {
  durationInFrames: number;
  fps: number;
  currentFrame: number;
  onFrameChange: (frame: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
}

export function Timeline({
  durationInFrames,
  fps,
  currentFrame,
  onFrameChange,
  isPlaying,
  onPlayPause,
  onReset,
}: TimelineProps) {
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { textOverlays } = useTextOverlay();
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  const formatTime = (frame: number) => {
    const seconds = Math.floor(frame / fps);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(newZoom, 0.5), 4); // Limit zoom between 0.5x and 4x
    });
  }, []);

  const renderTimeMarkers = () => {
    const markers = [];
    const markerInterval = Math.max(Math.floor(fps / zoom), 1); // Adjust marker density based on zoom

    for (let frame = 0; frame <= durationInFrames; frame += markerInterval) {
      markers.push(
        <div
          key={frame}
          className="absolute h-3 border-l border-muted-foreground"
          style={{
            left: `${(frame / durationInFrames) * 100}%`,
          }}
        >
          <div className="text-xs text-muted-foreground mt-3 -ml-4 w-8">
            {formatTime(frame)}
          </div>
        </div>
      );
    }
    return markers;
  };

  return (
    <div className="w-full bg-muted/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onPlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatTime(currentFrame)} / {formatTime(durationInFrames)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleZoom('out')}
            disabled={zoom <= 0.5}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleZoom('in')}
            disabled={zoom >= 4}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={timelineRef}
        className="relative h-16 border rounded-md overflow-hidden"
      >
        <div 
          className="absolute inset-0"
          style={{
            width: `${100 * zoom}%`,
            transform: `translateX(${-(zoom - 1) * (currentFrame / durationInFrames) * 100}%)`,
          }}
        >
          {renderTimeMarkers()}
          
          {/* Text overlay tracks */}
          {textOverlays.length > 0 && (
            <div className="absolute left-0 right-0 h-8 top-6 bg-muted/30">
              <div className="absolute -left-8 top-1 flex items-center">
                <Type className="h-4 w-4 text-blue-500" />
              </div>
              
              {textOverlays.map((overlay, index) => (
                <TextOverlayTrack
                  key={`timeline_${overlay.id}_${index}_${overlay.text?.substring(0, 8)}`}
                  overlay={overlay}
                  durationInFrames={durationInFrames}
                  fps={fps}
                  onSelect={setSelectedOverlayId}
                  isSelected={selectedOverlayId === overlay.id}
                />
              ))}
            </div>
          )}
          
          <Slider
            value={[currentFrame]}
            min={0}
            max={durationInFrames}
            step={1}
            onValueChange={([value]: number[]) => onFrameChange(value)}
            className="absolute bottom-2 left-0 right-0 mx-4"
          />
        </div>
      </div>
    </div>
  );
}
