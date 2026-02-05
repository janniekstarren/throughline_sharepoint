// ============================================
// SharedWithMe Card - Data Models
// ============================================

import { TrendDataPoint } from '../components/shared/charts';

/**
 * Shared file interface
 */
export interface SharedFile {
  id: string;
  name: string;
  webUrl: string;
  size: number;
  sharedBy: SharedByInfo;
  sharedDateTime: Date;
  fileType?: string;
  lastModifiedDateTime?: Date;
  thumbnailUrl?: string;
}

/**
 * Information about who shared the file
 */
export interface SharedByInfo {
  id: string;
  displayName: string;
  email?: string;
  photoUrl?: string;
}

/**
 * Trend data for the sharing activity chart
 */
export interface SharingTrendData {
  dataPoints: TrendDataPoint[];
  trend: 'more sharing' | 'less sharing' | 'steady';
  averageFilesPerDay: number;
}

/**
 * Aggregated data for the SharedWithMe card
 */
export interface SharedWithMeData {
  files: SharedFile[];
  totalCount: number;
  recentCount: number;
  /** Number of unique people who have shared files */
  uniqueSharersCount: number;
  /** Total size of all shared files in bytes */
  totalSizeBytes: number;
}

/**
 * Settings interface for the SharedWithMe card
 */
export interface ISharedWithMeSettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of items to display */
  maxItems: number;
  /** Number of days to consider as "recent" */
  daysRecent: number;
}

/**
 * Default settings for the SharedWithMe card
 */
export const DEFAULT_SHARED_WITH_ME_SETTINGS: ISharedWithMeSettings = {
  enabled: true,
  maxItems: 10,
  daysRecent: 7,
};
