// ============================================
// Meeting Creep - Demo/Test Data
// ============================================
// Deterministic demo data for Card #76.
// All dates relative to now for realistic display.

import {
  MeetingCreepData,
  MeetingCreepMonth,
} from '../../models/MeetingCreep';

// ============================================
// Generator
// ============================================

export function generateMeetingCreepDemoData(): MeetingCreepData {
  const now = new Date();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Generate month labels for the last 6 months (inclusive of current)
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(monthNames[d.getMonth()]);
  }

  // 6 months of data: 16 -> 17 -> 18 -> 19 -> 21 -> 22 hrs/week
  // Recurring grew from 10 to 12.5 (+25%)
  // Ad-hoc grew from 5 to 8 (+60%)
  // Remaining is 1:1 (relatively stable ~1.5)
  const monthlyData: MeetingCreepMonth[] = [
    {
      month: monthLabels[0],
      totalMeetingHours: 16,
      recurringHours: 10,
      adhocHours: 5,
      avgMeetingDuration: 48,
      meetingCount: 20,
      attendeeAvg: 5.2,
      oneOnOneHours: 1,
      groupMeetingHours: 15,
    },
    {
      month: monthLabels[1],
      totalMeetingHours: 17,
      recurringHours: 10.5,
      adhocHours: 5.5,
      avgMeetingDuration: 49,
      meetingCount: 21,
      attendeeAvg: 5.4,
      oneOnOneHours: 1,
      groupMeetingHours: 16,
    },
    {
      month: monthLabels[2],
      totalMeetingHours: 18,
      recurringHours: 11,
      adhocHours: 6,
      avgMeetingDuration: 50,
      meetingCount: 22,
      attendeeAvg: 5.5,
      oneOnOneHours: 1,
      groupMeetingHours: 17,
    },
    {
      month: monthLabels[3],
      totalMeetingHours: 19,
      recurringHours: 11.5,
      adhocHours: 6.5,
      avgMeetingDuration: 51,
      meetingCount: 23,
      attendeeAvg: 5.8,
      oneOnOneHours: 1,
      groupMeetingHours: 18,
    },
    {
      month: monthLabels[4],
      totalMeetingHours: 21,
      recurringHours: 12,
      adhocHours: 7.5,
      avgMeetingDuration: 52,
      meetingCount: 25,
      attendeeAvg: 6.0,
      oneOnOneHours: 1.5,
      groupMeetingHours: 19.5,
    },
    {
      month: monthLabels[5],
      totalMeetingHours: 22,
      recurringHours: 12.5,
      adhocHours: 8,
      avgMeetingDuration: 53,
      meetingCount: 26,
      attendeeAvg: 6.2,
      oneOnOneHours: 1.5,
      groupMeetingHours: 20.5,
    },
  ];

  // Trend line with projection for next month
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthLabel = monthNames[nextMonthDate.getMonth()];

  const trendLine = [
    ...monthLabels.map((label, i) => ({
      month: label,
      actual: monthlyData[i].totalMeetingHours,
    })),
    {
      month: nextMonthLabel,
      actual: 22, // last known
      projected: 24, // projected next month
    },
  ];

  return {
    months: monthlyData,
    stats: {
      currentMonthHours: 22,
      sixMonthsAgoHours: 16,
      changePercent: 37, // +37% growth
      recurringGrowthPercent: 25,
      adhocGrowthPercent: 60,
      projectedNextMonth: 24,
      tippingPointWeeks: 8, // at current rate, will hit 25+ hrs in ~8 weeks
      biggestGrowthCategory: 'Ad-hoc meetings',
    },
    trendLine,
  };
}
