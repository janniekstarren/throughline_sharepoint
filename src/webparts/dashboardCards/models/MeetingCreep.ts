// Card #76 — MeetingCreep data model

import { CardUrgencyState } from './ApprovalBottlenecks';

// ============================================
// Monthly Meeting Breakdown
// ============================================

export interface MeetingCreepMonth {
  month: string;
  totalMeetingHours: number;
  recurringHours: number;
  adhocHours: number;
  avgMeetingDuration: number;
  meetingCount: number;
  attendeeAvg: number;
  oneOnOneHours: number;
  groupMeetingHours: number;
}

// ============================================
// Aggregated Data
// ============================================

export interface MeetingCreepData {
  months: MeetingCreepMonth[];
  stats: {
    currentMonthHours: number;
    sixMonthsAgoHours: number;
    changePercent: number;
    recurringGrowthPercent: number;
    adhocGrowthPercent: number;
    projectedNextMonth: number;
    tippingPointWeeks?: number;
    biggestGrowthCategory: string;
  };
  trendLine: { month: string; actual: number; projected?: number }[];
}

// ============================================
// Urgency Computation
// ============================================

export function computeMeetingCreepUrgency(data: MeetingCreepData | null): CardUrgencyState {
  if (!data) return 'quiet';
  if (data.stats.changePercent > 30 || data.stats.currentMonthHours > 25) return 'critical';
  if (data.stats.changePercent > 15 || data.stats.currentMonthHours > 20) return 'warning';
  if (data.stats.changePercent > 5) return 'active';
  return 'quiet';
}
