// ============================================
// use{{CardName}} Hook - Data Management
// ============================================
// Template file - Copy and rename for new cards
// Replace {{CardName}} with your card name (e.g., "UpcomingMeetings")
// Replace {{cardName}} with camelCase version (e.g., "upcomingMeetings")
// Replace {{CARD_NAME}} with UPPER_SNAKE_CASE (e.g., "UPCOMING_MEETINGS")

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  {{CardName}}Data,
  {{CardName}}TrendData,
  I{{CardName}}Settings,
  DEFAULT_{{CARD_NAME}}_SETTINGS,
} from '../models/{{CardName}}';
import { {{CardName}}Service } from '../services/{{CardName}}Service';

// Re-export settings for convenience
export { I{{CardName}}Settings, DEFAULT_{{CARD_NAME}}_SETTINGS };

/**
 * Return type for the use{{CardName}} hook
 */
export interface Use{{CardName}}Result {
  /** Main card data */
  data: {{CardName}}Data | null;
  /** Trend data for charts */
  trendData: {{CardName}}TrendData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Last refresh timestamp */
  lastRefreshed: Date | null;
  /** Refresh data function */
  refresh: () => Promise<void>;
  /** Perform action on item (optional) */
  performAction?: (itemId: string, action: string) => Promise<void>;
}

/**
 * Hook for managing {{CardName}} card data
 *
 * @param context - SharePoint WebPart context
 * @param settings - Card settings
 * @returns Use{{CardName}}Result
 */
export const use{{CardName}} = (
  context: WebPartContext,
  settings: I{{CardName}}Settings = DEFAULT_{{CARD_NAME}}_SETTINGS
): Use{{CardName}}Result => {
  // State
  const [data, setData] = useState<{{CardName}}Data | null>(null);
  const [trendData, setTrendData] = useState<{{CardName}}TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Service instance (memoized)
  const service = useCallback(() => new {{CardName}}Service(context), [context]);

  /**
   * Fetch all data
   */
  const fetchData = useCallback(async () => {
    if (!settings.enabled) {
      setData(null);
      setTrendData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const svc = service();

      // Fetch main data and trend data in parallel
      const [mainData, trend] = await Promise.all([
        svc.getData(settings),
        settings.showChart ? svc.getTrendData(settings) : Promise.resolve(null),
      ]);

      setData(mainData);
      setTrendData(trend);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching {{cardName}} data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [context, settings, service]);

  /**
   * Perform action on an item
   */
  const performAction = useCallback(
    async (itemId: string, action: string) => {
      try {
        const svc = service();
        await svc.performAction(itemId, action);
        // Refresh data after action
        await fetchData();
      } catch (err) {
        console.error('Error performing action:', err);
        throw err;
      }
    },
    [service, fetchData]
  );

  // Fetch data on mount and when settings change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    trendData,
    isLoading,
    error,
    lastRefreshed,
    refresh: fetchData,
    performAction,
  };
};

export default use{{CardName}};
