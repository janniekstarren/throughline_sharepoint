// ============================================
// AfterHoursFootprintCard - Card with size variants
// Small: Compact chip with metric and chart
// Medium: Summary view with stats and day list
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
  WeatherMoon24Regular,
  ArrowClockwiseRegular,
  Clock20Regular,
  CalendarLtr20Regular,
  ArrowTrending20Regular,
  Timer20Regular,
} from '@fluentui/react-icons';

import { AfterHoursDay } from '../../models/AfterHoursFootprint';
import { useAfterHours } from '../../hooks/useAfterHours';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface AfterHoursFootprintCardProps {
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

const useAfterHoursStyles = makeStyles({
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

  // Day list section
  dayListSection: {
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
  dayList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  dayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  dayInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dayLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dayMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  dayBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
});

// ============================================
// Helpers
// ============================================

const formatMinutesToHours = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

const getActivityCount = (day: AfterHoursDay): number => {
  return day.activities.reduce((sum, a) => sum + a.count, 0);
};

const getLatestTimestamp = (day: AfterHoursDay): string => {
  if (day.activities.length === 0) return '';
  const latest = day.activities.reduce((max, a) =>
    a.latestTimestamp > max ? a.latestTimestamp : max, day.activities[0].latestTimestamp);
  return latest.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getSeverityColor = (minutes: number): 'danger' | 'warning' | 'informative' => {
  if (minutes >= 120) return 'danger';
  if (minutes >= 60) return 'warning';
  return 'informative';
};

// ============================================
// Component
// ============================================

export const AfterHoursFootprintCard: React.FC<AfterHoursFootprintCardProps> = ({
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

  const styles = useAfterHoursStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useAfterHours({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="afterHoursFootprint"
        title="After Hours"
        icon={<WeatherMoon24Regular />}
        metricValue={`${Math.round(data?.stats.avgAfterHoursPerWeek ?? 0)}h`}
        smartLabelKey="hour"
        chartData={data?.weeklyTrend.map(p => ({ date: new Date(p.date), value: p.value }))}
        chartColor={
          data?.stats.afterHoursPercentage !== undefined && data.stats.afterHoursPercentage > 25
            ? 'danger'
            : data?.stats.afterHoursPercentage !== undefined && data.stats.afterHoursPercentage > 15
            ? 'warning'
            : 'brand'
        }
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Recent after-hours days sorted by date descending
  const recentDays = useMemo(() => {
    if (!data) return [];
    return [...data.days]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
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
  if (!isLoading && !error && (!data || data.days.length === 0)) {
    return (
      <BaseCard testId="after-hours-card" empty>
        <CardHeader
          icon={<WeatherMoon24Regular />}
          title="After Hours Footprint"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<WeatherMoon24Regular />}
          title="No after-hours activity"
          description="Great job maintaining work-life balance!"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Analyzing after-hours activity..."
      testId="after-hours-card"
      className={styles.card}
    >
      <CardHeader
        icon={<WeatherMoon24Regular />}
        title="After Hours Footprint"
        badge={data?.days.length}
        badgeVariant={
          data && data.stats.afterHoursPercentage > 25
            ? 'danger'
            : data && data.stats.afterHoursPercentage > 15
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
                Avg/Week
              </div>
              <Text className={data.stats.avgAfterHoursPerWeek > 10 ? styles.statValueDanger : data.stats.avgAfterHoursPerWeek > 5 ? styles.statValueWarning : styles.statValue}>
                {Math.round(data.stats.avgAfterHoursPerWeek)}h
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <ArrowTrending20Regular className={styles.statIcon} />
                After-Hours %
              </div>
              <Text className={data.stats.afterHoursPercentage > 25 ? styles.statValueDanger : data.stats.afterHoursPercentage > 15 ? styles.statValueWarning : styles.statValueSuccess}>
                {Math.round(data.stats.afterHoursPercentage)}%
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <CalendarLtr20Regular className={styles.statIcon} />
                Weekend Days
              </div>
              <Text className={data.stats.weekendDaysWorked > 0 ? styles.statValueWarning : styles.statValueSuccess}>
                {data.stats.weekendDaysWorked}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Timer20Regular className={styles.statIcon} />
                Consecutive
              </div>
              <Text className={data.stats.consecutiveAfterHoursDays >= 5 ? styles.statValueDanger : data.stats.consecutiveAfterHoursDays >= 3 ? styles.statValueWarning : styles.statValue}>
                {data.stats.consecutiveAfterHoursDays}d
              </Text>
            </div>
          </div>
        )}

        {/* Day List - Recent after-hours days */}
        {recentDays.length > 0 && (
          <div className={styles.dayListSection}>
            <Text className={styles.sectionLabel}>Recent Activity</Text>
            <div className={styles.dayList}>
              {recentDays.map((day: AfterHoursDay) => (
                <div key={day.date.toISOString()} className={styles.dayRow}>
                  <div className={styles.dayInfo}>
                    <span className={styles.dayLabel}>{day.dayLabel}</span>
                    <span className={styles.dayMeta}>
                      {getActivityCount(day)} activities - last at {getLatestTimestamp(day)}
                    </span>
                  </div>
                  <div className={styles.dayBadges}>
                    <Badge
                      appearance="tint"
                      color={getSeverityColor(day.afterHoursMinutes)}
                      size="small"
                    >
                      {formatMinutesToHours(day.afterHoursMinutes)}
                    </Badge>
                    {day.isWeekend && (
                      <Badge
                        appearance="outline"
                        color="danger"
                        size="small"
                      >
                        Weekend
                      </Badge>
                    )}
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

export default AfterHoursFootprintCard;
