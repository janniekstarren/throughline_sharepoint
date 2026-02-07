// ============================================
// Configuration Service - Admin + User Config Merge
// ============================================
// Handles loading, merging, and persisting dashboard configuration.
// Merges admin defaults from WebPart properties with user preferences from localStorage.

import {
  IDashboardConfig,
  IAdminConfig,
  IUserConfig,
  ICategoryConfig,
  ICardConfig,
  CONFIG_VERSION,
  DEFAULT_DASHBOARD_SETTINGS,
  createDefaultDashboardConfig,
  createEmptyUserConfig,
  getColumnSpan,
} from '../models/DashboardConfiguration';
import { CardSize } from '../types/CardSize';

// ============================================
// Storage Keys
// ============================================

const USER_CONFIG_KEY_PREFIX = 'throughline_dashboard_config_';

/**
 * Generate storage key for user configuration
 */
function getUserConfigKey(userId: string, instanceId?: string): string {
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9@._-]/g, '_');
  return instanceId
    ? `${USER_CONFIG_KEY_PREFIX}${sanitizedUserId}_${instanceId}`
    : `${USER_CONFIG_KEY_PREFIX}${sanitizedUserId}`;
}

// ============================================
// Configuration Service
// ============================================

export class ConfigurationService {
  private userId: string;
  private instanceId?: string;
  private adminConfig: IAdminConfig | null = null;
  private userConfig: IUserConfig | null = null;
  private mergedConfig: IDashboardConfig | null = null;

  constructor(userId: string, instanceId?: string) {
    this.userId = userId;
    this.instanceId = instanceId;
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Load and merge configuration
   * @param adminConfig - Admin configuration from WebPart properties
   * @returns Merged dashboard configuration
   */
  public loadConfig(adminConfig: IAdminConfig): IDashboardConfig {
    this.adminConfig = adminConfig;
    this.userConfig = this.loadUserConfig();
    this.mergedConfig = this.mergeConfigs(adminConfig, this.userConfig);
    return this.mergedConfig;
  }

  /**
   * Get the current merged configuration
   */
  public getConfig(): IDashboardConfig {
    if (!this.mergedConfig) {
      return createDefaultDashboardConfig();
    }
    return this.mergedConfig;
  }

  /**
   * Update user configuration and persist
   * @param updates - Partial user config updates
   */
  public updateUserConfig(updates: Partial<IUserConfig>): IDashboardConfig {
    if (!this.adminConfig) {
      console.warn('[ConfigurationService] No admin config loaded');
      return this.getConfig();
    }

    // Merge updates into existing user config
    this.userConfig = {
      ...this.userConfig,
      ...updates,
      baseVersion: CONFIG_VERSION,
      lastUpdated: new Date().toISOString(),
    } as IUserConfig;

    // Persist to localStorage
    this.saveUserConfig(this.userConfig);

    // Re-merge and return
    this.mergedConfig = this.mergeConfigs(this.adminConfig, this.userConfig);
    return this.mergedConfig;
  }

  /**
   * Update a single card's size
   */
  public updateCardSize(cardId: string, size: CardSize): IDashboardConfig {
    const currentSizes = this.userConfig?.cardSizes || {};
    return this.updateUserConfig({
      cardSizes: { ...currentSizes, [cardId]: size },
    });
  }

  /**
   * Update a single card's visibility
   */
  public updateCardVisibility(cardId: string, visible: boolean): IDashboardConfig {
    const currentVisibility = this.userConfig?.cardVisibility || {};
    return this.updateUserConfig({
      cardVisibility: { ...currentVisibility, [cardId]: visible },
    });
  }

  /**
   * Update category order
   */
  public updateCategoryOrder(categoryIds: string[]): IDashboardConfig {
    return this.updateUserConfig({
      categoryOrder: categoryIds,
    });
  }

  /**
   * Update category collapsed state
   */
  public updateCategoryCollapsed(categoryId: string, collapsed: boolean): IDashboardConfig {
    const currentCollapsed = this.userConfig?.categoryCollapsed || {};
    return this.updateUserConfig({
      categoryCollapsed: { ...currentCollapsed, [categoryId]: collapsed },
    });
  }

  /**
   * Update card order within a category
   */
  public updateCardOrderInCategory(categoryId: string, cardIds: string[]): IDashboardConfig {
    const currentOrders = this.userConfig?.cardOrderByCategory || {};
    return this.updateUserConfig({
      cardOrderByCategory: { ...currentOrders, [categoryId]: cardIds },
    });
  }

  /**
   * Move a card to a different category
   */
  public moveCardToCategory(cardId: string, targetCategoryId: string): IDashboardConfig {
    const currentAssignments = this.userConfig?.cardCategoryAssignments || {};
    return this.updateUserConfig({
      cardCategoryAssignments: { ...currentAssignments, [cardId]: targetCategoryId },
    });
  }

  /**
   * Reset user configuration to admin defaults
   */
  public resetToDefaults(): IDashboardConfig {
    this.userConfig = createEmptyUserConfig();
    this.clearUserConfig();

    if (this.adminConfig) {
      this.mergedConfig = this.mergeConfigs(this.adminConfig, this.userConfig);
    } else {
      this.mergedConfig = createDefaultDashboardConfig();
    }

    return this.mergedConfig;
  }

  /**
   * Check if user has any custom preferences
   */
  public hasUserOverrides(): boolean {
    if (!this.userConfig) return false;

    return !!(
      this.userConfig.categoryOrder?.length ||
      Object.keys(this.userConfig.categoryVisibility || {}).length ||
      Object.keys(this.userConfig.categoryCollapsed || {}).length ||
      Object.keys(this.userConfig.cardCategoryAssignments || {}).length ||
      Object.keys(this.userConfig.cardOrderByCategory || {}).length ||
      Object.keys(this.userConfig.cardSizes || {}).length ||
      Object.keys(this.userConfig.cardVisibility || {}).length ||
      Object.keys(this.userConfig.settings || {}).length
    );
  }

  // ============================================
  // Private Methods
  // ============================================

  /**
   * Load user configuration from localStorage
   */
  private loadUserConfig(): IUserConfig {
    try {
      const key = getUserConfigKey(this.userId, this.instanceId);
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored) as IUserConfig;
        console.log('[ConfigurationService] Loaded user config for:', this.userId);
        return parsed;
      }
    } catch (error) {
      console.warn('[ConfigurationService] Failed to load user config:', error);
    }

    return createEmptyUserConfig();
  }

  /**
   * Save user configuration to localStorage
   */
  private saveUserConfig(config: IUserConfig): void {
    try {
      const key = getUserConfigKey(this.userId, this.instanceId);
      localStorage.setItem(key, JSON.stringify(config));
      console.log('[ConfigurationService] Saved user config for:', this.userId);
    } catch (error) {
      console.warn('[ConfigurationService] Failed to save user config:', error);
    }
  }

  /**
   * Clear user configuration from localStorage
   */
  private clearUserConfig(): void {
    try {
      const key = getUserConfigKey(this.userId, this.instanceId);
      localStorage.removeItem(key);
      console.log('[ConfigurationService] Cleared user config for:', this.userId);
    } catch (error) {
      console.warn('[ConfigurationService] Failed to clear user config:', error);
    }
  }

  /**
   * Merge admin and user configurations
   */
  private mergeConfigs(admin: IAdminConfig, user: IUserConfig): IDashboardConfig {
    // Check for version mismatch - may need migration
    if (user.baseVersion && user.baseVersion < admin.version) {
      console.log('[ConfigurationService] User config version mismatch, migrating...');
      user = this.migrateUserConfig(user, admin.version);
    }

    // Merge categories
    const categories = this.mergeCategories(admin, user);

    // Merge cards
    const cards = this.mergeCards(admin, user, categories);

    // Merge settings
    const settings = {
      ...DEFAULT_DASHBOARD_SETTINGS,
      ...admin.settings,
      ...(user.settings || {}),
    };

    return {
      version: admin.version,
      lastUpdated: user.lastUpdated || new Date().toISOString(),
      categories,
      cards,
      settings,
    };
  }

  /**
   * Merge category configurations
   */
  private mergeCategories(admin: IAdminConfig, user: IUserConfig): ICategoryConfig[] {
    // Start with admin categories
    const adminCategories = new Map(
      admin.categories.map(cat => [cat.categoryId, cat])
    );

    // Apply user order if specified
    let orderedCategoryIds: string[];
    if (user.categoryOrder && user.categoryOrder.length > 0) {
      // User order, plus any new admin categories at the end
      const adminCategoryIds = admin.categories.map(c => c.categoryId);
      const newCategories = adminCategoryIds.filter(id => !user.categoryOrder!.includes(id));
      orderedCategoryIds = [...user.categoryOrder, ...newCategories];
    } else {
      orderedCategoryIds = admin.categories.map(c => c.categoryId);
    }

    // Build merged categories
    return orderedCategoryIds
      .filter(id => adminCategories.has(id))
      .map((categoryId, index) => {
        const adminCat = adminCategories.get(categoryId)!;

        // Apply user overrides
        const visible = user.categoryVisibility?.[categoryId] ?? adminCat.visible;
        const collapsed = user.categoryCollapsed?.[categoryId] ?? adminCat.collapsed;

        // Apply user card order within category
        let cardIds = adminCat.cardIds;
        if (user.cardOrderByCategory?.[categoryId]) {
          const userOrder = user.cardOrderByCategory[categoryId];
          // Keep user order, add any new admin cards
          const newCards = adminCat.cardIds.filter(id => !userOrder.includes(id));
          cardIds = [...userOrder, ...newCards];
        }

        // Apply user card-category reassignments
        if (user.cardCategoryAssignments) {
          // Remove cards that user moved to other categories
          cardIds = cardIds.filter(cardId => {
            const userAssignment = user.cardCategoryAssignments![cardId];
            return userAssignment === undefined || userAssignment === categoryId;
          });

          // Add cards that user moved TO this category
          const movedIn = Object.entries(user.cardCategoryAssignments)
            .filter(([, cat]) => cat === categoryId)
            .map(([cardId]) => cardId)
            .filter(cardId => !cardIds.includes(cardId));
          cardIds = [...cardIds, ...movedIn];
        }

        return {
          ...adminCat,
          order: index,
          visible,
          collapsed,
          cardIds,
        };
      });
  }

  /**
   * Merge card configurations
   */
  private mergeCards(
    admin: IAdminConfig,
    user: IUserConfig,
    categories: ICategoryConfig[]
  ): Record<string, ICardConfig> {
    const cards: Record<string, ICardConfig> = {};

    // Build a set of all card IDs from categories
    const allCardIds = new Set<string>();
    categories.forEach(cat => cat.cardIds.forEach(id => allCardIds.add(id)));

    // Also include any cards from admin that might not be in categories
    Object.keys(admin.cardCategoryAssignments).forEach(id => allCardIds.add(id));

    // Build card configs
    allCardIds.forEach(cardId => {
      // Determine size
      const size: CardSize = user.cardSizes?.[cardId] ??
        admin.cardSizes[cardId] ??
        'medium';

      // Determine visibility
      const visible = user.cardVisibility?.[cardId] ??
        admin.cardVisibility[cardId] ??
        true;

      // Find order in category
      let orderInCategory = 0;
      for (const cat of categories) {
        const index = cat.cardIds.indexOf(cardId);
        if (index >= 0) {
          orderInCategory = index;
          break;
        }
      }

      cards[cardId] = {
        cardId,
        size,
        columnSpan: getColumnSpan(size),
        visible,
        orderInCategory,
      };
    });

    return cards;
  }

  /**
   * Migrate user config from old version to new version
   * Currently a no-op placeholder for future migrations
   */
  private migrateUserConfig(user: IUserConfig, targetVersion: number): IUserConfig {
    // For now, just update the version
    // Add actual migration logic here when CONFIG_VERSION changes
    return {
      ...user,
      baseVersion: targetVersion,
    };
  }
}

// ============================================
// Factory Function
// ============================================

/**
 * Create a ConfigurationService instance
 */
export function createConfigurationService(
  userId: string,
  instanceId?: string
): ConfigurationService {
  return new ConfigurationService(userId, instanceId);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract admin config from WebPart properties
 * This is a helper to convert legacy WebPart properties to IAdminConfig format
 */
export function extractAdminConfigFromProperties(properties: {
  cardOrder?: string[];
  cardVisibility?: Record<string, boolean>;
  categoryOrder?: string[];
  categoryConfig?: Record<string, {
    displayName?: string;
    icon?: string;
    visible?: boolean;
    collapsed?: boolean;
    userEditable?: boolean;
  }>;
  cardCategoryAssignment?: Record<string, string>;
  cardSizes?: Record<string, CardSize>;
}): IAdminConfig {
  const {
    cardCategoryAssignment = {},
    cardVisibility = {},
    cardSizes = {},
    categoryConfig = {},
    categoryOrder = [],
  } = properties;

  // Import defaults
  const {
    DEFAULT_CARD_CATEGORY_ASSIGNMENTS,
    DEFAULT_CATEGORY_ORDER,
    DEFAULT_CATEGORY_NAMES,
    DEFAULT_CATEGORY_ICONS,
  } = require('../models/DashboardConfiguration');

  // Merge with defaults
  const mergedAssignments = { ...DEFAULT_CARD_CATEGORY_ASSIGNMENTS, ...cardCategoryAssignment };
  const mergedCategoryOrder = categoryOrder.length > 0 ? categoryOrder : DEFAULT_CATEGORY_ORDER;

  // Build category configs
  const categories: ICategoryConfig[] = mergedCategoryOrder.map((categoryId: string, index: number) => {
    const config = categoryConfig[categoryId] || {};
    const cardIds = Object.entries(mergedAssignments)
      .filter(([, catId]) => catId === categoryId)
      .map(([cardId]) => cardId);

    return {
      categoryId,
      displayName: config.displayName || DEFAULT_CATEGORY_NAMES[categoryId] || categoryId,
      icon: config.icon || DEFAULT_CATEGORY_ICONS[categoryId] || 'GridDots',
      order: index,
      visible: config.visible ?? true,
      collapsed: config.collapsed ?? false,
      userEditable: config.userEditable ?? true,
      cardIds,
    };
  });

  return {
    version: CONFIG_VERSION,
    categories,
    cardCategoryAssignments: mergedAssignments,
    cardVisibility,
    cardSizes,
    settings: { ...DEFAULT_DASHBOARD_SETTINGS },
  };
}
