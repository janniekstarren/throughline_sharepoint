// ============================================
// Grouped Data Updater Utilities
// Helpers for optimistic updates on grouped data structures
// ============================================

/**
 * Generic conversation/item with an ID
 */
interface Identifiable {
  id: string;
}

/**
 * Generic group containing items
 */
interface ItemGroup<T extends Identifiable> {
  conversations: T[];
  itemCount: number;
  snoozedCount?: number;
}

/**
 * Remove an item from all groups in a grouped data structure
 */
export function removeItemFromGroups<T extends Identifiable, G extends ItemGroup<T>>(
  groups: G[],
  itemId: string
): G[] {
  return groups
    .map(group => ({
      ...group,
      conversations: group.conversations.filter(c => c.id !== itemId),
      itemCount: group.conversations.filter(c => c.id !== itemId).length
    }))
    .filter(group => group.conversations.length > 0);
}

/**
 * Update an item in all groups
 */
export function updateItemInGroups<T extends Identifiable, G extends ItemGroup<T>>(
  groups: G[],
  itemId: string,
  updater: (item: T) => T
): G[] {
  return groups.map(group => ({
    ...group,
    conversations: group.conversations.map(c =>
      c.id === itemId ? updater(c) : c
    )
  }));
}

/**
 * Snooze update result type
 */
interface SnoozedItem extends Identifiable {
  snoozedUntil?: Date;
}

/**
 * Apply snooze to an item across all groups and update snooze counts
 */
export function snoozeItemInGroups<T extends SnoozedItem, G extends ItemGroup<T>>(
  groups: G[],
  itemId: string,
  until: Date
): G[] {
  return groups.map(group => {
    const updatedConversations = group.conversations.map(c =>
      c.id === itemId ? { ...c, snoozedUntil: until } : c
    );

    const snoozedCount = updatedConversations.filter(c => c.snoozedUntil).length;

    return {
      ...group,
      conversations: updatedConversations,
      snoozedCount
    };
  });
}

/**
 * Remove snooze from an item across all groups and update snooze counts
 */
export function unsnoozeItemInGroups<T extends SnoozedItem, G extends ItemGroup<T>>(
  groups: G[],
  itemId: string
): G[] {
  return groups.map(group => {
    const updatedConversations = group.conversations.map(c =>
      c.id === itemId ? { ...c, snoozedUntil: undefined } : c
    );

    const snoozedCount = updatedConversations.filter(c =>
      c.id !== itemId && c.snoozedUntil
    ).length;

    return {
      ...group,
      conversations: updatedConversations,
      snoozedCount
    };
  });
}

/**
 * Count total items across all groups
 */
export function countTotalItems<T extends Identifiable, G extends ItemGroup<T>>(
  groups: G[]
): number {
  return groups.reduce((total, group) => total + group.conversations.length, 0);
}

/**
 * Count snoozed items across all groups
 */
export function countSnoozedItems<T extends SnoozedItem, G extends ItemGroup<T>>(
  groups: G[]
): number {
  return groups.reduce((total, group) =>
    total + group.conversations.filter(c => c.snoozedUntil).length, 0
  );
}

/**
 * Generic grouped data structure
 */
export interface GroupedData<T extends Identifiable> {
  allConversations: T[];
  byPerson: ItemGroup<T>[];
  byTeam: ItemGroup<T>[];
  ungroupedByPerson?: ItemGroup<T>[];
  totalItems: number;
  snoozedCount: number;
}

/**
 * Apply dismiss optimistically to grouped data
 */
export function dismissFromGroupedData<T extends Identifiable>(
  data: GroupedData<T>,
  itemId: string
): GroupedData<T> {
  return {
    ...data,
    allConversations: data.allConversations.filter(c => c.id !== itemId),
    byPerson: removeItemFromGroups(data.byPerson, itemId),
    byTeam: removeItemFromGroups(data.byTeam, itemId),
    ungroupedByPerson: data.ungroupedByPerson
      ? removeItemFromGroups(data.ungroupedByPerson, itemId)
      : undefined,
    totalItems: data.totalItems - 1
  };
}

/**
 * Apply snooze optimistically to grouped data
 */
export function snoozeInGroupedData<T extends SnoozedItem>(
  data: GroupedData<T>,
  itemId: string,
  until: Date
): GroupedData<T> {
  const updateItem = (c: T): T =>
    c.id === itemId ? { ...c, snoozedUntil: until } : c;

  return {
    ...data,
    allConversations: data.allConversations.map(updateItem),
    byPerson: snoozeItemInGroups(data.byPerson, itemId, until),
    byTeam: snoozeItemInGroups(data.byTeam, itemId, until),
    ungroupedByPerson: data.ungroupedByPerson
      ? snoozeItemInGroups(data.ungroupedByPerson, itemId, until)
      : undefined,
    snoozedCount: data.snoozedCount + 1
  };
}

/**
 * Apply unsnooze optimistically to grouped data
 */
export function unsnoozeInGroupedData<T extends SnoozedItem>(
  data: GroupedData<T>,
  itemId: string
): GroupedData<T> {
  const updateItem = (c: T): T =>
    c.id === itemId ? { ...c, snoozedUntil: undefined } : c;

  return {
    ...data,
    allConversations: data.allConversations.map(updateItem),
    byPerson: unsnoozeItemInGroups(data.byPerson, itemId),
    byTeam: unsnoozeItemInGroups(data.byTeam, itemId),
    ungroupedByPerson: data.ungroupedByPerson
      ? unsnoozeItemInGroups(data.ungroupedByPerson, itemId)
      : undefined,
    snoozedCount: Math.max(0, data.snoozedCount - 1)
  };
}
