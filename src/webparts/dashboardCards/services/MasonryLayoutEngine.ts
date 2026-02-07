// ============================================
// Masonry Layout Engine
// ============================================
// Pinterest-style masonry layout with multi-size card support.
// Cards are positioned using absolute positioning with CSS transforms.

/**
 * Card item for layout calculation
 */
export interface IMasonryItem {
  /** Unique identifier */
  id: string;
  /** Number of columns this item spans (1 or 2) */
  columnSpan: number;
  /** Measured height of the item in pixels */
  height: number;
}

/**
 * Calculated position for a card
 */
export interface IMasonryPosition {
  /** Item ID */
  id: string;
  /** X position in pixels (from left) */
  x: number;
  /** Y position in pixels (from top) */
  y: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Column index (0-based) */
  column: number;
  /** Number of columns spanned */
  columnSpan: number;
}

/**
 * Layout result from the engine
 */
export interface IMasonryLayout {
  /** Positions for all items */
  positions: Map<string, IMasonryPosition>;
  /** Total height of the grid container */
  totalHeight: number;
  /** Number of columns used */
  columnCount: number;
  /** Width of each column */
  columnWidth: number;
  /** Gap between items */
  gap: number;
}

/**
 * Configuration for the layout engine
 */
export interface IMasonryConfig {
  /** Total container width in pixels */
  containerWidth: number;
  /** Number of columns */
  columnCount: number;
  /** Gap between items in pixels */
  gap: number;
  /** Minimum height for items without measured height */
  defaultItemHeight?: number;
}

/**
 * Masonry Layout Engine
 * Calculates positions for items in a Pinterest-style masonry grid.
 */
export class MasonryLayoutEngine {
  private config: IMasonryConfig;
  private columnHeights: number[];
  private columnWidth: number;

  constructor(config: IMasonryConfig) {
    this.config = config;
    this.columnWidth = this.calculateColumnWidth();
    this.columnHeights = new Array(config.columnCount).fill(0);
  }

  /**
   * Calculate the width of each column
   */
  private calculateColumnWidth(): number {
    const { containerWidth, columnCount, gap } = this.config;
    // Total gap space = (columnCount - 1) * gap
    const totalGapSpace = (columnCount - 1) * gap;
    return (containerWidth - totalGapSpace) / columnCount;
  }

  /**
   * Find the column(s) with the minimum height for placing an item
   * For multi-column items, finds the best starting column
   */
  private findBestColumn(columnSpan: number): number {
    const { columnCount } = this.config;
    const effectiveSpan = Math.min(columnSpan, columnCount);

    if (effectiveSpan === 1) {
      // Single column: find the shortest column
      let minHeight = Infinity;
      let bestColumn = 0;

      for (let i = 0; i < columnCount; i++) {
        if (this.columnHeights[i] < minHeight) {
          minHeight = this.columnHeights[i];
          bestColumn = i;
        }
      }

      return bestColumn;
    }

    // Multi-column: find the starting position where the max height is minimized
    let bestStartColumn = 0;
    let bestMaxHeight = Infinity;

    for (let startCol = 0; startCol <= columnCount - effectiveSpan; startCol++) {
      let maxHeight = 0;
      for (let col = startCol; col < startCol + effectiveSpan; col++) {
        maxHeight = Math.max(maxHeight, this.columnHeights[col]);
      }

      if (maxHeight < bestMaxHeight) {
        bestMaxHeight = maxHeight;
        bestStartColumn = startCol;
      }
    }

    return bestStartColumn;
  }

  /**
   * Place an item in the grid
   */
  private placeItem(item: IMasonryItem): IMasonryPosition {
    const { gap, columnCount } = this.config;
    const { id, columnSpan, height } = item;

    // Constrain column span to available columns
    const effectiveSpan = Math.min(columnSpan, columnCount);

    // Find best column to place this item
    const startColumn = this.findBestColumn(effectiveSpan);

    // Calculate the Y position (max height of spanned columns)
    let y = 0;
    for (let col = startColumn; col < startColumn + effectiveSpan; col++) {
      y = Math.max(y, this.columnHeights[col]);
    }

    // Calculate X position
    const x = startColumn * (this.columnWidth + gap);

    // Calculate width (spans multiple columns)
    const width = effectiveSpan * this.columnWidth + (effectiveSpan - 1) * gap;

    // Update column heights
    const newHeight = y + height + gap;
    for (let col = startColumn; col < startColumn + effectiveSpan; col++) {
      this.columnHeights[col] = newHeight;
    }

    return {
      id,
      x,
      y,
      width,
      height,
      column: startColumn,
      columnSpan: effectiveSpan,
    };
  }

  /**
   * Calculate layout for all items
   */
  public calculateLayout(items: IMasonryItem[]): IMasonryLayout {
    const { gap, columnCount, defaultItemHeight = 200 } = this.config;
    const positions = new Map<string, IMasonryPosition>();

    // Reset column heights
    this.columnHeights = new Array(columnCount).fill(0);

    // Process each item
    for (const item of items) {
      // Use default height if not measured yet
      const itemWithHeight: IMasonryItem = {
        ...item,
        height: item.height > 0 ? item.height : defaultItemHeight,
      };

      const position = this.placeItem(itemWithHeight);
      positions.set(item.id, position);
    }

    // Calculate total height (max of all column heights, minus the last gap)
    const totalHeight = Math.max(...this.columnHeights) - gap;

    return {
      positions,
      totalHeight: Math.max(0, totalHeight),
      columnCount,
      columnWidth: this.columnWidth,
      gap,
    };
  }

  /**
   * Update configuration and recalculate column width
   */
  public updateConfig(config: Partial<IMasonryConfig>): void {
    this.config = { ...this.config, ...config };
    this.columnWidth = this.calculateColumnWidth();
    this.columnHeights = new Array(this.config.columnCount).fill(0);
  }

  /**
   * Get current column width
   */
  public getColumnWidth(): number {
    return this.columnWidth;
  }

  /**
   * Get current configuration
   */
  public getConfig(): IMasonryConfig {
    return { ...this.config };
  }
}

// ============================================
// Factory Function
// ============================================

/**
 * Create a new MasonryLayoutEngine
 */
export function createMasonryLayoutEngine(config: IMasonryConfig): MasonryLayoutEngine {
  return new MasonryLayoutEngine(config);
}

// ============================================
// Responsive Breakpoints
// ============================================

/**
 * Breakpoint configuration for responsive columns
 */
export interface IBreakpointConfig {
  /** Minimum container width for this breakpoint */
  minWidth: number;
  /** Number of columns at this breakpoint */
  columns: number;
}

/**
 * Default breakpoints matching the existing grid system
 */
export const DEFAULT_BREAKPOINTS: IBreakpointConfig[] = [
  { minWidth: 1400, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 768, columns: 2 },
  { minWidth: 0, columns: 1 },
];

/**
 * Get the number of columns for a given container width
 */
export function getColumnCountForWidth(
  containerWidth: number,
  breakpoints: IBreakpointConfig[] = DEFAULT_BREAKPOINTS
): number {
  // Sort breakpoints by minWidth descending
  const sorted = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth);

  for (const bp of sorted) {
    if (containerWidth >= bp.minWidth) {
      return bp.columns;
    }
  }

  // Fallback to 1 column
  return 1;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Calculate optimized layout positions with animation data
 * Returns positions with additional info for animating transitions
 */
export interface IAnimatedPosition extends IMasonryPosition {
  /** Previous position (if item moved) */
  previousPosition?: { x: number; y: number };
  /** Whether this item is new (just added) */
  isNew: boolean;
  /** Whether this item moved from previous position */
  didMove: boolean;
}

/**
 * Calculate layout with animation data by comparing to previous layout
 */
export function calculateAnimatedLayout(
  engine: MasonryLayoutEngine,
  items: IMasonryItem[],
  previousPositions?: Map<string, IMasonryPosition>
): Map<string, IAnimatedPosition> {
  const layout = engine.calculateLayout(items);
  const animatedPositions = new Map<string, IAnimatedPosition>();

  Array.from(layout.positions.entries()).forEach(([id, position]) => {
    const previous = previousPositions?.get(id);
    const isNew = !previous;
    const didMove = previous
      ? previous.x !== position.x || previous.y !== position.y
      : false;

    animatedPositions.set(id, {
      ...position,
      previousPosition: previous ? { x: previous.x, y: previous.y } : undefined,
      isNew,
      didMove,
    });
  });

  return animatedPositions;
}
