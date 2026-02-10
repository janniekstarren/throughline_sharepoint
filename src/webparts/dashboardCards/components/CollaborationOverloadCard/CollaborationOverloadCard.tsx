// ============================================
// CollaborationOverloadCard - Card with size variants
// Small: Compact chip with metric and chart
// Medium: Summary view with stats and metrics list
// Large: Full master-detail layout
// ============================================

import * as React from 'react';
import { useMemo, useCallback } from 'react';
import {
  makeStyles,
  Text,
  Button,
  Tooltip,
  tokens,
  Badge,
} from '@fluentui/react-components';
import {
  PeopleQueue24Regular,
  ArrowClockwiseRegular,
  Gauge20Regular,
  Calendar20Regular,
  Mail20Regular,
  Clock20Regular,
  ArrowUp16Regular,
  ArrowDown16Regular,
  Subtract16Regular,
} from '@fluentui/react-icons';

import { CollaborationMetric } from '../../models/CollaborationOverload';
import { useCollaborationOverload } from '../../hooks/useCollaborationOverload';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface CollaborationOverloadCardProps {
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  /** Card size: 'small' | 'medium' | 'large' */
  size?: CardSize;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useCollaborationOverloadStyles = makeStyles({
  card: {
    height: 'auto',
    minHeight: '280px',
    maxHeight: '600px',
  },

  // Score label badge
  scoreLabelBadge: {
    display: 'flex',
    justifyContent: 'center',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalL}`,
  },

  // Stats grid - 2x2 layout
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: 'center',
  },
  statLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statIcon: {
    fontSize: '14px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueWarning: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteYellowForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueDanger: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteRedForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueGood: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteGreenForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },

  // Metric list section
  metricListSection: {
    padding: `0 ${tokens.spacingHorizontalL}`,
    paddingBottom: tokens.spacingVerticalL,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: tokens.spacingVerticalS,
  },
  metricList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  metricRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  metricInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metricName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  metricMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  metricBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  trendImproving: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorPaletteGreenForeground1,
  },
  trendWorsening: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorPaletteRedForeground1,
  },
  trendStable: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  progressBarContainer: {
    width: '40px',
    height: '4px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '2px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  progressBar: {
    height: '100%',
    borderRadius: '2px',
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
  },
});

// ============================================
// Helpers
// ============================================

type ScoreLabel = 'healthy' | 'moderate' | 'elevated' | 'high' | 'critical';

const getScoreLabelColor = (label: ScoreLabel): 'success' | 'brand' | 'warning' | 'danger' => {
  switch (label) {
    case 'healthy': return 'success';
    case 'moderate': return 'brand';
    case 'elevated': return 'warning';
    case 'high': return 'danger';
    case 'critical': return 'danger';
    default: return 'brand';
  }
};

const getScoreValueClass = (
  score: number,
  styles: {
    statValue: string;
    statValueGood: string;
    statValueWarning: string;
    statValueDanger: string;
  }
): string => {
  if (score >= 80) return styles.statValueDanger;
  if (score >= 60) return styles.statValueWarning;
  if (score >= 40) return styles.statValue;
  return styles.statValueGood;
};

const getProgressBarColor = (percentile: number): string => {
  if (percentile >= 80) return tokens.colorPaletteRedForeground1;
  if (percentile >= 60) return tokens.colorPaletteYellowForeground1;
  return tokens.colorPaletteGreenForeground1;
};

// ============================================
// Component
// ============================================

export const CollaborationOverloadCard: React.FC<CollaborationOverloadCardProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  size = 'medium',
  onSizeChange,
}) => {
  const handleSizeChange = useCallback(
    (newSize: CardSize) => {
      if (onSizeChange) onSizeChange(newSize);
    },
    [onSizeChange]
  );

  const styles = useCollaborationOverloadStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useCollaborationOverload({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="collaborationOverload"
        title="Collab Load"
        icon={<PeopleQueue24Regular />}
        metricValue={data?.compositeScore ?? 0}
        smartLabelKey="score"
        chartData={data?.weeklyHistory?.map(w => ({ date: new Date(w.week), value: w.score }))}
        chartColor={(data?.compositeScore ?? 0) >= 80 ? 'danger' : (data?.compositeScore ?? 0) >= 60 ? 'warning' : 'brand'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Convert metrics object to array for display
  const metricsArray = useMemo(() => {
    if (!data) return [];
    return Object.values(data.metrics);
  }, [data]);

  // Header actions
  const headerActions = (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowClockwiseRegular />}
          size="small"
          onClick={refresh}
        />
      </Tooltip>
      <CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />
    </div>
  );

  // Empty state
  if (!isLoading && !error && !data) {
    return (
      <BaseCard testId="collaboration-overload-card" empty>
        <CardHeader
          icon={<PeopleQueue24Regular />}
          title="Collaboration Overload"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<PeopleQueue24Regular />}
          title="No collaboration data"
          description="Collaboration metrics are not yet available"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Analysing collaboration patterns..."
      testId="collaboration-overload-card"
      className={styles.card}
    >
      <CardHeader
        icon={<PeopleQueue24Regular />}
        title="Collaboration Overload"
        badge={data?.compositeScore}
        badgeVariant={
          data && data.compositeScore >= 80
            ? 'danger'
            : data && data.compositeScore >= 60
            ? 'warning'
            : 'brand'
        }
        actions={headerActions}
      />

      <div className={cardStyles.cardContent}>
        {/* Score Label Badge */}
        {data && (
          <div className={styles.scoreLabelBadge}>
            <Badge
              appearance="filled"
              color={getScoreLabelColor(data.scoreLabel)}
              size="medium"
            >
              {data.scoreLabel.charAt(0).toUpperCase() + data.scoreLabel.slice(1)}
            </Badge>
          </div>
        )}

        {/* Statistics Grid */}
        {data && (
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Gauge20Regular className={styles.statIcon} />
                Score
              </div>
              <Text className={getScoreValueClass(data.compositeScore, styles)}>
                {Math.round(data.compositeScore)}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Calendar20Regular className={styles.statIcon} />
                Mtg Hrs/Wk
              </div>
              <Text className={styles.statValue}>
                {Math.round(data.metrics.meetingHoursPerWeek.currentValue)}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Mail20Regular className={styles.statIcon} />
                Emails/Day
              </div>
              <Text className={styles.statValue}>
                {Math.round(data.metrics.emailsSentPerDay.currentValue)}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Clock20Regular className={styles.statIcon} />
                B2B Days
              </div>
              <Text className={styles.statValue}>
                {Math.round(data.metrics.backToBackMeetingDays.currentValue)}
              </Text>
            </div>
          </div>
        )}

        {/* Metrics List - All 6 metrics */}
        {metricsArray.length > 0 && (
          <div className={styles.metricListSection}>
            <Text className={styles.sectionLabel}>Metrics Breakdown</Text>
            <div className={styles.metricList}>
              {metricsArray.map((metric: CollaborationMetric) => (
                <div key={metric.name} className={styles.metricRow}>
                  <div className={styles.metricInfo}>
                    <span className={styles.metricName}>{metric.name}</span>
                    <span className={styles.metricMeta}>
                      {metric.currentValue} {metric.unit} &middot; benchmark: {metric.benchmarkValue} {metric.unit}
                    </span>
                  </div>
                  <div className={styles.metricBadges}>
                    <span
                      className={
                        metric.trend === 'improving'
                          ? styles.trendImproving
                          : metric.trend === 'worsening'
                          ? styles.trendWorsening
                          : styles.trendStable
                      }
                    >
                      {metric.trend === 'improving' ? (
                        <ArrowDown16Regular />
                      ) : metric.trend === 'worsening' ? (
                        <ArrowUp16Regular />
                      ) : (
                        <Subtract16Regular />
                      )}
                      {metric.trend}
                    </span>
                    <div className={styles.progressBarContainer}>
                      <div
                        className={styles.progressBar}
                        style={{
                          width: `${Math.min(metric.percentile, 100)}%`,
                          backgroundColor: getProgressBarColor(metric.percentile),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cardStyles.cardFooter}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
        </Text>
      </div>
    </BaseCard>
  );
};

export default CollaborationOverloadCard;
