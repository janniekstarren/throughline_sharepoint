// ============================================
// StoreTierDetail — Tier detail page
// Shows tier info, featured cards, all included cards, comparison table
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
import {
  Checkmark20Regular,
  Dismiss20Regular,
} from '@fluentui/react-icons';
import { LicenseTier, LicenseTierMeta } from '../../models/CardCatalog';
import { CARD_REGISTRY } from '../../config/cardRegistry';
import { getTierStoreListing } from '../../config/tierStoreListings';
import { getStoreListing } from '../../config/storeListings';
import { isCardAccessibleAtTier } from '../../models/CardCatalog';
import { useLicense } from '../../context/LicenseContext';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXL,
    maxWidth: '1200px',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingVerticalXL,
    borderRadius: tokens.borderRadiusXLarge,
    color: 'white',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  heroName: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
  },
  heroPrice: {
    fontSize: tokens.fontSizeBase500,
    opacity: 0.9,
  },
  heroHeadline: {
    fontSize: tokens.fontSizeBase300,
    opacity: 0.8,
    maxWidth: '500px',
  },
  heroStats: {
    display: 'flex',
    gap: tokens.spacingHorizontalXL,
    textAlign: 'center',
  },
  statBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  statValue: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
  },
  statLabel: {
    fontSize: tokens.fontSizeBase200,
    opacity: 0.7,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  featuredCard: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
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
    cursor: 'pointer',
    ':hover': {
      boxShadow: tokens.shadow4,
    },
  },
  comparisonTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
    textAlign: 'center',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    fontWeight: tokens.fontWeightBold as never,
    fontSize: tokens.fontSizeBase300,
  },
  tableCell: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    textAlign: 'center',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    fontSize: tokens.fontSizeBase200,
  },
  tableCellLeft: {
    textAlign: 'left',
    fontWeight: tokens.fontWeightSemibold as never,
  },
  currentColumn: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
});

// ============================================
// Tier Gradient colours
// ============================================

const TIER_GRADIENTS: Record<string, string> = {
  [LicenseTier.Individual]: 'linear-gradient(135deg, #006B6B 0%, #00A5A5 100%)',
  [LicenseTier.Team]: 'linear-gradient(135deg, #1E3A5F 0%, #4A8BC2 100%)',
  [LicenseTier.Manager]: 'linear-gradient(135deg, #5F4B1E 0%, #C2A44A 100%)',
  [LicenseTier.Leader]: 'linear-gradient(135deg, #4A1942 0%, #9B59B6 100%)',
};

// ============================================
// Props
// ============================================

interface StoreTierDetailProps {
  tierId: LicenseTier;
  onCardClick: (cardId: string) => void;
}

// ============================================
// Component
// ============================================

export const StoreTierDetail: React.FC<StoreTierDetailProps> = ({
  tierId,
  onCardClick,
}) => {
  const classes = useStyles();
  const { currentTier } = useLicense();
  const tierListing = getTierStoreListing(tierId);
  const tierMeta = LicenseTierMeta[tierId];

  if (!tierListing) {
    return <Text>Tier not found</Text>;
  }

  // All cards included at this tier
  const includedCards = CARD_REGISTRY.filter(c => isCardAccessibleAtTier(c, tierId));

  // Featured cards
  const featuredCards = tierListing.featuredCardIds
    .map(id => CARD_REGISTRY.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== null && c !== undefined);

  const isCurrentTier = currentTier === tierId;
  const isUpgrade = LicenseTierMeta[currentTier].sortOrder < tierMeta.sortOrder;

  return (
    <div className={classes.container}>
      {/* Hero Banner */}
      <div
        className={classes.hero}
        style={{ background: TIER_GRADIENTS[tierId] || TIER_GRADIENTS[LicenseTier.Team] }}
      >
        <div className={classes.heroContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Text className={classes.heroName}>{tierMeta.displayName}</Text>
            {isCurrentTier && <Badge appearance="filled" color="informative">Current Plan</Badge>}
          </div>
          <Text className={classes.heroPrice}>{tierMeta.price}</Text>
          <Text className={classes.heroHeadline}>{tierListing.headline}</Text>
          {!isCurrentTier && (
            <div style={{ marginTop: '12px' }}>
              <Button appearance="primary" size="large">
                {isUpgrade ? 'Upgrade to ' : 'Switch to '}{tierMeta.displayName}
              </Button>
            </div>
          )}
        </div>
        <div className={classes.heroStats}>
          <div className={classes.statBlock}>
            <Text className={classes.statValue}>{tierListing.includedCardCount}</Text>
            <Text className={classes.statLabel}>Cards</Text>
          </div>
          <div className={classes.statBlock}>
            <Text className={classes.statValue}>{tierListing.savingsVsAlaCarte}%</Text>
            <Text className={classes.statLabel}>Savings</Text>
          </div>
        </div>
      </div>

      {/* Featured Cards */}
      <div className={classes.section}>
        <Text className={classes.sectionTitle}>Featured Cards</Text>
        <div className={classes.featuredGrid}>
          {featuredCards.map(card => {
            const listing = getStoreListing(card.id);
            return (
              <div
                key={card.id}
                className={classes.featuredCard}
                onClick={() => onCardClick(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onCardClick(card.id); }}
              >
                <span style={{ fontSize: '24px' }}>{listing.iconEmoji}</span>
                <div>
                  <Text weight="semibold" size={200}>{card.name}</Text>
                  <div>
                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                      {listing.headline.slice(0, 60)}...
                    </Text>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Divider />

      {/* Tier Comparison Table */}
      <div className={classes.section}>
        <Text className={classes.sectionTitle}>Tier Comparison</Text>
        <table className={classes.comparisonTable}>
          <thead>
            <tr>
              <th className={`${classes.tableHeader} ${classes.tableCellLeft}`}>Feature</th>
              {Object.values(LicenseTier).map(tier => (
                <th
                  key={tier}
                  className={`${classes.tableHeader} ${currentTier === tier ? classes.currentColumn : ''}`}
                >
                  {LicenseTierMeta[tier].displayName}
                  {currentTier === tier && ' ✓'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${classes.tableCell} ${classes.tableCellLeft}`}>Price</td>
              {Object.values(LicenseTier).map(tier => (
                <td key={tier} className={`${classes.tableCell} ${currentTier === tier ? classes.currentColumn : ''}`}>
                  {LicenseTierMeta[tier].price}
                </td>
              ))}
            </tr>
            <tr>
              <td className={`${classes.tableCell} ${classes.tableCellLeft}`}>Cards Included</td>
              {Object.values(LicenseTier).map(tier => {
                const tl = getTierStoreListing(tier);
                return (
                  <td key={tier} className={`${classes.tableCell} ${currentTier === tier ? classes.currentColumn : ''}`}>
                    {tl?.includedCardCount ?? (tier === LicenseTier.Individual ? '10' : '—')}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className={`${classes.tableCell} ${classes.tableCellLeft}`}>Manager Toolkit</td>
              {Object.values(LicenseTier).map(tier => (
                <td key={tier} className={`${classes.tableCell} ${currentTier === tier ? classes.currentColumn : ''}`}>
                  {LicenseTierMeta[tier].includesManagerToolkit
                    ? <Checkmark20Regular style={{ color: tokens.colorPaletteGreenForeground1 }} />
                    : <Dismiss20Regular style={{ color: tokens.colorNeutralForeground4 }} />}
                </td>
              ))}
            </tr>
            <tr>
              <td className={`${classes.tableCell} ${classes.tableCellLeft}`}>Org-Level Intelligence</td>
              {Object.values(LicenseTier).map(tier => (
                <td key={tier} className={`${classes.tableCell} ${currentTier === tier ? classes.currentColumn : ''}`}>
                  {LicenseTierMeta[tier].includesOrgLevel
                    ? <Checkmark20Regular style={{ color: tokens.colorPaletteGreenForeground1 }} />
                    : <Dismiss20Regular style={{ color: tokens.colorNeutralForeground4 }} />}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <Divider />

      {/* All Included Cards */}
      <div className={classes.section}>
        <Text className={classes.sectionTitle}>
          All {includedCards.length} Included Cards
        </Text>
        <div className={classes.featuredGrid}>
          {includedCards.slice(0, 20).map(card => {
            const listing = getStoreListing(card.id);
            return (
              <div
                key={card.id}
                className={classes.featuredCard}
                onClick={() => onCardClick(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onCardClick(card.id); }}
              >
                <span style={{ fontSize: '20px' }}>{listing.iconEmoji}</span>
                <Text size={200} weight="semibold">{card.name}</Text>
              </div>
            );
          })}
          {includedCards.length > 20 && (
            <div className={classes.featuredCard} style={{ justifyContent: 'center' }}>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                +{includedCards.length - 20} more
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
