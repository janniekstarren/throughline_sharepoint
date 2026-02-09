// ============================================
// Card Catalog Models
// Defines categories, license tiers, and card registration
// ============================================

import { tokens } from '@fluentui/react-components';
import { IntegrationCategory } from './Integration';

// ============================================
// Card Category Enum (6 canonical categories)
// ============================================
export enum CardCategory {
  ImmediateAction = 'immediate-action',
  ProductivityPatterns = 'productivity-patterns',
  KnowledgeManagement = 'knowledge-management',
  CollaborationHealth = 'collaboration-health',
  ManagerToolkit = 'manager-toolkit',
  GovernanceCompliance = 'governance-compliance',
}

// ============================================
// Category Metadata
// ============================================
export interface CategoryMetadata {
  id: CardCategory;
  displayName: string;
  description: string;
  icon: string; // Fluent UI icon name
  color: string;
  sortOrder: number;
}

export const CardCategoryMeta: Record<CardCategory, CategoryMetadata> = {
  [CardCategory.ImmediateAction]: {
    id: CardCategory.ImmediateAction,
    displayName: 'Immediate Action',
    description: 'Surfaces things you need to act on right now',
    icon: 'FlashRegular',
    color: tokens.colorPaletteRedBackground3,
    sortOrder: 1,
  },
  [CardCategory.ProductivityPatterns]: {
    id: CardCategory.ProductivityPatterns,
    displayName: 'Productivity Patterns',
    description: 'Understand and optimise your work patterns',
    icon: 'PulseRegular',
    color: tokens.colorPaletteBlueBorderActive,
    sortOrder: 2,
  },
  [CardCategory.KnowledgeManagement]: {
    id: CardCategory.KnowledgeManagement,
    displayName: 'Knowledge Management',
    description: 'Surface, connect, and protect organisational knowledge',
    icon: 'BookRegular',
    color: tokens.colorPalettePurpleBorderActive,
    sortOrder: 3,
  },
  [CardCategory.CollaborationHealth]: {
    id: CardCategory.CollaborationHealth,
    displayName: 'Collaboration Health',
    description: 'Track relationship strength and network quality',
    icon: 'PeopleRegular',
    color: tokens.colorPaletteGreenBorderActive,
    sortOrder: 4,
  },
  [CardCategory.ManagerToolkit]: {
    id: CardCategory.ManagerToolkit,
    displayName: 'Manager Toolkit',
    description: 'Team-level intelligence for people leaders',
    icon: 'PersonBoardRegular',
    color: tokens.colorPaletteYellowBorderActive,
    sortOrder: 5,
  },
  [CardCategory.GovernanceCompliance]: {
    id: CardCategory.GovernanceCompliance,
    displayName: 'Governance & Compliance',
    description: 'Data security, permissions, and compliance posture',
    icon: 'ShieldRegular',
    color: tokens.colorPaletteDarkOrangeBorderActive,
    sortOrder: 6,
  },
};

// ============================================
// License Tier Enum
// ============================================
export enum LicenseTier {
  Individual = 'individual',
  Team = 'team',
  Manager = 'manager',
  Leader = 'leader',
}

// ============================================
// Tier Metadata
// ============================================
export interface TierMetadata {
  id: LicenseTier;
  displayName: string;
  description: string;
  price: string;
  priceNumeric: number;
  maxCards: number | null; // null = unlimited
  sortOrder: number;
  color: string;
  includesManagerToolkit: boolean;
  includesOrgLevel: boolean;
}

export const LicenseTierMeta: Record<LicenseTier, TierMetadata> = {
  [LicenseTier.Individual]: {
    id: LicenseTier.Individual,
    displayName: 'Individual',
    description: 'Free trial — 5 highest-impact personal cards',
    price: 'Free',
    priceNumeric: 0,
    maxCards: 5,
    sortOrder: 0,
    color: tokens.colorPaletteTealBorderActive,
    includesManagerToolkit: false,
    includesOrgLevel: false,
  },
  [LicenseTier.Team]: {
    id: LicenseTier.Team,
    displayName: 'Team',
    description: 'Individual contributors — personal insights, rule-based triggers',
    price: '$19/user/mo',
    priceNumeric: 19,
    maxCards: 40,
    sortOrder: 1,
    color: tokens.colorPaletteBlueBorderActive,
    includesManagerToolkit: false,
    includesOrgLevel: false,
  },
  [LicenseTier.Manager]: {
    id: LicenseTier.Manager,
    displayName: 'Manager',
    description: 'Managers & team leads — personal + team insights',
    price: '$39/user/mo',
    priceNumeric: 39,
    maxCards: null,
    sortOrder: 2,
    color: tokens.colorPaletteYellowBorderActive,
    includesManagerToolkit: true,
    includesOrgLevel: false,
  },
  [LicenseTier.Leader]: {
    id: LicenseTier.Leader,
    displayName: 'Leader',
    description: 'Directors & VPs — full org-level intelligence',
    price: '$59/user/mo',
    priceNumeric: 59,
    maxCards: null,
    sortOrder: 3,
    color: tokens.colorPalettePurpleBorderActive,
    includesManagerToolkit: true,
    includesOrgLevel: true,
  },
};

// ============================================
// Card Status Enum
// ============================================
export enum CardStatus {
  Implemented = 'implemented', // Fully built with real service + component
  Placeholder = 'placeholder', // Registered with placeholder UI, no real data
  Planned = 'planned', // In catalog but not yet scaffolded
}

// ============================================
// Card Size Enum (reuse existing type)
// ============================================
export type CardSize = 'small' | 'medium' | 'large';

// ============================================
// Card Registration Interface
// ============================================
export interface CardRegistration {
  id: string; // Unique slug, e.g. 'stale-conversations'
  catalogNumber: number; // The # from the catalog (1-79)
  name: string; // Display name
  category: CardCategory;
  impactRating: number; // 1-10
  minimumTier: LicenseTier; // Lowest tier that can access this card
  status: CardStatus;

  description: string; // One-liner
  keyValue: string; // What unique value this card provides

  // Intelligence layer
  intelligenceEnrichment?: string; // What the AI add-on does for this card

  // Component references - maps to existing card component ID (for implemented cards)
  existingCardId?: string;

  // Data source info (for placeholder cards)
  dataSources?: string[]; // e.g. ['Mail API', 'Teams Chat API']

  // Tags for search/filter
  tags?: string[];

  // Integration dependency (Mode 1 — Dedicated Cards)
  requiredIntegrationIds?: string[];
  requiredIntegrationCategory?: IntegrationCategory;
  isIntegrationCard?: boolean;
}

// ============================================
// Individual Tier Cards (Free - exactly 5 cards)
// ============================================
export const INDIVIDUAL_TIER_CARD_IDS: string[] = [
  'stale-conversations', // #1 - Impact 10
  'my-urgent-items', // #3 - Impact 9
  'broken-promises', // #4 - Impact 9
  'context-switch-counter', // #9 - Impact 9
  'communication-debt', // #26 - Impact 9
];

// ============================================
// Tier Hierarchy for Access Checks
// ============================================
export const TIER_HIERARCHY: Record<LicenseTier, number> = {
  [LicenseTier.Individual]: 0,
  [LicenseTier.Team]: 1,
  [LicenseTier.Manager]: 2,
  [LicenseTier.Leader]: 3,
};

/**
 * Check if a card is accessible at a given tier
 */
export function isCardAccessibleAtTier(
  card: CardRegistration,
  currentTier: LicenseTier
): boolean {
  // Individual tier has special rules - only 5 specific cards
  if (currentTier === LicenseTier.Individual) {
    return INDIVIDUAL_TIER_CARD_IDS.includes(card.id);
  }

  // Other tiers use hierarchy
  return TIER_HIERARCHY[currentTier] >= TIER_HIERARCHY[card.minimumTier];
}

// ============================================
// Mapping from OLD card IDs to NEW spec IDs
// ============================================
export const LEGACY_CARD_ID_MAP: Record<string, string> = {
  waitingOnYou: 'stale-conversations',
  waitingOnOthers: 'waiting-on-external',
  todaysAgenda: 'meeting-prep',
  upcomingWeek: 'focus-time-defender',
  myTasks: 'task-completion-velocity',
  email: 'unread-from-vips',
  unreadInbox: 'my-urgent-items',
  flaggedEmails: 'broken-promises',
  recentFiles: 'stale-documents',
  sharedWithMe: 'siloed-knowledge',
  myTeam: 'relationship-strength-tracker',
  siteActivity: 'collaboration-patterns',
  quickLinks: 'quick-links', // Keep as utility
  contextSwitching: 'context-switch-counter',
  organizationalHandoffMap: 'cross-project-dependencies',
};

/**
 * Get new card ID from legacy ID
 */
export function getNewCardId(legacyId: string): string {
  return LEGACY_CARD_ID_MAP[legacyId] || legacyId;
}

/**
 * Get legacy card ID from new ID (reverse lookup)
 */
export function getLegacyCardId(newId: string): string | undefined {
  const entry = Object.entries(LEGACY_CARD_ID_MAP).find(
    ([_, value]) => value === newId
  );
  return entry ? entry[0] : undefined;
}
