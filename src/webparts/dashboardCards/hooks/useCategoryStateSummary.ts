// ============================================
// useCategoryStateSummary - Category Urgency Aggregation
// ============================================
// Computes per-category state summaries from visual weights.
// Used by CategorySection headers to display "2 critical · 1 warning · 5 clear".

import { CardRegistration } from '../models/CardCatalog';
import { VisualWeight, computeVisualWeight, getDemoWeight } from '../models/VisualWeight';

// ============================================
// Types
// ============================================

export interface CategoryStateSummary {
  criticalCount: number;
  warningCount: number;
  activeCount: number;
  quietCount: number;
  placeholderCount: number;
  totalCount: number;
}

// ============================================
// Computation
// ============================================

/**
 * Compute a state summary for a category's cards.
 *
 * @param cards - CardRegistrations in the category
 * @param weightOverrides - Optional Tier 2 overrides (from VisualWeightContext)
 * @param isDemoMode - When true, applies demo weight overrides for realistic urgency
 * @returns Summary of urgency distribution
 */
export function computeCategoryStateSummary(
  cards: CardRegistration[],
  weightOverrides?: Map<string, VisualWeight>,
  isDemoMode?: boolean,
): CategoryStateSummary {
  const summary: CategoryStateSummary = {
    criticalCount: 0,
    warningCount: 0,
    activeCount: 0,
    quietCount: 0,
    placeholderCount: 0,
    totalCount: cards.length,
  };

  for (const card of cards) {
    // Priority: Tier 2 reported > demo override > Tier 1 static
    const reportedWeight = weightOverrides?.get(card.id);
    const demoWeight = isDemoMode ? getDemoWeight(card.id) : undefined;
    const weight = computeVisualWeight(card, reportedWeight ?? demoWeight);

    switch (weight) {
      case VisualWeight.Critical:
        summary.criticalCount++;
        break;
      case VisualWeight.Warning:
        summary.warningCount++;
        break;
      case VisualWeight.Active:
        summary.activeCount++;
        break;
      case VisualWeight.Quiet:
        summary.quietCount++;
        break;
      case VisualWeight.Placeholder:
        summary.placeholderCount++;
        break;
    }
  }

  return summary;
}

/**
 * Build a human-readable summary text from a CategoryStateSummary.
 * Only includes non-zero counts.
 *
 * Examples:
 * - "2 critical · 1 warning · 5 clear"
 * - "3 active · 7 quiet"
 * - "" (all placeholders or no cards)
 */
export function formatStateSummary(summary: CategoryStateSummary): string {
  const parts: string[] = [];

  if (summary.criticalCount > 0) {
    parts.push(`${summary.criticalCount} critical`);
  }
  if (summary.warningCount > 0) {
    parts.push(`${summary.warningCount} warning`);
  }
  const clearCount = summary.activeCount + summary.quietCount;
  if (clearCount > 0) {
    parts.push(`${clearCount} clear`);
  }

  return parts.join(' · ');
}
