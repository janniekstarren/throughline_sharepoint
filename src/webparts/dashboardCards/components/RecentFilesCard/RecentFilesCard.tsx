// ============================================
// RecentFilesCard - Medium Card (Summary View)
// Shows recent files with chart, stats, and top items
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
  DocumentMultiple24Regular,
  Document24Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  Document20Regular,
  DocumentTable20Regular,
  SlideText20Regular,
  Folder20Regular,
  Document16Regular,
  DocumentPdf16Regular,
  DocumentText16Regular,
  SlideText16Regular,
  Table16Regular,
  Folder16Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useRecentFiles,
  IRecentFilesSettings,
  DEFAULT_RECENT_FILES_SETTINGS,
} from '../../hooks/useRecentFiles';
import { RecentFilesData, FileItem, FilesTrendData } from '../../models/RecentFiles';
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, TrendBarChart, StatsGrid, TopItemsList, SmallCard } from '../shared';
import { StatItem, TopItem } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestRecentFilesData, getTestFilesTrendData } from '../../services/testData/recentFiles';
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
interface RecentFilesCardProps {
  context: WebPartContext;
  settings?: IRecentFilesSettings;
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
 * Format relative time for display
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

/**
 * Get file icon based on file type (16px version for TopItemsList)
 */
const getFileIcon16 = (file: FileItem): React.ReactElement => {
  if (file.isFolder) {
    return <Folder16Regular />;
  }

  switch (file.fileType?.toLowerCase()) {
    case 'pdf':
      return <DocumentPdf16Regular />;
    case 'doc':
    case 'docx':
      return <DocumentText16Regular />;
    case 'xls':
    case 'xlsx':
      return <Table16Regular />;
    case 'ppt':
    case 'pptx':
      return <SlideText16Regular />;
    default:
      return <Document16Regular />;
  }
};

// ============================================
// Component
// ============================================
export const RecentFilesCard: React.FC<RecentFilesCardProps> = ({
  context,
  settings = DEFAULT_RECENT_FILES_SETTINGS,
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
  const [testData, setTestData] = useState<RecentFilesData | null>(null);
  const [testTrendData, setTestTrendData] = useState<FilesTrendData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestRecentFilesData());
        setTestTrendData(getTestFilesTrendData());
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
      setAiCardSummary(getGenericAICardSummary('recentFiles'));
      setAiInsights(getGenericAIInsights('recentFiles'));
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // API hook (only used when dataMode === 'api')
  const apiHook = useRecentFiles(context, settings);

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
          setTestData(getTestRecentFilesData());
          setTestTrendData(getTestFilesTrendData());
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
        icon: <Folder20Regular />,
      },
      {
        label: 'Docs',
        value: data?.docsCount || 0,
        icon: <Document20Regular />,
      },
      {
        label: 'Sheets',
        value: data?.sheetsCount || 0,
        icon: <DocumentTable20Regular />,
      },
      {
        label: 'Slides',
        value: data?.slidesCount || 0,
        icon: <SlideText20Regular />,
      },
    ];
  }, [data]);

  // Top items (3 most recently modified files)
  const topItems = useMemo((): TopItem[] => {
    if (!data) return [];

    const recentFiles = data.files
      .sort((a, b) => b.lastModifiedDateTime.getTime() - a.lastModifiedDateTime.getTime())
      .slice(0, 3);

    return recentFiles.map((file): TopItem => ({
      id: file.id,
      title: file.name,
      subtitle: formatRelativeTime(file.lastModifiedDateTime),
      icon: getFileIcon16(file),
      badge: file.isFolder ? 'Folder' : undefined,
      badgeColor: file.isFolder ? 'warning' : undefined,
      onClick: () => window.open(file.webUrl, '_blank', 'noopener,noreferrer'),
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
        cardId="recentFiles"
        title="Recent Files"
        icon={<Document24Regular />}
        metricValue={data?.totalCount ?? 0}
        smartLabelKey="file"
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
  if (!isLoading && !error && (!data || data.totalCount === 0)) {
    return (
      <BaseCard testId="recent-files-card" empty>
        <CardHeader
          icon={<DocumentMultiple24Regular />}
          title="Recent Files"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<DocumentMultiple24Regular />}
          title="No recent files"
          description="Files you work on will appear here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading files..."
      testId="recent-files-card"
      className={styles.card}
    >
      <CardHeader
        icon={<DocumentMultiple24Regular />}
        title="Recent Files"
        badge={data?.totalCount}
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

        {/* Trend Chart */}
        {trendData && data && data.totalCount > 0 && (
          <div className={styles.chartContainer}>
            <TrendBarChart
              data={trendData.dataPoints}
              title="File Activity (7 days)"
              trend={chartTrend}
              trendLabels={{
                improving: 'More Active',
                worsening: 'Less Active',
                stable: 'Steady',
              }}
              color="brand"
              footerText={`Avg: ${trendData.averageFilesPerDay} files/day`}
            />
          </div>
        )}

        {/* Statistics Grid */}
        {data && (
          <StatsGrid stats={statsData} />
        )}

        {/* Top Recent Files - Limited to 1 item to fit in medium card */}
        {topItems.length > 0 && (
          <TopItemsList
            header="Recently Modified"
            items={topItems}
            maxItems={1}
          />
        )}

        {/* Expand Prompt */}
        {handleCycleSize && (
          <div className={styles.expandPrompt} onClick={handleCycleSize}>
            <ArrowExpand20Regular />
            <span>View all {data?.totalCount} files</span>
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

export default RecentFilesCard;
