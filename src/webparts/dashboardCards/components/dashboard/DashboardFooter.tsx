// ============================================
// DashboardFooter - Stats bar at bottom of dashboard
// Shows total, accessible, pinned, locked, add-on counts + spend
// ============================================

import * as React from 'react';
import { Text, Button, makeStyles, tokens } from '@fluentui/react-components';
import { Cart20Regular } from '@fluentui/react-icons';
import { useLicense } from '../../context/LicenseContext';
import { useEntitlements } from '../../context/EntitlementContext';
import { LicenseTierMeta } from '../../models/CardCatalog';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalL,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    marginTop: tokens.spacingVerticalL,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground2,
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  statValue: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
  },
  separator: {
    color: tokens.colorNeutralStroke2,
  },
  spendLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  spendValue: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
  browseButton: {
    fontSize: tokens.fontSizeBase200,
    minWidth: 'auto',
    height: 'auto',
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
  },
});

// ============================================
// Props
// ============================================

interface DashboardFooterProps {
  pinnedCount: number;
  onOpenStore?: () => void;
}

// ============================================
// Component
// ============================================

export const DashboardFooter: React.FC<DashboardFooterProps> = ({
  pinnedCount,
  onOpenStore,
}) => {
  const classes = useStyles();
  const { accessibleCount, lockedCount, currentTier } = useLicense();
  const { spendingSummary } = useEntitlements();
  const total = accessibleCount + lockedCount;
  const tierMeta = LicenseTierMeta[currentTier];

  return (
    <div className={classes.footer}>
      {/* Tier name */}
      <Text className={classes.stat}>
        <span className={classes.statValue}>{tierMeta.displayName}</span> tier
      </Text>
      <Text className={classes.separator}>|</Text>

      {/* Card counts */}
      <Text className={classes.stat}>
        <span className={classes.statValue}>{total}</span> cards
      </Text>
      <Text className={classes.separator}>|</Text>
      <Text className={classes.stat}>
        <span className={classes.statValue}>{accessibleCount}</span> accessible
      </Text>
      {pinnedCount > 0 && (
        <>
          <Text className={classes.separator}>|</Text>
          <Text className={classes.stat}>
            <span className={classes.statValue}>{pinnedCount}</span> pinned
          </Text>
        </>
      )}
      {lockedCount > 0 && (
        <>
          <Text className={classes.separator}>|</Text>
          <Text className={classes.stat}>
            <span className={classes.statValue}>{lockedCount}</span> locked
          </Text>
        </>
      )}

      {/* Add-on count (if any) */}
      {spendingSummary.addOnCount > 0 && (
        <>
          <Text className={classes.separator}>|</Text>
          <Text className={classes.stat}>
            <span className={classes.statValue}>{spendingSummary.addOnCount}</span> add-ons
          </Text>
        </>
      )}

      {/* Monthly spend */}
      {spendingSummary.totalMonthly > 0 && (
        <>
          <Text className={classes.separator}>|</Text>
          <Text className={classes.spendLabel}>
            <span className={classes.spendValue}>${spendingSummary.totalMonthly.toFixed(0)}</span>/mo
          </Text>
        </>
      )}

      {/* Browse more — store link */}
      {onOpenStore && (
        <>
          <Text className={classes.separator}>|</Text>
          <Button
            appearance="transparent"
            size="small"
            icon={<Cart20Regular />}
            className={classes.browseButton}
            onClick={onOpenStore}
          >
            Browse more
          </Button>
        </>
      )}
    </div>
  );
};

export default DashboardFooter;
