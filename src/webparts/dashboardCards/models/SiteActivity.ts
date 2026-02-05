// ============================================
// SiteActivity Card - Data Models
// ============================================

import { TrendDataPoint } from '../components/shared/charts';

/**
 * Activity action types
 */
export type ActivityAction =
  | 'created'
  | 'modified'
  | 'edited'
  | 'deleted'
  | 'shared'
  | 'moved'
  | 'renamed'
  | 'restored'
  | 'commented';

/**
 * Individual activity item
 */
export interface ActivityItem {
  /** Unique identifier for the activity */
  id: string;
  /** Type of action performed */
  action: ActivityAction | string;
  /** Name of the item that was acted upon */
  itemName: string;
  /** URL to the item (if available) */
  itemUrl?: string;
  /** Display name of the person who performed the action */
  actor: string;
  /** Photo URL of the actor (if available) */
  actorPhotoUrl?: string;
  /** When the activity occurred */
  timestamp: Date;
}

/**
 * Trend data for the activity chart
 */
export interface ActivityTrendData {
  dataPoints: TrendDataPoint[];
  trend: 'more active' | 'less active' | 'steady';
  averageActivitiesPerDay: number;
}

/**
 * Aggregated data for the SiteActivity card
 */
export interface SiteActivityData {
  /** List of activity items */
  activities: ActivityItem[];
  /** Total count of activities */
  totalCount: number;
  /** Activities grouped by actor */
  byActor: Record<string, ActivityItem[]>;
  /** Count of activities performed by the current user */
  byYouCount: number;
  /** Count of activities performed by others */
  byOthersCount: number;
  /** Name of the most active person */
  topActorName: string;
}

/**
 * Settings interface for the SiteActivity card
 */
export interface ISiteActivitySettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of activities to display */
  maxItems: number;
  /** Number of days to look back for activities */
  daysToShow: number;
}

/**
 * Default settings for the SiteActivity card
 */
export const DEFAULT_SITE_ACTIVITY_SETTINGS: ISiteActivitySettings = {
  enabled: true,
  maxItems: 15,
  daysToShow: 7,
};
