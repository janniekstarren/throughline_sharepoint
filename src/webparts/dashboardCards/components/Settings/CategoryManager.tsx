// ============================================
// CategoryManager - Category Reordering
// ============================================
// Drag-and-drop category list using @dnd-kit.
// Allows users to reorder and toggle categories.

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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Toggle } from '@fluentui/react';
import { ReOrderDotsVertical24Regular } from '@fluentui/react-icons';
import { ICategoryConfig } from '../../models/DashboardConfiguration';
import styles from './SettingsPanel.module.scss';

/**
 * Props for CategoryManager
 */
export interface ICategoryManagerProps {
  /** Current categories in order */
  categories: ICategoryConfig[];
  /** Called when categories are reordered */
  onReorder: (categoryIds: string[]) => void;
  /** Called when category collapsed state changes */
  onCollapsedChange?: (categoryId: string, collapsed: boolean) => void;
}

/**
 * Props for a single sortable category item
 */
interface ISortableCategoryItemProps {
  category: ICategoryConfig;
  onCollapsedChange?: (categoryId: string, collapsed: boolean) => void;
}

/**
 * SortableCategoryItem Component
 * Individual draggable category item.
 */
const SortableCategoryItem: React.FC<ISortableCategoryItemProps> = ({
  category,
  onCollapsedChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.categoryId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCollapsedToggle = React.useCallback(
    (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
      onCollapsedChange?.(category.categoryId, !checked);
    },
    [category.categoryId, onCollapsedChange]
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.categoryItem} ${isDragging ? styles.dragging : ''}`}
    >
      {/* Drag handle */}
      <button
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${category.displayName}`}
      >
        <ReOrderDotsVertical24Regular />
      </button>

      {/* Category info */}
      <div className={styles.categoryInfo}>
        <span className={styles.categoryName}>{category.displayName}</span>
        <span className={styles.cardCount}>{category.cardIds.length} cards</span>
      </div>

      {/* Visibility toggle */}
      <Toggle
        checked={category.visible}
        onChange={handleCollapsedToggle}
        ariaLabel={`Show ${category.displayName}`}
        styles={{ root: { marginBottom: 0 } }}
      />
    </div>
  );
};

/**
 * CategoryManager Component
 * Manages category order and visibility.
 */
export const CategoryManager: React.FC<ICategoryManagerProps> = ({
  categories,
  onReorder,
  onCollapsedChange,
}) => {
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = categories.findIndex(c => c.categoryId === active.id);
        const newIndex = categories.findIndex(c => c.categoryId === over.id);

        const newOrder = arrayMove(
          categories.map(c => c.categoryId),
          oldIndex,
          newIndex
        );

        onReorder(newOrder);
      }
    },
    [categories, onReorder]
  );

  // Get sortable IDs
  const categoryIds = React.useMemo(
    () => categories.map(c => c.categoryId),
    [categories]
  );

  return (
    <div className={styles.categoryManager}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categoryIds}
          strategy={verticalListSortingStrategy}
        >
          {categories.map(category => (
            <SortableCategoryItem
              key={category.categoryId}
              category={category}
              onCollapsedChange={onCollapsedChange}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default CategoryManager;
