// ============================================
// useTodaysAgenda Hook - Data Management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  TodaysAgendaData,
  ITodaysAgendaSettings,
  DEFAULT_TODAYS_AGENDA_SETTINGS,
} from '../models/TodaysAgenda';
import { TodaysAgendaService } from '../services/TodaysAgendaService';

// Re-export settings for convenience
export { ITodaysAgendaSettings, DEFAULT_TODAYS_AGENDA_SETTINGS };

/**
 * Return type for the useTodaysAgenda hook
 */
export interface UseTodaysAgendaResult {
  /** Main card data */
  data: TodaysAgendaData | null;
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
 * Hook for managing TodaysAgenda card data
 *
 * @param context - SharePoint WebPart context
 * @param settings - Card settings
 * @returns UseTodaysAgendaResult
 */
export const useTodaysAgenda = (
  context: WebPartContext,
  settings: ITodaysAgendaSettings = DEFAULT_TODAYS_AGENDA_SETTINGS
): UseTodaysAgendaResult => {
  // State
  const [data, setData] = useState<TodaysAgendaData | null>(null);
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
      const service = new TodaysAgendaService(context);
      const result = await service.getData(settings);
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching todaysAgenda data:', err);
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

export default useTodaysAgenda;
