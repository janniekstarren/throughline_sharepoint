// ============================================
// usePreMeetingConflicts - Data Fetching Hook
// ============================================
// Provides pre-meeting conflict data for Card #7.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { PreMeetingConflictsData } from '../models/PreMeetingConflicts';
import { getTestPreMeetingConflictsData } from '../services/testData/preMeetingConflicts';
import { DataMode } from '../services/testData';

export interface UsePreMeetingConflictsOptions {
  dataMode: DataMode;
}

export interface UsePreMeetingConflictsResult {
  data: PreMeetingConflictsData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function usePreMeetingConflicts(
  options: UsePreMeetingConflictsOptions
): UsePreMeetingConflictsResult {
  const { dataMode } = options;
  const [data, setData] = useState<PreMeetingConflictsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (dataMode === 'test') {
        await new Promise(resolve => setTimeout(resolve, 500));
        const testData = getTestPreMeetingConflictsData();
        setData(testData);
      } else {
        // Live mode: Calendar API conflict detection
        // For now, return empty data in live mode
        setData({
          conflicts: [],
          stats: {
            totalConflicts: 0,
            overlapCount: 0,
            backToBackCount: 0,
            tripleBookingCount: 0,
            affectedHours: 0,
          },
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
