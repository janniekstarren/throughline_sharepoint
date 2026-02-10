// ============================================
// VisualWeight - Data-Driven Visual Prominence
// ============================================
// Cards compute a visual weight from their current data state.
// Higher weight = more visual emphasis (glow, shadow, typography).
// This is a RENDERING concern only — it doesn't change card data or behaviour.

import { CardRegistration, CardStatus } from './CardCatalog';

// ============================================
// Enum
// ============================================

/**
 * Visual weight represents how much visual prominence a card should have.
 *
 * Placeholder (0) — Unbuilt card, nearly invisible
 * Quiet (1)       — Has data but nothing noteworthy, recedes
 * Active (2)      — Has data, normal state, standard appearance
 * Warning (3)     — Data flagging a concern, visually prominent
 * Critical (4)    — Demands immediate attention, impossible to miss
 */
export enum VisualWeight {
  Placeholder = 0,
  Quiet = 1,
  Active = 2,
  Warning = 3,
  Critical = 4,
}

// ============================================
// Tier 1: Static Weight from CardRegistration
// ============================================

/**
 * Computes a base visual weight from card registration metadata.
 * This is the "day one" computation that works for all 95 cards
 * without any cooperation from individual card components.
 *
 * Rules (first match wins):
 * 1. Placeholder or Planned status  → Placeholder (0)
 * 2. Implemented, impactRating < 5  → Quiet (1)
 * 3. Implemented, impactRating >= 5 → Active (2)
 *
 * @param card - The card registration from the catalog
 * @param reportedWeight - Optional Tier 2 override (card-reported weight)
 * @returns The computed VisualWeight
 */
export function computeVisualWeight(
  card: CardRegistration,
  reportedWeight?: VisualWeight
): VisualWeight {
  // Tier 2 override takes precedence when provided
  if (reportedWeight !== undefined) {
    return reportedWeight;
  }

  // Rule 1: Placeholder / Planned cards
  if (card.status === CardStatus.Placeholder || card.status === CardStatus.Planned) {
    return VisualWeight.Placeholder;
  }

  // Rule 2: Implemented but low impact
  if (card.impactRating < 5) {
    return VisualWeight.Quiet;
  }

  // Rule 3: Implemented with meaningful impact
  return VisualWeight.Active;
}

// ============================================
// Demo Mode Weights
// ============================================

/**
 * In demo/test mode, simulate realistic urgency for high-impact implemented cards.
 * This makes the Pulse indicator and adaptive shadows meaningful during demos.
 *
 * Cards selected based on their real-world urgency likelihood:
 * - Critical: "Stale Conversations" (things waiting on you are urgent)
 * - Critical: "Broken Promises" (flagged items you committed to)
 * - Warning:  "Meeting Prep" (unprepared for today's meetings)
 * - Warning:  "Waiting on External" (blocked dependencies)
 * - Warning:  "Context Switch Counter" (too many context switches)
 */
const DEMO_WEIGHT_OVERRIDES: Record<string, VisualWeight> = {
  'stale-conversations': VisualWeight.Critical,
  'broken-promises': VisualWeight.Critical,
  'my-urgent-items': VisualWeight.Warning,
  'meeting-prep': VisualWeight.Warning,
  'waiting-on-external': VisualWeight.Warning,
  'context-switch-counter': VisualWeight.Warning,
};

/**
 * Get the demo-mode visual weight override for a card, if any.
 * Returns undefined if no demo override exists for this card.
 */
export function getDemoWeight(cardId: string): VisualWeight | undefined {
  return DEMO_WEIGHT_OVERRIDES[cardId];
}

// ============================================
// Urgency Level Mapping (for Tier 2 adoption)
// ============================================

/**
 * Maps an urgency level string (used by many existing cards) to a VisualWeight.
 * Useful for card components that already have urgencyLevel in their data.
 */
export function urgencyToWeight(urgencyLevel?: string): VisualWeight | undefined {
  switch (urgencyLevel) {
    case 'critical': return VisualWeight.Critical;
    case 'warning': return VisualWeight.Warning;
    case 'good':
    case 'info': return VisualWeight.Active;
    default: return undefined;
  }
}
