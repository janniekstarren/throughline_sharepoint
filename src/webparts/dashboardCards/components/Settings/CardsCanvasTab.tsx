// ============================================
// CardsCanvasTab - Tab 1: Visual grid manager
// Shows mini card tiles grouped by category with pin/hide actions
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Button,
  SearchBox,
} from '@fluentui/react-components';
import {
  Pin20Regular,
  PinOff20Regular,
  Eye20Regular,
  EyeOff20Regular,
  CheckmarkCircle16Filled,
  Circle16Regular,
  LockClosed16Regular,
} from '@fluentui/react-icons';
import { CARD_REGISTRY } from '../../config/cardRegistry';
import {
  CardRegistration,
  CardCategory,
  CardCategoryMeta,
  CardStatus,
  LicenseTier,
} from '../../models/CardCatalog';
import { FeatureFlags } from '../../context/FeatureFlagContext';
import { useLicense } from '../../context/LicenseContext';
import { getCardsByCategory, sortCardsImplementedFirst } from '../../utils/cardUtils';
import { searchCards } from '../../utils/cardSearch';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  search: {
    minWidth: '240px',
  },
  statusBar: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginLeft: 'auto',
  },
  categoryGroup: {
    marginBottom: tokens.spacingVerticalL,
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
  },
  categoryName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: tokens.spacingHorizontalS,
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: tokens.durationFast,
    ':hover': {
      boxShadow: tokens.shadow4,
      borderTopColor: tokens.colorNeutralStroke1Hover,
      borderRightColor: tokens.colorNeutralStroke1Hover,
      borderBottomColor: tokens.colorNeutralStroke1Hover,
      borderLeftColor: tokens.colorNeutralStroke1Hover,
    },
    position: 'relative',
  },
  tileHidden: {
    opacity: 0.5,
    borderTopStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
  },
  tileLocked: {
    opacity: 0.6,
  },
  tilePinned: {
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderLeftColor: tokens.colorPaletteYellowBorder1,
  },
  tileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  tileName: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  tileFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalXS,
  },
  tileActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXXS,
  },
  pinnedSection: {
    marginBottom: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
});

// ============================================
// Props
// ============================================

interface CardsCanvasTabProps {
  permissions: FeatureFlags;
  pinnedCardIds: string[];
  hiddenCardIds: string[];
  onTogglePin: (cardId: string) => void;
  onToggleHide: (cardId: string) => void;
  currentTier: LicenseTier;
}

// ============================================
// Component
// ============================================

export const CardsCanvasTab: React.FC<CardsCanvasTabProps> = ({
  permissions,
  pinnedCardIds,
  hiddenCardIds,
  onTogglePin,
  onToggleHide,
  currentTier,
}) => {
  const classes = useStyles();
  const { isCardAccessible } = useLicense();
  const [searchQuery, setSearchQuery] = React.useState('');

  const pinnedSet = React.useMemo(() => new Set(pinnedCardIds), [pinnedCardIds]);
  const hiddenSet = React.useMemo(() => new Set(hiddenCardIds), [hiddenCardIds]);

  // Filter cards
  const filteredCards = React.useMemo(() => {
    if (searchQuery.trim()) {
      return searchCards(searchQuery, CARD_REGISTRY).map(r => r.card);
    }
    return CARD_REGISTRY;
  }, [searchQuery]);

  // Group by category
  const grouped = React.useMemo(() => getCardsByCategory(filteredCards), [filteredCards]);

  // Pinned cards
  const pinnedCards = React.useMemo(
    () => filteredCards.filter(c => pinnedSet.has(c.id)),
    [filteredCards, pinnedSet]
  );

  const renderTile = (card: CardRegistration): React.ReactElement => {
    const locked = !isCardAccessible(card.id);
    const isPinned = pinnedSet.has(card.id);
    const isHidden = hiddenSet.has(card.id);

    const tileClasses = [
      classes.tile,
      isHidden && classes.tileHidden,
      locked && classes.tileLocked,
      isPinned && classes.tilePinned,
    ].filter(Boolean).join(' ');

    const statusIcon = locked
      ? <LockClosed16Regular />
      : card.status === CardStatus.Implemented
        ? <CheckmarkCircle16Filled style={{ color: 'var(--colorPaletteGreenForeground1)' }} />
        : <Circle16Regular />;

    return (
      <div key={card.id} className={tileClasses}>
        <div className={classes.tileHeader}>
          {statusIcon}
          <Text className={classes.tileName} title={card.name}>
            {card.name}
          </Text>
        </div>
        <div className={classes.tileFooter}>
          <Badge size="small" appearance="tint" color="informative">
            {card.impactRating}
          </Badge>
          <div className={classes.tileActions}>
            {permissions.allowCardPinning && (
              <Button
                appearance="subtle"
                size="small"
                icon={isPinned ? <PinOff20Regular /> : <Pin20Regular />}
                onClick={() => onTogglePin(card.id)}
                aria-label={isPinned ? 'Unpin' : 'Pin'}
              />
            )}
            {permissions.allowCardHiding && (
              <Button
                appearance="subtle"
                size="small"
                icon={isHidden ? <Eye20Regular /> : <EyeOff20Regular />}
                onClick={() => onToggleHide(card.id)}
                aria-label={isHidden ? 'Show' : 'Hide'}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={classes.toolbar}>
        <SearchBox
          className={classes.search}
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(_ev, data) => setSearchQuery(data.value || '')}
          size="medium"
        />
        <Text className={classes.statusBar}>
          {filteredCards.length} cards &middot; {pinnedCardIds.length} pinned &middot; {hiddenCardIds.length} hidden
        </Text>
      </div>

      {/* Pinned section */}
      {pinnedCards.length > 0 && (
        <div className={classes.pinnedSection}>
          <div className={classes.categoryHeader}>
            <Text className={classes.categoryName}>Pinned</Text>
            <Badge size="small" appearance="tint">{pinnedCards.length}</Badge>
          </div>
          <div className={classes.grid}>
            {pinnedCards.map(card => renderTile(card))}
          </div>
        </div>
      )}

      {/* Category groups */}
      {Object.values(CardCategoryMeta)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(catMeta => {
          const catCards = sortCardsImplementedFirst(
            grouped.get(catMeta.id as CardCategory) || []
          );
          if (catCards.length === 0) return null;
          return (
            <div key={catMeta.id} className={classes.categoryGroup}>
              <div className={classes.categoryHeader}>
                <Text className={classes.categoryName}>{catMeta.displayName}</Text>
                <Badge size="small" appearance="tint" color="informative">
                  {catCards.length}
                </Badge>
              </div>
              <div className={classes.grid}>
                {catCards.map(card => renderTile(card))}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default CardsCanvasTab;
