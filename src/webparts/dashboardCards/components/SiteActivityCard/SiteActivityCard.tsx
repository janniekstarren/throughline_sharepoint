// ============================================
// SiteActivityCard - Medium Card (Summary View)
// Shows site activity with chart, stats, and top items
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
} from '@fluentui/react-components';
import {
  History24Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  Pulse20Regular,
  Person20Regular,
  People20Regular,
  Star20Regular,
  Document20Regular,
  Edit20Regular,
  Share20Regular,
  Delete20Regular,
  Add20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { SiteActivityData, ActivityTrendData } from '../../models/SiteActivity';
import { BaseCard, CardHeader, EmptyState, TrendBarChart, StatsGrid, TopItemsList, SmallCard } from '../shared';
import { StatItem, TopItem } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestSiteActivityData, getTestActivityTrendData } from '../../services/testData/siteActivity';
import { AIInsightBanner, AIOnboardingDialog } from '../shared/AIComponents';
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import { getGenericAICardSummary, getGenericAIInsights } from '../../services/testData/aiDemoData';
import { CardSize } from '../../types/CardSize';

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
export interface ISiteActivityCardProps {
  context: WebPartContext;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  /** Card size: 'small' | 'medium' | 'large' */
  size?: CardSize;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
  /** @deprecated Use onSizeChange instead */
  onCycleSize?: () => void;
  /** @deprecated Use onSizeChange instead */
  onToggleSize?: () => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get icon for activity action type
 */
const getActionIcon = (action: string): React.ReactElement => {
  switch (action.toLowerCase()) {
    case 'created':
      return <Add20Regular />;
    case 'edited':
    case 'modified':
      return <Edit20Regular />;
    case 'deleted':
      return <Delete20Regular />;
    case 'shared':
      return <Share20Regular />;
    default:
      return <Document20Regular />;
  }
};

/**
 * Format relative timestamp
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// ============================================
// Component
// ============================================
export const SiteActivityCard: React.FC<ISiteActivityCardProps> = ({
  context,
  dataMode = 'api',
  aiDemoMode = false,
  size = 'medium',
  onSizeChange,
  onCycleSize,
  onToggleSize, // deprecated, use onCycleSize
}) => {
  // Use onCycleSize if provided, fallback to onToggleSize for backwards compatibility
  const handleCycleSize = onCycleSize || onToggleSize;
  // Use onSizeChange if provided, fallback to onCycleSize/onToggleSize for backwards compatibility
  const handleSizeChange = onSizeChange || ((newSize: CardSize) => {
    if (onCycleSize) onCycleSize();
    else if (onToggleSize) onToggleSize();
  });
  const cardStyles = useCardStyles();
  const styles = useStyles();

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = useState<SiteActivityData | null>(null);
  const [testTrendData, setTestTrendData] = useState<ActivityTrendData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestSiteActivityData());
        setTestTrendData(getTestActivityTrendData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // AI demo mode state
  const [aiCardSummary, setAiCardSummary] = useState<IAICardSummary | null>(null);
  const [aiInsights, setAiInsights] = useState<IAIInsight[]>([]);
  const [showAiOnboarding, setShowAiOnboarding] = useState(false);

  // Load AI demo data when enabled
  React.useEffect(() => {
    if (aiDemoMode) {
      setAiCardSummary(getGenericAICardSummary('siteActivity'));
      setAiInsights(getGenericAIInsights('siteActivity'));
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // TODO: Add API hook when available (similar to useTodaysAgenda)
  // For now, we only support test mode
  const data = dataMode === 'test' ? testData : null;
  const trendData = dataMode === 'test' ? testTrendData : null;
  const isLoading = dataMode === 'test' ? testLoading : false;
  const error = null;
  const lastRefreshed = dataMode === 'test' ? new Date() : null;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestSiteActivityData());
          setTestTrendData(getTestActivityTrendData());
          setTestLoading(false);
        }, 500);
      }
    : async () => {};

  // Stats grid data
  const statsData = useMemo((): [StatItem, StatItem, StatItem, StatItem] => {
    return [
      {
        label: 'Total',
        value: data?.totalCount || 0,
        icon: <Pulse20Regular />,
      },
      {
        label: 'By You',
        value: data?.byYouCount || 0,
        icon: <Person20Regular />,
      },
      {
        label: 'By Others',
        value: data?.byOthersCount || 0,
        icon: <People20Regular />,
      },
      {
        label: 'Top Actor',
        value: data?.topActorName ? data.topActorName.split(' ')[0] : '-',
        icon: <Star20Regular />,
      },
    ];
  }, [data]);

  // Top items (3 most recent activities)
  const topItems = useMemo((): TopItem[] => {
    if (!data) return [];

    const recentActivities = data.activities
      .slice(0, 3);

    return recentActivities.map((activity): TopItem => ({
      id: activity.id,
      title: activity.itemName,
      subtitle: `${activity.actor} ${activity.action} - ${formatRelativeTime(activity.timestamp)}`,
      icon: getActionIcon(activity.action),
      onClick: activity.itemUrl
        ? () => window.open(activity.itemUrl, '_blank', 'noopener,noreferrer')
        : undefined,
    }));
  }, [data]);

  // Convert trend for chart
  const chartTrend = useMemo(() => {
    if (!trendData) return 'stable' as const;
    switch (trendData.trend) {
      case 'more active': return 'improving' as const;
      case 'less active': return 'worsening' as const;
      default: return 'stable' as const;
    }
  }, [trendData]);

  // SMALL CARD VARIANT
  if (size === 'small') {
    return (
      <SmallCard
        cardId="siteActivity"
        title="Site Activity"
        icon={<History24Regular />}
        metricValue={data?.activities?.length ?? 0}
        metricLabel="ACTIVITY"
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Expand button
  const expandButton = handleCycleSize ? (
    <Tooltip content="Expand to detailed view" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowExpand20Regular />}
        onClick={handleCycleSize}
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
      <BaseCard testId="site-activity-card" empty>
        <CardHeader
          icon={<History24Regular />}
          title="Site Activity"
          cardId="siteActivity"
          actions={expandButton}
        />
        <EmptyState
          icon={<History24Regular />}
          title="No recent activity"
          description="Activity will appear here as it happens"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error || undefined}
      loadingMessage="Loading activity..."
      testId="site-activity-card"
      className={styles.card}
    >
      <CardHeader
        icon={<History24Regular />}
        title="Site Activity"
        cardId="siteActivity"
        badge={data?.totalCount}
        actions={headerActions}
      />

      {/* AI Insight Banner */}
      {aiDemoMode && aiCardSummary && (
        <AIInsightBanner
          summary={aiCardSummary}
          insights={aiInsights}
          onLearnMore={handleAiLearnMore}
        />
      )}

      {/* AI Onboarding Dialog */}
      <AIOnboardingDialog
        open={showAiOnboarding}
        onClose={() => setShowAiOnboarding(false)}
      />

      {/* Trend Chart */}
      {trendData && data && data.totalCount > 0 && (
        <div className={styles.chartContainer}>
          <TrendBarChart
            data={trendData.dataPoints}
            title="Activity (7 days)"
            trend={chartTrend}
            trendLabels={{
              improving: 'More Active',
              worsening: 'Less Active',
              stable: 'Steady',
            }}
            color="brand"
            footerText={`Avg: ${trendData.averageActivitiesPerDay} activities/day`}
          />
        </div>
      )}

      {/* Statistics Grid */}
      {data && (
        <StatsGrid stats={statsData} />
      )}

      {/* Top Recent Activities - Limited to 1 item to fit in medium card */}
      {topItems.length > 0 && (
        <TopItemsList
          header="Recent Activity"
          items={topItems}
          maxItems={1}
        />
      )}

      {/* Expand Prompt */}
      {handleCycleSize && (
        <div className={styles.expandPrompt} onClick={handleCycleSize}>
          <ArrowExpand20Regular />
          <span>View all {data?.totalCount} activities</span>
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

export default SiteActivityCard;
