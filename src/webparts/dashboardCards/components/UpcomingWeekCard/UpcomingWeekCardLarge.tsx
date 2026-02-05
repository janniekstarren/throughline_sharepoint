// ============================================
// UpcomingWeekCardLarge - Large Card (Detail View)
// Master-detail layout with day tabs showing calendar events
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Tooltip,
  TabList,
  Tab,
  SelectTabEvent,
  SelectTabData,
} from '@fluentui/react-components';
import {
  CalendarWeekNumbers24Regular,
  Video16Regular,
  Location16Regular,
  ArrowMinimize20Regular,
  ArrowClockwiseRegular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useUpcomingWeek,
  IUpcomingWeekSettings,
  DEFAULT_UPCOMING_WEEK_SETTINGS,
} from '../../hooks/useUpcomingWeek';
import { UpcomingWeekData, WeekEvent } from '../../models/UpcomingWeek';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { EventDetailPanel, EventDetailActions } from '../shared/EventDetailPanel';
import { AIInsightBanner, AIOnboardingDialog } from '../shared/AIComponents';
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import { DataMode } from '../../services/testData';
import { getTestUpcomingWeekData } from '../../services/testData/upcomingWeek';
import { getGenericAICardSummary, getGenericAIInsights } from '../../services/testData/aiDemoData';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  tabContainer: {
    padding: `0 ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  timeBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '60px',
    flexShrink: 0,
  },
  timeText: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  allDayText: {
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorBrandForeground1,
  },
  eventInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  eventSubject: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  eventMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  locationText: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  teamsIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '14px',
    flexShrink: 0,
  },
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  emptyDayText: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
    padding: tokens.spacingVerticalL,
    textAlign: 'center',
  },
});

// ============================================
// Props Interface
// ============================================
interface UpcomingWeekCardLargeProps {
  context: WebPartContext;
  settings?: IUpcomingWeekSettings;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  onToggleSize?: () => void;
}

// ============================================
// Helper Functions
// ============================================
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const sortEventsByTime = (events: WeekEvent[]): WeekEvent[] => {
  return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
};

// ============================================
// Component
// ============================================
export const UpcomingWeekCardLarge: React.FC<UpcomingWeekCardLargeProps> = ({
  context,
  settings = DEFAULT_UPCOMING_WEEK_SETTINGS,
  dataMode = 'api',
  aiDemoMode = false,
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedEvent, setSelectedEvent] = useState<WeekEvent | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<string>('');

  // AI demo mode state
  const [aiCardSummary, setAiCardSummary] = useState<IAICardSummary | null>(null);
  const [aiInsights, setAiInsights] = useState<IAIInsight[]>([]);
  const [showAiOnboarding, setShowAiOnboarding] = useState(false);

  // Load AI demo data when enabled
  React.useEffect(() => {
    if (aiDemoMode) {
      setAiCardSummary(getGenericAICardSummary('upcomingWeek'));
      setAiInsights(getGenericAIInsights('upcomingWeek'));
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // Test data state
  const [testData, setTestData] = useState<UpcomingWeekData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestUpcomingWeekData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook
  const apiHook = useUpcomingWeek(context, settings);

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestUpcomingWeekData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Get available days from data
  const availableDays = useMemo(() => {
    if (!data) return [];
    return Array.from(data.byDay.keys());
  }, [data]);

  // Auto-select first day when data loads
  React.useEffect(() => {
    if (availableDays.length > 0 && !selectedDay) {
      setSelectedDay(availableDays[0]);
    }
  }, [availableDays, selectedDay]);

  // Get events for selected day
  const eventsForSelectedDay = useMemo(() => {
    if (!data || !selectedDay) return [];
    return sortEventsByTime(data.byDay.get(selectedDay) || []);
  }, [data, selectedDay]);

  // Auto-select first event when day changes
  React.useEffect(() => {
    if (eventsForSelectedDay.length > 0) {
      setSelectedEvent(eventsForSelectedDay[0]);
    } else {
      setSelectedEvent(undefined);
    }
  }, [eventsForSelectedDay]);

  const handleTabSelect = useCallback((_event: SelectTabEvent, data: SelectTabData): void => {
    setSelectedDay(data.value as string);
    setSelectedEvent(undefined);
  }, []);

  const handleSelectEvent = useCallback((event: WeekEvent): void => {
    setSelectedEvent(event);
  }, []);

  // Render master item
  const renderMasterItem = (event: WeekEvent, isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        <div className={styles.timeBlock}>
          {event.isAllDay ? (
            <Text className={styles.allDayText}>All day</Text>
          ) : (
            <Text className={styles.timeText}>{formatTime(event.start)}</Text>
          )}
        </div>
        <div className={styles.eventInfo}>
          <Text className={styles.eventSubject}>{event.subject}</Text>
          <div className={styles.eventMeta}>
            {event.isOnlineMeeting && (
              <Video16Regular className={styles.teamsIcon} />
            )}
            {event.location && (
              <span className={styles.locationText}>
                <Location16Regular />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render detail content - convert WeekEvent to format for EventDetailPanel
  const renderDetailContent = (event: WeekEvent): React.ReactNode => {
    const legacyEvent = {
      ...event,
      webLink: event.webLink,
    };
    return <EventDetailPanel event={legacyEvent} onAction={() => {}} />;
  };

  // Render detail actions
  const renderDetailActions = (event: WeekEvent): React.ReactNode => {
    const legacyEvent = {
      ...event,
      webLink: event.webLink,
    };
    return <EventDetailActions event={legacyEvent} onAction={() => {}} />;
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => (
    <>
      <CalendarWeekNumbers24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>Select an event to view details</Text>
    </>
  );

  // Render empty state
  const renderEmptyState = (): React.ReactNode => (
    <>
      <CalendarWeekNumbers24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>No events scheduled for this week</Text>
    </>
  );

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
      {onToggleSize && (
        <Tooltip content="Collapse to compact view" relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowMinimize20Regular />}
            onClick={onToggleSize}
            aria-label="Collapse card"
          />
        </Tooltip>
      )}
    </div>
  );

  // Header content with day tabs
  const headerContent = (
    <>
      {aiDemoMode && aiCardSummary && (
        <AIInsightBanner
          summary={aiCardSummary}
          insights={aiInsights}
          onLearnMore={handleAiLearnMore}
        />
      )}
      {availableDays.length > 0 && (
        <div className={styles.tabContainer}>
          <TabList
            selectedValue={selectedDay}
            onTabSelect={handleTabSelect}
            size="small"
          >
            {availableDays.map((day) => {
              const eventCount = data?.byDay.get(day)?.length || 0;
              return (
                <Tab key={day} value={day}>
                  {day} ({eventCount})
                </Tab>
              );
            })}
          </TabList>
        </div>
      )}
    </>
  );

  return (
    <>
      <MasterDetailCard
      items={eventsForSelectedDay}
      selectedItem={selectedEvent}
      onItemSelect={handleSelectEvent}
      getItemKey={(event: WeekEvent) => event.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<CalendarWeekNumbers24Regular />}
      title="Upcoming Week"
      itemCount={data?.totalCount}
      loading={isLoading && !data}
      error={error?.message}
      emptyMessage="No events scheduled for this week"
      emptyIcon={<CalendarWeekNumbers24Regular />}
      headerActions={headerActions}
      headerContent={headerContent}
    />

      {/* AI Onboarding Dialog */}
      <AIOnboardingDialog
        open={showAiOnboarding}
        onClose={() => setShowAiOnboarding(false)}
      />
    </>
  );
};

export default UpcomingWeekCardLarge;
