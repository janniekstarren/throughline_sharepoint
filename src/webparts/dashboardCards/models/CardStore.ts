// ============================================
// Card Store Models — Pricing, Store Listings, Tier Products
// ============================================

import { LicenseTier } from './CardCatalog';

// ============================================
// Pricing Model
// ============================================

export enum PricingModel {
  TieredPlusAlaCarte = 'tiered-plus-alacarte',
  TierOnly = 'tier-only',
  SiteLicense = 'site-license',
  FreeTrial = 'free-trial',
}

export enum CardPricingTier {
  Free = 'free',
  Standard = 'standard',
  Premium = 'premium',
  Enterprise = 'enterprise',
}

export interface CardPricing {
  pricingTier: CardPricingTier;
  monthlyPrice: number;
  annualPrice: number;
  trialDays: number;
  bundleDiscount: number;
}

export const CARD_PRICING_DEFAULTS: Record<CardPricingTier, CardPricing> = {
  [CardPricingTier.Free]: {
    pricingTier: CardPricingTier.Free,
    monthlyPrice: 0,
    annualPrice: 0,
    trialDays: 0,
    bundleDiscount: 0,
  },
  [CardPricingTier.Standard]: {
    pricingTier: CardPricingTier.Standard,
    monthlyPrice: 3,
    annualPrice: 2.50,
    trialDays: 14,
    bundleDiscount: 30,
  },
  [CardPricingTier.Premium]: {
    pricingTier: CardPricingTier.Premium,
    monthlyPrice: 6,
    annualPrice: 5,
    trialDays: 14,
    bundleDiscount: 35,
  },
  [CardPricingTier.Enterprise]: {
    pricingTier: CardPricingTier.Enterprise,
    monthlyPrice: 10,
    annualPrice: 8,
    trialDays: 7,
    bundleDiscount: 40,
  },
};

// ============================================
// Store Listing — Per-Card Store Metadata
// ============================================

export interface CardStoreListing {
  pricingTier: CardPricingTier;
  customPrice?: number;

  headline: string;
  longDescription: string;
  valueProposition: string[];
  useCases: string[];

  previewImageId?: string;
  iconEmoji: string;
  accentColor?: string;

  popularityRank?: number;
  isStaffPick: boolean;
  isNew: boolean;
  isTrending: boolean;
  releaseDate: string;
  lastUpdated: string;

  relatedCardIds: string[];
  prerequisiteCardIds?: string[];
  bundleIds?: string[];

  rating: number;
  ratingCount: number;

  isAvailableForPurchase: boolean;
  requiresIntegration?: string;
  requiresIntelligence?: boolean;
}

// ============================================
// Tier Store Listing — Tier Products in Store
// ============================================

export interface TierStoreListing {
  tierId: LicenseTier;
  headline: string;
  featuredCardIds: string[];
  includedCardCount: number;
  savingsVsAlaCarte: number;
  isPopular: boolean;
  isRecommended: boolean;
}

// ============================================
// Default Entitlement Config
// ============================================

export type DefaultEntitlement = 'all-enabled' | 'tier-only' | 'free-only' | 'none';

export interface StoreConfig {
  showCardStore: boolean;
  pricingModel: PricingModel;
  defaultEntitlement: DefaultEntitlement;
  allowAlaCartePurchase: boolean;
  allowTrials: boolean;
  showPricing: boolean;
  showTierSubscriptions: boolean;
  showSpendAdvisor: boolean;
  storeCustomMessage?: string;
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  showCardStore: true,
  pricingModel: PricingModel.TieredPlusAlaCarte,
  defaultEntitlement: 'all-enabled',
  allowAlaCartePurchase: true,
  allowTrials: true,
  showPricing: true,
  showTierSubscriptions: true,
  showSpendAdvisor: true,
};
