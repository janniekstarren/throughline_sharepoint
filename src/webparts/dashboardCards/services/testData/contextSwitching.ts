// ============================================
// Test Data - Context Switching
// Provides mock data for testing/demo mode
// ============================================

import {
  ContextSwitchingData,
  ContextSwitch,
  DailySummary,
  ContextSwitchingTrend,
  HourlySwitchData,
  ContextDistribution,
  FocusSession,
  CurrentContextState,
  ContextType,
  getContextTypeColor,
  calculateFocusScore
} from '../../models/ContextSwitching';

/**
 * Generate test context switches for today
 */
function getTestContextSwitches(): ContextSwitch[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const switches: ContextSwitch[] = [
    {
      id: 'cs-1',
      contextType: 'email',
      contextName: 'RE: Q4 Budget Review',
      timestamp: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
      duration: 8,
      webUrl: 'https://outlook.office.com/mail/...',
      person: { id: 'p1', displayName: 'Sarah Johnson', email: 'sarah@contoso.com' }
    },
    {
      id: 'cs-2',
      contextType: 'teams-chat',
      contextName: 'Chat with Michael Chen',
      timestamp: new Date(today.getTime() + 9.15 * 60 * 60 * 1000), // 9:09 AM
      duration: 5,
      webUrl: 'https://teams.microsoft.com/l/chat/...',
      person: { id: 'p2', displayName: 'Michael Chen', email: 'michael@contoso.com' }
    },
    {
      id: 'cs-3',
      contextType: 'file',
      contextName: 'Project Roadmap.xlsx',
      timestamp: new Date(today.getTime() + 9.25 * 60 * 60 * 1000), // 9:15 AM
      duration: 35,
      webUrl: 'https://contoso.sharepoint.com/...',
      project: 'Q4 Planning'
    },
    {
      id: 'cs-4',
      contextType: 'meeting',
      contextName: 'Weekly Team Standup',
      timestamp: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
      duration: 30,
      webUrl: 'https://teams.microsoft.com/l/meetup-join/...'
    },
    {
      id: 'cs-5',
      contextType: 'email',
      contextName: 'FW: Vendor Proposal',
      timestamp: new Date(today.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
      duration: 12,
      webUrl: 'https://outlook.office.com/mail/...',
      person: { id: 'p3', displayName: 'Emily Rodriguez', email: 'emily@contoso.com' }
    },
    {
      id: 'cs-6',
      contextType: 'teams-channel',
      contextName: 'Engineering > General',
      timestamp: new Date(today.getTime() + 10.75 * 60 * 60 * 1000), // 10:45 AM
      duration: 7,
      webUrl: 'https://teams.microsoft.com/l/channel/...'
    },
    {
      id: 'cs-7',
      contextType: 'file',
      contextName: 'Technical Spec v2.docx',
      timestamp: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
      duration: 45,
      webUrl: 'https://contoso.sharepoint.com/...',
      project: 'Product Launch'
    },
    {
      id: 'cs-8',
      contextType: 'teams-chat',
      contextName: 'Group: Project Alpha',
      timestamp: new Date(today.getTime() + 11.75 * 60 * 60 * 1000), // 11:45 AM
      duration: 10,
      webUrl: 'https://teams.microsoft.com/l/chat/...'
    },
    {
      id: 'cs-9',
      contextType: 'email',
      contextName: 'Meeting Notes: Strategy Session',
      timestamp: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM
      duration: 5,
      webUrl: 'https://outlook.office.com/mail/...',
      person: { id: 'p4', displayName: 'David Park', email: 'david@contoso.com' }
    },
    {
      id: 'cs-10',
      contextType: 'meeting',
      contextName: '1:1 with Manager',
      timestamp: new Date(today.getTime() + 13.25 * 60 * 60 * 1000), // 1:15 PM
      duration: 30,
      webUrl: 'https://teams.microsoft.com/l/meetup-join/...'
    },
    {
      id: 'cs-11',
      contextType: 'file',
      contextName: 'Quarterly Report.pptx',
      timestamp: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
      duration: 60,
      webUrl: 'https://contoso.sharepoint.com/...',
      project: 'Q4 Planning'
    },
    {
      id: 'cs-12',
      contextType: 'teams-chat',
      contextName: 'Chat with Alex Kim',
      timestamp: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3:00 PM
      duration: 8,
      webUrl: 'https://teams.microsoft.com/l/chat/...',
      person: { id: 'p5', displayName: 'Alex Kim', email: 'alex@contoso.com' }
    },
    {
      id: 'cs-13',
      contextType: 'email',
      contextName: 'RE: Design Review Feedback',
      timestamp: new Date(today.getTime() + 15.25 * 60 * 60 * 1000), // 3:15 PM
      duration: 15,
      webUrl: 'https://outlook.office.com/mail/...',
      person: { id: 'p6', displayName: 'Lisa Wang', email: 'lisa@contoso.com' }
    },
    {
      id: 'cs-14',
      contextType: 'file',
      contextName: 'Budget_Analysis.xlsx',
      timestamp: new Date(today.getTime() + 15.5 * 60 * 60 * 1000), // 3:30 PM
      duration: 25,
      webUrl: 'https://contoso.sharepoint.com/...',
      project: 'Q4 Planning'
    }
  ];

  return switches;
}

/**
 * Generate focus sessions from context switches
 */
function getTestFocusSessions(switches: ContextSwitch[]): FocusSession[] {
  return switches
    .filter(s => s.duration >= 20) // Only count focus sessions 20+ minutes
    .map((s, i) => ({
      id: `fs-${i}`,
      startTime: s.timestamp,
      endTime: new Date(s.timestamp.getTime() + s.duration * 60 * 1000),
      duration: s.duration,
      contextType: s.contextType,
      contextName: s.contextName,
      interrupted: s.duration < 25, // Consider it interrupted if less than 25 min
      interruptedBy: s.duration < 25 ? getRandomContextType() : undefined
    }));
}

function getRandomContextType(): ContextType {
  const types: ContextType[] = ['email', 'teams-chat', 'meeting'];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Generate hourly data for today
 */
function getTestHourlyData(): HourlySwitchData[] {
  const data: HourlySwitchData[] = [];
  const workingHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  const switchPatterns: Record<number, { switches: number; dominant: ContextType; focus: number }> = {
    9: { switches: 4, dominant: 'email', focus: 35 },
    10: { switches: 3, dominant: 'meeting', focus: 40 },
    11: { switches: 2, dominant: 'file', focus: 50 },
    12: { switches: 1, dominant: 'email', focus: 20 }, // Lunch
    13: { switches: 3, dominant: 'meeting', focus: 45 },
    14: { switches: 2, dominant: 'file', focus: 55 },
    15: { switches: 4, dominant: 'teams-chat', focus: 30 },
    16: { switches: 3, dominant: 'file', focus: 40 },
    17: { switches: 2, dominant: 'email', focus: 35 },
  };

  workingHours.forEach(hour => {
    const pattern = switchPatterns[hour] || { switches: 2, dominant: 'email' as ContextType, focus: 30 };
    data.push({
      hour,
      switchCount: pattern.switches,
      dominantContext: pattern.dominant,
      focusTime: pattern.focus
    });
  });

  return data;
}

/**
 * Generate context distribution
 */
function getTestDistribution(): ContextDistribution[] {
  const distributions: ContextDistribution[] = [
    { contextType: 'email', label: 'Email', count: 15, percentage: 25, totalDuration: 60, color: getContextTypeColor('email') },
    { contextType: 'teams-chat', label: 'Teams Chat', count: 12, percentage: 20, totalDuration: 48, color: getContextTypeColor('teams-chat') },
    { contextType: 'teams-channel', label: 'Channels', count: 5, percentage: 8, totalDuration: 25, color: getContextTypeColor('teams-channel') },
    { contextType: 'meeting', label: 'Meetings', count: 8, percentage: 13, totalDuration: 120, color: getContextTypeColor('meeting') },
    { contextType: 'file', label: 'Files', count: 18, percentage: 30, totalDuration: 180, color: getContextTypeColor('file') },
    { contextType: 'calendar', label: 'Calendar', count: 2, percentage: 4, totalDuration: 10, color: getContextTypeColor('calendar') }
  ];

  return distributions;
}

/**
 * Generate today's summary
 */
function getTestTodaySummary(): DailySummary {
  const hourlyData = getTestHourlyData();
  const totalSwitches = hourlyData.reduce((sum, h) => sum + h.switchCount, 0);
  const totalFocusTime = hourlyData.reduce((sum, h) => sum + h.focusTime, 0);
  const avgFocusTime = totalFocusTime / hourlyData.length;

  const switchesByType: Record<ContextType, number> = {
    'email': 5,
    'teams-chat': 4,
    'teams-channel': 2,
    'meeting': 3,
    'file': 6,
    'task': 1,
    'calendar': 2
  };

  const switchesByHour = hourlyData.map(h => ({
    hour: h.hour,
    count: h.switchCount
  }));

  const peakHour = hourlyData.reduce((max, h) =>
    h.switchCount > max.switchCount ? h : max, hourlyData[0]);

  return {
    date: new Date().toISOString().split('T')[0],
    totalSwitches,
    totalFocusTime,
    avgFocusTime: Math.round(avgFocusTime),
    longestFocus: 60, // The 60 min file session
    switchesByType,
    switchesByHour,
    peakSwitchingHour: peakHour.hour,
    focusScore: calculateFocusScore(totalSwitches, avgFocusTime, 8)
  };
}

/**
 * Generate trend data for the past week
 */
function getTestTrendData(): ContextSwitchingTrend {
  const now = new Date();
  const dataPoints: DailySummary[] = [];

  // Generate 7 days of data
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate variation in data
    const baselineSwitches = 20 + Math.floor(Math.random() * 15);
    const baselineFocus = 30 + Math.floor(Math.random() * 20);

    // Weekends have less activity
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const multiplier = isWeekend ? 0.3 : 1;

    const totalSwitches = Math.round(baselineSwitches * multiplier);
    const avgFocusTime = Math.round(baselineFocus * (isWeekend ? 1.5 : 1)); // Better focus on weekends

    dataPoints.push({
      date: date.toISOString().split('T')[0],
      totalSwitches,
      totalFocusTime: totalSwitches * avgFocusTime,
      avgFocusTime,
      longestFocus: avgFocusTime + Math.floor(Math.random() * 30),
      switchesByType: {
        'email': Math.round(totalSwitches * 0.25),
        'teams-chat': Math.round(totalSwitches * 0.20),
        'teams-channel': Math.round(totalSwitches * 0.10),
        'meeting': Math.round(totalSwitches * 0.15),
        'file': Math.round(totalSwitches * 0.25),
        'task': Math.round(totalSwitches * 0.03),
        'calendar': Math.round(totalSwitches * 0.02)
      },
      switchesByHour: [],
      peakSwitchingHour: 10 + Math.floor(Math.random() * 4),
      focusScore: calculateFocusScore(totalSwitches, avgFocusTime, isWeekend ? 4 : 8)
    });
  }

  // Calculate weekly averages
  const workdayData = dataPoints.filter(d => {
    const date = new Date(d.date);
    return date.getDay() !== 0 && date.getDay() !== 6;
  });

  const weeklyAvgSwitches = workdayData.length > 0
    ? workdayData.reduce((sum, d) => sum + d.totalSwitches, 0) / workdayData.length
    : 0;

  const weeklyAvgFocusTime = workdayData.length > 0
    ? workdayData.reduce((sum, d) => sum + d.avgFocusTime, 0) / workdayData.length
    : 0;

  const weeklyFocusScore = workdayData.length > 0
    ? workdayData.reduce((sum, d) => sum + d.focusScore, 0) / workdayData.length
    : 0;

  // Find best and worst days
  const bestDay = workdayData.reduce((best, d) =>
    d.focusScore > best.focusScore ? d : best, workdayData[0]);

  const worstDay = workdayData.reduce((worst, d) =>
    d.focusScore < worst.focusScore ? d : worst, workdayData[0]);

  // Determine trend
  const firstHalf = dataPoints.slice(0, 3);
  const secondHalf = dataPoints.slice(4);
  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.focusScore, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.focusScore, 0) / secondHalf.length;

  let trend: 'improving' | 'worsening' | 'stable';
  if (secondHalfAvg > firstHalfAvg + 5) {
    trend = 'improving';
  } else if (secondHalfAvg < firstHalfAvg - 5) {
    trend = 'worsening';
  } else {
    trend = 'stable';
  }

  return {
    dataPoints,
    trend,
    weeklyAvgSwitches: Math.round(weeklyAvgSwitches),
    weeklyAvgFocusTime: Math.round(weeklyAvgFocusTime),
    weeklyFocusScore: Math.round(weeklyFocusScore),
    bestDay: bestDay?.date || dataPoints[0].date,
    worstDay: worstDay?.date || dataPoints[0].date,
    comparisonToLastWeek: {
      switchesChange: -8, // 8% fewer switches than last week
      focusTimeChange: 12 // 12% more focus time
    }
  };
}

/**
 * Generate current context state
 */
function getTestCurrentState(): CurrentContextState {
  const now = new Date();
  const currentHour = now.getHours();

  // Determine current context based on time of day
  let currentContext: ContextType = 'file';
  let currentContextName = 'Project Planning.docx';

  if (currentHour >= 9 && currentHour < 10) {
    currentContext = 'email';
    currentContextName = 'Morning inbox review';
  } else if (currentHour >= 10 && currentHour < 11) {
    currentContext = 'meeting';
    currentContextName = 'Team Standup';
  } else if (currentHour >= 14 && currentHour < 15) {
    currentContext = 'meeting';
    currentContextName = '1:1 with Manager';
  }

  const startedAt = new Date(now);
  startedAt.setMinutes(startedAt.getMinutes() - Math.floor(Math.random() * 30));

  return {
    currentContext,
    currentContextName,
    startedAt,
    todaySwitches: 14,
    todayFocusTime: 245, // minutes
    currentFocusStreak: Math.floor((now.getTime() - startedAt.getTime()) / 60000),
    isInFocusMode: currentContext === 'file'
  };
}

/**
 * Main export function - get all test data for Context Switching card
 */
export function getTestContextSwitchingData(): ContextSwitchingData {
  const recentSwitches = getTestContextSwitches();
  const recentSessions = getTestFocusSessions(recentSwitches);

  return {
    currentState: getTestCurrentState(),
    todaySummary: getTestTodaySummary(),
    trendData: getTestTrendData(),
    hourlyData: getTestHourlyData(),
    distribution: getTestDistribution(),
    recentSessions,
    recentSwitches
  };
}

/**
 * Export trend data separately for components that only need trend
 */
export function getTestContextSwitchingTrend(): ContextSwitchingTrend {
  return getTestTrendData();
}
