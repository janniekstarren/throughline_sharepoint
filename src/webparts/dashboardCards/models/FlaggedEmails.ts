// ============================================
// FlaggedEmails Card - Data Models
// ============================================

import { TrendDataPoint } from '../components/shared/charts';

/**
 * Sender information for flagged email
 */
export interface FlaggedEmailSender {
  name: string;
  email: string;
}

/**
 * Flag status for email
 */
export type FlagStatus = 'flagged' | 'complete' | 'notFlagged';

/**
 * Flagged email interface
 */
export interface FlaggedEmail {
  id: string;
  subject: string;
  from: FlaggedEmailSender;
  receivedDateTime: Date;
  bodyPreview: string;
  importance: 'low' | 'normal' | 'high';
  hasAttachments: boolean;
  flagStatus: FlagStatus;
  webLink: string;
}

/**
 * Trend data for the flags chart
 */
export interface FlagsTrendData {
  dataPoints: TrendDataPoint[];
  trend: 'improving' | 'worsening' | 'stable';
  averageCompletedPerDay: number;
}

/**
 * Aggregated data for the FlaggedEmails card
 */
export interface FlaggedEmailsData {
  emails: FlaggedEmail[];
  totalCount: number;
  completedCount: number;
  /** Number of flags completed this week */
  completedThisWeek: number;
  /** Average age of active flags in days */
  averageAgeDays: number;
  /** Age of oldest active flag in days */
  oldestFlagDays: number;
}

/**
 * Settings interface for the FlaggedEmails card
 */
export interface IFlaggedEmailsSettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of emails to display */
  maxItems: number;
  /** Whether to show completed flagged emails */
  showCompleted: boolean;
}

/**
 * Default settings for the FlaggedEmails card
 */
export const DEFAULT_FLAGGED_EMAILS_SETTINGS: IFlaggedEmailsSettings = {
  enabled: true,
  maxItems: 10,
  showCompleted: false,
};
