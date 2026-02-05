// ============================================
// useUpcomingWeek Hook - Data Management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  UpcomingWeekData,
  IUpcomingWeekSettings,
  DEFAULT_UPCOMING_WEEK_SETTINGS,
} from '../models/UpcomingWeek';
import { UpcomingWeekService } from '../services/UpcomingWeekService';

// Re-export settings for convenience
export { IUpcomingWeekSettings, DEFAULT_UPCOMING_WEEK_SETTINGS };

/**
 * Return type for the useUpcomingWeek hook
 */
export interface UseUpcomingWeekResult {
  /** Main card data */
  data: UpcomingWeekData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Last refresh timestamp */
  lastRefreshed: Date | null;
  /** Refresh data function */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing UpcomingWeek card data
 *
 * @param context - SharePoint WebPart context
 * @param settings - Card settings
 * @returns UseUpcomingWeekResult
 */
export const useUpcomingWeek = (
  context: WebPartContext,
  settings: IUpcomingWeekSettings = DEFAULT_UPCOMING_WEEK_SETTINGS
): UseUpcomingWeekResult => {
  // State
  const [data, setData] = useState<UpcomingWeekData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  /**
   * Fetch data
   */
  const fetchData = useCallback(async () => {
    if (!settings.enabled) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = new UpcomingWeekService(context);
      const result = await service.getData(settings);
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching upcomingWeek data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch calendar events'));
    } finally {
      setIsLoading(false);
    }
  }, [context, settings]);

  // Fetch data on mount and when settings change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastRefreshed,
    refresh: fetchData,
  };
};

export default useUpcomingWeek;
