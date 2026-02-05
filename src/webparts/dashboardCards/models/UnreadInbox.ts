// ============================================
// UnreadInbox Card - Data Models
// ============================================

import { TrendDataPoint } from '../components/shared/charts';

/**
 * Email sender information
 */
export interface EmailSender {
  name: string;
  email: string;
}

/**
 * Email message interface
 */
export interface EmailMessage {
  id: string;
  subject: string;
  from: EmailSender;
  receivedDateTime: Date;
  bodyPreview: string;
  importance: 'low' | 'normal' | 'high';
  hasAttachments: boolean;
  isRead: boolean;
  webLink: string;
}

/**
 * Trend data for the inbox chart
 */
export interface InboxTrendData {
  dataPoints: TrendDataPoint[];
  trend: 'fewer' | 'more' | 'steady';
  averageEmailsPerDay: number;
}

/**
 * Aggregated data for the UnreadInbox card
 */
export interface UnreadInboxData {
  emails: EmailMessage[];
  totalCount: number;
  highImportanceCount: number;
  /** Count of emails with high priority/importance */
  highPriorityCount: number;
  /** Count of emails with attachments */
  attachmentCount: number;
  /** Hours since the oldest unread email */
  oldestUnreadHours: number;
}

/**
 * Settings interface for the UnreadInbox card
 */
export interface IUnreadInboxSettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of emails to display */
  maxItems: number;
  /** Whether to show high importance indicator */
  showHighImportance: boolean;
}

/**
 * Default settings for the UnreadInbox card
 */
export const DEFAULT_UNREAD_INBOX_SETTINGS: IUnreadInboxSettings = {
  enabled: true,
  maxItems: 10,
  showHighImportance: true,
};
