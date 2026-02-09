// ============================================
// useCardPreferences - Per-user card catalog preferences
// Manages pinned, hidden, and category collapse state
// ============================================

import * as React from 'react';
import { isLocalStorageAvailable } from '../services/UserPreferencesService';

// ============================================
// Types
// ============================================

interface ICardPreferences {
  pinnedCardIds: string[];
  hiddenCardIds: string[];
  collapsedCategories: string[];
  hideLockedCards: boolean;
  hidePlaceholderCards: boolean;
  /** User override for greeting style (undefined = use admin default) */
  salutationType?: string;
  /** User override for theme mode (undefined = use admin default) */
  themeMode?: string;
  /** User override for category nav mode (undefined = use admin default) */
  navMode?: string;
  /** User preference: enable/disable integrations (default true) */
  integrationsEnabled: boolean;
  /** User preference: float menu (sticky) or fixed at top (default: collapsed=true, expanded=false) */
  floatMenu?: boolean;
}

export interface IUseCardPreferencesResult {
  pinnedCardIds: string[];
  hiddenCardIds: string[];
  collapsedCategories: string[];
  hideLockedCards: boolean;
  hidePlaceholderCards: boolean;
  /** User override for greeting style (undefined = use admin default) */
  salutationType?: string;
  /** User override for theme mode (undefined = use admin default) */
  themeMode?: string;
  /** User override for category nav mode (undefined = use admin default) */
  navMode?: string;
  /** User preference: enable/disable integrations (default true) */
  integrationsEnabled: boolean;
  /** User preference: float menu (sticky) or fixed at top */
  floatMenu?: boolean;
  isPinned: (cardId: string) => boolean;
  isHidden: (cardId: string) => boolean;
  isCategoryCollapsed: (categoryId: string) => boolean;
  togglePin: (cardId: string) => void;
  toggleHide: (cardId: string) => void;
  toggleCategoryCollapse: (categoryId: string) => void;
  setHideLockedCards: (hide: boolean) => void;
  setHidePlaceholderCards: (hide: boolean) => void;
  setSalutationType: (type: string | undefined) => void;
  setThemeMode: (mode: string | undefined) => void;
  setNavMode: (mode: string | undefined) => void;
  setIntegrationsEnabled: (enabled: boolean) => void;
  setFloatMenu: (float: boolean | undefined) => void;
  expandAllCategories: () => void;
  collapseAllCategories: (categoryIds: string[]) => void;
}

// ============================================
// Storage helpers
// ============================================

const PREFS_KEY_PREFIX = 'throughline_card_prefs_';

function getStorageKey(userId: string): string {
  return `${PREFS_KEY_PREFIX}${userId}`;
}

function loadPrefs(userId: string): ICardPreferences {
  try {
    if (!isLocalStorageAvailable()) return getDefaults();
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return getDefaults();
    return { ...getDefaults(), ...JSON.parse(raw) };
  } catch {
    return getDefaults();
  }
}

function savePrefs(userId: string, prefs: ICardPreferences): void {
  try {
    if (!isLocalStorageAvailable()) return;
    localStorage.setItem(getStorageKey(userId), JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}

function getDefaults(): ICardPreferences {
  return {
    pinnedCardIds: [],
    hiddenCardIds: [],
    collapsedCategories: [],
    hideLockedCards: false,
    hidePlaceholderCards: false,
    integrationsEnabled: true,
  };
}

// ============================================
// Hook
// ============================================

export function useCardPreferences(userId: string): IUseCardPreferencesResult {
  const [prefs, setPrefs] = React.useState<ICardPreferences>(() => loadPrefs(userId));

  // Reload when userId changes
  React.useEffect(() => {
    if (userId) {
      setPrefs(loadPrefs(userId));
    }
  }, [userId]);

  // Persist helper
  const persist = React.useCallback(
    (updated: ICardPreferences) => {
      setPrefs(updated);
      if (userId) savePrefs(userId, updated);
    },
    [userId]
  );

  // Lookups
  const pinnedSet = React.useMemo(() => new Set(prefs.pinnedCardIds), [prefs.pinnedCardIds]);
  const hiddenSet = React.useMemo(() => new Set(prefs.hiddenCardIds), [prefs.hiddenCardIds]);
  const collapsedSet = React.useMemo(() => new Set(prefs.collapsedCategories), [prefs.collapsedCategories]);

  const isPinned = React.useCallback((cardId: string) => pinnedSet.has(cardId), [pinnedSet]);
  const isHidden = React.useCallback((cardId: string) => hiddenSet.has(cardId), [hiddenSet]);
  const isCategoryCollapsed = React.useCallback((categoryId: string) => collapsedSet.has(categoryId), [collapsedSet]);

  // Toggles
  const togglePin = React.useCallback(
    (cardId: string) => {
      const updated = { ...prefs };
      if (pinnedSet.has(cardId)) {
        updated.pinnedCardIds = prefs.pinnedCardIds.filter(id => id !== cardId);
      } else {
        updated.pinnedCardIds = [...prefs.pinnedCardIds, cardId];
      }
      persist(updated);
    },
    [prefs, pinnedSet, persist]
  );

  const toggleHide = React.useCallback(
    (cardId: string) => {
      const updated = { ...prefs };
      if (hiddenSet.has(cardId)) {
        updated.hiddenCardIds = prefs.hiddenCardIds.filter(id => id !== cardId);
      } else {
        updated.hiddenCardIds = [...prefs.hiddenCardIds, cardId];
      }
      persist(updated);
    },
    [prefs, hiddenSet, persist]
  );

  const toggleCategoryCollapse = React.useCallback(
    (categoryId: string) => {
      const updated = { ...prefs };
      if (collapsedSet.has(categoryId)) {
        updated.collapsedCategories = prefs.collapsedCategories.filter(id => id !== categoryId);
      } else {
        updated.collapsedCategories = [...prefs.collapsedCategories, categoryId];
      }
      persist(updated);
    },
    [prefs, collapsedSet, persist]
  );

  const setHideLockedCards = React.useCallback(
    (hide: boolean) => {
      persist({ ...prefs, hideLockedCards: hide });
    },
    [prefs, persist]
  );

  const setHidePlaceholderCards = React.useCallback(
    (hide: boolean) => {
      persist({ ...prefs, hidePlaceholderCards: hide });
    },
    [prefs, persist]
  );

  const setSalutationType = React.useCallback(
    (type: string | undefined) => {
      persist({ ...prefs, salutationType: type });
    },
    [prefs, persist]
  );

  const setThemeMode = React.useCallback(
    (mode: string | undefined) => {
      persist({ ...prefs, themeMode: mode });
    },
    [prefs, persist]
  );

  const setNavMode = React.useCallback(
    (mode: string | undefined) => {
      persist({ ...prefs, navMode: mode });
    },
    [prefs, persist]
  );

  const setIntegrationsEnabled = React.useCallback(
    (enabled: boolean) => {
      persist({ ...prefs, integrationsEnabled: enabled });
    },
    [prefs, persist]
  );

  const setFloatMenu = React.useCallback(
    (float: boolean | undefined) => {
      persist({ ...prefs, floatMenu: float });
    },
    [prefs, persist]
  );

  const expandAllCategories = React.useCallback(() => {
    persist({ ...prefs, collapsedCategories: [] });
  }, [prefs, persist]);

  const collapseAllCategories = React.useCallback(
    (categoryIds: string[]) => {
      persist({ ...prefs, collapsedCategories: categoryIds });
    },
    [prefs, persist]
  );

  return {
    pinnedCardIds: prefs.pinnedCardIds,
    hiddenCardIds: prefs.hiddenCardIds,
    collapsedCategories: prefs.collapsedCategories,
    hideLockedCards: prefs.hideLockedCards,
    hidePlaceholderCards: prefs.hidePlaceholderCards,
    salutationType: prefs.salutationType,
    themeMode: prefs.themeMode,
    navMode: prefs.navMode,
    integrationsEnabled: prefs.integrationsEnabled,
    floatMenu: prefs.floatMenu,
    isPinned,
    isHidden,
    isCategoryCollapsed,
    togglePin,
    toggleHide,
    toggleCategoryCollapse,
    setHideLockedCards,
    setHidePlaceholderCards,
    setSalutationType,
    setThemeMode,
    setNavMode,
    setIntegrationsEnabled,
    setFloatMenu,
    expandAllCategories,
    collapseAllCategories,
  };
}
