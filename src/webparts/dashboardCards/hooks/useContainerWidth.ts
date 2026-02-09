// ============================================
// useContainerWidth - Container Width Tracking
// ============================================
// Tracks the width of the grid container and calculates responsive columns.
// Uses ResizeObserver for efficient width updates.

import * as React from 'react';
import {
  DEFAULT_BREAKPOINTS,
  getColumnCountForWidth,
  IBreakpointConfig,
} from '../services/MasonryLayoutEngine';

/**
 * Result from useContainerWidth hook
 */
export interface IUseContainerWidthResult {
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Current container width in pixels */
  containerWidth: number;
  /** Current number of columns based on breakpoints */
  columnCount: number;
  /** Calculated width of each column */
  columnWidth: number;
  /** Gap between items */
  gap: number;
  /** Whether the container has been measured */
  isMeasured: boolean;
}

/**
 * Options for useContainerWidth hook
 */
export interface IUseContainerWidthOptions {
  /** Gap between items in pixels */
  gap?: number;
  /** Custom breakpoints (defaults to DEFAULT_BREAKPOINTS) */
  breakpoints?: IBreakpointConfig[];
  /** Initial width before measurement (defaults to 0) */
  initialWidth?: number;
  /** Debounce delay in milliseconds (defaults to 16) */
  debounceDelay?: number;
}

/**
 * Hook for tracking container width and calculating responsive columns
 */
export function useContainerWidth(
  options: IUseContainerWidthOptions = {}
): IUseContainerWidthResult {
  const {
    gap = 16,
    breakpoints = DEFAULT_BREAKPOINTS,
    initialWidth = 0,
    debounceDelay = 16,
  } = options;

  // Ref for the container element
  const containerRef = React.useRef<HTMLDivElement>(null);

  // State
  const [containerWidth, setContainerWidth] = React.useState(initialWidth);
  const [isMeasured, setIsMeasured] = React.useState(false);

  // Debounce timer ref
  const debounceTimerRef = React.useRef<number | null>(null);

  /**
   * Update width with debouncing
   */
  const updateWidth = React.useCallback(
    (width: number) => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.setTimeout(() => {
        setContainerWidth(width);
        setIsMeasured(true);
      }, debounceDelay);
    },
    [debounceDelay]
  );

  /**
   * Set up ResizeObserver
   */
  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Initial measurement
    const initialMeasure = element.offsetWidth;
    if (initialMeasure > 0) {
      setContainerWidth(initialMeasure);
      setIsMeasured(true);
    }

    // Observe resize
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          updateWidth(width);
        }
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [updateWidth]);

  // Calculate column count based on current width
  const columnCount = React.useMemo(
    () => getColumnCountForWidth(containerWidth, breakpoints),
    [containerWidth, breakpoints]
  );

  // Calculate column width
  const columnWidth = React.useMemo(() => {
    if (columnCount === 0 || containerWidth === 0) return 0;
    const totalGapSpace = (columnCount - 1) * gap;
    return (containerWidth - totalGapSpace) / columnCount;
  }, [containerWidth, columnCount, gap]);

  return {
    containerRef,
    containerWidth,
    columnCount,
    columnWidth,
    gap,
    isMeasured,
  };
}

// ============================================
// Additional Hook: useMasonryLayout
// ============================================
// Combines container width tracking with layout calculation

import {
  MasonryLayoutEngine,
  createMasonryLayoutEngine,
  IMasonryItem,
  IMasonryLayout,
} from '../services/MasonryLayoutEngine';

/**
 * Result from useMasonryLayout hook
 */
export interface IUseMasonryLayoutResult extends IUseContainerWidthResult {
  /** Calculated layout with positions */
  layout: IMasonryLayout | null;
  /** Total height of the grid */
  totalHeight: number;
}

/**
 * Combined hook for masonry layout calculation
 */
export function useMasonryLayout(
  items: IMasonryItem[],
  cardHeights: Map<string, number>,
  options: IUseContainerWidthOptions = {}
): IUseMasonryLayoutResult {
  const { gap = 16, ...containerOptions } = options;

  // Track container width
  const containerState = useContainerWidth({ gap, ...containerOptions });
  const { containerWidth, columnCount, isMeasured } = containerState;

  // Layout engine ref
  const engineRef = React.useRef<MasonryLayoutEngine | null>(null);

  // Calculate layout
  const layout = React.useMemo(() => {
    if (!isMeasured || containerWidth === 0 || columnCount === 0) {
      return null;
    }

    // Create or update engine
    if (!engineRef.current) {
      engineRef.current = createMasonryLayoutEngine({
        containerWidth,
        columnCount,
        gap,
        defaultItemHeight: 200,
      });
    } else {
      engineRef.current.updateConfig({
        containerWidth,
        columnCount,
        gap,
      });
    }

    // Build items with measured heights
    const itemsWithHeights: IMasonryItem[] = items.map(item => ({
      ...item,
      height: cardHeights.get(item.id) || item.height || 200,
    }));

    return engineRef.current.calculateLayout(itemsWithHeights);
  }, [items, cardHeights, containerWidth, columnCount, gap, isMeasured]);

  const totalHeight = layout?.totalHeight || 0;

  return {
    ...containerState,
    layout,
    totalHeight,
  };
}
