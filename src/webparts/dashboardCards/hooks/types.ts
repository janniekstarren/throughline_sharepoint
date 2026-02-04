// ============================================
// Shared Hook Types
// Common interfaces and types for data fetching hooks
// ============================================

/**
 * Base return type for data fetching hooks
 */
export interface UseDataReturn<TData, TFilter = unknown> {
  /** The fetched data */
  data: TData | null;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error that occurred during fetch, if any */
  error: Error | null;
  /** When data was last successfully refreshed */
  lastRefreshed: Date | null;
  /** Current filter settings */
  filter: TFilter;
  /** Update filter settings */
  updateFilter: (updates: Partial<TFilter>) => void;
  /** Manually refresh data */
  refresh: () => Promise<void>;
}

/**
 * Common action handlers for item management
 */
export interface ItemActionHandlers {
  /** Mark item as resolved/dismissed */
  dismissItem?: (itemId: string) => void;
  /** Snooze item until a future date */
  snoozeItem?: (itemId: string, until: Date, reason?: string) => void;
  /** Remove snooze from an item */
  unsnoozeItem?: (itemId: string) => void;
}

/**
 * View mode for grouped data display
 */
export type ViewMode = 'people' | 'teams' | 'timeline' | 'priority';

/**
 * Common UI state for grouped data
 */
export interface GroupedUIState {
  /** Current view mode */
  viewMode: ViewMode;
  /** Set view mode */
  setViewMode: (mode: ViewMode) => void;
  /** Set of expanded group IDs */
  expandedGroups: Set<string>;
  /** Toggle group expansion */
  toggleGroup: (groupId: string) => void;
}

/**
 * Base persisted state shape
 */
export interface BasePersistedState {
  /** Items that have been dismissed */
  dismissed: Array<{
    itemId: string;
    dismissedAt: Date;
    reason?: string;
  }>;
  /** Items that have been snoozed */
  snoozed: Array<{
    itemId: string;
    snoozedAt: Date;
    snoozedUntil: Date;
    reason?: string;
  }>;
  /** Last cleanup timestamp */
  lastCleanup: Date;
}

/**
 * Helper to check if an item is currently snoozed
 */
export function isItemSnoozed(
  itemId: string,
  snoozed: BasePersistedState['snoozed']
): boolean {
  const snoozeEntry = snoozed.find(s => s.itemId === itemId);
  if (!snoozeEntry) return false;
  return new Date(snoozeEntry.snoozedUntil) > new Date();
}

/**
 * Helper to check if an item is dismissed
 */
export function isItemDismissed(
  itemId: string,
  dismissed: BasePersistedState['dismissed']
): boolean {
  return dismissed.some(d => d.itemId === itemId);
}

/**
 * Cleanup expired entries from persisted state
 */
export function cleanupPersistedState<T extends BasePersistedState>(
  state: T,
  maxAgeDays: number = 30
): T {
  const now = new Date();
  const cutoff = new Date(now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000);

  return {
    ...state,
    dismissed: state.dismissed.filter(d => new Date(d.dismissedAt) > cutoff),
    snoozed: state.snoozed.filter(s => new Date(s.snoozedUntil) > now),
    lastCleanup: now
  };
}
