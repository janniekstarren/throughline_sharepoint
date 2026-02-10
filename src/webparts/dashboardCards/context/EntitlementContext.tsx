// ============================================
// Entitlement Context
// Provides per-card entitlement state to all components
// ============================================

import * as React from 'react';
import { entitlementService } from '../services/EntitlementService';
import { CardEntitlement, SpendingSummary } from '../models/CardEntitlement';
import { DefaultEntitlement, PricingModel } from '../models/CardStore';

// ============================================
// Entitlement State Interface
// ============================================
export interface IEntitlementState {
  // Entitlement lookups
  isEntitled: (cardId: string) => boolean;
  getEntitlement: (cardId: string) => CardEntitlement;

  // Bulk data
  entitlementMap: Map<string, CardEntitlement>;
  spendingSummary: SpendingSummary;

  // Actions
  startTrial: (cardId: string) => void;
  purchaseCard: (cardId: string, billingCycle: 'monthly' | 'annual') => void;
  removePurchase: (cardId: string) => void;

  // Config
  defaultEntitlement: DefaultEntitlement;
  pricingModel: PricingModel;
}

// ============================================
// Create Context (undefined default — must be used within provider)
// ============================================
const EntitlementContext = React.createContext<IEntitlementState | undefined>(undefined);

// ============================================
// Entitlement Provider Component
// ============================================
interface EntitlementProviderProps {
  children: React.ReactNode;
  defaultEntitlement?: DefaultEntitlement;
  pricingModel?: PricingModel;
}

export const EntitlementProvider: React.FC<EntitlementProviderProps> = ({
  children,
  defaultEntitlement = 'all-enabled',
  pricingModel = PricingModel.TieredPlusAlaCarte,
}) => {
  // VERSION counter to trigger re-computation when entitlements change
  const [version, setVersion] = React.useState(0);

  // Configure service on mount and when props change
  React.useEffect(() => {
    entitlementService.configure(defaultEntitlement, pricingModel);
    setVersion(v => v + 1);
  }, [defaultEntitlement, pricingModel]);

  // Compute entitlement map (re-computed when version changes)
  const entitlementMap = React.useMemo(() => {
    return entitlementService.getAllEntitlements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, defaultEntitlement, pricingModel]);

  // Spending summary
  const spendingSummary = React.useMemo(() => {
    return entitlementService.getSpendingSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, defaultEntitlement, pricingModel]);

  // Lookup helpers
  const isEntitled = React.useCallback((cardId: string): boolean => {
    const ent = entitlementMap.get(cardId);
    return ent?.entitled ?? false;
  }, [entitlementMap]);

  const getEntitlement = React.useCallback((cardId: string): CardEntitlement => {
    return entitlementMap.get(cardId) ?? {
      cardId,
      entitled: false,
      source: null,
      expiresAt: null,
      trialDaysRemaining: null,
    };
  }, [entitlementMap]);

  // Actions that mutate entitlements and bump version
  const startTrial = React.useCallback((cardId: string) => {
    entitlementService.startTrial(cardId);
    setVersion(v => v + 1);
  }, []);

  const purchaseCard = React.useCallback((cardId: string, billingCycle: 'monthly' | 'annual') => {
    entitlementService.purchaseCard(cardId, billingCycle);
    setVersion(v => v + 1);
  }, []);

  const removePurchase = React.useCallback((cardId: string) => {
    entitlementService.removePurchase(cardId);
    setVersion(v => v + 1);
  }, []);

  // Build context value
  const contextValue: IEntitlementState = React.useMemo(
    () => ({
      isEntitled,
      getEntitlement,
      entitlementMap,
      spendingSummary,
      startTrial,
      purchaseCard,
      removePurchase,
      defaultEntitlement,
      pricingModel,
    }),
    [
      isEntitled,
      getEntitlement,
      entitlementMap,
      spendingSummary,
      startTrial,
      purchaseCard,
      removePurchase,
      defaultEntitlement,
      pricingModel,
    ]
  );

  return (
    <EntitlementContext.Provider value={contextValue}>
      {children}
    </EntitlementContext.Provider>
  );
};

// ============================================
// Custom Hook
// ============================================
export function useEntitlements(): IEntitlementState {
  const context = React.useContext(EntitlementContext);
  if (!context) {
    throw new Error('useEntitlements must be used within an EntitlementProvider');
  }
  return context;
}

// ============================================
// Export
// ============================================
export default EntitlementContext;
