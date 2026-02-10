// Card #11 — PeakProductivity data model

import { CardUrgencyState } from './ApprovalBottlenecks';

// ============================================
// Hourly Productivity Profile
// ============================================

export interface HourlyProductivity {
  hour: number;
  productivityScore: number;
  meetingMinutes: number;
  focusMinutes: number;
  tasksCompleted: number;
  emailsSent: number;
  filesEdited: number;
  isPeakHour: boolean;
  isMeetingHeavy: boolean;
  misalignmentScore: number;
}

// ============================================
// Aggregated Data
// ============================================

export interface PeakProductivityData {
  hourlyProfile: HourlyProductivity[];
  stats: {
    peakHours: number[];
    meetingHeavyHours: number[];
    misalignedHours: number[];
    productivityEfficiency: number;
    bestTimeForDeepWork: string;
    worstTimeForMeetings: string;
  };
  heatmapData: { day: string; hour: number; score: number }[];
  trendData: { date: string; value: number }[];
}

// ============================================
// Urgency Computation
// ============================================

export function computePeakProductivityUrgency(data: PeakProductivityData | null): CardUrgencyState {
  if (!data) return 'quiet';
  if (data.stats.misalignedHours.length >= 3 || data.stats.productivityEfficiency < 40) return 'warning';
  if (data.stats.productivityEfficiency < 60) return 'active';
  return 'quiet';
}
