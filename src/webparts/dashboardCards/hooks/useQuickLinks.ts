// ============================================
// useQuickLinks Hook
// Manages quick links data fetching and state
// Supports both API and test data modes
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  QuickLinksData,
  IQuickLinksSettings,
  DEFAULT_QUICK_LINKS_SETTINGS,
} from '../models/QuickLinks';
import { QuickLinksService } from '../services/QuickLinksService';
import { getTestQuickLinksData } from '../services/testData/quickLinks';
import { DataMode } from '../services/testData';

// Re-export settings types for consumers
export type { IQuickLinksSettings } from '../models/QuickLinks';
export { DEFAULT_QUICK_LINKS_SETTINGS } from '../models/QuickLinks';

/**
 * Options for useQuickLinks hook
 */
export interface UseQuickLinksOptions {
  /** WebPart context for SharePoint integration */
  context: WebPartContext;
  /** Graph client for API calls */
  graphClient?: MSGraphClientV3;
  /** Data mode - 'api' for real data, 'test' for mock data */
  dataMode?: DataMode;
  /** Quick links settings */
  settings?: IQuickLinksSettings;
  /** Auto-refresh interval in milliseconds (0 to disable) */
  autoRefreshInterval?: number;
}

/**
 * Return type for useQuickLinks hook
 */
export interface UseQuickLinksReturn {
  /** Quick links data */
  data: QuickLinksData | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | undefined;
  /** Last refresh timestamp */
  lastRefreshed: Date | undefined;
  /** Manual refresh function */
  refresh: () => Promise<void>;
  /** Update settings function */
  updateSettings: (settings: Partial<IQuickLinksSettings>) => void;
}

/**
 * Hook for managing quick links data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refresh } = useQuickLinks({
 *   context: props.context,
 *   graphClient: props.graphClient,
 *   dataMode: 'api',
 *   settings: { maxItems: 10, showCategories: true }
 * });
 * ```
 */
export function useQuickLinks(options: UseQuickLinksOptions): UseQuickLinksReturn {
  const {
    context,
    graphClient,
    dataMode = 'api',
    settings = DEFAULT_QUICK_LINKS_SETTINGS,
    autoRefreshInterval = 0, // Disabled by default for static links
  } = options;

  const [data, setData] = useState<QuickLinksData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [lastRefreshed, setLastRefreshed] = useState<Date | undefined>(undefined);
  const [currentSettings, setCurrentSettings] = useState(settings);

  const serviceRef = useRef<QuickLinksService | undefined>(undefined);
  const refreshIntervalRef = useRef<number | undefined>(undefined);

  // Initialize service when graphClient is available
  useEffect(() => {
    if (graphClient && dataMode === 'api') {
      serviceRef.current = new QuickLinksService(graphClient, context, currentSettings);
    }
  }, [graphClient, context, dataMode, currentSettings]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      if (dataMode === 'test') {
        // Simulate loading delay for test mode
        await new Promise((resolve) => setTimeout(resolve, 300));
        const testData = getTestQuickLinksData();

        // Apply maxItems limit from settings
        if (currentSettings.maxItems && testData.links.length > currentSettings.maxItems) {
          testData.links = testData.links.slice(0, currentSettings.maxItems);
          testData.totalCount = testData.links.length;
        }

        setData(testData);
      } else if (serviceRef.current) {
        // API mode - use the service
        const result = await serviceRef.current.getData();
        setData(result);
      } else if (graphClient) {
        // Service not initialized yet, initialize and fetch
        const service = new QuickLinksService(graphClient, context, currentSettings);
        serviceRef.current = service;
        const result = await service.getData();
        setData(result);
      } else {
        // No graphClient available, fall back to test data
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData(getTestQuickLinksData());
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch quick links data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));

      // Fall back to test data on error
      try {
        setData(getTestQuickLinksData());
      } catch {
        // Ignore fallback error
      }
    } finally {
      setIsLoading(false);
    }
  }, [dataMode, graphClient, context, currentSettings]);

  // Initial fetch
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      refreshIntervalRef.current = window.setInterval(() => {
        void fetchData();
      }, autoRefreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          window.clearInterval(refreshIntervalRef.current);
        }
      };
    }
    return undefined;
  }, [autoRefreshInterval, fetchData]);

  // Manual refresh
  const refresh = useCallback(async () => {
    if (serviceRef.current) {
      serviceRef.current.clearCache();
    }
    await fetchData();
  }, [fetchData]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<IQuickLinksSettings>) => {
    setCurrentSettings((prev) => ({ ...prev, ...newSettings }));
    if (serviceRef.current) {
      serviceRef.current.updateSettings(newSettings);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    lastRefreshed,
    refresh,
    updateSettings,
  };
}

export default useQuickLinks;
