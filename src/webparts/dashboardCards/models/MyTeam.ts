// ============================================
// MyTeam Card - Data Models
// ============================================

/**
 * Presence status for team members
 */
export type PresenceStatus = 'Available' | 'Busy' | 'Away' | 'DoNotDisturb' | 'Offline' | 'Unknown';

/**
 * Team member interface
 */
export interface TeamMember {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  presence?: PresenceStatus;
  photoUrl?: string;
}

/**
 * Aggregated data for the MyTeam card
 */
export interface MyTeamData {
  members: TeamMember[];
  totalCount: number;
  availableCount: number;
  busyCount: number;
  awayCount: number;
  offlineCount: number;
}

/**
 * Team presence distribution data for donut chart
 */
export interface TeamPresenceData {
  available: number;
  busy: number;
  away: number;
  offline: number;
}

/**
 * Settings interface for the MyTeam card
 */
export interface IMyTeamSettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of team members to display */
  maxItems: number;
  /** Whether to show presence indicators */
  showPresence: boolean;
}

/**
 * Default settings for the MyTeam card
 */
export const DEFAULT_MY_TEAM_SETTINGS: IMyTeamSettings = {
  enabled: true,
  maxItems: 10,
  showPresence: true,
};
