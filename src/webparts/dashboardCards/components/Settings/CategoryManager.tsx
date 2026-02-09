// ============================================
// CategoryManager - Category Reordering
// ============================================
// Category list for visibility toggles.
// Uses pure HTML/CSS to avoid React Error #310 in SharePoint.

import * as React from 'react';
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
 * Props for a single category item
 */
interface ICategoryItemProps {
  category: ICategoryConfig;
  onCollapsedChange?: (categoryId: string, collapsed: boolean) => void;
}

/**
 * CategoryItem Component
 * Individual category item with pure HTML/CSS toggle.
 */
const CategoryItem: React.FC<ICategoryItemProps> = ({
  category,
  onCollapsedChange,
}) => {
  const handleCollapsedToggle = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      // Toggle is "Show category" so checked = visible = not collapsed
      onCollapsedChange?.(category.categoryId, !ev.target.checked);
    },
    [category.categoryId, onCollapsedChange]
  );

  return (
    <div className={styles.categoryItem}>
      {/* Visibility toggle - pure CSS toggle switch */}
      <label className={styles.switchLabel}>
        <input
          type="checkbox"
          checked={category.visible}
          onChange={handleCollapsedToggle}
          className={styles.switchInput}
          aria-label={`Show ${category.displayName}`}
        />
        <span className={styles.switchTrack}>
          <span className={styles.switchThumb} />
        </span>
      </label>

      {/* Category info */}
      <div className={styles.categoryInfo}>
        <span className={styles.categoryName}>{category.displayName}</span>
        <span className={styles.cardCount}>{category.cardIds.length} cards</span>
      </div>
    </div>
  );
};

/**
 * CategoryManager Component
 * Manages category order and visibility.
 */
export const CategoryManager: React.FC<ICategoryManagerProps> = ({
  categories,
  // onReorder - temporarily disabled
  onCollapsedChange,
}) => {
  return (
    <div className={styles.categoryManager}>
      {categories.map(category => (
        <CategoryItem
          key={category.categoryId}
          category={category}
          onCollapsedChange={onCollapsedChange}
        />
      ))}
    </div>
  );
};

export default CategoryManager;
