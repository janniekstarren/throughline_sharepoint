// ============================================
// useRecentFiles Hook - Data Management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  RecentFilesData,
  IRecentFilesSettings,
  DEFAULT_RECENT_FILES_SETTINGS,
} from '../models/RecentFiles';
import { RecentFilesService } from '../services/RecentFilesService';

// Re-export settings for convenience
export { IRecentFilesSettings, DEFAULT_RECENT_FILES_SETTINGS };

/**
 * Return type for the useRecentFiles hook
 */
export interface UseRecentFilesResult {
  /** Main card data */
  data: RecentFilesData | null;
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
 * Hook for managing RecentFiles card data
 *
 * @param context - SharePoint WebPart context
 * @param settings - Card settings
 * @returns UseRecentFilesResult
 */
export const useRecentFiles = (
  context: WebPartContext,
  settings: IRecentFilesSettings = DEFAULT_RECENT_FILES_SETTINGS
): UseRecentFilesResult => {
  // State
  const [data, setData] = useState<RecentFilesData | null>(null);
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
      const service = new RecentFilesService(context);
      const result = await service.getData(settings);
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching recent files data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch recent files'));
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

export default useRecentFiles;
