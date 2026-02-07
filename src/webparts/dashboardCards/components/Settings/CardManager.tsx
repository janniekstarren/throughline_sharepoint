// ============================================
// CardManager - Card Visibility and Size
// ============================================
// Allows users to show/hide cards and change their sizes.
// Grouped by category with expand/collapse.

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
import { Toggle, ChoiceGroup, IChoiceGroupOption } from '@fluentui/react';
import {
  ReOrderDotsVertical24Regular,
  ChevronDown16Regular,
  ChevronRight16Regular,
} from '@fluentui/react-icons';
import { ICategoryConfig, ICardConfig } from '../../models/DashboardConfiguration';
import { CardSize } from '../../types/CardSize';
import styles from './SettingsPanel.module.scss';

// Card display names (could be imported from a central location)
const CARD_DISPLAY_NAMES: Record<string, string> = {
  'waiting-on-you': 'Waiting On You',
  'waiting-on-others': 'Waiting On Others',
  'todays-agenda': "Today's Agenda",
  'upcoming-week': 'Upcoming Week',
  'my-tasks': 'My Tasks',
  'unread-inbox': 'Unread Inbox',
  'flagged-emails': 'Flagged Emails',
  'recent-files': 'Recent Files',
  'shared-with-me': 'Shared With Me',
  'my-team': 'My Team',
  'quick-links': 'Quick Links',
  'site-activity': 'Site Activity',
  'context-switching': 'Context Switching',
};

/**
 * Props for CardManager
 */
export interface ICardManagerProps {
  /** Categories with card assignments */
  categories: ICategoryConfig[];
  /** Card configurations */
  cards: Record<string, ICardConfig>;
  /** Called when card size changes */
  onSizeChange: (cardId: string, size: CardSize) => void;
  /** Called when card visibility changes */
  onVisibilityChange: (cardId: string, visible: boolean) => void;
  /** Called when cards are reordered within a category */
  onReorderInCategory: (categoryId: string, cardIds: string[]) => void;
  /** Called when a card is moved to a different category */
  onMoveToCategory?: (cardId: string, targetCategoryId: string) => void;
}

/**
 * Size options for the ChoiceGroup
 */
const sizeOptions: IChoiceGroupOption[] = [
  { key: 'small', text: 'S', title: 'Small' },
  { key: 'medium', text: 'M', title: 'Medium' },
  { key: 'large', text: 'L', title: 'Large' },
];

/**
 * Props for a single sortable card item
 */
interface ISortableCardItemProps {
  cardId: string;
  config: ICardConfig;
  onSizeChange: (cardId: string, size: CardSize) => void;
  onVisibilityChange: (cardId: string, visible: boolean) => void;
}

/**
 * SortableCardItem Component
 * Individual draggable card item.
 */
const SortableCardItem: React.FC<ISortableCardItemProps> = ({
  cardId,
  config,
  onSizeChange,
  onVisibilityChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cardId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleVisibilityToggle = React.useCallback(
    (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
      onVisibilityChange(cardId, checked ?? false);
    },
    [cardId, onVisibilityChange]
  );

  const handleSizeChange = React.useCallback(
    (ev?: React.FormEvent<HTMLElement>, option?: IChoiceGroupOption) => {
      if (option) {
        onSizeChange(cardId, option.key as CardSize);
      }
    },
    [cardId, onSizeChange]
  );

  const displayName = CARD_DISPLAY_NAMES[cardId] || cardId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.cardItem} ${isDragging ? styles.dragging : ''} ${
        !config.visible ? styles.hidden : ''
      }`}
    >
      {/* Drag handle */}
      <button
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${displayName}`}
      >
        <ReOrderDotsVertical24Regular />
      </button>

      {/* Card info */}
      <div className={styles.cardInfo}>
        <span className={styles.cardName}>{displayName}</span>
      </div>

      {/* Size selector */}
      <div className={styles.sizeSelector}>
        <ChoiceGroup
          selectedKey={config.size}
          options={sizeOptions}
          onChange={handleSizeChange}
          styles={{
            root: { display: 'flex', flexDirection: 'row' },
            flexContainer: { display: 'flex', gap: 4 },
          }}
        />
      </div>

      {/* Visibility toggle */}
      <Toggle
        checked={config.visible}
        onChange={handleVisibilityToggle}
        ariaLabel={`Show ${displayName}`}
        styles={{ root: { marginBottom: 0 } }}
      />
    </div>
  );
};

/**
 * Props for CategoryCardGroup
 */
interface ICategoryCardGroupProps {
  category: ICategoryConfig;
  cards: Record<string, ICardConfig>;
  onSizeChange: (cardId: string, size: CardSize) => void;
  onVisibilityChange: (cardId: string, visible: boolean) => void;
  onReorder: (cardIds: string[]) => void;
}

/**
 * CategoryCardGroup Component
 * Expandable group of cards within a category.
 */
const CategoryCardGroup: React.FC<ICategoryCardGroupProps> = ({
  category,
  cards,
  onSizeChange,
  onVisibilityChange,
  onReorder,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

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
        const oldIndex = category.cardIds.indexOf(active.id as string);
        const newIndex = category.cardIds.indexOf(over.id as string);

        const newOrder = arrayMove(category.cardIds, oldIndex, newIndex);
        onReorder(newOrder);
      }
    },
    [category.cardIds, onReorder]
  );

  const toggleExpanded = React.useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Count visible cards
  const visibleCount = category.cardIds.filter(
    id => cards[id]?.visible !== false
  ).length;

  return (
    <div className={styles.categoryGroup}>
      {/* Category header */}
      <button
        className={styles.categoryGroupHeader}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <span className={styles.expandIcon}>
          {isExpanded ? <ChevronDown16Regular /> : <ChevronRight16Regular />}
        </span>
        <span className={styles.categoryGroupName}>{category.displayName}</span>
        <span className={styles.categoryGroupCount}>
          {visibleCount}/{category.cardIds.length}
        </span>
      </button>

      {/* Cards list */}
      {isExpanded && (
        <div className={styles.cardsContainer}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={category.cardIds}
              strategy={verticalListSortingStrategy}
            >
              {category.cardIds.map(cardId => {
                const config = cards[cardId];
                if (!config) return null;

                return (
                  <SortableCardItem
                    key={cardId}
                    cardId={cardId}
                    config={config}
                    onSizeChange={onSizeChange}
                    onVisibilityChange={onVisibilityChange}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

/**
 * CardManager Component
 * Manages card visibility, size, and order within categories.
 */
export const CardManager: React.FC<ICardManagerProps> = ({
  categories,
  cards,
  onSizeChange,
  onVisibilityChange,
  onReorderInCategory,
}) => {
  const handleReorder = React.useCallback(
    (categoryId: string) => (cardIds: string[]) => {
      onReorderInCategory(categoryId, cardIds);
    },
    [onReorderInCategory]
  );

  return (
    <div className={styles.cardManager}>
      {categories.map(category => (
        <CategoryCardGroup
          key={category.categoryId}
          category={category}
          cards={cards}
          onSizeChange={onSizeChange}
          onVisibilityChange={onVisibilityChange}
          onReorder={handleReorder(category.categoryId)}
        />
      ))}
    </div>
  );
};

export default CardManager;
