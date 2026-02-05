// ============================================
// TodaysAgendaCard - Displays calendar events for today
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  tokens,
  mergeClasses,
  Caption1,
  Body1,
  Button,
  Theme,
} from '@fluentui/react-components';
import {
  CalendarLtr24Regular,
  Location16Regular,
  Video20Regular,
  ArrowExpand20Regular,
} from '@fluentui/react-icons';
import { ICalendarEvent } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { BaseCard, CardHeader, EmptyState } from './shared';
import { useCardStyles } from './cardStyles';

export interface ITodaysAgendaCardProps {
  events: ICalendarEvent[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

import { Tooltip } from '@fluentui/react-components';

export const TodaysAgendaCard: React.FC<ITodaysAgendaCardProps> = ({
  events,
  loading,
  error,
  onAction,
  theme,
  title,
  onToggleSize,
}) => {
  const styles = useCardStyles();

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentEvent = (event: ICalendarEvent): boolean => {
    const now = new Date();
    return now >= event.start && now <= event.end;
  };

  const handleJoinMeeting = (url: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Expand button for switching to large card view
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

  // Empty state
  if (!loading && !error && events.length === 0) {
    return (
      <BaseCard testId="todays-agenda-card">
        <CardHeader
          icon={<CalendarLtr24Regular />}
          title={title || "Today's Agenda"}
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
      loading={loading}
      error={error}
      loadingMessage="Loading calendar..."
      testId="todays-agenda-card"
    >
      <CardHeader
        icon={<CalendarLtr24Regular />}
        title={title || "Today's Agenda"}
        badge={events.length > 0 ? events.length : undefined}
        actions={expandButton}
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div className={styles.itemList}>
            {events.map(event => (
              <ItemHoverCard
                key={event.id}
                item={event}
                itemType="event"
                onAction={onAction}
                theme={theme}
              >
                <div
                  className={mergeClasses(
                    styles.item,
                    isCurrentEvent(event) && styles.itemHighlight
                  )}
                  role="button"
                  tabIndex={0}
                  style={{ alignItems: 'flex-start', gap: tokens.spacingHorizontalM }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    minWidth: '60px',
                    color: tokens.colorNeutralForeground3
                  }}>
                    {event.isAllDay ? (
                      <Caption1 style={{ fontStyle: 'italic' }}>All day</Caption1>
                    ) : (
                      <>
                        <Caption1>{formatTime(event.start)}</Caption1>
                        <Caption1>{formatTime(event.end)}</Caption1>
                      </>
                    )}
                  </div>
                  <div className={styles.itemContent}>
                    <Body1 className={styles.itemTitle}>{event.subject}</Body1>
                    {event.location && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacingHorizontalXS,
                        marginTop: tokens.spacingVerticalXS,
                        color: tokens.colorNeutralForeground3
                      }}>
                        <Location16Regular style={{ fontSize: '14px' }} />
                        <Caption1>{event.location}</Caption1>
                      </div>
                    )}
                  </div>
                  {event.isOnlineMeeting && event.onlineMeetingUrl && (
                    <Button
                      appearance="primary"
                      size="small"
                      icon={<Video20Regular />}
                      onClick={(e) => handleJoinMeeting(event.onlineMeetingUrl!, e)}
                      title="Join meeting"
                      style={{ flexShrink: 0 }}
                    />
                  )}
                </div>
              </ItemHoverCard>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </BaseCard>
  );
};

export default TodaysAgendaCard;
