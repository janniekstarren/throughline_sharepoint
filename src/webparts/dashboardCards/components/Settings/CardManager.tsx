// ============================================
// CardManager - Card Visibility and Size
// ============================================
// Allows users to show/hide cards and change their sizes.
// Grouped by category with expand/collapse.
// Uses pure HTML/CSS to avoid React Error #310 in SharePoint.

import * as React from 'react';
import {
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
 * Props for a single card item
 */
interface ICardItemProps {
  cardId: string;
  config: ICardConfig;
  onSizeChange: (cardId: string, size: CardSize) => void;
  onVisibilityChange: (cardId: string, visible: boolean) => void;
}

/**
 * CardItem Component
 * Individual card item with pure HTML/CSS controls.
 */
const CardItem: React.FC<ICardItemProps> = ({
  cardId,
  config,
  onSizeChange,
  onVisibilityChange,
}) => {
  const handleVisibilityToggle = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      onVisibilityChange(cardId, ev.target.checked);
    },
    [cardId, onVisibilityChange]
  );

  const handleSizeClick = React.useCallback(
    (size: CardSize) => {
      onSizeChange(cardId, size);
    },
    [cardId, onSizeChange]
  );

  const displayName = CARD_DISPLAY_NAMES[cardId] || cardId;

  return (
    <div
      className={`${styles.cardItem} ${!config.visible ? styles.hidden : ''}`}
    >
      {/* Visibility toggle - pure CSS toggle switch */}
      <label className={styles.switchLabel}>
        <input
          type="checkbox"
          checked={config.visible}
          onChange={handleVisibilityToggle}
          className={styles.switchInput}
          aria-label={`Show ${displayName}`}
        />
        <span className={styles.switchTrack}>
          <span className={styles.switchThumb} />
        </span>
      </label>

      {/* Card info */}
      <div className={styles.cardInfo}>
        <span className={styles.cardName}>{displayName}</span>
      </div>

      {/* Size selector - pure CSS buttons */}
      <div className={styles.sizeSelector}>
        <button
          className={`${styles.sizeButton} ${config.size === 'small' ? styles.active : ''}`}
          onClick={() => handleSizeClick('small')}
          title="Small"
          aria-pressed={config.size === 'small'}
        >
          S
        </button>
        <button
          className={`${styles.sizeButton} ${config.size === 'medium' ? styles.active : ''}`}
          onClick={() => handleSizeClick('medium')}
          title="Medium"
          aria-pressed={config.size === 'medium'}
        >
          M
        </button>
        <button
          className={`${styles.sizeButton} ${config.size === 'large' ? styles.active : ''}`}
          onClick={() => handleSizeClick('large')}
          title="Large"
          aria-pressed={config.size === 'large'}
        >
          L
        </button>
      </div>
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
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

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
          {category.cardIds.map(cardId => {
            const config = cards[cardId];
            if (!config) return null;

            return (
              <CardItem
                key={cardId}
                cardId={cardId}
                config={config}
                onSizeChange={onSizeChange}
                onVisibilityChange={onVisibilityChange}
              />
            );
          })}
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
  // onReorderInCategory - temporarily disabled
}) => {
  return (
    <div className={styles.cardManager}>
      {categories.map(category => (
        <CategoryCardGroup
          key={category.categoryId}
          category={category}
          cards={cards}
          onSizeChange={onSizeChange}
          onVisibilityChange={onVisibilityChange}
        />
      ))}
    </div>
  );
};

export default CardManager;
