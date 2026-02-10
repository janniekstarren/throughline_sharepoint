// usePeakProductivity — Data-fetching hook for Card #11
// ============================================
// usePeakProductivity - Data Fetching Hook
// ============================================
// Provides peak productivity data for Card #11.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { PeakProductivityData } from '../models/PeakProductivity';
import { generatePeakProductivityDemoData } from '../services/testData/peakProductivity';
import { DataMode } from '../services/testData';

export interface UsePeakProductivityOptions {
  dataMode: DataMode;
}

export interface UsePeakProductivityResult {
  data: PeakProductivityData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function usePeakProductivity(
  options: UsePeakProductivityOptions
): UsePeakProductivityResult {
  const { dataMode } = options;
  const [data, setData] = useState<PeakProductivityData | null>(null);
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
        const testData = generatePeakProductivityDemoData();
        setData(testData);
      } else {
        // Live mode: Graph API placeholder
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          hourlyProfile: [],
          stats: {
            peakHours: [],
            meetingHeavyHours: [],
            misalignedHours: [],
            productivityEfficiency: 0,
            bestTimeForDeepWork: '',
            worstTimeForMeetings: '',
          },
          heatmapData: [],
          trendData: [],
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
