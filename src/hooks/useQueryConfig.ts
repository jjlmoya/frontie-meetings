'use client';

import { useSearchParams } from 'next/navigation';
import { MEETINGS_CONFIG } from '@/config/meetings';
import type { MeetingConfig } from '@/types';

export const useQueryConfig = (): MeetingConfig | null => {
  const searchParams = useSearchParams();
  const configParam = searchParams.get('config');

  if (!configParam) return null;

  const exactMatch = MEETINGS_CONFIG.find((config) => config.id === configParam);
  if (exactMatch) return exactMatch;

  const lowerParam = configParam.toLowerCase();
  return MEETINGS_CONFIG.find((config) =>
    config.id.toLowerCase().includes(lowerParam) ||
    config.name.toLowerCase().includes(lowerParam)
  ) ?? null;
};
