'use client';

import { useState } from 'react';
import { MeetingService } from '@/services/MeetingService';
import { NON_DAILY_CONFIGS } from '@/config/meetings';

interface ForcePanelProps {
  onConfigForced?: () => void;
}

export const ForcePanel = ({ onConfigForced }: ForcePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState('');
  const [duration, setDuration] = useState(60);

  const meetingService = new MeetingService();

  const handleForceConfig = () => {
    if (!selectedConfig) return;

    const success = meetingService.forceConfig(selectedConfig, duration);
    if (success) {
      setIsOpen(false);
      onConfigForced?.();
    }
  };

  const handleClearForced = () => {
    meetingService.clearForcedConfig();
    setIsOpen(false);
    onConfigForced?.();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm hover:bg-black/70 transition-colors"
      >
        ⚙️ Forzar Config
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm min-w-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Forzar Configuración</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/70 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Configuración:</label>
          <select
            value={selectedConfig}
            onChange={(e) => setSelectedConfig(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
          >
            <option value="">Seleccionar...</option>
            {NON_DAILY_CONFIGS.map(config => (
              <option key={config.id} value={config.id}>
                {config.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Duración (minutos):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
            min="1"
            max="1440"
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleForceConfig}
            disabled={!selectedConfig}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded text-sm transition-colors"
          >
            Forzar
          </button>
          
          <button
            onClick={handleClearForced}
            className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};