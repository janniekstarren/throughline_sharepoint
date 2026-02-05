// ============================================
// UpcomingWeek Card - Data Models
// ============================================

import { TrendDataPoint } from '../components/shared/charts';

/**
 * Week event interface for calendar events over the next 7 days
 */
export interface WeekEvent {
  id: string;
  subject: string;
  start: Date;
  end: Date;
  location?: string;
  isAllDay: boolean;
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string;
  webLink: string;
  dayOfWeek: string;
}

/**
 * Trend data for the week chart
 */
export interface WeekTrendData {
  dataPoints: TrendDataPoint[];
  trend: 'busier' | 'quieter' | 'steady';
  averageMeetingsPerDay: number;
}

/**
 * Aggregated data for the UpcomingWeek card
 */
export interface UpcomingWeekData {
  events: WeekEvent[];
  totalCount: number;
  byDay: Map<string, WeekEvent[]>;
  /** Count of online meetings */
  onlineMeetingCount: number;
  /** Day with the most meetings */
  busiestDay: string;
  /** Estimated free hours in the week */
  freeHoursEstimate: number;
}

/**
 * Settings interface for the UpcomingWeek card
 */
export interface IUpcomingWeekSettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of events to display */
  maxItems: number;
  /** Whether to show online meeting indicators */
  showOnlineMeetings: boolean;
  /** Number of days to show (1-7) */
  daysToShow: number;
}

/**
 * Default settings for the UpcomingWeek card
 */
export const DEFAULT_UPCOMING_WEEK_SETTINGS: IUpcomingWeekSettings = {
  enabled: true,
  maxItems: 20,
  showOnlineMeetings: true,
  daysToShow: 7,
};
