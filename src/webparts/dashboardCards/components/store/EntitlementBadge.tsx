// ============================================
// EntitlementBadge — "Active ✓", "Trial: 12 days", "Add-on", "Included in Team"
// Shows the user's entitlement status for a card
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { EntitlementSource, CardEntitlement } from '../../models/CardEntitlement';
import { LicenseTierMeta, LicenseTier } from '../../models/CardCatalog';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase100,
    whiteSpace: 'nowrap',
  },
  active: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
  },
  trial: {
    backgroundColor: tokens.colorPaletteYellowBackground1,
    color: tokens.colorPaletteYellowForeground2,
  },
  addon: {
    backgroundColor: tokens.colorPaletteBlueBorderActive,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  free: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
  locked: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Props
// ============================================

interface EntitlementBadgeProps {
  entitlement: CardEntitlement;
  currentTier?: LicenseTier;
}

// ============================================
// Component
// ============================================

export const EntitlementBadge: React.FC<EntitlementBadgeProps> = ({
  entitlement,
  currentTier,
}) => {
  const classes = useStyles();

  if (!entitlement.entitled) {
    return (
      <span className={`${classes.badge} ${classes.locked}`}>
        Not available
      </span>
    );
  }

  switch (entitlement.source) {
    case EntitlementSource.DemoMode:
      return (
        <span className={`${classes.badge} ${classes.active}`}>
          Active ✓
        </span>
      );

    case EntitlementSource.SiteLicense:
      return (
        <span className={`${classes.badge} ${classes.active}`}>
          Site License ✓
        </span>
      );

    case EntitlementSource.AdminGrant:
      return (
        <span className={`${classes.badge} ${classes.active}`}>
          Granted ✓
        </span>
      );

    case EntitlementSource.TierSubscription: {
      const tierName = currentTier ? LicenseTierMeta[currentTier].displayName : 'Tier';
      return (
        <span className={`${classes.badge} ${classes.active}`}>
          Included in {tierName}
        </span>
      );
    }

    case EntitlementSource.IndividualPurchase:
      return (
        <span className={`${classes.badge} ${classes.addon}`}>
          Add-on ✓
        </span>
      );

    case EntitlementSource.Trial:
      return (
        <span className={`${classes.badge} ${classes.trial}`}>
          Trial: {entitlement.trialDaysRemaining}d left
        </span>
      );

    case EntitlementSource.Free:
      return (
        <span className={`${classes.badge} ${classes.free}`}>
          Free ✓
        </span>
      );

    default:
      return (
        <span className={`${classes.badge} ${classes.active}`}>
          Active ✓
        </span>
      );
  }
};
