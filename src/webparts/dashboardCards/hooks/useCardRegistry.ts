// ============================================
// useCardRegistry - Combines CARD_REGISTRY + license + preferences
// Returns categorized cards ready for dashboard rendering
// ============================================

import * as React from 'react';
import { CARD_REGISTRY } from '../config/cardRegistry';
import {
  CardRegistration,
  CardCategory,
  CardCategoryMeta,
  CategoryMetadata,
} from '../models/CardCatalog';
import { useLicense } from '../context/LicenseContext';
import {
  getCardsByCategory,
  sortCardsImplementedFirst,
  getVisibleCards,
} from '../utils/cardUtils';

// ============================================
// Types
// ============================================

export interface ICategorizedGroup {
  category: CategoryMetadata;
  cards: CardRegistration[];
  accessibleCount: number;
  lockedCount: number;
}

export interface IUseCardRegistryResult {
  /** Cards grouped by category (in sort order) */
  categorizedCards: ICategorizedGroup[];
  /** All pinned cards */
  pinnedCards: CardRegistration[];
  /** All locked cards (across all categories) */
  lockedCards: CardRegistration[];
  /** Total accessible count */
  totalAccessible: number;
  /** Total locked count */
  totalLocked: number;
  /** Total card count */
  totalCards: number;
  /** Flat list of all accessible cards (sorted by impact) */
  allAccessibleCards: CardRegistration[];
}

// ============================================
// Hook
// ============================================

export function useCardRegistry(
  hiddenCardIds: string[] = [],
  pinnedCardIds: string[] = [],
): IUseCardRegistryResult {
  const { isCardAccessible } = useLicense();

  // Build categorized groups from the full registry
  const result = React.useMemo(() => {
    // Filter out hidden cards
    const visibleCards = getVisibleCards(CARD_REGISTRY, hiddenCardIds);

    // Split into accessible and locked
    const accessible: CardRegistration[] = [];
    const locked: CardRegistration[] = [];

    for (const card of visibleCards) {
      if (isCardAccessible(card.id)) {
        accessible.push(card);
      } else {
        locked.push(card);
      }
    }

    // Group accessible cards by category
    const groupedAccessible = getCardsByCategory(accessible);
    const groupedLocked = getCardsByCategory(locked);

    // Build categorized groups
    const categories = Object.values(CardCategoryMeta)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const categorizedCards: ICategorizedGroup[] = categories.map(catMeta => {
      const catAccessible = sortCardsImplementedFirst(
        groupedAccessible.get(catMeta.id as CardCategory) || []
      );
      const catLocked = sortCardsImplementedFirst(
        groupedLocked.get(catMeta.id as CardCategory) || []
      );

      return {
        category: catMeta,
        cards: [...catAccessible, ...catLocked],
        accessibleCount: catAccessible.length,
        lockedCount: catLocked.length,
      };
    });

    // Pinned cards
    const pinnedSet = new Set(pinnedCardIds);
    const pinnedCards = visibleCards
      .filter(c => pinnedSet.has(c.id))
      .sort((a, b) => b.impactRating - a.impactRating);

    return {
      categorizedCards,
      pinnedCards,
      lockedCards: locked,
      totalAccessible: accessible.length,
      totalLocked: locked.length,
      totalCards: visibleCards.length,
      allAccessibleCards: sortCardsImplementedFirst(accessible),
    };
  }, [isCardAccessible, hiddenCardIds, pinnedCardIds]);

  return result;
}
