/**
 * useQueryInterface - Shared query state hook for Intelligence Hub & Floating AI Chat
 *
 * Wraps useQueryEngine + manages queryText state + computes thinkingSourceNames.
 * A single instance is created in DashboardCards.tsx and passed to both the
 * Intelligence Hub and the Floating AI Chat Dialog so they share state.
 */

import * as React from 'react';
import { useQueryEngine, IUseQueryEngineResult } from './useQueryEngine';
import { QueryResponse, QUERY_INTENTS } from '../config/queryIntents';

// ============================================
// Interface
// ============================================

export interface IQueryInterface {
  /** Current query text */
  queryText: string;
  /** Set the current query text */
  setQueryText: (text: string) => void;
  /** Whether a query is currently being processed */
  isProcessing: boolean;
  /** The latest query results */
  results: QueryResponse | null;
  /** Any error from the last query */
  error: string | null;
  /** Submit a query for processing */
  submitQuery: (query: string) => Promise<void>;
  /** Handle a follow-up question */
  handleFollowUp: (query: string) => Promise<void>;
  /** Clear results and reset state */
  clearResults: () => void;
  /** Source card names for thinking animation */
  thinkingSourceNames: string[];
}

// ============================================
// Hook
// ============================================

export function useQueryInterface(): IQueryInterface {
  const queryEngine: IUseQueryEngineResult = useQueryEngine();
  const [queryText, setQueryText] = React.useState<string>('');

  // Compute source card names for thinking animation based on matched intent
  const thinkingSourceNames = React.useMemo(() => {
    const intent = QUERY_INTENTS.find(i =>
      i.patterns.some(p => p.test(queryText.toLowerCase()))
    );
    if (intent && intent.id !== 'fallback') {
      return intent.cardSources.slice(0, 4);
    }
    return ['Stale Conversations', 'Broken Promises', 'Focus Time Defender'];
  }, [queryText]);

  const submitQuery = React.useCallback(
    async (query: string) => {
      setQueryText(query);
      await queryEngine.submitQuery(query);
    },
    [queryEngine]
  );

  const handleFollowUp = React.useCallback(
    async (query: string) => {
      setQueryText(query);
      await queryEngine.submitQuery(query);
    },
    [queryEngine]
  );

  const clearResults = React.useCallback(() => {
    queryEngine.clearResults();
    setQueryText('');
  }, [queryEngine]);

  return {
    queryText,
    setQueryText,
    isProcessing: queryEngine.isProcessing,
    results: queryEngine.results,
    error: queryEngine.error,
    submitQuery,
    handleFollowUp,
    clearResults,
    thinkingSourceNames,
  };
}
