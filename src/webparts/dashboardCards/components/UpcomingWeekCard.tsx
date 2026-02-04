// ============================================
// UpcomingWeekCard - Displays events for the upcoming week
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  tokens,
  Caption1,
  Body1,
  Theme,
} from '@fluentui/react-components';
import {
  CalendarWeekNumbers24Regular,
  CalendarLtr24Regular,
  Video16Regular,
  Location16Regular,
} from '@fluentui/react-icons';
import { ICalendarEvent } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { BaseCard, CardHeader, EmptyState } from './shared';
import { useCardStyles } from './cardStyles';

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

export const UpcomingWeekCard: React.FC<IUpcomingWeekCardProps> = ({
  events,
  loading,
  error,
  onAction,
  theme,
  title
}) => {
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

  // Empty state
  if (!loading && !error && events.length === 0) {
    return (
      <BaseCard testId="upcoming-week-card">
        <CardHeader
          icon={<CalendarWeekNumbers24Regular />}
          title={title || 'Upcoming Week'}
        />
        <EmptyState
          icon={<CalendarLtr24Regular />}
          title="No events this week"
          description="Scheduled events will appear here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={loading}
      error={error}
      loadingMessage="Loading calendar..."
      testId="upcoming-week-card"
    >
      <CardHeader
        icon={<CalendarWeekNumbers24Regular />}
        title={title || 'Upcoming Week'}
        badge={events.length > 0 ? events.length : undefined}
        badgeVariant="brand"
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalM
          }}>
            {sortedDays.map(dayKey => (
              <div key={dayKey} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacingVerticalXS
              }}>
                <div style={{
                  fontWeight: tokens.fontWeightSemibold,
                  fontSize: tokens.fontSizeBase200,
                  color: tokens.colorNeutralForeground3,
                  paddingBottom: tokens.spacingVerticalXS,
                  borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
                  marginBottom: tokens.spacingVerticalXS
                }}>
                  {getDayLabel(new Date(dayKey))}
                </div>
                <div className={styles.itemList}>
                  {groupedEvents[dayKey].map(event => (
                    <ItemHoverCard
                      key={event.id}
                      item={event}
                      itemType="event"
                      onAction={onAction}
                      theme={theme}
                    >
                      <div
                        className={styles.item}
                        role="button"
                        tabIndex={0}
                        style={{ alignItems: 'flex-start', gap: tokens.spacingHorizontalM }}
                      >
                        <Caption1 style={{
                          minWidth: '60px',
                          color: tokens.colorNeutralForeground3,
                          flexShrink: 0
                        }}>
                          {event.isAllDay ? 'All day' : formatTime(event.start)}
                        </Caption1>
                        <div className={styles.itemContent}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacingHorizontalXS
                          }}>
                            {event.isOnlineMeeting && (
                              <Video16Regular style={{
                                color: tokens.colorBrandForeground1,
                                flexShrink: 0
                              }} />
                            )}
                            <Body1 className={styles.itemTitle}>{event.subject}</Body1>
                          </div>
                          {event.location && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: tokens.spacingHorizontalXS,
                              marginTop: tokens.spacingVerticalXS,
                              color: tokens.colorNeutralForeground3
                            }}>
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
      </div>
    </BaseCard>
  );
};

export default UpcomingWeekCard;
