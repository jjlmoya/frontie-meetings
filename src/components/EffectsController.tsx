'use client';

import { useState, useEffect } from 'react';

interface EffectsControllerProps {
  isEnabled: boolean;
  intensity: number;
  onToggle: (enabled: boolean) => void;
  onIntensityChange: (intensity: number) => void;
}

export const EffectsController = ({ 
  isEnabled, 
  intensity, 
  onToggle, 
  onIntensityChange 
}: EffectsControllerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const showController = () => {
    setIsVisible(true);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 4000);
    setHideTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  const handleToggle = () => {
    onToggle(!isEnabled);
    showController();
  };

  const handleIntensityChange = (newIntensity: number) => {
    onIntensityChange(newIntensity);
    showController();
  };

  return (
    <>
      <button
        onClick={showController}
        className="fixed bottom-4 left-4 z-50 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
        title="Audio Effects"
      >
        🎨
      </button>

      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm transition-all duration-200 min-w-[200px]">
          {/* Effects Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Audio Effects</span>
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Intensity Slider */}
          {isEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Intensity</span>
                <span className="text-xs text-gray-300">{Math.round(intensity * 100)}%</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={intensity}
                onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer effects-slider"
              />
            </div>
          )}

          <div className="text-center text-xs mt-2 opacity-70">
            {isEnabled ? 'Effects Active' : 'Effects Disabled'}
          </div>
        </div>
      )}

      <style jsx>{`
        .effects-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 6px rgba(59, 130, 246, 0.5);
        }
        
        .effects-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 6px rgba(59, 130, 246, 0.5);
        }

        .effects-slider::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.2);
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};