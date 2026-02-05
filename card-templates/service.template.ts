// ============================================
// {{CardName}} Service - API Integration
// ============================================
// Template file - Copy and rename for new cards
// Replace {{CardName}} with your card name (e.g., "UpcomingMeetings")
// Replace {{cardName}} with camelCase version (e.g., "upcomingMeetings")

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  {{CardName}}Data,
  {{CardName}}Item,
  {{CardName}}TrendData,
  I{{CardName}}Settings,
} from '../models/{{CardName}}';

export class {{CardName}}Service {
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
   * Fetch main data for the card
   */
  public async getData(settings: I{{CardName}}Settings): Promise<{{CardName}}Data> {
    const client = await this.getGraphClient();

    // Example: Fetch from Microsoft Graph
    // const response = await client
    //   .api('/me/messages')
    //   .filter("receivedDateTime ge " + startDate.toISOString())
    //   .top(settings.maxItems)
    //   .select('id,subject,receivedDateTime,from')
    //   .get();

    // Transform API response to our data model
    const items: {{CardName}}Item[] = [];

    return {
      items,
      totalCount: items.length,
    };
  }

  /**
   * Fetch trend data for charts (optional)
   */
  public async getTrendData(settings: I{{CardName}}Settings): Promise<{{CardName}}TrendData> {
    const client = await this.getGraphClient();

    // Implement trend data fetching logic
    return {
      dataPoints: [],
    };
  }

  /**
   * Perform an action on an item (optional)
   * Examples: mark complete, snooze, dismiss
   */
  public async performAction(itemId: string, action: string): Promise<void> {
    const client = await this.getGraphClient();

    // Implement action logic
    // Example: await client.api(`/me/messages/${itemId}`).patch({ isRead: true });
  }
}
