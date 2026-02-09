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
  /** Optional category accent color (from CardCategoryMeta.color) */
  categoryColor?: string;
  /** Optional description shown in the header */
  description?: string;
  /** Optional summary text when collapsed (e.g., "12 cards · 3 with data") */
  collapsedSummary?: string;
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
  categoryColor,
  description,
  collapsedSummary,
}) => {
  // Helper to determine card size
  const getCardSize = (card: IOrderedCard): CardSize => {
    if (card.size) return card.size;
    return card.isLarge ? 'large' : 'medium';
  };

  // Sort cards by size for optimal grid packing
  // Large cards first, then medium, then small
  // This allows dense packing to fill gaps properly
  // NOTE: This hook MUST be called before any early returns (React rules of hooks)
  const sortedCards = React.useMemo(() => {
    if (orderedCards.length === 0) return [];
    return [...orderedCards].sort((a, b) => {
      const sizeA = getCardSize(a);
      const sizeB = getCardSize(b);
      return SIZE_PRIORITY[sizeA] - SIZE_PRIORITY[sizeB];
    });
  }, [orderedCards]);

  // Track previous card sizes to detect changes and trigger animation
  const prevSizesRef = React.useRef<Map<string, CardSize>>(new Map());
  const [animatingCards, setAnimatingCards] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const newAnimating = new Set<string>();
    const prevSizes = prevSizesRef.current;

    orderedCards.forEach(card => {
      const currentSize = getCardSize(card);
      const prevSize = prevSizes.get(card.id);
      if (prevSize !== undefined && prevSize !== currentSize) {
        newAnimating.add(card.id);
      }
    });

    // Update the ref with current sizes
    const nextSizes = new Map<string, CardSize>();
    orderedCards.forEach(card => {
      nextSizes.set(card.id, getCardSize(card));
    });
    prevSizesRef.current = nextSizes;

    if (newAnimating.size > 0) {
      setAnimatingCards(newAnimating);
      // Remove animation class after animation completes (300ms)
      const timer = setTimeout(() => {
        setAnimatingCards(new Set());
      }, 300);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [orderedCards]);

  // Don't render empty sections - MUST be AFTER all hooks (React rules of hooks)
  if (orderedCards.length === 0) {
    return null;
  }

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
            <span
              className={styles.categoryIcon}
              style={categoryColor ? { color: categoryColor } : undefined}
            >
              {getIconById(iconId)}
            </span>
          )}
          <h3 className={styles.categoryTitle}>{categoryName}</h3>
          {description && !collapsed && (
            <span className={styles.cardCount}>{description}</span>
          )}
          <span className={styles.cardCount}>({orderedCards.length})</span>
          {collapsedSummary && (
            <span className={styles.cardCount}>{collapsedSummary}</span>
          )}
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
                className={mergeClasses(
                  styles.cardWrapper,
                  getCardClassName(card),
                  animatingCards.has(card.id) && styles.cardSizeChanging
                )}
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
