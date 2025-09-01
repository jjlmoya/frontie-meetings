export type TimeSlot = {
  readonly dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly startHour: number;
  readonly endHour: number;
  readonly startMinute?: number;
  readonly endMinute?: number;
};

export type MediaAssets = {
  readonly video: string;
  readonly audio: string;
};

export type ThemeConfig = {
  readonly fontFamily: string;
  readonly fallbackFont: string;
  readonly primaryColor: string;
  readonly backgroundColor: string;
  readonly textAnimation: 'wave-beach' | 'funky-chaos' | 'funky-glitch' | 'groovie-psychedelic' | 'metal-destruction' | 'reggaeton-bounce';
};

export type MeetingConfig = {
  readonly id: string;
  readonly name: string;
  readonly type: 'daily' | 'catch-up' | 'creative' | 'default';
  readonly schedule: readonly TimeSlot[];
  readonly assets: MediaAssets;
  readonly style: ThemeConfig;
};

export type MeetingSelection = {
  readonly config: MeetingConfig;
  readonly isActive: boolean;
  readonly nextStartTime?: Date;
};

export interface ITimeService {
  getCurrentMeeting(): Promise<MeetingSelection | null>;
  isInTimeSlot(timeSlots: readonly TimeSlot[]): boolean;
  getNextMeetingTime(timeSlots: readonly TimeSlot[]): Date | null;
}

export interface IAssetService {
  preloadAssets(assets: MediaAssets): Promise<void>;
  isVideoAvailable(videoUrl: string): Promise<boolean>;
}

export interface IMeetingService {
  getCurrentMeetingConfig(): Promise<MeetingConfig | null>;
  preloadCurrentAssets(): Promise<void>;
}

export type AudioAnalyzerData = {
  readonly frequencyData: Uint8Array;
  readonly volume: number;
  readonly isPlaying: boolean;
};

export type AnimationState = {
  readonly isAnimating: boolean;
  readonly animationType: ThemeConfig['textAnimation'];
  readonly intensity: number;
};