// ============================================
// StoreSearchResults — Filtered grid view with result count
// Used when user searches or filters by category
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
} from '@fluentui/react-components';
import { CardRegistration } from '../../models/CardCatalog';
import { CardStoreListing } from '../../models/CardStore';
import { CardEntitlement } from '../../models/CardEntitlement';
import { StoreCardTile } from './StoreCardTile';
import { LicenseTier } from '../../models/CardCatalog';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: tokens.spacingVerticalS,
  },
  resultCount: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacingVerticalXXXL} 0`,
    gap: tokens.spacingVerticalM,
  },
  emptyEmoji: {
    fontSize: '48px',
  },
});

// ============================================
// Props
// ============================================

interface StoreSearchResultsProps {
  cards: CardRegistration[];
  listings: Record<string, CardStoreListing>;
  entitlementMap: Map<string, CardEntitlement>;
  currentTier?: LicenseTier;
  title?: string;
  onCardClick: (cardId: string) => void;
  onStartTrial?: (cardId: string) => void;
  onPurchase?: (cardId: string) => void;
}

// ============================================
// Component
// ============================================

export const StoreSearchResults: React.FC<StoreSearchResultsProps> = ({
  cards,
  listings,
  entitlementMap,
  currentTier,
  title,
  onCardClick,
  onStartTrial,
  onPurchase,
}) => {
  const classes = useStyles();

  if (cards.length === 0) {
    return (
      <div className={classes.empty}>
        <span className={classes.emptyEmoji}>🔍</span>
        <Text size={400} weight="semibold">No cards found</Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          Try a different search term or category
        </Text>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        {title && <Text weight="semibold" size={400}>{title}</Text>}
        <Text className={classes.resultCount}>
          {cards.length} card{cards.length !== 1 ? 's' : ''}
        </Text>
      </div>
      <div className={classes.grid}>
        {cards.map(card => {
          const listing = listings[card.id];
          if (!listing) return null;
          const entitlement = entitlementMap.get(card.id) ?? {
            cardId: card.id,
            entitled: false,
            source: null,
            expiresAt: null,
            trialDaysRemaining: null,
          };
          return (
            <StoreCardTile
              key={card.id}
              card={card}
              listing={listing}
              entitlement={entitlement}
              currentTier={currentTier}
              onClick={onCardClick}
              onStartTrial={onStartTrial}
              onPurchase={onPurchase}
            />
          );
        })}
      </div>
    </div>
  );
};
