// useAfterHours — Data-fetching hook for Card #13
// ============================================
// useAfterHours - Data Fetching Hook
// ============================================
// Provides after-hours footprint data for Card #13.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { AfterHoursData } from '../models/AfterHoursFootprint';
import { generateAfterHoursFootprintDemoData } from '../services/testData/afterHoursFootprint';
import { DataMode } from '../services/testData';

export interface UseAfterHoursOptions {
  dataMode: DataMode;
}

export interface UseAfterHoursResult {
  data: AfterHoursData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function useAfterHours(
  options: UseAfterHoursOptions
): UseAfterHoursResult {
  const { dataMode } = options;
  const [data, setData] = useState<AfterHoursData | null>(null);
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
        const testData = generateAfterHoursFootprintDemoData();
        setData(testData);
      } else {
        // Live mode: Graph API placeholder
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          days: [],
          stats: {
            avgAfterHoursPerWeek: 0,
            afterHoursPercentage: 0,
            weekendDaysWorked: 0,
            latestActivityTime: '',
            trendVsLastMonth: 0,
            consecutiveAfterHoursDays: 0,
          },
          weeklyTrend: [],
          hourlyDistribution: [],
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
