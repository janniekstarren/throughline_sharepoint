// useMeetingPrepGap — Data-fetching hook for Card #15
// ============================================
// useMeetingPrepGap - Data Fetching Hook
// ============================================
// Provides meeting prep gap data for Card #15.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { MeetingPrepGapData } from '../models/MeetingPrepGap';
import { generateMeetingPrepGapDemoData } from '../services/testData/meetingPrepGap';
import { DataMode } from '../services/testData';

export interface UseMeetingPrepGapOptions {
  dataMode: DataMode;
}

export interface UseMeetingPrepGapResult {
  data: MeetingPrepGapData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function useMeetingPrepGap(
  options: UseMeetingPrepGapOptions
): UseMeetingPrepGapResult {
  const { dataMode } = options;
  const [data, setData] = useState<MeetingPrepGapData | null>(null);
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
        const testData = generateMeetingPrepGapDemoData();
        setData(testData);
      } else {
        // Live mode: Graph API placeholder
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          unpreparedMeetings: [],
          stats: {
            totalUpcoming: 0,
            unpreparedCount: 0,
            avgPrepScore: 0,
            highStakesUnprepared: 0,
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
