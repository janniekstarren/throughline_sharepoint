// ============================================
// RecentFiles Service - API Integration
// ============================================

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  RecentFilesData,
  FileItem,
  IRecentFilesSettings,
} from '../models/RecentFiles';

export class RecentFilesService {
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
   * Extract file extension from filename
   */
  private getFileType(name: string): string {
    const parts = name.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
    return '';
  }

  /**
   * Fetch recent files from OneDrive
   */
  public async getData(settings: IRecentFilesSettings): Promise<RecentFilesData> {
    const client = await this.getGraphClient();

    const response = await client
      .api('/me/drive/recent')
      .select('id,name,webUrl,size,lastModifiedDateTime,lastModifiedBy,folder,file')
      .top(settings.maxItems)
      .get();

    const files: FileItem[] = response.value
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        webUrl: item.webUrl,
        size: item.size || 0,
        lastModifiedDateTime: new Date(item.lastModifiedDateTime),
        lastModifiedBy: item.lastModifiedBy?.user ? {
          displayName: item.lastModifiedBy.user.displayName,
          email: item.lastModifiedBy.user.email,
        } : undefined,
        isFolder: !!item.folder,
        fileType: item.file ? this.getFileType(item.name) : undefined,
      }))
      .filter((file: FileItem) => settings.showFolders || !file.isFolder);

    const folderCount = files.filter(f => f.isFolder).length;

    // Calculate document counts by type
    const docsCount = files.filter(f => {
      const type = f.fileType?.toLowerCase();
      return type === 'docx' || type === 'doc' || type === 'pdf';
    }).length;

    const sheetsCount = files.filter(f => {
      const type = f.fileType?.toLowerCase();
      return type === 'xlsx' || type === 'xls';
    }).length;

    const slidesCount = files.filter(f => {
      const type = f.fileType?.toLowerCase();
      return type === 'pptx' || type === 'ppt';
    }).length;

    return {
      files,
      totalCount: files.length,
      folderCount,
      docsCount,
      sheetsCount,
      slidesCount,
    };
  }
}
