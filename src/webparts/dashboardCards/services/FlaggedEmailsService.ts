// ============================================
// FlaggedEmails Service - API Integration
// ============================================

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  FlaggedEmailsData,
  FlaggedEmail,
  IFlaggedEmailsSettings,
  FlagStatus,
} from '../models/FlaggedEmails';

export class FlaggedEmailsService {
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
   * Fetch flagged emails from Microsoft Graph
   */
  public async getData(settings: IFlaggedEmailsSettings): Promise<FlaggedEmailsData> {
    const client = await this.getGraphClient();

    // Build filter for flagged emails
    // flagged = active flag, complete = completed flag
    let filter = "flag/flagStatus eq 'flagged'";
    if (settings.showCompleted) {
      filter = "(flag/flagStatus eq 'flagged' or flag/flagStatus eq 'complete')";
    }

    const response = await client
      .api('/me/messages')
      .filter(filter)
      .select('id,subject,from,receivedDateTime,bodyPreview,importance,hasAttachments,flag,webLink')
      .orderby('receivedDateTime desc')
      .top(settings.maxItems)
      .get();

    const emails: FlaggedEmail[] = response.value.map((email: any) => ({
      id: email.id,
      subject: email.subject || '(No Subject)',
      from: {
        name: email.from?.emailAddress?.name || 'Unknown',
        email: email.from?.emailAddress?.address || '',
      },
      receivedDateTime: new Date(email.receivedDateTime),
      bodyPreview: email.bodyPreview || '',
      importance: email.importance || 'normal',
      hasAttachments: email.hasAttachments || false,
      flagStatus: (email.flag?.flagStatus || 'notFlagged') as FlagStatus,
      webLink: email.webLink || '',
    }));

    // Count completed flags
    const completedCount = emails.filter(e => e.flagStatus === 'complete').length;

    // Calculate stats for active flags
    const activeEmails = emails.filter(e => e.flagStatus === 'flagged');
    const now = new Date();

    // Calculate average age of active flags in days
    const agesInDays = activeEmails.map(e => {
      return (now.getTime() - e.receivedDateTime.getTime()) / (1000 * 60 * 60 * 24);
    });
    const averageAgeDays = agesInDays.length > 0
      ? Math.round((agesInDays.reduce((a, b) => a + b, 0) / agesInDays.length) * 10) / 10
      : 0;

    // Find oldest active flag age in days
    const oldestFlagDays = agesInDays.length > 0
      ? Math.round(Math.max(...agesInDays))
      : 0;

    // For completed this week, we would need historical data
    // This is a placeholder - in production, you might need a separate query
    const completedThisWeek = completedCount;

    return {
      emails,
      totalCount: emails.length,
      completedCount,
      completedThisWeek,
      averageAgeDays,
      oldestFlagDays,
    };
  }
}
