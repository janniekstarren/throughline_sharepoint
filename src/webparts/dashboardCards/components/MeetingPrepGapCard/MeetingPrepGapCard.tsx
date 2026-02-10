// ============================================
// MeetingPrepGapCard - Card with size variants
// Small: Compact chip with metric
// Medium: Summary view with stats and meeting list
// Large: Full master-detail layout
// ============================================

import * as React from 'react';
import { useMemo, useCallback } from 'react';
import {
  makeStyles,
  Text,
  Button,
  Tooltip,
  tokens,
  Badge,
} from '@fluentui/react-components';
import {
  DocumentBriefcase24Regular,
  ArrowClockwiseRegular,
  Clock20Regular,
  CalendarLtr20Regular,
  AlertUrgent20Regular,
} from '@fluentui/react-icons';

import { UnpreparedMeeting } from '../../models/MeetingPrepGap';
import { useMeetingPrepGap } from '../../hooks/useMeetingPrepGap';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface MeetingPrepGapCardProps {
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  /** Card size: 'small' | 'medium' | 'large' */
  size?: CardSize;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useMeetingPrepGapStyles = makeStyles({
  card: {
    height: 'auto',
    minHeight: '280px',
    maxHeight: '600px',
  },

  // Stats grid - 2x2 layout
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: 'center',
  },
  statLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statIcon: {
    fontSize: '14px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueWarning: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteYellowForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueDanger: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteRedForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },

  // Meeting list section
  meetingListSection: {
    padding: `0 ${tokens.spacingHorizontalL}`,
    paddingBottom: tokens.spacingVerticalL,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: tokens.spacingVerticalS,
  },
  meetingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  meetingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  meetingInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  meetingSubject: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  meetingMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  meetingBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
});

// ============================================
// Helpers
// ============================================

const formatHoursUntil = (hours: number): string => {
  if (hours < 1) return '<1h until';
  if (hours < 24) return `${Math.round(hours)}h until`;
  const days = Math.floor(hours / 24);
  return `${days}d until`;
};

const getPrepScoreColor = (score: number): 'danger' | 'warning' | 'success' => {
  if (score < 30) return 'danger';
  if (score < 60) return 'warning';
  return 'success';
};

// ============================================
// Component
// ============================================

export const MeetingPrepGapCard: React.FC<MeetingPrepGapCardProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  size = 'medium',
  onSizeChange,
}) => {
  const handleSizeChange = useCallback(
    (newSize: CardSize) => {
      if (onSizeChange) onSizeChange(newSize);
    },
    [onSizeChange]
  );

  const styles = useMeetingPrepGapStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useMeetingPrepGap({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="meetingPrepGap"
        title="Prep Gap"
        icon={<DocumentBriefcase24Regular />}
        metricValue={data?.stats.unpreparedCount ?? 0}
        smartLabelKey="meeting"
        chartColor={(data?.stats?.highStakesUnprepared ?? 0) >= 1 ? 'danger' : (data?.stats?.unpreparedCount ?? 0) >= 2 ? 'warning' : 'brand'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Top 4 unprepared meetings sorted by hoursUntil ascending
  const topMeetings = useMemo(() => {
    if (!data) return [];
    return [...data.unpreparedMeetings]
      .sort((a, b) => a.hoursUntil - b.hoursUntil)
      .slice(0, 4);
  }, [data]);

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
      <CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />
    </div>
  );

  // Empty state
  if (!isLoading && !error && (!data || data.stats.unpreparedCount === 0)) {
    return (
      <BaseCard testId="meeting-prep-gap-card" empty>
        <CardHeader
          icon={<DocumentBriefcase24Regular />}
          title="Meeting Prep Gap"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<DocumentBriefcase24Regular />}
          title="All meetings prepared"
          description="You are fully prepared for all upcoming meetings"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Checking meeting preparation..."
      testId="meeting-prep-gap-card"
      className={styles.card}
    >
      <CardHeader
        icon={<DocumentBriefcase24Regular />}
        title="Meeting Prep Gap"
        badge={data?.stats.unpreparedCount}
        badgeVariant={
          data && data.stats.highStakesUnprepared >= 1
            ? 'danger'
            : data && data.stats.unpreparedCount >= 2
            ? 'warning'
            : 'brand'
        }
        actions={headerActions}
      />

      <div className={cardStyles.cardContent}>
        {/* Statistics Grid */}
        {data && (
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <CalendarLtr20Regular className={styles.statIcon} />
                Upcoming
              </div>
              <Text className={styles.statValue}>{data.stats.totalUpcoming}</Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <DocumentBriefcase24Regular className={styles.statIcon} />
                Unprepared
              </div>
              <Text className={data.stats.unpreparedCount >= 2 ? styles.statValueWarning : styles.statValue}>
                {data.stats.unpreparedCount}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Clock20Regular className={styles.statIcon} />
                Avg Prep
              </div>
              <Text className={styles.statValue}>
                {Math.round(data.stats.avgPrepScore)}%
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <AlertUrgent20Regular className={styles.statIcon} />
                High-Stakes
              </div>
              <Text className={data.stats.highStakesUnprepared >= 1 ? styles.statValueDanger : styles.statValue}>
                {data.stats.highStakesUnprepared}
              </Text>
            </div>
          </div>
        )}

        {/* Meeting List - Top 4 by urgency (soonest first) */}
        {topMeetings.length > 0 && (
          <div className={styles.meetingListSection}>
            <Text className={styles.sectionLabel}>Most Urgent</Text>
            <div className={styles.meetingList}>
              {topMeetings.map((meeting: UnpreparedMeeting) => (
                <div key={meeting.id} className={styles.meetingRow}>
                  <div className={styles.meetingInfo}>
                    <span className={styles.meetingSubject}>{meeting.subject}</span>
                    <span className={styles.meetingMeta}>
                      {meeting.organizer} &middot; {meeting.attendeeCount} attendees
                    </span>
                  </div>
                  <div className={styles.meetingBadges}>
                    <Badge
                      appearance="tint"
                      color={meeting.hoursUntil < 2 ? 'danger' : meeting.hoursUntil < 8 ? 'warning' : 'informative'}
                      size="small"
                    >
                      {formatHoursUntil(meeting.hoursUntil)}
                    </Badge>
                    <Badge
                      appearance="tint"
                      color={getPrepScoreColor(meeting.prepScore)}
                      size="small"
                    >
                      {Math.round(meeting.prepScore)}%
                    </Badge>
                    {meeting.isHighStakes && (
                      <Badge
                        appearance="filled"
                        color="danger"
                        size="small"
                      >
                        High
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default MeetingPrepGapCard;
