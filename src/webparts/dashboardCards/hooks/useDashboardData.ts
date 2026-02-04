// ============================================
// useDashboardData Hook - Consolidated dashboard state management
// Replaces 27+ individual useState calls with a single unified state
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  GraphService,
  ICalendarEvent,
  IEmailMessage,
  ITaskItem,
  IFileItem,
  ITeamMember,
  ISharedFile,
  ISiteActivity,
  IQuickLink
} from '../services/GraphService';

// ============================================
// Types
// ============================================

/**
 * Loading state for a single data type
 */
export interface DataState<T> {
  data: T;
  loading: boolean;
  error: string | undefined;
}

/**
 * All dashboard data states consolidated
 */
export interface DashboardDataState {
  events: DataState<ICalendarEvent[]>;
  emails: DataState<IEmailMessage[]>;
  tasks: DataState<ITaskItem[]>;
  files: DataState<IFileItem[]>;
  weekEvents: DataState<ICalendarEvent[]>;
  flaggedEmails: DataState<IEmailMessage[]>;
  teamMembers: DataState<ITeamMember[]>;
  sharedFiles: DataState<ISharedFile[]>;
  siteActivity: DataState<ISiteActivity[]>;
  quickLinks: DataState<IQuickLink[]>;
}

/**
 * Return type for the useDashboardData hook
 */
export interface UseDashboardDataReturn {
  /** All data states */
  state: DashboardDataState;
  /** Refresh all data */
  refreshAll: () => Promise<void>;
  /** Refresh specific data type */
  refresh: (dataType: keyof DashboardDataState) => Promise<void>;
  /** Whether any data is still loading */
  isAnyLoading: boolean;
}

// ============================================
// Initial State
// ============================================

const createInitialDataState = <T>(initialData: T): DataState<T> => ({
  data: initialData,
  loading: true,
  error: undefined,
});

const createInitialState = (): DashboardDataState => ({
  events: createInitialDataState<ICalendarEvent[]>([]),
  emails: createInitialDataState<IEmailMessage[]>([]),
  tasks: createInitialDataState<ITaskItem[]>([]),
  files: createInitialDataState<IFileItem[]>([]),
  weekEvents: createInitialDataState<ICalendarEvent[]>([]),
  flaggedEmails: createInitialDataState<IEmailMessage[]>([]),
  teamMembers: createInitialDataState<ITeamMember[]>([]),
  sharedFiles: createInitialDataState<ISharedFile[]>([]),
  siteActivity: createInitialDataState<ISiteActivity[]>([]),
  quickLinks: createInitialDataState<IQuickLink[]>([]),
});

// ============================================
// Hook Implementation
// ============================================

export function useDashboardData(context: WebPartContext): UseDashboardDataReturn {
  const [state, setState] = useState<DashboardDataState>(createInitialState);
  const graphServiceRef = useRef<GraphService | null>(null);

  // Initialize GraphService once
  useEffect(() => {
    graphServiceRef.current = new GraphService(context);
  }, [context]);

  // Helper to update a specific data state
  const updateDataState = useCallback(<K extends keyof DashboardDataState>(
    key: K,
    updates: Partial<DataState<DashboardDataState[K]['data']>>
  ) => {
    setState(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  }, []);

  // Generic fetch function
  const fetchData = useCallback(async <K extends keyof DashboardDataState>(
    key: K,
    fetcher: () => Promise<DashboardDataState[K]['data']>,
    errorMessage: string
  ): Promise<void> => {
    updateDataState(key, { loading: true, error: undefined });
    try {
      const data = await fetcher();
      updateDataState(key, { data, loading: false });
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      updateDataState(key, { loading: false, error: errorMessage });
    }
  }, [updateDataState]);

  // Individual fetch functions
  const fetchEvents = useCallback(async (): Promise<void> => {
    if (!graphServiceRef.current) return;
    await fetchData('events', () => graphServiceRef.current!.getTodaysEvents(), 'Failed to load calendar events.');
  }, [fetchData]);

  const fetchEmails = useCallback(async (): Promise<void> => {
    if (!graphServiceRef.current) return;
    await fetchData('emails', () => graphServiceRef.current!.getUnreadEmails(10), 'Failed to load emails.');
  }, [fetchData]);

  const fetchTasks = useCallback(async (): Promise<void> => {
    if (!graphServiceRef.current) return;
    await fetchData('tasks', () => graphServiceRef.current!.getTasks(10), 'Failed to load tasks.');
  }, [fetchData]);

  const fetchFiles = useCallback(async (): Promise<void> => {
    if (!graphServiceRef.current) return;
    await fetchData('files', () => graphServiceRef.current!.getRecentFiles(10), 'Failed to load files.');
  }, [fetchData]);

  const fetchWeekEvents = useCallback(async (): Promise<void> => {
    if (!graphServiceRef.current) return;
    await fetchData('weekEvents', () => graphServiceRef.current!.getUpcomingWeekEvents(), 'Failed to load upcoming events.');
  }, [fetchData]);

  const fetchFlaggedEmails = useCallback(async (): Promise<void> => {
    if (!graphServiceRef.current) return;
    await fetchData('flaggedEmails', () => graphServiceRef.current!.getFlaggedEmails(10), 'Failed to load flagged emails.');
  }, [fetchData]);

  const fetchTeamMembers = useCallback(async (): Promise<void> => {
    if (!graphServiceRef.current) return;
    await fetchData('teamMembers', () => graphServiceRef.current!.getTeamMembers(), 'Failed to load team members.');
  }, [fetchData]);

  const fetchSharedFiles = useCallback(async (): Promise<void> => {
    if (!graphServiceRef.current) return;
    await fetchData('sharedFiles', () => graphServiceRef.current!.getSharedWithMe(10), 'Failed to load shared files.');
  }, [fetchData]);

  const fetchSiteActivity = useCallback(async (): Promise<void> => {
    if (!graphServiceRef.current) return;
    await fetchData('siteActivity', () => graphServiceRef.current!.getSiteActivity(), 'Failed to load site activity.');
  }, [fetchData]);

  // Refresh a specific data type
  const refresh = useCallback(async (dataType: keyof DashboardDataState): Promise<void> => {
    const fetcherMap: Record<keyof DashboardDataState, () => Promise<void>> = {
      events: fetchEvents,
      emails: fetchEmails,
      tasks: fetchTasks,
      files: fetchFiles,
      weekEvents: fetchWeekEvents,
      flaggedEmails: fetchFlaggedEmails,
      teamMembers: fetchTeamMembers,
      sharedFiles: fetchSharedFiles,
      siteActivity: fetchSiteActivity,
      quickLinks: async () => { /* Quick links are static */ },
    };
    await fetcherMap[dataType]();
  }, [fetchEvents, fetchEmails, fetchTasks, fetchFiles, fetchWeekEvents, fetchFlaggedEmails, fetchTeamMembers, fetchSharedFiles, fetchSiteActivity]);

  // Refresh all data
  const refreshAll = useCallback(async (): Promise<void> => {
    await Promise.all([
      fetchEvents(),
      fetchEmails(),
      fetchTasks(),
      fetchFiles(),
      fetchWeekEvents(),
      fetchFlaggedEmails(),
      fetchTeamMembers(),
      fetchSharedFiles(),
      fetchSiteActivity(),
    ]);
  }, [fetchEvents, fetchEmails, fetchTasks, fetchFiles, fetchWeekEvents, fetchFlaggedEmails, fetchTeamMembers, fetchSharedFiles, fetchSiteActivity]);

  // Initial fetch on mount
  useEffect(() => {
    if (graphServiceRef.current) {
      refreshAll().catch(console.error);
    }
  }, [context]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if any data is still loading
  const isAnyLoading = Object.values(state).some(s => s.loading);

  return {
    state,
    refreshAll,
    refresh,
    isAnyLoading,
  };
}

export default useDashboardData;
