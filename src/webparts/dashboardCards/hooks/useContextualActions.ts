// ============================================
// useContextualActions - Data Fetching Hook
// ============================================
// Provides contextual action suggestions for Card #66.
// Meta-card: aggregates from other cards, no direct Graph API calls.
// Supports test/demo data mode.

import { useState, useEffect, useCallback } from 'react';
import { ContextualActionsData } from '../models/ContextualActions';
import { getTestContextualActionsData } from '../services/testData/contextualActions';
import { DataMode } from '../services/testData';

export interface UseContextualActionsOptions {
  dataMode: DataMode;
}

export interface UseContextualActionsResult {
  data: ContextualActionsData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function useContextualActions(
  options: UseContextualActionsOptions
): UseContextualActionsResult {
  const { dataMode } = options;
  const [data, setData] = useState<ContextualActionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (dataMode === 'test') {
        await new Promise(resolve => setTimeout(resolve, 500));
        const testData = getTestContextualActionsData();
        setData(testData);
      } else {
        // Live mode: Would aggregate from other card hooks
        // For now, return empty data
        setData({
          actions: [],
          stats: {
            totalActions: 0,
            criticalCount: 0,
            warningCount: 0,
            totalEstimatedMinutes: 0,
            topSourceCard: '',
          },
        });
      }
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [dataMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, lastRefreshed, refresh: fetchData };
}
