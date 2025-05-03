export interface AspectRatio {
  id: string;
  label: string;
  value: string;
  width: number;
  height: number;
  description: string;
}

export const aspectRatios: AspectRatio[] = [
  {
    id: 'wide',
    label: 'Wide 16:9',
    value: '16:9',
    width: 1920,
    height: 1080,
    description: 'YouTube and streaming sites'
  },
  {
    id: 'vertical',
    label: 'Vertical 9:16',
    value: '9:16',
    width: 1080,
    height: 1920,
    description: 'Instagram Reels and TikTok'
  },
  {
    id: 'square',
    label: 'Square 1:1',
    value: '1:1',
    width: 1080,
    height: 1080,
    description: 'Instagram posts'
  },
  {
    id: 'classic',
    label: 'Classic 4:3',
    value: '4:3',
    width: 1440,
    height: 1080,
    description: 'Classic video format'
  },
  {
    id: 'social',
    label: 'Social 4:5',
    value: '4:5',
    width: 1080,
    height: 1350,
    description: 'Social media portrait'
  },
  {
    id: 'cinema',
    label: 'Cinema 21:9',
    value: '21:9',
    width: 2560,
    height: 1080,
    description: 'Cinematic widescreen'
  },
  {
    id: 'portrait',
    label: 'Portrait 2:3',
    value: '2:3',
    width: 1080,
    height: 1620,
    description: 'Portrait orientation'
  }
];
