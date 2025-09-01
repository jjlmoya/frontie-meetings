'use client';

import { useEffect, useState } from 'react';
import type { ThemeConfig, AudioAnalyzerData } from '@/types';

interface StartingSoonTextProps {
  style: ThemeConfig;
  audioData?: AudioAnalyzerData;
}

export const StartingSoonText = ({ style, audioData }: StartingSoonTextProps) => {
  const [animationIntensity, setAnimationIntensity] = useState(0.5);

  useEffect(() => {
    if (audioData) {
      // Mucho más calmado - solo 30% de intensidad máxima
      setAnimationIntensity(Math.max(0.4, Math.min(0.7, 0.4 + audioData.volume * 0.3)));
    }
  }, [audioData]);

  const getAnimationClasses = () => {
    const baseClasses = 'text-6xl md:text-8xl lg:text-9xl font-bold text-center select-none';
    
    switch (style.textAnimation) {
      case 'wave-beach':
        return `${baseClasses}`;
      case 'funky-chaos':
        return `${baseClasses}`;
      case 'funky-glitch':
        return `${baseClasses}`;
      case 'groovie-psychedelic':
        return `${baseClasses}`;
      case 'metal-destruction':
        return `${baseClasses}`;
      case 'reggaeton-bounce':
        return `${baseClasses}`;
      default:
        return `${baseClasses}`;
    }
  };

  const getDynamicStyles = () => {
    const opacity = 0.9 + (animationIntensity * 0.05); // Menos variación de opacidad
    const animationDuration = Math.max(1.5, 3 - animationIntensity * 0.5); // Más lento y menos variable
    
    return {
      fontFamily: `${style.fontFamily}, ${style.fallbackFont}`,
      color: style.primaryColor,
      animation: `${style.textAnimation} ${animationDuration}s infinite`,
      opacity,
      transition: 'all 0.3s ease-out', // Transición más lenta
    };
  };


  return (
    <div className="absolute inset-0 flex items-end justify-center pb-32 z-10 pointer-events-none">
      <div className="text-center">
        <h1 
          className={getAnimationClasses()}
          style={getDynamicStyles()}
        >
          STARTING SOON
        </h1>
        
        <div className="mt-6 flex justify-center space-x-1">
          {Array.from(audioData?.frequencyData.slice(0, 8) || []).map((value, index) => (
            <div
              key={index}
              className="w-1 bg-current rounded-full transition-all duration-300" // Transición más lenta
              style={{
                height: `${Math.max(6, Math.min(16, (value / 255) * 12))}px`, // Altura más limitada
                opacity: 0.7 + (value / 255) * 0.2, // Menos variación de opacidad
                color: style.primaryColor,
                filter: `drop-shadow(0 0 ${Math.min(4, (value / 255) * 4)}px ${style.primaryColor})`, // Menos glow
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};