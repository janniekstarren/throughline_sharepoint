// ============================================
// "Waiting On Others" - Data Models
// Shows who owes the user a response
// ============================================

// ============================================
// Person Model (shared with WaitingOnYou)
// ============================================

export type PersonRelationship =
  | 'manager'
  | 'direct-report'
  | 'frequent'
  | 'same-team'
  | 'external'
  | 'other';

export interface Person {
  id: string;
  displayName: string;
  email: string;
  photoUrl?: string;
  relationship: PersonRelationship;
  isVip?: boolean;  // VIP contacts (executives, key stakeholders)
}

// ============================================
// Core Pending Response Model
// ============================================

export interface PendingResponse {
  id: string;
  conversationType: 'email' | 'teams-chat' | 'teams-channel';
  subject: string;
  preview: string;               // What you sent
  recipient: Person;             // Who owes you a response
  sentDateTime: Date;
  waitingDuration: number;       // hours since sent
  webUrl: string;

  // For reminder sending
  conversationId?: string;
  chatId?: string;
  threadId?: string;

  // Context
  teamId?: string;
  teamName?: string;
  channelId?: string;
  channelName?: string;

  // Detection flags
  wasQuestion: boolean;          // Did you ask a question?
  requestedAction: boolean;      // Did you request something?
  mentionedDeadline: boolean;    // Did you mention a deadline?

  // User actions
  snoozedUntil?: Date;
  reminderSentAt?: Date;
  reminderCount: number;
}

// ============================================
// Grouped Data Structures
// ============================================

export interface PersonOwesGroup {
  person: Person;
  pendingItems: PendingResponse[];
  totalWaitHours: number;
  longestWaitHours: number;
  oldestItemDate: Date;
  itemCount: number;
  snoozedCount: number;
  reminderSentCount: number;     // Items where reminder was sent
}

export interface GroupedPendingData {
  byPerson: PersonOwesGroup[];
  allPendingItems: PendingResponse[];
  snoozedItems?: PendingResponse[];  // Items that are currently snoozed

  // Summary stats
  totalPeopleOwing: number;
  totalItems: number;
  totalWaitHours: number;
  oldestWaitDays: number;
  snoozedCount: number;
}

// ============================================
// Chart/Trend Data
// ============================================

export interface PendingTrendDataPoint {
  date: string;
  peopleOwing: number;
  itemCount: number;
  avgWaitDays: number;
}

export interface PendingTrendData {
  dataPoints: PendingTrendDataPoint[];
  trend: 'improving' | 'worsening' | 'stable';
  averagePeopleOwing: number;
  longestCurrentWait: number;
}

// ============================================
// Reminder Templates
// ============================================

export interface ReminderTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  tone: 'gentle' | 'neutral' | 'firm';
}

export const DEFAULT_REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'gentle-nudge',
    name: 'Gentle nudge',
    subject: 'Re: {originalSubject}',
    body: `Hi {firstName},\n\nJust wanted to follow up on my previous message. No rush if you're busy - just wanted to make sure it didn't get lost.\n\nThanks!`,
    tone: 'gentle'
  },
  {
    id: 'checking-in',
    name: 'Checking in',
    subject: 'Re: {originalSubject}',
    body: `Hi {firstName},\n\nChecking in on this - do you have any updates?\n\nThanks!`,
    tone: 'neutral'
  },
  {
    id: 'need-response',
    name: 'Need response',
    subject: 'Re: {originalSubject}',
    body: `Hi {firstName},\n\nI need your input on this to move forward. Could you please get back to me when you have a moment?\n\nThanks!`,
    tone: 'firm'
  }
];

// ============================================
// Persistence
// ============================================

export interface ResolvedItem {
  pendingId: string;
  resolvedAt: Date;
  resolution: 'responded' | 'gave-up' | 'no-longer-needed';
}

export interface SnoozedPendingItem {
  pendingId: string;
  snoozedAt: Date;
  snoozedUntil: Date;
  reason?: string;
}

export interface ReminderSent {
  pendingId: string;
  sentAt: Date;
  template: string;
}

export interface WaitingOnOthersPersistedState {
  resolved: ResolvedItem[];
  snoozed: SnoozedPendingItem[];
  remindersSent: ReminderSent[];
  lastCleanup: Date;
}

// ============================================
// Component State
// ============================================

export type ViewMode = 'people' | 'list' | 'snoozed';

export type SortMode = 'priority' | 'name' | 'oldest' | 'newest';

export interface WaitingOnOthersState {
  data: GroupedPendingData | null;
  trendData: PendingTrendData | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;

  // UI state
  viewMode: ViewMode;
  expandedGroups: Set<string>;

  // Persisted state
  persistedState: WaitingOnOthersPersistedState;

  // Filters
  filter: PendingFilter;

  // Dialogs
  reminderTarget: PendingResponse | null;
}

export interface PendingFilter {
  minWaitDuration: number;       // hours, default 24
  maxResults: number;
  includeEmail: boolean;
  includeTeamsChats: boolean;
  includeChannelMessages: boolean;
  includeMentions: boolean;      // Include @mentions in Teams messages
  hideSnoozed: boolean;
  hideReminded: boolean;         // Hide items where reminder already sent
}

// ============================================
// Default Values
// ============================================

export const DEFAULT_PENDING_FILTER: PendingFilter = {
  minWaitDuration: 24,
  maxResults: 50,
  includeEmail: true,
  includeTeamsChats: true,
  includeChannelMessages: false,
  includeMentions: true,
  hideSnoozed: false,
  hideReminded: false
};

export const getDefaultPersistedState = (): WaitingOnOthersPersistedState => ({
  resolved: [],
  snoozed: [],
  remindersSent: [],
  lastCleanup: new Date()
});
