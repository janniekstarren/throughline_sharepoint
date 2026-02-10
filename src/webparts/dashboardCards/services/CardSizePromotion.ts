// ============================================
// CardSizePromotion - Auto-Promoting Card Sizes
// ============================================
// When adaptive rendering is enabled, cards with high visual weight
// can auto-promote to a larger grid size. User-managed cards are
// exempt from auto-promotion (they respect user choice).

import { CardSize } from '../types/CardSize';
import { VisualWeight } from '../models/VisualWeight';

// ============================================
// Types
// ============================================

export type AutoPromoteMode = 'smart' | 'all' | 'off';

export interface PromotionResult {
  /** The effective size after promotion rules */
  effectiveSize: CardSize;
  /** Whether the size was changed from the base */
  wasPromoted: boolean;
}

// ============================================
// Promotion Logic
// ============================================

/**
 * Compute the effective card size after applying auto-promotion rules.
 *
 * Promotion rules (only applies when mode != 'off'):
 * - Critical weight: small → medium
 * - Warning weight:  small → medium
 * - All other weights: no promotion
 *
 * User-managed cards (pinned, resized, reordered) are NEVER promoted
 * in 'smart' mode. In 'all' mode, they ARE promoted.
 *
 * @param baseSize - The user/tier-default size
 * @param weight - The computed visual weight
 * @param isUserManaged - Whether the user has explicitly managed this card
 * @param autoPromoteMode - The promotion mode setting
 * @returns Promotion result with effective size and promotion flag
 */
export function computeEffectiveSize(
  baseSize: CardSize,
  weight: VisualWeight,
  isUserManaged: boolean,
  autoPromoteMode: AutoPromoteMode
): PromotionResult {
  // Mode off = no promotion ever
  if (autoPromoteMode === 'off') {
    return { effectiveSize: baseSize, wasPromoted: false };
  }

  // Smart mode: skip user-managed cards
  if (autoPromoteMode === 'smart' && isUserManaged) {
    return { effectiveSize: baseSize, wasPromoted: false };
  }

  // Only promote from small → medium
  if (baseSize !== 'small') {
    return { effectiveSize: baseSize, wasPromoted: false };
  }

  // Promote critical and warning cards
  if (weight === VisualWeight.Critical || weight === VisualWeight.Warning) {
    return { effectiveSize: 'medium', wasPromoted: true };
  }

  return { effectiveSize: baseSize, wasPromoted: false };
}
