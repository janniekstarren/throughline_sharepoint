// Card #16 — EmailResponse data model

import { CardUrgencyState } from './ApprovalBottlenecks';

// ============================================
// Response Pattern Group
// ============================================

export interface ResponsePatternGroup {
  groupLabel: string;
  avgResponseMinutes: number;
  medianResponseMinutes: number;
  emailCount: number;
  slowestResponse: { subject: string; responseHours: number };
  trendVsLastMonth: number;
}

// ============================================
// Aggregated Data
// ============================================

export interface EmailResponseData {
  groups: ResponsePatternGroup[];
  stats: {
    overallAvgMinutes: number;
    overallMedianMinutes: number;
    fastestGroup: string;
    slowestGroup: string;
    unansweredOver24h: number;
    totalAnalysed: number;
  };
  hourlyResponsePattern: { hour: number; avgResponseMinutes: number }[];
  trendData: { date: string; value: number }[];
}

// ============================================
// Urgency Computation
// ============================================

export function computeEmailResponseUrgency(data: EmailResponseData | null): CardUrgencyState {
  if (!data) return 'quiet';
  if (data.stats.unansweredOver24h >= 10) return 'warning';
  if (data.stats.unansweredOver24h >= 5) return 'active';
  return 'quiet';
}
