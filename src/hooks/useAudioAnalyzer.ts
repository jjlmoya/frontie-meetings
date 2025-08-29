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
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.loop = true;
        audioRef.current.crossOrigin = 'anonymous';
        audioRef.current.volume = 0; // Empezar en silencio para fade-in
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (!analyzerRef.current) {
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256;
        analyzerRef.current.smoothingTimeConstant = 0.8;
      }

      if (!sourceRef.current && audioRef.current && audioContextRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, [audioUrl]);

  const startAnalysis = useCallback(() => {
    if (!analyzerRef.current) return;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioData = () => {
      if (!analyzerRef.current) return;

      analyzerRef.current.getByteFrequencyData(dataArray);
      
      const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255;
      
      setAudioData({
        frequencyData: new Uint8Array(dataArray),
        volume,
        isPlaying: audioRef.current?.paused === false,
      });

      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    };

    updateAudioData();
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
      // Crear audio fresh si no existe
      if (!audioRef.current && audioUrl) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0;
        
        // Configurar para autoplay
        audioRef.current.autoplay = true;
        audioRef.current.preload = 'auto';
      }
      
      if (audioRef.current) {
        try {
          // Intentar reproducir directamente primero
          audioRef.current.volume = 0;
          await audioRef.current.play();
          console.log('Audio autoplay successful!');
          
          // Luego configurar Web Audio API para análisis
          await initializeAudio();
          
          if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
          }
          
          startAnalysis();
          fadeIn(currentVolume);
        } catch (playError) {
          console.warn('Autoplay blocked, trying alternative:', playError);
          // Fallback: reproducir con volumen inmediatamente
          if (audioRef.current) {
            audioRef.current.volume = currentVolume;
            await audioRef.current.play();
            console.log('Audio playing with direct volume');
          }
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [initializeAudio, startAnalysis, fadeIn, currentVolume, audioUrl]);

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