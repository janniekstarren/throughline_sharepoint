// ============================================
// RecentFiles Card - Data Models
// ============================================

import { TrendDataPoint } from '../components/shared/charts';

/**
 * File item interface representing a recent file or folder
 */
export interface FileItem {
  /** Unique identifier for the file */
  id: string;
  /** Display name of the file */
  name: string;
  /** URL to open the file in web */
  webUrl: string;
  /** File size in bytes */
  size: number;
  /** Last modified date/time */
  lastModifiedDateTime: Date;
  /** User who last modified the file */
  lastModifiedBy?: {
    displayName: string;
    email?: string;
  };
  /** Whether this item is a folder */
  isFolder: boolean;
  /** File type/extension (e.g., 'docx', 'xlsx', 'pdf') */
  fileType?: string;
}

/**
 * Trend data for the files chart
 */
export interface FilesTrendData {
  dataPoints: TrendDataPoint[];
  trend: 'more active' | 'less active' | 'steady';
  averageFilesPerDay: number;
}

/**
 * Aggregated data for the RecentFiles card
 */
export interface RecentFilesData {
  /** Array of recent files */
  files: FileItem[];
  /** Total count of files */
  totalCount: number;
  /** Count of folders */
  folderCount: number;
  /** Count of document files (.docx, .doc, .pdf) */
  docsCount: number;
  /** Count of spreadsheet files (.xlsx, .xls) */
  sheetsCount: number;
  /** Count of presentation files (.pptx, .ppt) */
  slidesCount: number;
}

/**
 * Settings interface for the RecentFiles card
 */
export interface IRecentFilesSettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of files to display */
  maxItems: number;
  /** Whether to show folders in the list */
  showFolders: boolean;
}

/**
 * Default settings for the RecentFiles card
 */
export const DEFAULT_RECENT_FILES_SETTINGS: IRecentFilesSettings = {
  enabled: true,
  maxItems: 10,
  showFolders: true,
};
