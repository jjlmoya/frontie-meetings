'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { MediaAssets, ThemeConfig, AudioAnalyzerData } from '@/types';
import { ParticleEffect } from './ParticleEffect';

interface MediaPlayerProps {
  assets: MediaAssets;
  style: ThemeConfig;
  audioData?: AudioAnalyzerData;
  effectsEnabled?: boolean;
  effectsIntensity?: number;
  onVideoError?: () => void;
  onVideoLoad?: () => void;
  onVideoTimeUpdate?: (time: number) => void;
  embeddedAudio?: { volume: number; onEnabled: () => void };
  preserveFrame?: boolean;
}

export const MediaPlayer = ({ 
  assets, 
  style, 
  audioData, 
  effectsEnabled = true,
  effectsIntensity = 0.8,
  onVideoError, 
  onVideoLoad,
  onVideoTimeUpdate,
  embeddedAudio,
  preserveFrame = false,
}: MediaPlayerProps) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(!assets.video);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(!assets.video);
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
        videoRef.current.play().catch(handleVideoError);
      }
    };

    if (videoLoaded && videoRef.current) {
      const timer = setTimeout(handleVideoPlay, 1000);
      return () => clearTimeout(timer);
    }
  }, [videoLoaded, handleVideoError]);

  const embeddedVolume = embeddedAudio?.volume;
  const onSoundEnabled = embeddedAudio?.onEnabled;
  useEffect(() => {
    if (embeddedVolume !== undefined && videoRef.current) {
      videoRef.current.volume = embeddedVolume;
    }
  }, [embeddedVolume, videoLoaded]);

  useEffect(() => {
    if (!onSoundEnabled || soundEnabled) return;

    const enableSound = () => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = false;
      void video.play().then(() => {
        setSoundEnabled(true);
        onSoundEnabled();
      }).catch(() => {
        video.muted = true;
      });
    };

    document.addEventListener('click', enableSound);
    document.addEventListener('keydown', enableSound);
    return () => {
      document.removeEventListener('click', enableSound);
      document.removeEventListener('keydown', enableSound);
    };
  }, [onSoundEnabled, soundEnabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!onVideoTimeUpdate || !video || !video.requestVideoFrameCallback) return;

    let frame: number;
    const update: VideoFrameRequestCallback = (_, { mediaTime }) => {
      onVideoTimeUpdate(mediaTime);
      frame = video.requestVideoFrameCallback(update);
    };
    frame = video.requestVideoFrameCallback(update);
    return () => video.cancelVideoFrameCallback(frame);
  }, [assets.video, onVideoTimeUpdate, videoError]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ backgroundColor: style.backgroundColor }}
      >
        {assets.video && !videoError && (
          <video
            ref={videoRef}
            className={`w-full h-full ${preserveFrame ? 'object-contain' : 'object-cover'} transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            muted={!soundEnabled}
            loop
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoad}
            onSeeked={(event) => onVideoTimeUpdate?.(event.currentTarget.currentTime)}
            onTimeUpdate={(event) => onVideoTimeUpdate?.(event.currentTarget.currentTime)}
            onError={handleVideoError}
            onCanPlayThrough={handleVideoLoad}
          >
            <source src={assets.video} type="video/mp4" />
            <source src={assets.video.replace('.mp4', '.webm')} type="video/webm" />
          </video>
        )}

        {(!assets.video || videoError) && (
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
        
        {/* High-performance particle effects */}
        <ParticleEffect 
          style={style}
          audioData={audioData}
          isEnabled={effectsEnabled && videoLoaded && !videoError}
          intensity={effectsIntensity}
        />
      </div>
    </div>
  );
};
