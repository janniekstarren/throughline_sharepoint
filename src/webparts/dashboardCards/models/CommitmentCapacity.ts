// Card #69 — CommitmentCapacity data model

import { CardUrgencyState } from './ApprovalBottlenecks';

// ============================================
// Task Commitment
// ============================================

export interface TaskCommitment {
  id: string;
  title: string;
  source: 'planner' | 'todo' | 'inferred';
  estimatedHours: number;
  dueDate?: Date;
  projectName?: string;
  priority: 'urgent' | 'important' | 'normal' | 'low';
  percentComplete: number;
}

// ============================================
// Capacity Week
// ============================================

export interface CapacityWeek {
  weekLabel: string;
  startDate: Date;
  availableHours: number;
  committedHours: number;
  ratio: number;
  status: 'under' | 'balanced' | 'stretched' | 'overcommitted';
  tasks: TaskCommitment[];
  meetingHours: number;
}

// ============================================
// Aggregated Data
// ============================================

export interface CommitmentCapacityData {
  currentWeek: CapacityWeek;
  nextWeek: CapacityWeek;
  weekAfter: CapacityWeek;
  stats: {
    currentRatio: number;
    trendDirection: 'improving' | 'worsening' | 'stable';
    totalOpenTasks: number;
    overdueTasks: number;
    estimatedClearDate: Date;
  };
  trendData: { date: string; value: number }[];
}

// ============================================
// Urgency Computation
// ============================================

export function computeCommitmentCapacityUrgency(data: CommitmentCapacityData | null): CardUrgencyState {
  if (!data) return 'quiet';
  if (data.currentWeek.ratio > 1.5 || data.stats.overdueTasks >= 5) return 'critical';
  if (data.currentWeek.ratio > 1.2 || data.stats.overdueTasks >= 2) return 'warning';
  if (data.currentWeek.ratio > 1.0) return 'active';
  return 'quiet';
}
