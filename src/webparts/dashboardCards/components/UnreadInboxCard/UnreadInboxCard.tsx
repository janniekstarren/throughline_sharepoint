// ============================================
// UnreadInboxCard - Medium Card (Summary View)
// Shows unread inbox emails with chart, stats, and top items
// ============================================

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
} from '@fluentui/react-components';
import {
  Mail24Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  Mail20Regular,
  AttachRegular,
  AlertUrgent20Regular,
  Clock20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useUnreadInbox,
  IUnreadInboxSettings,
  DEFAULT_UNREAD_INBOX_SETTINGS,
} from '../../hooks/useUnreadInbox';
import { UnreadInboxData, InboxTrendData } from '../../models/UnreadInbox';
import { BaseCard, CardHeader, EmptyState, TrendBarChart, StatsGrid, TopItemsList } from '../shared';
import { StatItem, TopItem } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestUnreadInboxData, getTestInboxTrendData } from '../../services/testData/unreadInbox';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  card: {
    // Dynamic height based on content
    height: 'auto',
    minHeight: '280px',
    maxHeight: '600px',
  },
  chartContainer: {
    padding: `0 ${tokens.spacingHorizontalL}`,
    marginBottom: tokens.spacingVerticalS,
  },
  expandPrompt: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalM,
    marginTop: 'auto',
    cursor: 'pointer',
    color: tokens.colorBrandForeground1,
    fontSize: '13px',
    fontWeight: 500,
    ':hover': {
      textDecoration: 'underline',
    },
  },
});

// ============================================
// Props Interface
// ============================================
interface UnreadInboxCardProps {
  context: WebPartContext;
  settings?: IUnreadInboxSettings;
  dataMode?: DataMode;
  onToggleSize?: () => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format hours/days for display
 */
const formatAge = (hours: number): string => {
  if (hours < 1) return '<1h';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

// ============================================
// Component
// ============================================
export const UnreadInboxCard: React.FC<UnreadInboxCardProps> = ({
  context,
  settings = DEFAULT_UNREAD_INBOX_SETTINGS,
  dataMode = 'api',
  onToggleSize,
}) => {
  const cardStyles = useCardStyles();
  const styles = useStyles();

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = useState<UnreadInboxData | null>(null);
  const [testTrendData, setTestTrendData] = useState<InboxTrendData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestUnreadInboxData());
        setTestTrendData(getTestInboxTrendData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook (only used when dataMode === 'api')
  const apiHook = useUnreadInbox(context, settings);

  // Select between API and test data based on mode
  const data = dataMode === 'test' ? testData : apiHook.data;
  const trendData = dataMode === 'test' ? testTrendData : null; // API would provide this
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const lastRefreshed = dataMode === 'test' ? new Date() : apiHook.lastRefreshed;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestUnreadInboxData());
          setTestTrendData(getTestInboxTrendData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Stats grid data
  const statsData = useMemo((): [StatItem, StatItem, StatItem, StatItem] => {
    return [
      {
        label: 'Unread',
        value: data?.totalCount || 0,
        icon: <Mail20Regular />,
      },
      {
        label: 'High Priority',
        value: data?.highPriorityCount || 0,
        icon: <AlertUrgent20Regular />,
      },
      {
        label: 'Attachments',
        value: data?.attachmentCount || 0,
        icon: <AttachRegular />,
      },
      {
        label: 'Oldest',
        value: data?.oldestUnreadHours ? formatAge(data.oldestUnreadHours) : '-',
        icon: <Clock20Regular />,
      },
    ];
  }, [data]);

  // Top items (3 oldest or highest importance unread emails)
  const topItems = useMemo((): TopItem[] => {
    if (!data) return [];

    // Sort by importance first (high priority), then by oldest
    const sortedEmails = [...data.emails]
      .sort((a, b) => {
        // High importance first
        if (a.importance === 'high' && b.importance !== 'high') return -1;
        if (b.importance === 'high' && a.importance !== 'high') return 1;
        // Then by oldest
        return a.receivedDateTime.getTime() - b.receivedDateTime.getTime();
      })
      .slice(0, 3);

    return sortedEmails.map((email): TopItem => {
      const now = new Date();
      const diffMs = now.getTime() - email.receivedDateTime.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      return {
        id: email.id,
        title: email.subject,
        subtitle: `From ${email.from.name} - ${formatAge(diffHours)} ago`,
        icon: email.importance === 'high' ? <AlertUrgent20Regular /> : <Mail20Regular />,
        badge: email.importance === 'high' ? 'Urgent' : (email.hasAttachments ? 'Attachment' : undefined),
        badgeColor: email.importance === 'high' ? 'danger' : 'informative',
        onClick: () => window.open(email.webLink, '_blank', 'noopener,noreferrer'),
      };
    });
  }, [data]);

  // Convert trend for chart
  const chartTrend = useMemo(() => {
    if (!trendData) return 'stable' as const;
    switch (trendData.trend) {
      case 'more': return 'worsening' as const;
      case 'fewer': return 'improving' as const;
      default: return 'stable' as const;
    }
  }, [trendData]);

  // Expand button
  const expandButton = onToggleSize ? (
    <Tooltip content="Expand to detailed view" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowExpand20Regular />}
        onClick={onToggleSize}
        aria-label="Expand card"
      />
    </Tooltip>
  ) : undefined;

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
      {expandButton}
    </div>
  );

  // Empty state
  if (!isLoading && !error && (!data || data.totalCount === 0)) {
    return (
      <BaseCard testId="unread-inbox-card" empty>
        <CardHeader
          icon={<Mail24Regular />}
          title="Unread Inbox"
          actions={expandButton}
        />
        <EmptyState
          icon={<Mail24Regular />}
          title="Inbox zero!"
          description="You have no unread emails"
        />
      </BaseCard>
    );
  }

  // Determine badge variant based on high importance count
  const badgeVariant = data?.highImportanceCount && data.highImportanceCount > 0
    ? 'danger' as const
    : undefined;

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading emails..."
      testId="unread-inbox-card"
      className={styles.card}
    >
      <CardHeader
        icon={<Mail24Regular />}
        title="Unread Inbox"
        badge={data?.totalCount}
        badgeVariant={badgeVariant}
        actions={headerActions}
      />

      {/* Trend Chart */}
      {trendData && data && data.totalCount > 0 && (
        <div className={styles.chartContainer}>
          <TrendBarChart
            data={trendData.dataPoints}
            title="Email Volume (7 days)"
            trend={chartTrend}
            trendLabels={{
              improving: 'Fewer',
              worsening: 'More',
              stable: 'Steady',
            }}
            color="brand"
            footerText={`Avg: ${trendData.averageEmailsPerDay} emails/day`}
          />
        </div>
      )}

      {/* Statistics Grid */}
      {data && (
        <StatsGrid stats={statsData} />
      )}

      {/* Top Priority/Oldest Emails - Limited to 1 item to fit in medium card */}
      {topItems.length > 0 && (
        <TopItemsList
          header="Priority Emails"
          items={topItems}
          maxItems={1}
        />
      )}

      {/* Expand Prompt */}
      {onToggleSize && (
        <div className={styles.expandPrompt} onClick={onToggleSize}>
          <ArrowExpand20Regular />
          <span>View all {data?.totalCount} emails</span>
        </div>
      )}

      {/* Footer */}
      <div className={cardStyles.cardFooter}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
        </Text>
      </div>
    </BaseCard>
  );
};

export default UnreadInboxCard;
