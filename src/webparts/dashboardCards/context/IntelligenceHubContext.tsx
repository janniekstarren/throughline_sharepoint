/**
 * IntelligenceHubContext - Ephemeral state for the Intelligence Hub
 *
 * Manages: collapsed state, query text, results, insights, processing flag.
 * Note: Hub collapsed state is persisted via useCardPreferences (localStorage).
 * This context only holds transient UI state.
 */

import * as React from 'react';
import { QueryResponse } from '../config/queryIntents';
import { AggregatedInsight, InsightsSummary } from '../models/InsightRollup';

// ============================================
// Context Value Interface
// ============================================

export interface IIntelligenceHubState {
  /** Whether the hub is collapsed to a single bar */
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;

  /** Current query text in the box */
  queryText: string;
  setQueryText: (text: string) => void;

  /** Whether a query is being processed */
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;

  /** Current query results (null = no query run yet) */
  results: QueryResponse | null;
  setResults: (results: QueryResponse | null) => void;

  /** Aggregated insights for the rollup panel */
  insights: AggregatedInsight[];
  setInsights: (insights: AggregatedInsight[]) => void;

  /** Insights summary counts */
  insightsSummary: InsightsSummary | null;
  setInsightsSummary: (summary: InsightsSummary | null) => void;

  /** Clear query state (text + results) */
  clearQuery: () => void;
}

// ============================================
// Context
// ============================================

const defaultState: IIntelligenceHubState = {
  isCollapsed: false,
  setIsCollapsed: () => undefined,
  queryText: '',
  setQueryText: () => undefined,
  isProcessing: false,
  setIsProcessing: () => undefined,
  results: null,
  setResults: () => undefined,
  insights: [],
  setInsights: () => undefined,
  insightsSummary: null,
  setInsightsSummary: () => undefined,
  clearQuery: () => undefined,
};

export const IntelligenceHubContext = React.createContext<IIntelligenceHubState>(defaultState);

// ============================================
// Provider
// ============================================

interface IntelligenceHubProviderProps {
  /** Initial collapsed state (from persisted preference) */
  initialCollapsed?: boolean;
  /** Callback when collapsed state changes (to persist) */
  onCollapsedChange?: (collapsed: boolean) => void;
  children: React.ReactNode;
}

export const IntelligenceHubProvider: React.FC<IntelligenceHubProviderProps> = ({
  initialCollapsed = false,
  onCollapsedChange,
  children,
}) => {
  const [isCollapsed, setIsCollapsedInternal] = React.useState(initialCollapsed);
  const [queryText, setQueryText] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [results, setResults] = React.useState<QueryResponse | null>(null);
  const [insights, setInsights] = React.useState<AggregatedInsight[]>([]);
  const [insightsSummary, setInsightsSummary] = React.useState<InsightsSummary | null>(null);

  // Sync with external collapsed state
  React.useEffect(() => {
    setIsCollapsedInternal(initialCollapsed);
  }, [initialCollapsed]);

  const setIsCollapsed = React.useCallback((collapsed: boolean) => {
    setIsCollapsedInternal(collapsed);
    onCollapsedChange?.(collapsed);
  }, [onCollapsedChange]);

  const clearQuery = React.useCallback(() => {
    setQueryText('');
    setResults(null);
    setIsProcessing(false);
  }, []);

  const value = React.useMemo<IIntelligenceHubState>(() => ({
    isCollapsed,
    setIsCollapsed,
    queryText,
    setQueryText,
    isProcessing,
    setIsProcessing,
    results,
    setResults,
    insights,
    setInsights,
    insightsSummary,
    setInsightsSummary,
    clearQuery,
  }), [isCollapsed, setIsCollapsed, queryText, isProcessing, results, insights, insightsSummary, clearQuery]);

  return (
    <IntelligenceHubContext.Provider value={value}>
      {children}
    </IntelligenceHubContext.Provider>
  );
};

// ============================================
// Hook
// ============================================

export function useIntelligenceHub(): IIntelligenceHubState {
  return React.useContext(IntelligenceHubContext);
}
