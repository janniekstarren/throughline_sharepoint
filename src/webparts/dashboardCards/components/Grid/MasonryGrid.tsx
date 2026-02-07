// ============================================
// MasonryGrid - Pinterest-style Masonry Container
// ============================================
// Container component for masonry layout with absolute positioning.
// Handles layout calculation, height tracking, and animated reflow.

import * as React from 'react';
import { MasonryGridItem } from './MasonryGridItem';
import { useCardHeights } from '../../hooks/useCardHeights';
import { useMasonryLayout } from '../../hooks/useContainerWidth';
import { IMasonryItem } from '../../services/MasonryLayoutEngine';
import styles from './MasonryGrid.module.scss';

/**
 * Child item data for rendering
 */
export interface IMasonryGridChild {
  /** Unique item ID */
  id: string;
  /** Number of columns this item spans (1 or 2) */
  columnSpan: number;
  /** Initial height hint (optional, will be measured) */
  height?: number;
  /** The React element to render */
  element: React.ReactNode;
}

/**
 * Props for MasonryGrid
 */
export interface IMasonryGridProps {
  /** Child items to render */
  children: IMasonryGridChild[];
  /** Gap between items in pixels */
  gap?: number;
  /** Default item height before measurement */
  defaultItemHeight?: number;
  /** Whether animations are enabled */
  animationsEnabled?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom style for the container */
  style?: React.CSSProperties;
  /** Called when layout changes */
  onLayoutChange?: (totalHeight: number) => void;
}

/**
 * MasonryGrid Component
 * Pinterest-style masonry grid with multi-size card support.
 */
export const MasonryGrid: React.FC<IMasonryGridProps> = ({
  children,
  gap = 16,
  defaultItemHeight = 200,
  animationsEnabled = true,
  className,
  style,
  onLayoutChange,
}) => {
  // Track card heights
  const { heights, registerCard, getHeight } = useCardHeights(defaultItemHeight);

  // Convert children to layout items
  const items: IMasonryItem[] = React.useMemo(
    () =>
      children.map(child => ({
        id: child.id,
        columnSpan: child.columnSpan,
        height: getHeight(child.id),
      })),
    [children, getHeight]
  );

  // Calculate masonry layout
  const { containerRef, layout, totalHeight, columnCount, isMeasured } =
    useMasonryLayout(items, heights, { gap });

  // Notify parent of layout changes
  React.useEffect(() => {
    if (onLayoutChange && isMeasured) {
      onLayoutChange(totalHeight);
    }
  }, [totalHeight, isMeasured, onLayoutChange]);

  // Build className
  const containerClassName = [styles.masonryGrid, className]
    .filter(Boolean)
    .join(' ');

  // Container style with total height
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    minHeight: isMeasured ? totalHeight : undefined,
    ...style,
  };

  return (
    <div ref={containerRef} className={containerClassName} style={containerStyle}>
      {isMeasured && layout
        ? children.map(child => {
            const position = layout.positions.get(child.id);
            if (!position) return null;

            return (
              <MasonryGridItem
                key={child.id}
                id={child.id}
                position={position}
                animationsEnabled={animationsEnabled}
                onRegister={registerCard}
              >
                {child.element}
              </MasonryGridItem>
            );
          })
        : // Render children in initial state while measuring
          children.map(child => (
            <div
              key={child.id}
              ref={el => registerCard(child.id, el)}
              className={styles.masonryGridItemInitial}
              style={{ opacity: 0 }}
            >
              {child.element}
            </div>
          ))}

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.debugInfo} style={{ display: 'none' }}>
          Columns: {columnCount} | Items: {children.length} | Height: {totalHeight}px
        </div>
      )}
    </div>
  );
};

// ============================================
// CategorySection with MasonryGrid
// ============================================
// Wrapper that renders a category header + masonry grid

/**
 * Props for MasonryCategorySection
 */
export interface IMasonryCategorySectionProps {
  /** Category ID */
  categoryId: string;
  /** Category display name */
  displayName: string;
  /** Category icon (Fluent icon name) */
  icon?: string;
  /** Whether the category is collapsed */
  collapsed?: boolean;
  /** Toggle collapsed state */
  onToggleCollapsed?: () => void;
  /** Child items */
  children: IMasonryGridChild[];
  /** Gap between items */
  gap?: number;
  /** Animations enabled */
  animationsEnabled?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * MasonryCategorySection Component
 * Renders a category with header and masonry grid of cards.
 */
export const MasonryCategorySection: React.FC<IMasonryCategorySectionProps> = ({
  categoryId,
  displayName,
  collapsed = false,
  onToggleCollapsed,
  children,
  gap = 16,
  animationsEnabled = true,
  className,
}) => {
  const sectionClassName = [
    styles.categorySection,
    collapsed && styles.collapsed,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Don't render empty categories
  if (children.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName} data-category-id={categoryId}>
      {/* Category Header */}
      <header
        className={styles.categoryHeader}
        onClick={onToggleCollapsed}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleCollapsed?.();
          }
        }}
      >
        <span className={styles.categoryTitle}>{displayName}</span>
        <span className={styles.categoryCount}>({children.length})</span>
        <span
          className={`${styles.categoryChevron} ${collapsed ? styles.chevronCollapsed : ''}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </header>

      {/* Masonry Grid */}
      {!collapsed && (
        <MasonryGrid
          children={children}
          gap={gap}
          animationsEnabled={animationsEnabled}
        />
      )}
    </section>
  );
};

export default MasonryGrid;
