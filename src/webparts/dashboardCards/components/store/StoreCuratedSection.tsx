// ============================================
// StoreCuratedSection — Horizontal scrolling card row
// "Most Popular", "Recently Added", "Premium Intelligence", etc.
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
} from '@fluentui/react-components';
import {
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from '@fluentui/react-icons';
import { CardRegistration } from '../../models/CardCatalog';
import { CardStoreListing } from '../../models/CardStore';
import { CardEntitlement } from '../../models/CardEntitlement';
import { StoreCardTile } from './StoreCardTile';
import { LicenseTier } from '../../models/CardCatalog';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalL,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  scrollContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  scrollTrack: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    overflowX: 'auto',
    scrollBehavior: 'smooth',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none',
    },
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
  },
  scrollItem: {
    flexShrink: 0,
    width: '320px',
  },
  arrowButton: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow8,
    borderRadius: '50%',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  arrowLeft: {
    left: '-12px',
  },
  arrowRight: {
    right: '-12px',
  },
});

// ============================================
// Props
// ============================================

interface StoreCuratedSectionProps {
  title: string;
  emoji?: string;
  cards: CardRegistration[];
  listings: Record<string, CardStoreListing>;
  entitlementMap: Map<string, CardEntitlement>;
  currentTier?: LicenseTier;
  onCardClick: (cardId: string) => void;
  onStartTrial?: (cardId: string) => void;
  onPurchase?: (cardId: string) => void;
  onViewAll?: () => void;
}

// ============================================
// Component
// ============================================

export const StoreCuratedSection: React.FC<StoreCuratedSectionProps> = ({
  title,
  emoji,
  cards,
  listings,
  entitlementMap,
  currentTier,
  onCardClick,
  onStartTrial,
  onPurchase,
  onViewAll,
}) => {
  const classes = useStyles();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);

  // Check scroll position to show/hide arrows
  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      return () => el.removeEventListener('scroll', checkScroll);
    }
    return undefined;
  }, [checkScroll, cards.length]);

  const scrollLeft = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  }, []);

  if (cards.length === 0) return null;

  return (
    <div className={classes.section}>
      <div className={classes.header}>
        <div className={classes.title}>
          {emoji && <span style={{ fontSize: '20px' }}>{emoji}</span>}
          <Text weight="semibold" size={400}>{title}</Text>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            {cards.length} cards
          </Text>
        </div>
        {onViewAll && (
          <Button appearance="subtle" size="small" onClick={onViewAll}>
            View all
          </Button>
        )}
      </div>

      <div className={classes.scrollContainer}>
        {showLeftArrow && (
          <Button
            appearance="subtle"
            icon={<ChevronLeft20Regular />}
            size="small"
            className={`${classes.arrowButton} ${classes.arrowLeft}`}
            onClick={scrollLeft}
            aria-label="Scroll left"
          />
        )}

        <div ref={scrollRef} className={classes.scrollTrack}>
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
              <div key={card.id} className={classes.scrollItem}>
                <StoreCardTile
                  card={card}
                  listing={listing}
                  entitlement={entitlement}
                  currentTier={currentTier}
                  onClick={onCardClick}
                  onStartTrial={onStartTrial}
                  onPurchase={onPurchase}
                />
              </div>
            );
          })}
        </div>

        {showRightArrow && (
          <Button
            appearance="subtle"
            icon={<ChevronRight20Regular />}
            size="small"
            className={`${classes.arrowButton} ${classes.arrowRight}`}
            onClick={scrollRight}
            aria-label="Scroll right"
          />
        )}
      </div>
    </div>
  );
};
