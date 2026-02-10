// ============================================
// Collaboration Overload - Demo/Test Data
// ============================================
// Deterministic demo data for Card #55.
// All dates relative to now for realistic display.

import {
  CollaborationOverloadData,
  CollaborationMetric,
} from '../../models/CollaborationOverload';

// ============================================
// Helper: build a metric with 8-week trend
// ============================================

function buildMetric(
  name: string,
  currentValue: number,
  unit: string,
  benchmarkValue: number,
  percentile: number,
  weight: number,
  trend: 'improving' | 'worsening' | 'stable',
  weeklyValues: number[]
): CollaborationMetric {
  return {
    name,
    currentValue,
    unit,
    benchmarkValue,
    percentile,
    weight,
    trend,
    trendData: weeklyValues.map((v, i) => ({
      date: `Week -${7 - i}`,
      value: v,
    })),
  };
}

// ============================================
// Generator
// ============================================

export function generateCollaborationOverloadDemoData(): CollaborationOverloadData {
  const metrics = {
    meetingHoursPerWeek: buildMetric(
      'Meeting Hours / Week',
      22,
      'hrs/wk',
      15,
      78,
      0.25,
      'worsening',
      [16, 17, 18, 18, 19, 20, 21, 22]
    ),
    emailsSentPerDay: buildMetric(
      'Emails Sent / Day',
      45,
      'emails/day',
      30,
      72,
      0.15,
      'worsening',
      [32, 34, 36, 38, 40, 42, 43, 45]
    ),
    afterHoursPercentage: buildMetric(
      'After-Hours Work',
      18,
      '%',
      10,
      68,
      0.20,
      'worsening',
      [10, 12, 13, 14, 15, 16, 17, 18]
    ),
    backToBackMeetingDays: buildMetric(
      'Back-to-Back Meeting Days',
      3,
      'days/wk',
      1,
      82,
      0.15,
      'stable',
      [2, 2, 3, 2, 3, 3, 3, 3]
    ),
    uniqueCollaboratorsPerWeek: buildMetric(
      'Unique Collaborators',
      42,
      'people/wk',
      25,
      75,
      0.10,
      'worsening',
      [28, 30, 32, 34, 36, 38, 40, 42]
    ),
    meetingFreeBlocksPerDay: buildMetric(
      'Meeting-Free Blocks / Day',
      1.2,
      'blocks/day',
      3,
      25,
      0.15,
      'worsening',
      [2.5, 2.2, 2.0, 1.8, 1.6, 1.5, 1.3, 1.2]
    ),
  };

  // 8-week composite score history — gradual increase
  const weeklyHistory = [
    { week: 'Week -7', score: 42 },
    { week: 'Week -6', score: 45 },
    { week: 'Week -5', score: 50 },
    { week: 'Week -4', score: 53 },
    { week: 'Week -3', score: 58 },
    { week: 'Week -2', score: 62 },
    { week: 'Week -1', score: 65 },
    { week: 'This Week', score: 68 },
  ];

  return {
    compositeScore: 68,
    scoreLabel: 'elevated',
    metrics,
    burnoutRiskScore: 55,
    predictedTrend: 'Score projected to reach 75 within 3 weeks if current trajectory continues',
    weeklyHistory,
  };
}
