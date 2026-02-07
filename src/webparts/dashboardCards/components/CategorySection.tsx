// ============================================
// CategorySection - Category Layout with Dense CSS Grid
// ============================================
// Renders cards using CSS Grid with dense packing.
// Cards are sorted by size (large → medium → small) for optimal packing.
// Large cards span 3 cols, leaving 1 col for small/medium cards beside them.

import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { ChevronDown20Regular, ChevronRight20Regular } from '@fluentui/react-icons';
import { getIconById } from '../propertyPane/CardConfigDialog';
import { CardSize } from '../types/CardSize';
import styles from './CategorySection.module.scss';

// ============================================
// Types
// ============================================

/**
 * A card with its size information for ordered rendering
 */
export interface IOrderedCard {
  id: string;
  /** Card size: 'small', 'medium', or 'large'. If not provided, falls back to isLarge */
  size?: CardSize;
  /** @deprecated Use size instead */
  isLarge?: boolean;
  /** Whether the card needs extra height (e.g., AI mode) */
  isTall?: boolean;
  element: React.ReactNode;
}

export interface ICategorySectionProps {
  categoryId: string;
  categoryName?: string;
  showTitle?: boolean;
  iconId?: string;
  orderedCards: IOrderedCard[];
  isDragging?: boolean;
  startIndex?: number;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onReorder?: (cardIds: string[]) => void;
  animationsEnabled?: boolean;
}

// Size priority for sorting (larger cards first for better packing)
const SIZE_PRIORITY: Record<CardSize, number> = {
  large: 0,
  medium: 1,
  small: 2,
};

// ============================================
// CategorySection Component
// ============================================

export const CategorySection: React.FC<ICategorySectionProps> = ({
  categoryId,
  categoryName,
  showTitle = true,
  iconId,
  orderedCards,
  collapsed = false,
  onToggleCollapsed,
  animationsEnabled = true,
}) => {
  // Don't render empty sections
  if (orderedCards.length === 0) {
    return null;
  }

  // Helper to determine card size
  const getCardSize = (card: IOrderedCard): CardSize => {
    if (card.size) return card.size;
    return card.isLarge ? 'large' : 'medium';
  };

  // Sort cards by size for optimal grid packing
  // Large cards first, then medium, then small
  // This allows dense packing to fill gaps properly
  const sortedCards = React.useMemo(() => {
    return [...orderedCards].sort((a, b) => {
      const sizeA = getCardSize(a);
      const sizeB = getCardSize(b);
      return SIZE_PRIORITY[sizeA] - SIZE_PRIORITY[sizeB];
    });
  }, [orderedCards]);

  // Get the appropriate CSS class for a card based on its size
  const getCardClassName = (card: IOrderedCard): string => {
    const size = getCardSize(card);
    switch (size) {
      case 'small':
        return styles.cardSmall;
      case 'large':
        return styles.cardLarge;
      case 'medium':
      default:
        return styles.cardMedium;
    }
  };

  return (
    <section className={styles.categorySection} data-category-id={categoryId}>
      {/* Category title with optional icon and collapse control */}
      {showTitle && categoryName && (
        <button
          className={styles.categoryHeader}
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          type="button"
        >
          {iconId && (
            <span className={styles.categoryIcon}>{getIconById(iconId)}</span>
          )}
          <h3 className={styles.categoryTitle}>{categoryName}</h3>
          <span className={styles.cardCount}>({orderedCards.length})</span>
          {onToggleCollapsed && (
            <span className={styles.chevron}>
              {collapsed ? <ChevronRight20Regular /> : <ChevronDown20Regular />}
            </span>
          )}
        </button>
      )}

      {/* Category content - Dense CSS Grid layout */}
      {!collapsed && (
        <div className={mergeClasses(styles.categoryContent, animationsEnabled && styles.animated)}>
          <div className={styles.cardGrid}>
            {sortedCards.map(card => (
              <div
                key={card.id}
                className={mergeClasses(styles.cardWrapper, getCardClassName(card))}
              >
                {card.element}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorySection;
