'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AspectRatio, AspectRatioValue } from '../types';
import { aspectRatios } from '../lib/aspect-ratios';

interface AspectRatioContextType {
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio | AspectRatioValue) => void;
}

const AspectRatioContext = createContext<AspectRatioContextType | undefined>(undefined);

export function AspectRatioProvider({ children }: { children: ReactNode }) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(aspectRatios[0]);

  const handleSetAspectRatio = (ratio: AspectRatio | AspectRatioValue) => {
    if (typeof ratio === 'string') {
      // Find the aspect ratio object by value
      const foundRatio = aspectRatios.find(r => r.value === ratio);
      if (foundRatio) {
        setAspectRatio(foundRatio);
      }
    } else {
      setAspectRatio(ratio);
    }
  };

  return (
    <AspectRatioContext.Provider value={{ aspectRatio, setAspectRatio: handleSetAspectRatio }}>
      {children}
    </AspectRatioContext.Provider>
  );
}

export function useAspectRatio() {
  const context = useContext(AspectRatioContext);
  if (context === undefined) {
    throw new Error('useAspectRatio must be used within an AspectRatioProvider');
  }
  return context;
}
