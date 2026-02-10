/**
 * QueryResultCard - Individual insight card within query results
 *
 * Shows: severity-colored left border, icon, title, value, optional action.
 * Supports 5 type variants: metric, person, alert, trend, action.
 */

import * as React from 'react';
import { Text, Button } from '@fluentui/react-components';
import { mergeClasses } from '@fluentui/react-components';
import { useSeverityStyles } from './hubStyles';
import { makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { ResponseInsight } from '../../config/queryIntents';
import { ResultCardPresence } from './hubMotions';

const useCardStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(32, 32, 32, 0.6)',
    },
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },

  icon: {
    fontSize: '18px',
    lineHeight: '18px',
    flexShrink: 0,
  },

  title: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
  },

  value: {
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
    color: tokens.colorNeutralForeground2,
    paddingLeft: '26px', // Align with title after icon
  },

  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: tokens.spacingVerticalXXS,
  },
});

export interface IQueryResultCardProps {
  insight: ResponseInsight;
  onAction?: (insight: ResponseInsight) => void;
}

export const QueryResultCard: React.FC<IQueryResultCardProps> = ({ insight, onAction }) => {
  const cardStyles = useCardStyles();
  const severityStyles = useSeverityStyles();

  const borderClass = React.useMemo(() => {
    switch (insight.urgency) {
      case 'critical': return severityStyles.criticalBorder;
      case 'warning': return severityStyles.warningBorder;
      case 'info': return severityStyles.infoBorder;
      case 'positive': return severityStyles.positiveBorder;
      default: return severityStyles.infoBorder;
    }
  }, [insight.urgency, severityStyles]);

  return (
    <ResultCardPresence visible>
      <div
        className={mergeClasses(cardStyles.root, borderClass)}
        style={{ backdropFilter: 'saturate(180%) blur(16px)' }}
      >
        <div className={cardStyles.header}>
          <span className={cardStyles.icon}>{insight.icon}</span>
          <Text className={cardStyles.title}>{insight.title}</Text>
        </div>
        <Text className={cardStyles.value}>{insight.value}</Text>
        {insight.action && onAction && (
          <div className={cardStyles.actionRow}>
            <Button
              size="small"
              appearance="subtle"
              onClick={() => onAction(insight)}
            >
              {insight.action.label}
            </Button>
          </div>
        )}
      </div>
    </ResultCardPresence>
  );
};
