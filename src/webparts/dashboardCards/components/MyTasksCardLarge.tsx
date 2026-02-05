// ============================================
// MyTasksCardLarge - Large card variant for My Tasks
// Master-detail layout with task details panel
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Theme,
  Checkbox,
  Badge,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  TaskListSquareLtr24Regular,
  CheckmarkCircle24Regular,
  Important16Filled,
  CalendarLtr16Regular,
  CalendarLtr24Regular,
  CheckboxChecked24Regular,
  Open24Regular,
  ContractDownLeft20Regular,
} from '@fluentui/react-icons';
import { ITaskItem } from '../services/GraphService';
import { MasterDetailCard } from './shared/MasterDetailCard';
import { HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IMyTasksCardLargeProps {
  tasks: ITaskItem[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

const useStyles = makeStyles({
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
  },
  taskInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  taskTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  taskTitleText: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  importanceIcon: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: '14px',
    flexShrink: 0,
  },
  dueText: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  overdueText: {
    color: tokens.colorPaletteRedForeground1,
  },
  listName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Overdue highlight for master item
  masterItemOverdue: {
    backgroundColor: `${tokens.colorPaletteRedBackground1}`,
  },
  // Detail panel styles
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  detailHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.3,
  },
  badgeRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  detailIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
  },
  notesContent: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.5,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
  },
  emptyNotes: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground4,
    fontStyle: 'italic',
  },
  // Action buttons
  actionButton: {
    minWidth: 'auto',
  },
  // Empty states
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
});

// Format due date for display
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

// Format due date for detail panel (full format)
const formatDueDateFull = (date: Date | undefined): string => {
  if (!date) return 'No due date';
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Check if task is overdue
const isOverdue = (date: Date | undefined): boolean => {
  if (!date) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return taskDate < today;
};

// Sort tasks: overdue first, then by due date, then by importance
const sortTasks = (tasks: ITaskItem[]): ITaskItem[] => {
  return [...tasks].sort((a, b) => {
    // Overdue tasks first
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;

    // Then by importance
    if (a.importance === 'high' && b.importance !== 'high') return -1;
    if (a.importance !== 'high' && b.importance === 'high') return 1;

    // Then by due date
    if (a.dueDateTime && b.dueDateTime) {
      return a.dueDateTime.getTime() - b.dueDateTime.getTime();
    }
    if (a.dueDateTime) return -1;
    if (b.dueDateTime) return 1;

    return 0;
  });
};

// Find first overdue or first task
const findFirstTask = (tasks: ITaskItem[]): ITaskItem | undefined => {
  const sorted = sortTasks(tasks);
  return sorted.length > 0 ? sorted[0] : undefined;
};

// Get status display text
const getStatusText = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'notstarted':
    case 'not_started':
      return 'Not Started';
    case 'inprogress':
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'waitingonothers':
    case 'waiting_on_others':
      return 'Waiting on Others';
    case 'deferred':
      return 'Deferred';
    default:
      return status;
  }
};

export const MyTasksCardLarge: React.FC<IMyTasksCardLargeProps> = ({
  tasks,
  loading,
  error,
  onAction,
  theme,
  title = 'My Tasks',
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedTask, setSelectedTask] = React.useState<ITaskItem | undefined>(undefined);

  // Sort tasks
  const sortedTasks = React.useMemo(() => sortTasks(tasks), [tasks]);

  // Handler for selecting a task
  const handleSelectTask = React.useCallback((task: ITaskItem): void => {
    setSelectedTask(task);
  }, []);

  // Auto-select first task when tasks load
  React.useEffect(() => {
    if (sortedTasks.length > 0 && !selectedTask) {
      const taskToSelect = findFirstTask(sortedTasks);
      setSelectedTask(taskToSelect);
    }
  }, [sortedTasks, selectedTask]);

  // Handle action callback
  const handleTaskAction = (action: string, task: ITaskItem): void => {
    if (onAction) {
      onAction(action, task as IHoverCardItem, 'task');
    }
  };

  // Render master item (compact task display)
  const renderMasterItem = (task: ITaskItem, isSelected: boolean): React.ReactNode => {
    const taskIsOverdue = isOverdue(task.dueDateTime);

    return (
      <div className={styles.masterItem}>
        <Checkbox checked={false} disabled style={{ flexShrink: 0 }} />
        <div className={styles.taskInfo}>
          <div className={styles.taskTitle}>
            {task.importance === 'high' && (
              <Important16Filled className={styles.importanceIcon} />
            )}
            <Text className={styles.taskTitleText}>{task.title}</Text>
          </div>
          <div className={styles.taskMeta}>
            <span className={styles.listName}>{task.listName}</span>
            {task.dueDateTime && (
              <span className={`${styles.dueText} ${taskIsOverdue ? styles.overdueText : ''}`}>
                <CalendarLtr16Regular />
                {formatDueDate(task.dueDateTime)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (task: ITaskItem): React.ReactNode => {
    const taskIsOverdue = isOverdue(task.dueDateTime);

    return (
      <div className={styles.detailContainer}>
        {/* Task Title and Badges */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{task.title}</Text>
          <div className={styles.badgeRow}>
            {task.importance === 'high' && (
              <Badge color="danger" appearance="filled">
                High Priority
              </Badge>
            )}
            {taskIsOverdue && (
              <Badge color="danger" appearance="tint">
                Overdue
              </Badge>
            )}
            <Badge color="informative" appearance="outline">
              {getStatusText(task.status)}
            </Badge>
          </div>
        </div>

        {/* Details Section */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Details</Text>
          <div className={styles.detailRow}>
            <TaskListSquareLtr24Regular className={styles.detailIcon} />
            <span>List: {task.listName}</span>
          </div>
          <div className={styles.detailRow}>
            <CalendarLtr24Regular className={styles.detailIcon} />
            <span style={{ color: taskIsOverdue ? tokens.colorPaletteRedForeground1 : undefined }}>
              Due: {formatDueDateFull(task.dueDateTime)}
            </span>
          </div>
        </div>

        {/* Notes Section (placeholder - tasks may not have notes in basic interface) */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Notes</Text>
          <Text className={styles.emptyNotes}>
            No notes for this task. Open in Microsoft To Do to add notes.
          </Text>
        </div>
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (task: ITaskItem): React.ReactNode => {
    return (
      <>
        <Button
          appearance="primary"
          icon={<CheckboxChecked24Regular />}
          className={styles.actionButton}
          onClick={() => handleTaskAction('complete', task)}
        >
          Complete
        </Button>
        <Button
          appearance="secondary"
          icon={<Open24Regular />}
          className={styles.actionButton}
          onClick={() => {
            // Open in Microsoft To Do
            window.open('https://to-do.office.com/tasks/', '_blank', 'noopener,noreferrer');
          }}
        >
          Open in To Do
        </Button>
      </>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <TaskListSquareLtr24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a task to view details</Text>
      </>
    );
  };

  // Render empty state (no tasks)
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <CheckmarkCircle24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>All tasks completed!</Text>
      </>
    );
  };

  return (
    <MasterDetailCard
      items={sortedTasks}
      selectedItem={selectedTask}
      onItemSelect={handleSelectTask}
      getItemKey={(task: ITaskItem) => task.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<TaskListSquareLtr24Regular />}
      title={title}
      itemCount={sortedTasks.length}
      loading={loading}
      error={error}
      emptyMessage="All tasks completed!"
      emptyIcon={<CheckmarkCircle24Regular />}
      headerActions={
        onToggleSize && (
          <Tooltip content="Collapse to compact view" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<ContractDownLeft20Regular />}
              onClick={onToggleSize}
              aria-label="Collapse card"
            />
          </Tooltip>
        )
      }
    />
  );
};

export default MyTasksCardLarge;
