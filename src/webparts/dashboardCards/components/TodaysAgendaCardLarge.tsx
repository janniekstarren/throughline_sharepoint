import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Theme,
} from '@fluentui/react-components';
import {
  CalendarLtr24Regular,
  Video16Regular,
  Location16Regular,
} from '@fluentui/react-icons';
import { ICalendarEvent } from '../services/GraphService';
import { MasterDetailCard } from './shared/MasterDetailCard';
import { EventDetailPanel, EventDetailActions } from './shared/EventDetailPanel';
import { HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface ITodaysAgendaCardLargeProps {
  events: ICalendarEvent[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

const useStyles = makeStyles({
  // Master item styles
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
  // Highlight for current event
  currentEventIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  // Empty state
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
});

// Format time for master list
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Check if an event is currently happening
const isCurrentEvent = (event: ICalendarEvent): boolean => {
  const now = new Date();
  return now >= event.start && now <= event.end;
};

// Sort events by start time
const sortEventsByTime = (events: ICalendarEvent[]): ICalendarEvent[] => {
  return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
};

// Find current or next event
const findCurrentOrNextEvent = (events: ICalendarEvent[]): ICalendarEvent | undefined => {
  const now = new Date();

  // First, look for currently happening event
  const currentEvent = events.find(e => isCurrentEvent(e));
  if (currentEvent) return currentEvent;

  // Then find the next upcoming event
  const sortedEvents = sortEventsByTime(events);
  const nextEvent = sortedEvents.find(e => e.start > now);
  if (nextEvent) return nextEvent;

  // If no upcoming events, return the first event
  return sortedEvents.length > 0 ? sortedEvents[0] : undefined;
};

export const TodaysAgendaCardLarge: React.FC<ITodaysAgendaCardLargeProps> = ({
  events,
  loading,
  error,
  onAction,
  theme,
  title = "Today's Agenda",
}) => {
  const styles = useStyles();
  const [selectedEvent, setSelectedEvent] = React.useState<ICalendarEvent | undefined>(undefined);

  // Sort events by time
  const sortedEvents = React.useMemo(() => sortEventsByTime(events), [events]);

  // Handler for selecting an event (wrapper to give TypeScript clear typing)
  const handleSelectEvent = React.useCallback((event: ICalendarEvent): void => {
    setSelectedEvent(event);
  }, []);

  // Auto-select current or first event when events load
  React.useEffect(() => {
    if (sortedEvents.length > 0 && !selectedEvent) {
      const eventToSelect = findCurrentOrNextEvent(sortedEvents);
      setSelectedEvent(eventToSelect);
    }
  }, [sortedEvents, selectedEvent]);

  // Handle action callback
  const handleEventAction = (action: string, event: ICalendarEvent): void => {
    if (onAction) {
      onAction(action, event as IHoverCardItem, 'event');
    }
  };

  // Render master item (compact event display)
  const renderMasterItem = (event: ICalendarEvent, isSelected: boolean): React.ReactNode => {
    const isCurrent = isCurrentEvent(event);

    return (
      <div className={styles.masterItem}>
        {/* Current event indicator */}
        {isCurrent && <div className={styles.currentEventIndicator} />}

        {/* Time block */}
        <div className={styles.timeBlock}>
          {event.isAllDay ? (
            <Text className={styles.allDayText}>All day</Text>
          ) : (
            <Text className={styles.timeText}>{formatTime(event.start)}</Text>
          )}
        </div>

        {/* Event info */}
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

  // Render detail content
  const renderDetailContent = (event: ICalendarEvent): React.ReactNode => {
    return <EventDetailPanel event={event} onAction={handleEventAction} />;
  };

  // Render detail actions
  const renderDetailActions = (event: ICalendarEvent): React.ReactNode => {
    return <EventDetailActions event={event} onAction={handleEventAction} />;
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <CalendarLtr24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select an event to view details</Text>
      </>
    );
  };

  // Render empty state (no events)
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <CalendarLtr24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No events scheduled for today</Text>
      </>
    );
  };

  return (
    <MasterDetailCard
      items={sortedEvents}
      selectedItem={selectedEvent}
      onItemSelect={handleSelectEvent}
      getItemKey={(event: ICalendarEvent) => event.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<CalendarLtr24Regular />}
      title={title}
      itemCount={sortedEvents.length}
      loading={loading}
      error={error}
      emptyMessage="No events scheduled for today"
      emptyIcon={<CalendarLtr24Regular />}
    />
  );
};

export default TodaysAgendaCardLarge;
