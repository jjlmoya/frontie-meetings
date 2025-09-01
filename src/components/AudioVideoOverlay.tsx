'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ThemeConfig, AudioAnalyzerData } from '@/types';

interface AudioVideoOverlayProps {
  style: ThemeConfig;
  audioData?: AudioAnalyzerData;
  isEnabled?: boolean;
  intensity?: number;
}

interface AudioFrequencies {
  bass: number;      // 0-60Hz
  mid: number;       // 60Hz-4kHz  
  treble: number;    // 4kHz+
  volume: number;    // Overall volume
}

export const AudioVideoOverlay = ({ 
  style, 
  audioData, 
  isEnabled = true, 
  intensity = 1.0 
}: AudioVideoOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [frequencies, setFrequencies] = useState<AudioFrequencies>({
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0
  });

  // Analyze frequency bands from audio data
  const analyzeFrequencies = (frequencyData: Uint8Array): AudioFrequencies => {
    const dataArray = Array.from(frequencyData);
    const totalBands = dataArray.length;
    
    // Rough frequency band splits (assuming 44kHz sample rate)
    const bassEnd = Math.floor(totalBands * 0.1);      // ~2.2kHz
    const midEnd = Math.floor(totalBands * 0.6);       // ~13kHz
    
    const bassData = dataArray.slice(0, bassEnd);
    const midData = dataArray.slice(bassEnd, midEnd);
    const trebleData = dataArray.slice(midEnd);
    
    const bass = bassData.reduce((sum, val) => sum + val, 0) / bassData.length / 255;
    const mid = midData.reduce((sum, val) => sum + val, 0) / midData.length / 255;
    const treble = trebleData.reduce((sum, val) => sum + val, 0) / trebleData.length / 255;
    const volume = dataArray.reduce((sum, val) => sum + val, 0) / totalBands / 255;
    
    return { bass, mid, treble, volume };
  };

  // Update frequencies when audio data changes
  useEffect(() => {
    if (audioData && audioData.frequencyData.length > 0) {
      const newFreqs = analyzeFrequencies(audioData.frequencyData);
      setFrequencies(newFreqs);
    }
  }, [audioData]);

  // Canvas resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
    };

    // Resize immediately and on window resize
    const timer = setTimeout(resizeCanvas, 100); // Give DOM time to render
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Beach theme wave effects
  const drawBeachEffects = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const time = Date.now() * 0.002;
    const { bass, volume } = frequencies;
    
    // Use minimum values when no audio
    const effectiveBass = bass || 0.5;
    const effectiveVolume = volume || 0.4;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Wave overlay that pulses with bass
    const waveIntensity = effectiveBass * intensity * 0.8;
    if (waveIntensity > 0.1) {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, `rgba(0, 255, 255, ${waveIntensity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(135, 206, 235, ${waveIntensity * 0.2})`);
      gradient.addColorStop(1, `rgba(30, 144, 255, ${waveIntensity * 0.1})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Horizontal wave lines
    ctx.strokeStyle = `rgba(0, 255, 255, ${effectiveVolume * intensity * 0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < 5; i++) {
      const y = canvas.height * (0.2 + i * 0.15);
      const amplitude = effectiveBass * 20 * intensity;
      
      ctx.moveTo(0, y);
      for (let x = 0; x < canvas.width; x += 10) {
        const waveY = y + Math.sin((x * 0.01) + time + (i * 0.5)) * amplitude;
        ctx.lineTo(x, waveY);
      }
    }
    ctx.stroke();
  };

  // Metal theme explosion effects
  const drawMetalEffects = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { bass, treble } = frequencies;
    
    // Use minimum values when no audio
    const effectiveBass = bass || 0.6;
    const effectiveTreble = treble || 0.5;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Red explosion overlay on heavy bass
    const explosionIntensity = effectiveBass * intensity;
    if (explosionIntensity > 0.2) {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, `rgba(255, 0, 0, ${explosionIntensity * 0.4})`);
      gradient.addColorStop(0.7, `rgba(255, 69, 0, ${explosionIntensity * 0.2})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Spark lines on treble peaks
    if (effectiveTreble > 0.2) {
      ctx.strokeStyle = `rgba(255, 255, 0, ${effectiveTreble * intensity * 0.8})`;
      ctx.lineWidth = 2;
      
      for (let i = 0; i < effectiveTreble * 8; i++) {
        ctx.beginPath();
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * canvas.height;
        const endX = startX + (Math.random() - 0.5) * 100;
        const endY = startY + (Math.random() - 0.5) * 100;
        
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }
  };

  // Groovie theme kaleidoscope effects
  const drawGroovieEffects = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const time = Date.now() * 0.0015; // Un pelín más rápido
    const { bass, mid, treble, volume } = frequencies;
    
    // Use minimum values when no audio - MUCHO más calmado
    const effectiveBass = Math.min(0.6, bass || 0.3);
    const effectiveMid = Math.min(0.5, mid || 0.25);
    const effectiveTreble = Math.min(0.4, treble || 0.2);
    const effectiveVolume = Math.min(0.5, volume || 0.3);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Suave túnel hipnótico
    for (let layer = 0; layer < 3; layer++) { // Menos capas
      const tunnelRotation = time * (0.1 + layer * 0.05); // Mucho más lento
      const tunnelRadius = 100 + layer * 120; // Más espaciado
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(tunnelRotation);
      
      const tunnelGradient = ctx.createRadialGradient(0, 0, tunnelRadius * 0.3, 0, 0, tunnelRadius);
      tunnelGradient.addColorStop(0, 'transparent');
      tunnelGradient.addColorStop(0.8, `hsla(${(time * 20 + layer * 120) % 360}, 70%, 60%, ${0.15 * effectiveVolume})`); // Menos saturado y más suave
      tunnelGradient.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = tunnelGradient;
      ctx.lineWidth = 2; // Más fino
      ctx.beginPath();
      ctx.arc(0, 0, tunnelRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    // Psychedelic rotating gradient backdrop
    const rotation = time + effectiveVolume * intensity * Math.PI;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(canvas.width, canvas.height) / 2);
    gradient.addColorStop(0, `rgba(255, 20, 147, ${effectiveBass * intensity * 0.25})`); // Un poquito más intenso
    gradient.addColorStop(0.3, `rgba(255, 105, 180, ${effectiveMid * intensity * 0.18})`);
    gradient.addColorStop(0.6, `rgba(138, 43, 226, ${effectiveTreble * intensity * 0.15})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, 0.04)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
    ctx.restore();
    
    // Floating orbs/bubbles (un pelín más activos)
    for (let i = 0; i < 10; i++) { // Un par más de orbes
      const angle = (time * 0.3) + (i * Math.PI * 2 / 10); // Un pelín más rápido
      const radius = 150 + Math.sin(time * 0.7 + i) * 90; // Más movimiento
      const x = centerX + Math.cos(angle) * radius * effectiveVolume;
      const y = centerY + Math.sin(angle) * radius * effectiveVolume;
      
      const orbSize = 18 + Math.sin(time * 1.2 + i) * 10; // Un poco más grandes y activos
      const hue = (time * 25 + i * 36) % 360; // Cambio de color un poco más rápido
      
      // Outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, orbSize * 2);
      gradient.addColorStop(0, `hsla(${hue}, 85%, 70%, 0.6)`); // Un poquito más intenso
      gradient.addColorStop(0.5, `hsla(${hue}, 85%, 60%, 0.3)`);
      gradient.addColorStop(1, `hsla(${hue}, 85%, 50%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, orbSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner bright core
      ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.6)`;
      ctx.beginPath();
      ctx.arc(x, y, orbSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Las ondas ahora salen del logo, no del centro
    
    // Partículas un pelín más guays
    for (let i = 0; i < 8; i++) {
      const particleAngle = (time * 0.15) + (i * Math.PI * 2 / 8); // Un poco más rápido
      const particleRadius = 280 + Math.sin(time * 0.4 + i) * 70; // Más movimiento
      const x = centerX + Math.cos(particleAngle) * particleRadius * effectiveVolume * 0.7;
      const y = centerY + Math.sin(particleAngle) * particleRadius * effectiveVolume * 0.7;
      
      const particleSize = 8 + Math.sin(time * 0.8 + i) * 4; // Un poco más grandes
      const hue = (time * 18 + i * 45) % 360; // Cambio de color un pelín más rápido
      
      // Partícula con un poco más de presencia
      const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize * 4);
      particleGradient.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.5)`); // Un pelín más saturado e intenso
      particleGradient.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);
      
      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(x, y, particleSize * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply effects based on theme keywords
    const theme = style.textAnimation;
    
    if (theme.includes('beach') || theme.includes('wave')) {
      drawBeachEffects(ctx, canvas);
    } else if (theme.includes('metal') || theme.includes('destruction')) {
      drawMetalEffects(ctx, canvas);
    } else if (theme.includes('groovie') || theme.includes('psychedelic')) {
      drawGroovieEffects(ctx, canvas);
    } else if (theme.includes('funky') || theme.includes('chaos') || theme.includes('glitch')) {
      // Funky themes get a mix of groovie and metal effects
      drawGroovieEffects(ctx, canvas);
    } else {
      // Default: subtle groovie effects for any unknown theme
      drawGroovieEffects(ctx, canvas);
    }
    
    animationRef.current = requestAnimationFrame(render);
  }, [isEnabled, style.textAnimation, frequencies, intensity, drawBeachEffects, drawGroovieEffects, drawMetalEffects]);

  // Start/stop animation loop
  useEffect(() => {
    if (isEnabled) {
      animationRef.current = requestAnimationFrame(render);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isEnabled, render]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      style={{
        mixBlendMode: 'screen',
        opacity: intensity,
        willChange: 'transform',
        display: 'block',
      }}
    />
  );
};