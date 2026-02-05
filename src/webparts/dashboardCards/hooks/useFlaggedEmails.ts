// ============================================
// useFlaggedEmails Hook - Data Management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  FlaggedEmailsData,
  IFlaggedEmailsSettings,
  DEFAULT_FLAGGED_EMAILS_SETTINGS,
} from '../models/FlaggedEmails';
import { FlaggedEmailsService } from '../services/FlaggedEmailsService';

// Re-export settings for convenience
export { IFlaggedEmailsSettings, DEFAULT_FLAGGED_EMAILS_SETTINGS };
export type { FlaggedEmail, FlaggedEmailsData, FlagStatus } from '../models/FlaggedEmails';

/**
 * Return type for the useFlaggedEmails hook
 */
export interface UseFlaggedEmailsResult {
  /** Main card data */
  data: FlaggedEmailsData | null;
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
 * Hook for managing FlaggedEmails card data
 *
 * @param context - SharePoint WebPart context
 * @param settings - Card settings
 * @returns UseFlaggedEmailsResult
 */
export const useFlaggedEmails = (
  context: WebPartContext,
  settings: IFlaggedEmailsSettings = DEFAULT_FLAGGED_EMAILS_SETTINGS
): UseFlaggedEmailsResult => {
  // State
  const [data, setData] = useState<FlaggedEmailsData | null>(null);
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
      const service = new FlaggedEmailsService(context);
      const result = await service.getData(settings);
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching flagged emails data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch flagged emails'));
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

export default useFlaggedEmails;
