// ============================================
// EmailCard - Consolidated Email Card with size variants
// Small: Compact chip with AI popover
// Medium: Shows emails in tabs with sort, filter, and VIP icons
// Large: Full master-detail layout
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
  mergeClasses,
  TabList,
  Tab,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuGroup,
  MenuGroupHeader,
  MenuItemRadio,
  MenuItemCheckbox,
  MenuItem,
  MenuDivider,
} from '@fluentui/react-components';
import {
  Mail24Regular,
  Mail20Regular,
  Flag24Regular,
  Flag20Regular,
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  ArrowSort20Regular,
  Filter20Regular,
  Dismiss20Regular,
  AttachRegular,
  AlertUrgent20Regular,
  Clock20Regular,
  Checkmark20Regular,
  Crown20Filled,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useEmailCard,
  IEmailCardSettings,
  IEmailFilters,
  EmailTabType,
  EmailSortMode,
  DEFAULT_EMAIL_CARD_SETTINGS,
} from '../../hooks/useEmailCard';
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, TrendBarChart, StatsGrid, TopItemsList, SmallCard } from '../shared';
import { StatItem, TopItem, TrendDataPoint } from '../shared/charts';
import { useCardStyles } from '../cardStyles';
import { DataMode } from '../../services/testData';
// AI Demo Mode components
import { AIInsightBanner, AIOnboardingDialog } from '../shared/AIComponents';
import { CardSize } from '../../types/CardSize';

// Local storage key for onboarding state
const AI_ONBOARDING_KEY = 'dashboardCards_aiOnboardingDismissed';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  card: {
    height: 'auto',
    minHeight: '280px',
    maxHeight: '600px',
  },
  tabSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${tokens.spacingHorizontalL}`,
    marginBottom: tokens.spacingVerticalS,
    gap: tokens.spacingHorizontalS,
  },
  tabListWrapper: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
    // Fade effect on right edge to indicate more content
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: '24px',
      background: `linear-gradient(to right, transparent, ${tokens.colorNeutralBackground1})`,
      pointerEvents: 'none',
      opacity: 0,
      transition: 'opacity 0.2s',
    },
  },
  tabListWrapperOverflow: {
    '&::after': {
      opacity: 1,
    },
  },
  tabListScroller: {
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollBehavior: 'smooth',
    // Hide scrollbar but keep functionality
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  tabToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
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
  filterActive: {
    color: tokens.colorBrandForeground1,
  },
  vipIcon: {
    color: tokens.colorPaletteYellowForeground1,
    fontSize: '14px',
  },
});

// ============================================
// Props Interface
// ============================================
interface EmailCardProps {
  context: WebPartContext;
  settings?: IEmailCardSettings;
  dataMode?: DataMode;
  /** AI Demo Mode - show AI insights when true */
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

const formatAge = (hours: number): string => {
  if (hours < 1) return '<1h';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const formatDays = (days: number): string => {
  if (days < 1) return '<1d';
  return `${days}d`;
};

// Sort labels for tooltip
const sortLabels: Record<EmailSortMode, string> = {
  priority: 'Priority (VIP first)',
  sender: 'Sender A-Z',
  oldest: 'Oldest first',
  newest: 'Newest first',
};

// ============================================
// Component
// ============================================
export const EmailCard: React.FC<EmailCardProps> = ({
  context,
  settings = DEFAULT_EMAIL_CARD_SETTINGS,
  dataMode = 'test',
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

  // Ref for scrolling tabs into view
  const tabScrollerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // AI Onboarding dialog state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Handle onboarding close
  const handleOnboardingClose = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Handle "Don't show again"
  const handleDontShowAgain = useCallback((checked: boolean) => {
    if (checked) {
      localStorage.setItem(AI_ONBOARDING_KEY, 'true');
    }
  }, []);

  // Use the consolidated email hook
  const {
    data,
    activeTab,
    setActiveTab,
    sortMode,
    setSortMode,
    filters,
    setFilters,
    displayEmails,
    isLoading,
    error,
    lastRefreshed,
    refresh,
    // AI Demo Mode data
    aiCardSummary,
    aiInsights,
  } = useEmailCard(context, settings, dataMode, aiDemoMode);

  // ============================================
  // SMALL CARD VARIANT
  // Compact chip with title, count, and AI popover
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="email"
        title="Email"
        icon={<Mail24Regular />}
        metricValue={data?.stats.unreadCount ?? 0}
        smartLabelKey="unread"
        chartData={data?.trendData?.dataPoints.map(p => ({ date: p.date, value: p.unreadValue }))}
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

  // Check for overflow and scroll selected tab into view
  useEffect(() => {
    const scroller = tabScrollerRef.current;
    if (!scroller) return;

    // Check if there's overflow
    const checkOverflow = (): void => {
      setHasOverflow(scroller.scrollWidth > scroller.clientWidth);
    };
    checkOverflow();

    // Scroll selected tab into view
    const selectedTab = scroller.querySelector('[aria-selected="true"]') as HTMLElement;
    if (selectedTab) {
      const scrollLeft = selectedTab.offsetLeft - (scroller.clientWidth / 2) + (selectedTab.offsetWidth / 2);
      scroller.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }

    // Re-check on resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [activeTab]);

  // Menu state for sort/filter
  const [checkedSortValues, setCheckedSortValues] = useState<Record<string, string[]>>({
    sort: [sortMode],
  });
  const [checkedFilterValues, setCheckedFilterValues] = useState<Record<string, string[]>>({
    filter: [],
  });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  // Handle sort change
  const handleSortChange = useCallback((newSort: EmailSortMode) => {
    setSortMode(newSort);
    setCheckedSortValues({ sort: [newSort] });
  }, [setSortMode]);

  // Handle filter change
  const handleFilterChange = useCallback((filterKeys: string[]) => {
    const newFilters: IEmailFilters = {
      vip: filterKeys.includes('vip'),
      flagged: filterKeys.includes('flagged'),
      unread: filterKeys.includes('unread'),
      hasAttachments: filterKeys.includes('hasAttachments'),
      highPriority: filterKeys.includes('highPriority'),
    };
    setFilters(newFilters);
    setCheckedFilterValues({ filter: filterKeys });
  }, [setFilters]);

  // Stats grid data - changes based on active tab
  const statsData = useMemo((): [StatItem, StatItem, StatItem, StatItem] => {
    if (!data) {
      return [
        { label: 'Total', value: 0, icon: <Mail20Regular /> },
        { label: '-', value: 0, icon: <Mail20Regular /> },
        { label: '-', value: 0, icon: <Mail20Regular /> },
        { label: '-', value: 0, icon: <Mail20Regular /> },
      ];
    }

    switch (activeTab) {
      case 'unread':
        return [
          { label: 'Total', value: data.stats.unreadCount, icon: <Mail20Regular /> },
          { label: 'High Priority', value: data.stats.highPriorityCount, icon: <AlertUrgent20Regular />, color: data.stats.highPriorityCount > 0 ? 'danger' : undefined },
          { label: 'Attachments', value: data.stats.withAttachmentsCount, icon: <AttachRegular /> },
          { label: 'Oldest', value: formatAge(data.stats.oldestUnreadHours), icon: <Clock20Regular /> },
        ];
      case 'flagged':
        return [
          { label: 'Active', value: data.stats.activeFlagsCount, icon: <Flag20Regular /> },
          { label: 'Completed', value: data.stats.completedThisWeekCount, icon: <Checkmark20Regular />, color: 'success' },
          { label: 'Avg Age', value: formatDays(data.stats.averageFlagAgeDays), icon: <Clock20Regular /> },
          { label: 'Oldest', value: formatDays(data.stats.oldestFlagDays), icon: <Clock20Regular />, color: data.stats.oldestFlagDays > 7 ? 'warning' : undefined },
        ];
      case 'vip':
        return [
          { label: 'Unread', value: data.stats.vipUnreadCount, icon: <Mail20Regular />, color: data.stats.vipUnreadCount > 0 ? 'brand' : undefined },
          { label: 'Total', value: data.stats.vipTotalCount, icon: <Crown20Filled style={{ color: tokens.colorPaletteYellowForeground1 }} /> },
          { label: 'Contacts', value: data.stats.vipContactsCount, icon: <Crown20Filled style={{ color: tokens.colorPaletteYellowForeground1 }} /> },
          { label: 'Urgent', value: data.stats.vipUrgentCount, icon: <AlertUrgent20Regular />, color: data.stats.vipUrgentCount > 0 ? 'danger' : undefined },
        ];
      case 'urgent':
        return [
          { label: 'Total', value: data.stats.urgentCount, icon: <AlertUrgent20Regular />, color: 'danger' },
          { label: 'Unread', value: data.stats.urgentUnreadCount, icon: <Mail20Regular />, color: data.stats.urgentUnreadCount > 0 ? 'brand' : undefined },
          { label: 'From VIPs', value: data.stats.urgentVipCount, icon: <Crown20Filled style={{ color: tokens.colorPaletteYellowForeground1 }} /> },
          { label: 'Oldest', value: formatAge(data.stats.oldestUrgentHours), icon: <Clock20Regular />, color: data.stats.oldestUrgentHours > 48 ? 'warning' : undefined },
        ];
      default:
        return [
          { label: 'Total', value: 0, icon: <Mail20Regular /> },
          { label: '-', value: 0, icon: <Mail20Regular /> },
          { label: '-', value: 0, icon: <Mail20Regular /> },
          { label: '-', value: 0, icon: <Mail20Regular /> },
        ];
    }
  }, [data, activeTab]);

  // Chart data based on active tab
  const chartData = useMemo((): TrendDataPoint[] => {
    if (!data?.trendData) return [];
    return data.trendData.dataPoints.map(p => ({
      date: p.date,
      value: activeTab === 'unread' ? p.unreadValue :
             activeTab === 'flagged' ? p.flaggedValue :
             activeTab === 'vip' ? p.vipValue :
             p.urgentValue,
    }));
  }, [data, activeTab]);

  // Chart trend based on active tab
  const chartTrend = useMemo(() => {
    if (!data?.trendData) return 'stable' as const;
    switch (activeTab) {
      case 'unread':
        return data.trendData.unreadTrend === 'improving' ? 'improving' :
               data.trendData.unreadTrend === 'worsening' ? 'worsening' : 'stable';
      case 'flagged':
        return data.trendData.flaggedTrend;
      case 'vip':
        return data.trendData.vipTrend;
      case 'urgent':
        return data.trendData.urgentTrend;
      default:
        return 'stable' as const;
    }
  }, [data, activeTab]);

  // Chart footer text
  const chartFooter = useMemo(() => {
    if (!data?.trendData) return '';
    switch (activeTab) {
      case 'unread':
        return `Avg: ${data.trendData.unreadAverage.toFixed(1)} emails/day`;
      case 'flagged':
        return `Avg: ${data.trendData.flaggedAverage.toFixed(1)} completed/day`;
      case 'vip':
        return `Avg: ${data.trendData.vipAverage.toFixed(1)} VIP emails/day`;
      case 'urgent':
        return `Avg: ${data.trendData.urgentAverage.toFixed(1)} urgent/day`;
      default:
        return '';
    }
  }, [data, activeTab]);

  // Chart title
  const chartTitle = useMemo(() => {
    switch (activeTab) {
      case 'unread': return 'Email Volume (7 days)';
      case 'flagged': return 'Completions (7 days)';
      case 'vip': return 'VIP Emails (7 days)';
      case 'urgent': return 'Urgent Emails (7 days)';
      default: return '';
    }
  }, [activeTab]);

  // Top items
  const topItems = useMemo((): TopItem[] => {
    if (!displayEmails.length) return [];

    return displayEmails.slice(0, 3).map((email): TopItem => {
      const now = new Date();
      const diffMs = now.getTime() - email.receivedDateTime.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      return {
        id: email.id,
        title: email.subject,
        subtitle: `${email.from.name} - ${formatAge(diffHours)} ago`,
        icon: email.isVip ? (
          <Crown20Filled style={{ color: tokens.colorPaletteYellowForeground1 }} />
        ) : email.isFlagged ? (
          <Flag20Regular />
        ) : (
          <Mail20Regular />
        ),
        badge: email.importance === 'high' ? 'Urgent' :
               email.isVip ? 'VIP' :
               email.isFlagged ? 'Flagged' :
               email.hasAttachments ? 'Attachment' : undefined,
        badgeColor: email.importance === 'high' ? 'danger' :
                    email.isVip ? 'warning' :
                    email.isFlagged ? 'brand' : 'informative',
        onClick: () => window.open(email.webLink, '_blank', 'noopener,noreferrer'),
      };
    });
  }, [displayEmails]);

  // Get total count for current tab
  const totalCount = useMemo(() => {
    if (!data) return 0;
    switch (activeTab) {
      case 'unread': return data.stats.unreadCount;
      case 'flagged': return data.stats.activeFlagsCount;
      case 'vip': return data.stats.vipTotalCount;
      case 'urgent': return data.stats.urgentCount;
      default: return 0;
    }
  }, [data, activeTab]);

  // Tab icon for header
  const headerIcon = useMemo(() => {
    switch (activeTab) {
      case 'flagged': return <Flag24Regular />;
      case 'vip': return <Crown20Filled style={{ color: tokens.colorPaletteYellowForeground1, fontSize: '24px' }} />;
      case 'urgent': return <AlertUrgent20Regular style={{ fontSize: '24px', color: tokens.colorPaletteRedForeground1 }} />;
      default: return <Mail24Regular />;
    }
  }, [activeTab]);

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
  if (!isLoading && !error && !data) {
    return (
      <BaseCard testId="email-card" empty>
        <CardHeader
          icon={<Mail24Regular />}
          title="Email"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<Mail24Regular />}
          title="No emails"
          description="No emails to display"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading emails..."
      testId="email-card"
      className={styles.card}
    >
      <CardHeader
        icon={headerIcon}
        title="Email"
        badge={totalCount}
        badgeVariant={data?.stats.highPriorityCount && data.stats.highPriorityCount > 0 ? 'danger' : undefined}
        actions={headerActions}
      />

      {/* Tab Section with Sort/Filter */}
      <div className={styles.tabSection}>
        <div className={mergeClasses(styles.tabListWrapper, hasOverflow && styles.tabListWrapperOverflow)}>
          <div ref={tabScrollerRef} className={styles.tabListScroller}>
            <TabList
              selectedValue={activeTab}
              onTabSelect={(_, d) => setActiveTab(d.value as EmailTabType)}
              size="small"
            >
              <Tab value="unread">
                Unread ({data?.stats.unreadCount ?? 0})
              </Tab>
              <Tab value="flagged">
                Flagged ({data?.stats.activeFlagsCount ?? 0})
              </Tab>
              <Tab value="vip" icon={<Crown20Filled className={styles.vipIcon} />}>
                VIPs ({data?.stats.vipTotalCount ?? 0})
              </Tab>
              <Tab value="urgent" icon={<AlertUrgent20Regular style={{ color: tokens.colorPaletteRedForeground1 }} />}>
                Urgent ({data?.stats.urgentCount ?? 0})
              </Tab>
            </TabList>
          </div>
        </div>

        <div className={styles.tabToolbar}>
          {/* Sort Menu */}
          <Menu
            checkedValues={checkedSortValues}
            onCheckedValueChange={(_, menuData) => {
              if (menuData.checkedItems.length > 0) {
                handleSortChange(menuData.checkedItems[0] as EmailSortMode);
              }
            }}
          >
            <MenuTrigger disableButtonEnhancement>
              <Tooltip content={`Sort: ${sortLabels[sortMode]}`} relationship="label">
                <Button appearance="subtle" size="small" icon={<ArrowSort20Regular />} />
              </Tooltip>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuGroup>
                  <MenuGroupHeader>Sort by</MenuGroupHeader>
                  <MenuItemRadio name="sort" value="priority">Priority (VIP first)</MenuItemRadio>
                  <MenuItemRadio name="sort" value="sender">Sender A-Z</MenuItemRadio>
                  <MenuItemRadio name="sort" value="oldest">Oldest first</MenuItemRadio>
                  <MenuItemRadio name="sort" value="newest">Newest first</MenuItemRadio>
                </MenuGroup>
              </MenuList>
            </MenuPopover>
          </Menu>

          {/* Filter Menu */}
          <Menu
            checkedValues={checkedFilterValues}
            onCheckedValueChange={(_, menuData) => {
              handleFilterChange(menuData.checkedItems);
            }}
          >
            <MenuTrigger disableButtonEnhancement>
              <Tooltip content={activeFilterCount > 0 ? `${activeFilterCount} filter(s) active` : 'Filter'} relationship="label">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Filter20Regular />}
                  className={activeFilterCount > 0 ? styles.filterActive : undefined}
                />
              </Tooltip>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuGroup>
                  <MenuGroupHeader>Filter by</MenuGroupHeader>
                  <MenuItemCheckbox name="filter" value="vip">VIP contacts</MenuItemCheckbox>
                  <MenuItemCheckbox name="filter" value="flagged">Flagged</MenuItemCheckbox>
                  <MenuItemCheckbox name="filter" value="unread">Unread</MenuItemCheckbox>
                  <MenuItemCheckbox name="filter" value="hasAttachments">Has attachments</MenuItemCheckbox>
                  <MenuItemCheckbox name="filter" value="highPriority">High priority</MenuItemCheckbox>
                </MenuGroup>
                {activeFilterCount > 0 && (
                  <>
                    <MenuDivider />
                    <MenuItem icon={<Dismiss20Regular />} onClick={() => handleFilterChange([])}>
                      Clear all filters
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </div>

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
      {chartData.length > 0 && (
        <div className={styles.chartContainer}>
          <TrendBarChart
            data={chartData}
            title={chartTitle}
            trend={chartTrend}
            trendLabels={{
              improving: activeTab === 'unread' ? 'Fewer' : 'Better',
              worsening: activeTab === 'unread' ? 'More' : 'Worse',
              stable: 'Steady',
            }}
            color={activeTab === 'vip' ? 'warning' : 'brand'}
            footerText={chartFooter}
          />
        </div>
      )}

      {/* Statistics Grid */}
      {data && <StatsGrid stats={statsData} />}

      {/* Top Items - Limited to 1 item to fit in medium card */}
      {topItems.length > 0 && (
        <TopItemsList
          header={activeTab === 'unread' ? 'Priority Email' :
                  activeTab === 'flagged' ? 'Oldest Flag' :
                  activeTab === 'vip' ? 'VIP Email' : 'Urgent Email'}
          items={topItems}
          maxItems={1}
        />
      )}

      {/* Expand Prompt */}
      {handleCycleSize && totalCount > 0 && (
        <div className={styles.expandPrompt} onClick={handleCycleSize}>
          <ArrowExpand20Regular />
          <span>View all {totalCount} {activeTab === 'vip' ? 'VIP ' : activeTab === 'urgent' ? 'urgent ' : ''}emails</span>
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

export default EmailCard;
