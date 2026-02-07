// ============================================
// Context Switching Card
// Displays context switching metrics and focus score
// Helps users understand their multitasking patterns
// ============================================

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  Text,
  Badge,
  Button,
  Spinner,
  TabList,
  Tab,
  Tooltip,
  Divider,
  tokens
} from '@fluentui/react-components';
import {
  ArrowSyncRegular,
  BrainCircuitRegular,
  ChartMultipleRegular,
  TimelineRegular,
  DataPieRegular,
  ArrowTrendingRegular,
  TargetRegular,
  ArrowMaximizeRegular,
} from '@fluentui/react-icons';
import {
  MailRegular,
  ChatRegular,
  PeopleRegular,
  VideoRegular,
  DocumentRegular,
  CalendarLtrRegular
} from '@fluentui/react-icons';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import {
  ContextSwitchingData,
  ContextSwitchingSettings,
  DEFAULT_CONTEXT_SWITCHING_SETTINGS,
  ContextViewMode,
  ContextType,
  getContextTypeColor
} from '../../models/ContextSwitching';
import { DataMode } from '../../services/testData';
import { getTestContextSwitchingData } from '../../services/testData/contextSwitching';
import { getAIContextSwitchingCardSummary, getAllContextSwitchingInsights } from '../../services/testData/aiDemoData';
import { ContextSwitchingService } from '../../services/ContextSwitchingService';
import { useContextSwitchingStyles } from './ContextSwitchingCard.styles';
import {
  FocusScoreCircle,
  HourlyChart,
  DistributionChart,
  TrendChart,
  TimelineView
} from './components';
import { AIInsightBanner, CardSizeMenu, SmallCard } from '../shared';
import { CardSize } from '../../types/CardSize';
import { IAICardSummary, IAIInsight } from '../../models/AITypes';

interface ContextSwitchingCardProps {
  graphClient?: MSGraphClientV3;
  dataMode?: DataMode;
  settings?: ContextSwitchingSettings;
  variant?: 'standard' | 'mini';
  title?: string;
  /** AI Demo Mode - show AI-enhanced content (only when dataMode === 'test') */
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

// Get icon for current context
const getCurrentContextIcon = (type: ContextType): React.ReactElement => {
  const iconProps = { style: { fontSize: '16px' } };

  switch (type) {
    case 'email':
      return <MailRegular {...iconProps} />;
    case 'teams-chat':
      return <ChatRegular {...iconProps} />;
    case 'teams-channel':
      return <PeopleRegular {...iconProps} />;
    case 'meeting':
      return <VideoRegular {...iconProps} />;
    case 'file':
      return <DocumentRegular {...iconProps} />;
    case 'calendar':
      return <CalendarLtrRegular {...iconProps} />;
    default:
      return <TargetRegular {...iconProps} />;
  }
};

export const ContextSwitchingCard: React.FC<ContextSwitchingCardProps> = ({
  graphClient,
  dataMode = 'api',
  settings = DEFAULT_CONTEXT_SWITCHING_SETTINGS,
  variant = 'standard',
  title = 'Context Switching',
  aiDemoMode = false,
  size = 'medium',
  onSizeChange,
  onCycleSize,
  onToggleSize, // deprecated
}) => {
  // Use onCycleSize if provided, fallback to onToggleSize for backwards compatibility
  const handleCycleSize = onCycleSize || onToggleSize;
  // Use onSizeChange if provided, fallback to onCycleSize/onToggleSize for backwards compatibility
  const handleSizeChange = onSizeChange || ((newSize: CardSize) => {
    if (onCycleSize) onCycleSize();
    else if (onToggleSize) onToggleSize();
  });
  const styles = useContextSwitchingStyles();

  // State
  const [data, setData] = useState<ContextSwitchingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ContextViewMode>('overview');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // AI Demo Mode state
  const [aiCardSummary, setAiCardSummary] = useState<IAICardSummary | null>(null);
  const [aiInsights, setAiInsights] = useState<IAIInsight[]>([]);

  // Load AI demo data when enabled
  React.useEffect(() => {
    if (aiDemoMode) {
      setAiCardSummary(getAIContextSwitchingCardSummary());
      setAiInsights(getAllContextSwitchingInsights());
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  // Service ref
  const serviceRef = React.useRef<ContextSwitchingService | null>(null);

  // Initialize service when graphClient is available
  React.useEffect(() => {
    if (graphClient && dataMode === 'api') {
      serviceRef.current = new ContextSwitchingService(graphClient, 'me', settings);
    }
  }, [graphClient, dataMode, settings]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (dataMode === 'test') {
        // Simulate loading delay for test mode
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(getTestContextSwitchingData());
      } else if (serviceRef.current) {
        // API mode - use the service
        const result = await serviceRef.current.getContextSwitchingData();
        setData(result);
      } else if (graphClient) {
        // Service not initialized yet, initialize and fetch
        const service = new ContextSwitchingService(graphClient, 'me', settings);
        serviceRef.current = service;
        const result = await service.getContextSwitchingData();
        setData(result);
      } else {
        // No graphClient available, fall back to test data
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(getTestContextSwitchingData());
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load context switching data:', err);
      setError('Failed to load data');
      // Fall back to test data on error
      try {
        setData(getTestContextSwitchingData());
      } catch {
        // Ignore fallback error
      }
    } finally {
      setLoading(false);
    }
  }, [dataMode, graphClient, settings]);

  // Initial load
  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.clearCache();
    }
    void loadData();
  }, [loadData]);

  // Format current focus time
  const formatFocusTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Summary text
  const summaryText = useMemo(() => {
    if (!data) return '';
    const { todaySummary } = data;
    return `${todaySummary.totalSwitches} switches · ${formatFocusTime(todaySummary.totalFocusTime)} focus`;
  }, [data]);

  // ============================================
  // SMALL CARD VARIANT
  // Compact chip with title, count, and AI popover
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="contextSwitching"
        title={title}
        icon={<BrainCircuitRegular />}
        metricValue={data?.todaySummary?.totalSwitches ?? 0}
        metricLabel="SWITCHES"
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={loading}
        hasError={!!error}
        aiDemoMode={aiDemoMode}
        aiSummary={aiCardSummary?.summary}
        aiInsights={aiInsights?.map(i => i.title)}
      />
    );
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className={variant === 'mini' ? `${styles.card} ${styles.miniCard}` : styles.card}>
        <div className={styles.loadingContainer}>
          <Spinner size="medium" label="Analyzing focus..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className={variant === 'mini' ? `${styles.card} ${styles.miniCard}` : styles.card}>
        <div className={styles.emptyState}>
          <BrainCircuitRegular className={styles.emptyIcon} />
          <Text>{error}</Text>
          <Button appearance="primary" onClick={handleRefresh}>Try again</Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className={variant === 'mini' ? `${styles.card} ${styles.miniCard}` : styles.card}>
        <div className={styles.emptyState}>
          <BrainCircuitRegular className={styles.emptyIcon} />
          <Text>No data available</Text>
        </div>
      </div>
    );
  }

  // Mini card variant
  if (variant === 'mini') {
    return (
      <div className={`${styles.card} ${styles.miniCard}`}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <BrainCircuitRegular style={{ fontSize: '20px', color: tokens.colorBrandForeground1 }} />
            <Text weight="semibold" size={400}>{title}</Text>
          </div>
        </div>
        <div className={styles.miniContent}>
          <FocusScoreCircle
            score={data.todaySummary.focusScore}
            size="small"
            showLabel={false}
          />
          <div className={styles.miniStats}>
            <div className={styles.miniStatRow}>
              <Text className={styles.miniStatLabel}>Switches</Text>
              <Text className={styles.miniStatValue}>{data.todaySummary.totalSwitches}</Text>
            </div>
            <div className={styles.miniStatRow}>
              <Text className={styles.miniStatLabel}>Focus time</Text>
              <Text className={styles.miniStatValue}>{formatFocusTime(data.todaySummary.totalFocusTime)}</Text>
            </div>
            <div className={styles.miniStatRow}>
              <Text className={styles.miniStatLabel}>Avg session</Text>
              <Text className={styles.miniStatValue}>{data.todaySummary.avgFocusTime}m</Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard card
  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <BrainCircuitRegular style={{ fontSize: '20px', color: tokens.colorBrandForeground1 }} />
          <Text weight="semibold" size={400}>{title}</Text>
          {data.todaySummary.focusScore >= 70 && (
            <Badge appearance="tint" color="success" size="small">Good focus</Badge>
          )}
        </div>
        <div className={styles.headerActions}>
          <Tooltip content="Refresh" relationship="label">
            <Button
              appearance="subtle"
              icon={loading ? <Spinner size="tiny" /> : <ArrowSyncRegular />}
              size="small"
              onClick={handleRefresh}
              disabled={loading}
            />
          </Tooltip>
          <CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />
        </div>
      </div>

      {/* AI Insight Banner (only in AI Demo Mode) */}
      {aiDemoMode && aiCardSummary && (
        <AIInsightBanner
          summary={aiCardSummary}
          insights={aiInsights}
        />
      )}

      {/* Current context indicator */}
      <div className={styles.currentContext}>
        <div
          className={styles.currentContextIcon}
          style={{
            backgroundColor: `${getContextTypeColor(data.currentState.currentContext)}20`,
            color: getContextTypeColor(data.currentState.currentContext)
          }}
        >
          {getCurrentContextIcon(data.currentState.currentContext)}
        </div>
        <div className={styles.currentContextInfo}>
          <Text className={styles.currentContextLabel}>Current focus</Text>
          <Text className={styles.currentContextName}>{data.currentState.currentContextName}</Text>
        </div>
        <Text className={styles.currentContextTime}>
          {data.currentState.currentFocusStreak}m
        </Text>
      </div>

      {/* Focus Score */}
      {settings.showFocusScore && viewMode === 'overview' && (
        <FocusScoreCircle score={data.todaySummary.focusScore} />
      )}

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <Text className={styles.statValue}>{data.todaySummary.totalSwitches}</Text>
          <Text className={styles.statLabel}>Switches</Text>
        </div>
        <div className={styles.statItem}>
          <Text className={styles.statValue}>{formatFocusTime(data.todaySummary.totalFocusTime)}</Text>
          <Text className={styles.statLabel}>Focus time</Text>
        </div>
        <div className={styles.statItem}>
          <Text className={styles.statValue}>{data.todaySummary.avgFocusTime}m</Text>
          <Text className={styles.statLabel}>Avg session</Text>
        </div>
        <div className={styles.statItem}>
          <Text className={styles.statValue}>{data.todaySummary.longestFocus}m</Text>
          <Text className={styles.statLabel}>Longest</Text>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className={styles.tabContainer}>
        <TabList
          selectedValue={viewMode}
          onTabSelect={(_, d) => setViewMode(d.value as ContextViewMode)}
          size="small"
        >
          <Tab value="overview" icon={<ChartMultipleRegular />}>Overview</Tab>
          <Tab value="timeline" icon={<TimelineRegular />}>Timeline</Tab>
          <Tab value="distribution" icon={<DataPieRegular />}>Types</Tab>
          <Tab value="trend" icon={<ArrowTrendingRegular />}>Trend</Tab>
        </TabList>
      </div>

      <Divider className={styles.divider} />

      {/* Content based on view mode */}
      <div className={styles.content}>
        {viewMode === 'overview' && settings.showHourlyChart && (
          <HourlyChart data={data.hourlyData} />
        )}

        {viewMode === 'timeline' && (
          <TimelineView switches={data.recentSwitches} />
        )}

        {viewMode === 'distribution' && settings.showDistribution && (
          <DistributionChart
            data={data.distribution}
            totalSwitches={data.todaySummary.totalSwitches}
          />
        )}

        {viewMode === 'trend' && (
          <TrendChart data={data.trendData} />
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Text className={styles.footerText}>
          {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
        </Text>
        <Text className={styles.footerText}>
          {summaryText}
        </Text>
      </div>
    </div>
  );
};

export default ContextSwitchingCard;
