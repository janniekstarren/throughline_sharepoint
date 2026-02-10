// ============================================
// ApprovalBottlenecksCardLarge - Large card variant
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
  Avatar,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Regular,
  ArrowClockwiseRegular,
  Clock20Regular,
  People20Regular,
  AlertUrgent20Regular,
  Open16Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { PendingApproval } from '../../models/ApprovalBottlenecks';
import { useApprovalBottlenecks } from '../../hooks/useApprovalBottlenecks';
import { DataMode } from '../../services/testData';

export interface ApprovalBottlenecksCardLargeProps {
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
  overdueText: {
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
  requestorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  requestorDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  requestorName: {
    fontWeight: 600,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  requestorEmail: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  blockedItemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  blockedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  urgencyFactorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  urgencyFactor: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
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

const formatWaitDuration = (hours: number): string => {
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const getUrgencyColor = (urgencyScore: number): 'danger' | 'warning' | 'informative' => {
  if (urgencyScore >= 8) return 'danger';
  if (urgencyScore >= 5) return 'warning';
  return 'informative';
};

const formatApprovalType = (type: string): string => {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// ============================================
// Component
// ============================================

export const ApprovalBottlenecksCardLarge: React.FC<ApprovalBottlenecksCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedApproval, setSelectedApproval] = React.useState<PendingApproval | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useApprovalBottlenecks({ dataMode });

  // Sort approvals by urgency
  const sortedApprovals = React.useMemo(() => {
    if (!data) return [];
    return [...data.pendingApprovals].sort((a, b) => b.urgencyScore - a.urgencyScore);
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (sortedApprovals.length > 0 && !selectedApproval) {
      setSelectedApproval(sortedApprovals[0]);
    }
  }, [sortedApprovals.length]);

  // Render master list item
  const renderMasterItem = (approval: PendingApproval, _isSelected: boolean): React.ReactNode => {
    const isHighUrgency = approval.urgencyScore >= 8;
    const isMediumUrgency = approval.urgencyScore >= 5 && !isHighUrgency;

    return (
      <div className={styles.masterItem}>
        <Avatar
          name={approval.requestor.displayName}
          image={approval.requestor.photoUrl ? { src: approval.requestor.photoUrl } : undefined}
          size={32}
        />
        <div className={styles.masterInfo}>
          <Text className={styles.masterTitle}>{approval.title}</Text>
          <div className={styles.masterMeta}>
            <span>{approval.requestor.displayName}</span>
            <span
              className={
                isHighUrgency
                  ? styles.overdueText
                  : isMediumUrgency
                  ? styles.warningText
                  : undefined
              }
            >
              {formatWaitDuration(approval.waitDurationHours)} waiting
            </span>
          </div>
        </div>
        <div className={styles.masterRight}>
          <Badge
            appearance="tint"
            color={getUrgencyColor(approval.urgencyScore)}
            size="small"
          >
            {formatApprovalType(approval.type)}
          </Badge>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (approval: PendingApproval): React.ReactNode => {
    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{approval.title}</Text>
          <div className={styles.badgeRow}>
            <Badge
              appearance="filled"
              color={getUrgencyColor(approval.urgencyScore)}
            >
              Urgency: {approval.urgencyScore}/10
            </Badge>
            <Badge
              appearance="tint"
              color="informative"
            >
              {formatApprovalType(approval.type)}
            </Badge>
            {approval.isOverdue && (
              <Badge appearance="filled" color="danger">
                Overdue
              </Badge>
            )}
          </div>
        </div>

        {/* Requestor */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Requestor</Text>
          <div className={styles.requestorInfo}>
            <Avatar
              name={approval.requestor.displayName}
              image={approval.requestor.photoUrl ? { src: approval.requestor.photoUrl } : undefined}
              size={40}
            />
            <div className={styles.requestorDetails}>
              <Text className={styles.requestorName}>{approval.requestor.displayName}</Text>
              <Text className={styles.requestorEmail}>{approval.requestor.email}</Text>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Details</Text>
          <div className={styles.detailRow}>
            <Clock20Regular className={styles.detailIcon} />
            <span>Waiting: {formatWaitDuration(approval.waitDurationHours)}</span>
          </div>
          <div className={styles.detailRow}>
            <CheckmarkCircle24Regular className={styles.detailIcon} />
            <span>Requested: {formatDateFull(approval.requestedDateTime)}</span>
          </div>
          {approval.amount !== undefined && approval.currency && (
            <div className={styles.detailRow}>
              <span>Amount: {formatCurrency(approval.amount, approval.currency)}</span>
            </div>
          )}
          {approval.statedDeadline && (
            <div className={styles.detailRow}>
              <AlertUrgent20Regular className={styles.detailIcon} />
              <span>Deadline: {formatDateFull(approval.statedDeadline)}</span>
            </div>
          )}
        </div>

        {/* Blocked Items */}
        {approval.blockedItems && approval.blockedItems.length > 0 && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>
              Blocked Items ({approval.blockedPeopleCount} people affected)
            </Text>
            <div className={styles.blockedItemsList}>
              {approval.blockedItems.map((item, index) => (
                <div key={index} className={styles.blockedItem}>
                  <People20Regular className={styles.detailIcon} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Urgency Factors */}
        {approval.urgencyFactors && approval.urgencyFactors.length > 0 && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>Urgency Factors</Text>
            <div className={styles.urgencyFactorsList}>
              {approval.urgencyFactors.map((factor, index) => (
                <div key={index} className={styles.urgencyFactor}>
                  <AlertUrgent20Regular className={styles.detailIcon} />
                  <span>{factor.description} (+{factor.points})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (approval: PendingApproval): React.ReactNode => {
    return (
      <Tooltip content="Open in source" relationship="label">
        <Button
          appearance="primary"
          icon={<Open16Regular />}
          className={styles.actionButton}
          onClick={() => window.open(approval.sourceUrl, '_blank', 'noopener,noreferrer')}
        >
          Open
        </Button>
      </Tooltip>
    );
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <CheckmarkCircle24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select an approval to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <CheckmarkCircle24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No pending approvals</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          You have no decisions holding anyone up
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<PendingApproval>
      items={sortedApprovals}
      selectedItem={selectedApproval}
      onItemSelect={setSelectedApproval}
      getItemKey={(a) => a.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<CheckmarkCircle24Regular />}
      title="Approval Bottlenecks"
      itemCount={data?.stats.totalPending ?? 0}
      loading={isLoading}
      error={error?.message}
      emptyMessage="No pending approvals"
      emptyIcon={<CheckmarkCircle24Regular />}
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

export default ApprovalBottlenecksCardLarge;
