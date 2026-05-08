export interface VideoSource {
  quality: string;
  url: string;
  type?: string;
}

export interface ScanResult {
  timestamp: string;
  description: string;
  objects: string[];
  confidence: number;
}

export interface AIAnalysis {
  summary: string;
  objects: Array<{
    name: string;
    confidence: number;
  }>;
  scene: string;
  metadata: {
    resolution: string;
    aspectRatio: string;
  };
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  currentQuality: string;
  buffered: number;
}
