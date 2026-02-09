// ============================================
// CategoriesTab - Tab 2: Category manager
// Draggable category rows with card previews
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
} from '@fluentui/react-components';
import {
  ChevronRight20Regular,
  ChevronDown20Regular,
  ReOrderDotsVertical20Regular,
} from '@fluentui/react-icons';
import { CARD_REGISTRY } from '../../config/cardRegistry';
import {
  CardCategory,
  CardCategoryMeta,
  CardStatus,
} from '../../models/CardCatalog';
import { useLicense } from '../../context/LicenseContext';
import { getCardsByCategory, sortCardsImplementedFirst } from '../../utils/cardUtils';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  instructions: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalM,
  },
  categoryRow: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  dragHandle: {
    cursor: 'grab',
    color: tokens.colorNeutralForeground3,
  },
  categoryName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    flex: 1,
  },
  stats: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  cardPreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM} ${tokens.spacingVerticalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  miniCard: {
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalXS}`,
    borderRadius: tokens.borderRadiusSmall,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    fontSize: tokens.fontSizeBase100,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  miniCardLocked: {
    opacity: 0.5,
    borderTopStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
  },
});

// ============================================
// Component
// ============================================

export const CategoriesTab: React.FC = () => {
  const classes = useStyles();
  const { isCardAccessible } = useLicense();
  const [expandedCats, setExpandedCats] = React.useState<Set<string>>(new Set());

  const grouped = React.useMemo(() => getCardsByCategory(CARD_REGISTRY), []);

  const toggleExpand = React.useCallback((catId: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }, []);

  return (
    <div className={classes.container}>
      <Text className={classes.instructions}>
        Click a category to expand and see cards. Drag to reorder.
      </Text>

      {Object.values(CardCategoryMeta)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(catMeta => {
          const catCards = sortCardsImplementedFirst(
            grouped.get(catMeta.id as CardCategory) || []
          );
          if (catCards.length === 0) return null;

          const isExpanded = expandedCats.has(catMeta.id);
          const implementedCount = catCards.filter(c => c.status === CardStatus.Implemented).length;
          const lockedCount = catCards.filter(c => !isCardAccessible(c.id)).length;
          const avgImpact = catCards.length > 0
            ? (catCards.reduce((sum, c) => sum + c.impactRating, 0) / catCards.length).toFixed(1)
            : '0';

          return (
            <div key={catMeta.id} className={classes.categoryRow}>
              <div
                className={classes.categoryHeader}
                onClick={() => toggleExpand(catMeta.id)}
                role="button"
                aria-expanded={isExpanded}
                tabIndex={0}
              >
                <ReOrderDotsVertical20Regular className={classes.dragHandle} />
                {isExpanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
                <Text className={classes.categoryName}>
                  {catMeta.displayName}
                </Text>
                <div className={classes.stats}>
                  <Badge size="small" appearance="tint">
                    {catCards.length} cards
                  </Badge>
                  <Text>{implementedCount} implemented</Text>
                  {lockedCount > 0 && (
                    <Text>{lockedCount} locked</Text>
                  )}
                  <Text>Avg impact: {avgImpact}</Text>
                </div>
              </div>
              {isExpanded && (
                <div className={classes.cardPreview}>
                  {catCards.map(card => {
                    const locked = !isCardAccessible(card.id);
                    return (
                      <div
                        key={card.id}
                        className={`${classes.miniCard} ${locked ? classes.miniCardLocked : ''}`}
                        title={`${card.name} (Impact: ${card.impactRating})`}
                      >
                        {card.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default CategoriesTab;
