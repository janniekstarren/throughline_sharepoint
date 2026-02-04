// ============================================
// useDashboardData Hook - Consolidated dashboard state management
// Replaces 27+ individual useState calls with a single unified state
// Supports both API Mode (live data) and Test Data Mode (mock data)
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
import { getTestData, simulateDelay, DataMode } from '../services/testData';

// Re-export DataMode for consumers
export type { DataMode } from '../services/testData';

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

/**
 * Consolidated dashboard data hook
 * @param context - SharePoint WebPart context
 * @param dataMode - 'api' for live Graph data, 'test' for mock data
 */
export function useDashboardData(
  context: WebPartContext,
  dataMode: DataMode = 'api'
): UseDashboardDataReturn {
  const [state, setState] = useState<DashboardDataState>(createInitialState);
  const graphServiceRef = useRef<GraphService | null>(null);

  // Initialize GraphService once (only needed for API mode)
  useEffect(() => {
    if (dataMode === 'api') {
      graphServiceRef.current = new GraphService(context);
    }
  }, [context, dataMode]);

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

  // Generic fetch function for API mode
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

  // Individual fetch functions for API mode
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

  // Load test data with simulated delay
  const loadTestData = useCallback(async (): Promise<void> => {
    console.log('Dashboard running in Test Data mode');

    // Set all states to loading
    setState(createInitialState());

    // Simulate network delay for realistic UX
    await simulateDelay(500);

    // Load test data
    const testData = getTestData();

    // Update all states with test data
    setState({
      events: { data: testData.events, loading: false, error: undefined },
      emails: { data: testData.emails, loading: false, error: undefined },
      tasks: { data: testData.tasks, loading: false, error: undefined },
      files: { data: testData.files, loading: false, error: undefined },
      weekEvents: { data: testData.weekEvents, loading: false, error: undefined },
      flaggedEmails: { data: testData.flaggedEmails, loading: false, error: undefined },
      teamMembers: { data: testData.teamMembers, loading: false, error: undefined },
      sharedFiles: { data: testData.sharedFiles, loading: false, error: undefined },
      siteActivity: { data: testData.siteActivity, loading: false, error: undefined },
      quickLinks: { data: testData.quickLinks, loading: false, error: undefined },
    });
  }, []);

  // Refresh a specific data type
  const refresh = useCallback(async (dataType: keyof DashboardDataState): Promise<void> => {
    if (dataMode === 'test') {
      // In test mode, just reload all test data
      await loadTestData();
      return;
    }

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
  }, [dataMode, loadTestData, fetchEvents, fetchEmails, fetchTasks, fetchFiles, fetchWeekEvents, fetchFlaggedEmails, fetchTeamMembers, fetchSharedFiles, fetchSiteActivity]);

  // Refresh all data (API mode)
  const refreshAllApi = useCallback(async (): Promise<void> => {
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

  // Refresh all data (handles both modes)
  const refreshAll = useCallback(async (): Promise<void> => {
    if (dataMode === 'test') {
      await loadTestData();
    } else {
      await refreshAllApi();
    }
  }, [dataMode, loadTestData, refreshAllApi]);

  // Initial fetch on mount or when dataMode changes
  useEffect(() => {
    if (dataMode === 'test') {
      loadTestData().catch(console.error);
    } else if (graphServiceRef.current) {
      refreshAllApi().catch(console.error);
    }
  }, [context, dataMode]); // eslint-disable-line react-hooks/exhaustive-deps

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
