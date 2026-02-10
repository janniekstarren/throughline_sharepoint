// ============================================
// Calendar Analysis Utilities
// Shared utilities for Focus Time, Deep Work,
// Pre-Meeting Conflicts, and related cards
// ============================================

// ============================================
// Interfaces
// ============================================

export interface TimeBlock {
  start: Date;
  end: Date;
  durationMinutes: number;
  type: 'meeting' | 'focus' | 'break' | 'before-hours' | 'after-hours';
}

export interface CalendarEvent {
  id: string;
  subject: string;
  startDateTime: Date;
  endDateTime: Date;
  durationMinutes: number;
  isAllDay?: boolean;
  isCancelled?: boolean;
  isOptional?: boolean;
  isRecurring?: boolean;
  attendeeCount?: number;
  organizer?: string;
  responseStatus?: 'accepted' | 'tentative' | 'declined' | 'none';
}

export interface CalendarDayAnalysis {
  date: Date;
  meetings: CalendarEvent[];
  totalMeetingMinutes: number;
  totalFocusMinutes: number;
  longestFocusBlock: number;
  contextSwitches: number;
  backToBackCount: number;
  fragmentationScore: number;
  freeBlocks: TimeBlock[];
}

// ============================================
// Day-Level Calendar Analysis
// ============================================

/**
 * Analyse a single day's calendar events and compute productivity metrics.
 * Filters out all-day and cancelled events before analysis.
 *
 * @param events - Array of CalendarEvent for the day
 * @param workingHours - Working hours boundaries (24-hour clock)
 * @returns CalendarDayAnalysis with meetings, focus blocks, and scores
 */
export function analyseCalendarDay(
  events: CalendarEvent[],
  workingHours: { start: number; end: number }
): CalendarDayAnalysis {
  const filtered = events
    .filter(e => !e.isAllDay && !e.isCancelled)
    .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

  const totalMeetingMinutes = filtered.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalWorkMinutes = (workingHours.end - workingHours.start) * 60;

  const freeBlocks = findFreeBlocks(
    filtered,
    new Date(filtered[0]?.startDateTime ?? new Date()),
    new Date(filtered[0]?.startDateTime ?? new Date()),
    30
  );

  const totalFocusMinutes = Math.max(0, totalWorkMinutes - totalMeetingMinutes);
  const longestFocusBlock = freeBlocks.length > 0
    ? Math.max(...freeBlocks.map(b => b.durationMinutes))
    : totalFocusMinutes;

  // Count back-to-back meetings (gap < 15 minutes)
  let backToBackCount = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    const gap =
      (filtered[i + 1].startDateTime.getTime() - filtered[i].endDateTime.getTime()) / 60000;
    if (gap < 15) backToBackCount++;
  }

  // Each meeting = in + out context switch
  const contextSwitches = Math.max(0, filtered.length * 2 - 1);
  const fragmentationScore = computeFragmentationScore(filtered, totalWorkMinutes);

  return {
    date: filtered[0]?.startDateTime ?? new Date(),
    meetings: filtered,
    totalMeetingMinutes,
    totalFocusMinutes,
    longestFocusBlock,
    contextSwitches,
    backToBackCount,
    fragmentationScore,
    freeBlocks,
  };
}

// ============================================
// Free Block Detection
// ============================================

/**
 * Find contiguous free (focus) blocks between calendar events.
 * Only blocks that meet the minimum duration threshold are returned.
 *
 * @param events - Sorted, filtered calendar events
 * @param dayStart - Start of the analysis window
 * @param dayEnd - End of the analysis window
 * @param minBlockMinutes - Minimum block duration to include (default 30)
 * @returns Array of TimeBlock entries typed as 'focus'
 */
export function findFreeBlocks(
  events: CalendarEvent[],
  dayStart: Date,
  dayEnd: Date,
  minBlockMinutes: number = 30
): TimeBlock[] {
  const filtered = events
    .filter(e => !e.isAllDay && !e.isCancelled)
    .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

  const blocks: TimeBlock[] = [];
  let cursor = dayStart.getTime();

  for (const event of filtered) {
    const eventStart = event.startDateTime.getTime();
    if (eventStart > cursor) {
      const durationMinutes = Math.round((eventStart - cursor) / 60000);
      if (durationMinutes >= minBlockMinutes) {
        blocks.push({
          start: new Date(cursor),
          end: new Date(eventStart),
          durationMinutes,
          type: 'focus',
        });
      }
    }
    cursor = Math.max(cursor, event.endDateTime.getTime());
  }

  // After last meeting
  const endTime = dayEnd.getTime();
  if (endTime > cursor) {
    const durationMinutes = Math.round((endTime - cursor) / 60000);
    if (durationMinutes >= minBlockMinutes) {
      blocks.push({
        start: new Date(cursor),
        end: new Date(endTime),
        durationMinutes,
        type: 'focus',
      });
    }
  }

  return blocks;
}

// ============================================
// Fragmentation Scoring
// ============================================

/**
 * Compute a fragmentation score (0-100) for a set of events.
 * Higher scores indicate a more fragmented (less productive) day.
 * Factors: meeting-to-work ratio, number of meetings, average gap size.
 *
 * @param events - Sorted, filtered calendar events
 * @param totalWorkMinutes - Total available work minutes (default 480 = 8 hours)
 * @returns Score from 0 (unfragmented) to 100 (fully fragmented)
 */
export function computeFragmentationScore(
  events: CalendarEvent[],
  totalWorkMinutes?: number
): number {
  if (events.length === 0) return 0;

  const meetingMinutes = events.reduce((sum, e) => sum + e.durationMinutes, 0);
  const workMinutes = totalWorkMinutes ?? 480; // default 8 hours
  const meetingRatio = meetingMinutes / workMinutes;

  // Compute average gap between meetings
  let totalGap = 0;
  let gapCount = 0;
  for (let i = 0; i < events.length - 1; i++) {
    const gap =
      (events[i + 1].startDateTime.getTime() - events[i].endDateTime.getTime()) / 60000;
    if (gap > 0) {
      totalGap += gap;
      gapCount++;
    }
  }
  const avgGap = gapCount > 0 ? totalGap / gapCount : 60;
  const gapPenalty = avgGap < 30 ? 0.3 : avgGap < 60 ? 0.15 : 0;

  // Score: 0-100 (100 = fully fragmented)
  const score = Math.min(
    100,
    Math.round((meetingRatio * 50) + (events.length * 5) + (gapPenalty * 100))
  );

  return score;
}
