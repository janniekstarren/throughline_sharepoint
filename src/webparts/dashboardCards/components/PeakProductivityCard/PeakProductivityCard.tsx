// ============================================
// PeakProductivityCard - Card with size variants
// Small: Compact chip with metric and chart
// Medium: Summary view with stats and hour list
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
} from '@fluentui/react-components';
import {
  DataTrending24Regular,
  ArrowClockwiseRegular,
  Alert20Regular,
  TopSpeed20Regular,
  CalendarLtr20Regular,
} from '@fluentui/react-icons';

import { HourlyProductivity } from '../../models/PeakProductivity';
import { usePeakProductivity } from '../../hooks/usePeakProductivity';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface PeakProductivityCardProps {
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

const usePeakProductivityStyles = makeStyles({
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
  statValueSuccess: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteGreenForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },

  // Hour list section
  hourListSection: {
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
  hourList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  hourRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  hourLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    minWidth: '55px',
  },
  hourBarContainer: {
    flex: 1,
    height: '8px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: tokens.borderRadiusSmall,
    overflow: 'hidden',
  },
  hourBar: {
    height: '100%',
    borderRadius: tokens.borderRadiusSmall,
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
  },
  hourScore: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
    minWidth: '30px',
    textAlign: 'right',
  },
});

// ============================================
// Helpers
// ============================================

const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return tokens.colorPaletteGreenForeground1;
  if (score >= 50) return tokens.colorBrandForeground1;
  if (score >= 30) return tokens.colorPaletteYellowForeground1;
  return tokens.colorPaletteRedForeground1;
};

// ============================================
// Component
// ============================================

export const PeakProductivityCard: React.FC<PeakProductivityCardProps> = ({
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

  const styles = usePeakProductivityStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = usePeakProductivity({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="peakProductivity"
        title="Peak Hours"
        icon={<DataTrending24Regular />}
        metricValue={data?.stats.misalignedHours.length ?? 0}
        smartLabelKey="hour"
        chartData={data?.trendData.map(p => ({ date: new Date(p.date), value: p.value }))}
        chartColor={data?.stats.misalignedHours.length !== undefined && data.stats.misalignedHours.length >= 3 ? 'danger' : 'brand'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Top 4 peak hours sorted by productivity score desc
  const topHours = useMemo(() => {
    if (!data) return [];
    return [...data.hourlyProfile]
      .filter(h => h.isPeakHour)
      .sort((a, b) => b.productivityScore - a.productivityScore)
      .slice(0, 4);
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
      <BaseCard testId="peak-productivity-card" empty>
        <CardHeader
          icon={<DataTrending24Regular />}
          title="Peak Productivity"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<DataTrending24Regular />}
          title="No data"
          description="No productivity data available yet"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Analyzing productivity patterns..."
      testId="peak-productivity-card"
      className={styles.card}
    >
      <CardHeader
        icon={<DataTrending24Regular />}
        title="Peak Productivity"
        badge={data?.stats.peakHours.length}
        badgeVariant={
          data && data.stats.misalignedHours.length >= 3
            ? 'danger'
            : data && data.stats.misalignedHours.length > 0
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
                <DataTrending24Regular className={styles.statIcon} />
                Peak Hours
              </div>
              <Text className={styles.statValue}>{data.stats.peakHours.length}</Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Alert20Regular className={styles.statIcon} />
                Misaligned
              </div>
              <Text className={data.stats.misalignedHours.length >= 3 ? styles.statValueDanger : data.stats.misalignedHours.length > 0 ? styles.statValueWarning : styles.statValue}>
                {data.stats.misalignedHours.length}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <TopSpeed20Regular className={styles.statIcon} />
                Efficiency
              </div>
              <Text className={data.stats.productivityEfficiency >= 70 ? styles.statValueSuccess : data.stats.productivityEfficiency >= 50 ? styles.statValue : styles.statValueWarning}>
                {Math.round(data.stats.productivityEfficiency)}%
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <CalendarLtr20Regular className={styles.statIcon} />
                Deep Work
              </div>
              <Text className={styles.statValue}>
                {data.stats.bestTimeForDeepWork || 'N/A'}
              </Text>
            </div>
          </div>
        )}

        {/* Hour List - Top 4 peak hours */}
        {topHours.length > 0 && (
          <div className={styles.hourListSection}>
            <Text className={styles.sectionLabel}>Top Peak Hours</Text>
            <div className={styles.hourList}>
              {topHours.map((hour: HourlyProductivity) => (
                <div key={hour.hour} className={styles.hourRow}>
                  <span className={styles.hourLabel}>{formatHour(hour.hour)}</span>
                  <div className={styles.hourBarContainer}>
                    <div
                      className={styles.hourBar}
                      style={{
                        width: `${Math.min(hour.productivityScore, 100)}%`,
                        backgroundColor: getScoreColor(hour.productivityScore),
                      }}
                    />
                  </div>
                  <span className={styles.hourScore}>{Math.round(hour.productivityScore)}</span>
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

export default PeakProductivityCard;
