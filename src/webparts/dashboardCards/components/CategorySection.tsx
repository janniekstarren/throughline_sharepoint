import * as React from 'react';
import Masonry from 'react-masonry-css';
import styles from './CategorySection.module.scss';

// A card with its size information for ordered rendering
export interface IOrderedCard {
  id: string;
  isLarge: boolean;
  element: React.ReactNode;
}

export interface ICategorySectionProps {
  categoryId: string;
  categoryName?: string;
  showTitle?: boolean;
  orderedCards: IOrderedCard[];  // Cards in user-defined order with size info
}

// Responsive breakpoints for masonry columns
const masonryBreakpoints = {
  default: 3,  // 3 columns on large screens (1200px+)
  1200: 2,     // 2 columns on medium screens (768-1199px)
  768: 1       // 1 column on mobile (<768px)
};

export const CategorySection: React.FC<ICategorySectionProps> = ({
  categoryName,
  showTitle = true,
  orderedCards
}) => {
  // Don't render empty sections
  if (orderedCards.length === 0) {
    return null;
  }

  // Group cards into segments that respect the user's order:
  // - Large cards are rendered as full-width rows
  // - Consecutive medium cards are grouped into masonry grids
  const renderOrderedCards = (): React.ReactNode[] => {
    const segments: React.ReactNode[] = [];
    let currentMediumCards: React.ReactNode[] = [];
    let segmentKey = 0;

    const flushMediumCards = (): void => {
      if (currentMediumCards.length > 0) {
        segments.push(
          <Masonry
            key={`masonry-${segmentKey++}`}
            breakpointCols={masonryBreakpoints}
            className={styles.masonryGrid}
            columnClassName={styles.masonryColumn}
          >
            {currentMediumCards}
          </Masonry>
        );
        currentMediumCards = [];
      }
    };

    orderedCards.forEach((card) => {
      if (card.isLarge) {
        // Flush any pending medium cards before rendering large card
        flushMediumCards();
        // Render large card as full-width row
        segments.push(
          <div key={card.id} className={styles.largeCardsRow}>
            <div>{card.element}</div>
          </div>
        );
      } else {
        // Accumulate medium cards
        currentMediumCards.push(<div key={card.id}>{card.element}</div>);
      }
    });

    // Flush any remaining medium cards
    flushMediumCards();

    return segments;
  };

  return (
    <section className={styles.categorySection}>
      {/* Category title */}
      {showTitle && categoryName && (
        <h3 className={styles.categoryTitle}>{categoryName}</h3>
      )}

      {/* Render cards in order */}
      {renderOrderedCards()}
    </section>
  );
};

export default CategorySection;
