// ============================================
// Seasonal Workload - Demo/Test Data
// ============================================
// Deterministic demo data for Card #75.
// All dates relative to now for realistic display.

import {
  SeasonalWorkloadData,
  SeasonalPeriod,
} from '../../models/SeasonalWorkload';

// ============================================
// Generator
// ============================================

export function generateSeasonalWorkloadDemoData(): SeasonalWorkloadData {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed

  // Full month labels
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Historical workload scores by month
  // Peaks: March (82), June (78), September (85), December (75)
  const historicalScores = [45, 50, 82, 55, 48, 78, 42, 52, 85, 50, 55, 75];
  const historicalMeetingHours = [14, 16, 24, 17, 15, 22, 13, 16, 26, 16, 18, 22];
  const historicalEmailVolume = [120, 140, 210, 145, 125, 195, 110, 135, 225, 130, 150, 200];

  // Predicted scores (slight variation from historical)
  const predictedScores = [47, 52, 80, 53, 50, 76, 44, 54, 83, 52, 57, 73];

  const months: SeasonalPeriod[] = monthNames.map((label, idx) => ({
    monthLabel: label,
    historicalAvgMeetingHours: historicalMeetingHours[idx],
    historicalAvgEmailVolume: historicalEmailVolume[idx],
    historicalWorkloadScore: historicalScores[idx],
    predictedWorkloadScore: predictedScores[idx],
    isUpcoming: idx > currentMonth,
    isPeak: [2, 5, 8, 11].includes(idx), // March, June, September, December
    annotation:
      idx === 2 ? 'Q1 Close'
      : idx === 5 ? 'Mid-Year Review'
      : idx === 8 ? 'Planning Season'
      : idx === 11 ? 'Year-End'
      : undefined,
  }));

  // Find next peak after current month
  const peakMonths = [2, 5, 8, 11]; // March, June, September, December
  let nextPeakIdx = peakMonths.find(m => m > currentMonth);
  if (nextPeakIdx === undefined) {
    nextPeakIdx = peakMonths[0]; // wrap to next year
  }

  // Calculate weeks until next peak
  const nextPeakDate = new Date(now.getFullYear(), nextPeakIdx, 1);
  if (nextPeakDate.getTime() < now.getTime()) {
    nextPeakDate.setFullYear(nextPeakDate.getFullYear() + 1);
  }
  const weeksUntilNextPeak = Math.round(
    (nextPeakDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  // Find highest and lowest months
  let highestIdx = 0;
  let lowestIdx = 0;
  historicalScores.forEach((score, idx) => {
    if (score > historicalScores[highestIdx]) highestIdx = idx;
    if (score < historicalScores[lowestIdx]) lowestIdx = idx;
  });

  // Year-over-year comparison
  const yearOverYearComparison = monthNames.map((label, idx) => ({
    month: label,
    thisYear: predictedScores[idx],
    lastYear: historicalScores[idx],
  }));

  return {
    months,
    currentMonth,
    stats: {
      nextPeakMonth: monthNames[nextPeakIdx],
      nextPeakScore: historicalScores[nextPeakIdx],
      weeksUntilNextPeak: Math.max(weeksUntilNextPeak, 6), // Ensure at least 6 weeks per spec
      currentMonthVsAvg: 55, // Current month moderate
      highestMonth: monthNames[highestIdx],
      lowestMonth: monthNames[lowestIdx],
    },
    yearOverYearComparison,
  };
}
