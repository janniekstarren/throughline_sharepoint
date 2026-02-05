// ============================================
// EmailCard Models
// Unified data models for consolidated email card
// ============================================

// ============================================
// Tab, Sort, and Filter Types
// ============================================

/**
 * Tab types for the email card
 * - unread: Unread inbox emails
 * - flagged: Flagged emails
 * - vip: Emails from VIP contacts
 * - urgent: High importance emails
 */
export type EmailTabType = 'unread' | 'flagged' | 'vip' | 'urgent';

/**
 * Sort modes for email list
 */
export type EmailSortMode = 'priority' | 'sender' | 'oldest' | 'newest';

/**
 * Filter types (can be combined)
 */
export type EmailFilterType = 'vip' | 'flagged' | 'unread' | 'hasAttachments' | 'highPriority';

// ============================================
// Email Item Interface
// ============================================

/**
 * Flag status for emails
 */
export type FlagStatus = 'flagged' | 'complete' | 'notFlagged';

/**
 * Unified email item for all tabs
 */
export interface IEmailCardItem {
  /** Unique identifier */
  id: string;
  /** Email subject line */
  subject: string;
  /** Sender information */
  from: {
    name: string;
    email: string;
  };
  /** When the email was received */
  receivedDateTime: Date;
  /** Preview of the email body */
  bodyPreview: string;
  /** Email importance level */
  importance: 'low' | 'normal' | 'high';
  /** Whether email has attachments */
  hasAttachments: boolean;
  /** Whether email has been read */
  isRead: boolean;
  /** URL to open email in Outlook */
  webLink: string;
  /** Whether email is flagged */
  isFlagged: boolean;
  /** Flag status for flagged emails */
  flagStatus?: FlagStatus;
  /** Date when email was flagged */
  flaggedDate?: Date;
  /** Whether sender is a VIP contact */
  isVip: boolean;
  /** Sender's photo URL if available */
  senderPhotoUrl?: string;
  /** Attachment information if available */
  attachments?: IEmailAttachment[];
}

/**
 * Email attachment information
 */
export interface IEmailAttachment {
  /** Unique identifier */
  id: string;
  /** Attachment file name */
  name: string;
  /** File size in bytes */
  size: number;
  /** Content type (MIME type) */
  contentType: string;
  /** Whether this is an inline attachment */
  isInline: boolean;
  /** URL to download/view the attachment */
  contentUrl?: string;
}

// ============================================
// VIP Contact Interface
// ============================================

/**
 * Reason why a contact is considered VIP
 */
export type VipReason = 'manager' | 'direct_report' | 'frequent' | 'manual';

/**
 * VIP contact information
 */
export interface IVipContact {
  /** Contact email address */
  email: string;
  /** Contact display name */
  displayName: string;
  /** Reason for VIP status */
  reason: VipReason;
  /** When the contact was added (for manual VIPs) */
  addedDate?: Date;
}

// ============================================
// Email Card Statistics
// ============================================

/**
 * Statistics for the email card
 */
export interface IEmailCardStats {
  // Unread tab stats
  /** Total unread emails */
  unreadCount: number;
  /** High importance unread emails */
  highPriorityCount: number;
  /** Unread emails with attachments */
  withAttachmentsCount: number;
  /** Hours since oldest unread email */
  oldestUnreadHours: number;

  // Flagged tab stats
  /** Active (not completed) flagged emails */
  activeFlagsCount: number;
  /** Flags completed this week */
  completedThisWeekCount: number;
  /** Average age of active flags in days */
  averageFlagAgeDays: number;
  /** Days since oldest active flag */
  oldestFlagDays: number;

  // VIP tab stats
  /** Unread emails from VIP contacts */
  vipUnreadCount: number;
  /** Total emails from VIP contacts */
  vipTotalCount: number;
  /** Number of VIP contacts with emails */
  vipContactsCount: number;
  /** High importance VIP emails */
  vipUrgentCount: number;

  // Urgent tab stats
  /** Total urgent (high importance) emails */
  urgentCount: number;
  /** Urgent emails that are unread */
  urgentUnreadCount: number;
  /** Urgent emails from VIPs */
  urgentVipCount: number;
  /** Hours since oldest urgent email */
  oldestUrgentHours: number;
}

// ============================================
// Email Card Data
// ============================================

/**
 * Complete data structure for the email card
 */
export interface IEmailCardData {
  /** All unread emails */
  unreadEmails: IEmailCardItem[];
  /** All flagged emails */
  flaggedEmails: IEmailCardItem[];
  /** Emails from VIP contacts */
  vipEmails: IEmailCardItem[];
  /** High importance/urgent emails */
  urgentEmails: IEmailCardItem[];
  /** VIP contacts list */
  vipContacts: IVipContact[];
  /** Computed statistics */
  stats: IEmailCardStats;
  /** Trend data for charts */
  trendData: IEmailTrendData;
}

// ============================================
// Trend Data for Charts
// ============================================

/**
 * Single data point for trend chart
 */
export interface ITrendDataPoint {
  /** Date of the data point */
  date: Date;
  /** Value for unread count */
  unreadValue: number;
  /** Value for flagged completions */
  flaggedValue: number;
  /** Value for VIP emails received */
  vipValue: number;
  /** Value for urgent emails */
  urgentValue: number;
}

/**
 * Trend direction
 */
export type TrendDirection = 'improving' | 'worsening' | 'stable';

/**
 * Trend data for all tabs
 */
export interface IEmailTrendData {
  /** 7-day trend data points */
  dataPoints: ITrendDataPoint[];
  /** Trend direction for unread tab */
  unreadTrend: TrendDirection;
  /** Trend direction for flagged tab */
  flaggedTrend: TrendDirection;
  /** Trend direction for VIP tab */
  vipTrend: TrendDirection;
  /** Trend direction for urgent tab */
  urgentTrend: TrendDirection;
  /** Average daily unread emails */
  unreadAverage: number;
  /** Average daily flag completions */
  flaggedAverage: number;
  /** Average daily VIP emails */
  vipAverage: number;
  /** Average daily urgent emails */
  urgentAverage: number;
}

// ============================================
// Filter State
// ============================================

/**
 * Active filters state
 */
export interface IEmailFilters {
  vip: boolean;
  flagged: boolean;
  unread: boolean;
  hasAttachments: boolean;
  highPriority: boolean;
}

/**
 * Default filter state (all filters off)
 */
export const DEFAULT_EMAIL_FILTERS: IEmailFilters = {
  vip: false,
  flagged: false,
  unread: false,
  hasAttachments: false,
  highPriority: false,
};

// ============================================
// Settings Interface
// ============================================

/**
 * Email card settings
 */
export interface IEmailCardSettings {
  /** Whether the email card is enabled */
  enabled: boolean;
  /** Maximum items to fetch per tab */
  maxItems: number;
  /** Default tab to show */
  defaultTab: EmailTabType;
  /** Manual VIP email addresses */
  manualVipEmails: string[];
  /** Enable auto VIP detection (manager, direct reports, frequent) */
  enableAutoVipDetection: boolean;
  /** Number of frequent senders to consider as VIP */
  frequentSendersCount: number;
}

/**
 * Default email card settings
 */
export const DEFAULT_EMAIL_CARD_SETTINGS: IEmailCardSettings = {
  enabled: true,
  maxItems: 50,
  defaultTab: 'unread',
  manualVipEmails: [],
  enableAutoVipDetection: true,
  frequentSendersCount: 5,
};
