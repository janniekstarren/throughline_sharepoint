import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';

export interface ICalendarEvent {
  id: string;
  subject: string;
  start: Date;
  end: Date;
  location?: string;
  isAllDay: boolean;
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string;
  webLink: string;
}

export interface IEmailMessage {
  id: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  receivedDateTime: Date;
  bodyPreview: string;
  importance: string;
  hasAttachments: boolean;
  isRead: boolean;
  webLink: string;
}

export interface ITaskItem {
  id: string;
  title: string;
  status: string;
  importance: string;
  dueDateTime?: Date;
  listName: string;
  isOverdue: boolean;
}

export interface IFileItem {
  id: string;
  name: string;
  webUrl: string;
  size: number;
  lastModifiedDateTime: Date;
  lastModifiedBy?: string;
  isFolder: boolean;
  fileType?: string;
}

export interface ITeamMember {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  presence?: 'Available' | 'Busy' | 'Away' | 'DoNotDisturb' | 'Offline' | 'Unknown';
  photoUrl?: string;
}

export interface ISharedFile {
  id: string;
  name: string;
  webUrl: string;
  size: number;
  sharedBy: string;
  sharedDateTime: Date;
  fileType?: string;
}

export interface ISiteActivity {
  id: string;
  action: string;
  itemName: string;
  itemUrl?: string;
  actor: string;
  actorPhotoUrl?: string;
  timestamp: Date;
}

export interface IQuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export class GraphService {
  private context: WebPartContext;
  private graphClient: MSGraphClientV3 | null = null;

  constructor(context: WebPartContext) {
    this.context = context;
  }

  private async getClient(): Promise<MSGraphClientV3> {
    if (!this.graphClient) {
      this.graphClient = await this.context.msGraphClientFactory.getClient('3');
    }
    return this.graphClient;
  }

  public async getTodaysEvents(): Promise<ICalendarEvent[]> {
    const client = await this.getClient();

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
      .top(50)
      .get();

    return response.value.map((event: any) => ({
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
  }

  public async getUnreadEmails(count: number = 10): Promise<IEmailMessage[]> {
    const client = await this.getClient();

    const response = await client
      .api('/me/mailFolders/inbox/messages')
      .filter('isRead eq false')
      .select('id,subject,from,receivedDateTime,bodyPreview,importance,hasAttachments,isRead,webLink')
      .orderby('receivedDateTime desc')
      .top(count)
      .get();

    return response.value.map((msg: any) => ({
      id: msg.id,
      subject: msg.subject,
      from: {
        name: msg.from?.emailAddress?.name || '',
        email: msg.from?.emailAddress?.address || '',
      },
      receivedDateTime: new Date(msg.receivedDateTime),
      bodyPreview: msg.bodyPreview,
      importance: msg.importance?.toLowerCase() || 'normal',
      hasAttachments: msg.hasAttachments,
      isRead: msg.isRead,
      webLink: msg.webLink,
    }));
  }

  public async getTasks(count: number = 10): Promise<ITaskItem[]> {
    const client = await this.getClient();
    const tasks: ITaskItem[] = [];
    const now = new Date();

    try {
      const listsResponse = await client.api('/me/todo/lists').get();

      for (const list of listsResponse.value) {
        const tasksResponse = await client
          .api(`/me/todo/lists/${list.id}/tasks`)
          .filter("status ne 'completed'")
          .select('id,title,status,importance,dueDateTime')
          .top(count)
          .get();

        for (const task of tasksResponse.value) {
          const dueDate = task.dueDateTime?.dateTime
            ? new Date(task.dueDateTime.dateTime)
            : undefined;

          tasks.push({
            id: task.id,
            title: task.title,
            status: task.status?.toLowerCase() || 'notStarted',
            importance: task.importance?.toLowerCase() || 'normal',
            dueDateTime: dueDate,
            listName: list.displayName,
            isOverdue: dueDate ? dueDate < now : false,
          });
        }
      }

      return tasks
        .sort((a, b) => {
          if (!a.dueDateTime) return 1;
          if (!b.dueDateTime) return -1;
          return a.dueDateTime.getTime() - b.dueDateTime.getTime();
        })
        .slice(0, count);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  public async getRecentFiles(count: number = 10): Promise<IFileItem[]> {
    const client = await this.getClient();

    const response = await client
      .api('/me/drive/recent')
      .top(count)
      .get();

    return response.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      webUrl: item.webUrl,
      size: item.size || 0,
      lastModifiedDateTime: new Date(item.lastModifiedDateTime),
      lastModifiedBy: item.lastModifiedBy?.user?.displayName,
      isFolder: !!item.folder,
      fileType: item.file?.mimeType?.split('/').pop(),
    }));
  }

  public async getUpcomingWeekEvents(): Promise<ICalendarEvent[]> {
    const client = await this.getClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const response = await client
      .api('/me/calendarView')
      .query({
        startDateTime: today.toISOString(),
        endDateTime: nextWeek.toISOString(),
      })
      .select('id,subject,start,end,location,isAllDay,isOnlineMeeting,onlineMeetingUrl,webLink')
      .orderby('start/dateTime')
      .top(50)
      .get();

    return response.value.map((event: any) => ({
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
  }

  public async getFlaggedEmails(count: number = 10): Promise<IEmailMessage[]> {
    const client = await this.getClient();

    const response = await client
      .api('/me/messages')
      .filter("flag/flagStatus eq 'flagged'")
      .select('id,subject,from,receivedDateTime,bodyPreview,importance,hasAttachments,isRead,webLink')
      .orderby('receivedDateTime desc')
      .top(count)
      .get();

    return response.value.map((msg: any) => ({
      id: msg.id,
      subject: msg.subject,
      from: {
        name: msg.from?.emailAddress?.name || '',
        email: msg.from?.emailAddress?.address || '',
      },
      receivedDateTime: new Date(msg.receivedDateTime),
      bodyPreview: msg.bodyPreview,
      importance: msg.importance?.toLowerCase() || 'normal',
      hasAttachments: msg.hasAttachments,
      isRead: msg.isRead,
      webLink: msg.webLink,
    }));
  }

  public async getTeamMembers(): Promise<ITeamMember[]> {
    const client = await this.getClient();

    try {
      // Get direct reports and manager
      const [peopleResponse, managerResponse] = await Promise.all([
        client.api('/me/people').filter("personType/class eq 'Person'").top(10).get(),
        client.api('/me/manager').get().catch(() => null),
      ]);

      const members: ITeamMember[] = peopleResponse.value.map((person: any) => ({
        id: person.id,
        displayName: person.displayName,
        email: person.scoredEmailAddresses?.[0]?.address || '',
        jobTitle: person.jobTitle,
        presence: 'Unknown' as const,
        photoUrl: undefined,
      }));

      if (managerResponse) {
        members.unshift({
          id: managerResponse.id,
          displayName: managerResponse.displayName,
          email: managerResponse.mail || '',
          jobTitle: managerResponse.jobTitle,
          presence: 'Unknown' as const,
          photoUrl: undefined,
        });
      }

      // Try to get presence for team members
      try {
        const userIds = members.slice(0, 10).map(m => m.id);
        if (userIds.length > 0) {
          const presenceResponse = await client
            .api('/communications/getPresencesByUserId')
            .post({ ids: userIds });

          presenceResponse.value.forEach((p: any) => {
            const member = members.find(m => m.id === p.id);
            if (member) {
              member.presence = this.mapPresence(p.availability);
            }
          });
        }
      } catch {
        // Presence API may not be available, continue without it
      }

      return members.slice(0, 10);
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  private mapPresence(availability: string): ITeamMember['presence'] {
    const presenceMap: Record<string, ITeamMember['presence']> = {
      'Available': 'Available',
      'AvailableIdle': 'Available',
      'Busy': 'Busy',
      'BusyIdle': 'Busy',
      'DoNotDisturb': 'DoNotDisturb',
      'Away': 'Away',
      'BeRightBack': 'Away',
      'Offline': 'Offline',
      'PresenceUnknown': 'Unknown',
    };
    return presenceMap[availability] || 'Unknown';
  }

  public async getSharedWithMe(count: number = 10): Promise<ISharedFile[]> {
    const client = await this.getClient();

    const response = await client
      .api('/me/drive/sharedWithMe')
      .top(count)
      .get();

    return response.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      webUrl: item.webUrl,
      size: item.size || 0,
      sharedBy: item.remoteItem?.shared?.sharedBy?.user?.displayName || 'Unknown',
      sharedDateTime: new Date(item.remoteItem?.shared?.sharedDateTime || item.createdDateTime),
      fileType: item.name?.split('.').pop()?.toLowerCase(),
    }));
  }

  public async getSiteActivity(siteUrl?: string): Promise<ISiteActivity[]> {
    const client = await this.getClient();

    try {
      // Get recent activities from user's OneDrive
      const response = await client
        .api('/me/drive/activities')
        .top(15)
        .get();

      return response.value.map((activity: any) => ({
        id: activity.id,
        action: this.mapActivityAction(activity.action),
        itemName: activity.driveItem?.name || 'Unknown item',
        itemUrl: activity.driveItem?.webUrl,
        actor: activity.actor?.user?.displayName || 'Unknown user',
        actorPhotoUrl: undefined,
        timestamp: new Date(activity.times?.recordedDateTime || activity.times?.lastRecordedDateTime),
      }));
    } catch (error) {
      console.error('Error fetching site activity:', error);
      return [];
    }
  }

  private mapActivityAction(action: any): string {
    if (action?.create) return 'created';
    if (action?.edit) return 'edited';
    if (action?.delete) return 'deleted';
    if (action?.share) return 'shared';
    if (action?.move) return 'moved';
    if (action?.rename) return 'renamed';
    if (action?.restore) return 'restored';
    if (action?.comment) return 'commented on';
    return 'modified';
  }
}
