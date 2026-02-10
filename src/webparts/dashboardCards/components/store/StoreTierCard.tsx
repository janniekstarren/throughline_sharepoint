// ============================================
// StoreTierCard — Tier tile for the store
// Shows tier name, price, card count, savings, badges
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Badge,
} from '@fluentui/react-components';
import { LicenseTier, LicenseTierMeta } from '../../models/CardCatalog';
import { TierStoreListing } from '../../models/CardStore';
import { useLicense } from '../../context/LicenseContext';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalL,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    borderTopWidth: '2px',
    borderRightWidth: tokens.strokeWidthThin,
    borderBottomWidth: tokens.strokeWidthThin,
    borderLeftWidth: tokens.strokeWidthThin,
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    transitionProperty: 'box-shadow, transform',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
    ':hover': {
      boxShadow: tokens.shadow8,
      transform: 'translateY(-2px)',
    },
    cursor: 'pointer',
    width: '320px',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
  },
  price: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
  },
  headline: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    lineHeight: tokens.lineHeightBase200,
  },
  stats: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
  },
  statLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  badges: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  currentTier: {
    borderTopWidth: '2px',
    borderTopColor: tokens.colorBrandStroke1,
    boxShadow: tokens.shadow4,
  },
});

// ============================================
// Props
// ============================================

interface StoreTierCardProps {
  tierListing: TierStoreListing;
  onClick: (tierId: LicenseTier) => void;
}

// ============================================
// Component
// ============================================

export const StoreTierCard: React.FC<StoreTierCardProps> = ({
  tierListing,
  onClick,
}) => {
  const classes = useStyles();
  const { currentTier } = useLicense();
  const tierMeta = LicenseTierMeta[tierListing.tierId];
  const isCurrentTier = currentTier === tierListing.tierId;

  return (
    <div
      className={`${classes.tile} ${isCurrentTier ? classes.currentTier : ''}`}
      style={{ borderTopColor: tierMeta.color }}
      onClick={() => onClick(tierListing.tierId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(tierListing.tierId); }}
    >
      <div className={classes.header}>
        <div>
          <Text className={classes.name}>{tierMeta.displayName}</Text>
          <div>
            <Text className={classes.price}>{tierMeta.price}</Text>
          </div>
        </div>
        <div className={classes.badges}>
          {isCurrentTier && <Badge appearance="filled" color="brand">Current</Badge>}
          {tierListing.isPopular && <Badge appearance="filled" color="warning">Popular</Badge>}
          {tierListing.isRecommended && <Badge appearance="filled" color="success">Recommended</Badge>}
        </div>
      </div>

      <Text className={classes.headline}>{tierListing.headline}</Text>

      <div className={classes.stats}>
        <div className={classes.stat}>
          <Text className={classes.statValue}>{tierListing.includedCardCount}</Text>
          <Text className={classes.statLabel}>Cards</Text>
        </div>
        <div className={classes.stat}>
          <Text className={classes.statValue}>{tierListing.savingsVsAlaCarte}%</Text>
          <Text className={classes.statLabel}>Savings</Text>
        </div>
      </div>

      {!isCurrentTier && (
        <Button appearance="primary" size="small">
          {LicenseTierMeta[currentTier].sortOrder < tierMeta.sortOrder ? 'Upgrade' : 'Switch'}
        </Button>
      )}
    </div>
  );
};
