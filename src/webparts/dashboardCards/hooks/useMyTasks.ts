// ============================================
// useMyTasks Hook - Data Management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  MyTasksData,
  IMyTasksSettings,
  DEFAULT_MY_TASKS_SETTINGS,
} from '../models/MyTasks';
import { MyTasksService } from '../services/MyTasksService';

// Re-export settings for convenience
export { IMyTasksSettings, DEFAULT_MY_TASKS_SETTINGS };

/**
 * Return type for the useMyTasks hook
 */
export interface UseMyTasksResult {
  /** Main card data */
  data: MyTasksData | null;
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
 * Hook for managing MyTasks card data
 *
 * @param context - SharePoint WebPart context
 * @param settings - Card settings
 * @returns UseMyTasksResult
 */
export const useMyTasks = (
  context: WebPartContext,
  settings: IMyTasksSettings = DEFAULT_MY_TASKS_SETTINGS
): UseMyTasksResult => {
  // State
  const [data, setData] = useState<MyTasksData | null>(null);
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
      const service = new MyTasksService(context);
      const result = await service.getData(settings);
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching myTasks data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
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

export default useMyTasks;
