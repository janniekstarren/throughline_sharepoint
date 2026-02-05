// src/webparts/dashboardCards/components/WaitingOnYouCard/WaitingOnYouCard.tsx

import * as React from 'react';
import { useState } from 'react';
import {
  Text,
  Badge,
  Button,
  Spinner,
  TabList,
  Tab,
  Tooltip,
  Switch,
  tokens
} from '@fluentui/react-components';
import {
  PersonClockRegular,
  ArrowSyncRegular,
  SettingsRegular,
  PeopleRegular,
  PeopleTeamRegular,
  ListRegular,
  ErrorCircleRegular,
  ArrowMaximizeRegular,
} from '@fluentui/react-icons';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import { ViewMode, GroupedWaitingData, WaitingDebtTrend, WaitingFilter } from '../../models/WaitingOnYou';
import { useWaitingOnYou } from '../../hooks/useWaitingOnYou';
import { useSnooze } from '../../hooks/useSnooze';
import { useWaitingOnYouStyles } from './WaitingOnYouCard.styles';
import { DataMode } from '../../services/testData';
import { getTestWaitingOnYouData, getTestWaitingOnYouTrend } from '../../services/testData/waitingOnYou';

import { PeopleView } from './views/PeopleView';
import { TeamsView } from './views/TeamsView';
import { ListView } from './views/ListView';
import { WaitingDebtChart } from './components/WaitingDebtChart';
import { SnoozeDialog } from './components/SnoozeDialog';
// AI Demo Mode imports
import { AIInsightBanner } from '../shared/AIComponents';
import { getAIWaitingOnYouCardSummary, getAllWaitingOnYouInsights } from '../../services/testData/aiDemoData';

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

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = React.useState<GroupedWaitingData | null>(null);
  const [testTrendData, setTestTrendData] = React.useState<WaitingDebtTrend | null>(null);
  const [testLoading, setTestLoading] = React.useState(dataMode === 'test');
  const [testViewMode, setTestViewMode] = React.useState<ViewMode>('people');
  const [testExpandedGroups, setTestExpandedGroups] = React.useState<Set<string>>(new Set());
  const [testFilter, setTestFilter] = React.useState<WaitingFilter>({
    minStaleDuration: staleDays * 24,
    maxResults: 50,
    includeEmail,
    includeTeamsChats,
    includeChannelMessages: includeChannels,
    includeMentions,
    relationshipFilter: 'all',
    hideSnoozed: false
  });

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      // Simulate loading delay
      const timer = setTimeout(() => {
        setTestData(getTestWaitingOnYouData());
        setTestTrendData(getTestWaitingOnYouTrend());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // Main data hook - pass settings as initial filter (only used in API mode)
  const apiHook = useWaitingOnYou({
    graphClient: dataMode === 'api' ? graphClient : null,
    initialFilter: {
      minStaleDuration: staleDays * 24, // Convert days to hours
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
  const viewMode = dataMode === 'test' ? testViewMode : apiHook.viewMode;
  const setViewMode = dataMode === 'test' ? setTestViewMode : apiHook.setViewMode;
  const expandedGroups = dataMode === 'test' ? testExpandedGroups : apiHook.expandedGroups;
  const filter = dataMode === 'test' ? testFilter : apiHook.filter;

  const toggleGroup = dataMode === 'test'
    ? (groupId: string) => {
        setTestExpandedGroups(prev => {
          const next = new Set(prev);
          if (next.has(groupId)) next.delete(groupId);
          else next.add(groupId);
          return next;
        });
      }
    : apiHook.toggleGroup;

  const updateFilter = dataMode === 'test'
    ? (updates: Partial<WaitingFilter>) => setTestFilter(prev => ({ ...prev, ...updates }))
    : apiHook.updateFilter;

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

  // These actions are no-ops in test mode
  const dismissConversation = dataMode === 'test' ? () => {} : apiHook.dismissConversation;
  const snoozeConversation = dataMode === 'test' ? () => {} : apiHook.snoozeConversation;
  const unsnoozeConversation = dataMode === 'test' ? () => {} : apiHook.unsnoozeConversation;

  // Snooze dialog hook
  const {
    isSnoozeDialogOpen,
    targetConversation,
    openSnoozeDialog,
    closeSnoozeDialog
  } = useSnooze();

  // Local state for showing snoozed items
  const [showSettings, setShowSettings] = useState(false);

  // Handle snooze from dialog
  const handleSnooze = (until: Date, reason?: string) => {
    if (targetConversation) {
      snoozeConversation(targetConversation.id, until, reason);
      closeSnoozeDialog();
    }
  };

  // Handle quick reply for Teams messages
  const handleQuickReply = async (
    chatId: string,
    replyToId: string,
    message: string,
    isChannel: boolean
  ): Promise<boolean> => {
    // This would need the WaitingOnYouService to be accessible here
    // For now, return false as a placeholder
    console.log('Quick reply:', { chatId, replyToId, message, isChannel });
    return false;
  };

  // Format last refreshed time
  const formatLastRefreshed = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;

    const hours = Math.floor(diff / 60);
    return `${hours}h ago`;
  };

  // Render header summary
  const renderHeaderSummary = () => {
    if (!data) return null;

    const { totalPeopleWaiting, criticalCount } = data;

    return (
      <div className={styles.summaryBadge}>
        <Badge
          appearance="filled"
          color={criticalCount > 0 ? 'danger' : totalPeopleWaiting > 0 ? 'warning' : 'success'}
          size="medium"
        >
          {totalPeopleWaiting} {totalPeopleWaiting === 1 ? 'person' : 'people'} waiting
        </Badge>
        {criticalCount > 0 && (
          <Badge appearance="filled" color="danger" size="small">
            {criticalCount} critical
          </Badge>
        )}
      </div>
    );
  };

  // Render content based on view mode
  const renderContent = () => {
    if (isLoading && !data) {
      return (
        <div className={styles.loadingContainer}>
          <Spinner label="Loading..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <ErrorCircleRegular style={{ fontSize: '32px', color: tokens.colorPaletteRedForeground1 }} />
          <Text>Failed to load data</Text>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            {error.message}
          </Text>
          <Button appearance="primary" onClick={refresh}>
            Try again
          </Button>
        </div>
      );
    }

    // Empty state - when there's no data or no items
    if (!data || data.totalItems === 0) {
      return null; // Return null to trigger the empty state at card level
    }

    switch (viewMode) {
      case 'people':
        return (
          <PeopleView
            groups={data.byPerson}
            ungrouped={data.ungroupedByPerson}
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
            onDismiss={dismissConversation}
            onSnooze={openSnoozeDialog}
            onUnsnooze={unsnoozeConversation}
            onQuickReply={handleQuickReply}
          />
        );
      case 'teams':
        return (
          <TeamsView
            teamGroups={data.byTeam}
            ungroupedByPerson={data.ungroupedByPerson}
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
            onDismiss={dismissConversation}
            onSnooze={openSnoozeDialog}
            onUnsnooze={unsnoozeConversation}
            onQuickReply={handleQuickReply}
          />
        );
      case 'list':
        return (
          <ListView
            conversations={data.allConversations}
            onDismiss={dismissConversation}
            onSnooze={openSnoozeDialog}
            onUnsnooze={unsnoozeConversation}
            onQuickReply={handleQuickReply}
          />
        );
      default:
        return null;
    }
  };

  // Empty state - styled consistently with other cards
  if (!isLoading && !error && (!data || data.totalItems === 0)) {
    return (
      <div className={styles.card} style={{ height: '200px', minHeight: '200px', maxHeight: '200px' }}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <PersonClockRegular className={styles.headerIcon} />
            <div className={styles.headerTitle}>
              <Text weight="semibold" size={400}>Waiting On You</Text>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Tooltip content="Refresh" relationship="label">
              <Button
                appearance="subtle"
                icon={<ArrowSyncRegular />}
                onClick={refresh}
              />
            </Tooltip>
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: tokens.spacingVerticalS,
          padding: tokens.spacingVerticalM
        }}>
          <PersonClockRegular style={{ fontSize: '32px', color: tokens.colorNeutralForeground4, opacity: 0.5 }} />
          <Text size={300} weight="semibold" style={{ textAlign: 'center' }}>You're all caught up!</Text>
          <Text size={200} style={{ textAlign: 'center', color: tokens.colorNeutralForeground3 }}>
            No one is waiting on you
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <PersonClockRegular className={styles.headerIcon} />
          <div className={styles.headerTitle}>
            <Text weight="semibold" size={400}>Waiting On You</Text>
            {renderHeaderSummary()}
          </div>
        </div>
        <div className={styles.headerActions}>
          <Tooltip content="Refresh" relationship="label">
            <Button
              appearance="subtle"
              icon={isLoading ? <Spinner size="tiny" /> : <ArrowSyncRegular />}
              onClick={refresh}
              disabled={isLoading}
            />
          </Tooltip>
          <Tooltip content="Settings" relationship="label">
            <Button
              appearance="subtle"
              icon={<SettingsRegular />}
              onClick={() => setShowSettings(!showSettings)}
            />
          </Tooltip>
          {onToggleSize && (
            <Tooltip content="Expand" relationship="label">
              <Button
                appearance="subtle"
                icon={<ArrowMaximizeRegular />}
                onClick={onToggleSize}
              />
            </Tooltip>
          )}
        </div>
      </div>

      {/* Filter Bar (when settings open) */}
      {showSettings && (
        <div className={styles.filterBar}>
          <div className={styles.filterItem}>
            <Switch
              checked={!filter.hideSnoozed}
              onChange={(_, data) => updateFilter({ hideSnoozed: !data.checked })}
              label="Show snoozed"
            />
          </div>
          <div className={styles.filterItem}>
            <Switch
              checked={filter.includeEmail}
              onChange={(_, data) => updateFilter({ includeEmail: data.checked })}
              label="Email"
            />
          </div>
          <div className={styles.filterItem}>
            <Switch
              checked={filter.includeTeamsChats}
              onChange={(_, data) => updateFilter({ includeTeamsChats: data.checked })}
              label="Teams Chats"
            />
          </div>
          <div className={styles.filterItem}>
            <Switch
              checked={filter.includeChannelMessages}
              onChange={(_, data) => updateFilter({ includeChannelMessages: data.checked })}
              label="Channels"
            />
          </div>
          <div className={styles.filterItem}>
            <Switch
              checked={filter.includeMentions}
              onChange={(_, data) => updateFilter({ includeMentions: data.checked })}
              label="@Mentions"
            />
          </div>
        </div>
      )}

      {/* AI Insight Banner (only in AI Demo Mode) */}
      {aiDemoMode && (
        <div style={{ padding: `0 ${tokens.spacingHorizontalM}`, marginBottom: tokens.spacingVerticalS }}>
          <AIInsightBanner
            summary={getAIWaitingOnYouCardSummary()}
            insights={getAllWaitingOnYouInsights()}
          />
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <TabList
          selectedValue={viewMode}
          onTabSelect={(_, data) => setViewMode(data.value as ViewMode)}
          size="small"
        >
          <Tab value="people" icon={<PeopleRegular />}>
            People
          </Tab>
          <Tab value="teams" icon={<PeopleTeamRegular />}>
            Teams
          </Tab>
          <Tab value="list" icon={<ListRegular />}>
            List
          </Tab>
        </TabList>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {renderContent()}
      </div>

      {/* Chart - positioned at bottom before footer for consistent layout */}
      {showChart && trendData && viewMode === 'people' && (
        <div className={styles.chartSection}>
          <WaitingDebtChart trend={trendData} />
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <Text size={200} className={styles.lastRefreshed}>
          {lastRefreshed ? `Updated ${formatLastRefreshed(lastRefreshed)}` : 'Not yet loaded'}
        </Text>
        {data && (
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            {data.totalItems} total items
          </Text>
        )}
      </div>

      {/* Snooze Dialog */}
      <SnoozeDialog
        open={isSnoozeDialogOpen}
        onOpenChange={closeSnoozeDialog}
        onSnooze={handleSnooze}
        conversationSubject={targetConversation?.subject || ''}
      />
    </div>
  );
};

export default WaitingOnYouCard;
