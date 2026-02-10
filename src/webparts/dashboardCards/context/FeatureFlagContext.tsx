// ============================================
// FeatureFlagContext
// Passes admin property pane flags to all components
// ============================================

import * as React from 'react';

// ============================================
// Feature Flags Interface
// ============================================

export interface FeatureFlags {
  // Admin-controlled (from property pane)
  allowUserCustomisation: boolean;
  allowCardHiding: boolean;
  allowCardPinning: boolean;
  allowCardRenaming: boolean;
  allowCategoryReorder: boolean;
  allowCategoryHiding: boolean;
  allowCategoryRenaming: boolean;
  allowViewSwitching: boolean;
  isDemoMode: boolean;
  showLockedCards: boolean;
  showPlaceholderCards: boolean;
  showIntegrationAndDevCards: boolean;
  showCategoryDescriptions: boolean;

  // Integration flags
  showIntegrations: boolean;
  allowIntegrationConnect: boolean;
  showComingSoonPlatforms: boolean;
  showRequestedPlatforms: boolean;

  // Card Store flags
  showCardStore: boolean;
  allowAlaCartePurchase: boolean;
  allowTrials: boolean;
  showPricing: boolean;

  // Intelligence Hub flags
  showIntelligenceHub: boolean;
  showGreeting: boolean;
  showQueryBox: boolean;
  showInsightsRollup: boolean;
  hubStartCollapsed: boolean;
  /** Insights auto-refresh interval in seconds (0 = manual only) */
  insightsRefreshInterval: number;
  /** Enable floating AI chat dialog (ChatSparkle icon in menu bar) */
  enableFloatingAIChat: boolean;

  // Adaptive Rendering flags
  /** Master toggle for adaptive visual rendering (data-driven shadows, glows, typography) */
  enableAdaptiveRendering: boolean;
  /** Allow auto-promotion of card sizes based on visual weight */
  enableAutoPromotion: boolean;
  /** Show global status pulse indicator in sticky header */
  showPulse: boolean;
  /** Glow intensity level for adaptive shadows */
  glowIntensity: 'subtle' | 'standard' | 'vivid';

  // Derived
  hasAnyUserFeature: boolean;
}

// ============================================
// Defaults (all features on)
// ============================================

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  allowUserCustomisation: true,
  allowCardHiding: true,
  allowCardPinning: true,
  allowCardRenaming: true,
  allowCategoryReorder: true,
  allowCategoryHiding: true,
  allowCategoryRenaming: true,
  allowViewSwitching: true,
  isDemoMode: true,
  showLockedCards: true,
  showPlaceholderCards: true,
  showIntegrationAndDevCards: true,
  showCategoryDescriptions: true,
  showIntegrations: true,
  allowIntegrationConnect: true,
  showComingSoonPlatforms: true,
  showRequestedPlatforms: true,
  showCardStore: true,
  allowAlaCartePurchase: true,
  allowTrials: true,
  showPricing: true,
  showIntelligenceHub: true,
  showGreeting: true,
  showQueryBox: true,
  showInsightsRollup: true,
  hubStartCollapsed: false,
  insightsRefreshInterval: 300,
  enableFloatingAIChat: true,
  enableAdaptiveRendering: true,
  enableAutoPromotion: true,
  showPulse: true,
  glowIntensity: 'standard',
  hasAnyUserFeature: true,
};

// ============================================
// Context
// ============================================

export const FeatureFlagContext = React.createContext<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

// ============================================
// Provider
// ============================================

interface FeatureFlagProviderProps {
  flags: Partial<FeatureFlags>;
  children: React.ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  flags,
  children,
}) => {
  const value = React.useMemo<FeatureFlags>(() => {
    const merged = { ...DEFAULT_FEATURE_FLAGS, ...flags };

    // Derive hasAnyUserFeature
    merged.hasAnyUserFeature = merged.allowUserCustomisation && (
      merged.allowCardHiding ||
      merged.allowCardPinning ||
      merged.allowCardRenaming ||
      merged.allowCategoryReorder ||
      merged.allowCategoryHiding ||
      merged.allowCategoryRenaming ||
      merged.allowViewSwitching
    );

    // If master toggle is off, disable all granular features
    if (!merged.allowUserCustomisation) {
      merged.allowCardHiding = false;
      merged.allowCardPinning = false;
      merged.allowCardRenaming = false;
      merged.allowCategoryReorder = false;
      merged.allowCategoryHiding = false;
      merged.allowCategoryRenaming = false;
      merged.allowViewSwitching = false;
      merged.hasAnyUserFeature = false;
    }

    return merged;
  }, [flags]);

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// ============================================
// Hook
// ============================================

export function useFeatureFlags(): FeatureFlags {
  return React.useContext(FeatureFlagContext);
}
