'use client';

import { useEffect, useState } from 'react';
import { MediaPlayer } from '@/components/MediaPlayer';
import { StartingSoonText } from '@/components/StartingSoonText';
import { VolumeController } from '@/components/VolumeController';
import { WatermarkOverlay } from '@/components/WatermarkOverlay';
import { InteractionPrompt } from '@/components/InteractionPrompt';
import { useMeetingConfig } from '@/hooks/useMeetingConfig';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

export default function FantasiaPage() {
  const { config, loading, error } = useMeetingConfig();
  const { audioData, play, isReady, setVolume, currentVolume } = useAudioAnalyzer(config?.assets.audio || '', 0.2);
  const [configKey, setConfigKey] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);

  // Detectar cualquier interacción del usuario y reproducir directamente
  useEffect(() => {
    const handleInteraction = async () => {
      if (!userInteracted && config) {
        setUserInteracted(true);
        
        // Reproducir directamente aquí sin esperar al hook complejo
        try {
          const audio = new Audio(config.assets.audio);
          audio.volume = 0.2;
          audio.loop = true;
          await audio.play();
          console.log('Audio playing after interaction!');
          
          // Guardar referencia global para control de volumen
          (window as any).globalAudio = audio;
        } catch (error) {
          console.error('Failed to play audio after interaction:', error);
        }
      }
    };

    // Solo click por ahora para ser más específico
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [config, userInteracted]);

  // Refresh cuando cambie la query
  useEffect(() => {
    setConfigKey(prev => prev + 1);
  }, [config?.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading FANTASIA...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-red-900">
        <div className="text-white text-xl">Error: {error.message}</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">No meeting configured</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <MediaPlayer 
        key={configKey}
        assets={config.assets}
        style={config.style}
      />
      
      <StartingSoonText 
        style={config.style}
        audioData={audioData}
      />

      <VolumeController 
        volume={currentVolume}
        onVolumeChange={setVolume}
      />

      <WatermarkOverlay />

      <InteractionPrompt show={!userInteracted && !!config} />
    </div>
  );
}
