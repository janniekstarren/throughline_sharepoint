// ============================================
// Dashboard Configuration - Unified Config Model
// ============================================
// Central configuration interfaces for the grid system with category support.
// Supports admin defaults + user overrides with version-based merging.

import { CardSize } from '../types/CardSize';

/**
 * Configuration version for tracking admin changes
 * Used to detect when user preferences need migration
 */
export const CONFIG_VERSION = 1;

// ============================================
// Card Configuration
// ============================================

/**
 * Column span values for different card sizes
 * Small = 1 column, Medium = 1 column, Large = 2 columns
 */
export const CARD_COLUMN_SPANS: Record<CardSize, number> = {
  small: 1,
  medium: 1,
  large: 2,
};

/**
 * Get the column span for a given card size
 */
export function getColumnSpan(size: CardSize): number {
  return CARD_COLUMN_SPANS[size];
}

/**
 * Configuration for an individual card
 */
export interface ICardConfig {
  /** Unique card identifier */
  cardId: string;
  /** Current size (small/medium/large) */
  size: CardSize;
  /** Column span (1 for small/medium, 2 for large) */
  columnSpan: number;
  /** Whether the card is visible */
  visible: boolean;
  /** Order within its category (0-based index) */
  orderInCategory: number;
}

// ============================================
// Category Configuration
// ============================================

/**
 * Built-in category identifiers
 */
export type CategoryId =
  | 'priority'      // Waiting On You, Waiting On Others
  | 'calendar'      // Today's Agenda, Upcoming Week
  | 'tasks'         // My Tasks
  | 'email'         // Unread Inbox, Flagged Emails
  | 'files'         // Recent Files, Shared With Me
  | 'people'        // My Team
  | 'other'         // Quick Links, Site Activity, Context Switching
  | string;         // Allow custom category IDs

/**
 * Default icons for built-in categories (Fluent icon names)
 */
export const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  priority: 'Flag',
  calendar: 'Calendar',
  tasks: 'TaskList',
  email: 'Mail',
  files: 'Document',
  people: 'People',
  other: 'GridDots',
};

/**
 * Default display names for built-in categories
 */
export const DEFAULT_CATEGORY_NAMES: Record<string, string> = {
  priority: 'Priority',
  calendar: 'Calendar',
  tasks: 'Tasks',
  email: 'Email',
  files: 'Files',
  people: 'People',
  other: 'Other',
};

/**
 * Configuration for a category section
 */
export interface ICategoryConfig {
  /** Category identifier */
  categoryId: CategoryId;
  /** Display name */
  displayName: string;
  /** Icon name (Fluent icon) */
  icon: string;
  /** Order in the grid (0-based) */
  order: number;
  /** Whether the category is visible */
  visible: boolean;
  /** Whether the category is collapsed */
  collapsed: boolean;
  /** Whether users can modify this category (admin can lock) */
  userEditable: boolean;
  /** Card IDs in this category, in order */
  cardIds: string[];
}

// ============================================
// Dashboard Configuration
// ============================================

/**
 * Complete dashboard configuration
 * Represents the merged state of admin defaults + user preferences
 */
export interface IDashboardConfig {
  /** Configuration version for migration detection */
  version: number;
  /** Timestamp of last modification */
  lastUpdated: string;
  /** Category configurations in display order */
  categories: ICategoryConfig[];
  /** Card configurations indexed by card ID */
  cards: Record<string, ICardConfig>;
  /** Global settings */
  settings: IDashboardSettings;
}

/**
 * Global dashboard settings
 */
export interface IDashboardSettings {
  /** Enable animated reflow when cards change */
  animationsEnabled: boolean;
  /** Gap between cards in pixels */
  cardGap: number;
  /** Minimum card width in pixels */
  minCardWidth: number;
  /** Maximum columns at largest breakpoint */
  maxColumns: number;
}

/**
 * Default dashboard settings
 */
export const DEFAULT_DASHBOARD_SETTINGS: IDashboardSettings = {
  animationsEnabled: true,
  cardGap: 16,
  minCardWidth: 320,
  maxColumns: 4,
};

// ============================================
// Admin Configuration (WebPart Properties)
// ============================================

/**
 * Admin-level configuration stored in SharePoint WebPart properties
 * This is the "source of truth" for defaults
 */
export interface IAdminConfig {
  /** Configuration version */
  version: number;
  /** Category definitions and order */
  categories: ICategoryConfig[];
  /** Default card-to-category assignments */
  cardCategoryAssignments: Record<string, CategoryId>;
  /** Default card visibility */
  cardVisibility: Record<string, boolean>;
  /** Default card sizes */
  cardSizes: Record<string, CardSize>;
  /** Global settings */
  settings: IDashboardSettings;
}

// ============================================
// User Preferences (localStorage)
// ============================================

/**
 * User-specific overrides stored in localStorage
 * Only stores delta from admin defaults
 */
export interface IUserConfig {
  /** Version of admin config this was based on */
  baseVersion: number;
  /** Timestamp of last user modification */
  lastUpdated: string;
  /** Category order overrides (array of category IDs) */
  categoryOrder?: string[];
  /** Category visibility overrides */
  categoryVisibility?: Record<string, boolean>;
  /** Category collapsed state overrides */
  categoryCollapsed?: Record<string, boolean>;
  /** Card-to-category assignment overrides */
  cardCategoryAssignments?: Record<string, CategoryId>;
  /** Card order within categories (categoryId -> cardId[]) */
  cardOrderByCategory?: Record<string, string[]>;
  /** Card size overrides */
  cardSizes?: Record<string, CardSize>;
  /** Card visibility overrides */
  cardVisibility?: Record<string, boolean>;
  /** Settings overrides */
  settings?: Partial<IDashboardSettings>;
}

// ============================================
// Default Card-Category Assignments
// ============================================

/**
 * Default assignment of cards to categories
 */
export const DEFAULT_CARD_CATEGORY_ASSIGNMENTS: Record<string, CategoryId> = {
  'waiting-on-you': 'priority',
  'waiting-on-others': 'priority',
  'todays-agenda': 'calendar',
  'upcoming-week': 'calendar',
  'my-tasks': 'tasks',
  'unread-inbox': 'email',
  'flagged-emails': 'email',
  'recent-files': 'files',
  'shared-with-me': 'files',
  'my-team': 'people',
  'quick-links': 'other',
  'site-activity': 'other',
  'context-switching': 'other',
};

/**
 * Default category order
 */
export const DEFAULT_CATEGORY_ORDER: CategoryId[] = [
  'priority',
  'calendar',
  'tasks',
  'email',
  'files',
  'people',
  'other',
];

// ============================================
// Factory Functions
// ============================================

/**
 * Create a default category configuration
 */
export function createDefaultCategoryConfig(
  categoryId: CategoryId,
  order: number
): ICategoryConfig {
  return {
    categoryId,
    displayName: DEFAULT_CATEGORY_NAMES[categoryId] || categoryId,
    icon: DEFAULT_CATEGORY_ICONS[categoryId] || 'GridDots',
    order,
    visible: true,
    collapsed: false,
    userEditable: true,
    cardIds: Object.entries(DEFAULT_CARD_CATEGORY_ASSIGNMENTS)
      .filter(([, catId]) => catId === categoryId)
      .map(([cardId]) => cardId),
  };
}

/**
 * Create a default card configuration
 */
export function createDefaultCardConfig(
  cardId: string,
  size: CardSize = 'medium',
  orderInCategory: number = 0
): ICardConfig {
  return {
    cardId,
    size,
    columnSpan: getColumnSpan(size),
    visible: true,
    orderInCategory,
  };
}

/**
 * Create a complete default dashboard configuration
 */
export function createDefaultDashboardConfig(): IDashboardConfig {
  const categories = DEFAULT_CATEGORY_ORDER.map((categoryId, index) =>
    createDefaultCategoryConfig(categoryId, index)
  );

  const cards: Record<string, ICardConfig> = {};
  Object.keys(DEFAULT_CARD_CATEGORY_ASSIGNMENTS).forEach((cardId, index) => {
    cards[cardId] = createDefaultCardConfig(cardId, 'medium', index);
  });

  return {
    version: CONFIG_VERSION,
    lastUpdated: new Date().toISOString(),
    categories,
    cards,
    settings: { ...DEFAULT_DASHBOARD_SETTINGS },
  };
}

/**
 * Create a default admin configuration
 */
export function createDefaultAdminConfig(): IAdminConfig {
  return {
    version: CONFIG_VERSION,
    categories: DEFAULT_CATEGORY_ORDER.map((categoryId, index) =>
      createDefaultCategoryConfig(categoryId, index)
    ),
    cardCategoryAssignments: { ...DEFAULT_CARD_CATEGORY_ASSIGNMENTS },
    cardVisibility: {},
    cardSizes: {},
    settings: { ...DEFAULT_DASHBOARD_SETTINGS },
  };
}

/**
 * Create an empty user configuration
 */
export function createEmptyUserConfig(): IUserConfig {
  return {
    baseVersion: CONFIG_VERSION,
    lastUpdated: new Date().toISOString(),
  };
}
