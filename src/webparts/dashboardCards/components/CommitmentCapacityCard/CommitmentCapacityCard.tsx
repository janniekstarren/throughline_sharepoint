// ============================================
// CommitmentCapacityCard - Card with size variants
// Small: Compact chip with metric and chart
// Medium: Summary view with stats and capacity bars
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
  ScaleFill24Regular,
  ArrowClockwiseRegular,
  ArrowTrendingLines20Regular,
  TaskListSquareLtr20Regular,
  Clock20Regular,
  ArrowUp20Regular,
  ArrowDown20Regular,
  ArrowRight20Regular,
} from '@fluentui/react-icons';

import { CapacityWeek } from '../../models/CommitmentCapacity';
import { useCommitmentCapacity } from '../../hooks/useCommitmentCapacity';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface CommitmentCapacityCardProps {
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

const useCommitmentCapacityStyles = makeStyles({
  card: {
    height: 'auto',
    minHeight: '280px',
    maxHeight: '600px',
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

  // Capacity bars section
  capacitySection: {
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
  capacityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  capacityRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  capacityRowHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capacityWeekLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  capacityHours: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  capacityBarOuter: {
    width: '100%',
    height: '6px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '3px',
    overflow: 'hidden',
  },
  capacityBarInnerGreen: {
    height: '100%',
    borderRadius: '3px',
    backgroundColor: tokens.colorPaletteGreenForeground1,
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
  },
  capacityBarInnerYellow: {
    height: '100%',
    borderRadius: '3px',
    backgroundColor: tokens.colorPaletteYellowForeground1,
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
  },
  capacityBarInnerRed: {
    height: '100%',
    borderRadius: '3px',
    backgroundColor: tokens.colorPaletteRedForeground1,
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
  },
  capacityBadgeRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: tokens.spacingVerticalXXS,
  },

  // Trend direction
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
});

// ============================================
// Helpers
// ============================================

const formatRatio = (ratio: number): string => {
  return `${Math.round(ratio * 100)}%`;
};

const formatHours = (hours: number): string => {
  if (hours === Math.floor(hours)) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
};

const getCapacityBarClass = (
  ratio: number,
  styles: ReturnType<typeof useCommitmentCapacityStyles>
): string => {
  if (ratio > 1.2) return styles.capacityBarInnerRed;
  if (ratio >= 1.0) return styles.capacityBarInnerYellow;
  return styles.capacityBarInnerGreen;
};

const getStatusLabel = (status: CapacityWeek['status']): string => {
  switch (status) {
    case 'under': return 'Under';
    case 'balanced': return 'Balanced';
    case 'stretched': return 'Stretched';
    case 'overcommitted': return 'Overcommitted';
    default: return status;
  }
};

const getStatusBadgeColor = (status: CapacityWeek['status']): 'success' | 'warning' | 'danger' | 'informative' => {
  switch (status) {
    case 'under': return 'informative';
    case 'balanced': return 'success';
    case 'stretched': return 'warning';
    case 'overcommitted': return 'danger';
    default: return 'informative';
  }
};

// ============================================
// Component
// ============================================

export const CommitmentCapacityCard: React.FC<CommitmentCapacityCardProps> = ({
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

  const styles = useCommitmentCapacityStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useCommitmentCapacity({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="commitmentCapacity"
        title="Capacity"
        icon={<ScaleFill24Regular />}
        metricValue={`${Math.round((data?.currentWeek.ratio ?? 0) * 100)}%`}
        smartLabelKey="score"
        chartData={data?.trendData?.map(p => ({ date: new Date(p.date), value: p.value }))}
        chartColor={(data?.currentWeek?.ratio ?? 0) > 1.5 ? 'danger' : (data?.currentWeek?.ratio ?? 0) > 1.2 ? 'warning' : 'brand'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Capacity weeks
  const capacityWeeks = useMemo(() => {
    if (!data) return [];
    return [data.currentWeek, data.nextWeek, data.weekAfter];
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
      <BaseCard testId="commitment-capacity-card" empty>
        <CardHeader
          icon={<ScaleFill24Regular />}
          title="Commitment vs Capacity"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<ScaleFill24Regular />}
          title="No commitment data available"
          description="Task and capacity data will appear here"
        />
      </BaseCard>
    );
  }

  // Trend direction icon
  const TrendIcon = data?.stats.trendDirection === 'improving'
    ? ArrowDown20Regular
    : data?.stats.trendDirection === 'worsening'
    ? ArrowUp20Regular
    : ArrowRight20Regular;

  const trendLabel = data?.stats.trendDirection === 'improving'
    ? 'Improving'
    : data?.stats.trendDirection === 'worsening'
    ? 'Worsening'
    : 'Stable';

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Checking commitment capacity..."
      testId="commitment-capacity-card"
      className={styles.card}
    >
      <CardHeader
        icon={<ScaleFill24Regular />}
        title="Commitment vs Capacity"
        badge={data ? Math.round(data.currentWeek.ratio * 100) : undefined}
        badgeVariant={
          data && data.currentWeek.ratio > 1.5
            ? 'danger'
            : data && data.currentWeek.ratio > 1.2
            ? 'warning'
            : 'brand'
        }
        actions={headerActions}
      />

      <div className={cardStyles.cardContent}>
        {/* Statistics Grid */}
        {data && (
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <ScaleFill24Regular className={styles.statIcon} />
                Ratio
              </div>
              <Text className={data.currentWeek.ratio > 1.5 ? styles.statValueDanger : data.currentWeek.ratio > 1.2 ? styles.statValueWarning : styles.statValue}>
                {formatRatio(data.currentWeek.ratio)}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <TaskListSquareLtr20Regular className={styles.statIcon} />
                Open Tasks
              </div>
              <Text className={styles.statValue}>
                {data.stats.totalOpenTasks}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Clock20Regular className={styles.statIcon} />
                Overdue
              </div>
              <Text className={data.stats.overdueTasks > 0 ? styles.statValueDanger : styles.statValue}>
                {data.stats.overdueTasks}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <ArrowTrendingLines20Regular className={styles.statIcon} />
                Trend
              </div>
              <div className={styles.trendRow}>
                <TrendIcon style={{
                  fontSize: '20px',
                  color: data.stats.trendDirection === 'improving'
                    ? tokens.colorPaletteGreenForeground1
                    : data.stats.trendDirection === 'worsening'
                    ? tokens.colorPaletteRedForeground1
                    : tokens.colorNeutralForeground3,
                }} />
                <Text style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: data.stats.trendDirection === 'improving'
                    ? tokens.colorPaletteGreenForeground1
                    : data.stats.trendDirection === 'worsening'
                    ? tokens.colorPaletteRedForeground1
                    : tokens.colorNeutralForeground3,
                }}>
                  {trendLabel}
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Capacity Week Bars */}
        {capacityWeeks.length > 0 && (
          <div className={styles.capacitySection}>
            <Text className={styles.sectionLabel}>3-Week Outlook</Text>
            <div className={styles.capacityList}>
              {capacityWeeks.map((week: CapacityWeek) => {
                const barWidth = Math.min(week.ratio * 100, 100);
                const barClass = getCapacityBarClass(week.ratio, styles);
                return (
                  <div key={week.weekLabel} className={styles.capacityRow}>
                    <div className={styles.capacityRowHeader}>
                      <span className={styles.capacityWeekLabel}>{week.weekLabel}</span>
                      <span className={styles.capacityHours}>
                        {formatHours(week.committedHours)} / {formatHours(week.availableHours)}
                      </span>
                    </div>
                    <div className={styles.capacityBarOuter}>
                      <div
                        className={barClass}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className={styles.capacityBadgeRow}>
                      <Badge
                        appearance="tint"
                        color={getStatusBadgeColor(week.status)}
                        size="small"
                      >
                        {getStatusLabel(week.status)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
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

export default CommitmentCapacityCard;
