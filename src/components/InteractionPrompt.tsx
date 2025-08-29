'use client';

interface InteractionPromptProps {
  show: boolean;
}

export const InteractionPrompt = ({ show }: InteractionPromptProps) => {
  if (!show) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm opacity-80 animate-pulse">
        🔊 Haz clic para activar audio
      </div>
    </div>
  );
};