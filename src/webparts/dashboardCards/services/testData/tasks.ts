// ============================================
// Test Data - Tasks
// ============================================

import { ITaskItem } from '../GraphService';

/**
 * Generate test task items
 */
export function getTestTasks(): ITaskItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysFromNow = (days: number): Date => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date;
  };

  return [
    {
      id: 'test-task-1',
      title: 'Complete quarterly report',
      status: 'notStarted',
      importance: 'high',
      dueDateTime: daysFromNow(1),
      listName: 'Work Tasks',
      isOverdue: false,
    },
    {
      id: 'test-task-2',
      title: 'Review pull requests for feature branch',
      status: 'inProgress',
      importance: 'normal',
      dueDateTime: daysFromNow(0),
      listName: 'Development',
      isOverdue: false,
    },
    {
      id: 'test-task-3',
      title: 'Prepare presentation slides for client demo',
      status: 'notStarted',
      importance: 'high',
      dueDateTime: daysFromNow(-1),
      listName: 'Work Tasks',
      isOverdue: true,
    },
    {
      id: 'test-task-4',
      title: 'Update project documentation',
      status: 'notStarted',
      importance: 'normal',
      dueDateTime: daysFromNow(3),
      listName: 'Documentation',
      isOverdue: false,
    },
    {
      id: 'test-task-5',
      title: 'Schedule team retrospective meeting',
      status: 'notStarted',
      importance: 'normal',
      listName: 'Team Management',
      isOverdue: false,
    },
    {
      id: 'test-task-6',
      title: 'Fix accessibility issues on dashboard',
      status: 'inProgress',
      importance: 'high',
      dueDateTime: daysFromNow(-2),
      listName: 'Development',
      isOverdue: true,
    },
    {
      id: 'test-task-7',
      title: 'Submit expense reports',
      status: 'notStarted',
      importance: 'normal',
      dueDateTime: daysFromNow(5),
      listName: 'Personal',
      isOverdue: false,
    },
    {
      id: 'test-task-8',
      title: 'Review vendor proposals',
      status: 'notStarted',
      importance: 'normal',
      dueDateTime: daysFromNow(2),
      listName: 'Work Tasks',
      isOverdue: false,
    },
    {
      id: 'test-task-9',
      title: 'Update security patches',
      status: 'notStarted',
      importance: 'high',
      dueDateTime: daysFromNow(0),
      listName: 'Development',
      isOverdue: false,
    },
    {
      id: 'test-task-10',
      title: 'Plan team building activity',
      status: 'notStarted',
      importance: 'normal',
      dueDateTime: daysFromNow(7),
      listName: 'Team Management',
      isOverdue: false,
    },
  ];
}
