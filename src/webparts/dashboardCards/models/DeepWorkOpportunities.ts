// Card #12 — DeepWorkOpportunities data model

import { CardUrgencyState } from './ApprovalBottlenecks';

// ============================================
// Deep Work Block
// ============================================

export interface DeepWorkBlock {
  id: string;
  date: Date;
  dayLabel: string;
  start: Date;
  end: Date;
  durationMinutes: number;
  quality: 'gold' | 'silver' | 'bronze';
  adjacentBefore?: string;
  adjacentAfter?: string;
}

// ============================================
// Aggregated Data
// ============================================

export interface DeepWorkOpportunitiesData {
  blocks: DeepWorkBlock[];
  stats: {
    totalDeepWorkMinutes: number;
    goldBlockCount: number;
    silverBlockCount: number;
    bronzeBlockCount: number;
    bestDay: string;
    longestBlock: number;
    daysWithNoBlocks: number;
  };
  dailyBreakdown: { day: string; totalMinutes: number; blockCount: number }[];
}

// ============================================
// Urgency Computation
// ============================================

export function computeDeepWorkUrgency(data: DeepWorkOpportunitiesData | null): CardUrgencyState {
  if (!data) return 'quiet';
  if (data.stats.goldBlockCount === 0 && data.stats.daysWithNoBlocks >= 3) return 'critical';
  if (data.stats.goldBlockCount <= 1) return 'warning';
  if (data.stats.totalDeepWorkMinutes < 300) return 'active';
  return 'quiet';
}
