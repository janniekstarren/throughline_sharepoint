// ============================================
// Email Response - Demo/Test Data
// ============================================
// Deterministic demo data for Card #16.
// All dates relative to now for realistic display.

import {
  EmailResponseData,
  ResponsePatternGroup,
} from '../../models/EmailResponse';

// ============================================
// Generator
// ============================================

export function generateEmailResponseDemoData(): EmailResponseData {
  const groups: ResponsePatternGroup[] = [
    {
      groupLabel: 'Manager',
      avgResponseMinutes: 23,
      medianResponseMinutes: 18,
      emailCount: 28,
      slowestResponse: {
        subject: 'Re: Q1 Budget Revisions — Need Your Sign-Off',
        responseHours: 3.2,
      },
      trendVsLastMonth: -8, // 8% faster
    },
    {
      groupLabel: 'Direct Reports',
      avgResponseMinutes: 45,
      medianResponseMinutes: 32,
      emailCount: 64,
      slowestResponse: {
        subject: 'Re: PTO Request — December Holidays',
        responseHours: 8.5,
      },
      trendVsLastMonth: 5, // 5% slower
    },
    {
      groupLabel: 'External',
      avgResponseMinutes: 252, // 4.2 hours
      medianResponseMinutes: 180,
      emailCount: 35,
      slowestResponse: {
        subject: 'Re: Partnership Proposal — DataViz Ltd',
        responseHours: 26.4,
      },
      trendVsLastMonth: 12, // 12% slower
    },
    {
      groupLabel: 'Other Internal',
      avgResponseMinutes: 126, // 2.1 hours
      medianResponseMinutes: 95,
      emailCount: 42,
      slowestResponse: {
        subject: 'Re: Office Move Logistics — Floor Plan Review',
        responseHours: 14.8,
      },
      trendVsLastMonth: -2, // 2% faster
    },
  ];

  // Hourly response pattern — fastest at 9-10am
  const hourlyResponsePattern = [
    { hour: 8, avgResponseMinutes: 35 },
    { hour: 9, avgResponseMinutes: 12 },
    { hour: 10, avgResponseMinutes: 15 },
    { hour: 11, avgResponseMinutes: 28 },
    { hour: 12, avgResponseMinutes: 65 },
    { hour: 13, avgResponseMinutes: 45 },
    { hour: 14, avgResponseMinutes: 22 },
    { hour: 15, avgResponseMinutes: 30 },
    { hour: 16, avgResponseMinutes: 48 },
    { hour: 17, avgResponseMinutes: 72 },
  ];

  // Weekly trend (avg response minutes)
  const trendData = [
    { date: 'Mon', value: 55 },
    { date: 'Tue', value: 48 },
    { date: 'Wed', value: 62 },
    { date: 'Thu', value: 45 },
    { date: 'Fri', value: 78 },
    { date: 'Sat', value: 0 },
    { date: 'Sun', value: 0 },
  ];

  const totalEmails = groups.reduce((sum, g) => sum + g.emailCount, 0);
  const weightedAvg = Math.round(
    groups.reduce((sum, g) => sum + g.avgResponseMinutes * g.emailCount, 0) / totalEmails
  );
  const weightedMedian = Math.round(
    groups.reduce((sum, g) => sum + g.medianResponseMinutes * g.emailCount, 0) / totalEmails
  );

  return {
    groups,
    stats: {
      overallAvgMinutes: weightedAvg,
      overallMedianMinutes: weightedMedian,
      fastestGroup: 'Manager',
      slowestGroup: 'External',
      unansweredOver24h: 6,
      totalAnalysed: totalEmails,
    },
    hourlyResponsePattern,
    trendData,
  };
}
