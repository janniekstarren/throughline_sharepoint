/**
 * useQueryEngine - React hook wrapping the QueryEngine service
 *
 * Provides: query submission, loading state, results, and error handling.
 * Also handles auto-submit when queryText is set externally (e.g., from CollapsedBar).
 */

import * as React from 'react';
import { processQuery, QueryResult } from '../services/QueryEngine';
import { QueryResponse } from '../config/queryIntents';
import { DemoDataset, DEMO_DATA } from '../config/demoData';

export interface IUseQueryEngineResult {
  /** Whether a query is currently being processed */
  isProcessing: boolean;
  /** The latest query results */
  results: QueryResponse | null;
  /** The matched intent ID (for debugging) */
  matchedIntent: string | null;
  /** Processing time in ms */
  processingTimeMs: number | null;
  /** Any error from the last query */
  error: string | null;
  /** Submit a query */
  submitQuery: (query: string) => Promise<void>;
  /** Clear results and reset state */
  clearResults: () => void;
}

export function useQueryEngine(data: DemoDataset = DEMO_DATA): IUseQueryEngineResult {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [results, setResults] = React.useState<QueryResponse | null>(null);
  const [matchedIntent, setMatchedIntent] = React.useState<string | null>(null);
  const [processingTimeMs, setProcessingTimeMs] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const submitQuery = React.useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setIsProcessing(true);
      setError(null);
      setResults(null);
      setMatchedIntent(null);
      setProcessingTimeMs(null);

      try {
        const result: QueryResult = await processQuery(query, data);
        setResults(result.response);
        setMatchedIntent(result.matchedIntent);
        setProcessingTimeMs(result.processingTimeMs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsProcessing(false);
      }
    },
    [data]
  );

  const clearResults = React.useCallback(() => {
    setResults(null);
    setMatchedIntent(null);
    setProcessingTimeMs(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    isProcessing,
    results,
    matchedIntent,
    processingTimeMs,
    error,
    submitQuery,
    clearResults,
  };
}
