// ============================================
// useContextSwitching Hook
// Manages context switching data fetching and state
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  ContextSwitchingData,
  ContextSwitchingSettings,
  DEFAULT_CONTEXT_SWITCHING_SETTINGS
} from '../models/ContextSwitching';
import { ContextSwitchingService } from '../services/ContextSwitchingService';

export interface UseContextSwitchingOptions {
  graphClient: MSGraphClientV3 | undefined;
  userId?: string;
  settings?: ContextSwitchingSettings;
  autoRefreshInterval?: number; // milliseconds, 0 to disable
}

export interface UseContextSwitchingReturn {
  data: ContextSwitchingData | undefined;
  isLoading: boolean;
  error: Error | undefined;
  lastRefreshed: Date | undefined;
  refresh: () => Promise<void>;
  updateSettings: (settings: Partial<ContextSwitchingSettings>) => void;
}

/**
 * Hook for managing context switching data
 */
export function useContextSwitching(options: UseContextSwitchingOptions): UseContextSwitchingReturn {
  const {
    graphClient,
    userId = 'me',
    settings = DEFAULT_CONTEXT_SWITCHING_SETTINGS,
    autoRefreshInterval = 5 * 60 * 1000 // 5 minutes default
  } = options;

  const [data, setData] = useState<ContextSwitchingData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [lastRefreshed, setLastRefreshed] = useState<Date | undefined>(undefined);
  const [currentSettings, setCurrentSettings] = useState(settings);

  const serviceRef = useRef<ContextSwitchingService | undefined>(undefined);
  const refreshIntervalRef = useRef<number | undefined>(undefined);

  // Initialize service when graphClient is available
  useEffect(() => {
    if (graphClient) {
      serviceRef.current = new ContextSwitchingService(graphClient, userId, currentSettings);
    }
  }, [graphClient, userId, currentSettings]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!serviceRef.current) {
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await serviceRef.current.getContextSwitchingData();
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch context switching data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (graphClient && serviceRef.current) {
      void fetchData();
    }
  }, [graphClient, fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval > 0 && graphClient) {
      refreshIntervalRef.current = window.setInterval(() => {
        void fetchData();
      }, autoRefreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          window.clearInterval(refreshIntervalRef.current);
        }
      };
    }
    return undefined;
  }, [autoRefreshInterval, graphClient, fetchData]);

  // Manual refresh
  const refresh = useCallback(async () => {
    if (serviceRef.current) {
      serviceRef.current.clearCache();
    }
    await fetchData();
  }, [fetchData]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ContextSwitchingSettings>) => {
    setCurrentSettings(prev => ({ ...prev, ...newSettings }));
    if (serviceRef.current) {
      serviceRef.current.updateSettings(newSettings);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    lastRefreshed,
    refresh,
    updateSettings
  };
}

export default useContextSwitching;
