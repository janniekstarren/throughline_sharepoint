import * as React from 'react';
import {
  tokens,
  mergeClasses,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Checkbox,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  TaskListSquareLtr24Regular,
  ErrorCircle24Regular,
  CheckmarkCircle24Regular,
  Important16Filled,
  CalendarLtr16Regular,
} from '@fluentui/react-icons';
import { ITaskItem } from '../services/GraphService';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { useCardStyles, CardEnter, ListItemEnter } from './cardStyles';

export interface IMyTasksCardProps {
  tasks: ITaskItem[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

export const MyTasksCard: React.FC<IMyTasksCardProps> = ({ tasks, loading, error, onAction, theme, title }) => {
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

  return (
    <CardEnter visible={true}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconWrapper}>
            <TaskListSquareLtr24Regular className={styles.cardIcon} />
          </div>
          <Body1Strong className={styles.cardTitle}>{title || 'My Tasks'}</Body1Strong>
          {!loading && tasks.length > 0 && (
            <span className={styles.badge}>{tasks.length}</span>
          )}
        </div>
        <div className={styles.cardContent}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spinner size="medium" />
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <ErrorCircle24Regular className={styles.errorIcon} />
              <Text>{error}</Text>
            </div>
          ) : tasks.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckmarkCircle24Regular className={styles.emptyIcon} />
              <Text>All tasks completed!</Text>
            </div>
          ) : (
            <div className={styles.itemList}>
              {tasks.map((task, index) => (
                <ListItemEnter key={task.id} visible={true}>
                  <div style={{ animationDelay: `${index * 50}ms` }}>
                    <ItemHoverCard
                      item={task}
                      itemType="task"
                      onAction={onAction}
                      theme={theme}
                    >
                      <div
                        className={mergeClasses(
                          styles.item,
                          task.isOverdue && styles.itemHighlight,
                          task.isOverdue && styles.itemHighlightError
                        )}
                        role="button"
                        tabIndex={0}
                      >
                        <Checkbox checked={false} disabled style={{ flexShrink: 0 }} />
                        <div className={styles.itemContent}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {task.importance === 'high' && (
                              <Important16Filled style={{ color: tokens.colorPaletteRedForeground1, fontSize: '14px', flexShrink: 0 }} />
                            )}
                            <Body1 className={styles.itemTitle}>{task.title}</Body1>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                            <Caption1 className={styles.itemMeta}>{task.listName}</Caption1>
                            {task.dueDateTime && (
                              <Caption1 style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: task.isOverdue ? tokens.colorPaletteRedForeground1 : tokens.colorNeutralForeground4,
                                fontSize: '11px'
                              }}>
                                <CalendarLtr16Regular style={{ fontSize: '12px' }} />
                                {formatDueDate(task.dueDateTime)}
                              </Caption1>
                            )}
                          </div>
                        </div>
                      </div>
                    </ItemHoverCard>
                  </div>
                </ListItemEnter>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardEnter>
  );
};

export default MyTasksCard;
