// ============================================
// useUnreadInbox Hook - Data Management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  UnreadInboxData,
  IUnreadInboxSettings,
  DEFAULT_UNREAD_INBOX_SETTINGS,
} from '../models/UnreadInbox';
import { UnreadInboxService } from '../services/UnreadInboxService';

// Re-export settings for convenience
export { IUnreadInboxSettings, DEFAULT_UNREAD_INBOX_SETTINGS };

/**
 * Return type for the useUnreadInbox hook
 */
export interface UseUnreadInboxResult {
  /** Main card data */
  data: UnreadInboxData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Last refresh timestamp */
  lastRefreshed: Date | null;
  /** Refresh data function */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing UnreadInbox card data
 *
 * @param context - SharePoint WebPart context
 * @param settings - Card settings
 * @returns UseUnreadInboxResult
 */
export const useUnreadInbox = (
  context: WebPartContext,
  settings: IUnreadInboxSettings = DEFAULT_UNREAD_INBOX_SETTINGS
): UseUnreadInboxResult => {
  // State
  const [data, setData] = useState<UnreadInboxData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  /**
   * Fetch data
   */
  const fetchData = useCallback(async () => {
    if (!settings.enabled) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = new UnreadInboxService(context);
      const result = await service.getData(settings);
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching unreadInbox data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch unread emails'));
    } finally {
      setIsLoading(false);
    }
  }, [context, settings]);

  // Fetch data on mount and when settings change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastRefreshed,
    refresh: fetchData,
  };
};

export default useUnreadInbox;
