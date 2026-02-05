// ============================================
// useSiteActivity Hook
// Custom hook for fetching and managing site activity data
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  SiteActivityData,
  ISiteActivitySettings,
  DEFAULT_SITE_ACTIVITY_SETTINGS,
} from '../models/SiteActivity';
import { SiteActivityService } from '../services/SiteActivityService';
import { getTestSiteActivityData } from '../services/testData/siteActivity';

// Re-export settings types for convenience
export type { ISiteActivitySettings };
export { DEFAULT_SITE_ACTIVITY_SETTINGS };

/**
 * Data mode for the hook
 */
export type DataMode = 'api' | 'test';

/**
 * Options for the useSiteActivity hook
 */
export interface UseSiteActivityOptions {
  /** WebPart context for Graph API access */
  context: WebPartContext | null;
  /** Settings for the site activity card */
  settings?: Partial<ISiteActivitySettings>;
  /** Data mode - 'api' for real Graph data, 'test' for mock data */
  dataMode?: DataMode;
  /** Auto-refresh interval in milliseconds (0 to disable) */
  autoRefreshInterval?: number;
}

/**
 * Return type for the useSiteActivity hook
 */
export interface UseSiteActivityReturn {
  /** Site activity data */
  data: SiteActivityData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Last refresh timestamp */
  lastRefreshed: Date | null;
  /** Refresh function to manually refetch data */
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing site activity data
 */
export function useSiteActivity(options: UseSiteActivityOptions): UseSiteActivityReturn {
  const {
    context,
    settings,
    dataMode = 'api',
    autoRefreshInterval = 5 * 60 * 1000, // 5 minutes default
  } = options;

  // State
  const [data, setData] = useState<SiteActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Service ref
  const serviceRef = useRef<SiteActivityService | null>(null);

  // Initialize service when context becomes available
  useEffect(() => {
    const initService = async (): Promise<void> => {
      if (context && dataMode === 'api') {
        try {
          serviceRef.current = await SiteActivityService.fromContext(context, settings);
        } catch (err) {
          console.error('Failed to initialize SiteActivityService:', err);
          serviceRef.current = null;
        }
      } else {
        serviceRef.current = null;
      }
    };

    initService().catch(console.error);
  }, [context, dataMode, settings]);

  // Fetch data function
  const fetchData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      let activityData: SiteActivityData;

      if (dataMode === 'test') {
        // Use test data
        // Simulate network delay for more realistic behavior
        await new Promise(resolve => setTimeout(resolve, 300));
        activityData = getTestSiteActivityData();
      } else if (serviceRef.current) {
        // Use real Graph API data
        activityData = await serviceRef.current.getData();
      } else {
        // No service available, use empty data
        activityData = {
          activities: [],
          totalCount: 0,
          byActor: {},
          byYouCount: 0,
          byOthersCount: 0,
          topActorName: '',
        };
      }

      setData(activityData);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch site activity:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch site activity'));
    } finally {
      setIsLoading(false);
    }
  }, [dataMode]);

  // Initial fetch
  useEffect(() => {
    fetchData().catch(console.error);
  }, [fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchData().catch(console.error);
    }, autoRefreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchData, autoRefreshInterval]);

  // Manual refresh function
  const refresh = useCallback(async (): Promise<void> => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastRefreshed,
    refresh,
  };
}

export default useSiteActivity;
