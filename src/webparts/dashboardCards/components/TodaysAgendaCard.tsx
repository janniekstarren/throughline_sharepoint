import * as React from 'react';
import {
  makeStyles,
  tokens,
  mergeClasses,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Button,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  CalendarLtr24Regular,
  ErrorCircle24Regular,
  Location16Regular,
  Video20Regular,
} from '@fluentui/react-icons';
import { ICalendarEvent } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface ITodaysAgendaCardProps {
  events: ICalendarEvent[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
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
    color: tokens.colorNeutralForeground1,
  },
  cardContent: {
    flex: 1,
    padding: tokens.spacingVerticalM,
    overflowY: 'auto',
    minHeight: 0,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    flex: 1,
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
  eventList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
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
  currentEvent: {
    borderLeft: `3px solid ${tokens.colorBrandForeground1}`,
    backgroundColor: tokens.colorBrandBackground2,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
  },
  eventTime: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: '60px',
    color: tokens.colorNeutralForeground3,
  },
  allDay: {
    fontStyle: 'italic',
  },
  eventDetails: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  eventSubject: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
  },
  eventLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
  },
  locationIcon: {
    fontSize: '14px',
  },
  joinButton: {
    flexShrink: 0,
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
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <CalendarLtr24Regular className={styles.cardIcon} />
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
          <MotionWrapper visible={true}>
            <div className={styles.emptyState}>
              <CalendarLtr24Regular className={styles.emptyIcon} />
              <Text>No events scheduled for today</Text>
            </div>
          </MotionWrapper>
        ) : (
          <MotionWrapper visible={true}>
            <div className={styles.eventList}>
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
                          <Caption1>{formatTime(event.start)}</Caption1>
                          <Caption1>{formatTime(event.end)}</Caption1>
                        </>
                      )}
                    </div>
                    <div className={styles.eventDetails}>
                      <Body1 className={styles.eventSubject}>{event.subject}</Body1>
                      {event.location && (
                        <div className={styles.eventLocation}>
                          <Location16Regular className={styles.locationIcon} />
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
                        className={styles.joinButton}
                      />
                    )}
                  </div>
                </ItemHoverCard>
              ))}
            </div>
          </MotionWrapper>
        )}
      </div>
    </div>
  );
};

export default TodaysAgendaCard;
