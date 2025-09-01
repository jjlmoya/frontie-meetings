'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ParticlePool } from '@/utils/ParticlePool';
import type { ThemeConfig, AudioAnalyzerData } from '@/types';

interface ParticleEffectProps {
  style: ThemeConfig;
  audioData?: AudioAnalyzerData;
  isEnabled?: boolean;
  intensity?: number;
}

export const ParticleEffect = ({ 
  style, 
  audioData, 
  isEnabled = true, 
  intensity = 1.0 
}: ParticleEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poolRef = useRef<ParticlePool | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const [fps, setFps] = useState<number>(60);

  // Initialize particle pool
  const initializePool = useCallback(() => {
    if (!poolRef.current) {
      poolRef.current = new ParticlePool(100, 500);
    }
  }, []);

  // Get particle configuration based on theme
  const getParticleConfig = useCallback(() => {
    const baseConfig = {
      'wave-beach': {
        colors: ['#00FFFF', '#87CEEB', '#1E90FF', '#00BFFF'],
        particleCount: 30, // Reduced for performance
        types: ['glow', 'trail'] as const
      },
      'funky-chaos': {
        colors: ['#FF1493', '#FF69B4', '#8A2BE2', '#FFD700'],
        particleCount: 50,
        types: ['spark', 'explosion'] as const
      },
      'funky-glitch': {
        colors: ['#FFD700', '#FF4500', '#FFA500'],
        particleCount: 40,
        types: ['spark', 'trail'] as const
      },
      'groovie-psychedelic': {
        colors: ['#9932CC', '#FF69B4', '#DA70D6', '#BA55D3'],
        particleCount: 60,
        types: ['glow', 'explosion'] as const
      },
      'metal-destruction': {
        colors: ['#FF0000', '#FF4500', '#800000', '#B22222'],
        particleCount: 70,
        types: ['explosion', 'spark'] as const
      }
    };
    
    return baseConfig[style.textAnimation as keyof typeof baseConfig] || {
      colors: ['#FFFFFF'],
      particleCount: 20,
      types: ['glow'] as const
    };
  }, [style.textAnimation]);

  // Optimized drawing function
  const drawPooledParticle = useCallback((ctx: CanvasRenderingContext2D, particle: any) => {
    if (!particle.isActive || particle.alpha <= 0) return;
    
    ctx.save();
    ctx.globalAlpha = particle.alpha * intensity;
    
    switch (particle.type) {
      case 'spark':
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'glow':
        // Use cached gradients for better performance
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'trail':
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.vx * 3, particle.y - particle.vy * 3);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
        break;
        
      case 'explosion':
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        const radius = particle.size;
        ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'ripple':
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 - particle.alpha), 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }, [intensity]);

  // Performance-optimized animation loop
  const animate = useCallback((currentTime: number) => {
    if (!isEnabled) return;
    
    const canvas = canvasRef.current;
    const pool = poolRef.current;
    if (!canvas || !pool) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate FPS
    if (lastFrameTime.current) {
      const deltaTime = currentTime - lastFrameTime.current;
      const currentFps = Math.round(1000 / deltaTime);
      setFps(currentFps);
    }
    lastFrameTime.current = currentTime;

    // Skip frame if FPS too low (performance throttling)
    if (fps < 30) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Clear canvas efficiently
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update particles through pool
    pool.update();
    
    // Create new particles based on audio intensity
    const config = getParticleConfig();
    const audioIntensity = (audioData?.volume || 0.2) * intensity;
    const newParticleCount = Math.floor(audioIntensity * config.particleCount * 0.3); // Throttled
    
    for (let i = 0; i < newParticleCount; i++) {
      pool.acquire({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3 * audioIntensity,
        vy: (Math.random() - 0.5) * 3 * audioIntensity,
        maxLife: Math.random() * 80 + 40,
        size: Math.random() * 6 + 2,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        type: config.types[Math.floor(Math.random() * config.types.length)]
      });
    }
    
    // Draw all active particles
    const activeParticles = pool.getActiveParticles();
    activeParticles.forEach(particle => drawPooledParticle(ctx, particle));
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isEnabled, intensity, audioData, getParticleConfig, drawPooledParticle, fps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;

    // Resize canvas efficiently
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    initializePool();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (poolRef.current) {
        poolRef.current.clear();
      }
    };
  }, [isEnabled, initializePool, animate]);

  if (!isEnabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-5 w-full h-full"
        style={{ 
          mixBlendMode: 'screen',
          opacity: intensity,
          willChange: 'transform'
        }}
      />
      
    </>
  );
};