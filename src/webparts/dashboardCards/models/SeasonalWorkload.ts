// Card #75 — SeasonalWorkload data model

import { CardUrgencyState } from './ApprovalBottlenecks';

// ============================================
// Seasonal Period
// ============================================

export interface SeasonalPeriod {
  monthLabel: string;
  historicalAvgMeetingHours: number;
  historicalAvgEmailVolume: number;
  historicalWorkloadScore: number;
  predictedWorkloadScore: number;
  isUpcoming: boolean;
  isPeak: boolean;
  annotation?: string;
}

// ============================================
// Aggregated Data
// ============================================

export interface SeasonalWorkloadData {
  months: SeasonalPeriod[];
  currentMonth: number;
  stats: {
    nextPeakMonth: string;
    nextPeakScore: number;
    weeksUntilNextPeak: number;
    currentMonthVsAvg: number;
    highestMonth: string;
    lowestMonth: string;
  };
  yearOverYearComparison?: { month: string; thisYear: number; lastYear: number }[];
}

// ============================================
// Urgency Computation
// ============================================

export function computeSeasonalWorkloadUrgency(data: SeasonalWorkloadData | null): CardUrgencyState {
  if (!data) return 'quiet';
  if (data.stats.weeksUntilNextPeak <= 2 && data.stats.nextPeakScore >= 75) return 'warning';
  if (data.stats.weeksUntilNextPeak <= 4 && data.stats.nextPeakScore >= 80) return 'active';
  return 'quiet';
}
