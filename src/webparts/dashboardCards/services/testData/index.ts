// ============================================
// Test Data Module - Main Entry Point
// Provides mock data for testing/demo mode
// ============================================

import { DashboardDataState } from '../../hooks/useDashboardData';
import { getTestEvents } from './events';
import { getTestEmails } from './emails';
import { getTestTasks } from './tasks';
import { getTestFiles } from './files';
import { getTestWeekEvents } from './weekEvents';
import { getTestFlaggedEmails } from './flaggedEmails';
import { getTestTeamMembers } from './teamMembers';
import { getTestSharedFiles } from './sharedFiles';
import { getTestSiteActivity } from './siteActivity';
import { getTestQuickLinks } from './quickLinks';

// Re-export WaitingOn test data functions for direct use
export { getTestWaitingOnYouData, getTestWaitingOnYouTrend } from './waitingOnYou';
export { getTestWaitingOnOthersData, getTestWaitingOnOthersTrend } from './waitingOnOthers';

// ============================================
// Types
// ============================================

export type DataMode = 'api' | 'test';

export interface TestDataResult {
  events: DashboardDataState['events']['data'];
  emails: DashboardDataState['emails']['data'];
  tasks: DashboardDataState['tasks']['data'];
  files: DashboardDataState['files']['data'];
  weekEvents: DashboardDataState['weekEvents']['data'];
  flaggedEmails: DashboardDataState['flaggedEmails']['data'];
  teamMembers: DashboardDataState['teamMembers']['data'];
  sharedFiles: DashboardDataState['sharedFiles']['data'];
  siteActivity: DashboardDataState['siteActivity']['data'];
  quickLinks: DashboardDataState['quickLinks']['data'];
}

// ============================================
// Main Export Function
// ============================================

/**
 * Get all test data for the dashboard
 * Returns mock data that matches the GraphService interfaces
 */
export function getTestData(): TestDataResult {
  return {
    events: getTestEvents(),
    emails: getTestEmails(),
    tasks: getTestTasks(),
    files: getTestFiles(),
    weekEvents: getTestWeekEvents(),
    flaggedEmails: getTestFlaggedEmails(),
    teamMembers: getTestTeamMembers(),
    sharedFiles: getTestSharedFiles(),
    siteActivity: getTestSiteActivity(),
    quickLinks: getTestQuickLinks(),
  };
}

/**
 * Simulated loading delay for realistic UX testing
 * @param ms - Delay in milliseconds (default 500ms)
 */
export function simulateDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
