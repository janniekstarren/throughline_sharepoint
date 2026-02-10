// ============================================
// ContextualActions - Data Models
// ============================================
// Card #66: "What should I do next?"
// Meta-card that aggregates the top impactful actions
// from all other cards' data. Does NOT call Graph APIs.

// ============================================
// Core Types
// ============================================

export type ActionSource =
  | 'stale-conversations'
  | 'approval-bottlenecks'
  | 'broken-promises'
  | 'meeting-prep'
  | 'unread-from-vips'
  | 'pre-meeting-conflicts'
  | 'waiting-on-external'
  | 'my-urgent-items'
  | 'cross-project-dependencies';

export type ActionUrgency = 'critical' | 'warning' | 'info' | 'positive';

export type ActionType =
  | 'reply'
  | 'approve'
  | 'review'
  | 'prepare'
  | 'follow-up'
  | 'resolve'
  | 'complete-task'
  | 'delegate';

// ============================================
// Suggested Action
// ============================================

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  source: ActionSource;
  sourceCardName: string;
  urgency: ActionUrgency;
  priorityScore: number; // 1-10
  estimatedMinutes: number;
  actionType: ActionType;
  webUrl?: string;
  personContext?: string; // e.g. "From David Kim (CFO)"
  timeContext?: string;   // e.g. "3 days overdue"
}

// ============================================
// Aggregated Data
// ============================================

export interface ContextualActionsStats {
  totalActions: number;
  criticalCount: number;
  warningCount: number;
  totalEstimatedMinutes: number;
  topSourceCard: string;
}

export interface ContextualActionsData {
  actions: SuggestedAction[];
  stats: ContextualActionsStats;
}

// ============================================
// Urgency Computation
// ============================================

export type CardUrgencyState = 'critical' | 'warning' | 'active' | 'quiet';

export function computeContextualActionsUrgency(data: ContextualActionsData | null): CardUrgencyState {
  if (!data || data.stats.totalActions === 0) return 'quiet';
  if (data.stats.criticalCount >= 2) return 'critical';
  if (data.stats.criticalCount >= 1 || data.stats.warningCount >= 3) return 'warning';
  if (data.stats.totalActions >= 1) return 'active';
  return 'quiet';
}
