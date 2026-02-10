/**
 * HubInsightsGrid - Full-width expandable 3-column insights grid
 *
 * Replaces InsightsRollup. Toggle button with ChartMultiple icon +
 * "Insights" + severity dot counts + ChevronDown/Up. Collapsed by default.
 * Expanded: full-width 3-column grid of HubInsightCards.
 * Footer: "{N} signals from {N} cards" + ArrowSync refresh.
 */

import * as React from 'react';
import { Button, Text, Tooltip, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import {
  ChartMultiple20Regular,
  ChevronDown20Regular,
  ChevronUp20Regular,
  ArrowSync20Regular,
} from '@fluentui/react-icons';
import { Collapse } from '@fluentui/react-motion-components-preview';
import { AggregatedInsight, InsightsSummary } from '../../models/InsightRollup';
import { HubInsightCard } from './HubInsightCard';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    width: '100%',
  },

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
  },

  toggleButton: {
    gap: tokens.spacingHorizontalXS,
  },

  severityDots: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },

  dot: {
    width: '8px',
    height: '8px',
    ...shorthands.borderRadius('50%'),
    display: 'inline-block',
  },

  dotCritical: { backgroundColor: tokens.colorPaletteRedForeground1 },
  dotWarning: { backgroundColor: tokens.colorPaletteMarigoldForeground1 },
  dotInfo: { backgroundColor: tokens.colorPaletteBlueForeground2 },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 900px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: tokens.spacingVerticalS,
    borderTopColor: tokens.colorNeutralStroke2,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
  },

  footerText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Props
// ============================================

export interface IHubInsightsGridProps {
  insights: AggregatedInsight[];
  summary: InsightsSummary;
  onRefresh: () => void;
  lastUpdated: Date;
}

// ============================================
// Component
// ============================================

export const HubInsightsGrid: React.FC<IHubInsightsGridProps> = ({
  insights,
  summary,
  onRefresh,
  lastUpdated,
}) => {
  const styles = useStyles();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Count unique source cards
  const uniqueSourceCards = React.useMemo(() => {
    const cardIds = new Set(insights.map(i => i.sourceCardId));
    return cardIds.size;
  }, [insights]);

  const formattedTime = React.useMemo(() => {
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [lastUpdated]);

  return (
    <div className={styles.root}>
      {/* Toggle button row */}
      <div className={styles.toggleRow}>
        <Button
          className={styles.toggleButton}
          appearance="subtle"
          icon={<ChartMultiple20Regular />}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse insights grid' : 'Expand insights grid'}
        >
          Insights
        </Button>

        {/* Severity dot counts */}
        <div className={styles.severityDots}>
          {summary.criticalCount > 0 && (
            <>
              <span className={`${styles.dot} ${styles.dotCritical}`} />
              <span>{summary.criticalCount}</span>
            </>
          )}
          {summary.warningCount > 0 && (
            <>
              <span className={`${styles.dot} ${styles.dotWarning}`} />
              <span>{summary.warningCount}</span>
            </>
          )}
          {summary.infoCount + summary.positiveCount > 0 && (
            <>
              <span className={`${styles.dot} ${styles.dotInfo}`} />
              <span>{summary.infoCount + summary.positiveCount}</span>
            </>
          )}
        </div>

        <Button
          appearance="subtle"
          size="small"
          icon={isExpanded ? <ChevronUp20Regular /> : <ChevronDown20Regular />}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Expandable grid */}
      <Collapse visible={isExpanded}>
        <div>
          <div className={styles.grid}>
            {insights.map((insight) => (
              <HubInsightCard
                key={insight.id}
                insight={insight}
              />
            ))}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <Text className={styles.footerText}>
              {summary.totalCount} signals from {uniqueSourceCards} cards &middot; Updated {formattedTime}
            </Text>
            <Tooltip content="Refresh insights" relationship="label">
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowSync20Regular />}
                onClick={onRefresh}
                aria-label="Refresh insights"
              />
            </Tooltip>
          </div>
        </div>
      </Collapse>
    </div>
  );
};
