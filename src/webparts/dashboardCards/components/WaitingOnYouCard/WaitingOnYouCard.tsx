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
  ErrorCircleRegular
} from '@fluentui/react-icons';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import { ViewMode } from '../../models/WaitingOnYou';
import { useWaitingOnYou } from '../../hooks/useWaitingOnYou';
import { useSnooze } from '../../hooks/useSnooze';
import { useWaitingOnYouStyles } from './WaitingOnYouCard.styles';

import { PeopleView } from './views/PeopleView';
import { TeamsView } from './views/TeamsView';
import { ListView } from './views/ListView';
import { WaitingDebtChart } from './components/WaitingDebtChart';
import { SnoozeDialog } from './components/SnoozeDialog';

export interface WaitingOnYouCardProps {
  graphClient: MSGraphClientV3 | null;
  showChart?: boolean;
  staleDays?: number;
  includeEmail?: boolean;
  includeTeamsChats?: boolean;
  includeChannels?: boolean;
  includeMentions?: boolean;
}

export const WaitingOnYouCard: React.FC<WaitingOnYouCardProps> = ({
  graphClient,
  showChart = true,
  staleDays = 2,
  includeEmail = true,
  includeTeamsChats = true,
  includeChannels = false,
  includeMentions = true,
}) => {
  const styles = useWaitingOnYouStyles();

  // Main data hook - pass settings as initial filter
  const {
    data,
    trendData,
    isLoading,
    error,
    lastRefreshed,
    viewMode,
    setViewMode,
    expandedGroups,
    toggleGroup,
    filter,
    updateFilter,
    refresh,
    dismissConversation,
    snoozeConversation,
    unsnoozeConversation
  } = useWaitingOnYou({
    graphClient,
    initialFilter: {
      minStaleDuration: staleDays * 24, // Convert days to hours
      includeEmail,
      includeTeamsChats,
      includeChannelMessages: includeChannels,
      includeMentions,
    }
  });

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

    if (!data) {
      return (
        <div className={styles.loadingContainer}>
          <Text>No data available</Text>
        </div>
      );
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

      {/* Chart */}
      {showChart && trendData && viewMode === 'people' && (
        <div className={styles.chartSection}>
          <WaitingDebtChart trend={trendData} />
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {renderContent()}
      </div>

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
