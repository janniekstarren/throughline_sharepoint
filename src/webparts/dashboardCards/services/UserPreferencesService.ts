/**
 * UserPreferencesService - Stores user-specific dashboard preferences in localStorage
 *
 * This service provides per-user storage for dashboard customizations like:
 * - Card order (drag-and-drop reordering)
 * - Collapsed cards (large cards shown as medium)
 *
 * Storage is scoped per-user and per-webpart instance to avoid conflicts.
 */

import { CardSize, ICardSizeState } from '../types/CardSize';

export interface IUserPreferences {
  cardOrder?: string[];
  collapsedCardIds?: string[];
  cardSizes?: ICardSizeState;
  /** Snapshot of card sizes before compact view was activated */
  preCompactCardSizes?: ICardSizeState;
  lastUpdated?: string;
}

// Re-export for convenience
export type { CardSize, ICardSizeState };

// Storage key prefix
const STORAGE_KEY_PREFIX = 'throughline_dashboard_prefs_';

/**
 * Generate a unique storage key for the current user and webpart instance
 * @param userId - Current user's login name or ID
 * @param instanceId - WebPart instance ID (optional, for multiple dashboards on same site)
 */
function getStorageKey(userId: string, instanceId?: string): string {
  // Sanitize userId to be safe for localStorage key
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9@._-]/g, '_');
  const key = instanceId
    ? `${STORAGE_KEY_PREFIX}${sanitizedUserId}_${instanceId}`
    : `${STORAGE_KEY_PREFIX}${sanitizedUserId}`;
  return key;
}

/**
 * Load user preferences from localStorage
 * @param userId - Current user's login name
 * @param instanceId - Optional webpart instance ID
 * @returns User preferences or empty object if not found
 */
export function loadUserPreferences(userId: string, instanceId?: string): IUserPreferences {
  try {
    const key = getStorageKey(userId, instanceId);
    const stored = localStorage.getItem(key);

    if (stored) {
      const parsed = JSON.parse(stored) as IUserPreferences;
      console.log('[UserPreferences] Loaded preferences for user:', userId);
      return parsed;
    }
  } catch (error) {
    console.warn('[UserPreferences] Failed to load preferences:', error);
  }

  return {};
}

/**
 * Save user preferences to localStorage
 * @param userId - Current user's login name
 * @param preferences - Preferences to save (will be merged with existing)
 * @param instanceId - Optional webpart instance ID
 */
export function saveUserPreferences(
  userId: string,
  preferences: Partial<IUserPreferences>,
  instanceId?: string
): void {
  try {
    const key = getStorageKey(userId, instanceId);

    // Load existing preferences and merge
    const existing = loadUserPreferences(userId, instanceId);
    const merged: IUserPreferences = {
      ...existing,
      ...preferences,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(merged));
    console.log('[UserPreferences] Saved preferences for user:', userId);
  } catch (error) {
    console.warn('[UserPreferences] Failed to save preferences:', error);
  }
}

/**
 * Clear user preferences from localStorage
 * @param userId - Current user's login name
 * @param instanceId - Optional webpart instance ID
 */
export function clearUserPreferences(userId: string, instanceId?: string): void {
  try {
    const key = getStorageKey(userId, instanceId);
    localStorage.removeItem(key);
    console.log('[UserPreferences] Cleared preferences for user:', userId);
  } catch (error) {
    console.warn('[UserPreferences] Failed to clear preferences:', error);
  }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage can be used
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
