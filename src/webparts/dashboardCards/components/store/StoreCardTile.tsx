// ============================================
// StoreCardTile — Card tile for the Card Store grid
// Shows emoji, name, headline, rating, impact, price, CTA
// 8 entitlement states handled by EntitlementBadge
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
} from '@fluentui/react-components';
import { CardRegistration } from '../../models/CardCatalog';
import { CardStoreListing } from '../../models/CardStore';
import { CardEntitlement, EntitlementSource } from '../../models/CardEntitlement';
import { RatingStars } from './RatingStars';
import { PricingBadge } from './PricingBadge';
import { EntitlementBadge } from './EntitlementBadge';
import { TrialCountdown } from './TrialCountdown';
import { LicenseTier } from '../../models/CardCatalog';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  tile: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    borderTopWidth: tokens.strokeWidthThin,
    borderRightWidth: tokens.strokeWidthThin,
    borderBottomWidth: tokens.strokeWidthThin,
    borderLeftWidth: tokens.strokeWidthThin,
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    padding: tokens.spacingVerticalM,
    cursor: 'pointer',
    transitionProperty: 'box-shadow, border-color, transform',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
    ':hover': {
      boxShadow: tokens.shadow8,
      borderTopColor: tokens.colorNeutralStroke1Hover,
      borderRightColor: tokens.colorNeutralStroke1Hover,
      borderBottomColor: tokens.colorNeutralStroke1Hover,
      borderLeftColor: tokens.colorNeutralStroke1Hover,
      transform: 'translateY(-2px)',
    },
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
  },
  emoji: {
    fontSize: '28px',
    lineHeight: '1',
    flexShrink: 0,
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    flex: 1,
  },
  name: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headline: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase200,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXS,
  },
  impactDot: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: tokens.spacingVerticalS,
    borderTopWidth: tokens.strokeWidthThin,
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke3,
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
  },
  staffPick: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorPaletteYellowForeground2,
    fontWeight: tokens.fontWeightSemibold,
  },
  newBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingLeft: tokens.spacingHorizontalXS,
    paddingRight: tokens.spacingHorizontalXS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
    fontSize: '10px',
    fontWeight: tokens.fontWeightBold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  trendingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingLeft: tokens.spacingHorizontalXS,
    paddingRight: tokens.spacingHorizontalXS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
    fontSize: '10px',
    fontWeight: tokens.fontWeightBold,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  integrationBadge: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Impact Dots
// ============================================

const ImpactDots: React.FC<{ rating: number }> = ({ rating }) => {
  const classes = useStyles();
  const filled = Math.min(5, Math.max(0, rating));
  return (
    <span className={classes.impactDot}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ opacity: i < filled ? 1 : 0.25 }}>●</span>
      ))}
    </span>
  );
};

// ============================================
// Props
// ============================================

interface StoreCardTileProps {
  card: CardRegistration;
  listing: CardStoreListing;
  entitlement: CardEntitlement;
  currentTier?: LicenseTier;
  onClick: (cardId: string) => void;
  onStartTrial?: (cardId: string) => void;
  onPurchase?: (cardId: string) => void;
}

// ============================================
// Component
// ============================================

export const StoreCardTile: React.FC<StoreCardTileProps> = ({
  card,
  listing,
  entitlement,
  currentTier,
  onClick,
  onStartTrial,
  onPurchase,
}) => {
  const classes = useStyles();

  const handleClick = React.useCallback(() => {
    onClick(card.id);
  }, [onClick, card.id]);

  const handleTrialClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartTrial) onStartTrial(card.id);
  }, [onStartTrial, card.id]);

  const handlePurchaseClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPurchase) onPurchase(card.id);
  }, [onPurchase, card.id]);

  const showTrialButton = !entitlement.entitled && listing.pricingTier !== 'free' as never && onStartTrial;
  const showPurchaseButton = !entitlement.entitled && listing.isAvailableForPurchase && onPurchase;

  return (
    <div
      className={classes.tile}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${card.name} - ${listing.headline}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      {/* Header: Emoji + Name + Headline */}
      <div className={classes.header}>
        <span className={classes.emoji}>{listing.iconEmoji}</span>
        <div className={classes.headerText}>
          <Text className={classes.name}>{card.name}</Text>
          <Text className={classes.headline}>{listing.headline}</Text>
        </div>
      </div>

      {/* Meta: Rating + Impact */}
      <div className={classes.meta}>
        <RatingStars rating={listing.rating} count={listing.ratingCount} />
        <div className={classes.spacer} />
        <ImpactDots rating={card.impactRating} />
      </div>

      {/* Promo badges */}
      <div className={classes.badges} style={{ marginTop: tokens.spacingVerticalXS }}>
        {listing.isStaffPick && (
          <span className={classes.staffPick}>⭐ Staff Pick</span>
        )}
        {listing.isNew && (
          <span className={classes.newBadge}>New</span>
        )}
        {listing.isTrending && (
          <span className={classes.trendingBadge}>🔥 Trending</span>
        )}
        {listing.requiresIntegration && (
          <span className={classes.integrationBadge}>🔌 {listing.requiresIntegration}</span>
        )}
      </div>

      {/* Footer: Entitlement + Pricing + CTA */}
      <div className={classes.footer}>
        <div className={classes.badges}>
          <EntitlementBadge entitlement={entitlement} currentTier={currentTier} />
          {entitlement.source === EntitlementSource.Trial && entitlement.trialDaysRemaining !== null && (
            <TrialCountdown daysRemaining={entitlement.trialDaysRemaining} />
          )}
        </div>
        <div className={classes.badges}>
          <PricingBadge
            pricingTier={listing.pricingTier}
            isIncluded={entitlement.entitled && entitlement.source === EntitlementSource.TierSubscription}
          />
          {showTrialButton && (
            <Button size="small" appearance="subtle" onClick={handleTrialClick}>
              Try free
            </Button>
          )}
          {showPurchaseButton && !showTrialButton && (
            <Button size="small" appearance="primary" onClick={handlePurchaseClick}>
              Get
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
