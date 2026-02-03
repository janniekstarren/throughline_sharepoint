import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Button,
  Tooltip,
  Avatar,
} from '@fluentui/react-components';
import {
  Clock24Regular,
  ArrowReply20Regular,
  ArrowForward20Regular,
  Flag20Regular,
  MailRead20Regular,
  Delete20Regular,
  Open20Regular,
  Attach20Regular,
  Important20Regular,
} from '@fluentui/react-icons';
import { IEmailMessage } from '../../services/GraphService';

export interface IEmailDetailPanelProps {
  email: IEmailMessage;
  onAction?: (action: string, email: IEmailMessage) => void;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  // From section with avatar
  fromSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  fromAvatar: {
    flexShrink: 0,
  },
  fromInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  fromName: {
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  fromEmail: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  // Subject
  subject: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.3,
  },
  // Field rows
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
  // Body preview
  bodyPreview: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.5,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    maxHeight: '120px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    // Custom scrollbar
    '::-webkit-scrollbar': {
      width: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke2,
      borderRadius: '2px',
    },
  },
  // Badges
  badges: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  importanceBadge: {
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
  dangerButton: {
    minWidth: 'auto',
    color: tokens.colorPaletteRedForeground1,
    ':hover': {
      color: tokens.colorPaletteRedForeground1,
      backgroundColor: tokens.colorPaletteRedBackground1,
    },
  },
});

// Format date/time
const formatDateTime = (date: Date): string => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Get initials from name
const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const EmailDetailPanel: React.FC<IEmailDetailPanelProps> = ({
  email,
  onAction,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {/* From section with avatar */}
      <div className={styles.fromSection}>
        <Avatar
          name={email.from.name}
          initials={getInitials(email.from.name)}
          size={40}
          className={styles.fromAvatar}
          color="brand"
        />
        <div className={styles.fromInfo}>
          <Text className={styles.fromName}>{email.from.name}</Text>
          <Text className={styles.fromEmail}>{email.from.email}</Text>
        </div>
      </div>

      {/* Subject */}
      <Text className={styles.subject}>{email.subject}</Text>

      {/* Received time */}
      <div className={styles.fieldRow}>
        <Clock24Regular className={styles.fieldIcon} />
        <div className={styles.fieldContent}>
          <Text className={styles.fieldLabel}>Received</Text>
          <Text className={styles.fieldValue}>{formatDateTime(email.receivedDateTime)}</Text>
        </div>
      </div>

      {/* Badges */}
      <div className={styles.badges}>
        {email.importance === 'high' && (
          <Badge
            appearance="tint"
            color="danger"
            icon={<Important20Regular />}
          >
            <span className={styles.importanceBadge}>
              High Priority
            </span>
          </Badge>
        )}
        {email.hasAttachments && (
          <Badge
            appearance="tint"
            color="informative"
            icon={<Attach20Regular />}
          >
            Attachments
          </Badge>
        )}
        {!email.isRead && (
          <Badge appearance="filled" color="brand">
            Unread
          </Badge>
        )}
      </div>

      {/* Body preview */}
      {email.bodyPreview && (
        <div className={styles.bodyPreview}>
          {email.bodyPreview}
        </div>
      )}
    </div>
  );
};

// Separate component for action buttons (to be used in detail actions area)
export const EmailDetailActions: React.FC<IEmailDetailPanelProps> = ({
  email,
  onAction,
}) => {
  const styles = useStyles();

  const handleAction = (action: string): void => {
    if (onAction) {
      onAction(action, email);
    }
  };

  const handleOpenInOutlook = (): void => {
    window.open(email.webLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.actionsContainer}>
      {/* Reply */}
      <Tooltip content="Reply" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowReply20Regular />}
          onClick={() => handleAction('reply')}
          className={styles.actionButton}
          size="small"
        />
      </Tooltip>

      {/* Forward */}
      <Tooltip content="Forward" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowForward20Regular />}
          onClick={() => handleAction('forward')}
          className={styles.actionButton}
          size="small"
        />
      </Tooltip>

      {/* Flag/Unflag */}
      <Tooltip content="Flag" relationship="label">
        <Button
          appearance="subtle"
          icon={<Flag20Regular />}
          onClick={() => handleAction('flag')}
          className={styles.actionButton}
          size="small"
        />
      </Tooltip>

      {/* Mark Read/Unread */}
      <Tooltip content={email.isRead ? "Mark as unread" : "Mark as read"} relationship="label">
        <Button
          appearance="subtle"
          icon={<MailRead20Regular />}
          onClick={() => handleAction('markRead')}
          className={styles.actionButton}
          size="small"
        />
      </Tooltip>

      {/* Delete */}
      <Tooltip content="Delete" relationship="label">
        <Button
          appearance="subtle"
          icon={<Delete20Regular />}
          onClick={() => handleAction('delete')}
          className={styles.dangerButton}
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

export default EmailDetailPanel;
