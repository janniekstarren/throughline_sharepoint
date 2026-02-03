// src/webparts/dashboardCards/hooks/useWaitingOnYou.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  GroupedWaitingData,
  WaitingDebtTrend,
  WaitingFilter,
  PersistedState,
  ViewMode,
  DEFAULT_SLA_SETTINGS
} from '../models/WaitingOnYou';
import { WaitingOnYouService } from '../services/WaitingOnYouService';
import { useLocalStorage } from './useLocalStorage';

export interface UseWaitingOnYouOptions {
  graphClient: MSGraphClientV3 | null;
  autoRefreshInterval?: number; // milliseconds, default 5 minutes
  initialFilter?: Partial<WaitingFilter>;
}

export interface UseWaitingOnYouReturn {
  // Data
  data: GroupedWaitingData | null;
  trendData: WaitingDebtTrend | null;

  // Loading & Error
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;

  // UI State
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  expandedGroups: Set<string>;
  toggleGroup: (groupId: string) => void;

  // Filter
  filter: WaitingFilter;
  updateFilter: (updates: Partial<WaitingFilter>) => void;

  // Actions
  refresh: () => Promise<void>;
  dismissConversation: (conversationId: string) => void;
  snoozeConversation: (conversationId: string, until: Date, reason?: string) => void;
  unsnoozeConversation: (conversationId: string) => void;

  // Persistence
  persistedState: PersistedState;
}

const DEFAULT_FILTER: WaitingFilter = {
  minStaleDuration: 48, // 2 days default
  maxResults: 50,
  includeEmail: true,
  includeTeamsChats: true,
  includeChannelMessages: true,
  includeMentions: true,
  relationshipFilter: 'all',
  hideSnoozed: false
};

export function useWaitingOnYou(options: UseWaitingOnYouOptions): UseWaitingOnYouReturn {
  const { graphClient, autoRefreshInterval = 5 * 60 * 1000, initialFilter } = options;

  // State
  const [data, setData] = useState<GroupedWaitingData | null>(null);
  const [trendData, setTrendData] = useState<WaitingDebtTrend | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('people');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<WaitingFilter>({
    ...DEFAULT_FILTER,
    ...initialFilter
  });

  // Persistence hook
  const {
    persistedState,
    dismissItem,
    snoozeItem,
    unsnoozeItem
  } = useLocalStorage();

  // Service ref (recreate when graphClient changes)
  const serviceRef = useRef<WaitingOnYouService | null>(null);

  // Initialize service when graphClient becomes available
  useEffect(() => {
    if (graphClient) {
      serviceRef.current = new WaitingOnYouService(graphClient, DEFAULT_SLA_SETTINGS);
    } else {
      serviceRef.current = null;
    }
  }, [graphClient]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!serviceRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch main data and trend data in parallel
      const [waitingData, trend] = await Promise.all([
        serviceRef.current.getWaitingData(filter, persistedState),
        serviceRef.current.getWaitingDebtTrend(14)
      ]);

      setData(waitingData);
      setTrendData(trend);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch waiting data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [filter, persistedState]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (graphClient && serviceRef.current) {
      fetchData();
    }

    // Set up auto-refresh interval
    if (autoRefreshInterval > 0 && graphClient) {
      const intervalId = setInterval(() => {
        fetchData();
      }, autoRefreshInterval);

      return () => clearInterval(intervalId);
    }

    return undefined;
  }, [graphClient, fetchData, autoRefreshInterval]);

  // Manual refresh
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Toggle expanded group
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Update filter
  const updateFilter = useCallback((updates: Partial<WaitingFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  // Dismiss conversation
  const dismissConversation = useCallback((conversationId: string) => {
    dismissItem(conversationId);
    // Optimistically update UI
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        allConversations: prev.allConversations.filter(c => c.id !== conversationId),
        byPerson: prev.byPerson.map(pg => ({
          ...pg,
          conversations: pg.conversations.filter(c => c.id !== conversationId),
          itemCount: pg.conversations.filter(c => c.id !== conversationId).length
        })).filter(pg => pg.conversations.length > 0),
        byTeam: prev.byTeam.map(tg => ({
          ...tg,
          conversations: tg.conversations.filter(c => c.id !== conversationId),
          itemCount: tg.conversations.filter(c => c.id !== conversationId).length
        })).filter(tg => tg.conversations.length > 0),
        ungroupedByPerson: prev.ungroupedByPerson.map(pg => ({
          ...pg,
          conversations: pg.conversations.filter(c => c.id !== conversationId),
          itemCount: pg.conversations.filter(c => c.id !== conversationId).length
        })).filter(pg => pg.conversations.length > 0),
        totalItems: prev.totalItems - 1
      };
    });
  }, [dismissItem]);

  // Snooze conversation
  const snoozeConversation = useCallback((conversationId: string, until: Date, reason?: string) => {
    snoozeItem(conversationId, until, reason);
    // Optimistically update UI
    setData(prev => {
      if (!prev) return prev;

      const updateConversation = (c: typeof prev.allConversations[0]) =>
        c.id === conversationId ? { ...c, snoozedUntil: until } : c;

      return {
        ...prev,
        allConversations: prev.allConversations.map(updateConversation),
        byPerson: prev.byPerson.map(pg => ({
          ...pg,
          conversations: pg.conversations.map(updateConversation),
          snoozedCount: pg.conversations.filter(c =>
            c.id === conversationId || c.snoozedUntil
          ).length
        })),
        byTeam: prev.byTeam.map(tg => ({
          ...tg,
          conversations: tg.conversations.map(updateConversation),
          snoozedCount: tg.conversations.filter(c =>
            c.id === conversationId || c.snoozedUntil
          ).length
        })),
        ungroupedByPerson: prev.ungroupedByPerson.map(pg => ({
          ...pg,
          conversations: pg.conversations.map(updateConversation),
          snoozedCount: pg.conversations.filter(c =>
            c.id === conversationId || c.snoozedUntil
          ).length
        })),
        snoozedCount: prev.snoozedCount + 1
      };
    });
  }, [snoozeItem]);

  // Unsnooze conversation
  const unsnoozeConversation = useCallback((conversationId: string) => {
    unsnoozeItem(conversationId);
    // Optimistically update UI
    setData(prev => {
      if (!prev) return prev;

      const updateConversation = (c: typeof prev.allConversations[0]) =>
        c.id === conversationId ? { ...c, snoozedUntil: undefined } : c;

      return {
        ...prev,
        allConversations: prev.allConversations.map(updateConversation),
        byPerson: prev.byPerson.map(pg => ({
          ...pg,
          conversations: pg.conversations.map(updateConversation),
          snoozedCount: pg.conversations.filter(c =>
            c.id !== conversationId && c.snoozedUntil
          ).length
        })),
        byTeam: prev.byTeam.map(tg => ({
          ...tg,
          conversations: tg.conversations.map(updateConversation),
          snoozedCount: tg.conversations.filter(c =>
            c.id !== conversationId && c.snoozedUntil
          ).length
        })),
        ungroupedByPerson: prev.ungroupedByPerson.map(pg => ({
          ...pg,
          conversations: pg.conversations.map(updateConversation),
          snoozedCount: pg.conversations.filter(c =>
            c.id !== conversationId && c.snoozedUntil
          ).length
        })),
        snoozedCount: Math.max(0, prev.snoozedCount - 1)
      };
    });
  }, [unsnoozeItem]);

  return {
    data,
    trendData,
    isLoading,
    error,
    lastRefreshed,
    viewMode,
    setViewMode,
    expandedGroups,
    toggleGroup,
    filter,
    updateFilter,
    refresh,
    dismissConversation,
    snoozeConversation,
    unsnoozeConversation,
    persistedState
  };
}
