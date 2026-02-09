// ============================================
// TodaysAgendaCardLarge - Large Card (Detail View)
// Master-detail layout showing calendar events
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  CalendarLtr24Regular,
  Video16Regular,
  Location16Regular,
  
  ArrowClockwiseRegular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useTodaysAgenda,
  ITodaysAgendaSettings,
  DEFAULT_TODAYS_AGENDA_SETTINGS,
} from '../../hooks/useTodaysAgenda';
import { TodaysAgendaData, CalendarEvent } from '../../models/TodaysAgenda';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { EventDetailPanel, EventDetailActions } from '../shared/EventDetailPanel';
import { AIInsightBanner, AIOnboardingDialog } from '../shared/AIComponents';
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import { DataMode } from '../../services/testData';
import { getTestTodaysAgendaData } from '../../services/testData/todaysAgenda';
import {
  getAIAgendaCardSummary,
  getAllAgendaInsights,
} from '../../services/testData/aiDemoData';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
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
  currentEventIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: tokens.colorBrandForeground1,
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
});

// ============================================
// Props Interface
// ============================================
interface TodaysAgendaCardLargeProps {
  context: WebPartContext;
  settings?: ITodaysAgendaSettings;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  onSizeChange?: (size: CardSize) => void;
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

const isCurrentEvent = (event: CalendarEvent): boolean => {
  const now = new Date();
  return now >= event.start && now <= event.end;
};

const sortEventsByTime = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
};

const findCurrentOrNextEvent = (events: CalendarEvent[]): CalendarEvent | undefined => {
  const now = new Date();
  const currentEvent = events.find(e => isCurrentEvent(e));
  if (currentEvent) return currentEvent;

  const sortedEvents = sortEventsByTime(events);
  const nextEvent = sortedEvents.find(e => e.start > now);
  if (nextEvent) return nextEvent;

  return sortedEvents.length > 0 ? sortedEvents[0] : undefined;
};

// ============================================
// Component
// ============================================
export const TodaysAgendaCardLarge: React.FC<TodaysAgendaCardLargeProps> = ({
  context,
  settings = DEFAULT_TODAYS_AGENDA_SETTINGS,
  dataMode = 'api',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);

  // Test data state
  const [testData, setTestData] = useState<TodaysAgendaData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // AI demo mode state
  const [aiCardSummary, setAiCardSummary] = useState<IAICardSummary | null>(null);
  const [aiInsights, setAiInsights] = useState<IAIInsight[]>([]);
  const [showAiOnboarding, setShowAiOnboarding] = useState(false);

  // Load AI demo data when enabled
  React.useEffect(() => {
    if (aiDemoMode) {
      setAiCardSummary(getAIAgendaCardSummary());
      setAiInsights(getAllAgendaInsights());
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // Load test data
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestTodaysAgendaData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook
  const apiHook = useTodaysAgenda(context, settings);

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestTodaysAgendaData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Sorted events
  const sortedEvents = useMemo(() => {
    if (!data) return [];
    return sortEventsByTime(data.events);
  }, [data]);

  // Auto-select current or first event
  React.useEffect(() => {
    if (sortedEvents.length > 0 && !selectedEvent) {
      const eventToSelect = findCurrentOrNextEvent(sortedEvents);
      setSelectedEvent(eventToSelect);
    }
  }, [sortedEvents, selectedEvent]);

  const handleSelectEvent = useCallback((event: CalendarEvent): void => {
    setSelectedEvent(event);
  }, []);

  // Render master item
  const renderMasterItem = (event: CalendarEvent, isSelected: boolean): React.ReactNode => {
    const isCurrent = isCurrentEvent(event);

    return (
      <div className={styles.masterItem}>
        {isCurrent && <div className={styles.currentEventIndicator} />}
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

  // Render detail content - convert CalendarEvent to ICalendarEvent format for EventDetailPanel
  const renderDetailContent = (event: CalendarEvent): React.ReactNode => {
    const legacyEvent = {
      ...event,
      webLink: event.webLink,
    };
    return <EventDetailPanel event={legacyEvent} onAction={() => {}} />;
  };

  // Render detail actions
  const renderDetailActions = (event: CalendarEvent): React.ReactNode => {
    const legacyEvent = {
      ...event,
      webLink: event.webLink,
    };
    return <EventDetailActions event={legacyEvent} onAction={() => {}} />;
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => (
    <>
      <CalendarLtr24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>Select an event to view details</Text>
    </>
  );

  // Render empty state
  const renderEmptyState = (): React.ReactNode => (
    <>
      <CalendarLtr24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>No events scheduled for today</Text>
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
      <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
    </div>
  );

  // AI Insight Banner for header content
  const headerContent = aiDemoMode && aiCardSummary ? (
    <AIInsightBanner
      summary={aiCardSummary}
      insights={aiInsights}
      onLearnMore={handleAiLearnMore}
    />
  ) : undefined;

  return (
    <>
      <MasterDetailCard
        items={sortedEvents}
        selectedItem={selectedEvent}
        onItemSelect={handleSelectEvent}
        getItemKey={(event: CalendarEvent) => event.id}
        renderMasterItem={renderMasterItem}
        renderDetailContent={renderDetailContent}
        renderDetailActions={renderDetailActions}
        renderEmptyDetail={renderEmptyDetail}
        renderEmptyState={renderEmptyState}
        icon={<CalendarLtr24Regular />}
        title="Today's Agenda"
        itemCount={sortedEvents.length}
        loading={isLoading && !data}
        error={error?.message}
        emptyMessage="No events scheduled for today"
        emptyIcon={<CalendarLtr24Regular />}
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

export default TodaysAgendaCardLarge;
