// ============================================
// PreMeetingConflictsCardLarge - Large Card (Detail View)
// Master-detail layout showing scheduling conflicts
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  mergeClasses,
} from '@fluentui/react-components';
import {
  CalendarCancel24Regular,
  Clock20Regular,
  Warning20Regular,
  Open16Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { usePreMeetingConflicts } from '../../hooks/usePreMeetingConflicts';
import {
  MeetingConflict,
  ConflictMeeting,
  ConflictType,
  ConflictSeverity,
} from '../../models/PreMeetingConflicts';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared/CardSizeMenu';
import { CardSize } from '../../types/CardSize';
import { DataMode } from '../../services/testData';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  // Master list item
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
  },
  severityDot: {
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
    marginTop: '6px',
  },
  severityHigh: {
    backgroundColor: tokens.colorPaletteRedForeground1,
  },
  severityMedium: {
    backgroundColor: tokens.colorPaletteYellowForeground1,
  },
  severityLow: {
    backgroundColor: tokens.colorNeutralForeground3,
  },
  masterInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  masterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `1px ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    flexShrink: 0,
  },
  typeBadgeOverlap: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
  },
  typeBadgeBackToBack: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground2,
  },
  typeBadgeTriple: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
  },
  masterTimeSlot: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  masterSubjects: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // Detail panel
  detailSection: {
    marginBottom: tokens.spacingVerticalL,
  },
  detailSectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: tokens.spacingVerticalS,
  },
  overlapDiagram: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  meetingBar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    borderLeft: `3px solid ${tokens.colorBrandForeground1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  meetingBarOverlap: {
    borderLeftColor: tokens.colorPaletteRedForeground1,
  },
  meetingBarTime: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
    minWidth: '100px',
    flexShrink: 0,
  },
  meetingBarSubject: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground1,
    fontWeight: 500,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meetingBarMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalXS,
  },
  detailIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
  },
  detailLabel: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    minWidth: '80px',
  },
  detailValue: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground1,
    fontWeight: 500,
  },
  suggestedAction: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorBrandBackground2,
    borderRadius: tokens.borderRadiusMedium,
    borderLeft: `3px solid ${tokens.colorBrandForeground1}`,
  },
  suggestedActionIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '16px',
    flexShrink: 0,
    marginTop: '1px',
  },
  suggestedActionText: {
    fontSize: '12px',
    color: tokens.colorBrandForeground1,
    fontWeight: 500,
    lineHeight: '1.4',
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

const getTypeBadgeLabel = (type: ConflictType): string => {
  switch (type) {
    case 'overlap': return 'Overlap';
    case 'back-to-back': return 'Back-to-back';
    case 'triple-booking': return 'Triple';
    default: return type;
  }
};

const formatMeetingTime = (meeting: ConflictMeeting): string => {
  const start = meeting.startDateTime;
  const end = meeting.endDateTime;
  const fmt = (d: Date): string =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${fmt(start)} - ${fmt(end)}`;
};

// ============================================
// Props
// ============================================

export interface PreMeetingConflictsCardLargeProps {
  context: WebPartContext;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  size?: CardSize;
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Component
// ============================================

export const PreMeetingConflictsCardLarge: React.FC<PreMeetingConflictsCardLargeProps> = ({
  context,
  dataMode = 'api',
  aiDemoMode = false,
  size = 'large',
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedConflict, setSelectedConflict] = useState<MeetingConflict | undefined>(undefined);

  // Fetch data
  const { data, isLoading, error } = usePreMeetingConflicts({
    dataMode,
  });

  // Sorted conflicts: high severity first
  const sortedConflicts = useMemo(() => {
    if (!data) return [];
    const severityOrder: Record<ConflictSeverity, number> = { high: 0, medium: 1, low: 2 };
    return [...data.conflicts].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );
  }, [data]);

  // Auto-select first conflict
  React.useEffect(() => {
    if (sortedConflicts.length > 0 && !selectedConflict) {
      setSelectedConflict(sortedConflicts[0]);
    }
  }, [sortedConflicts, selectedConflict]);

  const handleSelectConflict = useCallback((conflict: MeetingConflict): void => {
    setSelectedConflict(conflict);
  }, []);

  // ============================================
  // Render: Master Item
  // ============================================
  const renderMasterItem = (conflict: MeetingConflict, _isSelected: boolean): React.ReactNode => {
    const severityClass =
      conflict.severity === 'high' ? styles.severityHigh :
      conflict.severity === 'medium' ? styles.severityMedium :
      styles.severityLow;

    const typeBadgeClass =
      conflict.type === 'overlap' ? styles.typeBadgeOverlap :
      conflict.type === 'back-to-back' ? styles.typeBadgeBackToBack :
      styles.typeBadgeTriple;

    const subjects = conflict.meetings.map(m => m.subject).join(' / ');

    return (
      <div className={styles.masterItem}>
        <div className={mergeClasses(styles.severityDot, severityClass)} />
        <div className={styles.masterInfo}>
          <div className={styles.masterHeader}>
            <span className={mergeClasses(styles.typeBadge, typeBadgeClass)}>
              {getTypeBadgeLabel(conflict.type)}
            </span>
          </div>
          <Text className={styles.masterTimeSlot}>{conflict.timeSlot}</Text>
          <Text className={styles.masterSubjects}>{subjects}</Text>
        </div>
      </div>
    );
  };

  // ============================================
  // Render: Detail Content
  // ============================================
  const renderDetailContent = (conflict: MeetingConflict): React.ReactNode => {
    const severityLabel =
      conflict.severity === 'high' ? 'High' :
      conflict.severity === 'medium' ? 'Medium' : 'Low';

    return (
      <>
        {/* Conflict Info */}
        <div className={styles.detailSection}>
          <Text className={styles.detailSectionTitle}>Conflict Details</Text>
          <div className={styles.detailRow}>
            <Warning20Regular className={styles.detailIcon} />
            <Text className={styles.detailLabel}>Type</Text>
            <Text className={styles.detailValue}>{getTypeBadgeLabel(conflict.type)}</Text>
          </div>
          <div className={styles.detailRow}>
            <Warning20Regular className={styles.detailIcon} />
            <Text className={styles.detailLabel}>Severity</Text>
            <Text className={styles.detailValue}>{severityLabel}</Text>
          </div>
          <div className={styles.detailRow}>
            <Clock20Regular className={styles.detailIcon} />
            <Text className={styles.detailLabel}>Time slot</Text>
            <Text className={styles.detailValue}>{conflict.timeSlot}</Text>
          </div>
          {conflict.overlapMinutes > 0 && (
            <div className={styles.detailRow}>
              <Clock20Regular className={styles.detailIcon} />
              <Text className={styles.detailLabel}>Overlap</Text>
              <Text className={styles.detailValue}>{conflict.overlapMinutes} min</Text>
            </div>
          )}
          {conflict.gapMinutes > 0 && (
            <div className={styles.detailRow}>
              <Clock20Regular className={styles.detailIcon} />
              <Text className={styles.detailLabel}>Gap</Text>
              <Text className={styles.detailValue}>{conflict.gapMinutes} min</Text>
            </div>
          )}
        </div>

        {/* Overlap Diagram */}
        <div className={styles.detailSection}>
          <Text className={styles.detailSectionTitle}>Meetings</Text>
          <div className={styles.overlapDiagram}>
            {conflict.meetings.map((meeting, idx) => (
              <div
                key={meeting.id}
                className={mergeClasses(
                  styles.meetingBar,
                  conflict.type !== 'back-to-back' && idx > 0 && styles.meetingBarOverlap
                )}
              >
                <Text className={styles.meetingBarTime}>
                  {formatMeetingTime(meeting)}
                </Text>
                <Text className={styles.meetingBarSubject}>
                  {meeting.subject}
                </Text>
                <Text className={styles.meetingBarMeta}>
                  {meeting.attendeeCount} attendee{meeting.attendeeCount !== 1 ? 's' : ''}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Action */}
        {conflict.suggestedAction && (
          <div className={styles.detailSection}>
            <Text className={styles.detailSectionTitle}>Suggested Action</Text>
            <div className={styles.suggestedAction}>
              <Warning20Regular className={styles.suggestedActionIcon} />
              <Text className={styles.suggestedActionText}>
                {conflict.suggestedAction}
              </Text>
            </div>
          </div>
        )}
      </>
    );
  };

  // ============================================
  // Render: Detail Actions
  // ============================================
  const renderDetailActions = (conflict: MeetingConflict): React.ReactNode => {
    return (
      <>
        {conflict.meetings.map((meeting) => (
          <Button
            key={meeting.id}
            appearance="subtle"
            size="small"
            icon={<Open16Regular />}
            onClick={() => window.open(meeting.webUrl, '_blank', 'noopener,noreferrer')}
          >
            {meeting.subject.length > 30
              ? `${meeting.subject.substring(0, 30)}...`
              : meeting.subject}
          </Button>
        ))}
      </>
    );
  };

  // ============================================
  // Render: Empty States
  // ============================================
  const renderEmptyDetail = (): React.ReactNode => (
    <>
      <CalendarCancel24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>Select a conflict to view details</Text>
    </>
  );

  const renderEmptyState = (): React.ReactNode => (
    <>
      <CalendarCancel24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>No scheduling conflicts</Text>
    </>
  );

  // Header actions
  const headerActions = (
    <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
  );

  return (
    <MasterDetailCard<MeetingConflict>
      items={sortedConflicts}
      selectedItem={selectedConflict}
      onItemSelect={handleSelectConflict}
      getItemKey={(c) => c.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<CalendarCancel24Regular />}
      title="Pre-Meeting Conflicts"
      itemCount={data?.stats.totalConflicts}
      loading={isLoading && !data}
      error={error?.message}
      emptyMessage="No scheduling conflicts found"
      emptyIcon={<CalendarCancel24Regular />}
      headerActions={headerActions}
    />
  );
};

export default PreMeetingConflictsCardLarge;
