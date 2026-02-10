// ============================================
// StoreCardDetail — 2-column card detail layout
// Left: description, value props, use cases, related cards
// Right: live preview, pricing panel, card metadata
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Divider,
  Badge,
} from '@fluentui/react-components';
import { CARD_REGISTRY } from '../../config/cardRegistry';
import { getStoreListing } from '../../config/storeListings';
import { CardEntitlement, EntitlementSource } from '../../models/CardEntitlement';
import { CardCategoryMeta, LicenseTierMeta, LicenseTier } from '../../models/CardCatalog';
import { RatingStars } from './RatingStars';
import { PricingBadge } from './PricingBadge';
import { EntitlementBadge } from './EntitlementBadge';
import { TrialCountdown } from './TrialCountdown';
import { CardPreview } from './CardPreview';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: tokens.spacingHorizontalXXL,
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  hero: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalL,
  },
  emoji: {
    fontSize: '56px',
    lineHeight: '1',
    flexShrink: 0,
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  name: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
  },
  headline: {
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase400,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    paddingLeft: tokens.spacingHorizontalL,
    listStyleType: 'disc',
  },
  listItem: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase300,
  },
  description: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.6',
  },
  relatedGrid: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  relatedChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
    cursor: 'pointer',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },
  // Right column
  pricingPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalL,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
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
  },
  pricingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  detailsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
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
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: tokens.fontSizeBase200,
  },
  detailLabel: {
    color: tokens.colorNeutralForeground3,
  },
  detailValue: {
    fontWeight: tokens.fontWeightSemibold,
  },
});

// ============================================
// Props
// ============================================

interface StoreCardDetailProps {
  cardId: string;
  entitlementMap: Map<string, CardEntitlement>;
  currentTier: LicenseTier;
  onStartTrial: (cardId: string) => void;
  onPurchase: (cardId: string) => void;
  onCardClick: (cardId: string) => void;
}

// ============================================
// Component
// ============================================

export const StoreCardDetail: React.FC<StoreCardDetailProps> = ({
  cardId,
  entitlementMap,
  currentTier,
  onStartTrial,
  onPurchase,
  onCardClick,
}) => {
  const classes = useStyles();
  const card = CARD_REGISTRY.find(c => c.id === cardId);
  const listing = getStoreListing(cardId);
  const entitlement = entitlementMap.get(cardId) ?? {
    cardId,
    entitled: false,
    source: null,
    expiresAt: null,
    trialDaysRemaining: null,
  };

  if (!card) {
    return <Text>Card not found</Text>;
  }

  const categoryMeta = CardCategoryMeta[card.category];
  const tierMeta = LicenseTierMeta[card.minimumTier];
  const isEntitled = entitlement.entitled;

  return (
    <div className={classes.container}>
      {/* ---- LEFT COLUMN ---- */}
      <div className={classes.left}>
        {/* Hero */}
        <div className={classes.hero}>
          <span className={classes.emoji}>{listing.iconEmoji}</span>
          <div className={classes.heroText}>
            <Text className={classes.name}>{card.name}</Text>
            <Text className={classes.headline}>{listing.headline}</Text>
            <div className={classes.metaRow}>
              <RatingStars rating={listing.rating} count={listing.ratingCount} />
              <EntitlementBadge entitlement={entitlement} currentTier={currentTier} />
              <PricingBadge pricingTier={listing.pricingTier} isIncluded={entitlement.source === EntitlementSource.TierSubscription} />
              {listing.isStaffPick && <Badge appearance="outline" color="warning">⭐ Staff Pick</Badge>}
              {listing.isNew && <Badge appearance="filled" color="success">New</Badge>}
              {listing.isTrending && <Badge appearance="filled" color="danger">🔥 Trending</Badge>}
            </div>
            {entitlement.source === EntitlementSource.Trial && entitlement.trialDaysRemaining !== null && (
              <TrialCountdown daysRemaining={entitlement.trialDaysRemaining} showProgress />
            )}
          </div>
        </div>

        <Divider />

        {/* Long description */}
        <div className={classes.section}>
          <Text className={classes.description}>{listing.longDescription}</Text>
        </div>

        {/* Value Proposition */}
        <div className={classes.section}>
          <Text className={classes.sectionTitle}>Why this card matters</Text>
          <ul className={classes.list}>
            {listing.valueProposition.map((vp, i) => (
              <li key={i}><Text className={classes.listItem}>{vp}</Text></li>
            ))}
          </ul>
        </div>

        {/* Use Cases */}
        <div className={classes.section}>
          <Text className={classes.sectionTitle}>Best used for</Text>
          <ul className={classes.list}>
            {listing.useCases.map((uc, i) => (
              <li key={i}><Text className={classes.listItem}>{uc}</Text></li>
            ))}
          </ul>
        </div>

        {/* Related Cards */}
        {listing.relatedCardIds.length > 0 && (
          <div className={classes.section}>
            <Text className={classes.sectionTitle}>Related Cards</Text>
            <div className={classes.relatedGrid}>
              {listing.relatedCardIds.map(relId => {
                const relCard = CARD_REGISTRY.find(c => c.id === relId);
                const relListing = getStoreListing(relId);
                if (!relCard) return null;
                return (
                  <span
                    key={relId}
                    className={classes.relatedChip}
                    onClick={() => onCardClick(relId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') onCardClick(relId); }}
                  >
                    {relListing.iconEmoji} {relCard.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ---- RIGHT COLUMN ---- */}
      <div className={classes.right}>
        {/* Live Preview */}
        <CardPreview card={card} listing={listing} />

        {/* Pricing & CTA Panel */}
        <div className={classes.pricingPanel}>
          <div className={classes.pricingRow}>
            <Text weight="semibold" size={400}>
              {isEntitled ? 'You have access' : 'Get this card'}
            </Text>
            <PricingBadge
              pricingTier={listing.pricingTier}
              isIncluded={entitlement.source === EntitlementSource.TierSubscription}
            />
          </div>

          <div className={classes.ctaButtons}>
            {!isEntitled && (
              <>
                <Button
                  appearance="primary"
                  size="large"
                  onClick={() => onPurchase(cardId)}
                >
                  Activate Card
                </Button>
                <Button
                  appearance="outline"
                  onClick={() => onStartTrial(cardId)}
                >
                  Start Free Trial
                </Button>
              </>
            )}
            {isEntitled && (
              <Text size={300} style={{ color: tokens.colorPaletteGreenForeground1 }}>
                ✓ Active — this card is on your dashboard
              </Text>
            )}
          </div>
        </div>

        {/* Card Details */}
        <div className={classes.detailsPanel}>
          <Text weight="semibold" size={300}>Card Details</Text>
          <div className={classes.detailRow}>
            <Text className={classes.detailLabel}>Category</Text>
            <Text className={classes.detailValue}>{categoryMeta.displayName}</Text>
          </div>
          <div className={classes.detailRow}>
            <Text className={classes.detailLabel}>Minimum Tier</Text>
            <Text className={classes.detailValue}>{tierMeta.displayName}</Text>
          </div>
          <div className={classes.detailRow}>
            <Text className={classes.detailLabel}>Impact Rating</Text>
            <Text className={classes.detailValue}>
              {card.impactRating}/10
            </Text>
          </div>
          <div className={classes.detailRow}>
            <Text className={classes.detailLabel}>Status</Text>
            <Text className={classes.detailValue}>{card.status}</Text>
          </div>
          {listing.requiresIntegration && (
            <div className={classes.detailRow}>
              <Text className={classes.detailLabel}>Integration</Text>
              <Text className={classes.detailValue}>{listing.requiresIntegration}</Text>
            </div>
          )}
          <div className={classes.detailRow}>
            <Text className={classes.detailLabel}>Released</Text>
            <Text className={classes.detailValue}>{listing.releaseDate}</Text>
          </div>
          <div className={classes.detailRow}>
            <Text className={classes.detailLabel}>Last Updated</Text>
            <Text className={classes.detailValue}>{listing.lastUpdated}</Text>
          </div>
        </div>
      </div>
    </div>
  );
};
