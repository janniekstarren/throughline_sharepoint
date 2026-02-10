// useDeepWork — Data-fetching hook for Card #12
// ============================================
// useDeepWork - Data Fetching Hook
// ============================================
// Provides deep work opportunities data for Card #12.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { DeepWorkOpportunitiesData } from '../models/DeepWorkOpportunities';
import { generateDeepWorkOpportunitiesDemoData } from '../services/testData/deepWorkOpportunities';
import { DataMode } from '../services/testData';

export interface UseDeepWorkOptions {
  dataMode: DataMode;
}

export interface UseDeepWorkResult {
  data: DeepWorkOpportunitiesData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function useDeepWork(
  options: UseDeepWorkOptions
): UseDeepWorkResult {
  const { dataMode } = options;
  const [data, setData] = useState<DeepWorkOpportunitiesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (dataMode === 'test') {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const testData = generateDeepWorkOpportunitiesDemoData();
        setData(testData);
      } else {
        // Live mode: Graph API placeholder
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          blocks: [],
          stats: {
            totalDeepWorkMinutes: 0,
            goldBlockCount: 0,
            silverBlockCount: 0,
            bronzeBlockCount: 0,
            bestDay: '',
            longestBlock: 0,
            daysWithNoBlocks: 0,
          },
          dailyBreakdown: [],
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
