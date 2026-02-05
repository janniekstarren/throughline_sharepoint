// ============================================
// UnreadInbox Service - API Integration
// ============================================

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  UnreadInboxData,
  EmailMessage,
  IUnreadInboxSettings,
} from '../models/UnreadInbox';

export class UnreadInboxService {
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
   * Fetch unread inbox messages
   */
  public async getData(settings: IUnreadInboxSettings): Promise<UnreadInboxData> {
    const client = await this.getGraphClient();

    const response = await client
      .api('/me/mailFolders/inbox/messages')
      .filter('isRead eq false')
      .select('id,subject,from,receivedDateTime,bodyPreview,importance,hasAttachments,isRead,webLink')
      .orderby('receivedDateTime desc')
      .top(settings.maxItems)
      .get();

    const emails: EmailMessage[] = response.value.map((email: any) => ({
      id: email.id,
      subject: email.subject || '(No subject)',
      from: {
        name: email.from?.emailAddress?.name || 'Unknown',
        email: email.from?.emailAddress?.address || '',
      },
      receivedDateTime: new Date(email.receivedDateTime),
      bodyPreview: email.bodyPreview || '',
      importance: email.importance || 'normal',
      hasAttachments: email.hasAttachments || false,
      isRead: email.isRead || false,
      webLink: email.webLink,
    }));

    const highImportanceCount = emails.filter(e => e.importance === 'high').length;
    const attachmentCount = emails.filter(e => e.hasAttachments).length;

    // Calculate oldest unread hours
    const now = new Date();
    let oldestUnreadHours = 0;
    if (emails.length > 0) {
      const oldestEmail = emails.reduce((oldest, email) => {
        return email.receivedDateTime < oldest.receivedDateTime ? email : oldest;
      }, emails[0]);
      oldestUnreadHours = Math.floor(
        (now.getTime() - oldestEmail.receivedDateTime.getTime()) / (1000 * 60 * 60)
      );
    }

    return {
      emails,
      totalCount: emails.length,
      highImportanceCount,
      highPriorityCount: highImportanceCount,
      attachmentCount,
      oldestUnreadHours,
    };
  }
}
