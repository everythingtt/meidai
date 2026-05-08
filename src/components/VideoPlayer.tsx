import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Loader2 } from 'lucide-react';
import { PlayerState, VideoSource } from '../types';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  sources?: VideoSource[];
  onTimeUpdate?: (time: number) => void;
  onFrameCapture?: (videoElement: HTMLVideoElement) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  sources,
  onTimeUpdate,
  onFrameCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    currentQuality: 'auto',
    buffered: 0
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (playerState.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [playerState.isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !playerState.isMuted;
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, [playerState.isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const volume = parseFloat(e.target.value);
    videoRef.current.volume = volume;
    setPlayerState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * playerState.duration;
    
    videoRef.current.currentTime = newTime;
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  }, [playerState.duration]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!playerState.isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setPlayerState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, [playerState.isFullscreen]);

  const handleScanFrame = useCallback(() => {
    if (!videoRef.current || isScanning) return;
    
    setIsScanning(true);
    if (onFrameCapture) {
      onFrameCapture(videoRef.current);
    }
    setTimeout(() => setIsScanning(false), 1000);
  }, [isScanning, onFrameCapture]);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    
    if (playerState.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [playerState.isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: video.currentTime }));
      if (onTimeUpdate) onTimeUpdate(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({ ...prev, duration: video.duration }));
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setPlayerState(prev => ({ ...prev, buffered: video.buffered.end(video.buffered.length - 1) }));
      }
    };

    const handlePlay = () => setPlayerState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setPlayerState(prev => ({ ...prev, isPlaying: false }));
    const handleFullscreenChange = () => {
      setPlayerState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const progressPercent = playerState.duration > 0 
    ? (playerState.currentTime / playerState.duration) * 100 
    : 0;
  
  const bufferedPercent = playerState.duration > 0 
    ? (playerState.buffered / playerState.duration) * 100 
    : 0;

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => playerState.isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />

      {/* Scan Button Overlay */}
      <button
        onClick={handleScanFrame}
        disabled={isScanning}
        className={`absolute top-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
          flex items-center gap-2 transition-all duration-200 shadow-lg
          ${isScanning ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
      >
        {isScanning ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Settings className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isScanning ? 'Scanning...' : 'AI Scan'}
        </span>
      </button>

      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 
          transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4 group/progress"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-white/50 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />
          <div 
            className="h-full bg-red-500 rounded-full -mt-1 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full 
              opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors"
            >
              {playerState.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition-colors"
              >
                {playerState.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={playerState.isMuted ? 0 : playerState.volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white 
                  [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {sources && sources.length > 0 && (
              <select 
                value={playerState.currentQuality}
                onChange={(e) => setPlayerState(prev => ({ ...prev, currentQuality: e.target.value }))}
                className="bg-transparent text-white text-sm border border-white/30 rounded px-2 py-1"
              >
                <option value="auto" className="bg-gray-800">Auto</option>
                {sources.map(source => (
                  <option key={source.quality} value={source.quality} className="bg-gray-800">
                    {source.quality}
                  </option>
                ))}
              </select>
            )}
            
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-red-500 transition-colors"
            >
              {playerState.isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Big Play Button (when paused) */}
      {!playerState.isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 
            bg-red-600/90 hover:bg-red-600 rounded-full flex items-center justify-center 
            transition-all duration-200 hover:scale-110 shadow-xl"
        >
          <Play className="w-10 h-10 text-white ml-1" />
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
