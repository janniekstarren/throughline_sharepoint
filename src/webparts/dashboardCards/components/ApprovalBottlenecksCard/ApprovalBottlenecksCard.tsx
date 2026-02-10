// ============================================
// ApprovalBottlenecksCard - Card with size variants
// Small: Compact chip with metric and chart
// Medium: Summary view with stats and approval list
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
  Avatar,
  Badge,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Regular,
  ArrowClockwiseRegular,
  Clock20Regular,
  People20Regular,
  AlertUrgent20Regular,
} from '@fluentui/react-icons';

import { PendingApproval } from '../../models/ApprovalBottlenecks';
import { useApprovalBottlenecks } from '../../hooks/useApprovalBottlenecks';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface ApprovalBottlenecksCardProps {
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

const useApprovalBottlenecksStyles = makeStyles({
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

  // Approval list section
  approvalListSection: {
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
  approvalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  approvalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  approvalInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  approvalTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  approvalRequestor: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  approvalBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
});

// ============================================
// Helpers
// ============================================

const formatWaitDuration = (hours: number): string => {
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const getWaitBadgeColor = (hours: number): 'danger' | 'warning' | 'informative' => {
  if (hours >= 96) return 'danger';
  if (hours >= 48) return 'warning';
  return 'informative';
};

const formatApprovalType = (type: string): string => {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ============================================
// Component
// ============================================

export const ApprovalBottlenecksCard: React.FC<ApprovalBottlenecksCardProps> = ({
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

  const styles = useApprovalBottlenecksStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useApprovalBottlenecks({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="approvalBottlenecks"
        title="Approvals"
        icon={<CheckmarkCircle24Regular />}
        metricValue={data?.stats.totalPending ?? 0}
        smartLabelKey="pending"
        chartData={data?.trendData.map(p => ({ date: new Date(p.date), value: p.value }))}
        chartColor={data?.stats.overdueCount && data.stats.overdueCount > 0 ? 'danger' : 'warning'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Top 4 approvals sorted by urgencyScore desc
  const topApprovals = useMemo(() => {
    if (!data) return [];
    return [...data.pendingApprovals]
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 4);
  }, [data]);

  // Format average wait time
  const avgWaitFormatted = useMemo(() => {
    if (!data || data.stats.avgWaitHours === 0) return '0h';
    return formatWaitDuration(data.stats.avgWaitHours);
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
  if (!isLoading && !error && (!data || data.stats.totalPending === 0)) {
    return (
      <BaseCard testId="approval-bottlenecks-card" empty>
        <CardHeader
          icon={<CheckmarkCircle24Regular />}
          title="Approval Bottlenecks"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<CheckmarkCircle24Regular />}
          title="No pending approvals"
          description="You have no decisions holding anyone up"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Checking pending approvals..."
      testId="approval-bottlenecks-card"
      className={styles.card}
    >
      <CardHeader
        icon={<CheckmarkCircle24Regular />}
        title="Approval Bottlenecks"
        badge={data?.stats.totalPending}
        badgeVariant={
          data && data.stats.overdueCount > 0
            ? 'danger'
            : data && data.stats.totalPending > 0
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
                <CheckmarkCircle24Regular className={styles.statIcon} />
                Pending
              </div>
              <Text className={styles.statValue}>{data.stats.totalPending}</Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <AlertUrgent20Regular className={styles.statIcon} />
                Overdue
              </div>
              <Text className={data.stats.overdueCount > 0 ? styles.statValueDanger : styles.statValue}>
                {data.stats.overdueCount}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <People20Regular className={styles.statIcon} />
                Blocked
              </div>
              <Text className={data.stats.blockedPeopleTotal > 0 ? styles.statValueWarning : styles.statValue}>
                {data.stats.blockedPeopleTotal}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Clock20Regular className={styles.statIcon} />
                Avg Wait
              </div>
              <Text className={data.stats.avgWaitHours >= 72 ? styles.statValueDanger : data.stats.avgWaitHours >= 24 ? styles.statValueWarning : styles.statValue}>
                {avgWaitFormatted}
              </Text>
            </div>
          </div>
        )}

        {/* Approval List - Top 4 by urgency */}
        {topApprovals.length > 0 && (
          <div className={styles.approvalListSection}>
            <Text className={styles.sectionLabel}>Most Urgent</Text>
            <div className={styles.approvalList}>
              {topApprovals.map((approval: PendingApproval) => (
                <div key={approval.id} className={styles.approvalRow}>
                  <Avatar
                    name={approval.requestor.displayName}
                    image={approval.requestor.photoUrl ? { src: approval.requestor.photoUrl } : undefined}
                    size={24}
                  />
                  <div className={styles.approvalInfo}>
                    <span className={styles.approvalTitle}>{approval.title}</span>
                    <span className={styles.approvalRequestor}>{approval.requestor.displayName}</span>
                  </div>
                  <div className={styles.approvalBadges}>
                    <Badge
                      appearance="tint"
                      color={getWaitBadgeColor(approval.waitDurationHours)}
                      size="small"
                    >
                      {formatWaitDuration(approval.waitDurationHours)}
                    </Badge>
                    <Badge
                      appearance="outline"
                      color="informative"
                      size="small"
                    >
                      {formatApprovalType(approval.type)}
                    </Badge>
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

export default ApprovalBottlenecksCard;
