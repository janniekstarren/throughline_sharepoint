// ============================================
// License Context
// Provides license tier state to all components
// ============================================

import * as React from 'react';
import {
  LicenseTier,
  LicenseTierMeta,
  CardRegistration,
  TierMetadata,
} from '../models/CardCatalog';
import { CARD_REGISTRY } from '../config/cardRegistry';
import { licenseService, ICardAccessibility } from '../services/LicenseService';

// ============================================
// License State Interface
// ============================================
export interface ILicenseState {
  // Current state
  currentTier: LicenseTier;
  intelligenceEnabled: boolean;

  // Card accessibility
  accessibleCards: CardRegistration[];
  lockedCards: CardRegistration[];
  accessibleCount: number;
  lockedCount: number;

  // Tier info
  tierMetadata: TierMetadata;
  tierCardCounts: Record<LicenseTier, number>;

  // Actions (for POC demo mode)
  setTier: (tier: LicenseTier) => void;
  setIntelligenceEnabled: (enabled: boolean) => void;

  // Helper functions
  isCardAccessible: (cardId: string) => boolean;
  getCardById: (cardId: string) => CardRegistration | undefined;
  getUpgradeMessage: (card: CardRegistration) => string;
}

// ============================================
// Default Context Value
// ============================================
const defaultLicenseState: ILicenseState = {
  currentTier: LicenseTier.Individual,
  intelligenceEnabled: false,
  accessibleCards: [],
  lockedCards: [],
  accessibleCount: 0,
  lockedCount: 0,
  tierMetadata: LicenseTierMeta[LicenseTier.Individual],
  tierCardCounts: {
    [LicenseTier.Individual]: 5,
    [LicenseTier.Team]: 50,
    [LicenseTier.Manager]: 72,
    [LicenseTier.Leader]: 80,
  },
  setTier: () => { /* no-op */ },
  setIntelligenceEnabled: () => { /* no-op */ },
  isCardAccessible: () => false,
  getCardById: () => undefined,
  getUpgradeMessage: () => '',
};

// ============================================
// Create Context
// ============================================
export const LicenseContext = React.createContext<ILicenseState>(defaultLicenseState);

// ============================================
// License Provider Component
// ============================================
interface ILicenseProviderProps {
  children: React.ReactNode;
  initialTier?: LicenseTier;
  initialIntelligence?: boolean;
}

export const LicenseProvider: React.FC<ILicenseProviderProps> = ({
  children,
  initialTier,
  initialIntelligence,
}) => {
  // Get initial values synchronously to avoid hydration issues
  const getInitialTier = (): LicenseTier => {
    if (initialTier) return initialTier;
    try {
      const licenseInfo = licenseService.getCurrentLicenseSync();
      return licenseInfo.tier;
    } catch {
      return LicenseTier.Individual;
    }
  };

  const getInitialIntelligence = (): boolean => {
    if (initialIntelligence !== undefined) return initialIntelligence;
    try {
      const licenseInfo = licenseService.getCurrentLicenseSync();
      return licenseInfo.intelligenceEnabled;
    } catch {
      return false;
    }
  };

  // State
  const [currentTier, setCurrentTier] = React.useState<LicenseTier>(getInitialTier);
  const [intelligenceEnabled, setIntelligenceEnabledState] = React.useState<boolean>(getInitialIntelligence);

  // Computed: Card accessibility
  const cardAccessibility = React.useMemo<ICardAccessibility>(() => {
    try {
      return licenseService.getAccessibleCards(currentTier, CARD_REGISTRY);
    } catch {
      return { accessible: [], locked: [], accessibleCount: 0, lockedCount: 0 };
    }
  }, [currentTier]);

  // Computed: Tier metadata
  const tierMetadata = React.useMemo<TierMetadata>(() => {
    return LicenseTierMeta[currentTier];
  }, [currentTier]);

  // Computed: Card counts by tier
  const tierCardCounts = React.useMemo<Record<LicenseTier, number>>(() => {
    try {
      return licenseService.getCardCountsByTier();
    } catch {
      return {
        [LicenseTier.Individual]: 5,
        [LicenseTier.Team]: 50,
        [LicenseTier.Manager]: 72,
        [LicenseTier.Leader]: 80,
      };
    }
  }, []);

  // Action: Set tier
  const setTier = React.useCallback((tier: LicenseTier) => {
    setCurrentTier(tier);
    try {
      licenseService.setDemoTier(tier);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Action: Set intelligence enabled
  const setIntelligenceEnabled = React.useCallback((enabled: boolean) => {
    setIntelligenceEnabledState(enabled);
    try {
      licenseService.setDemoIntelligence(enabled);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Helper: Check if card is accessible
  const isCardAccessible = React.useCallback(
    (cardId: string): boolean => {
      return cardAccessibility.accessible.some((card) => card.id === cardId);
    },
    [cardAccessibility]
  );

  // Helper: Get card by ID
  const getCardById = React.useCallback((cardId: string): CardRegistration | undefined => {
    return CARD_REGISTRY.find((card) => card.id === cardId);
  }, []);

  // Helper: Get upgrade message
  const getUpgradeMessage = React.useCallback(
    (card: CardRegistration): string => {
      try {
        return licenseService.getUpgradeMessage(card, currentTier);
      } catch {
        return `Requires ${LicenseTierMeta[card.minimumTier].displayName}`;
      }
    },
    [currentTier]
  );

  // Build context value
  const contextValue: ILicenseState = React.useMemo(
    () => ({
      currentTier,
      intelligenceEnabled,
      accessibleCards: cardAccessibility.accessible,
      lockedCards: cardAccessibility.locked,
      accessibleCount: cardAccessibility.accessibleCount,
      lockedCount: cardAccessibility.lockedCount,
      tierMetadata,
      tierCardCounts,
      setTier,
      setIntelligenceEnabled,
      isCardAccessible,
      getCardById,
      getUpgradeMessage,
    }),
    [
      currentTier,
      intelligenceEnabled,
      cardAccessibility,
      tierMetadata,
      tierCardCounts,
      setTier,
      setIntelligenceEnabled,
      isCardAccessible,
      getCardById,
      getUpgradeMessage,
    ]
  );

  return (
    <LicenseContext.Provider value={contextValue}>
      {children}
    </LicenseContext.Provider>
  );
};

// ============================================
// Custom Hook
// ============================================
export function useLicense(): ILicenseState {
  const context = React.useContext(LicenseContext);
  // Return default state if context is not available (during SSR or outside provider)
  if (!context) {
    return defaultLicenseState;
  }
  return context;
}

// ============================================
// Export convenience components
// ============================================
export default LicenseContext;
