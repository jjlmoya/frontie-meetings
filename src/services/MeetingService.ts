import type { IMeetingService, MeetingConfig, ITimeService, IAssetService } from '@/types';
import { TimeService } from './TimeService';
import { AssetService } from './AssetService';
import { DEFAULT_MEETING_CONFIG, NON_DAILY_CONFIGS, FORCE_CONFIG_KEY, FORCE_EXPIRY_KEY } from '@/config/meetings';

export class MeetingService implements IMeetingService {
  constructor(
    private readonly timeService: ITimeService = new TimeService(),
    private readonly assetService: IAssetService = new AssetService()
  ) {}

  public async getCurrentMeetingConfig(forcedConfig?: MeetingConfig): Promise<MeetingConfig | null> {
    try {
      // Si hay configuración forzada por query param, usarla
      if (forcedConfig) {
        return forcedConfig;
      }

      const meetingSelection = await this.timeService.getCurrentMeeting();
      
      if (meetingSelection?.isActive) {
        // Si es catch-up, usar configuración aleatoria no-daily
        if (meetingSelection.config.type === 'catch-up') {
          return this.getRandomNonDailyConfig();
        }
        return meetingSelection.config;
      }

      return DEFAULT_MEETING_CONFIG;
    } catch (error) {
      console.error('Error getting current meeting config:', error);
      return DEFAULT_MEETING_CONFIG;
    }
  }

  public async preloadCurrentAssets(): Promise<void> {
    try {
      const config = await this.getCurrentMeetingConfig();
      if (!config) return;

      await this.assetService.preloadAssets(config.assets);
    } catch (error) {
      console.error('Error preloading assets:', error);
    }
  }

  public async getNextMeetingInfo() {
    try {
      const meetingSelection = await this.timeService.getCurrentMeeting();
      
      if (meetingSelection && !meetingSelection.isActive && meetingSelection.nextStartTime) {
        return {
          config: meetingSelection.config,
          startsAt: meetingSelection.nextStartTime,
          timeUntilStart: meetingSelection.nextStartTime.getTime() - Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting next meeting info:', error);
      return null;
    }
  }

  public async validateAssets(config: MeetingConfig): Promise<{
    video: boolean;
    audio: boolean;
  }> {
    const results = await Promise.allSettled([
      this.assetService.isVideoAvailable(config.assets.video),
      this.validateAudioUrl(config.assets.audio),
    ]);

    return {
      video: results[0].status === 'fulfilled' ? results[0].value : false,
      audio: results[1].status === 'fulfilled' ? results[1].value : false,
    };
  }

  public forceConfig(configId: string, durationMinutes: number = 60): boolean {
    try {
      const expiryTime = Date.now() + (durationMinutes * 60 * 1000);
      localStorage.setItem(FORCE_CONFIG_KEY, configId);
      localStorage.setItem(FORCE_EXPIRY_KEY, expiryTime.toString());
      return true;
    } catch {
      return false;
    }
  }

  public clearForcedConfig(): boolean {
    try {
      localStorage.removeItem(FORCE_CONFIG_KEY);
      localStorage.removeItem(FORCE_EXPIRY_KEY);
      return true;
    } catch {
      return false;
    }
  }

  private getForcedConfig(): MeetingConfig | null {
    if (typeof window === 'undefined') return null;

    try {
      const configId = localStorage.getItem(FORCE_CONFIG_KEY);
      const expiry = localStorage.getItem(FORCE_EXPIRY_KEY);

      if (!configId || !expiry) return null;

      if (Date.now() > parseInt(expiry)) {
        this.clearForcedConfig();
        return null;
      }

      return NON_DAILY_CONFIGS.find(config => config.id === configId) || null;
    } catch {
      return null;
    }
  }

  private getRandomNonDailyConfig(): MeetingConfig {
    const randomIndex = Math.floor(Math.random() * NON_DAILY_CONFIGS.length);
    return NON_DAILY_CONFIGS[randomIndex];
  }

  private async validateAudioUrl(audioUrl: string): Promise<boolean> {
    try {
      const response = await fetch(audioUrl, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('audio/') === true;
    } catch {
      return false;
    }
  }
}