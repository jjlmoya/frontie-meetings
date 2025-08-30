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
      setAnimationIntensity(Math.max(0.3, Math.min(1, audioData.volume * 2)));
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
      default:
        return `${baseClasses}`;
    }
  };

  const getDynamicStyles = () => {
    const opacity = 0.9 + (animationIntensity * 0.1);
    const animationDuration = Math.max(0.5, 2 - animationIntensity);
    
    return {
      fontFamily: `${style.fontFamily}, ${style.fallbackFont}`,
      color: style.primaryColor,
      animation: `${style.textAnimation} ${animationDuration}s infinite`,
      opacity,
      transition: 'all 0.1s ease-out',
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
          {Array.from(audioData?.frequencyData.slice(0, 12) || []).map((value, index) => (
            <div
              key={index}
              className="w-1 bg-current rounded-full transition-all duration-100"
              style={{
                height: `${Math.max(4, (value / 255) * 24)}px`,
                opacity: 0.6 + (value / 255) * 0.4,
                color: style.primaryColor,
                filter: `drop-shadow(0 0 ${(value / 255) * 8}px ${style.primaryColor})`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};