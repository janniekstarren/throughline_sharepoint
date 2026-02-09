// ============================================
// Tier-Based Default Card Layouts
// Defines curated card sizes per license tier
// ============================================

import { LicenseTier, CardStatus } from '../models/CardCatalog';
import { ICardSizeState, CardSize } from '../types/CardSize';
import { CARD_REGISTRY } from './cardRegistry';

// ============================================
// Individual Tier — 5 cards (4 implemented)
// Hero the most impactful personal insights
// ============================================

const INDIVIDUAL_DEFAULTS: ICardSizeState = {
  // Implemented cards — use legacy existingCardId as key
  waitingOnYou: 'large',        // Impact 10 — hero card
  contextSwitching: 'large',    // Impact 9 — visual charts benefit from space
  email: 'medium',              // Impact 9 — covers unread + flagged
  // communication-debt is a placeholder → handled dynamically below
};

// ============================================
// Team Tier — adds 9 implemented + 32 placeholder
// Balanced mix: calendar/email large, utilities medium/small
// ============================================

const TEAM_ADDITIONS: ICardSizeState = {
  // New implemented cards at Team tier
  todaysAgenda: 'large',        // Impact 8 — today's schedule is hero at Team
  upcomingWeek: 'large',        // Impact 9 — calendar overview needs space
  waitingOnOthers: 'medium',    // Impact 7 — summary list view
  myTasks: 'medium',            // Impact 7 — task list
  recentFiles: 'medium',        // Impact 7 — file list
  siteActivity: 'medium',       // Impact 8 — activity feed
  myTeam: 'medium',             // Impact 8 — team grid
  quickLinks: 'small',          // Impact 5 — utility/navigation
};

// ============================================
// Manager Tier — adds 1 implemented + 22 placeholder
// Show the manager toolkit prominently
// ============================================

const MANAGER_ADDITIONS: ICardSizeState = {
  // Implemented cards at Manager tier
  sharedWithMe: 'medium',                // Impact 7 — file sharing view
  organizationalHandoffMap: 'large',     // Impact 9 — manager hero card
};

// ============================================
// Leader Tier — adds 7+ placeholder
// No implemented cards yet, all handled dynamically
// ============================================

const LEADER_ADDITIONS: ICardSizeState = {};

// ============================================
// Dynamic placeholder defaults
// All non-implemented cards default to 'small'
// Built from CARD_REGISTRY so new cards auto-inherit
// ============================================

function getPlaceholderDefaults(maxTier: LicenseTier): ICardSizeState {
  const tierOrder = [
    LicenseTier.Individual,
    LicenseTier.Team,
    LicenseTier.Manager,
    LicenseTier.Leader,
  ];
  const maxIndex = tierOrder.indexOf(maxTier);

  const defaults: ICardSizeState = {};
  CARD_REGISTRY
    .filter(c =>
      c.status !== CardStatus.Implemented &&
      tierOrder.indexOf(c.minimumTier) <= maxIndex
    )
    .forEach(c => {
      defaults[c.id] = 'small' as CardSize;
    });

  return defaults;
}

// ============================================
// Public API
// ============================================

/**
 * Get the curated default card size layout for a given license tier.
 *
 * Tiers are cumulative: Team includes Individual defaults,
 * Manager includes Team defaults, Leader includes Manager defaults.
 *
 * Card IDs use legacy IDs (existingCardId) for implemented cards
 * and registry IDs for placeholder cards. This matches how
 * registryCardToOrdered resolves sizes in DashboardCards.tsx.
 *
 * User overrides (from localStorage) are layered on top by
 * useUserPreferences: { ...tierDefaults, ...userOverrides }
 */
export function getTierDefaultSizes(tier: LicenseTier): ICardSizeState {
  // Start with Individual defaults (always included)
  const sizes: ICardSizeState = { ...INDIVIDUAL_DEFAULTS };

  if (tier === LicenseTier.Individual) {
    return { ...sizes, ...getPlaceholderDefaults(tier) };
  }

  // Add Team tier
  Object.assign(sizes, TEAM_ADDITIONS);
  if (tier === LicenseTier.Team) {
    return { ...sizes, ...getPlaceholderDefaults(tier) };
  }

  // Add Manager tier
  Object.assign(sizes, MANAGER_ADDITIONS);
  if (tier === LicenseTier.Manager) {
    return { ...sizes, ...getPlaceholderDefaults(tier) };
  }

  // Leader tier (no additional implemented cards)
  Object.assign(sizes, LEADER_ADDITIONS);
  return { ...sizes, ...getPlaceholderDefaults(tier) };
}
