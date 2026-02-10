// useCommitmentCapacity — Data-fetching hook for Card #69
// ============================================
// useCommitmentCapacity - Data Fetching Hook
// ============================================
// Provides commitment vs capacity data for Card #69.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { CommitmentCapacityData, CapacityWeek } from '../models/CommitmentCapacity';
import { generateCommitmentCapacityDemoData } from '../services/testData/commitmentCapacity';
import { DataMode } from '../services/testData';

export interface UseCommitmentCapacityOptions {
  dataMode: DataMode;
}

export interface UseCommitmentCapacityResult {
  data: CommitmentCapacityData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

const emptyWeek = (label: string): CapacityWeek => ({
  weekLabel: label,
  startDate: new Date(),
  availableHours: 0,
  committedHours: 0,
  ratio: 0,
  status: 'under',
  tasks: [],
  meetingHours: 0,
});

export function useCommitmentCapacity(
  options: UseCommitmentCapacityOptions
): UseCommitmentCapacityResult {
  const { dataMode } = options;
  const [data, setData] = useState<CommitmentCapacityData | null>(null);
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
        const testData = generateCommitmentCapacityDemoData();
        setData(testData);
      } else {
        // Live mode: Graph API placeholder
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          currentWeek: emptyWeek('This Week'),
          nextWeek: emptyWeek('Next Week'),
          weekAfter: emptyWeek('Week After'),
          stats: {
            currentRatio: 0,
            trendDirection: 'stable' as const,
            totalOpenTasks: 0,
            overdueTasks: 0,
            estimatedClearDate: new Date(),
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
