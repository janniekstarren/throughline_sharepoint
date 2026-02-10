// ============================================
// ContextualActionsCard - Card #66
// "What should I do next?"
// Meta-card that aggregates top impactful actions
// from all other cards. Small + Medium size variants.
// ============================================

import * as React from 'react';
import { useCallback } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
  mergeClasses,
} from '@fluentui/react-components';
import {
  Lightbulb24Regular,
  ArrowClockwiseRegular,
  Clock16Regular,
  Circle12Filled,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  SuggestedAction,
  ActionUrgency,
} from '../../models/ContextualActions';
import { useContextualActions } from '../../hooks/useContextualActions';
import { DataMode } from '../../services/testData';
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
import { CardSize } from '../../types/CardSize';

// ============================================
// Props
// ============================================

export interface ContextualActionsCardProps {
  context: WebPartContext;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  size?: CardSize;
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  summaryBar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} 0`,
    marginBottom: tokens.spacingVerticalS,
  },
  summaryText: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    fontWeight: 500,
  },
  summaryDanger: {
    color: tokens.colorPaletteRedForeground1,
    fontWeight: 600,
  },
  actionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationFast,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  priorityRank: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground3,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
  },
  urgencyDot: {
    flexShrink: 0,
    fontSize: '12px',
  },
  urgencyCritical: {
    color: tokens.colorPaletteRedForeground1,
  },
  urgencyWarning: {
    color: tokens.colorPaletteYellowForeground1,
  },
  urgencyInfo: {
    color: tokens.colorBrandForeground1,
  },
  urgencyPositive: {
    color: tokens.colorPaletteGreenForeground1,
  },
  actionContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  actionTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionSecondary: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  sourceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `1px ${tokens.spacingHorizontalXS}`,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground3,
    fontSize: '10px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  },
  timeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  footerText: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Helpers
// ============================================

const getUrgencyClass = (
  urgency: ActionUrgency,
  styles: ReturnType<typeof useStyles>
): string => {
  switch (urgency) {
    case 'critical':
      return styles.urgencyCritical;
    case 'warning':
      return styles.urgencyWarning;
    case 'info':
      return styles.urgencyInfo;
    case 'positive':
      return styles.urgencyPositive;
    default:
      return styles.urgencyInfo;
  }
};

const formatEstimatedTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// ============================================
// Component
// ============================================

export const ContextualActionsCard: React.FC<ContextualActionsCardProps> = ({
  context,
  dataMode = 'test',
  aiDemoMode = false,
  size = 'medium',
  onSizeChange,
}) => {
  const styles = useStyles();
  const cardStyles = useCardStyles();

  const handleSizeChange = onSizeChange || ((_newSize: CardSize) => { /* no-op */ });

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useContextualActions({
    dataMode,
  });

  // Refresh handler
  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="contextualActions"
        title="Next Actions"
        icon={<Lightbulb24Regular />}
        metricValue={data?.stats.totalActions ?? 0}
        smartLabelKey="action"
        chartColor={data?.stats.criticalCount && data.stats.criticalCount > 0 ? 'danger' : 'brand'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // ============================================
  // MEDIUM CARD VARIANT
  // ============================================

  // Header actions
  const headerActions = (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowClockwiseRegular />}
          size="small"
          onClick={handleRefresh}
        />
      </Tooltip>
      <CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />
    </div>
  );

  // Empty state
  if (!isLoading && !error && (!data || data.stats.totalActions === 0)) {
    return (
      <BaseCard testId="contextual-actions-card" empty>
        <CardHeader
          icon={<Lightbulb24Regular />}
          title="Next Actions"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<Lightbulb24Regular />}
          title="No actions right now"
          description="Nothing needs your attention"
        />
      </BaseCard>
    );
  }

  // Badge variant based on critical count
  const badgeVariant = data && data.stats.criticalCount > 0
    ? 'danger' as const
    : data && data.stats.warningCount > 0
      ? 'warning' as const
      : 'brand' as const;

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Analyzing next actions..."
      testId="contextual-actions-card"
    >
      <CardHeader
        icon={<Lightbulb24Regular />}
        title="Next Actions"
        badge={data?.stats.totalActions}
        badgeVariant={badgeVariant}
        actions={headerActions}
      />

      <div className={cardStyles.cardContent}>
        {/* Summary bar */}
        {data && (
          <div className={styles.summaryBar}>
            {data.stats.criticalCount > 0 && (
              <Text className={mergeClasses(styles.summaryText, styles.summaryDanger)}>
                {data.stats.criticalCount} critical
              </Text>
            )}
            {data.stats.criticalCount > 0 && data.stats.totalEstimatedMinutes > 0 && (
              <Text className={styles.summaryText}>&middot;</Text>
            )}
            {data.stats.totalEstimatedMinutes > 0 && (
              <Text className={styles.summaryText}>
                {formatEstimatedTime(data.stats.totalEstimatedMinutes)} total
              </Text>
            )}
          </div>
        )}

        {/* Action list */}
        {data && data.actions.length > 0 && (
          <div className={styles.actionList}>
            {data.actions.map((action: SuggestedAction, index: number) => (
              <div key={action.id} className={styles.actionRow}>
                {/* Priority rank */}
                <span className={styles.priorityRank}>{index + 1}</span>

                {/* Urgency dot */}
                <Circle12Filled
                  className={mergeClasses(
                    styles.urgencyDot,
                    getUrgencyClass(action.urgency, styles)
                  )}
                />

                {/* Content */}
                <div className={styles.actionContent}>
                  <Text className={styles.actionTitle}>{action.title}</Text>
                  <Text className={styles.actionSecondary}>
                    {action.personContext || action.timeContext || ''}
                  </Text>
                </div>

                {/* Meta */}
                <div className={styles.actionMeta}>
                  <span className={styles.sourceChip}>{action.sourceCardName}</span>
                  <span className={styles.timeBadge}>
                    <Clock16Regular style={{ fontSize: '12px' }} />
                    {action.estimatedMinutes} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {data && (
        <div className={styles.footer}>
          <Text className={styles.footerText}>
            {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
          </Text>
          <Text className={styles.footerText}>
            {formatEstimatedTime(data.stats.totalEstimatedMinutes)} estimated
          </Text>
        </div>
      )}
    </BaseCard>
  );
};

export default ContextualActionsCard;
