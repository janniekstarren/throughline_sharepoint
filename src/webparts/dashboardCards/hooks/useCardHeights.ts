// ============================================
// useCardHeights - ResizeObserver-based Height Tracking
// ============================================
// Tracks the rendered heights of card elements for masonry layout.
// Uses ResizeObserver for efficient, performant height updates.

import * as React from 'react';

/**
 * Map of card ID to measured height
 */
export type CardHeightMap = Map<string, number>;

/**
 * Result from useCardHeights hook
 */
export interface IUseCardHeightsResult {
  /** Current height measurements */
  heights: CardHeightMap;
  /** Register a card element for height tracking */
  registerCard: (cardId: string, element: HTMLElement | null) => void;
  /** Unregister a card (cleanup) */
  unregisterCard: (cardId: string) => void;
  /** Get height for a specific card */
  getHeight: (cardId: string) => number;
  /** Force re-measurement of all cards */
  remeasureAll: () => void;
}

/**
 * Hook for tracking card element heights using ResizeObserver
 */
export function useCardHeights(defaultHeight: number = 200): IUseCardHeightsResult {
  // Map of card IDs to their measured heights
  const [heights, setHeights] = React.useState<CardHeightMap>(new Map());

  // Refs to track elements and observer
  const elementsRef = React.useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = React.useRef<ResizeObserver | null>(null);

  // Batch height updates to avoid too many re-renders
  const pendingUpdates = React.useRef<Map<string, number>>(new Map());
  const updateTimeoutRef = React.useRef<number | null>(null);

  /**
   * Flush pending height updates to state
   */
  const flushUpdates = React.useCallback(() => {
    if (pendingUpdates.current.size === 0) return;

    setHeights(prev => {
      const next = new Map(prev);
      pendingUpdates.current.forEach((height, id) => {
        // Only update if height actually changed
        if (next.get(id) !== height) {
          next.set(id, height);
        }
      });
      pendingUpdates.current.clear();
      return next;
    });
  }, []);

  /**
   * Schedule a batched update
   */
  const scheduleUpdate = React.useCallback(() => {
    if (updateTimeoutRef.current !== null) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    // Batch updates within 16ms frame
    updateTimeoutRef.current = window.setTimeout(flushUpdates, 16);
  }, [flushUpdates]);

  /**
   * Initialize ResizeObserver
   */
  React.useEffect(() => {
    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        // Find the card ID for this element
        Array.from(elementsRef.current.entries()).forEach(([cardId, el]) => {
          if (el === element) {
            const height = entry.contentRect.height;
            if (height > 0) {
              pendingUpdates.current.set(cardId, height);
            }
          }
        });
      }
      scheduleUpdate();
    });

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (updateTimeoutRef.current !== null) {
        window.clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [scheduleUpdate]);

  /**
   * Register a card element for height tracking
   */
  const registerCard = React.useCallback(
    (cardId: string, element: HTMLElement | null) => {
      const observer = observerRef.current;
      const currentElement = elementsRef.current.get(cardId);

      // Unobserve old element if exists
      if (currentElement && observer) {
        observer.unobserve(currentElement);
      }

      if (element) {
        // Store element reference
        elementsRef.current.set(cardId, element);

        // Observe new element
        if (observer) {
          observer.observe(element);
        }

        // Immediately measure
        const height = element.offsetHeight;
        if (height > 0) {
          pendingUpdates.current.set(cardId, height);
          scheduleUpdate();
        }
      } else {
        // Element removed
        elementsRef.current.delete(cardId);
      }
    },
    [scheduleUpdate]
  );

  /**
   * Unregister a card (cleanup)
   */
  const unregisterCard = React.useCallback((cardId: string) => {
    const observer = observerRef.current;
    const element = elementsRef.current.get(cardId);

    if (element && observer) {
      observer.unobserve(element);
    }

    elementsRef.current.delete(cardId);

    // Remove from heights
    setHeights(prev => {
      if (prev.has(cardId)) {
        const next = new Map(prev);
        next.delete(cardId);
        return next;
      }
      return prev;
    });
  }, []);

  /**
   * Get height for a specific card
   */
  const getHeight = React.useCallback(
    (cardId: string): number => {
      return heights.get(cardId) || defaultHeight;
    },
    [heights, defaultHeight]
  );

  /**
   * Force re-measurement of all cards
   */
  const remeasureAll = React.useCallback(() => {
    Array.from(elementsRef.current.entries()).forEach(([cardId, element]) => {
      const height = element.offsetHeight;
      if (height > 0) {
        pendingUpdates.current.set(cardId, height);
      }
    });
    scheduleUpdate();
  }, [scheduleUpdate]);

  return {
    heights,
    registerCard,
    unregisterCard,
    getHeight,
    remeasureAll,
  };
}

/**
 * Ref callback creator for card height registration
 * Usage: <div ref={createCardRef('my-card-id')} />
 */
export function createCardRefCallback(
  registerCard: (cardId: string, element: HTMLElement | null) => void,
  cardId: string
): React.RefCallback<HTMLElement> {
  return (element: HTMLElement | null) => {
    registerCard(cardId, element);
  };
}
