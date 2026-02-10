// Card #15 — MeetingPrepGap data model

import { CardUrgencyState } from './ApprovalBottlenecks';

// ============================================
// Unprepared Meeting
// ============================================

export interface UnpreparedMeeting {
  id: string;
  subject: string;
  startDateTime: Date;
  attendeeCount: number;
  organizer: string;
  hoursUntil: number;
  relatedDocuments: { name: string; url: string; lastOpened?: Date; isOpened: boolean }[];
  prepScore: number;
  isHighStakes: boolean;
}

// ============================================
// Aggregated Data
// ============================================

export interface MeetingPrepGapData {
  unpreparedMeetings: UnpreparedMeeting[];
  stats: {
    totalUpcoming: number;
    unpreparedCount: number;
    avgPrepScore: number;
    highStakesUnprepared: number;
  };
}

// ============================================
// Urgency Computation
// ============================================

export function computeMeetingPrepGapUrgency(data: MeetingPrepGapData | null): CardUrgencyState {
  if (!data) return 'quiet';
  if (data.stats.highStakesUnprepared >= 1) return 'warning';
  if (data.stats.unpreparedCount >= 2) return 'active';
  return 'quiet';
}
