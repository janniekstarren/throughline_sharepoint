// ============================================
// useWaitingOnOthers Hook - Data fetching and state management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  GroupedPendingData,
  PendingTrendData,
  PendingFilter,
  WaitingOnOthersPersistedState,
  DEFAULT_PENDING_FILTER,
  getDefaultPersistedState
} from '../models/WaitingOnOthers';
import { WaitingOnOthersService } from '../services/WaitingOnOthersService';
import { GraphCacheService } from '../services/GraphCacheService';
import { UserResolverService } from '../services/UserResolverService';
import { PhotoService } from '../services/PhotoService';

const STORAGE_KEY = 'throughline_waiting_on_others';

export interface IWaitingOnOthersSettings {
  minWaitHours: number;
  includeEmail: boolean;
  includeTeamsChats: boolean;
  includeMentions: boolean;
  showChart: boolean;
}

export const DEFAULT_WAITING_ON_OTHERS_SETTINGS: IWaitingOnOthersSettings = {
  minWaitHours: 24,
  includeEmail: true,
  includeTeamsChats: true,
  includeMentions: true,
  showChart: true
};

export function useWaitingOnOthers(
  context: WebPartContext,
  settings: IWaitingOnOthersSettings = DEFAULT_WAITING_ON_OTHERS_SETTINGS
) {
  const [data, setData] = useState<GroupedPendingData | null>(null);
  const [trendData, setTrendData] = useState<PendingTrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [persistedState, setPersistedState] = useState<WaitingOnOthersPersistedState>(getDefaultPersistedState);
  const [filter, setFilter] = useState<PendingFilter>({
    ...DEFAULT_PENDING_FILTER,
    minWaitDuration: settings.minWaitHours,
    includeEmail: settings.includeEmail,
    includeTeamsChats: settings.includeTeamsChats,
    includeMentions: settings.includeMentions
  });

  // Load persisted state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPersistedState(cleanupExpired(parsed));
      }
    } catch (err) {
      console.warn('Failed to load persisted state:', err);
    }
  }, []);

  // Save persisted state
  const savePersistedState = useCallback((newState: WaitingOnOthersPersistedState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setPersistedState(newState);
    } catch (err) {
      console.warn('Failed to save persisted state:', err);
    }
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const graphClient = await context.msGraphClientFactory.getClient('3');
      const userResponse = await graphClient.api('/me').select('id,mail').get();

      // Initialize shared services
      const cacheService = new GraphCacheService(graphClient);
      const userResolver = new UserResolverService(graphClient, userResponse.mail);
      const photoService = new PhotoService(graphClient);

      const service = new WaitingOnOthersService(
        graphClient,
        userResponse.id,
        userResponse.mail,
        cacheService,
        userResolver,
        photoService
      );

      const [pendingData, trend] = await Promise.all([
        service.getPendingData(filter, persistedState),
        settings.showChart ? service.getPendingTrend(14) : Promise.resolve(null)
      ]);

      setData(pendingData);
      setTrendData(trend);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load pending data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [context, filter, persistedState, settings.showChart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update filter when settings change
  useEffect(() => {
    setFilter(f => ({
      ...f,
      minWaitDuration: settings.minWaitHours,
      includeEmail: settings.includeEmail,
      includeTeamsChats: settings.includeTeamsChats,
      includeMentions: settings.includeMentions
    }));
  }, [settings.minWaitHours, settings.includeEmail, settings.includeTeamsChats, settings.includeMentions]);

  // Actions
  const resolveItem = useCallback((pendingId: string, resolution: 'responded' | 'gave-up' | 'no-longer-needed') => {
    const newState: WaitingOnOthersPersistedState = {
      ...persistedState,
      resolved: [
        ...persistedState.resolved,
        { pendingId, resolvedAt: new Date(), resolution }
      ]
    };
    savePersistedState(newState);
  }, [persistedState, savePersistedState]);

  const snoozeItem = useCallback((pendingId: string, until: Date, reason?: string) => {
    const newState: WaitingOnOthersPersistedState = {
      ...persistedState,
      snoozed: [
        ...persistedState.snoozed.filter(s => s.pendingId !== pendingId),
        { pendingId, snoozedAt: new Date(), snoozedUntil: until, reason }
      ]
    };
    savePersistedState(newState);
  }, [persistedState, savePersistedState]);

  const unsnoozeItem = useCallback((pendingId: string) => {
    const newState: WaitingOnOthersPersistedState = {
      ...persistedState,
      snoozed: persistedState.snoozed.filter(s => s.pendingId !== pendingId)
    };
    savePersistedState(newState);
  }, [persistedState, savePersistedState]);

  const recordReminderSent = useCallback((pendingId: string, template: string) => {
    const newState: WaitingOnOthersPersistedState = {
      ...persistedState,
      remindersSent: [
        ...persistedState.remindersSent.filter(r => r.pendingId !== pendingId),
        { pendingId, sentAt: new Date(), template }
      ]
    };
    savePersistedState(newState);
  }, [persistedState, savePersistedState]);

  const updateFilter = useCallback((updates: Partial<PendingFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    data,
    trendData,
    isLoading,
    error,
    lastRefreshed,
    filter,
    setFilter,
    updateFilter,
    refresh: loadData,
    resolveItem,
    snoozeItem,
    unsnoozeItem,
    recordReminderSent
  };
}

function cleanupExpired(state: WaitingOnOthersPersistedState): WaitingOnOthersPersistedState {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    resolved: state.resolved.filter(r => new Date(r.resolvedAt) > thirtyDaysAgo),
    snoozed: state.snoozed.filter(s => new Date(s.snoozedUntil) > now),
    remindersSent: state.remindersSent.filter(r => new Date(r.sentAt) > thirtyDaysAgo),
    lastCleanup: now
  };
}
