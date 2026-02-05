// ============================================
// SiteActivityService - Fetches site activity from Microsoft Graph
// ============================================

import { MSGraphClientV3 } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  ActivityItem,
  SiteActivityData,
  ISiteActivitySettings,
  DEFAULT_SITE_ACTIVITY_SETTINGS,
} from '../models/SiteActivity';

/**
 * Service class for fetching site activity data from Microsoft Graph
 */
export class SiteActivityService {
  private graphClient: MSGraphClientV3;
  private settings: ISiteActivitySettings;

  constructor(graphClient: MSGraphClientV3, settings?: Partial<ISiteActivitySettings>) {
    this.graphClient = graphClient;
    this.settings = { ...DEFAULT_SITE_ACTIVITY_SETTINGS, ...settings };
  }

  /**
   * Creates a SiteActivityService from a WebPart context
   */
  public static async fromContext(
    context: WebPartContext,
    settings?: Partial<ISiteActivitySettings>
  ): Promise<SiteActivityService> {
    const graphClient = await context.msGraphClientFactory.getClient('3');
    return new SiteActivityService(graphClient, settings);
  }

  /**
   * Fetches site activity data from Microsoft Graph
   */
  public async getData(currentUserName?: string): Promise<SiteActivityData> {
    const activities = await this.fetchActivities();
    const byActor = this.groupByActor(activities);

    // Calculate stats
    const byYouCount = currentUserName
      ? activities.filter(a => a.actor === currentUserName).length
      : 0;
    const byOthersCount = activities.length - byYouCount;
    const topActorName = this.findTopActor(byActor);

    return {
      activities,
      totalCount: activities.length,
      byActor,
      byYouCount,
      byOthersCount,
      topActorName,
    };
  }

  /**
   * Find the most active person
   */
  private findTopActor(byActor: Record<string, ActivityItem[]>): string {
    let topActor = '';
    let maxCount = 0;

    for (const [actor, items] of Object.entries(byActor)) {
      if (items.length > maxCount) {
        maxCount = items.length;
        topActor = actor;
      }
    }

    return topActor || 'Unknown';
  }

  /**
   * Fetches raw activity data from Microsoft Graph
   */
  private async fetchActivities(): Promise<ActivityItem[]> {
    try {
      // Get recent activities from user's OneDrive
      const response = await this.graphClient
        .api('/me/drive/activities')
        .top(this.settings.maxItems)
        .get();

      const activities: ActivityItem[] = (response.value || []).map((activity: {
        id: string;
        action?: {
          create?: boolean;
          edit?: boolean;
          delete?: boolean;
          share?: boolean;
          move?: boolean;
          rename?: boolean;
          restore?: boolean;
          comment?: boolean;
        };
        driveItem?: {
          name?: string;
          webUrl?: string;
        };
        actor?: {
          user?: {
            displayName?: string;
          };
        };
        times?: {
          recordedDateTime?: string;
          lastRecordedDateTime?: string;
        };
      }) => ({
        id: activity.id,
        action: this.mapActivityAction(activity.action),
        itemName: activity.driveItem?.name || 'Unknown item',
        itemUrl: activity.driveItem?.webUrl,
        actor: activity.actor?.user?.displayName || 'Unknown user',
        actorPhotoUrl: undefined,
        timestamp: new Date(
          activity.times?.recordedDateTime ||
          activity.times?.lastRecordedDateTime ||
          new Date().toISOString()
        ),
      }));

      // Filter activities based on daysToShow setting
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.settings.daysToShow);

      return activities.filter(activity => activity.timestamp >= cutoffDate);
    } catch (error) {
      console.error('Error fetching site activity:', error);
      return [];
    }
  }

  /**
   * Maps Graph API action object to action string
   */
  private mapActivityAction(action?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    share?: boolean;
    move?: boolean;
    rename?: boolean;
    restore?: boolean;
    comment?: boolean;
  }): string {
    if (!action) return 'modified';
    if (action.create) return 'created';
    if (action.edit) return 'edited';
    if (action.delete) return 'deleted';
    if (action.share) return 'shared';
    if (action.move) return 'moved';
    if (action.rename) return 'renamed';
    if (action.restore) return 'restored';
    if (action.comment) return 'commented';
    return 'modified';
  }

  /**
   * Groups activities by actor name
   */
  private groupByActor(activities: ActivityItem[]): Record<string, ActivityItem[]> {
    return activities.reduce((groups, activity) => {
      const actor = activity.actor;
      if (!groups[actor]) {
        groups[actor] = [];
      }
      groups[actor].push(activity);
      return groups;
    }, {} as Record<string, ActivityItem[]>);
  }

  /**
   * Updates service settings
   */
  public updateSettings(settings: Partial<ISiteActivitySettings>): void {
    this.settings = { ...this.settings, ...settings };
  }
}

export default SiteActivityService;
