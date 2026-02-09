// ============================================
// License Service
// Manages license tier state and card accessibility
// ============================================

import {
  LicenseTier,
  LicenseTierMeta,
  CardRegistration,
  INDIVIDUAL_TIER_CARD_IDS,
  TIER_HIERARCHY,
  isCardAccessibleAtTier,
} from '../models/CardCatalog';
import { CARD_REGISTRY } from '../config/cardRegistry';

// ============================================
// Storage Keys
// ============================================
const STORAGE_KEY_TIER = 'throughline_license_tier';
const STORAGE_KEY_INTELLIGENCE = 'throughline_intelligence';

// ============================================
// License Info Interface
// ============================================
export interface ILicenseInfo {
  tier: LicenseTier;
  intelligenceEnabled: boolean;
  expiresAt: Date | null;
  tenantId: string;
}

// ============================================
// Card Accessibility Result
// ============================================
export interface ICardAccessibility {
  accessible: CardRegistration[];
  locked: CardRegistration[];
  accessibleCount: number;
  lockedCount: number;
}

// ============================================
// License Service Class
// ============================================
export class LicenseService {
  private static instance: LicenseService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  /**
   * Get current license info
   * In POC: reads from localStorage
   * In production: would validate against API
   */
  public async getCurrentLicense(): Promise<ILicenseInfo> {
    try {
      const storedTier = localStorage.getItem(STORAGE_KEY_TIER);
      const storedIntelligence = localStorage.getItem(STORAGE_KEY_INTELLIGENCE);

      return {
        tier: (storedTier as LicenseTier) || LicenseTier.Individual,
        intelligenceEnabled: storedIntelligence === 'true',
        expiresAt: null, // No expiry in POC
        tenantId: 'demo',
      };
    } catch {
      // localStorage not available
      return {
        tier: LicenseTier.Individual,
        intelligenceEnabled: false,
        expiresAt: null,
        tenantId: 'demo',
      };
    }
  }

  /**
   * Get current license synchronously (for React hooks)
   */
  public getCurrentLicenseSync(): ILicenseInfo {
    try {
      const storedTier = localStorage.getItem(STORAGE_KEY_TIER);
      const storedIntelligence = localStorage.getItem(STORAGE_KEY_INTELLIGENCE);

      return {
        tier: (storedTier as LicenseTier) || LicenseTier.Individual,
        intelligenceEnabled: storedIntelligence === 'true',
        expiresAt: null,
        tenantId: 'demo',
      };
    } catch {
      return {
        tier: LicenseTier.Individual,
        intelligenceEnabled: false,
        expiresAt: null,
        tenantId: 'demo',
      };
    }
  }

  /**
   * Set demo tier (POC only)
   */
  public setDemoTier(tier: LicenseTier): void {
    try {
      localStorage.setItem(STORAGE_KEY_TIER, tier);
    } catch {
      console.warn('LicenseService: Unable to save tier to localStorage');
    }
  }

  /**
   * Set demo intelligence toggle (POC only)
   */
  public setDemoIntelligence(enabled: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEY_INTELLIGENCE, String(enabled));
    } catch {
      console.warn('LicenseService: Unable to save intelligence setting to localStorage');
    }
  }

  /**
   * Check if a specific card is accessible at the current tier
   */
  public isCardAccessible(card: CardRegistration, tier: LicenseTier): boolean {
    return isCardAccessibleAtTier(card, tier);
  }

  /**
   * Get all accessible and locked cards for a tier
   */
  public getAccessibleCards(
    tier: LicenseTier,
    registry: CardRegistration[] = CARD_REGISTRY
  ): ICardAccessibility {
    const accessible: CardRegistration[] = [];
    const locked: CardRegistration[] = [];

    registry.forEach((card) => {
      if (this.isCardAccessible(card, tier)) {
        accessible.push(card);
      } else {
        locked.push(card);
      }
    });

    return {
      accessible,
      locked,
      accessibleCount: accessible.length,
      lockedCount: locked.length,
    };
  }

  /**
   * Get tier metadata
   */
  public getTierMetadata(tier: LicenseTier) {
    return LicenseTierMeta[tier];
  }

  /**
   * Get all tier metadata
   */
  public getAllTierMetadata() {
    return LicenseTierMeta;
  }

  /**
   * Get tier hierarchy value (for comparisons)
   */
  public getTierLevel(tier: LicenseTier): number {
    return TIER_HIERARCHY[tier];
  }

  /**
   * Check if a tier includes another tier
   */
  public tierIncludes(currentTier: LicenseTier, requiredTier: LicenseTier): boolean {
    return TIER_HIERARCHY[currentTier] >= TIER_HIERARCHY[requiredTier];
  }

  /**
   * Get the Individual tier card IDs (free tier cards)
   */
  public getIndividualTierCardIds(): string[] {
    return INDIVIDUAL_TIER_CARD_IDS;
  }

  /**
   * Get card counts by tier
   */
  public getCardCountsByTier(): Record<LicenseTier, number> {
    const counts: Record<LicenseTier, number> = {
      [LicenseTier.Individual]: 0,
      [LicenseTier.Team]: 0,
      [LicenseTier.Manager]: 0,
      [LicenseTier.Leader]: 0,
    };

    // Individual tier is special - exactly 5 cards
    counts[LicenseTier.Individual] = INDIVIDUAL_TIER_CARD_IDS.length;

    // Other tiers accumulate cards
    Object.values(LicenseTier).forEach((tier) => {
      if (tier !== LicenseTier.Individual) {
        counts[tier] = this.getAccessibleCards(tier).accessibleCount;
      }
    });

    return counts;
  }

  /**
   * Get upgrade message for a locked card
   */
  public getUpgradeMessage(card: CardRegistration, currentTier: LicenseTier): string {
    const requiredTier = LicenseTierMeta[card.minimumTier];
    const currentTierMeta = LicenseTierMeta[currentTier];

    return `This card requires the ${requiredTier.displayName} tier (${requiredTier.price}). You're currently on the ${currentTierMeta.displayName} tier.`;
  }

  /**
   * Get suggested upgrade tier for a user
   */
  public getSuggestedUpgradeTier(currentTier: LicenseTier): LicenseTier | null {
    switch (currentTier) {
      case LicenseTier.Individual:
        return LicenseTier.Team;
      case LicenseTier.Team:
        return LicenseTier.Manager;
      case LicenseTier.Manager:
        return LicenseTier.Leader;
      case LicenseTier.Leader:
        return null; // Already at highest tier
      default:
        return LicenseTier.Team;
    }
  }
}

// Export singleton instance
export const licenseService = LicenseService.getInstance();
