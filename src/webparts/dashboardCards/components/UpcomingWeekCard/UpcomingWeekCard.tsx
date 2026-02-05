// ============================================
// UpcomingWeekCard - Medium Card (Summary View)
// Shows upcoming week's calendar events with chart, stats, and top items
// ============================================

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
} from '@fluentui/react-components';
import {
  CalendarWeekNumbers24Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  CalendarMonth20Regular,
  Video20Regular,
  Clock20Regular,
  CalendarDay20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useUpcomingWeek,
  IUpcomingWeekSettings,
  DEFAULT_UPCOMING_WEEK_SETTINGS,
} from '../../hooks/useUpcomingWeek';
import { UpcomingWeekData, WeekTrendData } from '../../models/UpcomingWeek';
import { BaseCard, CardHeader, EmptyState, TrendBarChart, StatsGrid, TopItemsList } from '../shared';
import { StatItem, TopItem } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestUpcomingWeekData, getTestWeekTrendData } from '../../services/testData/upcomingWeek';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  card: {
    // Dynamic height based on content
    height: 'auto',
    minHeight: '280px',
    maxHeight: '600px',
  },
  chartContainer: {
    padding: `0 ${tokens.spacingHorizontalL}`,
    marginBottom: tokens.spacingVerticalS,
  },
  expandPrompt: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalM,
    marginTop: 'auto',
    cursor: 'pointer',
    color: tokens.colorBrandForeground1,
    fontSize: '13px',
    fontWeight: 500,
    ':hover': {
      textDecoration: 'underline',
    },
  },
});

// ============================================
// Props Interface
// ============================================
interface UpcomingWeekCardProps {
  context: WebPartContext;
  settings?: IUpcomingWeekSettings;
  dataMode?: DataMode;
  onToggleSize?: () => void;
}

// ============================================
// Component
// ============================================
export const UpcomingWeekCard: React.FC<UpcomingWeekCardProps> = ({
  context,
  settings = DEFAULT_UPCOMING_WEEK_SETTINGS,
  dataMode = 'api',
  onToggleSize,
}) => {
  const cardStyles = useCardStyles();
  const styles = useStyles();

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = useState<UpcomingWeekData | null>(null);
  const [testTrendData, setTestTrendData] = useState<WeekTrendData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestUpcomingWeekData());
        setTestTrendData(getTestWeekTrendData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook (only used when dataMode === 'api')
  const apiHook = useUpcomingWeek(context, settings);

  // Select between API and test data based on mode
  const data = dataMode === 'test' ? testData : apiHook.data;
  const trendData = dataMode === 'test' ? testTrendData : null; // API would provide this
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const lastRefreshed = dataMode === 'test' ? new Date() : apiHook.lastRefreshed;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestUpcomingWeekData());
          setTestTrendData(getTestWeekTrendData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Stats grid data
  const statsData = useMemo((): [StatItem, StatItem, StatItem, StatItem] => {
    return [
      {
        label: 'Total',
        value: data?.totalCount || 0,
        icon: <CalendarMonth20Regular />,
      },
      {
        label: 'Online',
        value: data?.onlineMeetingCount || 0,
        icon: <Video20Regular />,
      },
      {
        label: 'Busiest',
        value: data?.busiestDay || '-',
        icon: <CalendarDay20Regular />,
      },
      {
        label: 'Free Hours',
        value: data?.freeHoursEstimate || 0,
        icon: <Clock20Regular />,
      },
    ];
  }, [data]);

  // Top items (3 busiest days with counts)
  const topItems = useMemo((): TopItem[] => {
    if (!data || !data.byDay) return [];

    // Convert byDay map to array and sort by event count descending
    const dayEntries = Array.from(data.byDay.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3);

    return dayEntries.map(([dayLabel, events]): TopItem => ({
      id: dayLabel,
      title: dayLabel,
      subtitle: `${events.length} event${events.length !== 1 ? 's' : ''} scheduled`,
      icon: <CalendarDay20Regular />,
      badge: events.length.toString(),
      badgeColor: events.length > 3 ? 'danger' : events.length > 2 ? 'warning' : 'brand',
    }));
  }, [data]);

  // Convert trend for chart
  const chartTrend = useMemo(() => {
    if (!trendData) return 'stable' as const;
    switch (trendData.trend) {
      case 'busier': return 'worsening' as const;
      case 'quieter': return 'improving' as const;
      default: return 'stable' as const;
    }
  }, [trendData]);

  // Expand button
  const expandButton = onToggleSize ? (
    <Tooltip content="Expand to detailed view" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowExpand20Regular />}
        onClick={onToggleSize}
        aria-label="Expand card"
      />
    </Tooltip>
  ) : undefined;

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
      {expandButton}
    </div>
  );

  // Empty state
  if (!isLoading && !error && (!data || data.totalCount === 0)) {
    return (
      <BaseCard testId="upcoming-week-card" empty>
        <CardHeader
          icon={<CalendarWeekNumbers24Regular />}
          title="Upcoming Week"
          actions={expandButton}
        />
        <EmptyState
          icon={<CalendarWeekNumbers24Regular />}
          title="No upcoming events"
          description="Your calendar is free for the week"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading calendar..."
      testId="upcoming-week-card"
      className={styles.card}
    >
      <CardHeader
        icon={<CalendarWeekNumbers24Regular />}
        title="Upcoming Week"
        badge={data?.totalCount}
        actions={headerActions}
      />

      {/* Trend Chart */}
      {trendData && data && data.totalCount > 0 && (
        <div className={styles.chartContainer}>
          <TrendBarChart
            data={trendData.dataPoints}
            title="Meetings (Next 7 days)"
            trend={chartTrend}
            trendLabels={{
              improving: 'Quieter',
              worsening: 'Busier',
              stable: 'Steady',
            }}
            color="brand"
            footerText={`Avg: ${trendData.averageMeetingsPerDay} meetings/day`}
          />
        </div>
      )}

      {/* Statistics Grid */}
      {data && (
        <StatsGrid stats={statsData} />
      )}

      {/* Top Busiest Days - Limited to 1 item to fit in medium card */}
      {topItems.length > 0 && (
        <TopItemsList
          header="Busiest Days"
          items={topItems}
          maxItems={1}
        />
      )}

      {/* Expand Prompt */}
      {onToggleSize && (
        <div className={styles.expandPrompt} onClick={onToggleSize}>
          <ArrowExpand20Regular />
          <span>View all {data?.totalCount} events</span>
        </div>
      )}

      {/* Footer */}
      <div className={cardStyles.cardFooter}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
        </Text>
      </div>
    </BaseCard>
  );
};

export default UpcomingWeekCard;
