// ============================================
// useDashboardConfig - React Hook for Dashboard Configuration
// ============================================
// Wraps ConfigurationService for React components.
// Provides reactive config state and update methods.

import * as React from 'react';
import {
  ConfigurationService,
  createConfigurationService,
  extractAdminConfigFromProperties,
  isLocalStorageAvailable,
} from '../services/ConfigurationService';
import {
  IDashboardConfig,
  IAdminConfig,
  ICategoryConfig,
  ICardConfig,
  createDefaultDashboardConfig,
} from '../models/DashboardConfiguration';
import { CardSize, getNextCardSize } from '../types/CardSize';

// ============================================
// Hook Options
// ============================================

export interface IUseDashboardConfigOptions {
  /** Current user's login name or email */
  userId: string;
  /** Optional webpart instance ID for multiple dashboards */
  instanceId?: string;
  /** Admin configuration from WebPart properties */
  adminConfig?: IAdminConfig;
  /** Legacy WebPart properties (will be converted to IAdminConfig) */
  webPartProperties?: {
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
  };
}

// ============================================
// Hook Result
// ============================================

export interface IUseDashboardConfigResult {
  /** Merged dashboard configuration */
  config: IDashboardConfig;
  /** Categories in display order */
  categories: ICategoryConfig[];
  /** All card configurations */
  cards: Record<string, ICardConfig>;
  /** Whether localStorage is available */
  isStorageAvailable: boolean;
  /** Whether user has custom preferences */
  hasUserOverrides: boolean;
  /** Loading state */
  isLoading: boolean;

  // ============================================
  // Card Actions
  // ============================================

  /** Get a specific card's configuration */
  getCardConfig: (cardId: string) => ICardConfig | undefined;
  /** Get a card's current size */
  getCardSize: (cardId: string) => CardSize;
  /** Set a card's size */
  setCardSize: (cardId: string, size: CardSize) => void;
  /** Cycle a card's size (small → medium → large → small) */
  cycleCardSize: (cardId: string) => void;
  /** Set a card's visibility */
  setCardVisibility: (cardId: string, visible: boolean) => void;
  /** Move a card to a different category */
  moveCardToCategory: (cardId: string, targetCategoryId: string) => void;
  /** Reorder cards within a category */
  reorderCardsInCategory: (categoryId: string, cardIds: string[]) => void;

  // ============================================
  // Category Actions
  // ============================================

  /** Get a specific category's configuration */
  getCategoryConfig: (categoryId: string) => ICategoryConfig | undefined;
  /** Set category collapsed state */
  setCategoryCollapsed: (categoryId: string, collapsed: boolean) => void;
  /** Toggle category collapsed state */
  toggleCategoryCollapsed: (categoryId: string) => void;
  /** Reorder categories */
  reorderCategories: (categoryIds: string[]) => void;

  // ============================================
  // Global Actions
  // ============================================

  /** Reset all user preferences to admin defaults */
  resetToDefaults: () => void;
  /** Force reload configuration */
  reload: () => void;
}

// ============================================
// Hook Implementation
// ============================================

export function useDashboardConfig(
  options: IUseDashboardConfigOptions
): IUseDashboardConfigResult {
  const { userId, instanceId, adminConfig: providedAdminConfig, webPartProperties } = options;

  // Service ref (persists across renders)
  const serviceRef = React.useRef<ConfigurationService | null>(null);

  // State
  const [config, setConfig] = React.useState<IDashboardConfig>(createDefaultDashboardConfig);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasUserOverrides, setHasUserOverrides] = React.useState(false);

  // Check localStorage availability
  const isStorageAvailable = React.useMemo(() => isLocalStorageAvailable(), []);

  // Initialize service and load config
  React.useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Create or update service
    serviceRef.current = createConfigurationService(userId, instanceId);

    // Determine admin config source
    let adminConfig: IAdminConfig;
    if (providedAdminConfig) {
      adminConfig = providedAdminConfig;
    } else if (webPartProperties) {
      adminConfig = extractAdminConfigFromProperties(webPartProperties);
    } else {
      // Use defaults
      const { createDefaultAdminConfig } = require('../models/DashboardConfiguration');
      adminConfig = createDefaultAdminConfig();
    }

    // Load merged config
    const mergedConfig = serviceRef.current.loadConfig(adminConfig);
    setConfig(mergedConfig);
    setHasUserOverrides(serviceRef.current.hasUserOverrides());
    setIsLoading(false);

    console.log('[useDashboardConfig] Config loaded for user:', userId);
  }, [userId, instanceId, providedAdminConfig, webPartProperties]);

  // ============================================
  // Card Actions
  // ============================================

  const getCardConfig = React.useCallback(
    (cardId: string): ICardConfig | undefined => {
      return config.cards[cardId];
    },
    [config.cards]
  );

  const getCardSize = React.useCallback(
    (cardId: string): CardSize => {
      return config.cards[cardId]?.size || 'medium';
    },
    [config.cards]
  );

  const setCardSize = React.useCallback(
    (cardId: string, size: CardSize): void => {
      if (!serviceRef.current) return;
      const newConfig = serviceRef.current.updateCardSize(cardId, size);
      setConfig(newConfig);
      setHasUserOverrides(serviceRef.current.hasUserOverrides());
    },
    []
  );

  const cycleCardSize = React.useCallback(
    (cardId: string): void => {
      const currentSize = getCardSize(cardId);
      const nextSize = getNextCardSize(currentSize);
      setCardSize(cardId, nextSize);
    },
    [getCardSize, setCardSize]
  );

  const setCardVisibility = React.useCallback(
    (cardId: string, visible: boolean): void => {
      if (!serviceRef.current) return;
      const newConfig = serviceRef.current.updateCardVisibility(cardId, visible);
      setConfig(newConfig);
      setHasUserOverrides(serviceRef.current.hasUserOverrides());
    },
    []
  );

  const moveCardToCategory = React.useCallback(
    (cardId: string, targetCategoryId: string): void => {
      if (!serviceRef.current) return;
      const newConfig = serviceRef.current.moveCardToCategory(cardId, targetCategoryId);
      setConfig(newConfig);
      setHasUserOverrides(serviceRef.current.hasUserOverrides());
    },
    []
  );

  const reorderCardsInCategory = React.useCallback(
    (categoryId: string, cardIds: string[]): void => {
      if (!serviceRef.current) return;
      const newConfig = serviceRef.current.updateCardOrderInCategory(categoryId, cardIds);
      setConfig(newConfig);
      setHasUserOverrides(serviceRef.current.hasUserOverrides());
    },
    []
  );

  // ============================================
  // Category Actions
  // ============================================

  const getCategoryConfig = React.useCallback(
    (categoryId: string): ICategoryConfig | undefined => {
      return config.categories.find(c => c.categoryId === categoryId);
    },
    [config.categories]
  );

  const setCategoryCollapsed = React.useCallback(
    (categoryId: string, collapsed: boolean): void => {
      if (!serviceRef.current) return;
      const newConfig = serviceRef.current.updateCategoryCollapsed(categoryId, collapsed);
      setConfig(newConfig);
      setHasUserOverrides(serviceRef.current.hasUserOverrides());
    },
    []
  );

  const toggleCategoryCollapsed = React.useCallback(
    (categoryId: string): void => {
      const currentCollapsed = getCategoryConfig(categoryId)?.collapsed ?? false;
      setCategoryCollapsed(categoryId, !currentCollapsed);
    },
    [getCategoryConfig, setCategoryCollapsed]
  );

  const reorderCategories = React.useCallback(
    (categoryIds: string[]): void => {
      if (!serviceRef.current) return;
      const newConfig = serviceRef.current.updateCategoryOrder(categoryIds);
      setConfig(newConfig);
      setHasUserOverrides(serviceRef.current.hasUserOverrides());
    },
    []
  );

  // ============================================
  // Global Actions
  // ============================================

  const resetToDefaults = React.useCallback((): void => {
    if (!serviceRef.current) return;
    const newConfig = serviceRef.current.resetToDefaults();
    setConfig(newConfig);
    setHasUserOverrides(false);
  }, []);

  const reload = React.useCallback((): void => {
    if (!serviceRef.current || !userId) return;

    // Determine admin config source
    let adminConfig: IAdminConfig;
    if (providedAdminConfig) {
      adminConfig = providedAdminConfig;
    } else if (webPartProperties) {
      adminConfig = extractAdminConfigFromProperties(webPartProperties);
    } else {
      const { createDefaultAdminConfig } = require('../models/DashboardConfiguration');
      adminConfig = createDefaultAdminConfig();
    }

    const mergedConfig = serviceRef.current.loadConfig(adminConfig);
    setConfig(mergedConfig);
    setHasUserOverrides(serviceRef.current.hasUserOverrides());
  }, [userId, providedAdminConfig, webPartProperties]);

  // ============================================
  // Return
  // ============================================

  return {
    config,
    categories: config.categories,
    cards: config.cards,
    isStorageAvailable,
    hasUserOverrides,
    isLoading,

    // Card actions
    getCardConfig,
    getCardSize,
    setCardSize,
    cycleCardSize,
    setCardVisibility,
    moveCardToCategory,
    reorderCardsInCategory,

    // Category actions
    getCategoryConfig,
    setCategoryCollapsed,
    toggleCategoryCollapsed,
    reorderCategories,

    // Global actions
    resetToDefaults,
    reload,
  };
}
