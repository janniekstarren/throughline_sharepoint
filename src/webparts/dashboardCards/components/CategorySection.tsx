import * as React from 'react';
import Masonry from 'react-masonry-css';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { mergeClasses } from '@fluentui/react-components';
import { getIconById } from '../propertyPane/CardConfigDialog';
import styles from './CategorySection.module.scss';

// A card with its size information for ordered rendering
export interface IOrderedCard {
  id: string;
  isLarge: boolean;
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
// 2 columns by default for wider cards that fit more content
const masonryBreakpoints = {
  default: 2,  // 2 columns on large screens (wider cards)
  1024: 2,     // 2 columns on medium screens
  768: 1       // 1 column on mobile (<768px)
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

  // Separate large and medium cards while preserving order
  const mediumCards = orderedCards.filter(card => !card.isLarge);
  const largeCards = orderedCards.filter(card => card.isLarge);

  // Render large cards as full-width rows (not draggable - they're already full width)
  const renderLargeCards = (): React.ReactNode[] => {
    return largeCards.map(card => (
      <div key={card.id} className={mergeClasses(
        styles.largeCardsRow,
        card.isTall && styles.largeCardsRowTall
      )}>
        <div>{card.element}</div>
      </div>
    ));
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

      {/* Render large cards first (full width) */}
      {renderLargeCards()}

      {/* Render medium cards with DnD support */}
      {renderMediumCards()}
    </section>
  );
};

export default CategorySection;
