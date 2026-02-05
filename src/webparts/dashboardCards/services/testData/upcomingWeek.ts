// ============================================
// UpcomingWeek Test Data - Mock Data for Development
// ============================================

import {
  UpcomingWeekData,
  WeekEvent,
  WeekTrendData,
} from '../../models/UpcomingWeek';
import { TrendDataPoint } from '../../components/shared/charts';

/**
 * Get the day label for a given date
 */
const getDayLabel = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (eventDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Group events by day
 */
const groupEventsByDay = (events: WeekEvent[]): Map<string, WeekEvent[]> => {
  const byDay = new Map<string, WeekEvent[]>();

  // Initialize with unique days from events (in order of appearance)
  const dayOrder: string[] = [];
  for (const event of events) {
    if (!dayOrder.includes(event.dayOfWeek)) {
      dayOrder.push(event.dayOfWeek);
      byDay.set(event.dayOfWeek, []);
    }
  }

  // Group events
  for (const event of events) {
    const dayEvents = byDay.get(event.dayOfWeek) || [];
    dayEvents.push(event);
    byDay.set(event.dayOfWeek, dayEvents);
  }

  return byDay;
};

/**
 * Generate test week events
 * Creates dynamic dates based on current time with variety of event types
 */
export const getTestUpcomingWeekData = (): UpcomingWeekData => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createDateTime = (daysFromToday: number, hours: number, minutes: number = 0): Date => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysFromToday);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const createEvent = (
    id: string,
    subject: string,
    daysFromToday: number,
    startHour: number,
    endHour: number,
    options: Partial<Omit<WeekEvent, 'id' | 'subject' | 'start' | 'end' | 'dayOfWeek'>> = {}
  ): WeekEvent => {
    const start = createDateTime(daysFromToday, startHour);
    return {
      id,
      subject,
      start,
      end: createDateTime(daysFromToday, endHour),
      location: options.location,
      isAllDay: options.isAllDay ?? false,
      isOnlineMeeting: options.isOnlineMeeting ?? false,
      onlineMeetingUrl: options.onlineMeetingUrl,
      webLink: `https://outlook.office.com/calendar/item/${id}`,
      dayOfWeek: getDayLabel(start),
    };
  };

  const events: WeekEvent[] = [
    // Today
    createEvent('week-1', 'Daily Team Standup', 0, 9, 9.5, {
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/standup',
      location: 'Teams Meeting',
    }),
    createEvent('week-2', 'Project Review with Sarah', 0, 14, 15, {
      location: 'Conference Room B',
    }),
    createEvent('week-3', 'Client Call - Q1 Planning', 0, 16, 17, {
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/client-call',
      location: 'Teams Meeting',
    }),

    // Tomorrow
    createEvent('week-4', 'Weekly All-Hands Meeting', 1, 10, 11, {
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/all-hands',
      location: 'Main Conference Room',
    }),
    createEvent('week-5', '1:1 with Manager', 1, 14, 14.5, {
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/1on1',
    }),

    // Day 2
    createEvent('week-6', 'Sprint Planning', 2, 9, 11, {
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/sprint',
      location: 'Teams Meeting',
    }),
    createEvent('week-7', 'Design Review', 2, 13, 14, {
      location: 'Design Lab',
    }),
    createEvent('week-8', 'Training Session: New Features', 2, 15, 16.5, {
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/training',
    }),

    // Day 3
    createEvent('week-9', 'Company Town Hall', 3, 0, 23.99, {
      isAllDay: true,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/townhall',
    }),
    createEvent('week-10', 'Interview - Senior Developer', 3, 11, 12, {
      location: 'Meeting Room A',
    }),

    // Day 4
    createEvent('week-11', 'Code Review Session', 4, 10, 11, {
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/codereview',
    }),
    createEvent('week-12', 'Lunch & Learn: AI Tools', 4, 12, 13, {
      location: 'Cafeteria',
    }),

    // Day 5
    createEvent('week-13', 'Sprint Demo', 5, 14, 15, {
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/demo',
      location: 'Teams Meeting',
    }),
    createEvent('week-14', 'Team Happy Hour', 5, 17, 18, {
      location: 'Rooftop Lounge',
    }),

    // Day 6
    createEvent('week-15', 'Weekend Planning Call', 6, 10, 10.5, {
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/weekend',
    }),
  ];

  const byDay = groupEventsByDay(events);

  // Count online meetings
  const onlineMeetingCount = events.filter(e => e.isOnlineMeeting).length;

  // Find busiest day
  let busiestDay = 'Today';
  let maxEvents = 0;
  byDay.forEach((dayEvents, dayLabel) => {
    if (dayEvents.length > maxEvents) {
      maxEvents = dayEvents.length;
      busiestDay = dayLabel;
    }
  });

  // Calculate free hours estimate (assuming 8-hour workdays, 5 working days)
  const totalWorkingHours = 5 * 8; // 40 hours
  const nonAllDayEvents = events.filter(e => !e.isAllDay);
  const totalMeetingMinutes = nonAllDayEvents.reduce((sum, e) => {
    return sum + (e.end.getTime() - e.start.getTime()) / (1000 * 60);
  }, 0);
  const meetingHours = totalMeetingMinutes / 60;
  const freeHoursEstimate = Math.round((totalWorkingHours - meetingHours) * 10) / 10;

  return {
    events,
    totalCount: events.length,
    byDay,
    onlineMeetingCount,
    busiestDay,
    freeHoursEstimate: Math.max(0, freeHoursEstimate),
  };
};

/**
 * Generate trend data for the next 7 days (meeting density by day)
 */
export const getTestWeekTrendData = (): WeekTrendData => {
  const dataPoints: TrendDataPoint[] = [];
  const values: number[] = [];

  // Generate data for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    // Generate realistic meeting counts (1-5 meetings per day)
    // Weekends have fewer meetings
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const value = isWeekend
      ? Math.floor(Math.random() * 2) // 0-1 meetings on weekends
      : Math.floor(Math.random() * 4) + 2; // 2-5 meetings on weekdays
    values.push(value);

    dataPoints.push({
      date,
      value,
      label: 'meetings',
    });
  }

  // Calculate trend: compare this week density vs "previous week" (simulated)
  // For simplicity, we compare first half vs second half
  const firstHalf = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = values.slice(4).reduce((a, b) => a + b, 0) / 3;
  const diff = secondHalf - firstHalf;

  let trend: 'busier' | 'quieter' | 'steady';
  if (diff > 0.5) {
    trend = 'busier';
  } else if (diff < -0.5) {
    trend = 'quieter';
  } else {
    trend = 'steady';
  }

  const averageMeetingsPerDay = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    dataPoints,
    trend,
    averageMeetingsPerDay: Math.round(averageMeetingsPerDay * 10) / 10,
  };
};
