// ============================================
// TodaysAgenda Card - Data Models
// ============================================

import { TrendDataPoint } from '../components/shared/charts';

/**
 * Calendar event interface
 */
export interface CalendarEvent {
  id: string;
  subject: string;
  start: Date;
  end: Date;
  location?: string;
  isAllDay: boolean;
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string;
  webLink: string;
}

/**
 * Trend data for the agenda chart
 */
export interface AgendaTrendData {
  dataPoints: TrendDataPoint[];
  trend: 'busier' | 'quieter' | 'steady';
  averageMeetingsPerDay: number;
}

/**
 * Aggregated data for the TodaysAgenda card
 */
export interface TodaysAgendaData {
  events: CalendarEvent[];
  totalCount: number;
  onlineMeetingCount: number;
  currentEvent: CalendarEvent | null;
  nextEvent: CalendarEvent | null;
  /** Total hours of meetings today */
  totalMeetingHours: number;
  /** Longest single meeting duration in minutes */
  longestMeetingMinutes: number;
}

/**
 * Settings interface for the TodaysAgenda card
 */
export interface ITodaysAgendaSettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of events to display */
  maxItems: number;
  /** Whether to show online meeting indicators */
  showOnlineMeetings: boolean;
  /** Whether to highlight current event */
  highlightCurrentEvent: boolean;
}

/**
 * Default settings for the TodaysAgenda card
 */
export const DEFAULT_TODAYS_AGENDA_SETTINGS: ITodaysAgendaSettings = {
  enabled: true,
  maxItems: 10,
  showOnlineMeetings: true,
  highlightCurrentEvent: true,
};
