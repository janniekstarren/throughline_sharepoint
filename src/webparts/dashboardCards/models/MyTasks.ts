// ============================================
// MyTasks Card - Data Models
// ============================================

import { TrendDataPoint } from '../components/shared/charts';

/**
 * Task importance/priority level
 */
export type TaskImportance = 'low' | 'normal' | 'high';

/**
 * Task status
 */
export type TaskStatus = 'notStarted' | 'inProgress' | 'completed' | 'deferred';

/**
 * Individual task item interface
 */
export interface TaskItem {
  /** Unique task identifier */
  id: string;
  /** Task title/name */
  title: string;
  /** Current task status */
  status: TaskStatus;
  /** Task importance level */
  importance: TaskImportance;
  /** Due date and time (optional) */
  dueDateTime?: Date;
  /** Name of the list/plan the task belongs to */
  listName: string;
  /** Whether the task is past due */
  isOverdue: boolean;
  /** Web URL to open the task */
  webUrl?: string;
  /** Task body/notes (optional) */
  body?: string;
  /** Date the task was created */
  createdDateTime?: Date;
  /** Date the task was last modified */
  lastModifiedDateTime?: Date;
}

/**
 * Aggregated data for the MyTasks card
 */
export interface MyTasksData {
  /** Array of task items */
  tasks: TaskItem[];
  /** Total number of tasks */
  totalCount: number;
  /** Number of overdue tasks */
  overdueCount: number;
  /** Number of in-progress tasks */
  inProgressCount: number;
  /** Number of high importance tasks */
  highPriorityCount: number;
  /** Number of tasks due today */
  dueTodayCount: number;
}

/**
 * Trend data for the tasks chart
 */
export interface TasksTrendData {
  /** Data points for the trend chart (7 days) */
  dataPoints: TrendDataPoint[];
  /** Trend direction based on completion rate */
  trend: 'improving' | 'worsening' | 'stable';
  /** Average tasks completed per day */
  averageCompletedPerDay: number;
}

/**
 * Settings interface for the MyTasks card
 */
export interface IMyTasksSettings {
  /** Whether the card is enabled */
  enabled: boolean;
  /** Maximum number of tasks to display */
  maxItems: number;
  /** Whether to show overdue tasks */
  showOverdue: boolean;
  /** Whether to show in-progress tasks */
  showInProgress: boolean;
  /** Whether to show completed tasks */
  showCompleted: boolean;
  /** Filter by importance (null = show all) */
  importanceFilter: TaskImportance | null;
  /** Group tasks by status in large view */
  groupByStatus: boolean;
}

/**
 * Default settings for the MyTasks card
 */
export const DEFAULT_MY_TASKS_SETTINGS: IMyTasksSettings = {
  enabled: true,
  maxItems: 10,
  showOverdue: true,
  showInProgress: true,
  showCompleted: false,
  importanceFilter: null,
  groupByStatus: true,
};

/**
 * Status group for grouped task display
 */
export interface TaskStatusGroup {
  /** Status identifier */
  status: TaskStatus;
  /** Display label for the status */
  label: string;
  /** Tasks in this status group */
  tasks: TaskItem[];
  /** Count of tasks in this group */
  count: number;
}
