// ============================================
// MyTasksCard - Medium Card (Summary View)
// Shows tasks with chart, stats, and top overdue items
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
  TaskListSquareLtr24Regular,
  Clipboard24Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  TaskListLtr20Regular,
  Timer20Regular,
  AlertUrgent20Regular,
  ArrowClockwise20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useMyTasks,
  IMyTasksSettings,
  DEFAULT_MY_TASKS_SETTINGS,
} from '../../hooks/useMyTasks';
import { MyTasksData, TasksTrendData } from '../../models/MyTasks';
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, TrendBarChart, DonutChart, StatsGrid, TopItemsList, SmallCard } from '../shared';
import { AIInsightBanner, AIOnboardingDialog } from '../shared/AIComponents';
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import { StatItem, TopItem, DonutSegment, ChartCarousel } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestMyTasksData, getTestTasksTrendData } from '../../services/testData/myTasks';
import {
  getAITasksCardSummary,
  getAllTasksInsights,
} from '../../services/testData/aiDemoData';
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
interface MyTasksCardProps {
  context: WebPartContext;
  settings?: IMyTasksSettings;
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
 * Format due date relative to now
 */
const formatDueDate = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays < -1) {
    return `${Math.abs(diffDays)} days overdue`;
  }
  if (diffDays === -1 || (diffDays === 0 && diffHours < 0)) {
    if (diffHours >= -24) {
      return `${Math.abs(diffHours)} hours overdue`;
    }
    return 'Yesterday';
  }
  if (diffDays === 0) {
    if (diffHours <= 1) {
      return 'Due soon';
    }
    return `Due in ${diffHours} hours`;
  }
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  if (diffDays <= 7) {
    return `In ${diffDays} days`;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// ============================================
// Component
// ============================================
export const MyTasksCard: React.FC<MyTasksCardProps> = ({
  context,
  settings = DEFAULT_MY_TASKS_SETTINGS,
  dataMode = 'api',
  aiDemoMode = false,
  size = 'medium',
  onSizeChange,
  onCycleSize,
  onToggleSize, // deprecated
}) => {
  // Use onSizeChange if provided, fallback to onCycleSize/onToggleSize for backwards compatibility
  const handleSizeChange = onSizeChange || ((newSize: CardSize) => {
    if (onCycleSize) onCycleSize();
    else if (onToggleSize) onToggleSize();
  });
  const handleCycleSize = onCycleSize || onToggleSize;
  const cardStyles = useCardStyles();
  const styles = useStyles();

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = useState<MyTasksData | null>(null);
  const [testTrendData, setTestTrendData] = useState<TasksTrendData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // AI demo mode state
  const [aiCardSummary, setAiCardSummary] = useState<IAICardSummary | null>(null);
  const [aiInsights, setAiInsights] = useState<IAIInsight[]>([]);
  const [showAiOnboarding, setShowAiOnboarding] = useState(false);

  // Load AI demo data when enabled
  React.useEffect(() => {
    if (aiDemoMode) {
      setAiCardSummary(getAITasksCardSummary());
      setAiInsights(getAllTasksInsights());
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestMyTasksData());
        setTestTrendData(getTestTasksTrendData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook (only used when dataMode === 'api')
  const apiHook = useMyTasks(context, settings);

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
          setTestData(getTestMyTasksData());
          setTestTrendData(getTestTasksTrendData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Stats grid data
  const statsData = useMemo((): [StatItem, StatItem, StatItem, StatItem] => {
    return [
      {
        label: 'Total',
        value: data?.totalCount || 0,
        icon: <TaskListLtr20Regular />,
      },
      {
        label: 'Overdue',
        value: data?.overdueCount || 0,
        icon: <AlertUrgent20Regular />,
        color: (data?.overdueCount || 0) > 0 ? 'danger' as const : undefined,
      },
      {
        label: 'Due Today',
        value: data?.dueTodayCount || 0,
        icon: <Timer20Regular />,
        color: (data?.dueTodayCount || 0) > 0 ? 'warning' as const : undefined,
      },
      {
        label: 'In Progress',
        value: data?.inProgressCount || 0,
        icon: <ArrowClockwise20Regular />,
        color: (data?.inProgressCount || 0) > 0 ? 'brand' as const : undefined,
      },
    ];
  }, [data]);

  // Top items (3 most overdue tasks)
  const topItems = useMemo((): TopItem[] => {
    if (!data) return [];

    // Get overdue tasks sorted by most overdue first
    const overdueTasks = data.tasks
      .filter(t => t.isOverdue && t.dueDateTime)
      .sort((a, b) => {
        if (!a.dueDateTime || !b.dueDateTime) return 0;
        return a.dueDateTime.getTime() - b.dueDateTime.getTime(); // Oldest (most overdue) first
      })
      .slice(0, 3);

    return overdueTasks.map((task): TopItem => ({
      id: task.id,
      title: task.title,
      subtitle: task.dueDateTime ? formatDueDate(task.dueDateTime) : task.listName,
      icon: <AlertUrgent20Regular />,
      badge: task.importance === 'high' ? 'High' : undefined,
      badgeColor: 'danger',
      onClick: () => task.webUrl && window.open(task.webUrl, '_blank', 'noopener,noreferrer'),
    }));
  }, [data]);

  // Convert trend for chart
  const chartTrend = useMemo(() => {
    if (!trendData) return 'stable' as const;
    return trendData.trend;
  }, [trendData]);

  // SMALL CARD VARIANT
  if (size === 'small') {
    return (
      <SmallCard
        cardId="myTasks"
        title="My Tasks"
        icon={<Clipboard24Regular />}
        metricValue={data?.totalCount ?? 0}
        smartLabelKey="task"
        chartData={trendData?.dataPoints}
        chartColor="brand"
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
        aiDemoMode={aiDemoMode}
        aiSummary={aiCardSummary?.summary}
        aiInsights={aiInsights?.map(i => i.title)}
      />
    );
  }

  // Donut chart data - tasks by list
  const tasksByListData = useMemo((): DonutSegment[] => {
    if (!data || data.tasks.length === 0) return [];

    // Group tasks by listName
    const listCounts = data.tasks.reduce((acc, task) => {
      const listName = task.listName || 'Other';
      acc[listName] = (acc[listName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to DonutSegment array and sort by count descending
    return Object.entries(listCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Limit to top 6 lists for readability
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

  // Determine badge variant based on overdue count
  const badgeVariant = data && data.overdueCount > 0 ? 'danger' : 'brand';

  // Empty state
  if (!isLoading && !error && (!data || data.totalCount === 0)) {
    return (
      <BaseCard testId="my-tasks-card" empty>
        <CardHeader
          icon={<TaskListSquareLtr24Regular />}
          title="My Tasks"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<TaskListSquareLtr24Regular />}
          title="No tasks"
          description="You're all caught up!"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading tasks..."
      testId="my-tasks-card"
      className={styles.card}
    >
      <CardHeader
        icon={<TaskListSquareLtr24Regular />}
        title="My Tasks"
        badge={data?.totalCount}
        badgeVariant={badgeVariant}
        actions={headerActions}
      />

      <div className={cardStyles.cardContent}>
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

        {/* Charts Carousel */}
        {data && data.totalCount > 0 && (
          <div className={styles.chartContainer}>
            <ChartCarousel showArrows={true} showIndicators={true}>
              {/* Trend Chart - Completion over 7 days */}
              {trendData && (
                <TrendBarChart
                  data={trendData.dataPoints}
                  title="Completed (7 days)"
                  trend={chartTrend}
                  trendLabels={{
                    improving: 'Improving',
                    worsening: 'Slowing',
                    stable: 'Steady',
                  }}
                  color="brand"
                  footerText={`Avg: ${trendData.averageCompletedPerDay} tasks/day`}
                />
              )}
              {/* Donut Chart - Tasks by List */}
              {tasksByListData.length > 0 && (
                <DonutChart
                  data={tasksByListData}
                  title="Tasks by List"
                  size={100}
                  thickness={18}
                  centerValue={data.totalCount}
                  centerText="total"
                  showLegend={true}
                />
              )}
            </ChartCarousel>
          </div>
        )}

        {/* Statistics Grid */}
        {data && (
          <StatsGrid stats={statsData} />
        )}

        {/* Top Overdue Tasks - Limited to 1 item to fit in medium card */}
        {topItems.length > 0 && (
          <TopItemsList
            header="Most Overdue"
            items={topItems}
            maxItems={1}
          />
        )}

        {/* Expand Prompt */}
        {handleCycleSize && (
          <div className={styles.expandPrompt} onClick={handleCycleSize}>
            <ArrowExpand20Regular />
            <span>View all {data?.totalCount} tasks</span>
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

export default MyTasksCard;
