// ============================================
// Shared Models
// Common types used across WaitingOnYou and WaitingOnOthers
// ============================================

// ============================================
// Person & Relationship Types
// ============================================

/**
 * Relationship types between the current user and another person
 */
export type PersonRelationship =
  | 'manager'        // Your manager
  | 'direct-report'  // Reports to you
  | 'frequent'       // Top collaborator (from People API)
  | 'same-team'      // Same M365 group/team membership
  | 'external'       // Outside organization
  | 'other';         // Other internal colleague

/**
 * Core person information
 */
export interface Person {
  id: string;              // Graph user ID (resolved from email if needed)
  odataId?: string;        // Original Graph @odata.id
  displayName: string;
  email: string;
  photoUrl?: string;       // Fetched via PhotoService
  relationship: PersonRelationship;
  avgResponseTimeHours?: number; // Typical response time for this person
}

// ============================================
// Message Source Types
// ============================================

/**
 * Types of message sources
 */
export type MessageSourceType = 'email' | 'teams-chat' | 'teams-channel';

/**
 * Common message source information
 */
export interface MessageSource {
  type: MessageSourceType;
  id: string;
  conversationId?: string;
  webUrl?: string;
}

// ============================================
// Base Filter Types
// ============================================

/**
 * Base filter settings shared by both Waiting cards
 */
export interface BaseFilter {
  maxResults: number;
  includeEmail: boolean;
  includeTeamsChats: boolean;
  includeChannelMessages: boolean;
  includeMentions: boolean;
  hideSnoozed: boolean;
}

/**
 * Extended filter with relationship filtering
 */
export interface FilterWithRelationship extends BaseFilter {
  relationshipFilter: PersonRelationship[] | 'all';
}

// ============================================
// Snooze Types
// ============================================

/**
 * Information about a snoozed item
 */
export interface SnoozeInfo {
  conversationId: string;
  snoozedUntil: Date;
  snoozedAt: Date;
}

// ============================================
// Time Duration Helpers
// ============================================

/**
 * Standard wait time thresholds (in hours)
 */
export const WAIT_TIME_THRESHOLDS = {
  SHORT: 4,          // < 4 hours
  MEDIUM: 24,        // 4-24 hours (1 day)
  LONG: 72,          // 1-3 days
  VERY_LONG: 168,    // 3-7 days (1 week)
  CRITICAL: 336      // > 2 weeks
} as const;

/**
 * Get urgency level based on hours waiting
 */
export function getWaitUrgencyLevel(hoursWaiting: number): 'low' | 'medium' | 'high' | 'critical' {
  if (hoursWaiting < WAIT_TIME_THRESHOLDS.MEDIUM) return 'low';
  if (hoursWaiting < WAIT_TIME_THRESHOLDS.LONG) return 'medium';
  if (hoursWaiting < WAIT_TIME_THRESHOLDS.VERY_LONG) return 'high';
  return 'critical';
}

/**
 * Format hours into human readable duration
 */
export function formatWaitDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  if (hours < 24) {
    return `${Math.round(hours)}h`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week';
  return `${weeks} weeks`;
}

// ============================================
// Grouped Data Base Types
// ============================================

/**
 * Base structure for person-grouped data
 */
export interface BasePersonGroup<T> {
  person: Person;
  items: T[];
  totalWaitHours: number;
  oldestItemDate: Date;
  itemCount: number;
}

// ============================================
// Response Time SLA Types
// ============================================

/**
 * Service Level Agreement for response times based on relationship
 */
export interface ResponseTimeSLA {
  relationship: PersonRelationship;
  maxHours: number;
}

/**
 * Default SLA values
 */
export const DEFAULT_SLAS: ResponseTimeSLA[] = [
  { relationship: 'manager', maxHours: 4 },
  { relationship: 'direct-report', maxHours: 8 },
  { relationship: 'frequent', maxHours: 24 },
  { relationship: 'same-team', maxHours: 24 },
  { relationship: 'external', maxHours: 48 },
  { relationship: 'other', maxHours: 48 }
];

/**
 * Get SLA hours for a given relationship
 */
export function getSlaHours(relationship: PersonRelationship, customSlas?: ResponseTimeSLA[]): number {
  const slas = customSlas || DEFAULT_SLAS;
  const sla = slas.find(s => s.relationship === relationship);
  return sla?.maxHours ?? 24;
}

/**
 * Check if response time exceeds SLA
 */
export function isOverSla(hoursWaiting: number, relationship: PersonRelationship, customSlas?: ResponseTimeSLA[]): boolean {
  return hoursWaiting > getSlaHours(relationship, customSlas);
}
