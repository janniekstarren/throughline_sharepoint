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
  showCategoryDescriptions: boolean;

  // Integration flags
  showIntegrations: boolean;
  allowIntegrationConnect: boolean;
  showComingSoonPlatforms: boolean;
  showRequestedPlatforms: boolean;

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
  isDemoMode: false,
  showLockedCards: true,
  showPlaceholderCards: true,
  showCategoryDescriptions: true,
  showIntegrations: true,
  allowIntegrationConnect: true,
  showComingSoonPlatforms: true,
  showRequestedPlatforms: true,
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
