// ============================================
// EmailResponseCardLarge - Large card variant
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
  MailArrowForwardRegular,
  ArrowClockwiseRegular,
  Clock20Regular,
  Mail20Regular,
  ArrowUp16Regular,
  ArrowDown16Regular,
  ArrowTrendingLines20Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { ResponsePatternGroup } from '../../models/EmailResponse';
import { useEmailResponse } from '../../hooks/useEmailResponse';
import { DataMode } from '../../services/testData';

export interface EmailResponseCardLargeProps {
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
  trendUp: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorPaletteRedForeground1,
  },
  trendDown: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorPaletteGreenForeground1,
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
  comparisonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  comparisonItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXXS,
    flex: 1,
  },
  comparisonLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
  },
  comparisonValue: {
    fontSize: '20px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  slowestResponseItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  slowestSubject: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  slowestTime: {
    fontSize: '12px',
    color: tokens.colorPaletteRedForeground1,
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

const formatResponseTime = (minutes: number): string => {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

const getResponseTimeColor = (minutes: number): 'danger' | 'warning' | 'success' => {
  if (minutes > 480) return 'danger';
  if (minutes > 120) return 'warning';
  return 'success';
};

// ============================================
// Component
// ============================================

export const EmailResponseCardLarge: React.FC<EmailResponseCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedGroup, setSelectedGroup] = React.useState<ResponsePatternGroup | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useEmailResponse({ dataMode });

  // Sort groups by avgResponseMinutes descending (slowest first)
  const sortedGroups = React.useMemo(() => {
    if (!data) return [];
    return [...data.groups].sort((a, b) => b.avgResponseMinutes - a.avgResponseMinutes);
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (sortedGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(sortedGroups[0]);
    }
  }, [sortedGroups.length]);

  // Render master list item
  const renderMasterItem = (group: ResponsePatternGroup, _isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        <div className={styles.masterInfo}>
          <Text className={styles.masterTitle}>{group.groupLabel}</Text>
          <div className={styles.masterMeta}>
            <span>{formatResponseTime(group.avgResponseMinutes)} avg</span>
            <span>{group.emailCount} emails</span>
          </div>
        </div>
        <div className={styles.masterRight}>
          <Badge
            appearance="tint"
            color={getResponseTimeColor(group.avgResponseMinutes)}
            size="small"
          >
            {formatResponseTime(group.avgResponseMinutes)}
          </Badge>
          {group.trendVsLastMonth !== 0 && (
            <span className={group.trendVsLastMonth > 0 ? styles.trendUp : styles.trendDown}>
              {group.trendVsLastMonth > 0 ? (
                <ArrowUp16Regular />
              ) : (
                <ArrowDown16Regular />
              )}
              {Math.abs(Math.round(group.trendVsLastMonth))}%
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (group: ResponsePatternGroup): React.ReactNode => {
    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{group.groupLabel}</Text>
          <div className={styles.badgeRow}>
            <Badge
              appearance="filled"
              color={getResponseTimeColor(group.avgResponseMinutes)}
            >
              Avg: {formatResponseTime(group.avgResponseMinutes)}
            </Badge>
            <Badge
              appearance="tint"
              color="informative"
            >
              {group.emailCount} emails
            </Badge>
            {group.trendVsLastMonth !== 0 && (
              <Badge
                appearance="tint"
                color={group.trendVsLastMonth > 0 ? 'danger' : 'success'}
              >
                {group.trendVsLastMonth > 0 ? '+' : ''}{Math.round(group.trendVsLastMonth)}% vs last month
              </Badge>
            )}
          </div>
        </div>

        {/* Median vs Average */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Response Time Comparison</Text>
          <div className={styles.comparisonRow}>
            <div className={styles.comparisonItem}>
              <Text className={styles.comparisonLabel}>Average</Text>
              <Text className={styles.comparisonValue}>
                {formatResponseTime(group.avgResponseMinutes)}
              </Text>
            </div>
            <div className={styles.comparisonItem}>
              <Text className={styles.comparisonLabel}>Median</Text>
              <Text className={styles.comparisonValue}>
                {formatResponseTime(group.medianResponseMinutes)}
              </Text>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Details</Text>
          <div className={styles.detailRow}>
            <Mail20Regular className={styles.detailIcon} />
            <span>Email count: {group.emailCount}</span>
          </div>
          <div className={styles.detailRow}>
            <Clock20Regular className={styles.detailIcon} />
            <span>Average: {formatResponseTime(group.avgResponseMinutes)}</span>
          </div>
          <div className={styles.detailRow}>
            <ArrowTrendingLines20Regular className={styles.detailIcon} />
            <span>
              Trend: {group.trendVsLastMonth > 0 ? '+' : ''}{Math.round(group.trendVsLastMonth)}% vs last month
            </span>
          </div>
        </div>

        {/* Slowest Response */}
        {group.slowestResponse && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>Slowest Response</Text>
            <div className={styles.slowestResponseItem}>
              <Text className={styles.slowestSubject}>{group.slowestResponse.subject}</Text>
              <Text className={styles.slowestTime}>
                Response time: {formatResponseTime(group.slowestResponse.responseHours * 60)}
              </Text>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (_group: ResponsePatternGroup): React.ReactNode => {
    return (
      <Tooltip content="View in Outlook" relationship="label">
        <Button
          appearance="primary"
          icon={<MailArrowForwardRegular />}
          onClick={() => window.open('https://outlook.office.com/mail', '_blank', 'noopener,noreferrer')}
        >
          View Emails
        </Button>
      </Tooltip>
    );
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <MailArrowForwardRegular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a group to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <MailArrowForwardRegular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No email data</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          No email response patterns to analyse yet
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<ResponsePatternGroup>
      items={sortedGroups}
      selectedItem={selectedGroup}
      onItemSelect={setSelectedGroup}
      getItemKey={(g) => g.groupLabel}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<MailArrowForwardRegular />}
      title="Email Response Time"
      itemCount={data?.groups.length ?? 0}
      loading={isLoading}
      error={error?.message}
      emptyMessage="No email data"
      emptyIcon={<MailArrowForwardRegular />}
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

export default EmailResponseCardLarge;
