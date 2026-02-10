// ============================================
// After-Hours Footprint - Demo/Test Data
// ============================================
// Deterministic demo data for Card #13.
// All dates relative to now for realistic display.

import {
  AfterHoursData,
  AfterHoursDay,
} from '../../models/AfterHoursFootprint';

// ============================================
// Generator
// ============================================

export function generateAfterHoursFootprintDemoData(): AfterHoursData {
  const now = new Date();

  // Generate 14 days of after-hours data going backwards from today
  const days: AfterHoursDay[] = [];

  // Deterministic daily patterns for 14 days (index 0 = 13 days ago, index 13 = today)
  // Each entry: [afterHoursMinutes, isWeekend, emailCount, teamsCount, fileCount, latestHour, latestMinute]
  const dailyData: [number, boolean, number, number, number, number, number][] = [
    [0,   true,   0, 0, 0, 0,  0],   // Day -13 (weekend, off)
    [45,  true,   3, 1, 0, 19, 15],   // Day -12 (weekend, worked)
    [30,  false,  2, 1, 0, 18, 45],   // Day -11
    [55,  false,  4, 2, 1, 20, 30],   // Day -10
    [40,  false,  3, 1, 0, 19, 20],   // Day -9
    [65,  false,  5, 3, 1, 21, 15],   // Day -8
    [0,   false,  0, 0, 0, 0,  0],    // Day -7 (no after-hours)
    [0,   true,   0, 0, 0, 0,  0],    // Day -6 (weekend, off)
    [90,  true,   4, 2, 1, 22, 47],   // Day -5 (weekend, worked — latest 10:47 PM)
    [50,  false,  3, 2, 0, 20, 10],   // Day -4 (start of consecutive streak)
    [75,  false,  5, 3, 1, 21, 45],   // Day -3
    [60,  false,  4, 2, 1, 20, 55],   // Day -2
    [35,  false,  2, 1, 0, 19, 30],   // Day -1 (end of 4-day consecutive streak)
    [20,  false,  1, 1, 0, 18, 30],   // Day 0 (today)
  ];

  for (let i = 0; i < dailyData.length; i++) {
    const [mins, isWeekend, emails, teams, files, latestH, latestM] = dailyData[i];
    const daysAgo = 13 - i;
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    date.setHours(0, 0, 0, 0);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayLabel = dayNames[date.getDay()];

    const activities: { type: 'email' | 'teams' | 'file'; count: number; latestTimestamp: Date }[] = [];

    if (emails > 0) {
      const ts = new Date(date);
      ts.setHours(latestH, latestM - 10, 0, 0);
      activities.push({ type: 'email', count: emails, latestTimestamp: ts });
    }
    if (teams > 0) {
      const ts = new Date(date);
      ts.setHours(latestH, latestM - 5, 0, 0);
      activities.push({ type: 'teams', count: teams, latestTimestamp: ts });
    }
    if (files > 0) {
      const ts = new Date(date);
      ts.setHours(latestH, latestM, 0, 0);
      activities.push({ type: 'file', count: files, latestTimestamp: ts });
    }

    days.push({
      date,
      dayLabel,
      afterHoursMinutes: mins,
      activities,
      isWeekend,
    });
  }

  // Hourly distribution for 6pm-midnight
  const hourlyDistribution = [
    { hour: 18, count: 12 },
    { hour: 19, count: 10 },
    { hour: 20, count: 8 },
    { hour: 21, count: 5 },
    { hour: 22, count: 2 },
    { hour: 23, count: 1 },
  ];

  // Weekly trend (last 4 weeks, after-hours in minutes per week)
  const weeklyTrend = [
    { date: 'Week -3', value: 2.8 },
    { date: 'Week -2', value: 3.0 },
    { date: 'Week -1', value: 3.5 },
    { date: 'This Week', value: 3.2 },
  ];

  return {
    days,
    stats: {
      avgAfterHoursPerWeek: 3.2,
      afterHoursPercentage: 18,
      weekendDaysWorked: 2,
      latestActivityTime: '10:47 PM',
      trendVsLastMonth: 8, // 8% increase
      consecutiveAfterHoursDays: 4,
    },
    weeklyTrend,
    hourlyDistribution,
  };
}
