// ============================================
// Card Entitlement Models — Entitlement Sources, Results, Storage
// ============================================

// ============================================
// Entitlement Source — Why a card is entitled
// ============================================

export enum EntitlementSource {
  DemoMode = 'demo-mode',
  SiteLicense = 'site-license',
  AdminGrant = 'admin-grant',
  TierSubscription = 'tier-subscription',
  IndividualPurchase = 'individual-purchase',
  Trial = 'trial',
  Free = 'free',
}

// ============================================
// Card Entitlement — Result of entitlement check
// ============================================

export interface CardEntitlement {
  cardId: string;
  entitled: boolean;
  source: EntitlementSource | null;
  expiresAt: Date | null;
  trialDaysRemaining: number | null;
}

// ============================================
// Spending Summary — Used by Spend Advisor
// ============================================

export interface SpendingSummary {
  tierMonthlyPrice: number;
  addOnMonthlyTotal: number;
  totalMonthly: number;
  addOnCount: number;
  suggestedTierUpgrade: {
    tier: string;
    tierPrice: number;
    wouldReplace: number; // how many add-ons the upgrade covers
    monthlySavings: number;
  } | null;
}

// ============================================
// Stored Entitlements — localStorage shape
// ============================================

export interface StoredPurchase {
  cardId: string;
  purchaseDate: string; // ISO date
  billingCycle: 'monthly' | 'annual';
  monthlyPrice: number;
}

export interface StoredTrial {
  cardId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface StoredEntitlements {
  adminGrants: string[];
  addOnPurchases: StoredPurchase[];
  trials: StoredTrial[];
}

export const DEFAULT_STORED_ENTITLEMENTS: StoredEntitlements = {
  adminGrants: [],
  addOnPurchases: [],
  trials: [],
};
