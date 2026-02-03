import * as React from 'react';
import {
  tokens,
  Text,
  Caption1,
  Body1,
  Body1Strong,
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
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { useCardStyles, CardEnter, ListItemEnter } from './cardStyles';

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

export const UpcomingWeekCard: React.FC<IUpcomingWeekCardProps> = ({ events, loading, error, onAction, theme, title }) => {
  const styles = useCardStyles();

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
    <CardEnter visible={true}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconWrapper}>
            <CalendarWeekNumbers24Regular className={styles.cardIcon} />
          </div>
          <Body1Strong className={styles.cardTitle}>{title || 'Upcoming Week'}</Body1Strong>
          {!loading && events.length > 0 && (
            <span className={styles.badge}>{events.length}</span>
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
            <div className={styles.emptyState}>
              <CalendarLtr24Regular className={styles.emptyIcon} />
              <Text>No events this week</Text>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sortedDays.map(dayKey => (
                <div key={dayKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '12px',
                    color: tokens.colorNeutralForeground3,
                    paddingBottom: '4px',
                    marginBottom: '4px'
                  }}>
                    {getDayLabel(new Date(dayKey))}
                  </div>
                  <div className={styles.itemList}>
                    {groupedEvents[dayKey].map((event, index) => (
                      <ListItemEnter key={event.id} visible={true}>
                        <div style={{ animationDelay: `${index * 50}ms` }}>
                          <ItemHoverCard
                            item={event}
                            itemType="event"
                            onAction={onAction}
                            theme={theme}
                          >
                            <div
                              className={styles.item}
                              role="button"
                              tabIndex={0}
                              style={{ alignItems: 'flex-start' }}
                            >
                              <Caption1 className={styles.itemMeta} style={{ minWidth: '60px', flexShrink: 0 }}>
                                {event.isAllDay ? 'All day' : formatTime(event.start)}
                              </Caption1>
                              <div className={styles.itemContent}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {event.isOnlineMeeting && (
                                    <Video16Regular style={{ color: tokens.colorBrandForeground1, flexShrink: 0 }} />
                                  )}
                                  <Body1 className={styles.itemTitle}>{event.subject}</Body1>
                                </div>
                                {event.location && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <Location16Regular style={{ color: tokens.colorNeutralForeground3 }} />
                                    <Caption1 className={styles.itemMeta}>{event.location}</Caption1>
                                  </div>
                                )}
                              </div>
                            </div>
                          </ItemHoverCard>
                        </div>
                      </ListItemEnter>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardEnter>
  );
};

export default UpcomingWeekCard;
