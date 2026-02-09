// ============================================
// Tier Switcher - Demo Controls FAB
// Floating panel for switching license tiers in demos
// ============================================

import * as React from 'react';
import {
  Text,
  Switch,
  tokens,
  makeStyles,
  mergeClasses,
  Tooltip,
  Divider,
} from '@fluentui/react-components';
import {
  Settings20Regular,
  Dismiss20Regular,
  Sparkle20Regular,
} from '@fluentui/react-icons';
import { LicenseTier, LicenseTierMeta } from '../../models/CardCatalog';
import { useLicense } from '../../context/LicenseContext';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  // FAB button (always visible when demo mode is on)
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    boxShadow: tokens.shadow16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1000,
    border: 'none',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: tokens.durationNormal,
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: tokens.shadow28,
    },
  },

  // Floating panel
  panel: {
    position: 'fixed',
    bottom: '84px',
    right: '24px',
    width: '320px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow28,
    zIndex: 1000,
    overflow: 'hidden',
    transitionProperty: 'opacity, transform',
    transitionDuration: tokens.durationNormal,
  },

  panelHidden: {
    opacity: 0,
    transform: 'translateY(16px)',
    pointerEvents: 'none',
  },

  panelVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  },

  // Panel header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },

  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },

  // Panel content
  content: {
    padding: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },

  // Section
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },

  sectionLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Tier buttons
  tierButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingHorizontalS,
  },

  tierButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: tokens.durationFast,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },

  tierButtonActive: {
    backgroundColor: tokens.colorBrandBackground2,
  },

  tierName: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },

  tierPrice: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  // Intelligence toggle
  intelligenceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} 0`,
  },

  intelligenceLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },

  // Stats
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },

  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXXS,
    flex: 1,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },

  statValue: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
  },

  statValueAccessible: {
    color: tokens.colorPaletteGreenForeground1,
  },

  statValueLocked: {
    color: tokens.colorPaletteRedForeground1,
  },

  statLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  // Price summary
  priceSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },

  priceLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },

  priceValue: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },

  // Demo badge
  demoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorPaletteYellowBackground2,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorPaletteYellowForeground2,
  },
});

// ============================================
// Props Interface
// ============================================
interface TierSwitcherProps {
  /** Whether demo mode is enabled (controls visibility) */
  isDemoMode: boolean;
}

// ============================================
// Inner Component (only renders when demo mode is on)
// ============================================
const TierSwitcherInner: React.FC = () => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = React.useState(false);

  const {
    currentTier,
    intelligenceEnabled,
    accessibleCount,
    lockedCount,
    tierMetadata,
    setTier,
    setIntelligenceEnabled,
  } = useLicense();

  const handleToggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleTierSelect = React.useCallback(
    (tier: LicenseTier) => {
      setTier(tier);
    },
    [setTier]
  );

  const handleIntelligenceToggle = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setIntelligenceEnabled(ev.target.checked);
    },
    [setIntelligenceEnabled]
  );

  const tierOptions = [
    LicenseTier.Individual,
    LicenseTier.Team,
    LicenseTier.Manager,
    LicenseTier.Leader,
  ];

  return (
    <>
      {/* FAB Button */}
      <Tooltip content={isOpen ? 'Close demo controls' : 'Open demo controls'} relationship="label">
        <button
          className={styles.fab}
          onClick={handleToggle}
          aria-label="Toggle demo controls"
        >
          {isOpen ? <Dismiss20Regular /> : <Settings20Regular />}
        </button>
      </Tooltip>

      {/* Floating Panel */}
      <div
        className={mergeClasses(
          styles.panel,
          isOpen ? styles.panelVisible : styles.panelHidden
        )}
        role="dialog"
        aria-label="Demo Controls"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Settings20Regular />
            <Text weight="semibold">Demo Controls</Text>
          </div>
          <div className={styles.demoBadge}>
            <Sparkle20Regular />
            POC Mode
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Tier Selection */}
          <div className={styles.section}>
            <Text className={styles.sectionLabel}>Throughline Tier</Text>
            <div className={styles.tierButtons}>
              {tierOptions.map((tier) => {
                const meta = LicenseTierMeta[tier];
                const isActive = tier === currentTier;
                return (
                  <button
                    key={tier}
                    className={mergeClasses(
                      styles.tierButton,
                      isActive && styles.tierButtonActive
                    )}
                    onClick={() => handleTierSelect(tier)}
                    aria-pressed={isActive}
                  >
                    <Text className={styles.tierName}>{meta.displayName}</Text>
                    <Text className={styles.tierPrice}>{meta.price}</Text>
                  </button>
                );
              })}
            </div>
          </div>

          <Divider />

          {/* Intelligence Toggle */}
          <div className={styles.intelligenceRow}>
            <div className={styles.intelligenceLabel}>
              <Sparkle20Regular />
              <Text>Intelligence Add-on</Text>
            </div>
            <Switch
              checked={intelligenceEnabled}
              onChange={handleIntelligenceToggle}
              aria-label="Enable Intelligence add-on"
            />
          </div>

          <Divider />

          {/* Card Stats */}
          <div className={styles.section}>
            <Text className={styles.sectionLabel}>Cards</Text>
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <div className={mergeClasses(styles.statValue, styles.statValueAccessible)}>
                  {accessibleCount}
                </div>
                <Text className={styles.statLabel}>Accessible</Text>
              </div>
              <div className={styles.statItem}>
                <div className={mergeClasses(styles.statValue, styles.statValueLocked)}>
                  {lockedCount}
                </div>
                <Text className={styles.statLabel}>Locked</Text>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{accessibleCount + lockedCount}</div>
                <Text className={styles.statLabel}>Total</Text>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className={styles.priceSummary}>
            <Text className={styles.priceLabel}>Current Plan</Text>
            <Text className={styles.priceValue}>
              {tierMetadata.price}
              {intelligenceEnabled && ' + Intelligence'}
            </Text>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// Main Component (conditionally renders inner)
// ============================================
export const TierSwitcher: React.FC<TierSwitcherProps> = ({ isDemoMode }) => {
  // Don't render anything if not in demo mode
  if (!isDemoMode) {
    return null;
  }

  return <TierSwitcherInner />;
};

export default TierSwitcher;
