// ============================================
// Context Switching Models
// Tracks context switches between apps, projects, and communication channels
// ============================================

/**
 * Types of context switches that can be tracked
 */
export type ContextType =
  | 'email'
  | 'teams-chat'
  | 'teams-channel'
  | 'meeting'
  | 'file'
  | 'task'
  | 'calendar';

/**
 * A single context switch event
 */
export interface ContextSwitch {
  id: string;
  /** The type of context switched to */
  contextType: ContextType;
  /** Display name for the context (e.g., "Budget Report.xlsx", "Team Chat with Sarah") */
  contextName: string;
  /** Timestamp when the switch occurred */
  timestamp: Date;
  /** Duration spent in this context (in minutes) */
  duration: number;
  /** Web URL to navigate to this context */
  webUrl?: string;
  /** Associated project/category if known */
  project?: string;
  /** Person involved (for emails, chats) */
  person?: {
    id: string;
    displayName: string;
    email: string;
  };
}

/**
 * Aggregated context data for a time period
 */
export interface ContextPeriodSummary {
  /** The date/hour this summary covers */
  periodStart: Date;
  periodEnd: Date;
  /** Total context switches in this period */
  switchCount: number;
  /** Breakdown by context type */
  byType: Record<ContextType, number>;
  /** Average focus time before switching (minutes) */
  avgFocusTime: number;
  /** Longest uninterrupted focus session (minutes) */
  longestFocusSession: number;
}

/**
 * Daily context switching summary
 */
export interface DailySummary {
  date: string; // ISO date string
  totalSwitches: number;
  totalFocusTime: number; // minutes
  avgFocusTime: number; // minutes
  longestFocus: number; // minutes
  switchesByType: Record<ContextType, number>;
  switchesByHour: { hour: number; count: number }[];
  peakSwitchingHour: number;
  focusScore: number; // 0-100, higher is better (fewer switches)
}

/**
 * Hourly breakdown of context switching
 */
export interface HourlySwitchData {
  hour: number; // 0-23
  switchCount: number;
  dominantContext: ContextType;
  focusTime: number; // minutes of focused work this hour
}

/**
 * Trend data over multiple days
 */
export interface ContextSwitchingTrend {
  dataPoints: DailySummary[];
  trend: 'improving' | 'worsening' | 'stable';
  weeklyAvgSwitches: number;
  weeklyAvgFocusTime: number;
  weeklyFocusScore: number;
  bestDay: string; // ISO date of day with best focus
  worstDay: string; // ISO date of day with most switches
  comparisonToLastWeek: {
    switchesChange: number; // percentage
    focusTimeChange: number; // percentage
  };
}

/**
 * Focus session - a period of uninterrupted work
 */
export interface FocusSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  contextType: ContextType;
  contextName: string;
  interrupted: boolean;
  interruptedBy?: ContextType;
}

/**
 * Context distribution data for pie/donut charts
 */
export interface ContextDistribution {
  contextType: ContextType;
  label: string;
  count: number;
  percentage: number;
  totalDuration: number; // minutes
  color: string;
}

/**
 * Real-time context switching state
 */
export interface CurrentContextState {
  currentContext: ContextType;
  currentContextName: string;
  startedAt: Date;
  todaySwitches: number;
  todayFocusTime: number;
  currentFocusStreak: number; // minutes without switching
  isInFocusMode: boolean;
}

/**
 * Settings for context switching tracking
 */
export interface ContextSwitchingSettings {
  /** Minimum duration (seconds) to count as a context switch */
  minSwitchDuration: number;
  /** Track email context switches */
  trackEmail: boolean;
  /** Track Teams chat switches */
  trackTeamsChat: boolean;
  /** Track Teams channel switches */
  trackTeamsChannel: boolean;
  /** Track meeting switches */
  trackMeetings: boolean;
  /** Track file access switches */
  trackFiles: boolean;
  /** Track task switches */
  trackTasks: boolean;
  /** Focus goal (minutes without switching) */
  focusGoal: number;
  /** Working hours start (24h format) */
  workingHoursStart: number;
  /** Working hours end (24h format) */
  workingHoursEnd: number;
  /** Show focus score in card */
  showFocusScore: boolean;
  /** Show hourly chart */
  showHourlyChart: boolean;
  /** Show context distribution */
  showDistribution: boolean;
  /** Number of days to show in trend */
  trendDays: number;
}

export const DEFAULT_CONTEXT_SWITCHING_SETTINGS: ContextSwitchingSettings = {
  minSwitchDuration: 30,
  trackEmail: true,
  trackTeamsChat: true,
  trackTeamsChannel: true,
  trackMeetings: true,
  trackFiles: true,
  trackTasks: false, // Less reliable
  focusGoal: 25, // Pomodoro-style 25 minutes
  workingHoursStart: 9,
  workingHoursEnd: 17,
  showFocusScore: true,
  showHourlyChart: true,
  showDistribution: true,
  trendDays: 7,
};

/**
 * Full context switching data for the card
 */
export interface ContextSwitchingData {
  /** Current real-time state */
  currentState: CurrentContextState;
  /** Today's summary */
  todaySummary: DailySummary;
  /** Trend data for the configured period */
  trendData: ContextSwitchingTrend;
  /** Hourly breakdown for today */
  hourlyData: HourlySwitchData[];
  /** Context type distribution */
  distribution: ContextDistribution[];
  /** Recent focus sessions */
  recentSessions: FocusSession[];
  /** Recent context switches (for list view) */
  recentSwitches: ContextSwitch[];
}

/**
 * View mode for the card
 */
export type ContextViewMode = 'overview' | 'timeline' | 'distribution' | 'trend';

/**
 * Helper function to get icon for context type
 */
export function getContextTypeIcon(type: ContextType): string {
  switch (type) {
    case 'email': return 'Mail';
    case 'teams-chat': return 'Chat';
    case 'teams-channel': return 'People';
    case 'meeting': return 'Video';
    case 'file': return 'Document';
    case 'task': return 'TaskList';
    case 'calendar': return 'Calendar';
    default: return 'Circle';
  }
}

/**
 * Helper function to get display label for context type
 */
export function getContextTypeLabel(type: ContextType): string {
  switch (type) {
    case 'email': return 'Email';
    case 'teams-chat': return 'Teams Chat';
    case 'teams-channel': return 'Teams Channel';
    case 'meeting': return 'Meeting';
    case 'file': return 'File';
    case 'task': return 'Task';
    case 'calendar': return 'Calendar';
    default: return 'Unknown';
  }
}

/**
 * Helper function to get color for context type
 */
export function getContextTypeColor(type: ContextType): string {
  switch (type) {
    case 'email': return '#0078D4'; // Outlook blue
    case 'teams-chat': return '#6264A7'; // Teams purple
    case 'teams-channel': return '#6264A7'; // Teams purple
    case 'meeting': return '#00A4EF'; // Skype blue
    case 'file': return '#107C10'; // Office green
    case 'task': return '#D83B01'; // Planner orange
    case 'calendar': return '#0078D4'; // Calendar blue
    default: return '#605E5C';
  }
}

/**
 * Calculate focus score based on switches and time
 * Higher score = better focus (fewer switches, longer sessions)
 */
export function calculateFocusScore(
  totalSwitches: number,
  avgFocusTime: number,
  workingHours: number
): number {
  if (workingHours <= 0) return 100;

  // Ideal: 1-2 switches per hour, 25+ min avg focus
  const switchesPerHour = totalSwitches / workingHours;
  const idealSwitchesPerHour = 2;
  const idealFocusTime = 25;

  // Score based on switches (50% weight)
  const switchScore = Math.max(0, 100 - (switchesPerHour - idealSwitchesPerHour) * 20);

  // Score based on focus time (50% weight)
  const focusScore = Math.min(100, (avgFocusTime / idealFocusTime) * 100);

  return Math.round((switchScore * 0.5 + focusScore * 0.5));
}
