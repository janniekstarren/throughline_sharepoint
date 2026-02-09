// ============================================
// CardCatalogPanel - Full catalog browser for all 80 cards
// Shows status, impact, tier, pin/hide actions
// Pure CSS panel (not Drawer) to avoid React Error #310
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Badge,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Pin20Regular,
  PinOff20Regular,
  Eye20Regular,
  EyeOff20Regular,
  CheckmarkCircle20Filled,
  Circle20Regular,
  LockClosed20Regular,
} from '@fluentui/react-icons';
import { CARD_REGISTRY } from '../../config/cardRegistry';
import {
  CardRegistration,
  CardCategory,
  CardCategoryMeta,
  CardStatus,
  LicenseTier,
} from '../../models/CardCatalog';
import { useLicense } from '../../context/LicenseContext';
import { useFeatureFlags } from '../../context/FeatureFlagContext';
import { searchCards } from '../../utils/cardSearch';
import { getCardsByCategory, sortCardsImplementedFirst } from '../../utils/cardUtils';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 999998,
  },
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '520px',
    maxWidth: '90vw',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow64,
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: '160px',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
  },
  categoryGroup: {
    marginBottom: tokens.spacingVerticalL,
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} 0`,
    marginBottom: tokens.spacingVerticalXS,
  },
  categoryName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  cardRowHidden: {
    opacity: 0.5,
  },
  statusIcon: {
    flexShrink: 0,
  },
  cardName: {
    flex: 1,
    fontSize: tokens.fontSizeBase200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  impactBadge: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase100,
    minWidth: '24px',
    textAlign: 'center',
  },
  tierLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    minWidth: '36px',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Types
// ============================================

type SortMode = 'category' | 'impact' | 'name' | 'status';

// ============================================
// Props
// ============================================

interface CardCatalogPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  pinnedCardIds: string[];
  hiddenCardIds: string[];
  onTogglePin: (cardId: string) => void;
  onToggleHide: (cardId: string) => void;
  onResetAll?: () => void;
}

// ============================================
// Helper
// ============================================

const TIER_LABELS: Record<LicenseTier, string> = {
  [LicenseTier.Individual]: 'Indv',
  [LicenseTier.Team]: 'Team',
  [LicenseTier.Manager]: 'Mgr',
  [LicenseTier.Leader]: 'Ldr',
};

function getStatusIcon(card: CardRegistration, isLocked: boolean): React.ReactElement {
  if (isLocked) return <LockClosed20Regular style={{ color: 'var(--colorNeutralForeground3)' }} />;
  if (card.status === CardStatus.Implemented) return <CheckmarkCircle20Filled style={{ color: 'var(--colorPaletteGreenForeground1)' }} />;
  return <Circle20Regular style={{ color: 'var(--colorNeutralForeground3)' }} />;
}

function getImpactColor(rating: number): string {
  if (rating >= 9) return 'danger';
  if (rating >= 7) return 'warning';
  if (rating >= 5) return 'important';
  return 'informative';
}

// ============================================
// Component
// ============================================

export const CardCatalogPanel: React.FC<CardCatalogPanelProps> = ({
  isOpen,
  onDismiss,
  pinnedCardIds,
  hiddenCardIds,
  onTogglePin,
  onToggleHide,
  onResetAll,
}) => {
  const classes = useStyles();
  const flags = useFeatureFlags();
  const { isCardAccessible } = useLicense();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortMode, setSortMode] = React.useState<SortMode>('category');

  const pinnedSet = React.useMemo(() => new Set(pinnedCardIds), [pinnedCardIds]);
  const hiddenSet = React.useMemo(() => new Set(hiddenCardIds), [hiddenCardIds]);

  // Build card list
  const cards = React.useMemo(() => {
    let list = [...CARD_REGISTRY];

    // Filter by search
    if (searchQuery.trim()) {
      const results = searchCards(searchQuery, CARD_REGISTRY);
      list = results.map(r => r.card);
    }

    // Sort
    switch (sortMode) {
      case 'impact':
        list.sort((a, b) => b.impactRating - a.impactRating);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'status':
        list.sort((a, b) => {
          const statusOrder = { [CardStatus.Implemented]: 0, [CardStatus.Placeholder]: 1, [CardStatus.Planned]: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
        break;
      default: // category — use getCardsByCategory
        break;
    }

    return list;
  }, [searchQuery, sortMode]);

  // Group by category (only for category sort)
  const groupedCards = React.useMemo(() => {
    if (sortMode !== 'category') return null;
    return getCardsByCategory(cards);
  }, [cards, sortMode]);

  if (!isOpen) return null;

  const renderCardRow = (card: CardRegistration): React.ReactElement => {
    const locked = !isCardAccessible(card.id);
    const isPinned = pinnedSet.has(card.id);
    const isHidden = hiddenSet.has(card.id);

    return (
      <div
        key={card.id}
        className={`${classes.cardRow} ${isHidden ? classes.cardRowHidden : ''}`}
      >
        <span className={classes.statusIcon}>
          {getStatusIcon(card, locked)}
        </span>
        <Text className={classes.cardName} title={card.name}>
          {card.name}
        </Text>
        <Badge
          className={classes.impactBadge}
          appearance="filled"
          color={getImpactColor(card.impactRating) as 'danger' | 'warning' | 'important' | 'informative'}
          size="small"
        >
          {card.impactRating}
        </Badge>
        <Text className={classes.tierLabel}>
          {TIER_LABELS[card.minimumTier]}
        </Text>
        <div className={classes.actions}>
          {flags.allowCardPinning && (
            <Button
              appearance="subtle"
              size="small"
              icon={isPinned ? <PinOff20Regular /> : <Pin20Regular />}
              onClick={() => onTogglePin(card.id)}
              aria-label={isPinned ? 'Unpin' : 'Pin'}
            />
          )}
          {flags.allowCardHiding && (
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
    );
  };

  const totalCount = CARD_REGISTRY.length;
  const accessibleCount = CARD_REGISTRY.filter(c => isCardAccessible(c.id)).length;

  return (
    <>
      <div className={classes.overlay} onClick={onDismiss} />
      <div className={classes.panel}>
        <div className={classes.header}>
          <Text className={classes.title}>Card Catalog</Text>
          <Button
            appearance="subtle"
            icon={<Dismiss24Regular />}
            onClick={onDismiss}
            aria-label="Close"
          />
        </div>

        <div className={classes.toolbar}>
          <input
            className={classes.searchBox}
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: `1px solid var(--colorNeutralStroke1)`,
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '14px',
              background: 'transparent',
              color: 'inherit',
            }}
          />
          <Dropdown
            placeholder="Sort"
            value={sortMode === 'category' ? 'Category' : sortMode === 'impact' ? 'Impact' : sortMode === 'name' ? 'Name' : 'Status'}
            onOptionSelect={(_ev, data) => setSortMode((data.optionValue as SortMode) || 'category')}
            style={{ minWidth: '100px' }}
          >
            <Option value="category">Category</Option>
            <Option value="impact">Impact</Option>
            <Option value="name">Name</Option>
            <Option value="status">Status</Option>
          </Dropdown>
        </div>

        <div className={classes.content}>
          {groupedCards ? (
            // Category-grouped view
            Object.values(CardCategoryMeta)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(catMeta => {
                const catCards = sortCardsImplementedFirst(
                  groupedCards.get(catMeta.id as CardCategory) || []
                );
                if (catCards.length === 0) return null;
                return (
                  <div key={catMeta.id} className={classes.categoryGroup}>
                    <div className={classes.categoryHeader}>
                      <Text className={classes.categoryName}>
                        {catMeta.displayName}
                      </Text>
                      <Badge size="small" appearance="tint" color="informative">
                        {catCards.length}
                      </Badge>
                    </div>
                    {catCards.map(card => renderCardRow(card))}
                  </div>
                );
              })
          ) : (
            // Flat sorted view
            cards.map(card => renderCardRow(card))
          )}
        </div>

        <div className={classes.footer}>
          <Text>
            {totalCount} total &middot; {accessibleCount} accessible &middot;{' '}
            {pinnedCardIds.length} pinned &middot; {hiddenCardIds.length} hidden
          </Text>
          {onResetAll && (
            <Button appearance="subtle" size="small" onClick={onResetAll}>
              Reset All
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default CardCatalogPanel;
