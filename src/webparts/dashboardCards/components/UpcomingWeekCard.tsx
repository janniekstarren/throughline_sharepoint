import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Badge,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  CalendarWeekNumbers24Regular,
  ErrorCircle24Regular,
  CalendarLtr24Regular,
  Video16Regular,
  Location16Regular,
} from '@fluentui/react-icons';
import { ICalendarEvent } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IUpcomingWeekCardProps {
  events: ICalendarEvent[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

interface IGroupedEvents {
  [key: string]: ICalendarEvent[];
}

// Fluent UI 9 styles using makeStyles and design tokens
const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    flexShrink: 0,
  },
  cardIcon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
  },
  cardTitle: {
    flex: 1,
    color: tokens.colorNeutralForeground1,
  },
  cardContent: {
    flex: 1,
    padding: tokens.spacingVerticalM,
    overflowY: 'auto',
    minHeight: 0,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalS,
  },
  errorIcon: {
    fontSize: '24px',
    color: tokens.colorPaletteRedForeground1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalS,
  },
  emptyIcon: {
    fontSize: '32px',
    color: tokens.colorNeutralForeground4,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    flex: 1,
  },
  dayGroups: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  dayGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  dayHeader: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    paddingBottom: tokens.spacingVerticalXS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    marginBottom: tokens.spacingVerticalXS,
  },
  eventList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  eventItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground2,
    textDecoration: 'none',
    color: 'inherit',
    gap: tokens.spacingHorizontalM,
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
    },
  },
  eventTime: {
    minWidth: '60px',
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  eventDetails: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  eventSubject: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
  },
  meetingIcon: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  eventLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
  },
});

export const UpcomingWeekCard: React.FC<IUpcomingWeekCardProps> = ({ events, loading, error, onAction, theme, title }) => {
  const styles = useStyles();

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDayLabel = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (eventDay.getTime() === todayDay.getTime()) return 'Today';
    if (eventDay.getTime() === tomorrowDay.getTime()) return 'Tomorrow';
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const groupEventsByDay = (eventList: ICalendarEvent[]): IGroupedEvents => {
    return eventList.reduce((groups: IGroupedEvents, event) => {
      const dayKey = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate()).toISOString();
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(event);
      return groups;
    }, {});
  };

  const groupedEvents = groupEventsByDay(events);
  const sortedDays = Object.keys(groupedEvents).sort();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <CalendarWeekNumbers24Regular className={styles.cardIcon} />
        <Body1Strong className={styles.cardTitle}>{title || 'Upcoming Week'}</Body1Strong>
        {!loading && events.length > 0 && (
          <Badge appearance="filled" color="brand" size="small">{events.length}</Badge>
        )}
      </div>
      <div className={styles.cardContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner size="medium" />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <ErrorCircle24Regular className={styles.errorIcon} />
            <Text>{error}</Text>
          </div>
        ) : events.length === 0 ? (
          <MotionWrapper visible={true}>
            <div className={styles.emptyState}>
              <CalendarLtr24Regular className={styles.emptyIcon} />
              <Text>No events this week</Text>
            </div>
          </MotionWrapper>
        ) : (
          <MotionWrapper visible={true}>
            <div className={styles.dayGroups}>
              {sortedDays.map(dayKey => (
                <div key={dayKey} className={styles.dayGroup}>
                  <div className={styles.dayHeader}>
                    {getDayLabel(new Date(dayKey))}
                  </div>
                  <div className={styles.eventList}>
                    {groupedEvents[dayKey].map(event => (
                      <ItemHoverCard
                        key={event.id}
                        item={event}
                        itemType="event"
                        onAction={onAction}
                        theme={theme}
                      >
                        <div
                          className={styles.eventItem}
                          role="button"
                          tabIndex={0}
                        >
                          <Caption1 className={styles.eventTime}>
                            {event.isAllDay ? 'All day' : formatTime(event.start)}
                          </Caption1>
                          <div className={styles.eventDetails}>
                            <div className={styles.eventSubject}>
                              {event.isOnlineMeeting && (
                                <Video16Regular className={styles.meetingIcon} />
                              )}
                              <Body1>{event.subject}</Body1>
                            </div>
                            {event.location && (
                              <div className={styles.eventLocation}>
                                <Location16Regular />
                                <Caption1>{event.location}</Caption1>
                              </div>
                            )}
                          </div>
                        </div>
                      </ItemHoverCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </MotionWrapper>
        )}
      </div>
    </div>
  );
};

export default UpcomingWeekCard;
