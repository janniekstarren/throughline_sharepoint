// ============================================
// Peak Productivity - Demo/Test Data
// ============================================
// Deterministic demo data for Card #11.
// All dates relative to now for realistic display.

import {
  PeakProductivityData,
  HourlyProductivity,
} from '../../models/PeakProductivity';

// ============================================
// Generator
// ============================================

export function generatePeakProductivityDemoData(): PeakProductivityData {
  // Hourly productivity profile for 8am-6pm
  // Peak hours at 9-10am and 2-3pm
  // Meeting-heavy hours 10am-12pm and 3-4pm
  const hourlyProfile: HourlyProductivity[] = [
    {
      hour: 8,
      productivityScore: 55,
      meetingMinutes: 0,
      focusMinutes: 50,
      tasksCompleted: 2,
      emailsSent: 5,
      filesEdited: 1,
      isPeakHour: false,
      isMeetingHeavy: false,
      misalignmentScore: 0,
    },
    {
      hour: 9,
      productivityScore: 88,
      meetingMinutes: 0,
      focusMinutes: 55,
      tasksCompleted: 5,
      emailsSent: 3,
      filesEdited: 3,
      isPeakHour: true,
      isMeetingHeavy: false,
      misalignmentScore: 0,
    },
    {
      hour: 10,
      productivityScore: 82,
      meetingMinutes: 45,
      focusMinutes: 10,
      tasksCompleted: 3,
      emailsSent: 4,
      filesEdited: 2,
      isPeakHour: true,
      isMeetingHeavy: true,
      misalignmentScore: 7, // High-value hour wasted on meetings
    },
    {
      hour: 11,
      productivityScore: 48,
      meetingMinutes: 50,
      focusMinutes: 5,
      tasksCompleted: 1,
      emailsSent: 2,
      filesEdited: 0,
      isPeakHour: false,
      isMeetingHeavy: true,
      misalignmentScore: 3,
    },
    {
      hour: 12,
      productivityScore: 30,
      meetingMinutes: 0,
      focusMinutes: 15,
      tasksCompleted: 0,
      emailsSent: 1,
      filesEdited: 0,
      isPeakHour: false,
      isMeetingHeavy: false,
      misalignmentScore: 0,
    },
    {
      hour: 13,
      productivityScore: 52,
      meetingMinutes: 15,
      focusMinutes: 30,
      tasksCompleted: 2,
      emailsSent: 3,
      filesEdited: 1,
      isPeakHour: false,
      isMeetingHeavy: false,
      misalignmentScore: 0,
    },
    {
      hour: 14,
      productivityScore: 85,
      meetingMinutes: 0,
      focusMinutes: 50,
      tasksCompleted: 4,
      emailsSent: 2,
      filesEdited: 3,
      isPeakHour: true,
      isMeetingHeavy: false,
      misalignmentScore: 0,
    },
    {
      hour: 15,
      productivityScore: 78,
      meetingMinutes: 40,
      focusMinutes: 15,
      tasksCompleted: 2,
      emailsSent: 3,
      filesEdited: 1,
      isPeakHour: true,
      isMeetingHeavy: true,
      misalignmentScore: 6, // Another high-value hour with meetings
    },
    {
      hour: 16,
      productivityScore: 42,
      meetingMinutes: 30,
      focusMinutes: 20,
      tasksCompleted: 1,
      emailsSent: 4,
      filesEdited: 0,
      isPeakHour: false,
      isMeetingHeavy: false,
      misalignmentScore: 0,
    },
    {
      hour: 17,
      productivityScore: 35,
      meetingMinutes: 0,
      focusMinutes: 25,
      tasksCompleted: 1,
      emailsSent: 6,
      filesEdited: 0,
      isPeakHour: false,
      isMeetingHeavy: false,
      misalignmentScore: 0,
    },
  ];

  // Heatmap data for Mon-Fri x 8am-6pm
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const heatmapData: { day: string; hour: number; score: number }[] = [];

  // Deterministic scores per day/hour — seeded pattern
  const seedScores: number[][] = [
    // Mon: moderate morning, heavy meetings mid-day
    [50, 85, 40, 35, 25, 55, 80, 45, 38, 30],
    // Tue: good focus morning
    [60, 90, 88, 42, 30, 50, 75, 70, 40, 32],
    // Wed: meeting-heavy day
    [45, 35, 30, 28, 25, 40, 55, 50, 35, 28],
    // Thu: balanced
    [55, 82, 78, 45, 28, 52, 85, 80, 42, 35],
    // Fri: strong morning, early fade
    [65, 92, 85, 50, 30, 48, 72, 55, 30, 22],
  ];

  for (let d = 0; d < days.length; d++) {
    for (let h = 0; h < 10; h++) {
      heatmapData.push({
        day: days[d],
        hour: 8 + h,
        score: seedScores[d][h],
      });
    }
  }

  // Weekly trend (last 7 days productivity average)
  const trendData = [
    { date: 'Mon', value: 58 },
    { date: 'Tue', value: 65 },
    { date: 'Wed', value: 42 },
    { date: 'Thu', value: 62 },
    { date: 'Fri', value: 68 },
    { date: 'Sat', value: 0 },
    { date: 'Sun', value: 0 },
  ];

  return {
    hourlyProfile,
    stats: {
      peakHours: [9, 10, 14, 15],
      meetingHeavyHours: [10, 11, 15, 16],
      misalignedHours: [10, 15], // 2 misaligned hours
      productivityEfficiency: 62,
      bestTimeForDeepWork: '9:00 AM - 10:00 AM',
      worstTimeForMeetings: '9:00 AM - 10:00 AM',
    },
    heatmapData,
    trendData,
  };
}
