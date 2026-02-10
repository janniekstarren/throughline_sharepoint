// ============================================
// SeasonalWorkloadCard - Card with size variants
// Small: Compact chip with metric and chart
// Medium: Summary view with stats and month list
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
  CalendarPatternRegular,
  ArrowClockwiseRegular,
  ArrowTrendingLines20Regular,
  CalendarLtr20Regular,
  TopSpeed20Regular,
  Timer20Regular,
} from '@fluentui/react-icons';

import { SeasonalPeriod } from '../../models/SeasonalWorkload';
import { useSeasonalWorkload } from '../../hooks/useSeasonalWorkload';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface SeasonalWorkloadCardProps {
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

const useSeasonalWorkloadStyles = makeStyles({
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
  statValueSmall: {
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.2,
    textAlign: 'center',
  },

  // Month list section
  monthListSection: {
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
  monthList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  monthRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  monthRowCurrent: {
    backgroundColor: tokens.colorBrandBackground2,
    border: `1px solid ${tokens.colorBrandStroke1}`,
  },
  monthLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    minWidth: '36px',
  },
  monthBarOuter: {
    flex: 1,
    height: '6px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '3px',
    overflow: 'hidden',
    position: 'relative',
  },
  monthBarHistorical: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '3px',
    opacity: 0.3,
  },
  monthBarPredicted: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: '3px',
  },
  monthBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  monthAnnotation: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
    marginTop: '2px',
  },
});

// ============================================
// Helpers
// ============================================

const getWorkloadBarColor = (score: number): string => {
  if (score > 75) return tokens.colorPaletteRedForeground1;
  if (score >= 50) return tokens.colorPaletteYellowForeground1;
  return tokens.colorPaletteGreenForeground1;
};

// ============================================
// Component
// ============================================

export const SeasonalWorkloadCard: React.FC<SeasonalWorkloadCardProps> = ({
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

  const styles = useSeasonalWorkloadStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useSeasonalWorkload({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="seasonalWorkload"
        title="Seasonal"
        icon={<CalendarPatternRegular />}
        metricValue={data?.stats.weeksUntilNextPeak ?? 0}
        smartLabelKey="month"
        chartData={data?.months?.map(m => ({ date: new Date(m.monthLabel + ' 1'), value: m.predictedWorkloadScore }))}
        chartColor={(data?.stats?.weeksUntilNextPeak ?? Infinity) <= 2 ? 'danger' : (data?.stats?.weeksUntilNextPeak ?? Infinity) <= 4 ? 'warning' : 'brand'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Current vs avg percentage
  const currentVsAvg = useMemo(() => {
    if (!data) return '0%';
    const pct = Math.round(data.stats.currentMonthVsAvg);
    return `${pct > 0 ? '+' : ''}${pct}%`;
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
  if (!isLoading && !error && (!data || data.months.length === 0)) {
    return (
      <BaseCard testId="seasonal-workload-card" empty>
        <CardHeader
          icon={<CalendarPatternRegular />}
          title="Seasonal Patterns"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<CalendarPatternRegular />}
          title="No seasonal data available"
          description="Workload pattern data will appear here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Analyzing seasonal patterns..."
      testId="seasonal-workload-card"
      className={styles.card}
    >
      <CardHeader
        icon={<CalendarPatternRegular />}
        title="Seasonal Patterns"
        badge={data?.stats.weeksUntilNextPeak !== undefined ? data.stats.weeksUntilNextPeak : undefined}
        badgeVariant={
          data && data.stats.weeksUntilNextPeak <= 2
            ? 'danger'
            : data && data.stats.weeksUntilNextPeak <= 4
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
                <CalendarLtr20Regular className={styles.statIcon} />
                Next Peak
              </div>
              <Text className={styles.statValueSmall}>{data.stats.nextPeakMonth}</Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <TopSpeed20Regular className={styles.statIcon} />
                Peak Score
              </div>
              <Text className={data.stats.nextPeakScore > 75 ? styles.statValueDanger : data.stats.nextPeakScore > 50 ? styles.statValueWarning : styles.statValue}>
                {data.stats.nextPeakScore}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Timer20Regular className={styles.statIcon} />
                Weeks to Peak
              </div>
              <Text className={data.stats.weeksUntilNextPeak <= 2 ? styles.statValueDanger : data.stats.weeksUntilNextPeak <= 4 ? styles.statValueWarning : styles.statValue}>
                {data.stats.weeksUntilNextPeak}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <ArrowTrendingLines20Regular className={styles.statIcon} />
                Vs Avg
              </div>
              <Text className={data.stats.currentMonthVsAvg > 20 ? styles.statValueDanger : data.stats.currentMonthVsAvg > 10 ? styles.statValueWarning : styles.statValue}>
                {currentVsAvg}
              </Text>
            </div>
          </div>
        )}

        {/* Month List */}
        {data && data.months.length > 0 && (
          <div className={styles.monthListSection}>
            <Text className={styles.sectionLabel}>12-Month Outlook</Text>
            <div className={styles.monthList}>
              {data.months.map((month: SeasonalPeriod, index: number) => {
                const isCurrent = index === data.currentMonth;
                const barColor = getWorkloadBarColor(month.predictedWorkloadScore);
                const historicalWidth = Math.min(month.historicalWorkloadScore, 100);
                const predictedWidth = Math.min(month.predictedWorkloadScore, 100);

                return (
                  <div
                    key={month.monthLabel}
                    className={`${styles.monthRow} ${isCurrent ? styles.monthRowCurrent : ''}`}
                  >
                    <span className={styles.monthLabel}>
                      {month.monthLabel.substring(0, 3)}
                    </span>
                    <div className={styles.monthBarOuter}>
                      <div
                        className={styles.monthBarHistorical}
                        style={{
                          width: `${historicalWidth}%`,
                          backgroundColor: barColor,
                        }}
                      />
                      <div
                        className={styles.monthBarPredicted}
                        style={{
                          width: `${predictedWidth}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                    <div className={styles.monthBadges}>
                      {isCurrent && (
                        <Badge appearance="filled" color="brand" size="small">
                          Current
                        </Badge>
                      )}
                      {month.isPeak && (
                        <Badge appearance="tint" color="danger" size="small">
                          Peak
                        </Badge>
                      )}
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

export default SeasonalWorkloadCard;
