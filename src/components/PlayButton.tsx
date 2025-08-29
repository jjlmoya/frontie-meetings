'use client';

import { useState } from 'react';

interface PlayButtonProps {
  onPlay: () => void;
  audioUrl: string;
}

export const PlayButton = ({ onPlay, audioUrl }: PlayButtonProps) => {
  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    setClicked(true);
    
    // Reproducir audio directamente aquí para asegurar que funcione
    try {
      const audio = new Audio(audioUrl);
      audio.volume = 0.2;
      audio.loop = true;
      await audio.play();
      console.log('Audio started successfully from button!');
      
      // Hacer que el audio sea accesible globalmente para el control de volumen
      (window as any).globalAudio = audio;
      
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
    
    onPlay();
  };

  if (clicked) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
      <button
        onClick={handleClick}
        className="bg-white/90 hover:bg-white text-black px-8 py-4 rounded-full text-xl font-semibold shadow-2xl transition-all duration-200 hover:scale-105"
      >
        ▶️ Click para activar audio
      </button>
    </div>
  );
};