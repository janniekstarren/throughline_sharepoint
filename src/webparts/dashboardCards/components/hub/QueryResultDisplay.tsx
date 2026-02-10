/**
 * QueryResultDisplay - Shared result renderer for Hub & Floating Dialog
 *
 * Extracts render logic from QueryResults.tsx, adding a compact prop
 * for the floating dialog. Reuses QueryResultCard, QuerySourceCards,
 * FollowUpChips. compact mode = tighter padding, single-column grid.
 */

import * as React from 'react';
import { Button, Text, makeStyles, tokens, shorthands, mergeClasses } from '@fluentui/react-components';
import { Dismiss20Regular } from '@fluentui/react-icons';
import { ResultsPresence } from './hubMotions';
import { QueryResponse } from '../../config/queryIntents';
import { QueryResultCard } from './QueryResultCard';
import { QuerySourceCards } from './QuerySourceCards';
import { FollowUpChips } from './FollowUpChips';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    ...shorthands.padding(tokens.spacingVerticalM, 0),
  },

  rootCompact: {
    gap: tokens.spacingVerticalS,
    ...shorthands.padding(tokens.spacingVerticalS, 0),
  },

  summary: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },

  summaryCompact: {
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: tokens.spacingHorizontalS,
  },

  gridCompact: {
    gridTemplateColumns: '1fr',
    gap: tokens.spacingHorizontalXS,
  },

  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: tokens.spacingVerticalXS,
  },
});

// ============================================
// Props
// ============================================

export interface IQueryResultDisplayProps {
  /** Query response to display */
  results: QueryResponse;
  /** Callback when a follow-up question is clicked */
  onFollowUp: (query: string) => void;
  /** Callback to dismiss/clear results */
  onDismiss: () => void;
  /** Optional callback when a source card is clicked */
  onSourceCardClick?: (cardId: string) => void;
  /** Compact mode for floating dialog (tighter spacing, single column) */
  compact?: boolean;
}

// ============================================
// Component
// ============================================

export const QueryResultDisplay: React.FC<IQueryResultDisplayProps> = ({
  results,
  onFollowUp,
  onDismiss,
  onSourceCardClick,
  compact = false,
}) => {
  const styles = useStyles();

  const handleSourceClick = React.useCallback(
    (cardId: string) => {
      if (onSourceCardClick) {
        onSourceCardClick(cardId);
      } else {
        // Default: scroll to the card in the dashboard
        const element = document.getElementById(cardId);
        if (element) {
          const rect = element.getBoundingClientRect();
          window.scrollTo({
            top: window.scrollY + rect.top - 120,
            behavior: 'smooth',
          });
        }
      }
    },
    [onSourceCardClick]
  );

  return (
    <ResultsPresence visible>
      <div className={mergeClasses(styles.root, compact && styles.rootCompact)}>
        {/* Summary */}
        <Text className={mergeClasses(styles.summary, compact && styles.summaryCompact)}>
          {results.summary}
        </Text>

        {/* Insight cards grid */}
        {results.insights.length > 0 && (
          <div className={mergeClasses(styles.grid, compact && styles.gridCompact)}>
            {results.insights.map((insight) => (
              <QueryResultCard
                key={insight.id}
                insight={insight}
                onAction={() => {
                  if (insight.cardId) {
                    handleSourceClick(insight.cardId);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Source cards */}
        {!compact && (
          <QuerySourceCards
            sourceCards={results.sourceCards}
            onSourceClick={handleSourceClick}
          />
        )}

        {/* Follow-up chips */}
        <FollowUpChips
          followUps={results.suggestedFollowUps}
          onFollowUp={onFollowUp}
        />

        {/* Dismiss button */}
        <div className={styles.actionsRow}>
          <Button
            size="small"
            appearance="subtle"
            icon={<Dismiss20Regular />}
            onClick={onDismiss}
          >
            {compact ? 'Clear' : 'Dismiss'}
          </Button>
        </div>
      </div>
    </ResultsPresence>
  );
};
