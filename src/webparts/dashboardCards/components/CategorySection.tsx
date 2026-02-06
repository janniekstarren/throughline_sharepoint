import * as React from 'react';
import Masonry from 'react-masonry-css';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { mergeClasses } from '@fluentui/react-components';
import { getIconById } from '../propertyPane/CardConfigDialog';
import { CardSize } from '../types/CardSize';
import styles from './CategorySection.module.scss';

// A card with its size information for ordered rendering
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
  iconId?: string;  // Icon ID to display next to category title
  orderedCards: IOrderedCard[];  // Cards in user-defined order with size info
  isDragging?: boolean;  // Enable drag mode layout
  startIndex?: number;   // Global index offset for this section
}

// Responsive breakpoints for masonry columns
// 4 columns by default for narrower cards that fit more per row
const masonryBreakpoints = {
  default: 4,   // 4 columns on large screens
  1400: 3,      // 3 columns on medium-large screens
  1024: 2,      // 2 columns on medium screens
  768: 1        // 1 column on mobile (<768px)
};

export const CategorySection: React.FC<ICategorySectionProps> = ({
  categoryId,
  categoryName,
  showTitle = true,
  iconId,
  orderedCards,
  isDragging = false,
  startIndex = 0
}) => {
  // Don't render empty sections
  if (orderedCards.length === 0) {
    return null;
  }

  // Helper to determine card size (supports both new 'size' prop and legacy 'isLarge')
  const getCardSize = (card: IOrderedCard): CardSize => {
    if (card.size) return card.size;
    // Fallback for legacy isLarge prop
    return card.isLarge ? 'large' : 'medium';
  };

  // Separate cards by size while preserving order
  const smallCards = orderedCards.filter(card => getCardSize(card) === 'small');
  const mediumCards = orderedCards.filter(card => getCardSize(card) === 'medium');
  const largeCards = orderedCards.filter(card => getCardSize(card) === 'large');

  // Render small cards as horizontal row of chips
  const renderSmallCards = (): React.ReactNode => {
    if (smallCards.length === 0) return null;

    return (
      <div className={styles.smallCardsRow}>
        {smallCards.map(card => (
          <div key={card.id} className={styles.smallCardWrapper}>
            {card.element}
          </div>
        ))}
      </div>
    );
  };

  // Render large cards in 2-column grid (not draggable)
  const renderLargeCards = (): React.ReactNode => {
    if (largeCards.length === 0) return null;

    return (
      <div className={styles.largeCardsRow}>
        {largeCards.map(card => (
          <div key={card.id} className={card.isTall ? styles.largeCardsRowTall : undefined}>
            {card.element}
          </div>
        ))}
      </div>
    );
  };

  // Render medium cards with drag-and-drop support
  const renderMediumCards = (): React.ReactNode => {
    if (mediumCards.length === 0) return null;

    const droppableId = `${categoryId}-cards`;

    return (
      <Droppable droppableId={droppableId} direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={mergeClasses(
              isDragging ? styles.gridLayout : styles.masonryWrapper,
              snapshot.isDraggingOver && styles.gridDragOver
            )}
          >
            {isDragging ? (
              // Grid layout during drag for predictable coordinates
              mediumCards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={startIndex + index}>
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={mergeClasses(
                        styles.draggableCard,
                        dragSnapshot.isDragging && styles.cardDragging
                      )}
                    >
                      {card.element}
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              // Masonry layout when not dragging
              <Masonry
                breakpointCols={masonryBreakpoints}
                className={styles.masonryGrid}
                columnClassName={styles.masonryColumn}
              >
                {mediumCards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={startIndex + index}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={mergeClasses(
                          styles.draggableCard,
                          dragSnapshot.isDragging && styles.cardDragging
                        )}
                      >
                        {card.element}
                      </div>
                    )}
                  </Draggable>
                ))}
              </Masonry>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <section className={styles.categorySection}>
      {/* Category title with optional icon */}
      {showTitle && categoryName && (
        <h3 className={styles.categoryTitle}>
          {iconId && <span className={styles.categoryIcon}>{getIconById(iconId)}</span>}
          {categoryName}
        </h3>
      )}

      {/* Render small cards first (horizontal row of chips) */}
      {renderSmallCards()}

      {/* Render large cards (2-column grid) */}
      {renderLargeCards()}

      {/* Render medium cards with DnD support (4-column masonry) */}
      {renderMediumCards()}
    </section>
  );
};

export default CategorySection;
