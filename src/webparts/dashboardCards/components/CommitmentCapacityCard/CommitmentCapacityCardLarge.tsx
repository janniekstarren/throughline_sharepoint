// ============================================
// CommitmentCapacityCardLarge - Large card variant
// Full content view with master-detail layout
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  ScaleFill24Regular,
  ArrowClockwiseRegular,
  Open16Regular,
  Clock20Regular,
  TaskListSquareLtr20Regular,
  CalendarLtr20Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { TaskCommitment } from '../../models/CommitmentCapacity';
import { useCommitmentCapacity } from '../../hooks/useCommitmentCapacity';
import { DataMode } from '../../services/testData';

export interface CommitmentCapacityCardLargeProps {
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  masterInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  masterTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  masterMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  masterRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
    flexShrink: 0,
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

  // Progress bar
  progressBarOuter: {
    width: '100%',
    height: '8px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: '4px',
    backgroundColor: tokens.colorBrandForeground1,
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
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

// ============================================
// Helpers
// ============================================

const formatHours = (hours: number): string => {
  if (hours === Math.floor(hours)) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
};

const getSourceLabel = (source: TaskCommitment['source']): string => {
  switch (source) {
    case 'planner': return 'Planner';
    case 'todo': return 'To Do';
    case 'inferred': return 'Inferred';
    default: return source;
  }
};

const getSourceBadgeColor = (source: TaskCommitment['source']): 'brand' | 'informative' | 'warning' => {
  switch (source) {
    case 'planner': return 'brand';
    case 'todo': return 'informative';
    case 'inferred': return 'warning';
    default: return 'informative';
  }
};

const getPriorityLabel = (priority: TaskCommitment['priority']): string => {
  switch (priority) {
    case 'urgent': return 'Urgent';
    case 'important': return 'Important';
    case 'normal': return 'Normal';
    case 'low': return 'Low';
    default: return priority;
  }
};

const getPriorityBadgeColor = (priority: TaskCommitment['priority']): 'danger' | 'warning' | 'informative' | 'success' => {
  switch (priority) {
    case 'urgent': return 'danger';
    case 'important': return 'warning';
    case 'normal': return 'informative';
    case 'low': return 'success';
    default: return 'informative';
  }
};

const priorityOrder: Record<string, number> = {
  urgent: 0,
  important: 1,
  normal: 2,
  low: 3,
};

// ============================================
// Component
// ============================================

export const CommitmentCapacityCardLarge: React.FC<CommitmentCapacityCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedTask, setSelectedTask] = React.useState<TaskCommitment | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useCommitmentCapacity({ dataMode });

  // Sort tasks by priority then due date
  const sortedTasks = React.useMemo(() => {
    if (!data) return [];
    return [...data.currentWeek.tasks].sort((a, b) => {
      const priorityDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (priorityDiff !== 0) return priorityDiff;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (sortedTasks.length > 0 && !selectedTask) {
      setSelectedTask(sortedTasks[0]);
    }
  }, [sortedTasks.length]);

  // Render master list item
  const renderMasterItem = (task: TaskCommitment, _isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        <div className={styles.masterInfo}>
          <Text className={styles.masterTitle}>{task.title}</Text>
          <div className={styles.masterMeta}>
            <span>{getSourceLabel(task.source)}</span>
            <span>{task.percentComplete}% complete</span>
          </div>
        </div>
        <div className={styles.masterRight}>
          <Badge
            appearance="tint"
            color={getPriorityBadgeColor(task.priority)}
            size="small"
          >
            {getPriorityLabel(task.priority)}
          </Badge>
          <Badge
            appearance="outline"
            color={getSourceBadgeColor(task.source)}
            size="small"
          >
            {getSourceLabel(task.source)}
          </Badge>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (task: TaskCommitment): React.ReactNode => {
    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{task.title}</Text>
          <div className={styles.badgeRow}>
            <Badge
              appearance="filled"
              color={getPriorityBadgeColor(task.priority)}
            >
              {getPriorityLabel(task.priority)}
            </Badge>
            <Badge
              appearance="tint"
              color={getSourceBadgeColor(task.source)}
            >
              {getSourceLabel(task.source)}
            </Badge>
          </div>
        </div>

        {/* Task Details */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Details</Text>
          <div className={styles.detailRow}>
            <Clock20Regular className={styles.detailIcon} />
            <span>Estimated: {formatHours(task.estimatedHours)}</span>
          </div>
          {task.dueDate && (
            <div className={styles.detailRow}>
              <CalendarLtr20Regular className={styles.detailIcon} />
              <span>Due: {new Date(task.dueDate).toLocaleDateString([], {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}</span>
            </div>
          )}
          {task.projectName && (
            <div className={styles.detailRow}>
              <TaskListSquareLtr20Regular className={styles.detailIcon} />
              <span>Project: {task.projectName}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <ScaleFill24Regular className={styles.detailIcon} />
            <span>Priority: {getPriorityLabel(task.priority)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Progress ({task.percentComplete}%)</Text>
          <div className={styles.progressBarOuter}>
            <div
              className={styles.progressBarInner}
              style={{ width: `${task.percentComplete}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (task: TaskCommitment): React.ReactNode => {
    return (
      <Tooltip content="Open task" relationship="label">
        <Button
          appearance="primary"
          icon={<Open16Regular />}
        >
          Open
        </Button>
      </Tooltip>
    );
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <ScaleFill24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a task to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <ScaleFill24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No tasks this week</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          Commitment data will appear when tasks are assigned
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<TaskCommitment>
      items={sortedTasks}
      selectedItem={selectedTask}
      onItemSelect={setSelectedTask}
      getItemKey={(t) => t.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<ScaleFill24Regular />}
      title="Commitment vs Capacity"
      itemCount={data?.currentWeek.tasks.length ?? 0}
      loading={isLoading}
      error={error?.message}
      emptyMessage="No tasks this week"
      emptyIcon={<ScaleFill24Regular />}
      headerActions={
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
          <Tooltip content="Refresh" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowClockwiseRegular />}
              onClick={refresh}
            />
          </Tooltip>
          <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
        </div>
      }
    />
  );
};

export default CommitmentCapacityCardLarge;
