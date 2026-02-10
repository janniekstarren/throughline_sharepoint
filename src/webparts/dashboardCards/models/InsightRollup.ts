/**
 * InsightRollup - Models for the AI Insights aggregation system
 *
 * These types define the structure for aggregated insights that are
 * generated from all active intelligence cards and displayed in
 * the Intelligence Hub's Insights Rollup panel.
 */

// ============================================
// Severity Levels
// ============================================

export enum InsightSeverity {
  Critical = 'critical',   // Red — needs immediate action
  Warning = 'warning',     // Amber — needs attention soon
  Info = 'info',           // Blue — good to know
  Positive = 'positive',   // Green — something going well
}

/** Numeric order for sorting (lower = more urgent) */
export function severityOrder(severity: InsightSeverity): number {
  switch (severity) {
    case InsightSeverity.Critical: return 0;
    case InsightSeverity.Warning: return 1;
    case InsightSeverity.Info: return 2;
    case InsightSeverity.Positive: return 3;
    default: return 4;
  }
}

// ============================================
// Aggregated Insight
// ============================================

export interface AggregatedInsight {
  id: string;
  severity: InsightSeverity;
  icon: string;                     // Emoji icon
  message: string;                  // One-line summary
  sourceCardId: string;             // Which card generated this insight
  sourceCardName: string;
  category: string;                 // Card category
  timestamp: Date;                  // When this insight was generated
  action?: {
    label: string;
    target: string;                 // 'card:stale-conversations' | 'external:teams' etc.
  };
  relatedPersons?: string[];        // People involved
}

// ============================================
// Insights Summary (for collapsed bar & counters)
// ============================================

export interface InsightsSummary {
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  positiveCount: number;
  totalCount: number;
  lastUpdated: Date;
}
