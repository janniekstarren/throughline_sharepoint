import * as React from 'react';
import {
  makeStyles,
  tokens,
  mergeClasses,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  CalendarLtr24Regular,
  ErrorCircle24Regular,
  Location16Regular,
  Video20Regular,
} from '@fluentui/react-icons';
import {
  createPresenceComponent,
  motionTokens,
} from '@fluentui/react-motion';
import { ICalendarEvent } from '../services/GraphService';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface ITodaysAgendaCardProps {
  events: ICalendarEvent[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

// Motion animations
const CardEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMid,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMid,
  },
});

const ListItemEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateX(-8px)' },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMid,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMid,
  },
});

// Modern Fluent 2 styles - clean, minimal, sophisticated
const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '320px',
    maxHeight: '440px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    transitionProperty: 'box-shadow, transform',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.67, 1)',
    ':hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)',
    },
  },
  // Clean header - NO gray background, NO border
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px 12px',
    flexShrink: 0,
  },
  cardIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, rgba(0, 102, 204, 0.08) 100%)`,
  },
  cardIcon: {
    fontSize: '16px',
    color: tokens.colorBrandForeground1,
  },
  cardTitle: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.01em',
  },
  cardContent: {
    flex: 1,
    padding: '0 20px 16px',
    overflowY: 'auto',
    minHeight: 0,
    // Custom scrollbar
    '::-webkit-scrollbar': {
      width: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '3px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(0, 0, 0, 0.15)',
    },
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    flex: 1,
    gap: '12px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: tokens.colorNeutralForeground3,
    gap: '12px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '40px',
    color: tokens.colorPaletteRedForeground1,
    opacity: 0.5,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: tokens.colorNeutralForeground3,
    gap: '12px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '40px',
    color: tokens.colorNeutralForeground4,
    opacity: 0.5,
  },
  eventList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  // Clean items - NO gray background, hover only
  eventItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    textDecoration: 'none',
    color: 'inherit',
    gap: '12px',
    transitionProperty: 'background-color, transform',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.67, 1)',
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
      outlineOffset: '-2px',
    },
  },
  currentEvent: {
    position: 'relative',
    backgroundColor: tokens.colorBrandBackground2,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
    '::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '8px',
      bottom: '8px',
      width: '3px',
      borderRadius: '2px',
      backgroundColor: tokens.colorBrandForeground1,
    },
  },
  eventTime: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '50px',
    flexShrink: 0,
  },
  timeMain: {
    fontSize: '13px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
  },
  timeSub: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground4,
  },
  allDay: {
    fontSize: '11px',
    fontStyle: 'italic',
    color: tokens.colorNeutralForeground4,
  },
  eventDetails: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  eventSubject: {
    fontSize: '14px',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
    lineHeight: '1.4',
  },
  eventLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  locationIcon: {
    fontSize: '10px',
    opacity: 0.7,
  },
  // Teams meeting button - Fluent 2 style
  joinButton: {
    minWidth: '32px',
    height: '32px',
    padding: '0 12px',
    flexShrink: 0,
    borderRadius: '6px',
    backgroundColor: '#6264A7', // Teams purple
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transitionProperty: 'background-color, transform, box-shadow',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'ease-out',
    ':hover': {
      backgroundColor: '#4F5291', // Darker Teams purple
      transform: 'scale(1.02)',
      boxShadow: '0 2px 8px rgba(98, 100, 167, 0.3)',
    },
    ':active': {
      transform: 'scale(0.98)',
      backgroundColor: '#464775',
    },
  },
});

export const TodaysAgendaCard: React.FC<ITodaysAgendaCardProps> = ({ events, loading, error, onAction, theme, title }) => {
  const styles = useStyles();

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

  return (
    <CardEnter visible={true}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconWrapper}>
            <CalendarLtr24Regular className={styles.cardIcon} />
          </div>
          <Body1Strong className={styles.cardTitle}>{title || "Today's Agenda"}</Body1Strong>
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
              <Text>No events scheduled for today</Text>
            </div>
          ) : (
            <div className={styles.eventList}>
              {events.map((event, index) => (
                <ListItemEnter key={event.id} visible={true}>
                  <div style={{ animationDelay: `${index * 50}ms` }}>
                    <ItemHoverCard
                      item={event}
                      itemType="event"
                      onAction={onAction}
                      theme={theme}
                    >
                      <div
                        className={mergeClasses(
                          styles.eventItem,
                          isCurrentEvent(event) && styles.currentEvent
                        )}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={styles.eventTime}>
                          {event.isAllDay ? (
                            <Caption1 className={styles.allDay}>All day</Caption1>
                          ) : (
                            <>
                              <span className={styles.timeMain}>{formatTime(event.start)}</span>
                              <span className={styles.timeSub}>{formatTime(event.end)}</span>
                            </>
                          )}
                        </div>
                        <div className={styles.eventDetails}>
                          <Body1 className={styles.eventSubject}>{event.subject}</Body1>
                          {event.location && (
                            <div className={styles.eventLocation}>
                              <Location16Regular className={styles.locationIcon} />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        {event.isOnlineMeeting && event.onlineMeetingUrl && (
                          <button
                            className={styles.joinButton}
                            onClick={(e) => handleJoinMeeting(event.onlineMeetingUrl!, e)}
                            title="Join Teams meeting"
                          >
                            <Video20Regular />
                            <span>Join</span>
                          </button>
                        )}
                      </div>
                    </ItemHoverCard>
                  </div>
                </ListItemEnter>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardEnter>
  );
};

export default TodaysAgendaCard;
