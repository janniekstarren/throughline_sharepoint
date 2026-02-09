// ============================================
// MyTeamCard - Medium Card (Summary View)
// Shows team presence with donut chart, stats, and top items
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
  People24Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  People20Regular,
  PresenceAvailable20Regular,
  PresenceAway20Regular,
  PresenceOffline20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useMyTeam,
  IMyTeamSettings,
  DEFAULT_MY_TEAM_SETTINGS,
} from '../../hooks/useMyTeam';
import { MyTeamData, TeamPresenceData } from '../../models/MyTeam';
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, DonutChart, StatsGrid, TopItemsList, SmallCard } from '../shared';
import { StatItem, TopItem, DonutSegment } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTestMyTeamData, getTestTeamPresenceData } from '../../services/testData/myTeam';
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
interface MyTeamCardProps {
  context: WebPartContext;
  settings?: IMyTeamSettings;
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
// Presence Colors
// ============================================
const PRESENCE_COLORS = {
  available: tokens.colorPaletteGreenForeground1,
  busy: tokens.colorPaletteRedForeground1,
  away: tokens.colorPaletteYellowForeground1,
  offline: tokens.colorNeutralForeground4,
};

// ============================================
// Component
// ============================================
export const MyTeamCard: React.FC<MyTeamCardProps> = ({
  context,
  settings = DEFAULT_MY_TEAM_SETTINGS,
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
  const [testData, setTestData] = useState<MyTeamData | null>(null);
  const [testPresenceData, setTestPresenceData] = useState<TeamPresenceData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestMyTeamData());
        setTestPresenceData(getTestTeamPresenceData());
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
      setAiCardSummary(getGenericAICardSummary('myTeam'));
      setAiInsights(getGenericAIInsights('myTeam'));
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // API hook (only used when dataMode === 'api')
  const apiHook = useMyTeam(context, settings);

  // Select between API and test data based on mode
  const data = dataMode === 'test' ? testData : apiHook.data;
  const presenceData = dataMode === 'test' ? testPresenceData : (data ? {
    available: data.availableCount,
    busy: data.busyCount,
    away: data.awayCount,
    offline: data.offlineCount,
  } : null);
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const lastRefreshed = dataMode === 'test' ? new Date() : apiHook.lastRefreshed;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestMyTeamData());
          setTestPresenceData(getTestTeamPresenceData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Donut chart data for presence distribution
  const chartData = useMemo((): DonutSegment[] => {
    if (!presenceData) return [];
    return [
      { label: 'Available', value: presenceData.available, color: PRESENCE_COLORS.available },
      { label: 'Busy', value: presenceData.busy, color: PRESENCE_COLORS.busy },
      { label: 'Away', value: presenceData.away, color: PRESENCE_COLORS.away },
      { label: 'Offline', value: presenceData.offline, color: PRESENCE_COLORS.offline },
    ].filter(segment => segment.value > 0);
  }, [presenceData]);

  // Stats grid data
  const statsData = useMemo((): [StatItem, StatItem, StatItem, StatItem] => {
    return [
      {
        label: 'Total',
        value: data?.totalCount || 0,
        icon: <People20Regular />,
      },
      {
        label: 'Available',
        value: data?.availableCount || 0,
        icon: <PresenceAvailable20Regular />,
      },
      {
        label: 'Busy',
        value: data?.busyCount || 0,
        icon: <PresenceOffline20Regular />,
      },
      {
        label: 'Away',
        value: data?.awayCount || 0,
        icon: <PresenceAway20Regular />,
      },
    ];
  }, [data]);

  // Top items (3 available team members)
  const topItems = useMemo((): TopItem[] => {
    if (!data) return [];

    const availableMembers = data.members
      .filter(m => m.presence === 'Available')
      .slice(0, 3);

    return availableMembers.map((member): TopItem => ({
      id: member.id,
      title: member.displayName,
      subtitle: member.jobTitle || member.email,
      icon: <PresenceAvailable20Regular style={{ color: PRESENCE_COLORS.available }} />,
      badge: 'Available',
      badgeColor: 'success',
      onClick: () => window.open(`https://teams.microsoft.com/l/chat/0/0?users=${member.email}`, '_blank', 'noopener,noreferrer'),
    }));
  }, [data]);

  // SMALL CARD VARIANT
  if (size === 'small') {
    return (
      <SmallCard
        cardId="myTeam"
        title="My Team"
        icon={<People24Regular />}
        metricValue={data?.members?.length ?? 0}
        smartLabelKey="person"
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
      <BaseCard testId="my-team-card" empty>
        <CardHeader
          icon={<People24Regular />}
          title="My Team"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<People24Regular />}
          title="No team members"
          description="Connect with colleagues to see them here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading team..."
      testId="my-team-card"
      className={styles.card}
    >
      <CardHeader
        icon={<People24Regular />}
        title="My Team"
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

        {/* Presence Donut Chart */}
        {presenceData && data && data.totalCount > 0 && (
          <div className={styles.chartContainer}>
            <DonutChart
              data={chartData}
              title="Team Presence"
              size={120}
              thickness={20}
              centerValue={data.availableCount}
              centerText="Available"
              showLegend={true}
              colors={[
                PRESENCE_COLORS.available,
                PRESENCE_COLORS.busy,
                PRESENCE_COLORS.away,
                PRESENCE_COLORS.offline,
              ]}
            />
          </div>
        )}

        {/* Statistics Grid */}
        {data && (
          <StatsGrid stats={statsData} />
        )}

        {/* Top Available Members - Limited to 1 item to fit in medium card */}
        {topItems.length > 0 && (
          <TopItemsList
            header="Available Now"
            items={topItems}
            maxItems={1}
          />
        )}

        {/* Expand Prompt */}
        {handleCycleSize && (
          <div className={styles.expandPrompt} onClick={handleCycleSize}>
            <ArrowExpand20Regular />
            <span>View all {data?.totalCount} team members</span>
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

export default MyTeamCard;
