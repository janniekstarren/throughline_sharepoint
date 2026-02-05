// ============================================
// useMyTeam Hook - Data Management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  MyTeamData,
  IMyTeamSettings,
  DEFAULT_MY_TEAM_SETTINGS,
} from '../models/MyTeam';
import { MyTeamService } from '../services/MyTeamService';

// Re-export settings for convenience
export { IMyTeamSettings, DEFAULT_MY_TEAM_SETTINGS };

/**
 * Return type for the useMyTeam hook
 */
export interface UseMyTeamResult {
  /** Main card data */
  data: MyTeamData | null;
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
 * Hook for managing MyTeam card data
 *
 * @param context - SharePoint WebPart context
 * @param settings - Card settings
 * @returns UseMyTeamResult
 */
export const useMyTeam = (
  context: WebPartContext,
  settings: IMyTeamSettings = DEFAULT_MY_TEAM_SETTINGS
): UseMyTeamResult => {
  // State
  const [data, setData] = useState<MyTeamData | null>(null);
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
      const service = new MyTeamService(context);
      const result = await service.getData(settings);
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching myTeam data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch team members'));
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

export default useMyTeam;
