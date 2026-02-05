// ============================================
// QuickLinks Service
// Fetches and manages quick links data
// Can source from SharePoint list or configured links
// ============================================

import { MSGraphClientV3 } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  QuickLink,
  QuickLinksData,
  IQuickLinksSettings,
  DEFAULT_QUICK_LINKS_SETTINGS,
  toQuickLinksData,
} from '../models/QuickLinks';

/**
 * Raw SharePoint list item for quick links
 */
interface SPQuickLinkItem {
  Id: number;
  Title: string;
  URL: { Url: string; Description?: string };
  Icon?: string;
  Description?: string;
  Category?: string;
  SortOrder?: number;
}

/**
 * Service for fetching and managing quick links
 */
export class QuickLinksService {
  private graphClient: MSGraphClientV3;
  private context: WebPartContext;
  private settings: IQuickLinksSettings;
  private cache: QuickLinksData | null = null;
  private cacheTimestamp: Date | null = null;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    graphClient: MSGraphClientV3,
    context: WebPartContext,
    settings: IQuickLinksSettings = DEFAULT_QUICK_LINKS_SETTINGS
  ) {
    this.graphClient = graphClient;
    this.context = context;
    this.settings = settings;
  }

  /**
   * Get quick links data
   * Tries to fetch from SharePoint list first, falls back to configured links
   */
  public async getData(): Promise<QuickLinksData> {
    // Check cache
    if (this.cache && this.cacheTimestamp) {
      const cacheAge = new Date().getTime() - this.cacheTimestamp.getTime();
      if (cacheAge < this.CACHE_DURATION_MS) {
        return this.cache;
      }
    }

    try {
      // Try to fetch from SharePoint list
      const links = await this.fetchFromSharePointList();
      if (links.length > 0) {
        const data = toQuickLinksData(
          links.slice(0, this.settings.maxItems),
          this.settings.defaultCategory
        );
        this.cache = data;
        this.cacheTimestamp = new Date();
        return data;
      }
    } catch (error) {
      console.warn('Failed to fetch quick links from SharePoint list:', error);
    }

    // Fall back to default configured links
    const defaultLinks = this.getDefaultLinks();
    const data = toQuickLinksData(
      defaultLinks.slice(0, this.settings.maxItems),
      this.settings.defaultCategory
    );
    this.cache = data;
    this.cacheTimestamp = new Date();
    return data;
  }

  /**
   * Fetch quick links from a SharePoint list named "QuickLinks"
   */
  private async fetchFromSharePointList(): Promise<QuickLink[]> {
    try {
      // Query the QuickLinks list using Graph API
      const response = await this.graphClient
        .api(`/sites/${this.getSiteId()}/lists/QuickLinks/items`)
        .expand('fields')
        .select('id,fields')
        .top(this.settings.maxItems)
        .get();

      if (!response.value || response.value.length === 0) {
        return [];
      }

      // Map SharePoint items to QuickLink objects
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return response.value.map((item: any) => {
        const fields = item.fields as SPQuickLinkItem;
        return {
          id: `sp-${item.id}`,
          title: fields.Title,
          url: fields.URL?.Url || '',
          icon: fields.Icon,
          description: fields.Description || fields.URL?.Description,
          category: fields.Category,
        };
      }).filter((link: QuickLink) => link.url); // Filter out items without URLs
    } catch (error) {
      // List might not exist or user doesn't have access
      console.debug('QuickLinks list not available:', error);
      return [];
    }
  }

  /**
   * Get the Graph site ID from the current context
   */
  private getSiteId(): string {
    const { web, site } = this.context.pageContext;
    // Format: {hostname},{siteId},{webId}
    const hostname = new URL(site.absoluteUrl).hostname;
    return `${hostname},${site.id},${web.id}`;
  }

  /**
   * Get default quick links when no SharePoint list is available
   */
  private getDefaultLinks(): QuickLink[] {
    const now = new Date();
    const daysAgo = (days: number): Date => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'default-1',
        title: 'Outlook',
        url: 'https://outlook.office.com',
        icon: 'Mail',
        description: 'Email and calendar',
        category: 'Communication',
        isFavorite: true,
        lastUsed: daysAgo(0),
        usageCount: 50,
      },
      {
        id: 'default-2',
        title: 'Teams',
        url: 'https://teams.microsoft.com',
        icon: 'TeamsLogo',
        description: 'Chat and meetings',
        category: 'Communication',
        isFavorite: true,
        lastUsed: daysAgo(0),
        usageCount: 42,
      },
      {
        id: 'default-3',
        title: 'OneDrive',
        url: 'https://onedrive.com',
        icon: 'OneDrive',
        description: 'Personal files',
        category: 'Tools',
        isFavorite: false,
        lastUsed: daysAgo(1),
        usageCount: 25,
      },
      {
        id: 'default-4',
        title: 'SharePoint',
        url: this.context.pageContext.web.absoluteUrl,
        icon: 'SharepointLogo',
        description: 'Team site',
        category: 'Tools',
        isFavorite: false,
        lastUsed: daysAgo(2),
        usageCount: 18,
      },
      {
        id: 'default-5',
        title: 'Planner',
        url: 'https://tasks.office.com',
        icon: 'PlannerLogo',
        description: 'Task management',
        category: 'Tools',
        isFavorite: true,
        lastUsed: daysAgo(1),
        usageCount: 30,
      },
      {
        id: 'default-6',
        title: 'OneNote',
        url: 'https://onenote.com',
        icon: 'OneNoteLogo',
        description: 'Notes and notebooks',
        category: 'Documentation',
        isFavorite: false,
        lastUsed: daysAgo(5),
        usageCount: 12,
      },
    ];
  }

  /**
   * Clear the cache to force a fresh fetch
   */
  public clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Update service settings
   */
  public updateSettings(settings: Partial<IQuickLinksSettings>): void {
    this.settings = { ...this.settings, ...settings };
    // Clear cache when settings change
    this.clearCache();
  }

  /**
   * Get current settings
   */
  public getSettings(): IQuickLinksSettings {
    return { ...this.settings };
  }
}

export default QuickLinksService;
