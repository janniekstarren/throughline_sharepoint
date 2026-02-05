// ============================================
// FlaggedEmailsCard - Medium Card (Summary View)
// Shows flagged emails with chart, stats, and top items
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
  Flag24Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  Flag20Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Timer20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useFlaggedEmails,
  IFlaggedEmailsSettings,
  DEFAULT_FLAGGED_EMAILS_SETTINGS,
} from '../../hooks/useFlaggedEmails';
import { FlaggedEmailsData, FlaggedEmail, FlagsTrendData } from '../../models/FlaggedEmails';
import { BaseCard, CardHeader, EmptyState, TrendBarChart, StatsGrid, TopItemsList } from '../shared';
import { StatItem, TopItem } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestFlaggedEmailsData, getTestFlagsTrendData } from '../../services/testData/flaggedEmailsNew';

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
interface FlaggedEmailsCardProps {
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
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// ============================================
// Component
// ============================================
export const FlaggedEmailsCard: React.FC<FlaggedEmailsCardProps> = ({
  context,
  settings = DEFAULT_FLAGGED_EMAILS_SETTINGS,
  dataMode = 'api',
  onToggleSize,
}) => {
  const cardStyles = useCardStyles();
  const styles = useStyles();

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = useState<FlaggedEmailsData | null>(null);
  const [testTrendData, setTestTrendData] = useState<FlagsTrendData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestFlaggedEmailsData());
        setTestTrendData(getTestFlagsTrendData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook (only used when dataMode === 'api')
  const apiHook = useFlaggedEmails(context, settings);

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
          setTestData(getTestFlaggedEmailsData());
          setTestTrendData(getTestFlagsTrendData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Handle email click
  const handleEmailClick = (email: FlaggedEmail): void => {
    window.open(email.webLink, '_blank', 'noopener,noreferrer');
  };

  // Stats grid data
  const statsData = useMemo((): [StatItem, StatItem, StatItem, StatItem] => {
    const activeCount = data ? data.totalCount - data.completedCount : 0;
    return [
      {
        label: 'Active',
        value: activeCount,
        icon: <Flag20Regular />,
      },
      {
        label: 'Completed',
        value: data?.completedThisWeek || 0,
        icon: <CheckmarkCircle20Regular />,
      },
      {
        label: 'Avg Age',
        value: data?.averageAgeDays ? `${data.averageAgeDays}d` : '-',
        icon: <Clock20Regular />,
      },
      {
        label: 'Oldest',
        value: data?.oldestFlagDays ? `${data.oldestFlagDays}d` : '-',
        icon: <Timer20Regular />,
      },
    ];
  }, [data]);

  // Top items (3 oldest active flags)
  const topItems = useMemo((): TopItem[] => {
    if (!data) return [];

    const activeEmails = data.emails
      .filter(e => e.flagStatus === 'flagged')
      .sort((a, b) => a.receivedDateTime.getTime() - b.receivedDateTime.getTime())
      .slice(0, 3);

    return activeEmails.map((email): TopItem => ({
      id: email.id,
      title: email.subject,
      subtitle: `${email.from.name} - ${formatRelativeTime(email.receivedDateTime)}`,
      icon: <Flag20Regular />,
      badge: email.importance === 'high' ? 'Urgent' : undefined,
      badgeColor: 'danger',
      onClick: () => handleEmailClick(email),
    }));
  }, [data]);

  // Convert trend for chart
  const chartTrend = useMemo(() => {
    if (!trendData) return 'stable' as const;
    return trendData.trend;
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

  // Calculate active flags count for badge
  const activeCount = data ? data.totalCount - data.completedCount : 0;

  // Empty state
  if (!isLoading && !error && (!data || data.totalCount === 0)) {
    return (
      <BaseCard testId="flagged-emails-card" empty>
        <CardHeader
          icon={<Flag24Regular />}
          title="Flagged Emails"
          actions={expandButton}
        />
        <EmptyState
          icon={<Flag24Regular />}
          title="No flagged emails"
          description="You don't have any flagged emails"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading flagged emails..."
      testId="flagged-emails-card"
      className={styles.card}
    >
      <CardHeader
        icon={<Flag24Regular />}
        title="Flagged Emails"
        badge={activeCount > 0 ? activeCount : undefined}
        actions={headerActions}
      />

      {/* Trend Chart */}
      {trendData && data && activeCount > 0 && (
        <div className={styles.chartContainer}>
          <TrendBarChart
            data={trendData.dataPoints}
            title="Completions (7 days)"
            trend={chartTrend}
            trendLabels={{
              improving: 'More done',
              worsening: 'Fewer done',
              stable: 'Steady',
            }}
            color="brand"
            footerText={`Avg: ${trendData.averageCompletedPerDay} completed/day`}
          />
        </div>
      )}

      {/* Statistics Grid */}
      {data && (
        <StatsGrid stats={statsData} />
      )}

      {/* Top Oldest Active Flags - Limited to 1 item to fit in medium card */}
      {topItems.length > 0 && (
        <TopItemsList
          header="Oldest Active"
          items={topItems}
          maxItems={1}
        />
      )}

      {/* Expand Prompt */}
      {onToggleSize && (
        <div className={styles.expandPrompt} onClick={onToggleSize}>
          <ArrowExpand20Regular />
          <span>View all {activeCount} flagged emails</span>
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

export default FlaggedEmailsCard;
