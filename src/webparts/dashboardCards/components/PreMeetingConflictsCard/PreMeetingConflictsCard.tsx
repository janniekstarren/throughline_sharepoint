// ============================================
// PreMeetingConflictsCard - Card #7
// "Do I have scheduling disasters coming?"
// Shows double-bookings, triple-bookings,
// and back-to-back meetings in the next 48h.
// Small + Medium variants.
// ============================================

import * as React from 'react';
import { useMemo, useCallback } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
  mergeClasses,
} from '@fluentui/react-components';
import {
  CalendarCancel24Regular,
  CalendarError20Regular,
  ArrowClockwiseRegular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { usePreMeetingConflicts } from '../../hooks/usePreMeetingConflicts';
import { MeetingConflict, ConflictType } from '../../models/PreMeetingConflicts';
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
import { CardSize } from '../../types/CardSize';
import { DataMode } from '../../services/testData';

// ============================================
// Props Interface
// ============================================

export interface PreMeetingConflictsCardProps {
  context: WebPartContext;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  size?: CardSize;
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: '2px',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    fontWeight: 500,
  },
  conflictList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  conflictRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationFast,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
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
  conflictInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  conflictHeader: {
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
  timeSlot: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    fontWeight: 500,
  },
  meetingSubjects: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  suggestedAction: {
    fontSize: '11px',
    color: tokens.colorBrandForeground1,
    fontWeight: 500,
    marginTop: '2px',
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

// ============================================
// Component
// ============================================

export const PreMeetingConflictsCard: React.FC<PreMeetingConflictsCardProps> = ({
  context,
  dataMode = 'api',
  aiDemoMode = false,
  size = 'medium',
  onSizeChange,
}) => {
  const cardStyles = useCardStyles();
  const styles = useStyles();

  // Fetch data
  const { data, isLoading, error, lastRefreshed, refresh } = usePreMeetingConflicts({
    dataMode,
  });

  // Handle size change (support deprecated fallback pattern)
  const handleSizeChange = useCallback((newSize: CardSize) => {
    if (onSizeChange) onSizeChange(newSize);
  }, [onSizeChange]);

  // Format affected hours
  const formattedHours = useMemo(() => {
    if (!data) return '0h';
    const h = data.stats.affectedHours;
    if (h < 1) return `${Math.round(h * 60)}m`;
    return `${h.toFixed(1)}h`;
  }, [data]);

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="preMeetingConflicts"
        title="Conflicts"
        icon={<CalendarError20Regular />}
        metricValue={data?.stats.totalConflicts ?? 0}
        smartLabelKey="conflict"
        chartData={data?.trendData.map(p => ({ date: new Date(p.date), value: p.value }))}
        chartColor={data?.stats.tripleBookingCount && data.stats.tripleBookingCount > 0 ? 'danger' : 'warning'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // ============================================
  // MEDIUM CARD VARIANT
  // ============================================

  // Badge variant based on severity
  const badgeVariant = data?.stats.tripleBookingCount && data.stats.tripleBookingCount > 0
    ? 'danger' as const
    : data?.stats.overlapCount && data.stats.overlapCount > 0
      ? 'warning' as const
      : undefined;

  // Header actions
  const headerActions = (
    <>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowClockwiseRegular />}
          size="small"
          onClick={refresh}
        />
      </Tooltip>
      <CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />
    </>
  );

  // Empty state
  if (!isLoading && !error && (!data || data.stats.totalConflicts === 0)) {
    return (
      <BaseCard testId="pre-meeting-conflicts-card" empty>
        <CardHeader
          icon={<CalendarCancel24Regular />}
          title="Pre-Meeting Conflicts"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<CalendarCancel24Regular />}
          title="No conflicts"
          description="No scheduling conflicts in the next 48 hours"
        />
      </BaseCard>
    );
  }

  // Get conflicts for display (limited to 4 in medium)
  const displayConflicts = data?.conflicts.slice(0, 4) ?? [];

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Checking calendar..."
      testId="pre-meeting-conflicts-card"
    >
      <CardHeader
        icon={<CalendarCancel24Regular />}
        title="Pre-Meeting Conflicts"
        badge={data?.stats.totalConflicts}
        badgeVariant={badgeVariant}
        actions={headerActions}
      />

      {/* Stats Row */}
      {data && (
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <Text className={styles.statValue}>{data.stats.overlapCount}</Text>
            <Text className={styles.statLabel}>Overlaps</Text>
          </div>
          <div className={styles.statItem}>
            <Text className={styles.statValue}>{data.stats.backToBackCount}</Text>
            <Text className={styles.statLabel}>Back-to-back</Text>
          </div>
          <div className={styles.statItem}>
            <Text className={styles.statValue}>{formattedHours}</Text>
            <Text className={styles.statLabel}>Affected</Text>
          </div>
        </div>
      )}

      {/* Conflict List */}
      <div className={cardStyles.cardContent}>
        <div className={styles.conflictList}>
          {displayConflicts.map((conflict: MeetingConflict) => {
            const severityClass =
              conflict.severity === 'high' ? styles.severityHigh :
              conflict.severity === 'medium' ? styles.severityMedium :
              styles.severityLow;

            const typeBadgeClass =
              conflict.type === 'overlap' ? styles.typeBadgeOverlap :
              conflict.type === 'back-to-back' ? styles.typeBadgeBackToBack :
              styles.typeBadgeTriple;

            const subjects = conflict.meetings
              .map(m => m.subject)
              .join(' / ');

            return (
              <div key={conflict.id} className={styles.conflictRow}>
                {/* Severity indicator */}
                <div className={mergeClasses(styles.severityDot, severityClass)} />

                {/* Conflict info */}
                <div className={styles.conflictInfo}>
                  <div className={styles.conflictHeader}>
                    <span className={mergeClasses(styles.typeBadge, typeBadgeClass)}>
                      {getTypeBadgeLabel(conflict.type)}
                    </span>
                    <Text className={styles.timeSlot}>{conflict.timeSlot}</Text>
                  </div>
                  <Text className={styles.meetingSubjects}>{subjects}</Text>
                  {conflict.suggestedAction && (
                    <Text className={styles.suggestedAction}>{conflict.suggestedAction}</Text>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={cardStyles.cardFooter}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
        </Text>
      </div>
    </BaseCard>
  );
};

export default PreMeetingConflictsCard;
