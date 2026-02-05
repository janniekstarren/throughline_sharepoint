// ============================================
// useSharedWithMe Hook - Data Management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  SharedWithMeData,
  ISharedWithMeSettings,
  DEFAULT_SHARED_WITH_ME_SETTINGS,
} from '../models/SharedWithMe';
import { SharedWithMeService } from '../services/SharedWithMeService';

// Re-export settings for convenience
export { ISharedWithMeSettings, DEFAULT_SHARED_WITH_ME_SETTINGS };

/**
 * Return type for the useSharedWithMe hook
 */
export interface UseSharedWithMeResult {
  /** Main card data */
  data: SharedWithMeData | null;
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
 * Hook for managing SharedWithMe card data
 *
 * @param context - SharePoint WebPart context
 * @param settings - Card settings
 * @returns UseSharedWithMeResult
 */
export const useSharedWithMe = (
  context: WebPartContext,
  settings: ISharedWithMeSettings = DEFAULT_SHARED_WITH_ME_SETTINGS
): UseSharedWithMeResult => {
  // State
  const [data, setData] = useState<SharedWithMeData | null>(null);
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
      const service = new SharedWithMeService(context);
      const result = await service.getData(settings);
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching sharedWithMe data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch shared files'));
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

export default useSharedWithMe;
