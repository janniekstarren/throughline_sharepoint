// ============================================
// FlaggedEmailsCardLarge - Large Card (Detail View)
// Master-detail layout showing flagged emails
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  Flag24Regular,
  Flag16Regular,
  ArrowMinimize20Regular,
  ArrowClockwiseRegular,
  Attach16Regular,
  CheckmarkCircle16Regular,
  Important16Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useFlaggedEmails,
  IFlaggedEmailsSettings,
  DEFAULT_FLAGGED_EMAILS_SETTINGS,
} from '../../hooks/useFlaggedEmails';
import { FlaggedEmailsData, FlaggedEmail } from '../../models/FlaggedEmails';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { EmailDetailPanel, EmailDetailActions } from '../shared/EmailDetailPanel';
import { IEmailMessage } from '../../services/GraphService';
import { DataMode } from '../../services/testData';
import { getTestFlaggedEmailsData } from '../../services/testData/flaggedEmailsNew';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  flagIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
    color: tokens.colorPaletteRedForeground1,
  },
  flagIconCompleted: {
    color: tokens.colorPaletteGreenForeground1,
  },
  emailInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  emailSubject: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emailSubjectCompleted: {
    textDecoration: 'line-through',
    opacity: 0.7,
  },
  emailMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  senderName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  importanceIcon: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: '14px',
  },
  attachmentIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '14px',
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
interface FlaggedEmailsCardLargeProps {
  context: WebPartContext;
  settings?: IFlaggedEmailsSettings;
  dataMode?: DataMode;
  onToggleSize?: () => void;
}

// ============================================
// Helper Functions
// ============================================
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return '1d';
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const sortEmailsByReceivedDate = (emails: FlaggedEmail[]): FlaggedEmail[] => {
  return [...emails].sort((a, b) => b.receivedDateTime.getTime() - a.receivedDateTime.getTime());
};

/**
 * Convert FlaggedEmail to IEmailMessage for EmailDetailPanel
 */
const toEmailMessage = (email: FlaggedEmail): IEmailMessage => ({
  id: email.id,
  subject: email.subject,
  from: email.from,
  receivedDateTime: email.receivedDateTime,
  bodyPreview: email.bodyPreview,
  importance: email.importance,
  hasAttachments: email.hasAttachments,
  isRead: true, // Assume read for flagged emails
  webLink: email.webLink,
});

// ============================================
// Component
// ============================================
export const FlaggedEmailsCardLarge: React.FC<FlaggedEmailsCardLargeProps> = ({
  context,
  settings = DEFAULT_FLAGGED_EMAILS_SETTINGS,
  dataMode = 'api',
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedEmail, setSelectedEmail] = useState<FlaggedEmail | undefined>(undefined);

  // Test data state
  const [testData, setTestData] = useState<FlaggedEmailsData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestFlaggedEmailsData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook
  const apiHook = useFlaggedEmails(context, settings);

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestFlaggedEmailsData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Sorted emails
  const sortedEmails = useMemo(() => {
    if (!data) return [];
    return sortEmailsByReceivedDate(data.emails);
  }, [data]);

  // Auto-select first email
  React.useEffect(() => {
    if (sortedEmails.length > 0 && !selectedEmail) {
      setSelectedEmail(sortedEmails[0]);
    }
  }, [sortedEmails, selectedEmail]);

  const handleSelectEmail = useCallback((email: FlaggedEmail): void => {
    setSelectedEmail(email);
  }, []);

  // Render master item
  const renderMasterItem = (email: FlaggedEmail, isSelected: boolean): React.ReactNode => {
    const isCompleted = email.flagStatus === 'complete';

    return (
      <div className={styles.masterItem}>
        {/* Flag Icon */}
        <div className={`${styles.flagIcon} ${isCompleted ? styles.flagIconCompleted : ''}`}>
          {isCompleted ? (
            <CheckmarkCircle16Regular />
          ) : (
            <Flag16Regular />
          )}
        </div>

        {/* Email Info */}
        <div className={styles.emailInfo}>
          <Text className={`${styles.emailSubject} ${isCompleted ? styles.emailSubjectCompleted : ''}`}>
            {email.subject}
          </Text>
          <div className={styles.emailMeta}>
            <span className={styles.senderName}>{email.from.name}</span>
            <span>{formatRelativeTime(email.receivedDateTime)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className={styles.badges}>
          {email.importance === 'high' && !isCompleted && (
            <Important16Regular className={styles.importanceIcon} />
          )}
          {email.hasAttachments && (
            <Attach16Regular className={styles.attachmentIcon} />
          )}
        </div>
      </div>
    );
  };

  // Render detail content - convert FlaggedEmail to IEmailMessage format for EmailDetailPanel
  const renderDetailContent = (email: FlaggedEmail): React.ReactNode => {
    const emailMessage = toEmailMessage(email);
    return <EmailDetailPanel email={emailMessage} onAction={() => {}} />;
  };

  // Render detail actions
  const renderDetailActions = (email: FlaggedEmail): React.ReactNode => {
    const emailMessage = toEmailMessage(email);
    return <EmailDetailActions email={emailMessage} onAction={() => {}} />;
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => (
    <>
      <Flag24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>Select an email to view details</Text>
    </>
  );

  // Render empty state
  const renderEmptyState = (): React.ReactNode => (
    <>
      <Flag24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>No flagged emails</Text>
    </>
  );

  // Calculate active count (not completed)
  const activeCount = data ? data.totalCount - data.completedCount : 0;

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
      getItemKey={(email: FlaggedEmail) => email.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<Flag24Regular />}
      title="Flagged Emails"
      itemCount={activeCount}
      loading={isLoading && !data}
      error={error?.message}
      emptyMessage="No flagged emails"
      emptyIcon={<Flag24Regular />}
      headerActions={headerActions}
    />
  );
};

export default FlaggedEmailsCardLarge;
