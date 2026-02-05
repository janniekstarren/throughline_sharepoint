// ============================================
// UpcomingWeek Service - API Integration
// ============================================

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  UpcomingWeekData,
  WeekEvent,
  IUpcomingWeekSettings,
} from '../models/UpcomingWeek';

export class UpcomingWeekService {
  private context: WebPartContext;
  private graphClient: MSGraphClientV3 | null = null;

  constructor(context: WebPartContext) {
    this.context = context;
  }

  /**
   * Get or create the Graph client
   */
  private async getGraphClient(): Promise<MSGraphClientV3> {
    if (!this.graphClient) {
      this.graphClient = await this.context.msGraphClientFactory.getClient('3');
    }
    return this.graphClient;
  }

  /**
   * Get the day label for a given date
   */
  private getDayLabel(date: Date): string {
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
  }

  /**
   * Group events by day
   */
  private groupEventsByDay(events: WeekEvent[]): Map<string, WeekEvent[]> {
    const byDay = new Map<string, WeekEvent[]>();

    // Initialize map with days in order
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayLabel = this.getDayLabel(date);
      byDay.set(dayLabel, []);
    }

    // Group events
    for (const event of events) {
      const dayLabel = event.dayOfWeek;
      const dayEvents = byDay.get(dayLabel) || [];
      dayEvents.push(event);
      byDay.set(dayLabel, dayEvents);
    }

    // Remove empty days
    byDay.forEach((value, key) => {
      if (value.length === 0) {
        byDay.delete(key);
      }
    });

    return byDay;
  }

  /**
   * Fetch calendar events for the next 7 days
   */
  public async getData(settings: IUpcomingWeekSettings): Promise<UpcomingWeekData> {
    const client = await this.getGraphClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + settings.daysToShow);

    const response = await client
      .api('/me/calendarView')
      .query({
        startDateTime: today.toISOString(),
        endDateTime: endDate.toISOString(),
      })
      .select('id,subject,start,end,location,isAllDay,isOnlineMeeting,onlineMeetingUrl,webLink')
      .orderby('start/dateTime')
      .top(settings.maxItems)
      .get();

    // Defensive check for response.value
    const rawEvents = response?.value || [];
    const events: WeekEvent[] = rawEvents.map((event: any) => {
      const startDate = new Date(event.start.dateTime + 'Z');
      return {
        id: event.id,
        subject: event.subject,
        start: startDate,
        end: new Date(event.end.dateTime + 'Z'),
        location: event.location?.displayName,
        isAllDay: event.isAllDay,
        isOnlineMeeting: event.isOnlineMeeting,
        onlineMeetingUrl: event.onlineMeetingUrl,
        webLink: event.webLink,
        dayOfWeek: this.getDayLabel(startDate),
      };
    });

    const byDay = this.groupEventsByDay(events);

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
  }
}
