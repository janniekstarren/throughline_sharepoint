// ============================================
// MyTasksCard - Displays Microsoft To Do tasks
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  tokens,
  mergeClasses,
  Caption1,
  Body1,
  Checkbox,
  Theme,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  TaskListSquareLtr24Regular,
  CheckmarkCircle24Regular,
  Important16Filled,
  CalendarLtr16Regular,
  ArrowExpand20Regular,
} from '@fluentui/react-icons';
import { ITaskItem } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { BaseCard, CardHeader, EmptyState } from './shared';
import { useCardStyles } from './cardStyles';

export interface IMyTasksCardProps {
  tasks: ITaskItem[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

export const MyTasksCard: React.FC<IMyTasksCardProps> = ({
  tasks,
  loading,
  error,
  onAction,
  theme,
  title,
  onToggleSize,
}) => {
  const styles = useCardStyles();

  const formatDueDate = (date: Date | undefined): string => {
    if (!date) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    if (taskDate < today) return 'Overdue';

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isOverdue = (date: Date | undefined): boolean => {
    if (!date) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return taskDate < today;
  };

  // Expand button for switching to large card view
  const expandButton = onToggleSize ? (
    <Tooltip content="Expand to detailed view" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowExpand20Regular />}
        onClick={onToggleSize}
        aria-label="Expand card"
      />
    </Tooltip>
  ) : undefined;

  // Empty state
  if (!loading && !error && tasks.length === 0) {
    return (
      <BaseCard testId="my-tasks-card">
        <CardHeader
          icon={<TaskListSquareLtr24Regular />}
          title={title || 'My Tasks'}
          cardId="myTasks"
          actions={expandButton}
        />
        <EmptyState
          icon={<CheckmarkCircle24Regular />}
          title="All tasks completed!"
          description="Add tasks in Microsoft To Do"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={loading}
      error={error}
      loadingMessage="Loading tasks..."
      testId="my-tasks-card"
    >
      <CardHeader
        icon={<TaskListSquareLtr24Regular />}
        title={title || 'My Tasks'}
        cardId="myTasks"
        badge={tasks.length > 0 ? tasks.length : undefined}
        badgeVariant="brand"
        actions={expandButton}
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div className={styles.itemList}>
            {tasks.map(task => (
              <ItemHoverCard
                key={task.id}
                item={task}
                itemType="task"
                onAction={onAction}
                theme={theme}
              >
                <div
                  className={mergeClasses(
                    styles.item,
                    task.isOverdue && styles.itemHighlightError
                  )}
                  role="button"
                  tabIndex={0}
                >
                  <Checkbox checked={false} disabled style={{ flexShrink: 0 }} />
                  <div className={styles.itemContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
                      {task.importance === 'high' && (
                        <Important16Filled style={{
                          color: tokens.colorPaletteRedForeground1,
                          fontSize: '14px',
                          flexShrink: 0
                        }} />
                      )}
                      <Body1 className={styles.itemTitle}>{task.title}</Body1>
                    </div>
                    <div className={styles.itemMeta} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Caption1 style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: '1 1 auto',
                        minWidth: '60px'
                      }}>
                        {task.listName}
                      </Caption1>
                      {task.dueDateTime && (
                        <Caption1 style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacingHorizontalXXS,
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                          color: isOverdue(task.dueDateTime) ? tokens.colorPaletteRedForeground1 : undefined
                        }}>
                          <CalendarLtr16Regular />
                          {formatDueDate(task.dueDateTime)}
                        </Caption1>
                      )}
                    </div>
                  </div>
                </div>
              </ItemHoverCard>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </BaseCard>
  );
};

export default MyTasksCard;
