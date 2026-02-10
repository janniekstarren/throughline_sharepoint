// ============================================
// useApprovalBottlenecks - Data Fetching Hook
// ============================================
// Provides approval bottleneck data for Card #2.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { ApprovalBottlenecksData } from '../models/ApprovalBottlenecks';
import { getTestApprovalBottlenecksData } from '../services/testData/approvalBottlenecks';
import { DataMode } from '../services/testData';

export interface UseApprovalBottlenecksOptions {
  dataMode: DataMode;
}

export interface UseApprovalBottlenecksResult {
  data: ApprovalBottlenecksData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function useApprovalBottlenecks(
  options: UseApprovalBottlenecksOptions
): UseApprovalBottlenecksResult {
  const { dataMode } = options;
  const [data, setData] = useState<ApprovalBottlenecksData | null>(null);
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
        const testData = getTestApprovalBottlenecksData();
        setData(testData);
      } else {
        // Live mode: Graph API (Approvals API is beta)
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          pendingApprovals: [],
          stats: {
            totalPending: 0,
            overdueCount: 0,
            avgWaitHours: 0,
            oldestWaitHours: 0,
            blockedPeopleTotal: 0,
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
