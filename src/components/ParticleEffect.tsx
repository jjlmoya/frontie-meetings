'use client';

import { useEffect, useRef } from 'react';
import type { ThemeConfig, AudioAnalyzerData } from '@/types';

interface ParticleEffectProps {
  style: ThemeConfig;
  audioData?: AudioAnalyzerData;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'glow' | 'trail' | 'explosion';
}

export const ParticleEffect = ({ style, audioData }: ParticleEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getParticleConfig = () => {
      switch (style.textAnimation) {
        case 'wave-beach':
          return {
            colors: ['#00FFFF', '#87CEEB', '#1E90FF', '#00BFFF'],
            particleCount: 50,
            types: ['glow', 'trail'] as const
          };
        case 'funky-chaos':
          return {
            colors: ['#FF1493', '#FF69B4', '#8A2BE2', '#FFD700'],
            particleCount: 80,
            types: ['spark', 'explosion'] as const
          };
        case 'funky-glitch':
          return {
            colors: ['#FFD700', '#FF4500', '#FFA500'],
            particleCount: 60,
            types: ['spark', 'trail'] as const
          };
        case 'groovie-psychedelic':
          return {
            colors: ['#9932CC', '#FF69B4', '#DA70D6', '#BA55D3'],
            particleCount: 100,
            types: ['glow', 'explosion'] as const
          };
        case 'metal-destruction':
          return {
            colors: ['#FF0000', '#FF4500', '#800000', '#B22222'],
            particleCount: 120,
            types: ['explosion', 'spark'] as const
          };
        default:
          return {
            colors: ['#FFFFFF'],
            particleCount: 30,
            types: ['glow'] as const
          };
      }
    };

    const createParticle = (): Particle => {
      const config = getParticleConfig();
      const audioIntensity = audioData?.volume || 0.5;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 4 * audioIntensity,
        vy: (Math.random() - 0.5) * 4 * audioIntensity,
        life: 0,
        maxLife: Math.random() * 100 + 50,
        size: Math.random() * 8 + 2,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        type: config.types[Math.floor(Math.random() * config.types.length)]
      };
    };

    const updateParticles = () => {
      const config = getParticleConfig();
      const audioIntensity = audioData?.volume || 0.2;
      
      // Create new particles based on audio intensity
      const newParticleCount = Math.floor(audioIntensity * config.particleCount);
      for (let i = 0; i < newParticleCount && particlesRef.current.length < config.particleCount * 2; i++) {
        particlesRef.current.push(createParticle());
      }

      // Update existing particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.life++;
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Apply different physics based on type
        switch (particle.type) {
          case 'spark':
            particle.vy += 0.1; // Gravity
            particle.vx *= 0.99; // Air resistance
            break;
          case 'glow':
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            break;
          case 'trail':
            // No physics changes
            break;
          case 'explosion':
            particle.vx *= 1.02; // Accelerate outward
            particle.vy *= 1.02;
            break;
        }

        return particle.life < particle.maxLife;
      });
    };

    const drawParticle = (particle: Particle) => {
      const alpha = 1 - (particle.life / particle.maxLife);
      ctx.save();
      
      ctx.globalAlpha = alpha;
      
      switch (particle.type) {
        case 'spark':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'glow':
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'trail':
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
          ctx.lineTo(particle.x, particle.y);
          ctx.stroke();
          break;
          
        case 'explosion':
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          const spikes = 8;
          const outerRadius = particle.size;
          const innerRadius = particle.size * 0.5;
          
          for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            const nextAngle = ((i + 1) / spikes) * Math.PI * 2;
            
            if (i === 0) {
              ctx.moveTo(
                particle.x + Math.cos(angle) * outerRadius,
                particle.y + Math.sin(angle) * outerRadius
              );
            }
            
            ctx.lineTo(
              particle.x + Math.cos(angle + Math.PI / spikes) * innerRadius,
              particle.y + Math.sin(angle + Math.PI / spikes) * innerRadius
            );
            ctx.lineTo(
              particle.x + Math.cos(nextAngle) * outerRadius,
              particle.y + Math.sin(nextAngle) * outerRadius
            );
          }
          
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updateParticles();
      
      particlesRef.current.forEach(drawParticle);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [style.textAnimation, audioData]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-5"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};