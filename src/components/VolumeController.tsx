'use client';

import { useState, useEffect } from 'react';

interface VolumeControllerProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const VolumeController = ({ volume, onVolumeChange }: VolumeControllerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const showController = () => {
    setIsVisible(true);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    setHideTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  const handleVolumeChange = (newVolume: number) => {
    onVolumeChange(newVolume);
    
    // Controlar el audio global si existe
    if ((window as any).globalAudio) {
      (window as any).globalAudio.volume = newVolume;
    }
    
    showController();
  };

  return (
    <>
      <button
        onClick={showController}
        className="fixed bottom-4 left-20 z-50 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
        title="Control de volumen"
      >
        🔊
      </button>

      {isVisible && (
        <div className="fixed bottom-16 left-20 z-50 bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm transition-all duration-200">
          <div className="flex items-center space-x-3 min-w-[150px]">
            <span className="text-xs">🔇</span>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer volume-slider"
            />
            
            <span className="text-xs">🔊</span>
          </div>
          
          <div className="text-center text-xs mt-1 opacity-70">
            {Math.round(volume * 100)}%
          </div>
        </div>
      )}

      <style jsx>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
        
        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
      `}</style>
    </>
  );
};