'use client';

import { useState } from 'react';
import { useTextOverlay } from '@/context/text-overlay-context';
import { Button } from './ui/button';
import { X } from 'lucide-react';

export function DebugOverlay() {
  const { textOverlays, addTextOverlay } = useTextOverlay();
  const [isOpen, setIsOpen] = useState(false);

  // Add a sample text overlay for testing
  const addSampleOverlay = () => {
    addTextOverlay({
      id: `sample_${Date.now()}`,
      text: 'Sample Text Overlay',
      at: 0,
      duration: 5,
      position: 'top',
      backgroundColor: 'rgba(255, 0, 0, 0.5)',
    });
  };

  if (!isOpen) {
    return (
      <Button 
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700"
        onClick={() => setIsOpen(true)}
      >
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-background border rounded-lg shadow-lg z-50 overflow-auto">
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-medium">Debug Overlay</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-3">
        <div className="mb-3">
          <Button 
            size="sm" 
            onClick={addSampleOverlay}
            className="w-full"
          >
            Add Sample Text Overlay
          </Button>
        </div>
        
        <div className="text-sm">
          <div className="font-medium mb-1">Text Overlays ({textOverlays.length}):</div>
          {textOverlays.length === 0 ? (
            <div className="text-muted-foreground italic">No text overlays</div>
          ) : (
            <div className="space-y-2">
              {textOverlays.map(overlay => (
                <div key={overlay.id} className="border rounded p-2 text-xs">
                  <div><span className="font-medium">ID:</span> {overlay.id}</div>
                  <div><span className="font-medium">Text:</span> {overlay.text}</div>
                  <div><span className="font-medium">Time:</span> {overlay.at}s - {overlay.at + overlay.duration}s</div>
                  <div><span className="font-medium">Position:</span> {overlay.position}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
