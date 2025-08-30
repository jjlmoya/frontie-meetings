'use client';

import { useEffect, useState } from 'react';
import { MEETINGS_CONFIG } from '@/config/meetings';
import type { MeetingConfig } from '@/types';

export const useQueryConfig = (): MeetingConfig | null => {
  const [config, setConfig] = useState<MeetingConfig | null>(null);
  
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    
    if (!configParam) {
      setConfig(null);
      return;
    }

    // Buscar config por ID exacto
    let foundConfig: MeetingConfig | null = MEETINGS_CONFIG.find(c => c.id === configParam) || null;
    
    if (!foundConfig) {
      // Si no encuentra por ID, buscar por coincidencia parcial o alias
      const lowerParam = configParam.toLowerCase();
      foundConfig = MEETINGS_CONFIG.find(c => 
        c.id.toLowerCase().includes(lowerParam) ||
        c.name.toLowerCase().includes(lowerParam)
      ) || null;
    }
    
    setConfig(foundConfig);
  }, []);
  
  return config;
};