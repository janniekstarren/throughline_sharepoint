// ============================================
// CategorySection - Category Layout with Masonry Grid
// ============================================
// Renders cards grouped by category using the new MasonryGrid
// with @dnd-kit for drag-and-drop reordering.

import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mergeClasses } from '@fluentui/react-components';
import { ChevronDown20Regular, ChevronRight20Regular } from '@fluentui/react-icons';
import { getIconById } from '../propertyPane/CardConfigDialog';
import { CardSize, getColumnSpan } from '../types/CardSize';
import { MasonryGrid, IMasonryGridChild } from './Grid';
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
  iconId?: string; // Icon ID to display next to category title
  orderedCards: IOrderedCard[]; // Cards in user-defined order with size info
  isDragging?: boolean; // Enable drag mode layout (legacy, now handled internally)
  startIndex?: number; // Global index offset for this section (legacy)
  /** Whether the category is collapsed */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onToggleCollapsed?: () => void;
  /** Callback when cards are reordered */
  onReorder?: (cardIds: string[]) => void;
  /** Enable animations */
  animationsEnabled?: boolean;
}

// ============================================
// SortableCard - Draggable card wrapper
// ============================================

interface ISortableCardProps {
  id: string;
  children: React.ReactNode;
}

const SortableCard: React.FC<ISortableCardProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? styles.cardDragging : undefined}
    >
      {children}
    </div>
  );
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
  onReorder,
  animationsEnabled = true,
}) => {
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id && onReorder) {
        const oldIndex = orderedCards.findIndex(c => c.id === active.id);
        const newIndex = orderedCards.findIndex(c => c.id === over.id);

        const newOrder = arrayMove(
          orderedCards.map(c => c.id),
          oldIndex,
          newIndex
        );

        onReorder(newOrder);
      }
    },
    [orderedCards, onReorder]
  );

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

  // Combine non-small cards for masonry layout
  const masonryCards = [...mediumCards, ...largeCards];

  // Convert to MasonryGridChild format
  const masonryChildren: IMasonryGridChild[] = masonryCards.map(card => {
    const size = getCardSize(card);
    return {
      id: card.id,
      columnSpan: getColumnSpan(size),
      element: onReorder ? (
        <SortableCard id={card.id}>{card.element}</SortableCard>
      ) : (
        card.element
      ),
    };
  });

  // Card IDs for sortable context
  const sortableIds = masonryCards.map(c => c.id);

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

  // Render main content (masonry grid with drag-drop)
  const renderMasonryContent = (): React.ReactNode => {
    if (masonryCards.length === 0) return null;

    const content = (
      <MasonryGrid
        gap={16}
        animationsEnabled={animationsEnabled}
      >
        {masonryChildren}
      </MasonryGrid>
    );

    // Wrap with DnD context if reorder callback provided
    if (onReorder) {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            {content}
          </SortableContext>
        </DndContext>
      );
    }

    return content;
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

      {/* Category content (hidden when collapsed) */}
      {!collapsed && (
        <div className={mergeClasses(styles.categoryContent, animationsEnabled && styles.animated)}>
          {/* Render small cards first (horizontal row of chips) */}
          {renderSmallCards()}

          {/* Render medium and large cards in masonry grid */}
          {renderMasonryContent()}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
