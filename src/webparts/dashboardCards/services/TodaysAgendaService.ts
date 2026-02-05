// ============================================
// TodaysAgenda Service - API Integration
// ============================================

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  TodaysAgendaData,
  CalendarEvent,
  ITodaysAgendaSettings,
} from '../models/TodaysAgenda';

export class TodaysAgendaService {
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
   * Fetch today's calendar events
   */
  public async getData(settings: ITodaysAgendaSettings): Promise<TodaysAgendaData> {
    const client = await this.getGraphClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await client
      .api('/me/calendarView')
      .query({
        startDateTime: today.toISOString(),
        endDateTime: tomorrow.toISOString(),
      })
      .select('id,subject,start,end,location,isAllDay,isOnlineMeeting,onlineMeetingUrl,webLink')
      .orderby('start/dateTime')
      .top(settings.maxItems)
      .get();

    // Defensive check for response.value
    const rawEvents = response?.value || [];
    const events: CalendarEvent[] = rawEvents.map((event: any) => ({
      id: event.id,
      subject: event.subject,
      start: new Date(event.start.dateTime + 'Z'),
      end: new Date(event.end.dateTime + 'Z'),
      location: event.location?.displayName,
      isAllDay: event.isAllDay,
      isOnlineMeeting: event.isOnlineMeeting,
      onlineMeetingUrl: event.onlineMeetingUrl,
      webLink: event.webLink,
    }));

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

    // Find longest meeting duration
    const longestMeetingMinutes = nonAllDayEvents.length > 0
      ? Math.max(...nonAllDayEvents.map(e => (e.end.getTime() - e.start.getTime()) / (1000 * 60)))
      : 0;

    return {
      events,
      totalCount: events.length,
      onlineMeetingCount,
      currentEvent,
      nextEvent,
      totalMeetingHours,
      longestMeetingMinutes,
    };
  }
}
