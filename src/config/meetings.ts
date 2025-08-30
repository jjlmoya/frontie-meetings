import type { MeetingConfig } from '@/types';

export const MEETINGS_CONFIG: readonly MeetingConfig[] = [
  {
    id: 'beach',
    name: 'Beach Vibes Daily',
    type: 'daily',
    schedule: [
      { dayOfWeek: 1, startHour: 9, endHour: 9, startMinute: 0, endMinute: 59 }, // Monday 9:00-10:00
      { dayOfWeek: 2, startHour: 9, endHour: 9, startMinute: 0, endMinute: 59 }, // Tuesday 9:00-10:00
      { dayOfWeek: 3, startHour: 9, endHour: 9, startMinute: 0, endMinute: 59 }, // Wednesday 9:00-10:00
      { dayOfWeek: 4, startHour: 9, endHour: 9, startMinute: 0, endMinute: 59 }, // Thursday 9:00-10:00
      { dayOfWeek: 5, startHour: 9, endHour: 9, startMinute: 0, endMinute: 59 }, // Friday 9:00-10:00
    ],
    assets: {
      video: '/assets/videos/beach.mp4',
      audio: '/assets/audio/beach.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#00FFFF',
      backgroundColor: '#004080',
      textAnimation: 'wave-beach',
    },
  },
  {
    id: 'catch-up',
    name: 'Team Catch-up',
    type: 'catch-up',
    schedule: [
      { dayOfWeek: 2, startHour: 14, endHour: 15, startMinute: 45, endMinute: 30 }, // Tuesday 14:45-15:30
    ],
    assets: {
      video: '/assets/videos/funky.mp4',
      audio: '/assets/audio/funky.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#FF1493',
      backgroundColor: '#8A2BE2',
      textAnimation: 'funky-chaos',
    },
  },
  {
    id: 'funky',
    name: 'Funky Session',
    type: 'creative',
    schedule: [],
    assets: {
      video: '/assets/videos/funky.mp4',
      audio: '/assets/audio/funky.mp3',
    },
    style: {
      fontFamily: 'var(--font-monoton)',
      fallbackFont: 'Courier New, monospace',
      primaryColor: '#FFD700',
      backgroundColor: '#FF4500',
      textAnimation: 'funky-glitch',
    },
  },
  {
    id: 'groovie',
    name: 'Groovie Vibes',
    type: 'creative',
    schedule: [],
    assets: {
      video: '/assets/videos/groovie.mp4',
      audio: '/assets/audio/groovie.mp3',
    },
    style: {
      fontFamily: 'var(--font-dancing)',
      fallbackFont: 'Brush Script MT, cursive',
      primaryColor: '#FF1493',
      backgroundColor: '#9932CC',
      textAnimation: 'groovie-psychedelic',
    },
  },
  {
    id: 'metal',
    name: 'Metal Power',
    type: 'default',
    schedule: [
      // Fallback para cualquier otro horario
      { dayOfWeek: 0, startHour: 0, endHour: 23 },
      { dayOfWeek: 1, startHour: 0, endHour: 8 },
      { dayOfWeek: 1, startHour: 11, endHour: 23 },
      { dayOfWeek: 2, startHour: 0, endHour: 8 },
      { dayOfWeek: 2, startHour: 11, endHour: 14, startMinute: 0, endMinute: 44 },
      { dayOfWeek: 2, startHour: 15, endHour: 23, startMinute: 31 },
      { dayOfWeek: 3, startHour: 0, endHour: 8 },
      { dayOfWeek: 3, startHour: 11, endHour: 23 },
      { dayOfWeek: 4, startHour: 0, endHour: 8 },
      { dayOfWeek: 4, startHour: 11, endHour: 23 },
      { dayOfWeek: 5, startHour: 0, endHour: 8 },
      { dayOfWeek: 5, startHour: 11, endHour: 23 },
      { dayOfWeek: 6, startHour: 0, endHour: 23 },
    ],
    assets: {
      video: '/assets/videos/metal.mp4',
      audio: '/assets/audio/metal.mp3',
    },
    style: {
      fontFamily: 'var(--font-black-ops)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#FF0000',
      backgroundColor: '#000000',
      textAnimation: 'metal-destruction',
    },
  },
] as const;

// Configs que NO son de tipo daily (para catch-up random)
export const NON_DAILY_CONFIGS = MEETINGS_CONFIG.filter(config => config.type !== 'daily');

export const DEFAULT_MEETING_CONFIG = MEETINGS_CONFIG.find(config => config.id === 'metal')!;

// Sistema de forzado
export const FORCE_CONFIG_KEY = 'fantasia_force_config';
export const FORCE_EXPIRY_KEY = 'fantasia_force_expiry';