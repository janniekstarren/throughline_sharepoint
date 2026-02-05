// ============================================
// UnreadInboxCardLarge - Large Card (Detail View)
// Master-detail layout showing unread inbox emails
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Tooltip,
  Badge,
  Avatar,
} from '@fluentui/react-components';
import {
  Mail24Regular,
  ArrowMinimize20Regular,
  ArrowClockwiseRegular,
  Attach16Regular,
  Clock24Regular,
  Important20Regular,
  ArrowReply20Regular,
  ArrowForward20Regular,
  Open20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useUnreadInbox,
  IUnreadInboxSettings,
  DEFAULT_UNREAD_INBOX_SETTINGS,
} from '../../hooks/useUnreadInbox';
import { UnreadInboxData, EmailMessage } from '../../models/UnreadInbox';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { DataMode } from '../../services/testData';
import { getTestUnreadInboxData } from '../../services/testData/unreadInbox';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  avatarContainer: {
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
  senderName: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  timeText: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  subject: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXXS,
  },
  attachmentIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  highImportanceIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: tokens.colorPaletteRedForeground1,
    flexShrink: 0,
  },
  // Detail panel styles
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  detailFromSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  detailFromInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  detailFromName: {
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  detailFromEmail: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  detailSubject: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.3,
  },
  detailFieldRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  detailFieldIcon: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
    marginTop: '2px',
  },
  detailFieldContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  detailFieldLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailFieldValue: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  detailBadges: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  detailBodyPreview: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.5,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    maxHeight: '120px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    '::-webkit-scrollbar': {
      width: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke2,
      borderRadius: '2px',
    },
  },
  actionsContainer: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Props Interface
// ============================================
interface UnreadInboxCardLargeProps {
  context: WebPartContext;
  settings?: IUnreadInboxSettings;
  dataMode?: DataMode;
  onToggleSize?: () => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format relative time (e.g., "2h ago", "3d ago")
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format full date/time
 */
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

/**
 * Get initials from sender name
 */
const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Sort emails by received date (newest first)
 */
const sortEmailsByDate = (emails: EmailMessage[]): EmailMessage[] => {
  return [...emails].sort((a, b) => b.receivedDateTime.getTime() - a.receivedDateTime.getTime());
};

// ============================================
// Component
// ============================================
export const UnreadInboxCardLarge: React.FC<UnreadInboxCardLargeProps> = ({
  context,
  settings = DEFAULT_UNREAD_INBOX_SETTINGS,
  dataMode = 'api',
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | undefined>(undefined);

  // Test data state
  const [testData, setTestData] = useState<UnreadInboxData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestUnreadInboxData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook
  const apiHook = useUnreadInbox(context, settings);

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestUnreadInboxData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Sorted emails
  const sortedEmails = useMemo(() => {
    if (!data) return [];
    return sortEmailsByDate(data.emails);
  }, [data]);

  // Auto-select first email
  React.useEffect(() => {
    if (sortedEmails.length > 0 && !selectedEmail) {
      setSelectedEmail(sortedEmails[0]);
    }
  }, [sortedEmails, selectedEmail]);

  const handleSelectEmail = useCallback((email: EmailMessage): void => {
    setSelectedEmail(email);
  }, []);

  // Render master item
  const renderMasterItem = (email: EmailMessage, isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        {email.importance === 'high' && (
          <div className={styles.highImportanceIndicator} />
        )}
        <div className={styles.avatarContainer}>
          <Avatar
            name={email.from.name}
            initials={getInitials(email.from.name)}
            size={28}
            color="brand"
          />
        </div>
        <div className={styles.emailInfo}>
          <div className={styles.emailHeader}>
            <Text className={styles.senderName}>{email.from.name}</Text>
            <Text className={styles.timeText}>{formatRelativeTime(email.receivedDateTime)}</Text>
          </div>
          <Text className={styles.subject}>{email.subject}</Text>
          <div className={styles.badges}>
            {email.hasAttachments && (
              <Attach16Regular className={styles.attachmentIcon} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (email: EmailMessage): React.ReactNode => {
    return (
      <div className={styles.detailContainer}>
        {/* From section with avatar */}
        <div className={styles.detailFromSection}>
          <Avatar
            name={email.from.name}
            initials={getInitials(email.from.name)}
            size={40}
            color="brand"
          />
          <div className={styles.detailFromInfo}>
            <Text className={styles.detailFromName}>{email.from.name}</Text>
            <Text className={styles.detailFromEmail}>{email.from.email}</Text>
          </div>
        </div>

        {/* Subject */}
        <Text className={styles.detailSubject}>{email.subject}</Text>

        {/* Received time */}
        <div className={styles.detailFieldRow}>
          <Clock24Regular className={styles.detailFieldIcon} />
          <div className={styles.detailFieldContent}>
            <Text className={styles.detailFieldLabel}>Received</Text>
            <Text className={styles.detailFieldValue}>{formatDateTime(email.receivedDateTime)}</Text>
          </div>
        </div>

        {/* Badges */}
        <div className={styles.detailBadges}>
          {email.importance === 'high' && (
            <Badge
              appearance="tint"
              color="danger"
              icon={<Important20Regular />}
            >
              High Priority
            </Badge>
          )}
          {email.hasAttachments && (
            <Badge
              appearance="tint"
              color="informative"
              icon={<Attach16Regular />}
            >
              Attachments
            </Badge>
          )}
          <Badge appearance="filled" color="brand">
            Unread
          </Badge>
        </div>

        {/* Body preview */}
        {email.bodyPreview && (
          <div className={styles.detailBodyPreview}>
            {email.bodyPreview}
          </div>
        )}
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (email: EmailMessage): React.ReactNode => {
    const handleOpenInOutlook = (): void => {
      window.open(email.webLink, '_blank', 'noopener,noreferrer');
    };

    return (
      <div className={styles.actionsContainer}>
        <Tooltip content="Reply" relationship="label">
          <Button
            appearance="subtle"
            icon={<ArrowReply20Regular />}
            size="small"
            onClick={() => window.open(`${email.webLink}?action=reply`, '_blank')}
          />
        </Tooltip>
        <Tooltip content="Forward" relationship="label">
          <Button
            appearance="subtle"
            icon={<ArrowForward20Regular />}
            size="small"
            onClick={() => window.open(`${email.webLink}?action=forward`, '_blank')}
          />
        </Tooltip>
        <Tooltip content="Open in Outlook" relationship="label">
          <Button
            appearance="subtle"
            icon={<Open20Regular />}
            size="small"
            onClick={handleOpenInOutlook}
          />
        </Tooltip>
      </div>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => (
    <>
      <Mail24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>Select an email to view details</Text>
    </>
  );

  // Render empty state
  const renderEmptyState = (): React.ReactNode => (
    <>
      <Mail24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>Inbox zero! You have no unread emails</Text>
    </>
  );

  // Header actions
  const headerActions = (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowClockwiseRegular />}
          size="small"
          onClick={refresh}
        />
      </Tooltip>
      {onToggleSize && (
        <Tooltip content="Collapse to compact view" relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowMinimize20Regular />}
            onClick={onToggleSize}
            aria-label="Collapse card"
          />
        </Tooltip>
      )}
    </div>
  );

  return (
    <MasterDetailCard
      items={sortedEmails}
      selectedItem={selectedEmail}
      onItemSelect={handleSelectEmail}
      getItemKey={(email: EmailMessage) => email.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<Mail24Regular />}
      title="Unread Inbox"
      itemCount={sortedEmails.length}
      loading={isLoading && !data}
      error={error?.message}
      emptyMessage="Inbox zero! You have no unread emails"
      emptyIcon={<Mail24Regular />}
      headerActions={headerActions}
    />
  );
};

export default UnreadInboxCardLarge;
