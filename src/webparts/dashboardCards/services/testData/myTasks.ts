// ============================================
// MyTasks Test Data - Mock Data for Development
// ============================================

import {
  MyTasksData,
  TaskItem,
  TaskStatus,
  TasksTrendData,
} from '../../models/MyTasks';
import { TrendDataPoint } from '../../components/shared/charts';

/**
 * Generate test tasks data
 * Creates dynamic dates based on current time
 */
export const getTestMyTasksData = (): MyTasksData => {
  const now = new Date();

  const createDueDate = (daysOffset: number, hours: number = 17): Date => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hours, 0, 0, 0);
    return date;
  };

  const tasks: TaskItem[] = [
    // Overdue tasks
    {
      id: 'test-task-1',
      title: 'Review Q4 budget proposal',
      status: 'notStarted',
      importance: 'high',
      dueDateTime: createDueDate(-2),
      listName: 'Work',
      isOverdue: true,
      body: 'Need to review and provide feedback on the Q4 budget proposal from the finance team.',
      createdDateTime: createDueDate(-5),
    },
    {
      id: 'test-task-2',
      title: 'Send weekly status report',
      status: 'inProgress',
      importance: 'high',
      dueDateTime: createDueDate(-1),
      listName: 'Work',
      isOverdue: true,
      createdDateTime: createDueDate(-3),
    },
    // In-progress tasks
    {
      id: 'test-task-3',
      title: 'Complete project documentation',
      status: 'inProgress',
      importance: 'normal',
      dueDateTime: createDueDate(1),
      listName: 'Project Alpha',
      isOverdue: false,
      body: 'Update the technical documentation for the new API endpoints.',
      createdDateTime: createDueDate(-7),
    },
    {
      id: 'test-task-4',
      title: 'Prepare presentation slides',
      status: 'inProgress',
      importance: 'high',
      dueDateTime: createDueDate(2),
      listName: 'Meetings',
      isOverdue: false,
      createdDateTime: createDueDate(-2),
    },
    // Not started tasks
    {
      id: 'test-task-5',
      title: 'Schedule team meeting for next sprint',
      status: 'notStarted',
      importance: 'normal',
      dueDateTime: createDueDate(3),
      listName: 'Work',
      isOverdue: false,
      createdDateTime: createDueDate(-1),
    },
    {
      id: 'test-task-6',
      title: 'Update personal development goals',
      status: 'notStarted',
      importance: 'low',
      dueDateTime: createDueDate(7),
      listName: 'Personal',
      isOverdue: false,
      createdDateTime: createDueDate(-14),
    },
    {
      id: 'test-task-7',
      title: 'Code review for PR #1234',
      status: 'notStarted',
      importance: 'high',
      dueDateTime: createDueDate(0, 18), // Today at 6pm
      listName: 'Development',
      isOverdue: false,
      body: 'Review the pull request for the new authentication feature.',
      createdDateTime: createDueDate(-1),
    },
    {
      id: 'test-task-8',
      title: 'Order office supplies',
      status: 'notStarted',
      importance: 'low',
      dueDateTime: createDueDate(5),
      listName: 'Admin',
      isOverdue: false,
      createdDateTime: createDueDate(-3),
    },
    // Task without due date
    {
      id: 'test-task-9',
      title: 'Research new testing frameworks',
      status: 'notStarted',
      importance: 'normal',
      listName: 'Learning',
      isOverdue: false,
      body: 'Investigate Jest alternatives and new testing patterns.',
      createdDateTime: createDueDate(-10),
    },
    {
      id: 'test-task-10',
      title: 'Clean up old project files',
      status: 'deferred',
      importance: 'low',
      dueDateTime: createDueDate(14),
      listName: 'Admin',
      isOverdue: false,
      createdDateTime: createDueDate(-21),
    },
  ];

  // Calculate counts
  const overdueCount = tasks.filter(t => t.isOverdue).length;
  const inProgressCount = tasks.filter(t => t.status === 'inProgress').length;
  const highPriorityCount = tasks.filter(t => t.importance === 'high').length;

  // Calculate due today count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueTodayCount = tasks.filter(t => {
    if (!t.dueDateTime) return false;
    return t.dueDateTime >= today && t.dueDateTime < tomorrow;
  }).length;

  return {
    tasks,
    totalCount: tasks.length,
    overdueCount,
    inProgressCount,
    highPriorityCount,
    dueTodayCount,
  };
};

/**
 * Get tasks grouped by status for large card view
 */
export const getTestTasksByStatus = (): Map<TaskStatus, TaskItem[]> => {
  const data = getTestMyTasksData();
  const grouped = new Map<TaskStatus, TaskItem[]>();

  // Initialize groups
  grouped.set('inProgress', []);
  grouped.set('notStarted', []);
  grouped.set('deferred', []);
  grouped.set('completed', []);

  // Group tasks
  for (const task of data.tasks) {
    const group = grouped.get(task.status) || [];
    group.push(task);
    grouped.set(task.status, group);
  }

  return grouped;
};

/**
 * Generate trend data for task completion over the last 7 days
 */
export const getTestTasksTrendData = (): TasksTrendData => {
  const dataPoints: TrendDataPoint[] = [];
  const values: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Generate realistic completed task counts (1-6 tasks per day)
    const value = Math.floor(Math.random() * 6) + 1;
    values.push(value);

    dataPoints.push({
      date,
      value,
      label: 'completed',
    });
  }

  // Calculate trend based on first half vs second half average
  const firstHalf = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = values.slice(4).reduce((a, b) => a + b, 0) / 3;
  const diff = secondHalf - firstHalf;

  let trend: 'improving' | 'worsening' | 'stable';
  if (diff > 0.5) {
    trend = 'improving'; // More tasks completed recently
  } else if (diff < -0.5) {
    trend = 'worsening'; // Fewer tasks completed recently
  } else {
    trend = 'stable';
  }

  const averageCompletedPerDay = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    dataPoints,
    trend,
    averageCompletedPerDay: Math.round(averageCompletedPerDay * 10) / 10,
  };
};
