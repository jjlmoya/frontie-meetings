import type { MeetingConfig } from '@/types';

export const MEETINGS_CONFIG: readonly MeetingConfig[] = [
  {
    id: 'winter',
    name: 'When the World Stands Still',
    type: 'creative',
    schedule: [],
    assets: {
      audio: '/assets/winter/audio/when-the-world-stands-still.mp3',
    },
    style: {
      fontFamily: 'Georgia, Times New Roman, serif',
      fallbackFont: 'Georgia, serif',
      primaryColor: '#b8d7ff',
      backgroundColor: '#090e19',
      textAnimation: 'funky-chaos',
    },
  },
  {
    id: 'jazz',
    name: 'While We Wait',
    type: 'creative',
    schedule: [],
    assets: {
      audio: '/assets/jazz/audio/while-we-wait.mp3',
    },
    style: {
      fontFamily: 'Didot, Bodoni MT, Georgia, serif',
      fallbackFont: 'Georgia, serif',
      primaryColor: '#F5A623',
      backgroundColor: '#111522',
      textAnimation: 'funky-chaos',
    },
  },
  {
    id: 'medieval',
    name: 'Frontie the Feline King',
    type: 'creative',
    schedule: [],
    assets: {
      audio: '/assets/medieval/audio/frontie-the-feline-king.mp3',
    },
    style: {
      fontFamily: 'var(--font-righteous)',
      fallbackFont: 'Georgia, serif',
      primaryColor: '#9B6DFF',
      backgroundColor: '#241314',
      textAnimation: 'funky-chaos',
    },
  },
  {
    id: 'campfire',
    name: 'Escalofríos en Producción',
    type: 'creative',
    schedule: [],
    assets: {
      audio: '/assets/campfire/audio/Escalofríos en Producción.mp3',
    },
    style: {
      fontFamily: 'Georgia, serif',
      fallbackFont: 'Georgia, serif',
      primaryColor: '#FF5630',
      backgroundColor: '#08101e',
      textAnimation: 'funky-chaos',
    },
  },
  {
    id: 'wannabe',
    name: 'Wannabe · Front-Line Cosplay',
    type: 'creative',
    schedule: [],
    assets: {
      video: '/assets/wannabe/cosplay-preview.mp4?v=28',
      audio: '',
    },
    style: {
      fontFamily: 'Georgia, serif',
      fallbackFont: 'Georgia, serif',
      primaryColor: '#F72585',
      backgroundColor: '#100a1a',
      textAnimation: 'funky-chaos',
    },
  },
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
      primaryColor: '#00C2D1',
      backgroundColor: '#004080',
      textAnimation: 'wave-beach',
    },
  },
  {
    id: 'synth',
    name: 'Synth Vibes ',
    type: 'catch-up',
    schedule: [],
    assets: {
      video: '/assets/videos/synths.mp4',
      audio: '/assets/audio/synths.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#3457FF',
      backgroundColor: '#004080',
      textAnimation: 'metal-destruction',
    },
  },
  {
    id: 'autumn',
    name: 'Autumn Vibes ',
    type: 'catch-up',
    schedule: [],
    assets: {
      video: '/assets/videos/autumn.mp4',
      audio: '/assets/audio/autumn.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#C4772E',
      backgroundColor: '#dfb017ff',
      textAnimation: 'wave-beach',
    },
  },
  {
    id: 'flamenco',
    name: 'Flamenco Vibes ',
    type: 'catch-up',
    schedule: [],
    assets: {
      video: '/assets/videos/flamenco.mp4',
      audio: '/assets/audio/flamenco.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#E83E72',
      backgroundColor: '#dfb017ff',
      textAnimation: 'funky-glitch',
    },
  },
  {
    id: 'reggae',
    name: 'Reggae Vibes ',
    type: 'catch-up',
    schedule: [],
    assets: {
      video: '/assets/videos/reggae.mp4',
      audio: '/assets/audio/reggae.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#B5DE24',
      backgroundColor: '#0cff18ff',
      textAnimation: 'funky-glitch',
    },
  },
  {
    id: 'coco',
    name: 'Coco Vibes ',
    type: 'catch-up',
    schedule: [],
    assets: {
      video: '/assets/videos/coco.mp4',
      audio: '/assets/audio/coco.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#00A884',
      backgroundColor: '#00ff80ff',
      textAnimation: 'wave-beach',
    },
  },
  {
    id: 'australian',
    name: 'Australian Vibes',
    type: 'catch-up',
    schedule: [],
    assets: {
      video: '/assets/videos/australian.mp4',
      audio: '/assets/audio/australian.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#168CDB',
      backgroundColor: '#8B4513',
      textAnimation: 'wave-beach',
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
      primaryColor: '#F4D03F',
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
      primaryColor: '#9B5DE5',
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
      primaryColor: '#D7263D',
      backgroundColor: '#000000',
      textAnimation: 'metal-destruction',
    },
  },
  {
    id: 'reggaeton',
    name: 'Reggaeton Fiesta',
    type: 'creative',
    schedule: [],
    assets: {
      video: '/assets/videos/reggaeton.mp4',
      audio: '/assets/audio/reggaeton.mp3',
    },
    style: {
      fontFamily: 'var(--font-righteous)',
      fallbackFont: 'Arial Black, sans-serif',
      primaryColor: '#FF006E',
      backgroundColor: '#1A1A2E',
      textAnimation: 'reggaeton-bounce',
    },
  },
  {
    id: 'xmas',
    name: 'Xmas Meeting',
    type: 'catch-up',
    schedule: [],
    assets: {
      video: '/assets/videos/xmas.mp4',
      audio: '/assets/audio/xmas.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#168A58',
      backgroundColor: '#165B33',
      textAnimation: 'wave-beach',
    },
  },
  {
    id: 'xmas-2',
    name: 'Xmas Meeting',
    type: 'catch-up',
    schedule: [],
    assets: {
      video: '/assets/videos/xmas.mp4',
      audio: '/assets/audio/xmas-2.mp3',
    },
    style: {
      fontFamily: 'var(--font-bungee)',
      fallbackFont: 'Impact, sans-serif',
      primaryColor: '#79E6FF',
      backgroundColor: '#10243A',
      textAnimation: 'wave-beach',
    },
  },
] as const;

// Configs que NO son de tipo daily (para catch-up random)
export const NON_DAILY_CONFIGS = MEETINGS_CONFIG.filter(config => config.type !== 'daily');

export const DEFAULT_MEETING_CONFIG = MEETINGS_CONFIG.find(config => config.id === 'metal')!;

// Sistema de forzado
export const FORCE_CONFIG_KEY = 'fantasia_force_config';
export const FORCE_EXPIRY_KEY = 'fantasia_force_expiry';
