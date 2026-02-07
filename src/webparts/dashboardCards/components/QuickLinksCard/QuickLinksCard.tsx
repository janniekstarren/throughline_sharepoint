// ============================================
// QuickLinksCard - Medium card showing link summary
// Displays donut chart, stats grid, and top items
// Follows TodaysAgendaCard pattern with DonutChart
// ============================================

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  tokens,
  makeStyles,
  Text,
  Button,
  Tooltip,
  Spinner,
} from '@fluentui/react-components';
import {
  LinkMultiple24Regular,
  Link24Regular,
  ArrowClockwise20Regular,
  ArrowExpand20Regular,
  Link20Regular,
  Folder20Regular,
  Star20Regular,
  Clock20Regular,
} from '@fluentui/react-icons';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  QuickLinksData,
  LinksCategoryData,
  IQuickLinksSettings,
  DEFAULT_QUICK_LINKS_SETTINGS,
  toLinksCategoryData,
} from '../../models/QuickLinks';
import { DataMode } from '../../services/testData';
import { getTestQuickLinksData, getTestLinksCategoryData } from '../../services/testData/quickLinks';
import { AIInsightBanner, AIOnboardingDialog } from '../shared/AIComponents';
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import { getGenericAICardSummary, getGenericAIInsights } from '../../services/testData/aiDemoData';
import { QuickLinksService } from '../../services/QuickLinksService';
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, DonutChart, StatsGrid, TopItemsList, SmallCard } from '../shared';
import { StatItem, TopItem, DonutSegment } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { CardSize } from '../../types/CardSize';

// ============================================
// Types
// ============================================

export interface QuickLinksCardProps {
  /** WebPart context */
  context: WebPartContext;
  /** Graph client for API calls */
  graphClient?: MSGraphClientV3;
  /** Data mode - 'api' for real data, 'test' for mock data */
  dataMode?: DataMode;
  /** AI demo mode - show AI-enhanced content */
  aiDemoMode?: boolean;
  /** Card settings */
  settings?: IQuickLinksSettings;
  /** Card title */
  title?: string;
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
// Icon Mapper for Top Items
// ============================================

const getLinkIcon = (iconName?: string): React.ReactElement => {
  // Return a generic link icon for the top items list
  return <Link20Regular />;
};

// ============================================
// Main Component
// ============================================

export const QuickLinksCard: React.FC<QuickLinksCardProps> = ({
  context,
  graphClient,
  dataMode = 'api',
  aiDemoMode = false,
  settings = DEFAULT_QUICK_LINKS_SETTINGS,
  title = 'Quick Links',
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

  // State
  const [data, setData] = useState<QuickLinksData | null>(null);
  const [categoryData, setCategoryData] = useState<LinksCategoryData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Service ref
  const serviceRef = React.useRef<QuickLinksService | null>(null);

  // Initialize service
  React.useEffect(() => {
    if (graphClient && dataMode === 'api') {
      serviceRef.current = new QuickLinksService(graphClient, context, settings);
    }
  }, [graphClient, context, dataMode, settings]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (dataMode === 'test') {
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const testData = getTestQuickLinksData();
        const testCategoryData = getTestLinksCategoryData();
        // Apply maxItems limit
        if (settings.maxItems && testData.links.length > settings.maxItems) {
          testData.links = testData.links.slice(0, settings.maxItems);
          testData.totalCount = testData.links.length;
        }
        setData(testData);
        setCategoryData(testCategoryData);
        setLastRefreshed(new Date());
      } else if (serviceRef.current) {
        const result = await serviceRef.current.getData();
        setData(result);
        setCategoryData(toLinksCategoryData(result.byCategory));
        setLastRefreshed(new Date());
      } else if (graphClient) {
        const service = new QuickLinksService(graphClient, context, settings);
        serviceRef.current = service;
        const result = await service.getData();
        setData(result);
        setCategoryData(toLinksCategoryData(result.byCategory));
        setLastRefreshed(new Date());
      } else {
        // Fall back to test data
        await new Promise((resolve) => setTimeout(resolve, 300));
        const testData = getTestQuickLinksData();
        setData(testData);
        setCategoryData(toLinksCategoryData(testData.byCategory));
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load quick links:', err);
      setError('Failed to load links');
      // Fall back to test data on error
      try {
        const testData = getTestQuickLinksData();
        setData(testData);
        setCategoryData(toLinksCategoryData(testData.byCategory));
        setLastRefreshed(new Date());
      } catch {
        // Ignore fallback error
      }
    } finally {
      setLoading(false);
    }
  }, [dataMode, graphClient, context, settings]);

  // Initial load
  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  // AI demo mode state
  const [aiCardSummary, setAiCardSummary] = React.useState<IAICardSummary | null>(null);
  const [aiInsights, setAiInsights] = React.useState<IAIInsight[]>([]);
  const [showAiOnboarding, setShowAiOnboarding] = React.useState(false);

  // Load AI demo data when enabled
  React.useEffect(() => {
    if (aiDemoMode) {
      setAiCardSummary(getGenericAICardSummary('quickLinks'));
      setAiInsights(getGenericAIInsights('quickLinks'));
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.clearCache();
    }
    void loadData();
  }, [loadData]);

  // Stats grid data
  const statsData = useMemo((): [StatItem, StatItem, StatItem, StatItem] => {
    return [
      {
        label: 'Total',
        value: data?.totalCount || 0,
        icon: <Link20Regular />,
      },
      {
        label: 'Categories',
        value: data?.categoryCount || 0,
        icon: <Folder20Regular />,
      },
      {
        label: 'Favorites',
        value: data?.favoritesCount || 0,
        icon: <Star20Regular />,
      },
      {
        label: 'Recent',
        value: data?.recentlyUsedCount || 0,
        icon: <Clock20Regular />,
      },
    ];
  }, [data]);

  // Top items (most used or favorite links)
  const topItems = useMemo((): TopItem[] => {
    if (!data) return [];

    // Sort by usage count and favorites, then take top 3
    const sortedLinks = [...data.links]
      .sort((a, b) => {
        // Favorites first
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        // Then by usage count
        return (b.usageCount || 0) - (a.usageCount || 0);
      })
      .slice(0, 3);

    return sortedLinks.map((link): TopItem => ({
      id: link.id,
      title: link.title,
      subtitle: link.category || 'General',
      icon: getLinkIcon(link.icon),
      badge: link.isFavorite ? 'Favorite' : undefined,
      badgeColor: 'brand',
      onClick: () => window.open(link.url, '_blank', 'noopener,noreferrer'),
    }));
  }, [data]);

  // Convert category data to DonutSegment format
  const donutData = useMemo((): DonutSegment[] => {
    if (!categoryData) return [];
    return categoryData.map(cat => ({
      label: cat.label,
      value: cat.value,
      color: cat.color,
    }));
  }, [categoryData]);

  // SMALL CARD VARIANT
  if (size === 'small') {
    return (
      <SmallCard
        cardId="quickLinks"
        title="Quick Links"
        icon={<Link24Regular />}
        metricValue={data?.links?.length ?? 0}
        metricLabel="LINKS"
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={loading}
        hasError={!!error}
      />
    );
  }

  // Header actions
  const headerActions = (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={loading ? <Spinner size="tiny" /> : <ArrowClockwise20Regular />}
          size="small"
          onClick={handleRefresh}
          disabled={loading}
          aria-label="Refresh links"
        />
      </Tooltip>
      <CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />
    </div>
  );

  // Empty state
  if (!loading && !error && (!data || data.totalCount === 0)) {
    return (
      <BaseCard testId="quick-links-card" empty>
        <CardHeader
          icon={<LinkMultiple24Regular />}
          title={title}
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<LinkMultiple24Regular />}
          title="No links configured"
          description="Add quick links to access your favorite resources"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={loading && !data}
      error={error || undefined}
      loadingMessage="Loading links..."
      testId="quick-links-card"
      className={styles.card}
    >
      <CardHeader
        icon={<LinkMultiple24Regular />}
        title={title}
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

      {/* Donut Chart - Category Distribution */}
      {donutData.length > 0 && data && data.totalCount > 0 && (
        <div className={styles.chartContainer}>
          <DonutChart
            data={donutData}
            title="Links by Category"
            size={120}
            thickness={20}
            centerValue={data.totalCount}
            centerText="links"
            showLegend={true}
          />
        </div>
      )}

      {/* Statistics Grid */}
      {data && (
        <StatsGrid stats={statsData} />
      )}

      {/* Top Items - Most Used/Favorite Links - Limited to 1 item to fit in medium card */}
      {topItems.length > 0 && (
        <TopItemsList
          header="Most Used"
          items={topItems}
          maxItems={1}
        />
      )}

      {/* Expand Prompt */}
      {handleCycleSize && (
        <div className={styles.expandPrompt} onClick={handleCycleSize}>
          <ArrowExpand20Regular />
          <span>View all {data?.totalCount} links</span>
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

export default QuickLinksCard;
