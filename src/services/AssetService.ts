import type { IAssetService, MediaAssets } from '@/types';

export class AssetService implements IAssetService {
  private readonly preloadedAssets = new Map<string, boolean>();
  private readonly imageCache = new Map<string, string>();

  public async preloadAssets(assets: MediaAssets): Promise<void> {
    const preloadPromises: Promise<void>[] = [
      this.preloadVideo(assets.video),
      this.preloadAudio(assets.audio)
    ];

    await Promise.allSettled(preloadPromises);
  }

  public async isVideoAvailable(videoUrl: string): Promise<boolean> {
    try {
      const response = await fetch(videoUrl, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('video/') === true;
    } catch {
      return false;
    }
  }


  private async preloadVideo(videoUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedAssets.get(videoUrl)) {
        resolve();
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onLoad);
        video.removeEventListener('error', onError);
        video.remove();
      };

      const onLoad = () => {
        this.preloadedAssets.set(videoUrl, true);
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error(`Failed to preload video: ${videoUrl}`));
      };

      video.addEventListener('loadedmetadata', onLoad, { once: true });
      video.addEventListener('error', onError, { once: true });
      
      video.src = videoUrl;
    });
  }


  private async preloadAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedAssets.get(audioUrl)) {
        resolve();
        return;
      }

      const audio = new Audio();
      audio.preload = 'metadata';
      
      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onLoad);
        audio.removeEventListener('error', onError);
        audio.remove();
      };

      const onLoad = () => {
        this.preloadedAssets.set(audioUrl, true);
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error(`Failed to preload audio: ${audioUrl}`));
      };

      audio.addEventListener('loadedmetadata', onLoad, { once: true });
      audio.addEventListener('error', onError, { once: true });
      
      audio.src = audioUrl;
    });
  }

}