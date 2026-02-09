// ============================================
// Card Utilities
// Filtering, sorting, and grouping helpers
// for the 80-card registry
// ============================================

import {
  CardRegistration,
  CardCategory,
  CardCategoryMeta,
  CardStatus,
  LicenseTier,
  LEGACY_CARD_ID_MAP,
} from '../models/CardCatalog';
import { CARD_REGISTRY } from '../config/cardRegistry';

// ============================================
// Card Lookup
// ============================================

/**
 * Find a registry card by its registry ID (e.g., 'stale-conversations')
 */
export function getRegistryCardById(cardId: string): CardRegistration | undefined {
  return CARD_REGISTRY.find(c => c.id === cardId);
}

/**
 * Find a registry card by its legacy/existing card ID (e.g., 'waitingOnYou')
 * Uses the existingCardId field on CardRegistration
 */
export function getRegistryCardByLegacyId(legacyId: string): CardRegistration | undefined {
  return CARD_REGISTRY.find(c => c.existingCardId === legacyId);
}

/**
 * Resolve any card ID (legacy or registry) to a CardRegistration.
 * Tries registry ID first, then legacy ID lookup.
 */
export function resolveCard(cardId: string): CardRegistration | undefined {
  return getRegistryCardById(cardId) || getRegistryCardByLegacyId(cardId);
}

/**
 * Maps a legacy card ID to its new registry ID.
 */
export function resolveCardId(legacyId: string): string {
  return LEGACY_CARD_ID_MAP[legacyId] || legacyId;
}

// ============================================
// Filtering
// ============================================

/**
 * Get all cards accessible at a given tier
 */
export function getAccessibleCards(
  registry: CardRegistration[],
  tier: LicenseTier,
): CardRegistration[] {
  const tierLevel = getTierLevel(tier);
  return registry.filter(card => getTierLevel(card.minimumTier) <= tierLevel);
}

/**
 * Get all locked cards at a given tier
 */
export function getLockedCards(
  registry: CardRegistration[],
  tier: LicenseTier,
): CardRegistration[] {
  const tierLevel = getTierLevel(tier);
  return registry.filter(card => getTierLevel(card.minimumTier) > tierLevel);
}

/**
 * Filter out hidden cards
 */
export function getVisibleCards(
  cards: CardRegistration[],
  hiddenIds: string[],
): CardRegistration[] {
  const hiddenSet = new Set(hiddenIds);
  return cards.filter(c => !hiddenSet.has(c.id));
}

// ============================================
// Grouping
// ============================================

/**
 * Group cards by their category
 */
export function getCardsByCategory(
  cards: CardRegistration[],
): Map<CardCategory, CardRegistration[]> {
  const grouped = new Map<CardCategory, CardRegistration[]>();

  // Initialize all categories in sort order
  const sortedCategories = Object.values(CardCategoryMeta)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(m => m.id as CardCategory);

  for (const cat of sortedCategories) {
    grouped.set(cat, []);
  }

  for (const card of cards) {
    const list = grouped.get(card.category);
    if (list) {
      list.push(card);
    }
  }

  return grouped;
}

// ============================================
// Sorting
// ============================================

/**
 * Sort cards by impact rating (descending)
 */
export function sortCardsByImpact(cards: CardRegistration[]): CardRegistration[] {
  return [...cards].sort((a, b) => b.impactRating - a.impactRating);
}

/**
 * Sort cards by name (alphabetical)
 */
export function sortCardsByName(cards: CardRegistration[]): CardRegistration[] {
  return [...cards].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Sort cards: implemented first, then by impact
 */
export function sortCardsImplementedFirst(cards: CardRegistration[]): CardRegistration[] {
  return [...cards].sort((a, b) => {
    // Implemented cards first
    if (a.status === CardStatus.Implemented && b.status !== CardStatus.Implemented) return -1;
    if (a.status !== CardStatus.Implemented && b.status === CardStatus.Implemented) return 1;
    // Then by impact descending
    return b.impactRating - a.impactRating;
  });
}

// ============================================
// Tier Helpers
// ============================================

function getTierLevel(tier: LicenseTier): number {
  switch (tier) {
    case LicenseTier.Individual: return 0;
    case LicenseTier.Team: return 1;
    case LicenseTier.Manager: return 2;
    case LicenseTier.Leader: return 3;
    default: return 0;
  }
}
