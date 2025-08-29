import { useEffect, useState, useCallback, useMemo } from 'react';
import type { MeetingConfig } from '@/types';
import { MeetingService } from '@/services/MeetingService';
import { useQueryConfig } from './useQueryConfig';

export const useMeetingConfig = () => {
  const [config, setConfig] = useState<MeetingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryConfig = useQueryConfig();

  const meetingService = useMemo(() => new MeetingService(), []);

  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const currentConfig = await meetingService.getCurrentMeetingConfig(queryConfig || undefined);
        
        if (isMounted) {
          setConfig(currentConfig);
          
          if (currentConfig) {
            await meetingService.preloadCurrentAssets();
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadConfig();

    const interval = setInterval(loadConfig, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [meetingService, queryConfig]);

  const refreshConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentConfig = await meetingService.getCurrentMeetingConfig(queryConfig || undefined);
      setConfig(currentConfig);
      
      if (currentConfig) {
        await meetingService.preloadCurrentAssets();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [meetingService, queryConfig]);

  return { config, loading, error, refreshConfig };
};