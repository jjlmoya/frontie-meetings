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
      console.log('Initializing Web Audio API...');
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
        console.log('Audio context created, state:', audioContextRef.current.state);
      }

      if (!analyzerRef.current && audioContextRef.current) {
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256;
        analyzerRef.current.smoothingTimeConstant = 0.3; // Menos suavizado para más sensibilidad
        console.log('Analyzer created with fftSize:', analyzerRef.current.fftSize);
      }

      if (!sourceRef.current && audioRef.current && audioContextRef.current && analyzerRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
        console.log('Audio source connected to analyzer');
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);

  const startAnalysis = useCallback(() => {
    if (!analyzerRef.current) {
      console.error('No analyzer available for audio analysis');
      return;
    }

    console.log('Starting audio analysis...');
    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioData = () => {
      if (!analyzerRef.current) return;

      analyzerRef.current.getByteFrequencyData(dataArray);
      
      const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255;
      const arraySum = dataArray.reduce((sum, value) => sum + value, 0);
      
      // Debug cada 60 frames (~1 segundo)
      if (Math.floor(Date.now() / 1000) % 2 === 0 && Math.floor(Date.now() / 100) % 10 === 0) {
        console.log('Audio analysis - Volume:', volume.toFixed(3), 'Sum:', arraySum, 'First 5:', Array.from(dataArray.slice(0, 5)));
      }
      
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
      console.log('Attempting to play audio:', audioUrl);
      
      // Crear audio fresh si no existe
      if (!audioRef.current && audioUrl) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = currentVolume;
        audioRef.current.crossOrigin = 'anonymous';
        audioRef.current.preload = 'auto';
        
        console.log('Created new audio element');
      }
      
      if (audioRef.current) {
        // Primero configurar Web Audio API
        await initializeAudio();
        console.log('Audio initialized');
        
        // Asegurarse de que el contexto esté activo
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('Audio context resumed');
        }
        
        // Reproducir el audio
        audioRef.current.volume = currentVolume;
        await audioRef.current.play();
        console.log('Audio playing successfully!');
        
        // Iniciar análisis
        startAnalysis();
        console.log('Analysis started');
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      // Intentar reproducir sin Web Audio API como fallback
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          console.log('Audio playing without Web Audio API');
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