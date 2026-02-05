// ============================================
// {{CardName}} Card - Data Models
// ============================================
// Template file - Copy and rename for new cards
// Replace {{CardName}} with your card name (e.g., "UpcomingMeetings")
// Replace {{cardName}} with camelCase version (e.g., "upcomingMeetings")

/**
 * Individual item in the {{CardName}} card
 * Customize fields based on your card's data requirements
 */
export interface {{CardName}}Item {
  id: string;
  title: string;
  createdDate: Date;
  // Add card-specific fields here
  // Examples:
  // description?: string;
  // status: 'pending' | 'complete';
  // priority: 'low' | 'medium' | 'high';
  // dueDate?: Date;
  // assignedTo?: Person;
}

/**
 * Aggregated data for the {{CardName}} card
 * Contains items array plus summary statistics
 */
export interface {{CardName}}Data {
  items: {{CardName}}Item[];
  totalCount: number;
  // Add summary statistics here
  // Examples:
  // overdueCount: number;
  // completedCount: number;
  // averageAge: number;
}

/**
 * Trend data for charts (optional)
 * Used when settings.showChart is true
 */
export interface {{CardName}}TrendData {
  dataPoints: Array<{
    date: Date;
    value: number;
  }>;
  // Add additional trend metrics
}

/**
 * Person/Contact information (if needed)
 */
export interface {{CardName}}Person {
  id: string;
  displayName: string;
  email: string;
  photoUrl?: string;
}

/**
 * Settings interface - mirrors property pane options
 * These settings control the card's behavior and display
 */
export interface I{{CardName}}Settings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of items to display */
  maxItems: number;
  /** Whether to show the trend chart */
  showChart: boolean;
  /** Days of history to consider */
  lookbackDays: number;
  // Add card-specific settings here
}

/**
 * Default settings for the card
 * Used when no settings are provided
 */
export const DEFAULT_{{CARD_NAME}}_SETTINGS: I{{CardName}}Settings = {
  enabled: true,
  maxItems: 10,
  showChart: true,
  lookbackDays: 30,
};
