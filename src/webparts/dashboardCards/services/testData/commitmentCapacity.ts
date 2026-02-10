// ============================================
// Commitment vs Capacity - Demo/Test Data
// ============================================
// Deterministic demo data for Card #69.
// All dates relative to now for realistic display.

import {
  CommitmentCapacityData,
  CapacityWeek,
  TaskCommitment,
} from '../../models/CommitmentCapacity';

// ============================================
// Helpers
// ============================================

function weekStart(weeksFromNow: number): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Go to Monday of current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  // Offset by weeks
  monday.setDate(monday.getDate() + weeksFromNow * 7);
  return monday;
}

function dueDate(weeksFromNow: number, dayOffset: number): Date {
  const start = weekStart(weeksFromNow);
  start.setDate(start.getDate() + dayOffset);
  return start;
}

// ============================================
// Generator
// ============================================

export function generateCommitmentCapacityDemoData(): CommitmentCapacityData {
  const now = new Date();

  // ---- Current Week: Overcommitted (32 committed vs 24 available) ----
  const currentWeekTasks: TaskCommitment[] = [
    {
      id: 'task-c01',
      title: 'Finalize Q1 board deck',
      source: 'planner',
      estimatedHours: 8,
      dueDate: dueDate(0, 3),
      projectName: 'Executive Reporting',
      priority: 'urgent',
      percentComplete: 40,
    },
    {
      id: 'task-c02',
      title: 'Review API gateway design doc',
      source: 'planner',
      estimatedHours: 4,
      dueDate: dueDate(0, 2),
      projectName: 'Platform Migration',
      priority: 'important',
      percentComplete: 10,
    },
    {
      id: 'task-c03',
      title: 'Prepare 1:1 talking points (5 reports)',
      source: 'todo',
      estimatedHours: 3,
      projectName: 'People Management',
      priority: 'normal',
      percentComplete: 60,
    },
    {
      id: 'task-c04',
      title: 'Client proposal — Acme Corp renewal',
      source: 'planner',
      estimatedHours: 6,
      dueDate: dueDate(0, 4),
      projectName: 'Sales',
      priority: 'urgent',
      percentComplete: 20,
    },
    {
      id: 'task-c05',
      title: 'Budget variance analysis',
      source: 'inferred',
      estimatedHours: 5,
      dueDate: dueDate(0, 3),
      projectName: 'Finance',
      priority: 'important',
      percentComplete: 0,
    },
    {
      id: 'task-c06',
      title: 'Onboarding plan — new hire (Sarah)',
      source: 'todo',
      estimatedHours: 6,
      dueDate: dueDate(0, 4),
      projectName: 'People Management',
      priority: 'normal',
      percentComplete: 15,
    },
  ];

  const currentWeek: CapacityWeek = {
    weekLabel: 'This Week',
    startDate: weekStart(0),
    availableHours: 24,
    committedHours: 32,
    ratio: 1.33,
    status: 'overcommitted',
    tasks: currentWeekTasks,
    meetingHours: 16,
  };

  // ---- Next Week: Stretched (28 committed vs 26 available) ----
  const nextWeekTasks: TaskCommitment[] = [
    {
      id: 'task-n01',
      title: 'Sprint retrospective facilitation',
      source: 'planner',
      estimatedHours: 3,
      dueDate: dueDate(1, 0),
      projectName: 'Engineering',
      priority: 'normal',
      percentComplete: 0,
    },
    {
      id: 'task-n02',
      title: 'Vendor contract review — DataViz Ltd',
      source: 'planner',
      estimatedHours: 5,
      dueDate: dueDate(1, 2),
      projectName: 'Procurement',
      priority: 'important',
      percentComplete: 0,
    },
    {
      id: 'task-n03',
      title: 'Quarterly OKR progress update',
      source: 'todo',
      estimatedHours: 4,
      dueDate: dueDate(1, 3),
      projectName: 'Strategy',
      priority: 'important',
      percentComplete: 0,
    },
    {
      id: 'task-n04',
      title: 'Team lunch & learn prep',
      source: 'todo',
      estimatedHours: 2,
      projectName: 'Culture',
      priority: 'low',
      percentComplete: 0,
    },
    {
      id: 'task-n05',
      title: 'Performance review drafts (3 reports)',
      source: 'planner',
      estimatedHours: 8,
      dueDate: dueDate(1, 4),
      projectName: 'People Management',
      priority: 'urgent',
      percentComplete: 0,
    },
    {
      id: 'task-n06',
      title: 'Security audit follow-up items',
      source: 'inferred',
      estimatedHours: 6,
      dueDate: dueDate(1, 3),
      projectName: 'Compliance',
      priority: 'important',
      percentComplete: 0,
    },
  ];

  const nextWeek: CapacityWeek = {
    weekLabel: 'Next Week',
    startDate: weekStart(1),
    availableHours: 26,
    committedHours: 28,
    ratio: 1.08,
    status: 'stretched',
    tasks: nextWeekTasks,
    meetingHours: 14,
  };

  // ---- Week After: Balanced (20 committed vs 30 available) ----
  const weekAfterTasks: TaskCommitment[] = [
    {
      id: 'task-w01',
      title: 'Department all-hands prep',
      source: 'planner',
      estimatedHours: 4,
      dueDate: dueDate(2, 1),
      projectName: 'Leadership',
      priority: 'normal',
      percentComplete: 0,
    },
    {
      id: 'task-w02',
      title: 'Innovation day project planning',
      source: 'todo',
      estimatedHours: 3,
      projectName: 'Culture',
      priority: 'low',
      percentComplete: 0,
    },
    {
      id: 'task-w03',
      title: 'Mid-quarter forecast adjustments',
      source: 'planner',
      estimatedHours: 5,
      dueDate: dueDate(2, 3),
      projectName: 'Finance',
      priority: 'important',
      percentComplete: 0,
    },
    {
      id: 'task-w04',
      title: 'Cross-team sync agenda',
      source: 'todo',
      estimatedHours: 2,
      projectName: 'Collaboration',
      priority: 'normal',
      percentComplete: 0,
    },
    {
      id: 'task-w05',
      title: 'Process documentation update',
      source: 'inferred',
      estimatedHours: 6,
      dueDate: dueDate(2, 4),
      projectName: 'Operations',
      priority: 'normal',
      percentComplete: 0,
    },
  ];

  const weekAfter: CapacityWeek = {
    weekLabel: 'In 2 Weeks',
    startDate: weekStart(2),
    availableHours: 30,
    committedHours: 20,
    ratio: 0.67,
    status: 'balanced',
    tasks: weekAfterTasks,
    meetingHours: 10,
  };

  // Estimated clear date: ~3 weeks from now
  const estimatedClearDate = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

  // Trend data — commitment ratio over past weeks
  const trendData = [
    { date: 'Week -4', value: 0.95 },
    { date: 'Week -3', value: 1.05 },
    { date: 'Week -2', value: 1.18 },
    { date: 'Week -1', value: 1.25 },
    { date: 'This Week', value: 1.33 },
    { date: 'Next Week', value: 1.08 },
    { date: 'In 2 Weeks', value: 0.67 },
  ];

  return {
    currentWeek,
    nextWeek,
    weekAfter,
    stats: {
      currentRatio: 1.33,
      trendDirection: 'worsening',
      totalOpenTasks: 18,
      overdueTasks: 3,
      estimatedClearDate,
    },
    trendData,
  };
}
