// ============================================
// PricingBadge — "$6/mo" or "Free" or "Included"
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { CardPricingTier, CARD_PRICING_DEFAULTS } from '../../models/CardStore';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
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
  free: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
  },
  standard: {
    backgroundColor: tokens.colorPaletteBlueBorderActive,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  premium: {
    backgroundColor: tokens.colorPalettePurpleBorderActive,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  enterprise: {
    backgroundColor: '#D4AF37',
    color: '#1A1A1A',
  },
  included: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
});

// ============================================
// Props
// ============================================

interface PricingBadgeProps {
  pricingTier: CardPricingTier;
  isIncluded?: boolean;
  billingCycle?: 'monthly' | 'annual';
}

// ============================================
// Component
// ============================================

export const PricingBadge: React.FC<PricingBadgeProps> = ({
  pricingTier,
  isIncluded = false,
  billingCycle = 'monthly',
}) => {
  const classes = useStyles();

  if (isIncluded) {
    return (
      <span className={`${classes.badge} ${classes.included}`}>
        Included
      </span>
    );
  }

  if (pricingTier === CardPricingTier.Free) {
    return (
      <span className={`${classes.badge} ${classes.free}`}>
        Free
      </span>
    );
  }

  const pricing = CARD_PRICING_DEFAULTS[pricingTier];
  const price = billingCycle === 'annual' ? pricing.annualPrice : pricing.monthlyPrice;

  const tierClass =
    pricingTier === CardPricingTier.Enterprise
      ? classes.enterprise
      : pricingTier === CardPricingTier.Premium
      ? classes.premium
      : classes.standard;

  return (
    <span className={`${classes.badge} ${tierClass}`}>
      ${price}/mo
    </span>
  );
};
