// ============================================
// Entitlement Service
// Wraps LicenseService to check card entitlements
// in priority order. Singleton pattern.
// ============================================

import {
  LicenseTier,
  LicenseTierMeta,
  CardRegistration,
  isCardAccessibleAtTier,
  TIER_HIERARCHY,
} from '../models/CardCatalog';
import { CARD_REGISTRY } from '../config/cardRegistry';
import { licenseService } from './LicenseService';
import {
  EntitlementSource,
  CardEntitlement,
  SpendingSummary,
  StoredEntitlements,
  StoredPurchase,
  StoredTrial,
  DEFAULT_STORED_ENTITLEMENTS,
} from '../models/CardEntitlement';
import {
  PricingModel,
  CardPricingTier,
  CARD_PRICING_DEFAULTS,
  DefaultEntitlement,
} from '../models/CardStore';

// ============================================
// Storage Key
// ============================================
const STORAGE_KEY = 'throughline_store_entitlements';

// ============================================
// Entitlement Service Class
// ============================================
export class EntitlementService {
  private static instance: EntitlementService;

  private _defaultEntitlement: DefaultEntitlement = 'all-enabled';
  private _pricingModel: PricingModel = PricingModel.TieredPlusAlaCarte;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): EntitlementService {
    if (!EntitlementService.instance) {
      EntitlementService.instance = new EntitlementService();
    }
    return EntitlementService.instance;
  }

  // ============================================
  // Configuration
  // ============================================

  /**
   * Configure the operating mode for entitlement checks.
   * Called during webpart initialization or when admin changes settings.
   */
  public configure(
    defaultEntitlement: DefaultEntitlement,
    pricingModel: PricingModel
  ): void {
    this._defaultEntitlement = defaultEntitlement;
    this._pricingModel = pricingModel;
  }

  // ============================================
  // Entitlement Checks
  // ============================================

  /**
   * Check entitlement for a single card.
   * Priority order:
   *   1. Demo mode (all-enabled)
   *   2. Site license
   *   3. Admin grant
   *   4. Tier subscription
   *   5. Individual purchase
   *   6. Active trial
   *   7. Free card
   *   8. Not entitled
   */
  public getEntitlement(cardId: string): CardEntitlement {
    const notEntitled: CardEntitlement = {
      cardId,
      entitled: false,
      source: null,
      expiresAt: null,
      trialDaysRemaining: null,
    };

    // ---- 1. Demo mode ----
    if (this._defaultEntitlement === 'all-enabled') {
      return {
        cardId,
        entitled: true,
        source: EntitlementSource.DemoMode,
        expiresAt: null,
        trialDaysRemaining: null,
      };
    }

    // ---- 2. Site license ----
    if (this._pricingModel === PricingModel.SiteLicense) {
      return {
        cardId,
        entitled: true,
        source: EntitlementSource.SiteLicense,
        expiresAt: null,
        trialDaysRemaining: null,
      };
    }

    const stored = this.loadEntitlements();

    // ---- 3. Admin grant ----
    if (stored.adminGrants.includes(cardId)) {
      return {
        cardId,
        entitled: true,
        source: EntitlementSource.AdminGrant,
        expiresAt: null,
        trialDaysRemaining: null,
      };
    }

    // ---- 4. Tier subscription ----
    const card = CARD_REGISTRY.find((c) => c.id === cardId);
    if (card) {
      const currentTier = licenseService.getCurrentLicenseSync().tier;
      if (isCardAccessibleAtTier(card, currentTier)) {
        return {
          cardId,
          entitled: true,
          source: EntitlementSource.TierSubscription,
          expiresAt: null,
          trialDaysRemaining: null,
        };
      }
    }

    // ---- 5. Individual purchase ----
    const purchase = stored.addOnPurchases.find((p) => p.cardId === cardId);
    if (purchase) {
      return {
        cardId,
        entitled: true,
        source: EntitlementSource.IndividualPurchase,
        expiresAt: null,
        trialDaysRemaining: null,
      };
    }

    // ---- 6. Active trial ----
    const trial = stored.trials.find((t) => t.cardId === cardId);
    if (trial) {
      const endDate = new Date(trial.endDate);
      const now = new Date();
      if (endDate > now) {
        const daysRemaining = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          cardId,
          entitled: true,
          source: EntitlementSource.Trial,
          expiresAt: endDate,
          trialDaysRemaining: daysRemaining,
        };
      }
    }

    // ---- 7. Free card ----
    // Since we don't have storeListings loaded yet, treat Individual-tier
    // cards as free (they are the free tier cards).
    if (card && card.minimumTier === LicenseTier.Individual) {
      return {
        cardId,
        entitled: true,
        source: EntitlementSource.Free,
        expiresAt: null,
        trialDaysRemaining: null,
      };
    }

    // ---- 8. Not entitled ----
    return notEntitled;
  }

  /**
   * Bulk check entitlements for all registered cards.
   */
  public getAllEntitlements(): Map<string, CardEntitlement> {
    const result = new Map<string, CardEntitlement>();
    for (const card of CARD_REGISTRY) {
      result.set(card.id, this.getEntitlement(card.id));
    }
    return result;
  }

  // ============================================
  // Trials
  // ============================================

  /**
   * Check if a card has an active (unexpired) trial.
   */
  public isTrialActive(cardId: string): boolean {
    const stored = this.loadEntitlements();
    const trial = stored.trials.find((t) => t.cardId === cardId);
    if (!trial) return false;
    return new Date(trial.endDate) > new Date();
  }

  /**
   * Start a trial for a card.
   * Trial duration comes from the card's pricing tier defaults.
   */
  public startTrial(cardId: string): CardEntitlement {
    const stored = this.loadEntitlements();

    // Remove any existing trial for this card
    stored.trials = stored.trials.filter((t) => t.cardId !== cardId);

    // Determine trial days from the card's pricing tier
    const trialDays = this.getTrialDaysForCard(cardId);

    const now = new Date();
    const endDate = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const newTrial: StoredTrial = {
      cardId,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
    };

    stored.trials.push(newTrial);
    this.saveEntitlements(stored);

    return {
      cardId,
      entitled: true,
      source: EntitlementSource.Trial,
      expiresAt: endDate,
      trialDaysRemaining: trialDays,
    };
  }

  // ============================================
  // Purchases
  // ============================================

  /**
   * Record an individual card purchase.
   * In POC this writes to localStorage. Production would call a billing API.
   */
  public purchaseCard(
    cardId: string,
    billingCycle: 'monthly' | 'annual'
  ): CardEntitlement {
    const stored = this.loadEntitlements();

    // Remove any existing purchase for this card
    stored.addOnPurchases = stored.addOnPurchases.filter(
      (p) => p.cardId !== cardId
    );

    // Remove any active trial — purchase supersedes trial
    stored.trials = stored.trials.filter((t) => t.cardId !== cardId);

    const pricing = this.getPricingForCard(cardId);

    const newPurchase: StoredPurchase = {
      cardId,
      purchaseDate: new Date().toISOString(),
      billingCycle,
      monthlyPrice:
        billingCycle === 'monthly' ? pricing.monthlyPrice : pricing.annualPrice,
    };

    stored.addOnPurchases.push(newPurchase);
    this.saveEntitlements(stored);

    return {
      cardId,
      entitled: true,
      source: EntitlementSource.IndividualPurchase,
      expiresAt: null,
      trialDaysRemaining: null,
    };
  }

  /**
   * Remove an individual card purchase.
   */
  public removePurchase(cardId: string): void {
    const stored = this.loadEntitlements();
    stored.addOnPurchases = stored.addOnPurchases.filter(
      (p) => p.cardId !== cardId
    );
    this.saveEntitlements(stored);
  }

  /**
   * Get all purchased card IDs.
   */
  public getPurchasedCardIds(): string[] {
    const stored = this.loadEntitlements();
    return stored.addOnPurchases.map((p) => p.cardId);
  }

  // ============================================
  // Spending Summary (Spend Advisor)
  // ============================================

  /**
   * Compute spending summary for the Spend Advisor panel.
   * Includes current tier cost, add-on costs, total, and upgrade suggestion.
   */
  public getSpendingSummary(): SpendingSummary {
    const currentTier = licenseService.getCurrentLicenseSync().tier;
    const tierMeta = LicenseTierMeta[currentTier];
    const tierMonthlyPrice = tierMeta.priceNumeric;

    const stored = this.loadEntitlements();
    const addOnMonthlyTotal = stored.addOnPurchases.reduce(
      (sum, p) => sum + p.monthlyPrice,
      0
    );
    const totalMonthly = tierMonthlyPrice + addOnMonthlyTotal;

    // Determine suggested tier upgrade
    const suggestedTierUpgrade = this.computeSuggestedUpgrade(
      currentTier,
      stored.addOnPurchases,
      totalMonthly
    );

    return {
      tierMonthlyPrice,
      addOnMonthlyTotal,
      totalMonthly,
      addOnCount: stored.addOnPurchases.length,
      suggestedTierUpgrade,
    };
  }

  // ============================================
  // Private Helpers
  // ============================================

  /**
   * Load stored entitlements from localStorage.
   */
  private loadEntitlements(): StoredEntitlements {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STORED_ENTITLEMENTS, adminGrants: [], addOnPurchases: [], trials: [] };

      const parsed = JSON.parse(raw) as StoredEntitlements;

      // Defensive: ensure arrays exist
      return {
        adminGrants: parsed.adminGrants || [],
        addOnPurchases: parsed.addOnPurchases || [],
        trials: parsed.trials || [],
      };
    } catch {
      return { ...DEFAULT_STORED_ENTITLEMENTS, adminGrants: [], addOnPurchases: [], trials: [] };
    }
  }

  /**
   * Save stored entitlements to localStorage.
   */
  private saveEntitlements(data: StoredEntitlements): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.warn('EntitlementService: Unable to save entitlements to localStorage');
    }
  }

  /**
   * Get trial days for a card based on its pricing tier.
   * Uses the card's minimumTier to infer a pricing tier:
   *   Individual -> Free (0 trial days, but we allow 14 as a default)
   *   Team -> Standard (14 days)
   *   Manager -> Premium (14 days)
   *   Leader -> Enterprise (7 days)
   */
  private getTrialDaysForCard(cardId: string): number {
    const card = CARD_REGISTRY.find((c) => c.id === cardId);
    if (!card) return 14; // sensible default

    const pricingTier = this.inferPricingTier(card);
    const defaults = CARD_PRICING_DEFAULTS[pricingTier];
    // If the inferred tier has 0 trial days (Free), give 14 days anyway
    return defaults.trialDays > 0 ? defaults.trialDays : 14;
  }

  /**
   * Get pricing for a card based on its inferred pricing tier.
   */
  private getPricingForCard(cardId: string): {
    monthlyPrice: number;
    annualPrice: number;
  } {
    const card = CARD_REGISTRY.find((c) => c.id === cardId);
    if (!card) {
      return {
        monthlyPrice: CARD_PRICING_DEFAULTS[CardPricingTier.Standard].monthlyPrice,
        annualPrice: CARD_PRICING_DEFAULTS[CardPricingTier.Standard].annualPrice,
      };
    }

    const pricingTier = this.inferPricingTier(card);
    const defaults = CARD_PRICING_DEFAULTS[pricingTier];
    return {
      monthlyPrice: defaults.monthlyPrice,
      annualPrice: defaults.annualPrice,
    };
  }

  /**
   * Infer a CardPricingTier from a card's minimumTier.
   * This is a temporary mapping until storeListings are loaded.
   */
  private inferPricingTier(card: CardRegistration): CardPricingTier {
    switch (card.minimumTier) {
      case LicenseTier.Individual:
        return CardPricingTier.Free;
      case LicenseTier.Team:
        return CardPricingTier.Standard;
      case LicenseTier.Manager:
        return CardPricingTier.Premium;
      case LicenseTier.Leader:
        return CardPricingTier.Enterprise;
      default:
        return CardPricingTier.Standard;
    }
  }

  /**
   * Compute a suggested tier upgrade if it would save money.
   * Checks if the next tier up covers any current add-on purchases,
   * and whether switching would reduce total monthly spend.
   */
  private computeSuggestedUpgrade(
    currentTier: LicenseTier,
    addOnPurchases: StoredPurchase[],
    currentTotal: number
  ): SpendingSummary['suggestedTierUpgrade'] {
    if (addOnPurchases.length === 0) return null;

    const nextTier = licenseService.getSuggestedUpgradeTier(currentTier);
    if (!nextTier) return null; // already at highest tier

    const nextTierMeta = LicenseTierMeta[nextTier];
    const nextTierPrice = nextTierMeta.priceNumeric;

    // Count how many add-on cards the next tier would cover
    let wouldReplace = 0;
    let replacedCost = 0;

    for (const purchase of addOnPurchases) {
      const card = CARD_REGISTRY.find((c) => c.id === purchase.cardId);
      if (card && TIER_HIERARCHY[nextTier] >= TIER_HIERARCHY[card.minimumTier]) {
        wouldReplace++;
        replacedCost += purchase.monthlyPrice;
      }
    }

    if (wouldReplace === 0) return null;

    // Calculate what the new total would be
    const remainingAddOnCost = addOnPurchases.reduce(
      (sum, p) => sum + p.monthlyPrice,
      0
    ) - replacedCost;
    const newTotal = nextTierPrice + remainingAddOnCost;
    const savings = currentTotal - newTotal;

    // Only suggest if it actually saves money
    if (savings <= 0) return null;

    return {
      tier: nextTier,
      tierPrice: nextTierPrice,
      wouldReplace,
      monthlySavings: Math.round(savings * 100) / 100,
    };
  }
}

// Export singleton instance
export const entitlementService = EntitlementService.getInstance();
