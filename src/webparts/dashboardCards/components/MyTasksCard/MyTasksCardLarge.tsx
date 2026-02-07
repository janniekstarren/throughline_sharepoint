// ============================================
// MyTasksCardLarge - Large Card (Detail View)
// Master-detail layout with tasks grouped by status
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Tooltip,
  Badge,
  Divider,
} from '@fluentui/react-components';
import {
  TaskListSquareLtr24Regular,
  Clock16Regular,
  CheckmarkCircle16Regular,
  ArrowCircleRight16Regular,
  Warning16Regular,
  
  ArrowClockwiseRegular,
  Calendar16Regular,
  Folder16Regular,
  Flag16Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useMyTasks,
  IMyTasksSettings,
  DEFAULT_MY_TASKS_SETTINGS,
} from '../../hooks/useMyTasks';
import { MyTasksData, TaskItem, TaskStatus } from '../../models/MyTasks';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { AIInsightBanner, AIOnboardingDialog } from '../shared/AIComponents';
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import { DataMode } from '../../services/testData';
import { getTestMyTasksData } from '../../services/testData/myTasks';
import {
  getAITasksCardSummary,
  getAllTasksInsights,
} from '../../services/testData/aiDemoData';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
  },
  statusIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0,
    marginTop: '2px',
  },
  statusIconOverdue: {
    color: tokens.colorPaletteRedForeground1,
  },
  statusIconInProgress: {
    color: tokens.colorBrandForeground1,
  },
  statusIconNormal: {
    color: tokens.colorNeutralForeground3,
  },
  statusIconCompleted: {
    color: tokens.colorPaletteGreenForeground1,
  },
  taskInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  taskTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  taskTitleOverdue: {
    color: tokens.colorPaletteRedForeground1,
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  dueDateText: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  dueDateOverdue: {
    color: tokens.colorPaletteRedForeground1,
  },
  importanceBadge: {
    flexShrink: 0,
  },
  // Detail panel styles
  detailHeader: {
    marginBottom: tokens.spacingVerticalL,
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: tokens.spacingVerticalS,
  },
  detailBadges: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    marginBottom: tokens.spacingVerticalM,
  },
  detailSection: {
    marginBottom: tokens.spacingVerticalL,
  },
  detailSectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: tokens.spacingVerticalS,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
  },
  detailIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
  },
  detailBody: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  // Status group header
  statusGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground3,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
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
// Props Interface
// ============================================
interface MyTasksCardLargeProps {
  context: WebPartContext;
  settings?: IMyTasksSettings;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format due date relative to now
 */
const formatDueDate = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays < -1) {
    return `${Math.abs(diffDays)} days overdue`;
  }
  if (diffDays === -1 || (diffDays === 0 && diffHours < 0)) {
    if (diffHours >= -24) {
      return `${Math.abs(diffHours)} hours overdue`;
    }
    return 'Yesterday';
  }
  if (diffDays === 0) {
    if (diffHours <= 1) {
      return 'Due soon';
    }
    return `Due in ${diffHours} hours`;
  }
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  if (diffDays <= 7) {
    return `In ${diffDays} days`;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Format full date for detail view
 */
const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get status icon for task
 */
const getStatusIcon = (task: TaskItem): React.ReactNode => {
  if (task.isOverdue) {
    return <Warning16Regular />;
  }
  if (task.status === 'inProgress') {
    return <ArrowCircleRight16Regular />;
  }
  if (task.status === 'completed') {
    return <CheckmarkCircle16Regular />;
  }
  return <Clock16Regular />;
};

/**
 * Get status label
 */
const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case 'inProgress':
      return 'In Progress';
    case 'notStarted':
      return 'Not Started';
    case 'completed':
      return 'Completed';
    case 'deferred':
      return 'Deferred';
    default:
      return status;
  }
};

/**
 * Get importance label and color
 */
const getImportanceInfo = (importance: string): { label: string; color: 'danger' | 'warning' | 'informative' } => {
  switch (importance) {
    case 'high':
      return { label: 'High Priority', color: 'danger' };
    case 'normal':
      return { label: 'Normal', color: 'informative' };
    case 'low':
      return { label: 'Low Priority', color: 'warning' };
    default:
      return { label: importance, color: 'informative' };
  }
};

// ============================================
// Component
// ============================================
export const MyTasksCardLarge: React.FC<MyTasksCardLargeProps> = ({
  context,
  settings = DEFAULT_MY_TASKS_SETTINGS,
  dataMode = 'api',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedTask, setSelectedTask] = useState<TaskItem | undefined>(undefined);

  // Test data state
  const [testData, setTestData] = useState<MyTasksData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // AI demo mode state
  const [aiCardSummary, setAiCardSummary] = useState<IAICardSummary | null>(null);
  const [aiInsights, setAiInsights] = useState<IAIInsight[]>([]);
  const [showAiOnboarding, setShowAiOnboarding] = useState(false);

  // Load AI demo data when enabled
  React.useEffect(() => {
    if (aiDemoMode) {
      setAiCardSummary(getAITasksCardSummary());
      setAiInsights(getAllTasksInsights());
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // Load test data
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestMyTasksData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook
  const apiHook = useMyTasks(context, settings);

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestMyTasksData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Get tasks (optionally grouped)
  const tasks = useMemo(() => {
    if (!data) return [];
    return data.tasks;
  }, [data]);

  // Auto-select first task
  React.useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      // Select first overdue task, or first in-progress, or just first
      const overdueTask = tasks.find(t => t.isOverdue);
      const inProgressTask = tasks.find(t => t.status === 'inProgress');
      setSelectedTask(overdueTask || inProgressTask || tasks[0]);
    }
  }, [tasks, selectedTask]);

  const handleSelectTask = useCallback((task: TaskItem): void => {
    setSelectedTask(task);
  }, []);

  // Render master item
  const renderMasterItem = (task: TaskItem, isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        <div
          className={`${styles.statusIcon} ${
            task.isOverdue
              ? styles.statusIconOverdue
              : task.status === 'inProgress'
              ? styles.statusIconInProgress
              : task.status === 'completed'
              ? styles.statusIconCompleted
              : styles.statusIconNormal
          }`}
        >
          {getStatusIcon(task)}
        </div>
        <div className={styles.taskInfo}>
          <Text
            className={`${styles.taskTitle} ${task.isOverdue ? styles.taskTitleOverdue : ''}`}
          >
            {task.title}
          </Text>
          <div className={styles.taskMeta}>
            {task.dueDateTime && (
              <span
                className={`${styles.dueDateText} ${
                  task.isOverdue ? styles.dueDateOverdue : ''
                }`}
              >
                <Clock16Regular style={{ fontSize: '12px' }} />
                {formatDueDate(task.dueDateTime)}
              </span>
            )}
            <span>{task.listName}</span>
          </div>
        </div>
        {task.importance === 'high' && (
          <Badge
            appearance="tint"
            color="danger"
            size="small"
            className={styles.importanceBadge}
          >
            !
          </Badge>
        )}
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (task: TaskItem): React.ReactNode => {
    const importanceInfo = getImportanceInfo(task.importance);

    return (
      <>
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{task.title}</Text>
          <div className={styles.detailBadges}>
            <Badge
              appearance="filled"
              color={task.isOverdue ? 'danger' : task.status === 'inProgress' ? 'brand' : 'informative'}
            >
              {task.isOverdue ? 'Overdue' : getStatusLabel(task.status)}
            </Badge>
            <Badge appearance="tint" color={importanceInfo.color}>
              {importanceInfo.label}
            </Badge>
          </div>
        </div>

        <div className={styles.detailSection}>
          <Text className={styles.detailSectionTitle}>Details</Text>

          {task.dueDateTime && (
            <div className={styles.detailRow}>
              <Calendar16Regular className={styles.detailIcon} />
              <Text>
                Due: {formatFullDate(task.dueDateTime)}
                {task.isOverdue && (
                  <Badge appearance="tint" color="danger" size="small" style={{ marginLeft: '8px' }}>
                    Overdue
                  </Badge>
                )}
              </Text>
            </div>
          )}

          <div className={styles.detailRow}>
            <Folder16Regular className={styles.detailIcon} />
            <Text>List: {task.listName}</Text>
          </div>

          <div className={styles.detailRow}>
            <Flag16Regular className={styles.detailIcon} />
            <Text>Priority: {importanceInfo.label}</Text>
          </div>
        </div>

        {task.body && (
          <>
            <Divider />
            <div className={styles.detailSection} style={{ marginTop: tokens.spacingVerticalL }}>
              <Text className={styles.detailSectionTitle}>Notes</Text>
              <Text className={styles.detailBody}>{task.body}</Text>
            </div>
          </>
        )}

        {task.createdDateTime && (
          <div className={styles.detailSection}>
            <Text className={styles.detailSectionTitle}>Activity</Text>
            <div className={styles.detailRow}>
              <Text style={{ color: tokens.colorNeutralForeground3 }}>
                Created: {task.createdDateTime.toLocaleDateString()}
              </Text>
            </div>
            {task.lastModifiedDateTime && (
              <div className={styles.detailRow}>
                <Text style={{ color: tokens.colorNeutralForeground3 }}>
                  Modified: {task.lastModifiedDateTime.toLocaleDateString()}
                </Text>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  // Render detail actions
  const renderDetailActions = (task: TaskItem): React.ReactNode => {
    return (
      <>
        {task.webUrl && (
          <Button
            appearance="primary"
            onClick={() => window.open(task.webUrl, '_blank')}
          >
            Open in To Do
          </Button>
        )}
        <Button appearance="secondary">Mark Complete</Button>
      </>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => (
    <>
      <TaskListSquareLtr24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>Select a task to view details</Text>
    </>
  );

  // Render empty state
  const renderEmptyState = (): React.ReactNode => (
    <>
      <TaskListSquareLtr24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>No tasks to display</Text>
    </>
  );

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
      <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
    </div>
  );

  return (
    <>
      <MasterDetailCard
        items={tasks}
        selectedItem={selectedTask}
        onItemSelect={handleSelectTask}
        getItemKey={(task: TaskItem) => task.id}
        renderMasterItem={renderMasterItem}
        renderDetailContent={renderDetailContent}
        renderDetailActions={renderDetailActions}
        renderEmptyDetail={renderEmptyDetail}
        renderEmptyState={renderEmptyState}
        icon={<TaskListSquareLtr24Regular />}
        title="My Tasks"
        itemCount={data?.totalCount}
        loading={isLoading && !data}
        error={error?.message}
        emptyMessage="No tasks to display"
        emptyIcon={<TaskListSquareLtr24Regular />}
        headerActions={headerActions}
        headerContent={aiDemoMode && aiCardSummary ? (
          <AIInsightBanner
            summary={aiCardSummary}
            insights={aiInsights}
            onLearnMore={handleAiLearnMore}
          />
        ) : undefined}
      />

      {/* AI Onboarding Dialog */}
      <AIOnboardingDialog
        open={showAiOnboarding}
        onClose={() => setShowAiOnboarding(false)}
      />
    </>
  );
};

export default MyTasksCardLarge;
