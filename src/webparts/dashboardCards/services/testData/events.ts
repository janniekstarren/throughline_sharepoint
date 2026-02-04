// ============================================
// Test Data - Today's Calendar Events
// ============================================

import { ICalendarEvent } from '../GraphService';

/**
 * Generate test calendar events for today
 * Creates dynamic dates based on current time
 */
export function getTestEvents(): ICalendarEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createTime = (hours: number, minutes: number = 0): Date => {
    const date = new Date(today);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  return [
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
}
