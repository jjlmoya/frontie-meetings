import { useSearchParams } from 'next/navigation';
import { MEETINGS_CONFIG } from '@/config/meetings';
import type { MeetingConfig } from '@/types';

export const useQueryConfig = (): MeetingConfig | null => {
  const searchParams = useSearchParams();
  const configParam = searchParams.get('config');
  
  if (!configParam) {
    return null;
  }

  // Buscar config por ID exacto
  const config = MEETINGS_CONFIG.find(c => c.id === configParam);
  
  if (config) {
    return config;
  }

  // Si no encuentra por ID, buscar por coincidencia parcial o alias
  const lowerParam = configParam.toLowerCase();
  return MEETINGS_CONFIG.find(c => 
    c.id.toLowerCase().includes(lowerParam) ||
    c.name.toLowerCase().includes(lowerParam)
  ) || null;
};