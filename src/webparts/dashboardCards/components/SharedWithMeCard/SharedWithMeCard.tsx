// ============================================
// SharedWithMeCard - Medium Card (Summary View)
// Shows files shared with the current user with chart, stats, and top items
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
  ShareMultiple24Regular,
  Share24Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  Share20Regular,
  Clock20Regular,
  People20Regular,
  Storage20Regular,
  Document20Regular,
  DocumentPdf20Regular,
  Image20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useSharedWithMe,
  ISharedWithMeSettings,
  DEFAULT_SHARED_WITH_ME_SETTINGS,
} from '../../hooks/useSharedWithMe';
import { SharedWithMeData, SharingTrendData } from '../../models/SharedWithMe';
import { BaseCard, CardHeader, EmptyState, TrendBarChart, StatsGrid, TopItemsList, SmallCard } from '../shared';
import { StatItem, TopItem } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestSharedWithMeData, getTestSharingTrendData } from '../../services/testData/sharedWithMe';
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
// File type icon component for TopItemsList
// ============================================
const getFileTypeIcon = (fileType?: string): React.ReactNode => {
  const type = fileType?.toLowerCase() || '';

  if (type === 'pdf') {
    return <DocumentPdf20Regular style={{ color: '#d13438' }} />;
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(type)) {
    return <Image20Regular />;
  }

  return <Document20Regular />;
};

// ============================================
// Helper functions
// ============================================
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ============================================
// Props Interface
// ============================================
interface SharedWithMeCardProps {
  context: WebPartContext;
  settings?: ISharedWithMeSettings;
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
// Component
// ============================================
export const SharedWithMeCard: React.FC<SharedWithMeCardProps> = ({
  context,
  settings = DEFAULT_SHARED_WITH_ME_SETTINGS,
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
  const [testData, setTestData] = useState<SharedWithMeData | null>(null);
  const [testTrendData, setTestTrendData] = useState<SharingTrendData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestSharedWithMeData());
        setTestTrendData(getTestSharingTrendData());
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
      setAiCardSummary(getGenericAICardSummary('sharedWithMe'));
      setAiInsights(getGenericAIInsights('sharedWithMe'));
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // API hook (only used when dataMode === 'api')
  const apiHook = useSharedWithMe(context, settings);

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
          setTestData(getTestSharedWithMeData());
          setTestTrendData(getTestSharingTrendData());
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
        icon: <Share20Regular />,
      },
      {
        label: 'Recent',
        value: data?.recentCount || 0,
        icon: <Clock20Regular />,
      },
      {
        label: 'Sharers',
        value: data?.uniqueSharersCount || 0,
        icon: <People20Regular />,
      },
      {
        label: 'Size',
        value: data?.totalSizeBytes ? formatFileSize(data.totalSizeBytes) : '-',
        icon: <Storage20Regular />,
      },
    ];
  }, [data]);

  // Top items (3 most recently shared files)
  const topItems = useMemo((): TopItem[] => {
    if (!data) return [];

    const recentFiles = [...data.files]
      .sort((a, b) => b.sharedDateTime.getTime() - a.sharedDateTime.getTime())
      .slice(0, 3);

    return recentFiles.map((file): TopItem => ({
      id: file.id,
      title: file.name,
      subtitle: `${file.sharedBy.displayName} - ${formatRelativeDate(file.sharedDateTime)}`,
      icon: getFileTypeIcon(file.fileType),
      onClick: () => window.open(file.webUrl, '_blank', 'noopener,noreferrer'),
    }));
  }, [data]);

  // Convert trend for chart
  const chartTrend = useMemo(() => {
    if (!trendData) return 'stable' as const;
    switch (trendData.trend) {
      case 'more sharing': return 'worsening' as const;
      case 'less sharing': return 'improving' as const;
      default: return 'stable' as const;
    }
  }, [trendData]);

  // SMALL CARD VARIANT
  if (size === 'small') {
    return (
      <SmallCard
        cardId="sharedWithMe"
        title="Shared With Me"
        icon={<Share24Regular />}
        metricValue={data?.totalCount ?? 0}
        metricLabel="SHARED"
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
      <BaseCard testId="shared-with-me-card" empty>
        <CardHeader
          icon={<ShareMultiple24Regular />}
          title="Shared With Me"
          actions={expandButton}
        />
        <EmptyState
          icon={<ShareMultiple24Regular />}
          title="No shared files"
          description="Files shared with you will appear here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading shared files..."
      testId="shared-with-me-card"
      className={styles.card}
    >
      <CardHeader
        icon={<ShareMultiple24Regular />}
        title="Shared With Me"
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
            title="Files Shared (7 days)"
            trend={chartTrend}
            trendLabels={{
              improving: 'Less sharing',
              worsening: 'More sharing',
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

      {/* Top Recently Shared Files - Limited to 1 item to fit in medium card */}
      {topItems.length > 0 && (
        <TopItemsList
          header="Recently Shared"
          items={topItems}
          maxItems={1}
        />
      )}

      {/* Expand Prompt */}
      {handleCycleSize && (
        <div className={styles.expandPrompt} onClick={handleCycleSize}>
          <ArrowExpand20Regular />
          <span>View all {data?.totalCount} shared files</span>
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

export default SharedWithMeCard;
