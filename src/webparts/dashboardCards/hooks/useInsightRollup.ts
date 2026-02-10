/**
 * useInsightRollup - React hook wrapping the InsightAggregator service
 *
 * Provides: aggregated insights, summary counts, auto-refresh timer,
 * manual refresh, and lastUpdated timestamp.
 */

import * as React from 'react';
import {
  generateInsights,
  generateInsightsSummary,
} from '../services/InsightAggregator';
import { AggregatedInsight, InsightsSummary } from '../models/InsightRollup';
import { DEMO_DATA } from '../config/demoData';

export interface IUseInsightRollupResult {
  /** Sorted array of all aggregated insights */
  insights: AggregatedInsight[];
  /** Summary counts by severity */
  summary: InsightsSummary;
  /** Refresh insights manually */
  refresh: () => void;
  /** When insights were last generated */
  lastUpdated: Date;
}

export function useInsightRollup(
  /** Auto-refresh interval in seconds (0 = disabled) */
  refreshIntervalSeconds: number = 300
): IUseInsightRollupResult {
  const [insights, setInsights] = React.useState<AggregatedInsight[]>([]);
  const [summary, setSummary] = React.useState<InsightsSummary>({
    criticalCount: 0,
    warningCount: 0,
    infoCount: 0,
    positiveCount: 0,
    totalCount: 0,
    lastUpdated: new Date(),
  });
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());

  const refresh = React.useCallback(() => {
    const newInsights = generateInsights(DEMO_DATA);
    const newSummary = generateInsightsSummary(newInsights);
    setInsights(newInsights);
    setSummary(newSummary);
    setLastUpdated(new Date());
  }, []);

  // Initial load
  React.useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh timer
  React.useEffect(() => {
    if (refreshIntervalSeconds <= 0) return undefined;

    const intervalMs = refreshIntervalSeconds * 1000;
    const timer = setInterval(() => {
      refresh();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [refreshIntervalSeconds, refresh]);

  return {
    insights,
    summary,
    refresh,
    lastUpdated,
  };
}
