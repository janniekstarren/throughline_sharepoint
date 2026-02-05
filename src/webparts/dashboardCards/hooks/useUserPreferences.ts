/**
 * useUserPreferences - React hook for managing user-specific dashboard preferences
 *
 * This hook provides:
 * - Automatic loading of preferences on mount
 * - Automatic saving when preferences change
 * - Fallback to webpart properties when no user preferences exist
 */

import * as React from 'react';
import {
  loadUserPreferences,
  saveUserPreferences,
  isLocalStorageAvailable,
  IUserPreferences,
} from '../services/UserPreferencesService';

export interface IUseUserPreferencesOptions {
  /** Current user's login name or email */
  userId: string;
  /** Optional webpart instance ID for multiple dashboards */
  instanceId?: string;
  /** Default card order from webpart properties */
  defaultCardOrder: string[];
  /** Default collapsed card IDs from webpart properties */
  defaultCollapsedCardIds: string[];
}

export interface IUseUserPreferencesResult {
  /** Current card order (user preference or default) */
  cardOrder: string[];
  /** Current collapsed card IDs (user preference or default) */
  collapsedCardIds: string[];
  /** Whether user has custom preferences saved */
  hasUserPreferences: boolean;
  /** Update card order and save to localStorage */
  setCardOrder: (newOrder: string[]) => void;
  /** Update collapsed cards and save to localStorage */
  setCollapsedCardIds: (cardIds: string[]) => void;
  /** Reset to default (webpart) preferences */
  resetToDefaults: () => void;
  /** Whether localStorage is available */
  isStorageAvailable: boolean;
}

export function useUserPreferences(
  options: IUseUserPreferencesOptions
): IUseUserPreferencesResult {
  const { userId, instanceId, defaultCardOrder, defaultCollapsedCardIds } = options;

  // Check if localStorage is available
  const isStorageAvailable = React.useMemo(() => isLocalStorageAvailable(), []);

  // State for preferences
  const [userPrefs, setUserPrefs] = React.useState<IUserPreferences>({});
  const [hasUserPreferences, setHasUserPreferences] = React.useState(false);

  // Load preferences on mount or when userId changes
  React.useEffect(() => {
    if (!isStorageAvailable || !userId) return;

    const loaded = loadUserPreferences(userId, instanceId);
    setUserPrefs(loaded);
    setHasUserPreferences(
      loaded.cardOrder !== undefined || loaded.collapsedCardIds !== undefined
    );
  }, [userId, instanceId, isStorageAvailable]);

  // Compute effective card order (user preference or default)
  const cardOrder = React.useMemo(() => {
    if (userPrefs.cardOrder && userPrefs.cardOrder.length > 0) {
      // Merge: user preferences + any new cards from defaults that aren't in user prefs
      const userOrder = userPrefs.cardOrder;
      const missingCards = defaultCardOrder.filter(id => !userOrder.includes(id));
      return [...userOrder, ...missingCards];
    }
    return defaultCardOrder;
  }, [userPrefs.cardOrder, defaultCardOrder]);

  // Compute effective collapsed cards (user preference or default)
  const collapsedCardIds = React.useMemo(() => {
    if (userPrefs.collapsedCardIds !== undefined) {
      return userPrefs.collapsedCardIds;
    }
    return defaultCollapsedCardIds;
  }, [userPrefs.collapsedCardIds, defaultCollapsedCardIds]);

  // Save card order
  const setCardOrder = React.useCallback(
    (newOrder: string[]) => {
      if (!isStorageAvailable || !userId) return;

      const newPrefs = { ...userPrefs, cardOrder: newOrder };
      setUserPrefs(newPrefs);
      setHasUserPreferences(true);
      saveUserPreferences(userId, { cardOrder: newOrder }, instanceId);
    },
    [userId, instanceId, userPrefs, isStorageAvailable]
  );

  // Save collapsed cards
  const setCollapsedCardIds = React.useCallback(
    (cardIds: string[]) => {
      if (!isStorageAvailable || !userId) return;

      const newPrefs = { ...userPrefs, collapsedCardIds: cardIds };
      setUserPrefs(newPrefs);
      setHasUserPreferences(true);
      saveUserPreferences(userId, { collapsedCardIds: cardIds }, instanceId);
    },
    [userId, instanceId, userPrefs, isStorageAvailable]
  );

  // Reset to defaults
  const resetToDefaults = React.useCallback(() => {
    setUserPrefs({});
    setHasUserPreferences(false);
    if (isStorageAvailable && userId) {
      // Clear stored preferences
      saveUserPreferences(userId, { cardOrder: undefined, collapsedCardIds: undefined }, instanceId);
    }
  }, [userId, instanceId, isStorageAvailable]);

  return {
    cardOrder,
    collapsedCardIds,
    hasUserPreferences,
    setCardOrder,
    setCollapsedCardIds,
    resetToDefaults,
    isStorageAvailable,
  };
}
