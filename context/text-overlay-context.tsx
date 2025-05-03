'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { TextOverlay } from '@/components/text-overlay-renderer';

interface TextOverlayContextType {
  textOverlays: TextOverlay[];
  setTextOverlays: (overlays: TextOverlay[]) => void;
  addTextOverlay: (overlay: TextOverlay) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
  findTextOverlay: (text: string) => TextOverlay | undefined;
}

const TextOverlayContext = createContext<TextOverlayContextType | undefined>(undefined);

export function TextOverlayProvider({ children }: { children: ReactNode }) {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);

  // Utility function to generate a truly unique ID
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const microTime = performance.now().toString().replace('.', '');
    const randomPart = Math.random().toString(36).substring(2, 11);
    return `text_${timestamp}_${microTime}_${randomPart}`;
  };

  const addTextOverlay = (overlay: TextOverlay) => {
    // First, check if we already have a similar text overlay
    // If so, update it instead of creating a new one
    if (overlay.text) {
      // Look for exact text match first
      const existingOverlay = textOverlays.find(item => 
        item.text.toLowerCase() === overlay.text.toLowerCase()
      );
      
      if (existingOverlay) {
        console.log('Found existing overlay with matching text, updating instead:', existingOverlay.id);
        updateTextOverlay(existingOverlay.id, overlay);
        return;
      }
    }
    
    // Generate a unique ID for new overlays if needed
    const uniqueOverlay = {
      ...overlay,
      id: overlay.id || generateUniqueId()
    };
    
    // Final safety check for duplicate IDs
    const exists = textOverlays.some(item => item.id === uniqueOverlay.id);
    if (exists) {
      console.warn('Attempted to add text overlay with duplicate ID, regenerating...', uniqueOverlay.id);
      uniqueOverlay.id = generateUniqueId();
    }
    
    console.log('Adding text overlay with unique ID:', uniqueOverlay.id);
    setTextOverlays(prev => [...prev, uniqueOverlay]);
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(prev => 
      prev.map(overlay => 
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    );
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
  };

  const findTextOverlay = (text: string) => {
    if (!text || textOverlays.length === 0) return undefined;
    
    // First try exact match
    let match = textOverlays.find(overlay => 
      overlay.text.toLowerCase() === text.toLowerCase()
    );
    
    if (match) return match;
    
    // Try includes match (in either direction)
    match = textOverlays.find(overlay => 
      overlay.text.toLowerCase().includes(text.toLowerCase()) ||
      text.toLowerCase().includes(overlay.text.toLowerCase())
    );
    
    if (match) return match;
    
    // If all else fails, return the most recent overlay if we're dealing with
    // vague search terms (like "make it bigger")
    if (text.length < 10) {
      // Sort by most recently added (assuming they're added in order)
      const sortedOverlays = [...textOverlays].reverse();
      if (sortedOverlays.length > 0) {
        console.log('No match found, returning most recent overlay:', sortedOverlays[0].id);
        return sortedOverlays[0];
      }
    }
    
    return undefined;
  };

  return (
    <TextOverlayContext.Provider 
      value={{ 
        textOverlays, 
        setTextOverlays, 
        addTextOverlay, 
        updateTextOverlay, 
        removeTextOverlay,
        findTextOverlay
      }}
    >
      {children}
    </TextOverlayContext.Provider>
  );
}

export function useTextOverlay() {
  const context = useContext(TextOverlayContext);
  
  if (context === undefined) {
    throw new Error('useTextOverlay must be used within a TextOverlayProvider');
  }
  
  return context;
}
