import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Theme,
  Avatar,
} from '@fluentui/react-components';
import {
  Mail24Regular,
  Attach16Regular,
  Important16Regular,
  ContractDownLeft20Regular,
} from '@fluentui/react-icons';
import { Button, Tooltip } from '@fluentui/react-components';
import { IEmailMessage } from '../services/GraphService';
import { MasterDetailCard } from './shared/MasterDetailCard';
import { EmailDetailPanel, EmailDetailActions } from './shared/EmailDetailPanel';
import { HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IUnreadInboxCardLargeProps {
  emails: IEmailMessage[];
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
  avatar: {
    flexShrink: 0,
  },
  emailInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  emailHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  fromName: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  timeText: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  subjectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  subjectText: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  iconIndicator: {
    fontSize: '14px',
    flexShrink: 0,
  },
  importanceIcon: {
    color: tokens.colorPaletteRedForeground1,
  },
  attachmentIcon: {
    color: tokens.colorNeutralForeground3,
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

// Get initials from name
const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Format time for master list
const formatTime = (date: Date): string => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // If not today, show day/month
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// Sort emails by received time (newest first)
const sortEmailsByTime = (emails: IEmailMessage[]): IEmailMessage[] => {
  return [...emails].sort((a, b) => b.receivedDateTime.getTime() - a.receivedDateTime.getTime());
};

export const UnreadInboxCardLarge: React.FC<IUnreadInboxCardLargeProps> = ({
  emails,
  loading,
  error,
  onAction,
  theme,
  title = 'Unread Inbox',
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedEmail, setSelectedEmail] = React.useState<IEmailMessage | undefined>(undefined);

  // Sort emails by time (newest first)
  const sortedEmails = React.useMemo(() => sortEmailsByTime(emails), [emails]);

  // Handler for selecting an email (wrapper to give TypeScript clear typing)
  const handleSelectEmail = React.useCallback((email: IEmailMessage): void => {
    setSelectedEmail(email);
  }, []);

  // Auto-select first email when emails load
  React.useEffect(() => {
    if (sortedEmails.length > 0 && !selectedEmail) {
      setSelectedEmail(sortedEmails[0]);
    }
  }, [sortedEmails, selectedEmail]);

  // Handle action callback
  const handleEmailAction = (action: string, email: IEmailMessage): void => {
    if (onAction) {
      onAction(action, email as IHoverCardItem, 'email');
    }
  };

  // Render master item (compact email display)
  const renderMasterItem = (email: IEmailMessage, isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        {/* Avatar */}
        <Avatar
          name={email.from.name}
          initials={getInitials(email.from.name)}
          size={32}
          className={styles.avatar}
          color="brand"
        />

        {/* Email info */}
        <div className={styles.emailInfo}>
          {/* From + time */}
          <div className={styles.emailHeader}>
            <Text className={styles.fromName}>{email.from.name}</Text>
            <Text className={styles.timeText}>{formatTime(email.receivedDateTime)}</Text>
          </div>

          {/* Subject + indicators */}
          <div className={styles.subjectRow}>
            {email.importance === 'high' && (
              <Important16Regular className={`${styles.iconIndicator} ${styles.importanceIcon}`} />
            )}
            <Text className={styles.subjectText}>{email.subject}</Text>
            {email.hasAttachments && (
              <Attach16Regular className={`${styles.iconIndicator} ${styles.attachmentIcon}`} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (email: IEmailMessage): React.ReactNode => {
    return <EmailDetailPanel email={email} onAction={handleEmailAction} />;
  };

  // Render detail actions
  const renderDetailActions = (email: IEmailMessage): React.ReactNode => {
    return <EmailDetailActions email={email} onAction={handleEmailAction} />;
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <Mail24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select an email to view details</Text>
      </>
    );
  };

  // Render empty state (no emails)
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <Mail24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No unread emails</Text>
      </>
    );
  };

  return (
    <MasterDetailCard
      items={sortedEmails}
      selectedItem={selectedEmail}
      onItemSelect={handleSelectEmail}
      getItemKey={(email: IEmailMessage) => email.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<Mail24Regular />}
      title={title}
      itemCount={sortedEmails.length}
      loading={loading}
      error={error}
      emptyMessage="No unread emails"
      emptyIcon={<Mail24Regular />}
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

export default UnreadInboxCardLarge;
