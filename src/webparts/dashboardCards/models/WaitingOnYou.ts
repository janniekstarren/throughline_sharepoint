// src/webparts/dashboardCards/models/WaitingOnYou.ts

// ============================================
// Core Conversation Model
// ============================================

export interface StaleConversation {
  id: string;
  conversationType: 'email' | 'teams-chat' | 'teams-channel';
  subject: string;
  preview: string;
  sender: Person;
  receivedDateTime: Date;
  staleDuration: number; // hours
  urgencyScore: number; // 1-10
  urgencyFactors: UrgencyFactor[]; // Explainability
  webUrl: string;

  // For quick reply (Teams only)
  chatId?: string;
  replyToId?: string;

  // Context correlation
  teamId?: string;
  teamName?: string;
  channelId?: string;
  channelName?: string;
  siteId?: string;

  // Detection flags
  isQuestion: boolean;
  hasDeadlineMention: boolean;
  mentionedDates?: Date[];
  isMention: boolean;  // True if user was @mentioned

  // User actions
  snoozedUntil?: Date;
  dismissedAt?: Date;
}

// ============================================
// Urgency Explainability
// ============================================

export interface UrgencyFactor {
  factor: UrgencyFactorType;
  points: number;
  description: string;
}

export type UrgencyFactorType =
  | 'wait-time-extreme'    // > 1 week: +3
  | 'wait-time-high'       // > 3 days: +2
  | 'wait-time-moderate'   // > 2 days: +1
  | 'sender-manager'       // From manager: +2
  | 'sender-direct'        // From direct report: +1
  | 'sender-frequent'      // Frequent collaborator: +1
  | 'sender-external'      // External (client?): +1
  | 'content-question'     // Contains question: +1
  | 'content-deadline'     // Mentions deadline: +2
  | 'content-urgent'       // Contains "urgent"/"asap": +1
  | 'content-mention'      // User was @mentioned: +2
  | 'sla-violation';       // Exceeds user's SLA: +2

// ============================================
// Person Model
// ============================================

export interface Person {
  id: string;              // Graph user ID (resolved from email if needed)
  odataId?: string;        // Original Graph @odata.id
  displayName: string;
  email: string;
  photoUrl?: string;       // Fetched via PhotoService

  // Relationship context
  relationship: PersonRelationship;

  // Historical context
  avgResponseTimeHours?: number; // Your typical response time to this person
}

export type PersonRelationship =
  | 'manager'        // Your manager
  | 'direct-report'  // Reports to you
  | 'frequent'       // Top collaborator (from People API)
  | 'same-team'      // Same M365 group/team membership
  | 'external'       // Outside organization
  | 'other';         // No special relationship

// ============================================
// Team/Project Model
// ============================================

export interface Team {
  id: string;
  displayName: string;
  webUrl: string;
  type: 'team' | 'site' | 'group';
  photoUrl?: string;
}

// ============================================
// Grouped Data Structures
// ============================================

export interface PersonGroup {
  person: Person;
  conversations: StaleConversation[];
  totalWaitHours: number;
  oldestItemDate: Date;
  itemCount: number;
  maxUrgency: number;
  snoozedCount: number;
}

export interface TeamGroup {
  team: Team;
  people: Person[];
  conversations: StaleConversation[];
  totalWaitHours: number;
  oldestItemDate: Date;
  itemCount: number;
  maxUrgency: number;
  snoozedCount: number;
}

export interface GroupedWaitingData {
  // Grouped views
  byPerson: PersonGroup[];
  byTeam: TeamGroup[];

  // Items that couldn't be correlated to a team
  ungroupedByPerson: PersonGroup[];

  // Flat list (all conversations)
  allConversations: StaleConversation[];

  // Summary stats
  totalPeopleWaiting: number;
  totalTeamsAffected: number;
  totalItems: number;
  totalWaitHours: number;
  criticalCount: number;
  snoozedCount: number;
}

// ============================================
// Chart/Trend Data
// ============================================

export interface WaitingDebtDataPoint {
  date: string;
  peopleWaiting: number;
  itemCount: number;
  totalWaitHours: number;
}

export interface WaitingDebtTrend {
  dataPoints: WaitingDebtDataPoint[];
  trend: 'improving' | 'worsening' | 'stable';
  averagePeopleWaiting: number;
  peakDay: string;
}

// ============================================
// User Preferences / SLAs
// ============================================

export interface ResponseTimeSLA {
  relationship: PersonRelationship;
  maxHours: number;
}

export interface UserPreferences {
  slaSettings: ResponseTimeSLA[];
  defaultStaleDurationHours: number;
  includeEmail: boolean;
  includeTeamsChats: boolean;
  includeChannelMessages: boolean;
}

export const DEFAULT_SLA_SETTINGS: ResponseTimeSLA[] = [
  { relationship: 'manager', maxHours: 4 },
  { relationship: 'direct-report', maxHours: 24 },
  { relationship: 'external', maxHours: 24 },
  { relationship: 'frequent', maxHours: 48 },
  { relationship: 'same-team', maxHours: 48 },
  { relationship: 'other', maxHours: 72 },
];

// ============================================
// Snooze & Dismiss Persistence
// ============================================

export interface DismissedItem {
  conversationId: string;
  dismissedAt: Date;
  expiresAt: Date; // 24 hours after dismissal
}

export interface SnoozedItem {
  conversationId: string;
  snoozedAt: Date;
  snoozedUntil: Date;
  reason?: string;
}

export interface PersistedState {
  dismissed: DismissedItem[];
  snoozed: SnoozedItem[];
  lastCleanup: Date;
}

// ============================================
// Component State
// ============================================

export type ViewMode = 'people' | 'teams' | 'list';

export interface WaitingOnYouState {
  data: GroupedWaitingData | null;
  trendData: WaitingDebtTrend | null;
  isLoading: boolean;
  error: Error | null;
  lastRefreshed: Date | null;

  // UI state
  viewMode: ViewMode;
  expandedGroups: Set<string>;

  // Persisted state (from localStorage)
  persistedState: PersistedState;

  // Filters
  filter: WaitingFilter;

  // Dialogs
  snoozeDialogTarget: string | null; // conversationId being snoozed
}

export interface WaitingFilter {
  minStaleDuration: number;
  maxResults: number;
  includeEmail: boolean;
  includeTeamsChats: boolean;
  includeChannelMessages: boolean;
  includeMentions: boolean;  // Include @mentions in Teams chats/channels
  relationshipFilter: PersonRelationship[] | 'all';
  hideSnoozed: boolean;
}

// ============================================
// Cache Types
// ============================================

export interface CacheEntry<T> {
  data: T;
  cachedAt: Date;
  expiresAt: Date;
}

export interface GraphCache {
  manager: CacheEntry<Person | null> | null;
  directReports: CacheEntry<Person[]> | null;
  frequentCollaborators: CacheEntry<Person[]> | null;
  joinedTeams: CacheEntry<Team[]> | null;
  userPhotos: Map<string, CacheEntry<string>>; // userId -> photoUrl
  resolvedUsers: Map<string, CacheEntry<string>>; // email -> userId
}
