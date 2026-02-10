// ============================================
// Deep Work Opportunities - Demo/Test Data
// ============================================
// Deterministic demo data for Card #12.
// All dates relative to now for realistic display.

import {
  DeepWorkOpportunitiesData,
  DeepWorkBlock,
} from '../../models/DeepWorkOpportunities';

// ============================================
// Helpers
// ============================================

/**
 * Returns the next occurrence of a given weekday (0=Sun, 1=Mon, ..., 6=Sat)
 * relative to `now`. If today is that weekday, returns today.
 */
function nextWeekday(now: Date, targetDay: number): Date {
  const current = now.getDay();
  const diff = (targetDay - current + 7) % 7;
  const d = new Date(now);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function setTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// ============================================
// Generator
// ============================================

export function generateDeepWorkOpportunitiesDemoData(): DeepWorkOpportunitiesData {
  const now = new Date();

  // Next occurrence of each weekday
  const nextMon = nextWeekday(now, 1);
  const nextWed = nextWeekday(now, 3);
  const nextThu = nextWeekday(now, 4);
  const nextFri = nextWeekday(now, 5);

  const blocks: DeepWorkBlock[] = [
    // Wed 9-11:30am (150min gold)
    {
      id: 'dw-001',
      date: nextWed,
      dayLabel: 'Wednesday',
      start: setTime(nextWed, 9, 0),
      end: setTime(nextWed, 11, 30),
      durationMinutes: 150,
      quality: 'gold',
      adjacentBefore: 'Morning standup ends 8:45 AM',
      adjacentAfter: 'Client call at 11:30 AM',
    },
    // Fri 9am-12pm (180min gold)
    {
      id: 'dw-002',
      date: nextFri,
      dayLabel: 'Friday',
      start: setTime(nextFri, 9, 0),
      end: setTime(nextFri, 12, 0),
      durationMinutes: 180,
      quality: 'gold',
      adjacentBefore: undefined,
      adjacentAfter: 'Lunch break at 12:00 PM',
    },
    // Thu 9-11am (120min gold)
    {
      id: 'dw-003',
      date: nextThu,
      dayLabel: 'Thursday',
      start: setTime(nextThu, 9, 0),
      end: setTime(nextThu, 11, 0),
      durationMinutes: 120,
      quality: 'gold',
      adjacentBefore: undefined,
      adjacentAfter: 'Sprint planning at 11:00 AM',
    },
    // Mon 9-10:30am (90min silver)
    {
      id: 'dw-004',
      date: nextMon,
      dayLabel: 'Monday',
      start: setTime(nextMon, 9, 0),
      end: setTime(nextMon, 10, 30),
      durationMinutes: 90,
      quality: 'silver',
      adjacentBefore: undefined,
      adjacentAfter: '1:1 with manager at 10:30 AM',
    },
    // Thu 2:30-4pm (90min silver)
    {
      id: 'dw-005',
      date: nextThu,
      dayLabel: 'Thursday',
      start: setTime(nextThu, 14, 30),
      end: setTime(nextThu, 16, 0),
      durationMinutes: 90,
      quality: 'silver',
      adjacentBefore: 'Lunch meeting ends 2:15 PM',
      adjacentAfter: 'Team sync at 4:00 PM',
    },
  ];

  // Daily breakdown for the 5 weekdays
  const dailyBreakdown = [
    { day: 'Monday', totalMinutes: 90, blockCount: 1 },
    { day: 'Tuesday', totalMinutes: 0, blockCount: 0 },
    { day: 'Wednesday', totalMinutes: 150, blockCount: 1 },
    { day: 'Thursday', totalMinutes: 210, blockCount: 2 },
    { day: 'Friday', totalMinutes: 180, blockCount: 1 },
  ];

  return {
    blocks,
    stats: {
      totalDeepWorkMinutes: 630, // 150 + 180 + 120 + 90 + 90
      goldBlockCount: 3,
      silverBlockCount: 2,
      bronzeBlockCount: 0,
      bestDay: 'Friday',
      longestBlock: 180,
      daysWithNoBlocks: 2, // Tue and one other day with no 60+ min blocks
    },
    dailyBreakdown,
  };
}
