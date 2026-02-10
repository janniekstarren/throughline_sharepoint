// ============================================
// StoreHero — Featured card carousel for the store
// Shows 5 staff picks with auto-rotate, click → detail
// ============================================

import * as React from 'react';
import {
  makeStyles,
  mergeClasses,
  tokens,
  Text,
  Button,
} from '@fluentui/react-components';
import {
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from '@fluentui/react-icons';
import { CARD_REGISTRY } from '../../config/cardRegistry';
import { STORE_LISTINGS, getStoreListing } from '../../config/storeListings';
import { RatingStars } from './RatingStars';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  hero: {
    position: 'relative',
    borderRadius: tokens.borderRadiusXLarge,
    overflow: 'hidden',
    marginBottom: tokens.spacingVerticalL,
    height: '180px',
    cursor: 'pointer',
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${tokens.spacingHorizontalXXL}`,
    gap: tokens.spacingHorizontalXL,
    transitionProperty: 'opacity, transform',
    transitionDuration: tokens.durationSlower,
    transitionTimingFunction: tokens.curveDecelerateMid,
    opacity: 0,
    transform: 'translateX(20px)',
    pointerEvents: 'none',
  },
  slideActive: {
    opacity: 1,
    transform: 'translateX(0)',
    pointerEvents: 'auto',
  },
  emoji: {
    fontSize: '64px',
    lineHeight: '1',
    flexShrink: 0,
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightBold,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    opacity: 0.8,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    lineHeight: tokens.lineHeightBase500,
    color: 'inherit',
  },
  headline: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    opacity: 0.85,
    maxWidth: '600px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rating: {
    marginTop: tokens.spacingVerticalXXS,
  },
  nav: {
    position: 'absolute',
    bottom: tokens.spacingVerticalM,
    right: tokens.spacingHorizontalXL,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  dots: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    transitionProperty: 'background-color, transform',
    transitionDuration: tokens.durationFast,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  dotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: 'scale(1.25)',
  },
  arrowButton: {
    color: 'rgba(255, 255, 255, 0.8)',
    ':hover': {
      color: 'rgba(255, 255, 255, 1)',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
});

// ============================================
// Slide gradient colours keyed by accent colour
// ============================================

const SLIDE_GRADIENTS = [
  'linear-gradient(135deg, #1E3A5F 0%, #2C5F8A 50%, #4A8BC2 100%)',
  'linear-gradient(135deg, #4A1942 0%, #6B2FA0 50%, #9B59B6 100%)',
  'linear-gradient(135deg, #1A4332 0%, #2E7D5E 50%, #48C78E 100%)',
  'linear-gradient(135deg, #5F1E1E 0%, #8A2C2C 50%, #C24A4A 100%)',
  'linear-gradient(135deg, #3D3D00 0%, #6B6B00 50%, #D4AF37 100%)',
];

// ============================================
// Get staff picks (5 featured cards)
// ============================================

function getStaffPicks(): Array<{ cardId: string; card: typeof CARD_REGISTRY[0]; listing: ReturnType<typeof getStoreListing> }> {
  const staffPickIds = Object.entries(STORE_LISTINGS)
    .filter(([_, listing]) => listing.isStaffPick)
    .sort((a, b) => (a[1].popularityRank || 99) - (b[1].popularityRank || 99))
    .slice(0, 5)
    .map(([id]) => id);

  return staffPickIds
    .map(id => {
      const card = CARD_REGISTRY.find(c => c.id === id);
      if (!card) return null;
      return { cardId: id, card, listing: getStoreListing(id) };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

// ============================================
// Props
// ============================================

interface StoreHeroProps {
  onCardClick: (cardId: string) => void;
}

// ============================================
// Component
// ============================================

export const StoreHero: React.FC<StoreHeroProps> = ({ onCardClick }) => {
  const classes = useStyles();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const staffPicks = React.useMemo(() => getStaffPicks(), []);

  // Auto-rotate every 5 seconds
  React.useEffect(() => {
    if (staffPicks.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % staffPicks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [staffPicks.length]);

  const handlePrev = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(prev => (prev - 1 + staffPicks.length) % staffPicks.length);
  }, [staffPicks.length]);

  const handleNext = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(prev => (prev + 1) % staffPicks.length);
  }, [staffPicks.length]);

  if (staffPicks.length === 0) return null;

  return (
    <div className={classes.hero}>
      {staffPicks.map((pick, index) => (
        <div
          key={pick.cardId}
          className={mergeClasses(
            classes.slide,
            index === activeIndex ? classes.slideActive : undefined,
          )}
          style={{
            background: SLIDE_GRADIENTS[index % SLIDE_GRADIENTS.length],
            color: 'white',
          }}
          onClick={() => onCardClick(pick.cardId)}
        >
          <span className={classes.emoji}>{pick.listing.iconEmoji}</span>
          <div className={classes.content}>
            <Text className={classes.label}>⭐ Staff Pick</Text>
            <Text className={classes.title}>{pick.card.name}</Text>
            <Text className={classes.headline}>{pick.listing.headline}</Text>
            <div className={classes.rating}>
              <RatingStars rating={pick.listing.rating} count={pick.listing.ratingCount} />
            </div>
          </div>
        </div>
      ))}

      {/* Navigation */}
      <div className={classes.nav}>
        <Button
          appearance="transparent"
          icon={<ChevronLeft20Regular />}
          size="small"
          className={classes.arrowButton}
          onClick={handlePrev}
          aria-label="Previous"
        />
        <div className={classes.dots}>
          {staffPicks.map((_, index) => (
            <button
              key={index}
              className={mergeClasses(
                classes.dot,
                index === activeIndex ? classes.dotActive : undefined,
              )}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <Button
          appearance="transparent"
          icon={<ChevronRight20Regular />}
          size="small"
          className={classes.arrowButton}
          onClick={handleNext}
          aria-label="Next"
        />
      </div>
    </div>
  );
};
