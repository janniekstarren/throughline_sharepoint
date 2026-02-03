import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  CalendarLtr24Regular,
  Clock24Regular,
  Location24Regular,
  Video24Regular,
  CheckmarkCircle20Regular,
  QuestionCircle20Regular,
  DismissCircle20Regular,
  Open20Regular,
} from '@fluentui/react-icons';
import { ICalendarEvent } from '../../services/GraphService';

export interface IEventDetailPanelProps {
  event: ICalendarEvent;
  onAction?: (action: string, event: ICalendarEvent) => void;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  subject: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.3,
    marginBottom: tokens.spacingVerticalS,
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  fieldIcon: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
    marginTop: '2px',
  },
  fieldContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  fieldLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  fieldValue: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  badges: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    marginTop: tokens.spacingVerticalS,
  },
  teamsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  divider: {
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke3,
    margin: `${tokens.spacingVerticalS} 0`,
  },
  // Action buttons
  actionsContainer: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  actionButton: {
    minWidth: 'auto',
  },
  primaryAction: {
    minWidth: 'auto',
  },
});

// Format date with weekday
const formatEventDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format time range
const formatTimeRange = (start: Date, end: Date, isAllDay: boolean): string => {
  if (isAllDay) {
    return 'All day';
  }
  const startTime = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const endTime = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${startTime} - ${endTime}`;
};

// Calculate duration
const formatDuration = (start: Date, end: Date, isAllDay: boolean): string => {
  if (isAllDay) {
    return 'All day event';
  }
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) {
    return `${diffMins} min`;
  }
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
};

export const EventDetailPanel: React.FC<IEventDetailPanelProps> = ({
  event,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {/* Subject */}
      <Text className={styles.subject}>{event.subject}</Text>

      {/* Date */}
      <div className={styles.fieldRow}>
        <CalendarLtr24Regular className={styles.fieldIcon} />
        <div className={styles.fieldContent}>
          <Text className={styles.fieldLabel}>Date</Text>
          <Text className={styles.fieldValue}>{formatEventDate(event.start)}</Text>
        </div>
      </div>

      {/* Time */}
      <div className={styles.fieldRow}>
        <Clock24Regular className={styles.fieldIcon} />
        <div className={styles.fieldContent}>
          <Text className={styles.fieldLabel}>Time</Text>
          <Text className={styles.fieldValue}>
            {formatTimeRange(event.start, event.end, event.isAllDay)}
          </Text>
          <Text style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>
            {formatDuration(event.start, event.end, event.isAllDay)}
          </Text>
        </div>
      </div>

      {/* Location */}
      {event.location && (
        <div className={styles.fieldRow}>
          <Location24Regular className={styles.fieldIcon} />
          <div className={styles.fieldContent}>
            <Text className={styles.fieldLabel}>Location</Text>
            <Text className={styles.fieldValue}>{event.location}</Text>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className={styles.badges}>
        {event.isOnlineMeeting && (
          <Badge
            appearance="tint"
            color="brand"
            icon={<Video24Regular />}
          >
            <span className={styles.teamsBadge}>
              <Video24Regular style={{ fontSize: '12px' }} />
              Teams Meeting
            </span>
          </Badge>
        )}
        {event.isAllDay && (
          <Badge appearance="tint" color="informative">
            All Day
          </Badge>
        )}
      </div>
    </div>
  );
};

// Separate component for action buttons (to be used in detail actions area)
export const EventDetailActions: React.FC<IEventDetailPanelProps> = ({
  event,
  onAction,
}) => {
  const styles = useStyles();

  const handleAction = (action: string): void => {
    if (onAction) {
      onAction(action, event);
    }
  };

  const handleJoinMeeting = (): void => {
    if (event.onlineMeetingUrl) {
      window.open(event.onlineMeetingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenInOutlook = (): void => {
    window.open(event.webLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.actionsContainer}>
      {/* Join Meeting - primary action for online meetings */}
      {event.isOnlineMeeting && event.onlineMeetingUrl && (
        <Tooltip content="Join Teams meeting" relationship="label">
          <Button
            appearance="primary"
            icon={<Video24Regular />}
            onClick={handleJoinMeeting}
            className={styles.primaryAction}
            size="small"
          >
            Join
          </Button>
        </Tooltip>
      )}

      {/* RSVP Actions */}
      <Tooltip content="Accept" relationship="label">
        <Button
          appearance="subtle"
          icon={<CheckmarkCircle20Regular />}
          onClick={() => handleAction('accept')}
          className={styles.actionButton}
          size="small"
        />
      </Tooltip>

      <Tooltip content="Tentative" relationship="label">
        <Button
          appearance="subtle"
          icon={<QuestionCircle20Regular />}
          onClick={() => handleAction('tentative')}
          className={styles.actionButton}
          size="small"
        />
      </Tooltip>

      <Tooltip content="Decline" relationship="label">
        <Button
          appearance="subtle"
          icon={<DismissCircle20Regular />}
          onClick={() => handleAction('decline')}
          className={styles.actionButton}
          size="small"
        />
      </Tooltip>

      {/* Open in Outlook */}
      <Tooltip content="Open in Outlook" relationship="label">
        <Button
          appearance="subtle"
          icon={<Open20Regular />}
          onClick={handleOpenInOutlook}
          className={styles.actionButton}
          size="small"
        />
      </Tooltip>
    </div>
  );
};

export default EventDetailPanel;
