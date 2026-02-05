// ============================================
// TodaysAgendaCard - Medium Card (Summary View)
// Shows today's calendar events with chart, stats, and top items
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
  CalendarLtr24Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  CalendarLtr20Regular,
  Video20Regular,
  Clock20Regular,
  Timer20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useTodaysAgenda,
  ITodaysAgendaSettings,
  DEFAULT_TODAYS_AGENDA_SETTINGS,
} from '../../hooks/useTodaysAgenda';
import { TodaysAgendaData, AgendaTrendData } from '../../models/TodaysAgenda';
import { BaseCard, CardHeader, EmptyState, TrendBarChart, StatsGrid, TopItemsList } from '../shared';
import { StatItem, TopItem } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestTodaysAgendaData, getTestAgendaTrendData } from '../../services/testData/todaysAgenda';

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
interface TodaysAgendaCardProps {
  context: WebPartContext;
  settings?: ITodaysAgendaSettings;
  dataMode?: DataMode;
  onToggleSize?: () => void;
}

// ============================================
// Component
// ============================================
export const TodaysAgendaCard: React.FC<TodaysAgendaCardProps> = ({
  context,
  settings = DEFAULT_TODAYS_AGENDA_SETTINGS,
  dataMode = 'api',
  onToggleSize,
}) => {
  const cardStyles = useCardStyles();
  const styles = useStyles();

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = useState<TodaysAgendaData | null>(null);
  const [testTrendData, setTestTrendData] = useState<AgendaTrendData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestTodaysAgendaData());
        setTestTrendData(getTestAgendaTrendData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook (only used when dataMode === 'api')
  const apiHook = useTodaysAgenda(context, settings);

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
          setTestData(getTestTodaysAgendaData());
          setTestTrendData(getTestAgendaTrendData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Helper functions
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Stats grid data
  const statsData = useMemo((): [StatItem, StatItem, StatItem, StatItem] => {
    return [
      {
        label: 'Events',
        value: data?.totalCount || 0,
        icon: <CalendarLtr20Regular />,
      },
      {
        label: 'Online',
        value: data?.onlineMeetingCount || 0,
        icon: <Video20Regular />,
      },
      {
        label: 'Hours',
        value: data?.totalMeetingHours || 0,
        icon: <Clock20Regular />,
      },
      {
        label: 'Longest',
        value: data?.longestMeetingMinutes ? formatDuration(data.longestMeetingMinutes) : '-',
        icon: <Timer20Regular />,
      },
    ];
  }, [data]);

  // Top items (next 3 upcoming events)
  const topItems = useMemo((): TopItem[] => {
    if (!data) return [];

    const now = new Date();
    const upcomingEvents = data.events
      .filter(e => e.start > now || (now >= e.start && now <= e.end))
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 3);

    return upcomingEvents.map((event): TopItem => ({
      id: event.id,
      title: event.subject,
      subtitle: event.isAllDay ? 'All day' : `${formatTime(event.start)} - ${formatTime(event.end)}`,
      icon: event.isOnlineMeeting ? <Video20Regular /> : <CalendarLtr20Regular />,
      badge: event.isOnlineMeeting ? 'Online' : undefined,
      badgeColor: 'brand',
      onClick: () => window.open(event.webLink, '_blank', 'noopener,noreferrer'),
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
      <BaseCard testId="todays-agenda-card" empty>
        <CardHeader
          icon={<CalendarLtr24Regular />}
          title="Today's Agenda"
          actions={expandButton}
        />
        <EmptyState
          icon={<CalendarLtr24Regular />}
          title="No events scheduled"
          description="Your calendar is free today"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading calendar..."
      testId="todays-agenda-card"
      className={styles.card}
    >
      <CardHeader
        icon={<CalendarLtr24Regular />}
        title="Today's Agenda"
        badge={data?.totalCount}
        actions={headerActions}
      />

      {/* Trend Chart */}
      {trendData && data && data.totalCount > 0 && (
        <div className={styles.chartContainer}>
          <TrendBarChart
            data={trendData.dataPoints}
            title="Meetings (7 days)"
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

      {/* Top Upcoming Events - Limited to 1 item to fit in medium card */}
      {topItems.length > 0 && (
        <TopItemsList
          header="Coming Up"
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

export default TodaysAgendaCard;
