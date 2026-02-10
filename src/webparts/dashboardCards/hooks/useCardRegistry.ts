// ============================================
// useCardRegistry - Combines CARD_REGISTRY + license + preferences + integrations
// Returns categorized cards ready for dashboard rendering
// Integration cards (Mode 1) are hidden when their integration is disconnected
// ============================================

import * as React from 'react';
import { CARD_REGISTRY } from '../config/cardRegistry';
import {
  CardRegistration,
  CardCategory,
  CardCategoryMeta,
  CategoryMetadata,
} from '../models/CardCatalog';
import { IntegrationCategory } from '../models/Integration';
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
  /** Integration cards whose platform IS connected (visible on dashboard) */
  integrationCards: CardRegistration[];
  /** ALL integration cards regardless of connection status (for nav pill count) */
  allIntegrationCards: CardRegistration[];
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
// Integration Card Visibility Check
// ============================================
function isIntegrationCardVisible(
  card: CardRegistration,
  connectedPlatformIds: string[],
  connectedCategories: IntegrationCategory[],
): boolean {
  if (!card.isIntegrationCard) return true;

  // Check specific platform IDs
  if (card.requiredIntegrationIds?.length) {
    return card.requiredIntegrationIds.some(id => connectedPlatformIds.includes(id));
  }

  // Check integration category
  if (card.requiredIntegrationCategory) {
    return connectedCategories.includes(card.requiredIntegrationCategory);
  }

  // Integration card with no requirements — always hidden
  return false;
}

// ============================================
// Hook
// ============================================

export function useCardRegistry(
  hiddenCardIds: string[] = [],
  pinnedCardIds: string[] = [],
  connectedPlatformIds: string[] = [],
  connectedCategories: IntegrationCategory[] = [],
): IUseCardRegistryResult {
  const { isCardAccessible } = useLicense();

  // Build categorized groups from the full registry
  const result = React.useMemo(() => {
    // Filter out hidden cards
    let visibleCards = getVisibleCards(CARD_REGISTRY, hiddenCardIds);

    // Filter out integration cards whose integration is not connected
    visibleCards = visibleCards.filter(card =>
      isIntegrationCardVisible(card, connectedPlatformIds, connectedCategories)
    );

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

    // Integration cards — visible cards flagged as integration cards (platform connected)
    const integrationCards = sortCardsImplementedFirst(
      visibleCards.filter(c => c.isIntegrationCard === true)
    );

    // ALL integration cards from registry (regardless of connection) — for nav pill display
    const allIntegrationCards = sortCardsImplementedFirst(
      getVisibleCards(CARD_REGISTRY, hiddenCardIds).filter(c => c.isIntegrationCard === true)
    );

    return {
      categorizedCards,
      pinnedCards,
      lockedCards: locked,
      integrationCards,
      allIntegrationCards,
      totalAccessible: accessible.length,
      totalLocked: locked.length,
      totalCards: visibleCards.length,
      allAccessibleCards: sortCardsImplementedFirst(accessible),
    };
  }, [isCardAccessible, hiddenCardIds, pinnedCardIds, connectedPlatformIds, connectedCategories]);

  return result;
}
