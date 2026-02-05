// ============================================
// TodaysAgenda Test Data - Mock Data for Development
// ============================================

import {
  TodaysAgendaData,
  CalendarEvent,
  AgendaTrendData,
} from '../../models/TodaysAgenda';
import { TrendDataPoint } from '../../components/shared/charts';

/**
 * Generate test calendar events for today
 * Creates dynamic dates based on current time
 */
export const getTestTodaysAgendaData = (): TodaysAgendaData => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createTime = (hours: number, minutes: number = 0): Date => {
    const date = new Date(today);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const events: CalendarEvent[] = [
    {
      id: 'test-event-1',
      subject: 'Daily Team Standup',
      start: createTime(9, 0),
      end: createTime(9, 30),
      location: 'Teams Meeting',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-standup',
      webLink: 'https://outlook.office.com/calendar/item/test-event-1',
    },
    {
      id: 'test-event-2',
      subject: 'Project Review with Sarah',
      start: createTime(10, 0),
      end: createTime(11, 0),
      location: 'Conference Room B',
      isAllDay: false,
      isOnlineMeeting: false,
      webLink: 'https://outlook.office.com/calendar/item/test-event-2',
    },
    {
      id: 'test-event-3',
      subject: 'Lunch Break',
      start: createTime(12, 0),
      end: createTime(13, 0),
      isAllDay: false,
      isOnlineMeeting: false,
      webLink: 'https://outlook.office.com/calendar/item/test-event-3',
    },
    {
      id: 'test-event-4',
      subject: 'Client Demo - Q1 Dashboard Features',
      start: createTime(14, 0),
      end: createTime(15, 30),
      location: 'Main Conference Room',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-demo',
      webLink: 'https://outlook.office.com/calendar/item/test-event-4',
    },
    {
      id: 'test-event-5',
      subject: '1:1 with Manager',
      start: createTime(16, 0),
      end: createTime(16, 30),
      location: 'Teams Meeting',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-1on1',
      webLink: 'https://outlook.office.com/calendar/item/test-event-5',
    },
    {
      id: 'test-event-6',
      subject: 'Company All-Hands',
      start: createTime(0, 0),
      end: createTime(23, 59),
      isAllDay: true,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-allhands',
      webLink: 'https://outlook.office.com/calendar/item/test-event-6',
    },
  ];

  const now = new Date();
  const currentEvent = events.find(e => now >= e.start && now <= e.end) || null;
  const nextEvent = events.find(e => e.start > now) || null;
  const onlineMeetingCount = events.filter(e => e.isOnlineMeeting).length;

  // Calculate total meeting hours (excluding all-day events)
  const nonAllDayEvents = events.filter(e => !e.isAllDay);
  const totalMinutes = nonAllDayEvents.reduce((sum, e) => {
    return sum + (e.end.getTime() - e.start.getTime()) / (1000 * 60);
  }, 0);
  const totalMeetingHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Find longest meeting
  const longestMeetingMinutes = Math.max(
    ...nonAllDayEvents.map(e => (e.end.getTime() - e.start.getTime()) / (1000 * 60)),
    0
  );

  return {
    events,
    totalCount: events.length,
    onlineMeetingCount,
    currentEvent,
    nextEvent,
    totalMeetingHours,
    longestMeetingMinutes,
  };
};

/**
 * Generate trend data for the last 7 days
 */
export const getTestAgendaTrendData = (): AgendaTrendData => {
  const dataPoints: TrendDataPoint[] = [];
  const values: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Generate realistic meeting counts (2-8 meetings per day)
    const value = Math.floor(Math.random() * 7) + 2;
    values.push(value);

    dataPoints.push({
      date,
      value,
      label: 'meetings',
    });
  }

  // Calculate trend based on first half vs second half average
  const firstHalf = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = values.slice(4).reduce((a, b) => a + b, 0) / 3;
  const diff = secondHalf - firstHalf;

  let trend: 'busier' | 'quieter' | 'steady';
  if (diff > 1) {
    trend = 'busier';
  } else if (diff < -1) {
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
