// ============================================
// SharedWithMe Service - API Integration
// ============================================

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  SharedWithMeData,
  SharedFile,
  ISharedWithMeSettings,
} from '../models/SharedWithMe';

export class SharedWithMeService {
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
   * Get the file extension from a filename
   */
  private getFileExtension(filename: string): string | undefined {
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
    return undefined;
  }

  /**
   * Fetch files shared with the current user
   */
  public async getData(settings: ISharedWithMeSettings): Promise<SharedWithMeData> {
    const client = await this.getGraphClient();

    const response = await client
      .api('/me/drive/sharedWithMe')
      .select('id,name,webUrl,size,lastModifiedDateTime,remoteItem')
      .orderby('sharedDateTime desc')
      .top(settings.maxItems)
      .get();

    const recentThreshold = new Date();
    recentThreshold.setDate(recentThreshold.getDate() - settings.daysRecent);

    const files: SharedFile[] = response.value.map((item: any) => {
      // The sharedWithMe endpoint returns remoteItem with the actual file info
      const remoteItem = item.remoteItem || {};
      const sharedInfo = remoteItem.shared || item.shared || {};
      const sharedBy = sharedInfo.sharedBy?.user || {};

      // Get the shared date from either location
      const sharedDateTimeStr = sharedInfo.sharedDateTime || item.lastModifiedDateTime;
      const sharedDateTime = sharedDateTimeStr ? new Date(sharedDateTimeStr) : new Date();

      return {
        id: item.id,
        name: item.name || remoteItem.name || 'Unknown',
        webUrl: item.webUrl || remoteItem.webUrl || '',
        size: remoteItem.size || item.size || 0,
        sharedBy: {
          id: sharedBy.id || '',
          displayName: sharedBy.displayName || 'Unknown',
          email: sharedBy.email || '',
        },
        sharedDateTime,
        fileType: this.getFileExtension(item.name || remoteItem.name || ''),
        lastModifiedDateTime: item.lastModifiedDateTime
          ? new Date(item.lastModifiedDateTime)
          : undefined,
      };
    });

    // Count recent files (within last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    const recentCount = files.filter(
      (f) => f.sharedDateTime >= oneDayAgo
    ).length;

    // Count unique sharers
    const uniqueSharers = new Set(files.map((f) => f.sharedBy.id));
    const uniqueSharersCount = uniqueSharers.size;

    // Calculate total size
    const totalSizeBytes = files.reduce((sum, f) => sum + f.size, 0);

    return {
      files,
      totalCount: files.length,
      recentCount,
      uniqueSharersCount,
      totalSizeBytes,
    };
  }
}
