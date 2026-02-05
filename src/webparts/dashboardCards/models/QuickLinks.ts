// ============================================
// QuickLinks Models
// Interfaces and types for quick links functionality
// ============================================

/**
 * A single quick link item
 */
export interface QuickLink {
  /** Unique identifier */
  id: string;
  /** Display title for the link */
  title: string;
  /** URL to navigate to */
  url: string;
  /** Optional icon name (Fluent UI icon) */
  icon?: string;
  /** Optional description */
  description?: string;
  /** Optional category for grouping */
  category?: string;
  /** Whether the link is marked as favorite */
  isFavorite?: boolean;
  /** Last time the link was used */
  lastUsed?: Date;
  /** Usage count */
  usageCount?: number;
}

/**
 * Category distribution data for donut chart
 */
export interface LinksCategoryData {
  /** Category name */
  label: string;
  /** Number of links in this category */
  value: number;
  /** Optional color for the segment */
  color?: string;
}

/**
 * Aggregated quick links data with groupings
 */
export interface QuickLinksData {
  /** Array of all quick links */
  links: QuickLink[];
  /** Total count of links */
  totalCount: number;
  /** Links grouped by category */
  byCategory: Record<string, QuickLink[]>;
  /** Number of distinct categories */
  categoryCount: number;
  /** Number of links marked as favorites */
  favoritesCount: number;
  /** Number of links used in last 7 days */
  recentlyUsedCount: number;
}

/**
 * Settings for the QuickLinks card
 */
export interface IQuickLinksSettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of items to display */
  maxItems: number;
  /** Whether to show category groupings */
  showCategories: boolean;
  /** Whether to show link descriptions */
  showDescriptions?: boolean;
  /** Default category for ungrouped links */
  defaultCategory?: string;
}

/**
 * Default settings for QuickLinks card
 */
export const DEFAULT_QUICK_LINKS_SETTINGS: IQuickLinksSettings = {
  enabled: true,
  maxItems: 12,
  showCategories: true,
  showDescriptions: false,
  defaultCategory: 'General',
};

/**
 * Helper function to group links by category
 */
export function groupLinksByCategory(
  links: QuickLink[],
  defaultCategory: string = 'General'
): Record<string, QuickLink[]> {
  const grouped: Record<string, QuickLink[]> = {};

  links.forEach((link) => {
    const category = link.category || defaultCategory;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(link);
  });

  return grouped;
}

/**
 * Convert raw links array to QuickLinksData structure
 */
export function toQuickLinksData(
  links: QuickLink[],
  defaultCategory: string = 'General'
): QuickLinksData {
  const byCategory = groupLinksByCategory(links, defaultCategory);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    links,
    totalCount: links.length,
    byCategory,
    categoryCount: Object.keys(byCategory).length,
    favoritesCount: links.filter(link => link.isFavorite).length,
    recentlyUsedCount: links.filter(
      link => link.lastUsed && link.lastUsed >= sevenDaysAgo
    ).length,
  };
}

/**
 * Convert grouped links to category distribution for chart
 */
export function toLinksCategoryData(
  byCategory: Record<string, QuickLink[]>
): LinksCategoryData[] {
  return Object.entries(byCategory).map(([label, links]) => ({
    label,
    value: links.length,
  }));
}

/**
 * Category display order (for consistent rendering)
 */
export const CATEGORY_ORDER = [
  'Tools',
  'Documentation',
  'Resources',
  'Communication',
  'General',
];

/**
 * Sort categories based on predefined order
 */
export function sortCategories(categories: string[]): string[] {
  return categories.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);

    // If both are in the predefined order, sort by that order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one is in the predefined order, it comes first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // Otherwise, sort alphabetically
    return a.localeCompare(b);
  });
}
