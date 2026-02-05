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
  ContractDownLeft20Regular,
} from '@fluentui/react-icons';
import { Button, Tooltip } from '@fluentui/react-components';
import { ICalendarEvent } from '../services/GraphService';
import { MasterDetailCard } from './shared/MasterDetailCard';
import { EventDetailPanel, EventDetailActions } from './shared/EventDetailPanel';
import { HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IUpcomingWeekCardLargeProps {
  events: ICalendarEvent[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

const useStyles = makeStyles({
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  dateBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '50px',
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalXS,
  },
  dayName: {
    fontSize: '10px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
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
  timeText: {
    fontWeight: 500,
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
  // Today indicator
  todayIndicator: {
    backgroundColor: tokens.colorBrandBackground,
  },
  todayDayName: {
    color: tokens.colorNeutralForegroundOnBrand,
  },
  todayDayNumber: {
    color: tokens.colorNeutralForegroundOnBrand,
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

// Format time
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Get day name (short)
const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Get day number
const getDayNumber = (date: Date): string => {
  return date.getDate().toString();
};

// Check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Sort events by start time
const sortEventsByTime = (events: ICalendarEvent[]): ICalendarEvent[] => {
  return [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
};

// Find first upcoming event
const findFirstUpcomingEvent = (events: ICalendarEvent[]): ICalendarEvent | undefined => {
  const now = new Date();
  const sortedEvents = sortEventsByTime(events);
  const upcomingEvent = sortedEvents.find(e => e.start > now);
  return upcomingEvent || (sortedEvents.length > 0 ? sortedEvents[0] : undefined);
};

export const UpcomingWeekCardLarge: React.FC<IUpcomingWeekCardLargeProps> = ({
  events,
  loading,
  error,
  onAction,
  theme,
  title = 'Upcoming Week',
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedEvent, setSelectedEvent] = React.useState<ICalendarEvent | undefined>(undefined);

  // Sort events by time
  const sortedEvents = React.useMemo(() => sortEventsByTime(events), [events]);

  // Handler for selecting an event (wrapper to give TypeScript clear typing)
  const handleSelectEvent = React.useCallback((event: ICalendarEvent): void => {
    setSelectedEvent(event);
  }, []);

  // Auto-select first upcoming event when events load
  React.useEffect(() => {
    if (sortedEvents.length > 0 && !selectedEvent) {
      const eventToSelect = findFirstUpcomingEvent(sortedEvents);
      setSelectedEvent(eventToSelect);
    }
  }, [sortedEvents, selectedEvent]);

  // Handle action callback
  const handleEventAction = (action: string, event: ICalendarEvent): void => {
    if (onAction) {
      onAction(action, event as IHoverCardItem, 'event');
    }
  };

  // Render master item (compact event display with date)
  const renderMasterItem = (event: ICalendarEvent, isSelected: boolean): React.ReactNode => {
    const eventIsToday = isToday(event.start);

    return (
      <div className={styles.masterItem}>
        {/* Date block */}
        <div className={`${styles.dateBlock} ${eventIsToday ? styles.todayIndicator : ''}`}>
          <Text className={`${styles.dayName} ${eventIsToday ? styles.todayDayName : ''}`}>
            {getDayName(event.start)}
          </Text>
          <Text className={`${styles.dayNumber} ${eventIsToday ? styles.todayDayNumber : ''}`}>
            {getDayNumber(event.start)}
          </Text>
        </div>

        {/* Event info */}
        <div className={styles.eventInfo}>
          <Text className={styles.eventSubject}>{event.subject}</Text>
          <div className={styles.eventMeta}>
            {event.isAllDay ? (
              <Text className={styles.timeText}>All day</Text>
            ) : (
              <Text className={styles.timeText}>{formatTime(event.start)}</Text>
            )}
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
        <Text className={styles.emptyText}>No events this week</Text>
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
      emptyMessage="No events this week"
      emptyIcon={<CalendarLtr24Regular />}
      headerActions={
        onToggleSize && (
          <Tooltip content="Collapse to compact view" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<ContractDownLeft20Regular />}
              onClick={onToggleSize}
              aria-label="Collapse card"
            />
          </Tooltip>
        )
      }
    />
  );
};

export default UpcomingWeekCardLarge;
