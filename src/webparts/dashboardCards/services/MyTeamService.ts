// ============================================
// MyTeamService - API Integration
// Fetches team members from Microsoft Graph
// ============================================

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  MyTeamData,
  TeamMember,
  PresenceStatus,
  IMyTeamSettings,
} from '../models/MyTeam';

export class MyTeamService {
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
   * Fetch team members data
   * Uses /me/people API for relevant contacts or /me/directReports for direct reports
   */
  public async getData(settings: IMyTeamSettings): Promise<MyTeamData> {
    const client = await this.getGraphClient();

    // Fetch people the user works with frequently
    const peopleResponse = await client
      .api('/me/people')
      .select('id,displayName,emailAddresses,jobTitle')
      .filter('personType/class eq \'Person\' and personType/subclass eq \'OrganizationUser\'')
      .top(settings.maxItems)
      .get();

    const members: TeamMember[] = peopleResponse.value.map((person: any) => ({
      id: person.id,
      displayName: person.displayName,
      email: person.emailAddresses?.[0]?.address || '',
      jobTitle: person.jobTitle,
      presence: 'Unknown' as PresenceStatus,
      photoUrl: undefined,
    }));

    // Fetch presence if enabled
    if (settings.showPresence && members.length > 0) {
      await this.enrichWithPresence(client, members);
    }

    // Fetch photos for members
    await this.enrichWithPhotos(client, members);

    // Calculate counts
    const availableCount = members.filter(m => m.presence === 'Available').length;
    const busyCount = members.filter(m => m.presence === 'Busy' || m.presence === 'DoNotDisturb').length;
    const awayCount = members.filter(m => m.presence === 'Away').length;
    const offlineCount = members.filter(m => m.presence === 'Offline' || m.presence === 'Unknown').length;

    return {
      members,
      totalCount: members.length,
      availableCount,
      busyCount,
      awayCount,
      offlineCount,
    };
  }

  /**
   * Enrich members with presence information
   */
  private async enrichWithPresence(client: MSGraphClientV3, members: TeamMember[]): Promise<void> {
    try {
      const userIds = members.map(m => m.id).filter(Boolean);
      if (userIds.length === 0) return;

      const presenceResponse = await client
        .api('/communications/getPresencesByUserId')
        .post({ ids: userIds });

      const presenceMap = new Map<string, PresenceStatus>();
      presenceResponse.value.forEach((p: any) => {
        presenceMap.set(p.id, this.mapAvailability(p.availability));
      });

      members.forEach(member => {
        if (member.id && presenceMap.has(member.id)) {
          member.presence = presenceMap.get(member.id);
        }
      });
    } catch (err) {
      console.warn('Failed to fetch presence data:', err);
      // Keep presence as Unknown for all members
    }
  }

  /**
   * Map Graph API availability to PresenceStatus
   */
  private mapAvailability(availability: string): PresenceStatus {
    switch (availability) {
      case 'Available':
      case 'AvailableIdle':
        return 'Available';
      case 'Busy':
      case 'BusyIdle':
      case 'InACall':
      case 'InAConferenceCall':
      case 'InAMeeting':
        return 'Busy';
      case 'Away':
      case 'BeRightBack':
        return 'Away';
      case 'DoNotDisturb':
      case 'Presenting':
        return 'DoNotDisturb';
      case 'Offline':
      case 'PresenceUnknown':
      default:
        return 'Offline';
    }
  }

  /**
   * Enrich members with photo URLs
   */
  private async enrichWithPhotos(client: MSGraphClientV3, members: TeamMember[]): Promise<void> {
    const photoPromises = members.map(async (member) => {
      try {
        const photoResponse = await client
          .api(`/users/${member.id}/photo/$value`)
          .get();

        if (photoResponse) {
          const blob = new Blob([photoResponse], { type: 'image/jpeg' });
          member.photoUrl = URL.createObjectURL(blob);
        }
      } catch (err) {
        // Photo not available, leave as undefined
        member.photoUrl = undefined;
      }
    });

    await Promise.all(photoPromises.map(p => p.catch(() => undefined)));
  }
}
