// ============================================
// WaitingOnYouCard - Medium card (Summary View)
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
  Avatar,
  Badge,
} from '@fluentui/react-components';
import {
  PersonClockRegular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  Person20Regular,
  DocumentMultiple20Regular,
  Timer20Regular,
  AlertUrgent20Regular,
  Crown20Filled,
} from '@fluentui/react-icons';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import { GroupedWaitingData, WaitingDebtTrend } from '../../models/WaitingOnYou';
import { useWaitingOnYou } from '../../hooks/useWaitingOnYou';
import { useWaitingOnYouStyles } from './WaitingOnYouCard.styles';
import { DataMode } from '../../services/testData';
import { getTestWaitingOnYouData, getTestWaitingOnYouTrend } from '../../services/testData/waitingOnYou';
import { WaitingDebtChart } from './components/WaitingDebtChart';
// Shared components
import { BaseCard, CardHeader, EmptyState, AIInsightBanner, AIOnboardingDialog } from '../shared';
import { useCardStyles } from '../cardStyles';
// AI Demo Mode imports
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import { getAIWaitingOnYouCardSummary, getAllWaitingOnYouInsights } from '../../services/testData/aiDemoData';

// Local storage key for AI onboarding state
const AI_ONBOARDING_KEY = 'dashboardCards_aiOnboardingDismissed_waitingOnYou';

export interface WaitingOnYouCardProps {
  graphClient: MSGraphClientV3 | null;
  showChart?: boolean;
  staleDays?: number;
  includeEmail?: boolean;
  includeTeamsChats?: boolean;
  includeChannels?: boolean;
  includeMentions?: boolean;
  dataMode?: DataMode;
  /** AI Demo Mode - show AI-enhanced content (only when dataMode === 'test') */
  aiDemoMode?: boolean;
  /** Callback to toggle between medium and large card size */
  onToggleSize?: () => void;
}

export const WaitingOnYouCard: React.FC<WaitingOnYouCardProps> = ({
  graphClient,
  showChart = true,
  staleDays = 2,
  includeEmail = true,
  includeTeamsChats = true,
  includeChannels = false,
  includeMentions = true,
  dataMode = 'api',
  aiDemoMode = false,
  onToggleSize,
}) => {
  const styles = useWaitingOnYouStyles();
  const cardStyles = useCardStyles();

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = useState<GroupedWaitingData | null>(null);
  const [testTrendData, setTestTrendData] = useState<WaitingDebtTrend | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // AI Demo Mode state
  const [showOnboarding, setShowOnboarding] = useState(false);
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
        setTestData(getTestWaitingOnYouData());
        setTestTrendData(getTestWaitingOnYouTrend());
        // Load AI demo data if enabled
        if (aiDemoMode) {
          setAiCardSummary(getAIWaitingOnYouCardSummary());
          setAiInsights(getAllWaitingOnYouInsights());
        }
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode, aiDemoMode]);

  // Main data hook - pass settings as initial filter (only used in API mode)
  const apiHook = useWaitingOnYou({
    graphClient: dataMode === 'api' ? graphClient : null,
    initialFilter: {
      minStaleDuration: staleDays * 24,
      includeEmail,
      includeTeamsChats,
      includeChannelMessages: includeChannels,
      includeMentions,
    }
  });

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
          setTestData(getTestWaitingOnYouData());
          setTestTrendData(getTestWaitingOnYouTrend());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Top 3 people waiting on you (sorted by longest wait)
  // Use byPerson only - it already contains all conversations grouped by person
  const topPeople = useMemo(() => {
    if (!data) return [];
    return [...data.byPerson]
      .sort((a, b) => b.totalWaitHours - a.totalWaitHours)
      .slice(0, 3);
  }, [data]);

  // Get stat value styling based on urgency
  const getStatValueClass = (hours: number): string => {
    const days = hours / 24;
    if (days >= 7) return styles.statValueDanger;
    if (days >= 3) return styles.statValueWarning;
    return styles.statValue;
  };

  // Format wait duration
  const formatWait = (hours: number): string => {
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  // Calculate average wait time
  const avgWaitHours = useMemo(() => {
    if (!data || data.totalItems === 0) return 0;
    return Math.round(data.totalWaitHours / data.totalItems);
  }, [data]);

  // Expand button for switching to large card view
  const expandButton = onToggleSize ? (
    <Tooltip content="View all details" relationship="label">
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
  if (!isLoading && !error && (!data || data.totalItems === 0)) {
    return (
      <BaseCard testId="waiting-on-you-card" empty>
        <CardHeader
          icon={<PersonClockRegular />}
          title="Waiting On You"
          actions={expandButton}
        />
        <EmptyState
          icon={<PersonClockRegular />}
          title="You're all caught up!"
          description="No one is waiting on you"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Checking who's waiting..."
      testId="waiting-on-you-card"
      className={styles.card}
    >
      <CardHeader
        icon={<PersonClockRegular />}
        title="Waiting On You"
        badge={data?.totalItems}
        badgeVariant={data && data.criticalCount > 0 ? 'danger' : data && data.totalPeopleWaiting > 0 ? 'warning' : 'brand'}
        actions={headerActions}
      />

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

      {/* Trend Chart - positioned higher (after AI banner) */}
      {showChart && trendData && data && data.totalItems > 0 && (
        <div className={styles.chartContainer}>
          <WaitingDebtChart trend={trendData} />
        </div>
      )}

      {/* Statistics Grid */}
      {data && (
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <Person20Regular className={styles.statIcon} />
              People
            </div>
            <Text className={styles.statValue}>{data.totalPeopleWaiting}</Text>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <DocumentMultiple20Regular className={styles.statIcon} />
              Items
            </div>
            <Text className={styles.statValue}>{data.totalItems}</Text>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <Timer20Regular className={styles.statIcon} />
              Avg Wait
            </div>
            <Text className={getStatValueClass(avgWaitHours)}>
              {formatWait(avgWaitHours)}
            </Text>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>
              <AlertUrgent20Regular className={styles.statIcon} />
              Critical
            </div>
            <Text className={data.criticalCount > 0 ? styles.statValueDanger : styles.statValue}>
              {data.criticalCount}
            </Text>
          </div>
        </div>
      )}

      {/* Top People Waiting On You */}
      {topPeople.length > 0 && (
        <div className={styles.topPeopleSection}>
          <Text className={styles.sectionLabel}>Longest Waiting</Text>
          <div className={styles.topPeopleList}>
            {topPeople.map((group) => (
              <div key={group.person.id || group.person.email} className={styles.personRow}>
                {group.person.relationship === 'manager' && (
                  <Crown20Filled className={styles.vipIcon} />
                )}
                <Avatar
                  name={group.person.displayName}
                  image={group.person.photoUrl ? { src: group.person.photoUrl } : undefined}
                  size={24}
                />
                <span className={styles.personInfo}>
                  <span className={styles.personName}>{group.person.displayName}</span>
                </span>
                <Badge
                  appearance="tint"
                  color={group.totalWaitHours >= 168 ? 'danger' : group.totalWaitHours >= 72 ? 'warning' : 'informative'}
                  size="small"
                >
                  {formatWait(group.totalWaitHours)} · {group.itemCount} item{group.itemCount > 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expand Prompt */}
      {onToggleSize && (
        <div className={styles.expandPrompt} onClick={onToggleSize}>
          <ArrowExpand20Regular />
          <span>View all {data?.totalItems} items waiting on you</span>
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

export default WaitingOnYouCard;
