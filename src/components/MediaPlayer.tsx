'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { MediaAssets, ThemeConfig, AudioAnalyzerData } from '@/types';
import { AudioVideoOverlay } from './AudioVideoOverlay';

interface MediaPlayerProps {
  assets: MediaAssets;
  style: ThemeConfig;
  audioData?: AudioAnalyzerData;
  effectsEnabled?: boolean;
  effectsIntensity?: number;
  onVideoError?: () => void;
  onVideoLoad?: () => void;
}

export const MediaPlayer = ({ 
  assets, 
  style, 
  audioData, 
  effectsEnabled = true,
  effectsIntensity = 0.8,
  onVideoError, 
  onVideoLoad 
}: MediaPlayerProps) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
  }, [assets.video]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    onVideoLoad?.();
  };

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    onVideoError?.();
  }, [onVideoError]);

  useEffect(() => {
    const handleVideoPlay = () => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.play().catch(handleVideoError);
      }
    };

    if (videoLoaded && videoRef.current) {
      const timer = setTimeout(handleVideoPlay, 1000);
      return () => clearTimeout(timer);
    }
  }, [videoLoaded, handleVideoError]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ backgroundColor: style.backgroundColor }}
      >
        {!videoError && (
          <video
            ref={videoRef}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onCanPlayThrough={handleVideoLoad}
          >
            <source src={assets.video} type="video/mp4" />
            <source src={assets.video.replace('.mp4', '.webm')} type="video/webm" />
          </video>
        )}

        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
            Video no disponible
          </div>
        )}

        <div 
          className="absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${style.backgroundColor}40, ${style.primaryColor}20)`,
          }}
        />
        
        {/* Audio-reactive video overlay */}
        <AudioVideoOverlay 
          style={style}
          audioData={audioData}
          isEnabled={effectsEnabled && videoLoaded && !videoError}
          intensity={effectsIntensity}
        />
      </div>
    </div>
  );
};