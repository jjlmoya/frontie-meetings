'use client';

import { useEffect, useState } from 'react';
import { MediaPlayer } from '@/components/MediaPlayer';
import { StartingSoonText } from '@/components/StartingSoonText';
import { VolumeController } from '@/components/VolumeController';
import { WatermarkOverlay } from '@/components/WatermarkOverlay';
import { InteractionPrompt } from '@/components/InteractionPrompt';
import { EffectsController } from '@/components/EffectsController';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { WebGLEffects } from '@/components/WebGLEffects';
import { LiveMessenger } from '@/components/LiveMessenger';
import { useMeetingConfig } from '@/hooks/useMeetingConfig';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';

export default function FantasiaPage() {
  const { config, loading, error } = useMeetingConfig();
  const { audioData, setVolume, currentVolume, play } = useAudioAnalyzer(config?.assets.audio || '', 0.05);
  const [configKey, setConfigKey] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [effectsIntensity, setEffectsIntensity] = useState(0.8);

  // Detectar cualquier interacción del usuario y usar el hook correctamente
  useEffect(() => {
    const handleInteraction = async () => {
      if (!userInteracted && config && play) {
        setUserInteracted(true);
        
        // Usar el hook de audio que tiene el analizador
        try {
          await play();
          // Audio started successfully
        } catch (error) {
          console.error('Failed to play audio with hook:', error);
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
  }, [config, userInteracted, play]);

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
        audioData={audioData}
        effectsEnabled={effectsEnabled}
        effectsIntensity={effectsIntensity}
      />

      {/* High-performance WebGL effects layer - ABOVE VIDEO */}
      <WebGLEffects
        style={config.style}
        audioData={audioData}
        isEnabled={effectsEnabled}
        intensity={effectsIntensity}
      />
      
      <StartingSoonText 
        style={config.style}
        audioData={audioData}
      />

      <VolumeController 
        volume={currentVolume}
        onVolumeChange={setVolume}
      />

      <WatermarkOverlay audioData={audioData} />

      <EffectsController 
        isEnabled={effectsEnabled}
        intensity={effectsIntensity}
        onToggle={setEffectsEnabled}
        onIntensityChange={setEffectsIntensity}
      />

      <PerformanceMonitor 
        position="top-right"
        isVisible={false}
      />

      <InteractionPrompt show={!userInteracted && !!config} />

      <LiveMessenger />
    </div>
  );
}
