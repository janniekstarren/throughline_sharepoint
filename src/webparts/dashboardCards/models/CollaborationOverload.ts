// Card #55 — CollaborationOverload data model

import { CardUrgencyState } from './ApprovalBottlenecks';

// ============================================
// Collaboration Metric
// ============================================

export interface CollaborationMetric {
  name: string;
  currentValue: number;
  unit: string;
  benchmarkValue: number;
  percentile: number;
  weight: number;
  trend: 'improving' | 'worsening' | 'stable';
  trendData: { date: string; value: number }[];
}

// ============================================
// Aggregated Data
// ============================================

export interface CollaborationOverloadData {
  compositeScore: number;
  scoreLabel: 'healthy' | 'moderate' | 'elevated' | 'high' | 'critical';
  metrics: {
    meetingHoursPerWeek: CollaborationMetric;
    emailsSentPerDay: CollaborationMetric;
    afterHoursPercentage: CollaborationMetric;
    backToBackMeetingDays: CollaborationMetric;
    uniqueCollaboratorsPerWeek: CollaborationMetric;
    meetingFreeBlocksPerDay: CollaborationMetric;
  };
  burnoutRiskScore?: number;
  predictedTrend?: string;
  weeklyHistory: { week: string; score: number }[];
}

// ============================================
// Urgency Computation
// ============================================

export function computeCollaborationOverloadUrgency(data: CollaborationOverloadData | null): CardUrgencyState {
  if (!data) return 'quiet';
  if (data.compositeScore >= 80) return 'critical';
  if (data.compositeScore >= 60) return 'warning';
  if (data.compositeScore >= 40) return 'active';
  return 'quiet';
}
