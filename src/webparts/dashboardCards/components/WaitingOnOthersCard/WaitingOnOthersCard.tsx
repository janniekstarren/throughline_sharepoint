import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardHeader,
  Text,
  Badge,
  Button,
  Spinner,
  Menu,
  MenuItem,
  MenuTrigger,
  MenuPopover,
  MenuList,
  TabList,
  Tab,
  Tooltip,
  Divider
} from '@fluentui/react-components';
import {
  PeopleRegular,
  ListRegular,
  ArrowClockwiseRegular,
  FilterRegular,
  ClockRegular
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { useWaitingOnOthers, IWaitingOnOthersSettings, DEFAULT_WAITING_ON_OTHERS_SETTINGS } from '../../hooks/useWaitingOnOthers';
import { PeopleView } from './views/PeopleView';
import { ListView } from './views/ListView';
import { WaitingTrendChart } from './components/WaitingTrendChart';
import { ReminderComposer } from './components/ReminderComposer';
import { SnoozeDialog } from '../WaitingOnYouCard/components/SnoozeDialog'; // Reuse from WaitingOnYou
import { PendingResponse, ViewMode } from '../../models/WaitingOnOthers';
import { WaitingOnOthersService } from '../../services/WaitingOnOthersService';
import { useStyles } from './WaitingOnOthersCard.styles';

interface WaitingOnOthersCardProps {
  context: WebPartContext;
  settings?: IWaitingOnOthersSettings;
}

export const WaitingOnOthersCard: React.FC<WaitingOnOthersCardProps> = ({
  context,
  settings = DEFAULT_WAITING_ON_OTHERS_SETTINGS
}) => {
  const styles = useStyles();

  const {
    data,
    trendData,
    isLoading,
    error,
    lastRefreshed,
    updateFilter,
    refresh,
    resolveItem,
    snoozeItem,
    unsnoozeItem,
    recordReminderSent
  } = useWaitingOnOthers(context, settings);

  const [viewMode, setViewMode] = useState<ViewMode>('people');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [reminderTarget, setReminderTarget] = useState<PendingResponse | null>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<PendingResponse | null>(null);

  // Handlers
  const handleToggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleSendReminder = useCallback(async (subject: string, body: string, template: string) => {
    if (!reminderTarget) return false;

    try {
      const graphClient = await context.msGraphClientFactory.getClient('3');
      const userResponse = await graphClient.api('/me').select('id,mail').get();

      // Create service instance for sending
      const service = new WaitingOnOthersService(
        graphClient,
        userResponse.id,
        userResponse.mail,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any, // These aren't needed for sending
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any
      );

      const success = await service.sendReminder(reminderTarget, subject, body);

      if (success) {
        recordReminderSent(reminderTarget.id, template);
        setReminderTarget(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to send reminder:', err);
      return false;
    }
  }, [reminderTarget, context, recordReminderSent]);

  const handleSnooze = useCallback((until: Date, reason?: string) => {
    if (snoozeTarget) {
      snoozeItem(snoozeTarget.id, until, reason);
      setSnoozeTarget(null);
    }
  }, [snoozeTarget, snoozeItem]);

  const handleItemClick = useCallback((webUrl: string) => {
    window.open(webUrl, '_blank');
  }, []);

  // Summary text
  const summaryText = useMemo(() => {
    if (!data) return '';
    const { totalPeopleOwing, totalItems, oldestWaitDays } = data;

    if (totalPeopleOwing === 0) return 'No one owes you a response';

    const parts = [];
    parts.push(`${totalPeopleOwing} ${totalPeopleOwing === 1 ? 'person' : 'people'} owes you`);
    parts.push(`${totalItems} item${totalItems > 1 ? 's' : ''}`);
    if (oldestWaitDays > 0) {
      parts.push(`${oldestWaitDays}d longest`);
    }

    return parts.join(' · ');
  }, [data]);

  // Loading state
  if (isLoading && !data) {
    return (
      <Card className={styles.card}>
        <div className={styles.loadingContainer}>
          <Spinner size="medium" label="Checking who owes you..." />
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={styles.card}>
        <div className={styles.errorContainer}>
          <Text>Unable to load data</Text>
          <Button appearance="primary" onClick={refresh}>Try again</Button>
        </div>
      </Card>
    );
  }

  // Empty state
  if (!data || data.totalItems === 0) {
    return (
      <Card className={styles.card}>
        <CardHeader
          header={<Text weight="semibold" size={400}>Waiting On Others</Text>}
        />
        <div className={styles.emptyState}>
          <ClockRegular className={styles.emptyIcon} />
          <Text size={400} weight="semibold">No pending responses</Text>
          <Text size={300} className={styles.emptySubtext}>
            Everyone has responded to you. Nice!
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      {/* Header */}
      <CardHeader
        header={
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <Text weight="semibold" size={400}>Waiting On Others</Text>
              {data.oldestWaitDays >= 7 && (
                <Badge appearance="tint" color="warning" size="small">
                  {data.oldestWaitDays}d oldest
                </Badge>
              )}
            </div>
            <div className={styles.headerActions}>
              <Tooltip content="Refresh" relationship="label">
                <Button
                  appearance="subtle"
                  icon={<ArrowClockwiseRegular />}
                  size="small"
                  onClick={refresh}
                />
              </Tooltip>
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button appearance="subtle" icon={<FilterRegular />} size="small" />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem onClick={() => updateFilter({ minWaitDuration: 24 })}>
                      After 24 hours
                    </MenuItem>
                    <MenuItem onClick={() => updateFilter({ minWaitDuration: 48 })}>
                      After 48 hours
                    </MenuItem>
                    <MenuItem onClick={() => updateFilter({ minWaitDuration: 72 })}>
                      After 72 hours
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
          </div>
        }
        description={
          <Text size={200} className={styles.subheader}>{summaryText}</Text>
        }
      />

      {/* View Mode Tabs */}
      <div className={styles.tabContainer}>
        <TabList
          selectedValue={viewMode}
          onTabSelect={(_, d) => setViewMode(d.value as ViewMode)}
          size="small"
        >
          <Tab value="people" icon={<PeopleRegular />}>People</Tab>
          <Tab value="list" icon={<ListRegular />}>All</Tab>
        </TabList>
      </div>

      <Divider className={styles.divider} />

      {/* Content */}
      <div className={styles.content}>
        {viewMode === 'people' && (
          <PeopleView
            groups={data.byPerson}
            expandedGroups={expandedGroups}
            onToggleGroup={handleToggleGroup}
            onSendReminder={setReminderTarget}
            onResolve={resolveItem}
            onSnooze={setSnoozeTarget}
            onUnsnooze={unsnoozeItem}
            onItemClick={handleItemClick}
          />
        )}

        {viewMode === 'list' && (
          <ListView
            items={data.allPendingItems}
            onSendReminder={setReminderTarget}
            onResolve={resolveItem}
            onSnooze={setSnoozeTarget}
            onUnsnooze={unsnoozeItem}
            onItemClick={handleItemClick}
          />
        )}
      </div>

      {/* Trend Chart */}
      {settings.showChart && trendData && data.totalItems > 0 && (
        <>
          <Divider className={styles.divider} />
          <WaitingTrendChart data={trendData} />
        </>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <Text size={200} className={styles.footerText}>
          {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
        </Text>
      </div>

      {/* Reminder Composer Dialog */}
      {reminderTarget && (
        <ReminderComposer
          open={!!reminderTarget}
          onOpenChange={(open) => !open && setReminderTarget(null)}
          pendingItem={reminderTarget}
          onSend={handleSendReminder}
        />
      )}

      {/* Snooze Dialog (reused from WaitingOnYou) */}
      {snoozeTarget && (
        <SnoozeDialog
          open={!!snoozeTarget}
          onOpenChange={(open) => !open && setSnoozeTarget(null)}
          onSnooze={handleSnooze}
          conversationSubject={snoozeTarget.subject}
        />
      )}
    </Card>
  );
};

export default WaitingOnOthersCard;
