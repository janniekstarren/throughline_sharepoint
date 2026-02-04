// ============================================
// Test Data - Upcoming Week Events
// ============================================

import { ICalendarEvent } from '../GraphService';

/**
 * Generate test calendar events for the upcoming week
 */
export function getTestWeekEvents(): ICalendarEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createDateTime = (daysFromNow: number, hours: number, minutes: number = 0): Date => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  return [
    // Today
    {
      id: 'test-week-1',
      subject: 'Daily Team Standup',
      start: createDateTime(0, 9, 0),
      end: createDateTime(0, 9, 30),
      location: 'Teams Meeting',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-standup',
      webLink: 'https://outlook.office.com/calendar/item/test-week-1',
    },
    {
      id: 'test-week-2',
      subject: 'Client Demo',
      start: createDateTime(0, 14, 0),
      end: createDateTime(0, 15, 30),
      location: 'Main Conference Room',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-demo',
      webLink: 'https://outlook.office.com/calendar/item/test-week-2',
    },
    // Tomorrow
    {
      id: 'test-week-3',
      subject: 'Sprint Planning',
      start: createDateTime(1, 10, 0),
      end: createDateTime(1, 12, 0),
      location: 'Teams Meeting',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-sprint',
      webLink: 'https://outlook.office.com/calendar/item/test-week-3',
    },
    {
      id: 'test-week-4',
      subject: 'Code Review Session',
      start: createDateTime(1, 14, 0),
      end: createDateTime(1, 15, 0),
      location: 'Teams Meeting',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-review',
      webLink: 'https://outlook.office.com/calendar/item/test-week-4',
    },
    // Day 2
    {
      id: 'test-week-5',
      subject: 'Product Strategy Workshop',
      start: createDateTime(2, 9, 0),
      end: createDateTime(2, 17, 0),
      location: 'Offsite - Innovation Center',
      isAllDay: false,
      isOnlineMeeting: false,
      webLink: 'https://outlook.office.com/calendar/item/test-week-5',
    },
    // Day 3
    {
      id: 'test-week-6',
      subject: 'Team Building Event',
      start: createDateTime(3, 0, 0),
      end: createDateTime(3, 23, 59),
      isAllDay: true,
      isOnlineMeeting: false,
      webLink: 'https://outlook.office.com/calendar/item/test-week-6',
    },
    {
      id: 'test-week-7',
      subject: 'Lunch & Learn: AI in Development',
      start: createDateTime(3, 12, 0),
      end: createDateTime(3, 13, 0),
      location: 'Cafeteria',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-lunch',
      webLink: 'https://outlook.office.com/calendar/item/test-week-7',
    },
    // Day 4
    {
      id: 'test-week-8',
      subject: 'Architecture Review',
      start: createDateTime(4, 11, 0),
      end: createDateTime(4, 12, 0),
      location: 'Teams Meeting',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-arch',
      webLink: 'https://outlook.office.com/calendar/item/test-week-8',
    },
    {
      id: 'test-week-9',
      subject: 'Customer Success Check-in',
      start: createDateTime(4, 15, 0),
      end: createDateTime(4, 15, 30),
      location: 'Teams Meeting',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-customer',
      webLink: 'https://outlook.office.com/calendar/item/test-week-9',
    },
    // Day 5
    {
      id: 'test-week-10',
      subject: 'Sprint Retrospective',
      start: createDateTime(5, 14, 0),
      end: createDateTime(5, 15, 0),
      location: 'Teams Meeting',
      isAllDay: false,
      isOnlineMeeting: true,
      onlineMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/test-retro',
      webLink: 'https://outlook.office.com/calendar/item/test-week-10',
    },
    {
      id: 'test-week-11',
      subject: 'Friday Happy Hour',
      start: createDateTime(5, 17, 0),
      end: createDateTime(5, 19, 0),
      location: 'Rooftop Lounge',
      isAllDay: false,
      isOnlineMeeting: false,
      webLink: 'https://outlook.office.com/calendar/item/test-week-11',
    },
    // Day 6 (Weekend)
    {
      id: 'test-week-12',
      subject: 'Volunteering Event',
      start: createDateTime(6, 9, 0),
      end: createDateTime(6, 14, 0),
      location: 'Community Center',
      isAllDay: false,
      isOnlineMeeting: false,
      webLink: 'https://outlook.office.com/calendar/item/test-week-12',
    },
  ];
}
