'use client';

import { Player } from '@remotion/player';
import {
  AbsoluteFill,
  Composition,
  Sequence,
} from 'remotion';

interface VideoPreviewProps {
  width?: number;
  height?: number;
}

const VideoComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <Sequence from={0}>
        {/* Video content will be rendered here */}
        <AbsoluteFill style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          color: 'black',
          fontSize: '2rem'
        }}>
          Video Preview
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export function VideoPreview({ width = 1920, height = 1080 }: VideoPreviewProps) {
  return (
    <div className="w-full h-full relative bg-background">
      <Player
        component={VideoComposition}
        durationInFrames={150}
        fps={30}
        compositionWidth={width}
        compositionHeight={height}
        style={{
          width: '100%',
          height: '100%',
        }}
        controls
        autoPlay
        loop
      />
    </div>
  );
}
