// ============================================
// VisualWeightContext - Tier 2 Weight Reporting
// ============================================
// Provides a pub/sub store for card components to report their
// visual weight. AdaptiveCardSurface reads from this context,
// falling back to Tier 1 (static) weight when no report exists.

import * as React from 'react';
import { VisualWeight } from '../models/VisualWeight';

// ============================================
// Types
// ============================================

export interface IVisualWeightRegistry {
  /** Map of cardId → reported VisualWeight */
  weights: Map<string, VisualWeight>;
  /** Report a visual weight for a card (called by card data hooks) */
  reportWeight: (cardId: string, weight: VisualWeight) => void;
  /** Get the reported weight for a card (undefined = no report, use Tier 1) */
  getWeight: (cardId: string) => VisualWeight | undefined;
}

// ============================================
// Context
// ============================================

const defaultRegistry: IVisualWeightRegistry = {
  weights: new Map(),
  reportWeight: () => { /* no-op before provider */ },
  getWeight: () => undefined,
};

const VisualWeightContext = React.createContext<IVisualWeightRegistry>(defaultRegistry);

// ============================================
// Provider
// ============================================

export const VisualWeightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weights, setWeights] = React.useState<Map<string, VisualWeight>>(new Map());

  const reportWeight = React.useCallback((cardId: string, weight: VisualWeight) => {
    setWeights(prev => {
      const current = prev.get(cardId);
      if (current === weight) return prev; // No change, skip re-render
      const next = new Map(prev);
      next.set(cardId, weight);
      return next;
    });
  }, []);

  const getWeight = React.useCallback((cardId: string): VisualWeight | undefined => {
    return weights.get(cardId);
  }, [weights]);

  const value = React.useMemo<IVisualWeightRegistry>(() => ({
    weights,
    reportWeight,
    getWeight,
  }), [weights, reportWeight, getWeight]);

  return (
    <VisualWeightContext.Provider value={value}>
      {children}
    </VisualWeightContext.Provider>
  );
};

// ============================================
// Hooks
// ============================================

/** Read the full weight registry (for aggregation, e.g., Pulse counts) */
export function useVisualWeightRegistry(): IVisualWeightRegistry {
  return React.useContext(VisualWeightContext);
}

/** Report a visual weight for a specific card. Call from card data hooks. */
export function useReportVisualWeight(cardId: string, weight: VisualWeight | undefined): void {
  const { reportWeight } = React.useContext(VisualWeightContext);
  React.useEffect(() => {
    if (weight !== undefined) {
      reportWeight(cardId, weight);
    }
  }, [cardId, weight, reportWeight]);
}

/** Get the reported weight for a specific card (undefined = use Tier 1) */
export function useCardVisualWeight(cardId: string): VisualWeight | undefined {
  const { getWeight } = React.useContext(VisualWeightContext);
  return getWeight(cardId);
}
