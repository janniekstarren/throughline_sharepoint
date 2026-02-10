// ============================================
// MeetingPrepGapCardLarge - Large card variant
// Full content view with master-detail layout
// ============================================

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
  DocumentBriefcase24Regular,
  ArrowClockwiseRegular,
  Clock20Regular,
  People20Regular,
  Open16Regular,
  DocumentCheckmark20Regular,
  DocumentDismiss20Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { UnpreparedMeeting } from '../../models/MeetingPrepGap';
import { useMeetingPrepGap } from '../../hooks/useMeetingPrepGap';
import { DataMode } from '../../services/testData';

export interface MeetingPrepGapCardLargeProps {
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  masterInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  masterTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  masterMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  masterRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  urgentText: {
    color: tokens.colorPaletteRedForeground1,
  },
  warningText: {
    color: tokens.colorPaletteYellowForeground1,
  },

  // Detail panel styles
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  detailHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.3,
  },
  badgeRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  detailIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
  },
  documentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  documentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  documentOpened: {
    color: tokens.colorPaletteGreenForeground1,
  },
  documentNotOpened: {
    color: tokens.colorPaletteRedForeground1,
  },
  prepBreakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },

  // Action button
  actionButton: {
    minWidth: 'auto',
  },

  // Empty states
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
// Helpers
// ============================================

const formatHoursUntil = (hours: number): string => {
  if (hours < 1) return '<1h';
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const getPrepScoreColor = (score: number): 'danger' | 'warning' | 'success' => {
  if (score < 30) return 'danger';
  if (score < 60) return 'warning';
  return 'success';
};

const formatStartTime = (date: Date): string => {
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================
// Component
// ============================================

export const MeetingPrepGapCardLarge: React.FC<MeetingPrepGapCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedMeeting, setSelectedMeeting] = React.useState<UnpreparedMeeting | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useMeetingPrepGap({ dataMode });

  // Sort meetings by hoursUntil ascending (most urgent first)
  const sortedMeetings = React.useMemo(() => {
    if (!data) return [];
    return [...data.unpreparedMeetings].sort((a, b) => a.hoursUntil - b.hoursUntil);
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (sortedMeetings.length > 0 && !selectedMeeting) {
      setSelectedMeeting(sortedMeetings[0]);
    }
  }, [sortedMeetings.length]);

  // Render master list item
  const renderMasterItem = (meeting: UnpreparedMeeting, _isSelected: boolean): React.ReactNode => {
    const isUrgent = meeting.hoursUntil < 2;
    const isSoon = meeting.hoursUntil < 8 && !isUrgent;

    return (
      <div className={styles.masterItem}>
        <div className={styles.masterInfo}>
          <Text className={styles.masterTitle}>{meeting.subject}</Text>
          <div className={styles.masterMeta}>
            <span>{meeting.organizer}</span>
            <span
              className={
                isUrgent
                  ? styles.urgentText
                  : isSoon
                  ? styles.warningText
                  : undefined
              }
            >
              {formatHoursUntil(meeting.hoursUntil)} until
            </span>
          </div>
        </div>
        <div className={styles.masterRight}>
          <Badge
            appearance="tint"
            color={getPrepScoreColor(meeting.prepScore)}
            size="small"
          >
            {Math.round(meeting.prepScore)}%
          </Badge>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (meeting: UnpreparedMeeting): React.ReactNode => {
    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{meeting.subject}</Text>
          <div className={styles.badgeRow}>
            <Badge
              appearance="filled"
              color={getPrepScoreColor(meeting.prepScore)}
            >
              Prep Score: {Math.round(meeting.prepScore)}%
            </Badge>
            {meeting.isHighStakes && (
              <Badge appearance="filled" color="danger">
                High Stakes
              </Badge>
            )}
            <Badge
              appearance="tint"
              color={meeting.hoursUntil < 2 ? 'danger' : meeting.hoursUntil < 8 ? 'warning' : 'informative'}
            >
              {formatHoursUntil(meeting.hoursUntil)} until meeting
            </Badge>
          </div>
        </div>

        {/* Meeting Details */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Meeting Details</Text>
          <div className={styles.detailRow}>
            <Clock20Regular className={styles.detailIcon} />
            <span>Start: {formatStartTime(meeting.startDateTime)}</span>
          </div>
          <div className={styles.detailRow}>
            <People20Regular className={styles.detailIcon} />
            <span>{meeting.attendeeCount} attendees</span>
          </div>
          <div className={styles.detailRow}>
            <DocumentBriefcase24Regular className={styles.detailIcon} />
            <span>Organizer: {meeting.organizer}</span>
          </div>
        </div>

        {/* Related Documents */}
        {meeting.relatedDocuments && meeting.relatedDocuments.length > 0 && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>
              Related Documents ({meeting.relatedDocuments.length})
            </Text>
            <div className={styles.documentList}>
              {meeting.relatedDocuments.map((doc, index) => (
                <div key={index} className={styles.documentItem}>
                  {doc.isOpened ? (
                    <DocumentCheckmark20Regular className={styles.documentOpened} />
                  ) : (
                    <DocumentDismiss20Regular className={styles.documentNotOpened} />
                  )}
                  <span>{doc.name}</span>
                  <Badge
                    appearance="outline"
                    color={doc.isOpened ? 'success' : 'danger'}
                    size="small"
                    style={{ marginLeft: 'auto' }}
                  >
                    {doc.isOpened ? 'Opened' : 'Not opened'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (meeting: UnpreparedMeeting): React.ReactNode => {
    return (
      <Tooltip content="Open in Calendar" relationship="label">
        <Button
          appearance="primary"
          icon={<Open16Regular />}
          className={styles.actionButton}
          onClick={() => {
            // Open in Outlook calendar - placeholder URL
            window.open(
              `https://outlook.office.com/calendar`,
              '_blank',
              'noopener,noreferrer'
            );
          }}
        >
          Open in Calendar
        </Button>
      </Tooltip>
    );
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <DocumentBriefcase24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a meeting to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <DocumentBriefcase24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>All meetings prepared</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          You are fully prepared for all upcoming meetings
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<UnpreparedMeeting>
      items={sortedMeetings}
      selectedItem={selectedMeeting}
      onItemSelect={setSelectedMeeting}
      getItemKey={(m) => m.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<DocumentBriefcase24Regular />}
      title="Meeting Prep Gap"
      itemCount={data?.stats.unpreparedCount ?? 0}
      loading={isLoading}
      error={error?.message}
      emptyMessage="All meetings prepared"
      emptyIcon={<DocumentBriefcase24Regular />}
      headerActions={
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
          <Tooltip content="Refresh" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowClockwiseRegular />}
              onClick={refresh}
            />
          </Tooltip>
          <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
        </div>
      }
    />
  );
};

export default MeetingPrepGapCardLarge;
