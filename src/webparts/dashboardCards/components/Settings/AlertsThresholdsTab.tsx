// ============================================
// AlertsThresholdsTab - Tab 3: Per-card intelligence settings
// Shows expandable sections for cards with configurable thresholds
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
  Settings20Regular,
} from '@fluentui/react-icons';
import { CARD_REGISTRY } from '../../config/cardRegistry';
import { CardStatus } from '../../models/CardCatalog';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  header: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalM,
  },
  cardSection: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  cardName: {
    fontWeight: tokens.fontWeightSemibold,
    flex: 1,
  },
  cardBody: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM} ${tokens.spacingVerticalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  placeholder: {
    padding: tokens.spacingVerticalL,
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },
  summary: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalM,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Component
// ============================================

export const AlertsThresholdsTab: React.FC = () => {
  const classes = useStyles();
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());

  // Only show implemented cards (they're the ones with configurable settings)
  const configurableCards = React.useMemo(
    () => CARD_REGISTRY.filter(c => c.status === CardStatus.Implemented),
    []
  );

  const toggleExpand = React.useCallback((cardId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }, []);

  return (
    <div className={classes.container}>
      <Text className={classes.header}>
        Fine-tune how each intelligence card works for you. Only implemented cards with configurable settings are shown.
      </Text>

      {configurableCards.map(card => {
        const isExpanded = expandedCards.has(card.id);
        return (
          <div key={card.id} className={classes.cardSection}>
            <div
              className={classes.cardHeader}
              onClick={() => toggleExpand(card.id)}
              role="button"
              aria-expanded={isExpanded}
              tabIndex={0}
            >
              {isExpanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
              <Settings20Regular />
              <Text className={classes.cardName}>{card.name}</Text>
              <Badge size="small" appearance="tint" color="informative">
                Impact {card.impactRating}
              </Badge>
            </div>
            {isExpanded && (
              <div className={classes.cardBody}>
                <Text className={classes.placeholder}>
                  Per-card threshold settings will be available here when the card&apos;s settings schema is defined.
                  Configure thresholds, data sources, and notification preferences for {card.name}.
                </Text>
              </div>
            )}
          </div>
        );
      })}

      <div className={classes.summary}>
        <Text>{configurableCards.length} cards with configurable settings</Text>
      </div>
    </div>
  );
};

export default AlertsThresholdsTab;
