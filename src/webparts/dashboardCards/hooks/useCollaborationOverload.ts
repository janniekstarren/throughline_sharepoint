// useCollaborationOverload — Data-fetching hook for Card #55
// ============================================
// useCollaborationOverload - Data Fetching Hook
// ============================================
// Provides collaboration overload data for Card #55.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { CollaborationOverloadData, CollaborationMetric } from '../models/CollaborationOverload';
import { generateCollaborationOverloadDemoData } from '../services/testData/collaborationOverload';
import { DataMode } from '../services/testData';

export interface UseCollaborationOverloadOptions {
  dataMode: DataMode;
}

export interface UseCollaborationOverloadResult {
  data: CollaborationOverloadData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

const emptyMetric = (name: string): CollaborationMetric => ({
  name,
  currentValue: 0,
  unit: '',
  benchmarkValue: 0,
  percentile: 0,
  weight: 0,
  trend: 'stable' as const,
  trendData: [],
});

export function useCollaborationOverload(
  options: UseCollaborationOverloadOptions
): UseCollaborationOverloadResult {
  const { dataMode } = options;
  const [data, setData] = useState<CollaborationOverloadData | null>(null);
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
        const testData = generateCollaborationOverloadDemoData();
        setData(testData);
      } else {
        // Live mode: Graph API placeholder
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          compositeScore: 0,
          scoreLabel: 'healthy' as const,
          metrics: {
            meetingHoursPerWeek: emptyMetric('Meeting hours'),
            emailsSentPerDay: emptyMetric('Emails/day'),
            afterHoursPercentage: emptyMetric('After-hours %'),
            backToBackMeetingDays: emptyMetric('Back-to-back days'),
            uniqueCollaboratorsPerWeek: emptyMetric('Collaborators'),
            meetingFreeBlocksPerDay: emptyMetric('Free blocks'),
          },
          weeklyHistory: [],
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
