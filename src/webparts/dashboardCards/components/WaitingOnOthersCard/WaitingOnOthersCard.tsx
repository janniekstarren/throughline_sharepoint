// ============================================
// WaitingOnOthersCard - Medium card (Summary View)
// Shows statistics and trend chart only
// User can expand to large card for full content
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
  Avatar,
  Badge,
} from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  ClockRegular,
  ArrowExpand20Regular,
  Person20Regular,
  DocumentMultiple20Regular,
  Timer20Regular,
  AlertUrgent20Regular,
  Crown20Filled,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { useWaitingOnOthers, IWaitingOnOthersSettings, DEFAULT_WAITING_ON_OTHERS_SETTINGS } from '../../hooks/useWaitingOnOthers';
import { WaitingTrendChart } from './components/WaitingTrendChart';
import { GroupedPendingData, PendingTrendData } from '../../models/WaitingOnOthers';
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, AIInsightBanner, AIOnboardingDialog, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestWaitingOnOthersData, getTestWaitingOnOthersTrend } from '../../services/testData/waitingOnOthers';
// AI Demo Mode imports
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import {
  getAIEnhancedWaitingOnOthers,
  getAIWaitingOnOthersCardSummary,
  getAllWaitingOnOthersInsights,
  IAIEnhancedPersonGroup,
} from '../../services/testData/aiDemoData';
// Card size type
import { CardSize } from '../../types/CardSize';

// Local storage key for AI onboarding state
const AI_ONBOARDING_KEY = 'dashboardCards_aiOnboardingDismissed';

// Styles for the summary card
const useSummaryStyles = makeStyles({
  // Dynamic height based on content
  card: {
    height: 'auto',
    minHeight: '280px',
    maxHeight: '600px',
  },
  // Stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: 'center',
  },
  statLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statIcon: {
    fontSize: '14px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueWarning: {
    color: tokens.colorPaletteYellowForeground1,
  },
  statValueDanger: {
    color: tokens.colorPaletteRedForeground1,
  },
  // Top people section
  topPeopleSection: {
    padding: `0 ${tokens.spacingHorizontalL}`,
    paddingBottom: tokens.spacingVerticalL,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: tokens.spacingVerticalS,
  },
  topPeopleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  personRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  personInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  personName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
  },
  vipIcon: {
    color: tokens.colorPaletteYellowForeground1,
    fontSize: '14px',
    flexShrink: 0,
  },
  personWait: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  personWaitWarning: {
    color: tokens.colorPaletteYellowForeground1,
  },
  personWaitDanger: {
    color: tokens.colorPaletteRedForeground1,
  },
  // Chart container
  chartContainer: {
    padding: `0 ${tokens.spacingHorizontalL}`,
    marginBottom: tokens.spacingVerticalS,
  },
  // Expand prompt
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

interface WaitingOnOthersCardProps {
  context: WebPartContext;
  settings?: IWaitingOnOthersSettings;
  dataMode?: DataMode;
  /** Enable AI Demo Mode (only works with test data) */
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

export const WaitingOnOthersCard: React.FC<WaitingOnOthersCardProps> = ({
  context,
  settings = DEFAULT_WAITING_ON_OTHERS_SETTINGS,
  dataMode = 'api',
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
  const styles = useCardStyles();
  const summaryStyles = useSummaryStyles();

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = useState<GroupedPendingData | null>(null);
  const [testTrendData, setTestTrendData] = useState<PendingTrendData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // AI Demo Mode state
  const [showOnboarding, setShowOnboarding] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_aiEnhancedGroups, setAiEnhancedGroups] = useState<IAIEnhancedPersonGroup[]>([]);
  const [aiCardSummary, setAiCardSummary] = useState<IAICardSummary | undefined>(undefined);
  const [aiInsights, setAiInsights] = useState<IAIInsight[]>([]);

  // Handle AI onboarding close
  const handleOnboardingClose = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Handle "Don't show again"
  const handleDontShowAgain = useCallback((checked: boolean) => {
    if (checked) {
      localStorage.setItem(AI_ONBOARDING_KEY, 'true');
    }
  }, []);

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestWaitingOnOthersData());
        setTestTrendData(getTestWaitingOnOthersTrend());
        // Load AI demo data if enabled
        if (aiDemoMode) {
          setAiEnhancedGroups(getAIEnhancedWaitingOnOthers());
          setAiCardSummary(getAIWaitingOnOthersCardSummary());
          setAiInsights(getAllWaitingOnOthersInsights());
        }
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode, aiDemoMode]);

  // API hook (only used when dataMode === 'api')
  const apiHook = useWaitingOnOthers(context, settings);

  // Select between API and test data based on mode
  const data = dataMode === 'test' ? testData : apiHook.data;
  const trendData = dataMode === 'test' ? testTrendData : apiHook.trendData;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const lastRefreshed = dataMode === 'test' ? new Date() : apiHook.lastRefreshed;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestWaitingOnOthersData());
          setTestTrendData(getTestWaitingOnOthersTrend());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // ============================================
  // SMALL CARD VARIANT
  // Compact chip with title, count, and AI popover
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="waitingOnOthers"
        title="Waiting On Others"
        icon={<ClockRegular />}
        metricValue={data?.totalItems ?? 0}
        smartLabelKey="pending"
        chartData={trendData?.dataPoints?.map(p => ({ date: new Date(p.date), value: p.itemCount }))}
        chartColor="warning"
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

  // Top 3 people with longest waits
  const topPeople = useMemo(() => {
    if (!data) return [];
    return data.byPerson
      .sort((a, b) => b.longestWaitHours - a.longestWaitHours)
      .slice(0, 3);
  }, [data]);

  const getStatValueClass = (hours: number): string => {
    const days = hours / 24;
    if (days >= 7) return summaryStyles.statValueDanger;
    if (days >= 3) return summaryStyles.statValueWarning;
    return summaryStyles.statValue;
  };

  // Format wait duration
  const formatWait = (hours: number): string => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

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
  if (!isLoading && !error && (!data || data.totalItems === 0)) {
    return (
      <BaseCard testId="waiting-on-others-card" empty>
        <CardHeader
          icon={<ClockRegular />}
          title="Waiting On Others"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<ClockRegular />}
          title="No pending responses"
          description="Everyone has responded to you. Nice!"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Checking who owes you..."
      testId="waiting-on-others-card"
      className={summaryStyles.card}
    >
      <CardHeader
        icon={<ClockRegular />}
        title="Waiting On Others"
        badge={data?.totalItems}
        badgeVariant={data && data.oldestWaitDays >= 7 ? 'warning' : 'brand'}
        actions={headerActions}
      />

      <div className={styles.cardContent}>
        {/* AI Insight Banner (AI Demo Mode only) */}
        {aiDemoMode && aiCardSummary && aiInsights && aiInsights.length > 0 && (
          <div style={{ padding: `0 ${tokens.spacingHorizontalL}`, marginBottom: tokens.spacingVerticalS }}>
            <AIInsightBanner
              summary={aiCardSummary}
              insights={aiInsights}
              defaultExpanded={false}
              onLearnMore={() => setShowOnboarding(true)}
            />
          </div>
        )}

        {/* AI Onboarding Dialog */}
        <AIOnboardingDialog
          open={showOnboarding}
          onClose={handleOnboardingClose}
          onDontShowAgain={handleDontShowAgain}
        />

        {/* Trend Chart */}
        {settings.showChart && trendData && data && data.totalItems > 0 && (
          <div className={summaryStyles.chartContainer}>
            <WaitingTrendChart data={trendData} />
          </div>
        )}

        {/* Statistics Grid */}
        {data && (
          <div className={summaryStyles.statsGrid}>
            <div className={summaryStyles.statItem}>
              <div className={summaryStyles.statLabel}>
                <Person20Regular className={summaryStyles.statIcon} />
                People
              </div>
              <Text className={summaryStyles.statValue}>{data.totalPeopleOwing}</Text>
            </div>
            <div className={summaryStyles.statItem}>
              <div className={summaryStyles.statLabel}>
                <DocumentMultiple20Regular className={summaryStyles.statIcon} />
                Items
              </div>
              <Text className={summaryStyles.statValue}>{data.totalItems}</Text>
            </div>
            <div className={summaryStyles.statItem}>
              <div className={summaryStyles.statLabel}>
                <Timer20Regular className={summaryStyles.statIcon} />
                Longest Wait
              </div>
              <Text className={getStatValueClass(data.oldestWaitDays * 24)}>
                {data.oldestWaitDays}d
              </Text>
            </div>
            <div className={summaryStyles.statItem}>
              <div className={summaryStyles.statLabel}>
                <AlertUrgent20Regular className={summaryStyles.statIcon} />
                Overdue
              </div>
              <Text className={summaryStyles.statValue}>
                {data.byPerson.filter(p => p.longestWaitHours >= 168).length}
              </Text>
            </div>
          </div>
        )}

        {/* Top People Waiting */}
        {topPeople.length > 0 && (
          <div className={summaryStyles.topPeopleSection}>
            <Text className={summaryStyles.sectionLabel}>Longest Waiting</Text>
            <div className={summaryStyles.topPeopleList}>
              {topPeople.map((group) => (
                <div key={group.person.id || group.person.email} className={summaryStyles.personRow}>
                  {group.person.isVip && (
                    <Crown20Filled className={summaryStyles.vipIcon} />
                  )}
                  <Avatar
                    name={group.person.displayName}
                    image={group.person.photoUrl ? { src: group.person.photoUrl } : undefined}
                    size={24}
                  />
                  <span className={summaryStyles.personInfo}>
                    <span className={summaryStyles.personName}>{group.person.displayName}</span>
                  </span>
                  <Badge
                    appearance="tint"
                    color={group.longestWaitHours >= 168 ? 'danger' : group.longestWaitHours >= 72 ? 'warning' : 'informative'}
                    size="small"
                  >
                    {formatWait(group.longestWaitHours)} · {group.itemCount} item{group.itemCount > 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand Prompt */}
        {handleCycleSize && (
          <div className={summaryStyles.expandPrompt} onClick={handleCycleSize}>
            <ArrowExpand20Regular />
            <span>View all {data?.totalItems} pending responses</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
        </Text>
      </div>
    </BaseCard>
  );
};

export default WaitingOnOthersCard;
