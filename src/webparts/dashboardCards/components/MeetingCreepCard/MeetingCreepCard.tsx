// ============================================
// MeetingCreepCard - Card with size variants
// Small: Compact chip with metric and chart
// Medium: Summary view with stats and month trend
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
  CalendarAdd24Regular,
  ArrowClockwiseRegular,
  Clock20Regular,
  ArrowTrendingLines20Regular,
  CalendarLtr20Regular,
  TopSpeed20Regular,
} from '@fluentui/react-icons';

import { MeetingCreepMonth } from '../../models/MeetingCreep';
import { useMeetingCreep } from '../../hooks/useMeetingCreep';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface MeetingCreepCardProps {
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

const useMeetingCreepStyles = makeStyles({
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

  // Month trend section
  trendSection: {
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
  trendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  trendRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  trendRowHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendMonthLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  trendHours: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  trendSplit: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  trendBadgeRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: tokens.spacingVerticalXXS,
  },

  // Bottom section
  biggestGrowth: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    paddingBottom: tokens.spacingVerticalL,
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  biggestGrowthValue: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
});

// ============================================
// Helpers
// ============================================

const formatHours = (hours: number): string => {
  if (hours === Math.floor(hours)) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
};

const getGrowthBadgeColor = (changePercent: number): 'danger' | 'warning' | 'success' | 'informative' => {
  if (changePercent > 30) return 'danger';
  if (changePercent > 15) return 'warning';
  if (changePercent < 0) return 'success';
  return 'informative';
};

const formatChangePercent = (pct: number): string => {
  const rounded = Math.round(pct);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
};

// ============================================
// Component
// ============================================

export const MeetingCreepCard: React.FC<MeetingCreepCardProps> = ({
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

  const styles = useMeetingCreepStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useMeetingCreep({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="meetingCreep"
        title="Meeting Creep"
        icon={<CalendarAdd24Regular />}
        metricValue={`${(data?.stats?.changePercent ?? 0) > 0 ? '+' : ''}${Math.round(data?.stats?.changePercent ?? 0)}%`}
        smartLabelKey="meeting"
        chartData={data?.trendLine?.map(t => ({ date: new Date(t.month + ' 1'), value: t.actual }))}
        chartColor={(data?.stats?.changePercent ?? 0) > 30 ? 'danger' : (data?.stats?.changePercent ?? 0) > 15 ? 'warning' : 'brand'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Recent 6 months for trend display
  const recentMonths = useMemo(() => {
    if (!data || data.months.length === 0) return [];
    // Take the last 6 months
    const allMonths = data.months;
    return allMonths.slice(Math.max(0, allMonths.length - 6));
  }, [data]);

  // Compute per-month growth (relative to previous month)
  const monthGrowths = useMemo(() => {
    if (recentMonths.length === 0) return [];
    return recentMonths.map((month, index) => {
      if (index === 0) return 0;
      const prev = recentMonths[index - 1];
      if (prev.totalMeetingHours === 0) return 0;
      return ((month.totalMeetingHours - prev.totalMeetingHours) / prev.totalMeetingHours) * 100;
    });
  }, [recentMonths]);

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
  if (!isLoading && !error && (!data || data.months.length === 0)) {
    return (
      <BaseCard testId="meeting-creep-card" empty>
        <CardHeader
          icon={<CalendarAdd24Regular />}
          title="Meeting Creep"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<CalendarAdd24Regular />}
          title="No meeting trend data"
          description="Meeting growth patterns will appear here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Analyzing meeting trends..."
      testId="meeting-creep-card"
      className={styles.card}
    >
      <CardHeader
        icon={<CalendarAdd24Regular />}
        title="Meeting Creep"
        badge={data ? Math.round(data.stats.changePercent) : undefined}
        badgeVariant={
          data && data.stats.changePercent > 30
            ? 'danger'
            : data && data.stats.changePercent > 15
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
                <Clock20Regular className={styles.statIcon} />
                Current
              </div>
              <Text className={data.stats.currentMonthHours > 25 ? styles.statValueDanger : data.stats.currentMonthHours > 20 ? styles.statValueWarning : styles.statValue}>
                {formatHours(data.stats.currentMonthHours)}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <CalendarLtr20Regular className={styles.statIcon} />
                6mo Ago
              </div>
              <Text className={styles.statValue}>
                {formatHours(data.stats.sixMonthsAgoHours)}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <ArrowTrendingLines20Regular className={styles.statIcon} />
                Change
              </div>
              <Text className={data.stats.changePercent > 30 ? styles.statValueDanger : data.stats.changePercent > 15 ? styles.statValueWarning : styles.statValue}>
                {formatChangePercent(data.stats.changePercent)}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <TopSpeed20Regular className={styles.statIcon} />
                Projected
              </div>
              <Text className={styles.statValue}>
                {formatHours(data.stats.projectedNextMonth)}
              </Text>
            </div>
          </div>
        )}

        {/* Month Trend List - Recent 6 months */}
        {recentMonths.length > 0 && (
          <div className={styles.trendSection}>
            <Text className={styles.sectionLabel}>Recent 6 Months</Text>
            <div className={styles.trendList}>
              {recentMonths.map((month: MeetingCreepMonth, index: number) => {
                const growth = monthGrowths[index];
                return (
                  <div key={month.month} className={styles.trendRow}>
                    <div className={styles.trendRowHeader}>
                      <span className={styles.trendMonthLabel}>{month.month}</span>
                      <span className={styles.trendHours}>{formatHours(month.totalMeetingHours)}</span>
                    </div>
                    <div className={styles.trendRowHeader}>
                      <span className={styles.trendSplit}>
                        Recurring: {formatHours(month.recurringHours)} | Ad-hoc: {formatHours(month.adhocHours)}
                      </span>
                      {index > 0 && (
                        <div className={styles.trendBadgeRow}>
                          <Badge
                            appearance="tint"
                            color={getGrowthBadgeColor(growth)}
                            size="small"
                          >
                            {formatChangePercent(growth)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Biggest Growth Category */}
        {data && data.stats.biggestGrowthCategory && (
          <div className={styles.biggestGrowth}>
            Biggest growth:{' '}
            <span className={styles.biggestGrowthValue}>{data.stats.biggestGrowthCategory}</span>
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

export default MeetingCreepCard;
