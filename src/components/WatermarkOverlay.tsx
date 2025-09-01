'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { AudioAnalyzerData } from '@/types';

interface WatermarkOverlayProps {
  audioData?: AudioAnalyzerData;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export const WatermarkOverlay = ({ audioData }: WatermarkOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const logoRef = useRef<HTMLDivElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastBassRef = useRef<number>(0);

  // Extraer SOLO graves para las ondas
  const getBassIntensity = () => {
    if (!audioData?.frequencyData || audioData.frequencyData.length === 0) return 0;
    
    const dataArray = Array.from(audioData.frequencyData);
    
    // SOLO graves (0-10% del espectro - más restrictivo)
    const bassEnd = Math.floor(dataArray.length * 0.1);
    const bassData = dataArray.slice(0, bassEnd);
    const bassValue = bassData.reduce((sum, val) => sum + val, 0) / bassData.length / 255;
    
    // Bass analysis complete
    
    // SOLO graves, no volumen general
    return bassValue;
  };

  // Canvas resize and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const bassIntensity = getBassIntensity();
      const logoElement = logoRef.current;
      
      // Detectar golpe de GRAVES y crear ondas
      if (logoElement && bassIntensity > 0.08 && bassIntensity > lastBassRef.current + 0.05) {
        const rect = logoElement.getBoundingClientRect();
        const logoX = rect.left + rect.width / 2;
        const logoY = rect.top + rect.height / 2;
        
        // Ondas según intensidad: normal=1, fuerte=2
        const waveCount = bassIntensity > 0.4 ? 2 : 1;
        
        for (let i = 0; i < waveCount; i++) {
          ripplesRef.current.push({
            x: logoX,
            y: logoY,
            radius: i * 20, // Menos separación
            maxRadius: 1200,
            alpha: 0.6 - (i * 0.15), // Menos diferencia
            speed: 4 + (i * 0.3) // Velocidades más cercanas
          });
        }
      }
      lastBassRef.current = bassIntensity;

      // Animar y dibujar todas las ondas existentes
      ripplesRef.current = ripplesRef.current.filter(ripple => {
        // Expandir onda
        ripple.radius += ripple.speed;
        ripple.alpha *= 0.985; // Desvanecer más lentamente

        // Dibujar onda
        if (ripple.alpha > 0.05) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Onda interior de color
          ctx.strokeStyle = `hsla(200, 70%, 70%, ${ripple.alpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Mantener onda si no ha desaparecido
        return ripple.alpha > 0.05 && ripple.radius < ripple.maxRadius;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData]);

  // Golpeos muy suaves del tambor
  const bassIntensity = getBassIntensity();
  
  // Scaling ultra suave
  const logoScale = 1 + (bassIntensity * 0.15); // Ultra suave: 1.0 a 1.15 máximo
  
  // Glow más sensible
  const logoGlow = bassIntensity > 0.05 ? 
    `drop-shadow-2xl drop-shadow-[0_0_${10 + bassIntensity * 40}px_rgba(255,255,255,${bassIntensity * 2})]` : 
    'drop-shadow-xl';

  return (
    <>
      {/* Canvas for ripple waves */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Animated DRUM logo */}
      <div 
        ref={logoRef}
        className="fixed bottom-0 right-0 z-40 pointer-events-none"
        style={{
          transform: `scale(${logoScale})`,
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Transición mucho más suave
          transformOrigin: 'center center'
        }}
      >
        <div className="p-3 bg-black/20 rounded-lg">
          <Image
            src="/favicon.png"
            alt="FRONT-LINE"
            width={120}
            height={120}
            className={`opacity-95 ${logoGlow}`}
            priority
          />
        </div>
      </div>
    </>
  );
};