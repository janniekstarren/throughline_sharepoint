// useSeasonalWorkload — Data-fetching hook for Card #75
// ============================================
// useSeasonalWorkload - Data Fetching Hook
// ============================================
// Provides seasonal workload pattern data for Card #75.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { SeasonalWorkloadData } from '../models/SeasonalWorkload';
import { generateSeasonalWorkloadDemoData } from '../services/testData/seasonalWorkload';
import { DataMode } from '../services/testData';

export interface UseSeasonalWorkloadOptions {
  dataMode: DataMode;
}

export interface UseSeasonalWorkloadResult {
  data: SeasonalWorkloadData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function useSeasonalWorkload(
  options: UseSeasonalWorkloadOptions
): UseSeasonalWorkloadResult {
  const { dataMode } = options;
  const [data, setData] = useState<SeasonalWorkloadData | null>(null);
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
        const testData = generateSeasonalWorkloadDemoData();
        setData(testData);
      } else {
        // Live mode: Graph API placeholder
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          months: [],
          currentMonth: 0,
          stats: {
            nextPeakMonth: '',
            nextPeakScore: 0,
            weeksUntilNextPeak: 0,
            currentMonthVsAvg: 0,
            highestMonth: '',
            lowestMonth: '',
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
