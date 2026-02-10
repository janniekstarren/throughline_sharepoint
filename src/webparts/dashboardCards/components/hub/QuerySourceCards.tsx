/**
 * QuerySourceCards - "Based on" source card references
 *
 * Shows which intelligence cards contributed to the query response.
 */

import * as React from 'react';
import { Badge, Text } from '@fluentui/react-components';
import { useResultsStyles } from './hubStyles';
import { SourceCardRef } from '../../config/queryIntents';
import { SourceCardEnter } from './hubMotions';
import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

const useSourceStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationNormal,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },

  cardName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground1,
  },

  contribution: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
});

export interface IQuerySourceCardsProps {
  sourceCards: SourceCardRef[];
  onSourceClick?: (cardId: string) => void;
}

export const QuerySourceCards: React.FC<IQuerySourceCardsProps> = ({
  sourceCards,
  onSourceClick,
}) => {
  const resultStyles = useResultsStyles();
  const sourceStyles = useSourceStyles();

  if (!sourceCards || sourceCards.length === 0) return null;

  return (
    <div className={resultStyles.sourceSection}>
      <Text className={resultStyles.sourceSectionTitle}>Based on</Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {sourceCards.map((source, index) => (
          <SourceCardEnter key={index} visible>
            <div
              className={sourceStyles.card}
              onClick={() => onSourceClick?.(source.cardId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSourceClick?.(source.cardId)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Text className={sourceStyles.cardName}>{source.cardName}</Text>
                <Badge appearance="outline" size="small" shape="rounded">{source.category}</Badge>
              </div>
              <Text className={sourceStyles.contribution}>{source.contribution}</Text>
            </div>
          </SourceCardEnter>
        ))}
      </div>
    </div>
  );
};
