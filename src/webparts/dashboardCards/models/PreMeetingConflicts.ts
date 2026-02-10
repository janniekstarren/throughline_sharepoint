// ============================================
// PreMeetingConflicts - Data Models
// ============================================
// Card #7: "Do I have scheduling disasters coming?"
// Detects double-bookings, triple-bookings, and
// back-to-back meetings in the next 48 hours.

// ============================================
// Core Types
// ============================================

export type ConflictType = 'overlap' | 'back-to-back' | 'triple-booking';
export type ConflictSeverity = 'high' | 'medium' | 'low';

// ============================================
// Meeting (lightweight calendar event)
// ============================================

export interface ConflictMeeting {
  id: string;
  subject: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  isOnline: boolean;
  organizer: string;
  attendeeCount: number;
  importance: 'low' | 'normal' | 'high';
  webUrl: string;
  isAllDay: boolean;
}

// ============================================
// Conflict
// ============================================

export interface MeetingConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  meetings: ConflictMeeting[];
  overlapMinutes: number; // 0 for back-to-back
  gapMinutes: number;     // 0 for overlap, transition time for back-to-back
  suggestedAction: string;
  timeSlot: string;       // e.g. "Today 2:00 PM - 3:30 PM"
}

// ============================================
// Aggregated Data
// ============================================

export interface PreMeetingConflictsStats {
  totalConflicts: number;
  overlapCount: number;
  backToBackCount: number;
  tripleBookingCount: number;
  affectedHours: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface PreMeetingConflictsData {
  conflicts: MeetingConflict[];
  stats: PreMeetingConflictsStats;
  trendData: TrendDataPoint[];
}

// ============================================
// Urgency Computation
// ============================================

export type CardUrgencyState = 'critical' | 'warning' | 'active' | 'quiet';

export function computeConflictsUrgency(data: PreMeetingConflictsData | null): CardUrgencyState {
  if (!data || data.stats.totalConflicts === 0) return 'quiet';
  if (data.stats.tripleBookingCount >= 1 || data.stats.overlapCount >= 3) return 'critical';
  if (data.stats.overlapCount >= 1 || data.stats.backToBackCount >= 3) return 'warning';
  if (data.stats.totalConflicts >= 1) return 'active';
  return 'quiet';
}
