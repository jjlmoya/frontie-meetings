import { useEffect, useRef, useState, useCallback } from 'react';
import type { AudioAnalyzerData } from '@/types';

export const useAudioAnalyzer = (audioUrl: string, initialVolume: number = 0.2) => {
  const [audioData, setAudioData] = useState<AudioAnalyzerData>({
    frequencyData: new Uint8Array(128),
    volume: 0,
    isPlaying: false,
  });
  
  const [currentVolume, setCurrentVolume] = useState(initialVolume);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const initializeAudio = useCallback(async () => {
    try {
      // Initializing Web Audio API
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
        // Audio context created
      }

      if (!analyzerRef.current && audioContextRef.current) {
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256;
        analyzerRef.current.smoothingTimeConstant = 0.3; // Menos suavizado para más sensibilidad
        // Audio analyzer created
      }

      if (!sourceRef.current && audioRef.current && audioContextRef.current && analyzerRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
        // Audio source connected
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);

  const startAnalysis = useCallback(() => {
    if (!analyzerRef.current) {
      return;
    }

    // Starting audio analysis
    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let lastUpdateTime = 0;
    const updateInterval = 1000 / 30; // 30fps max for audio data

    const updateAudioData = (currentTime: number) => {
      if (!analyzerRef.current) return;

      // Throttle updates to 30fps to prevent infinite loops
      if (currentTime - lastUpdateTime >= updateInterval) {
        analyzerRef.current.getByteFrequencyData(dataArray);
        
        const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255;
        
        // Only update if there's a significant change
        setAudioData(prev => {
          const volumeChanged = Math.abs(prev.volume - volume) > 0.01;
          if (volumeChanged) {
            return {
              frequencyData: new Uint8Array(dataArray),
              volume,
              isPlaying: audioRef.current?.paused === false,
            };
          }
          return prev;
        });
        
        lastUpdateTime = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    };

    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, []);

  const fadeIn = useCallback((targetVolume: number, duration: number = 2000) => {
    if (!audioRef.current || fadeIntervalRef.current) return;

    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) return;

      currentStep++;
      const newVolume = Math.min(volumeStep * currentStep, targetVolume);
      audioRef.current.volume = newVolume;

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
      }
    }, stepDuration);
  }, []);

  const fadeOut = useCallback((duration: number = 1500) => {
    if (!audioRef.current || fadeIntervalRef.current) return;

    const currentVol = audioRef.current.volume;
    const steps = 15;
    const stepDuration = duration / steps;
    const volumeStep = currentVol / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) return;

      currentStep++;
      const newVolume = Math.max(currentVol - (volumeStep * currentStep), 0);
      audioRef.current.volume = newVolume;

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, stepDuration);
  }, []);

  const setVolume = useCallback((volume: number) => {
    setCurrentVolume(volume);
    if (audioRef.current && !fadeIntervalRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  const play = useCallback(async () => {
    try {
      // Attempting audio playback
      
      // Crear audio fresh si no existe
      if (!audioRef.current && audioUrl) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = currentVolume;
        audioRef.current.crossOrigin = 'anonymous';
        audioRef.current.preload = 'auto';
        
        // Audio element created
      }
      
      if (audioRef.current) {
        // Primero configurar Web Audio API
        await initializeAudio();
        // Audio system initialized
        
        // Asegurarse de que el contexto esté activo
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
          // Audio context resumed
        }
        
        // Reproducir el audio
        audioRef.current.volume = currentVolume;
        await audioRef.current.play();
        // Audio playback started
        
        // Iniciar análisis
        startAnalysis();
        // Audio analysis active
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      // Intentar reproducir sin Web Audio API como fallback
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          // Fallback audio playback active
        } catch (fallbackError) {
          console.error('Fallback audio play failed:', fallbackError);
        }
      }
    }
  }, [initializeAudio, startAnalysis, currentVolume, audioUrl]);

  const pause = useCallback(() => {
    fadeOut();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setAudioData(prev => ({ ...prev, isPlaying: false }));
  }, [fadeOut]);

  const stop = useCallback(() => {
    pause();
  }, [pause]);

  useEffect(() => {
    return () => {
      stop();
      
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      
      if (analyzerRef.current) {
        analyzerRef.current.disconnect();
        analyzerRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [stop]);

  return {
    audioData,
    play,
    pause,
    stop,
    setVolume,
    currentVolume,
    isReady: !!audioRef.current && !!analyzerRef.current,
  };
};