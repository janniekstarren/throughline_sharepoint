// ============================================
// Tier Store Listings — Tier Products for Card Store
// 3 purchasable tiers: Team, Manager, Leader
// ============================================

import { LicenseTier } from '../models/CardCatalog';
import { TierStoreListing } from '../models/CardStore';

// ============================================
// Tier Store Listings
// ============================================

export const TIER_STORE_LISTINGS: TierStoreListing[] = [
  {
    tierId: LicenseTier.Team,
    headline: 'Unlock collaboration intelligence for your whole team',
    featuredCardIds: [
      'context-switch-counter',
      'focus-time-defender',
      'unread-from-vips',
      'relationship-strength-tracker',
      'task-completion-velocity',
    ],
    includedCardCount: 47,
    savingsVsAlaCarte: 65,
    isPopular: true,
    isRecommended: false,
  },
  {
    tierId: LicenseTier.Manager,
    headline: 'Intelligence tools built for people leaders',
    featuredCardIds: [
      'team-workload-balance',
      'one-on-one-gaps',
      'attrition-risk-signals',
      'succession-risk',
      'delegation-opportunities',
    ],
    includedCardCount: 72,
    savingsVsAlaCarte: 75,
    isPopular: false,
    isRecommended: true,
  },
  {
    tierId: LicenseTier.Leader,
    headline: 'Enterprise-grade intelligence for strategic decision makers',
    featuredCardIds: [
      'org-network-position',
      'cross-boundary-knowledge',
      'ai-knowledge-gaps',
      'compliance-posture-score',
      'organisational-silos',
    ],
    includedCardCount: 80,
    savingsVsAlaCarte: 82,
    isPopular: false,
    isRecommended: false,
  },
];

// ============================================
// Helper — Get tier listing by ID
// ============================================

export function getTierStoreListing(tierId: LicenseTier): TierStoreListing | undefined {
  return TIER_STORE_LISTINGS.find(t => t.tierId === tierId);
}
