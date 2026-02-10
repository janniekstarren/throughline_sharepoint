// useEmailResponse — Data-fetching hook for Card #16
// ============================================
// useEmailResponse - Data Fetching Hook
// ============================================
// Provides email response pattern data for Card #16.
// Supports live (Graph API) and test/demo data modes.

import { useState, useEffect, useCallback } from 'react';
import { EmailResponseData } from '../models/EmailResponse';
import { generateEmailResponseDemoData } from '../services/testData/emailResponse';
import { DataMode } from '../services/testData';

export interface UseEmailResponseOptions {
  dataMode: DataMode;
}

export interface UseEmailResponseResult {
  data: EmailResponseData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;
  refresh: () => Promise<void>;
}

export function useEmailResponse(
  options: UseEmailResponseOptions
): UseEmailResponseResult {
  const { dataMode } = options;
  const [data, setData] = useState<EmailResponseData | null>(null);
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
        const testData = generateEmailResponseDemoData();
        setData(testData);
      } else {
        // Live mode: Graph API placeholder
        // For now, return empty data in live mode until Graph integration is wired
        setData({
          groups: [],
          stats: {
            overallAvgMinutes: 0,
            overallMedianMinutes: 0,
            fastestGroup: '',
            slowestGroup: '',
            unansweredOver24h: 0,
            totalAnalysed: 0,
          },
          hourlyResponsePattern: [],
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
