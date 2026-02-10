// Card #13 — AfterHoursFootprint data model

import { CardUrgencyState } from './ApprovalBottlenecks';

// ============================================
// Daily After-Hours Record
// ============================================

export interface AfterHoursDay {
  date: Date;
  dayLabel: string;
  afterHoursMinutes: number;
  activities: { type: 'email' | 'teams' | 'file'; count: number; latestTimestamp: Date }[];
  isWeekend: boolean;
}

// ============================================
// Aggregated Data
// ============================================

export interface AfterHoursData {
  days: AfterHoursDay[];
  stats: {
    avgAfterHoursPerWeek: number;
    afterHoursPercentage: number;
    weekendDaysWorked: number;
    latestActivityTime: string;
    trendVsLastMonth: number;
    consecutiveAfterHoursDays: number;
  };
  weeklyTrend: { date: string; value: number }[];
  hourlyDistribution: { hour: number; count: number }[];
}

// ============================================
// Urgency Computation
// ============================================

export function computeAfterHoursUrgency(data: AfterHoursData | null): CardUrgencyState {
  if (!data) return 'quiet';
  if (data.stats.afterHoursPercentage > 25 || data.stats.consecutiveAfterHoursDays >= 5) return 'critical';
  if (data.stats.afterHoursPercentage > 15 || data.stats.weekendDaysWorked >= 3) return 'warning';
  if (data.stats.afterHoursPercentage > 5) return 'active';
  return 'quiet';
}
