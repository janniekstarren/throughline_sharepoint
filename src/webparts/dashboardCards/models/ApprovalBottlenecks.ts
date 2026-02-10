// ============================================
// ApprovalBottlenecks - Data Models
// ============================================
// Card #2: "What decisions am I holding up?"
// Surfaces pending approvals the user hasn't actioned.

import { Person, UrgencyFactor } from './WaitingOnYou';

// ============================================
// Core Types
// ============================================

export type ApprovalType =
  | 'document-approval'
  | 'expense-report'
  | 'purchase-order'
  | 'leave-request'
  | 'access-request'
  | 'workflow-step'
  | 'planner-approval'
  | 'custom';

// ============================================
// Pending Approval
// ============================================

export interface PendingApproval {
  id: string;
  title: string;
  requestor: Person;
  requestedDateTime: Date;
  waitDurationHours: number;
  type: ApprovalType;
  urgencyScore: number;
  urgencyFactors: UrgencyFactor[];
  sourceUrl: string;
  associatedDocument?: string;
  amount?: number;
  currency?: string;
  isOverdue: boolean;
  statedDeadline?: Date;
  delegatable: boolean;
  blockedPeopleCount: number;
  blockedItems?: string[];
}

// ============================================
// Aggregated Data
// ============================================

export interface ApprovalBottlenecksStats {
  totalPending: number;
  overdueCount: number;
  avgWaitHours: number;
  oldestWaitHours: number;
  blockedPeopleTotal: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface ApprovalBottlenecksData {
  pendingApprovals: PendingApproval[];
  stats: ApprovalBottlenecksStats;
  trendData: TrendDataPoint[];
}

// ============================================
// Urgency Computation
// ============================================

export type CardUrgencyState = 'critical' | 'warning' | 'active' | 'quiet';

export function computeApprovalUrgency(data: ApprovalBottlenecksData | null): CardUrgencyState {
  if (!data || data.stats.totalPending === 0) return 'quiet';
  if (data.stats.overdueCount >= 2 || data.stats.oldestWaitHours > 96) return 'critical';
  if (data.stats.overdueCount >= 1 || data.stats.totalPending >= 4) return 'warning';
  if (data.stats.totalPending >= 1) return 'active';
  return 'quiet';
}
