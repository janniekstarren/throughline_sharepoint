// useMeetingCreep — Data-fetching hook for Card #76
// ============================================
// useMeetingCreep - Data Fetching Hook
// ============================================
// Provides meeting creep trend data for Card #76.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { MeetingCreepData } from '../models/MeetingCreep';
import { generateMeetingCreepDemoData } from '../services/testData/meetingCreep';
import { DataMode } from '../services/testData';

export interface UseMeetingCreepOptions {
  dataMode: DataMode;
}

export interface UseMeetingCreepResult {
  data: MeetingCreepData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function useMeetingCreep(
  options: UseMeetingCreepOptions
): UseMeetingCreepResult {
  const { dataMode } = options;
  const [data, setData] = useState<MeetingCreepData | null>(null);
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
        const testData = generateMeetingCreepDemoData();
        setData(testData);
      } else {
        // Live mode: Graph API placeholder
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          months: [],
          stats: {
            currentMonthHours: 0,
            sixMonthsAgoHours: 0,
            changePercent: 0,
            recurringGrowthPercent: 0,
            adhocGrowthPercent: 0,
            projectedNextMonth: 0,
            biggestGrowthCategory: '',
          },
          trendLine: [],
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
