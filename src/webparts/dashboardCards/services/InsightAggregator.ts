/**
 * InsightAggregator - Generates ranked insights from all demo data sections
 *
 * Scans every section of the DemoDataset and produces a prioritised list
 * of AggregatedInsight objects, sorted by severity (Critical → Warning →
 * Info → Positive). These feed the Insights Rollup panel in the Hub.
 */

import {
  AggregatedInsight,
  InsightSeverity,
  InsightsSummary,
  severityOrder,
} from '../models/InsightRollup';
import { DemoDataset, DEMO_DATA } from '../config/demoData';

// ============================================
// Insight Generators (one per data section)
// ============================================

function generateWaitingInsights(data: DemoDataset): AggregatedInsight[] {
  const insights: AggregatedInsight[] = [];
  const now = new Date();

  // Manager waiting — critical
  if (data.waitingOnYou.managerWaitHours > 12) {
    insights.push({
      id: 'waiting-manager',
      severity: InsightSeverity.Critical,
      icon: '🔴',
      message: `Your manager has been waiting ${data.waitingOnYou.managerWaitHours} hours for a reply`,
      sourceCardId: 'stale-conversations',
      sourceCardName: 'Stale Conversations',
      category: 'Immediate Action',
      timestamp: now,
      action: { label: 'Reply now', target: 'card:stale-conversations' },
      relatedPersons: ['Alex Chen'],
    });
  }

  // Urgent items
  if (data.waitingOnYou.urgent > 1) {
    insights.push({
      id: 'waiting-urgent',
      severity: InsightSeverity.Critical,
      icon: '⏰',
      message: `${data.waitingOnYou.urgent} urgent conversations need your reply`,
      sourceCardId: 'stale-conversations',
      sourceCardName: 'Stale Conversations',
      category: 'Immediate Action',
      timestamp: now,
      action: { label: 'View all', target: 'card:stale-conversations' },
    });
  }

  // Total waiting
  if (data.waitingOnYou.total > 3) {
    insights.push({
      id: 'waiting-total',
      severity: InsightSeverity.Warning,
      icon: '💬',
      message: `${data.waitingOnYou.total} people are waiting on you across channels`,
      sourceCardId: 'stale-conversations',
      sourceCardName: 'Stale Conversations',
      category: 'Immediate Action',
      timestamp: now,
    });
  }

  return insights;
}

function generateFocusInsights(data: DemoDataset): AggregatedInsight[] {
  const insights: AggregatedInsight[] = [];
  const now = new Date();

  // Low focus score
  if (data.focus.score < 50) {
    insights.push({
      id: 'focus-low',
      severity: InsightSeverity.Warning,
      icon: '🎯',
      message: `Focus score is ${data.focus.score}/100 — ${data.focus.assessment}`,
      sourceCardId: 'focus-time-defender',
      sourceCardName: 'Focus Time Defender',
      category: 'Productivity Patterns',
      timestamp: now,
      action: { label: 'View details', target: 'card:focus-time-defender' },
    });
  }

  // High context switches
  if (data.focus.switchCount > 25) {
    insights.push({
      id: 'focus-switches',
      severity: InsightSeverity.Warning,
      icon: '🔄',
      message: `${data.focus.switchCount} context switches today — ${data.focus.vsAverage} your average`,
      sourceCardId: 'context-switch-counter',
      sourceCardName: 'Context Switch Counter',
      category: 'Productivity Patterns',
      timestamp: now,
    });
  }

  // Biggest interrupter
  if (data.focus.interrupterCount > 10) {
    insights.push({
      id: 'focus-interrupter',
      severity: InsightSeverity.Info,
      icon: '📵',
      message: `${data.focus.biggestInterrupter}: ${data.focus.interrupterCount} interruptions today`,
      sourceCardId: 'context-switch-counter',
      sourceCardName: 'Context Switch Counter',
      category: 'Productivity Patterns',
      timestamp: now,
    });
  }

  // Deep work opportunity
  if (data.focus.deepWorkBlocks >= 1) {
    insights.push({
      id: 'focus-best-window',
      severity: InsightSeverity.Positive,
      icon: '🧘',
      message: `Best focus window: ${data.focus.bestFocusWindow}`,
      sourceCardId: 'focus-time-defender',
      sourceCardName: 'Focus Time Defender',
      category: 'Productivity Patterns',
      timestamp: now,
    });
  }

  return insights;
}

function generatePromiseInsights(data: DemoDataset): AggregatedInsight[] {
  const insights: AggregatedInsight[] = [];
  const now = new Date();

  // Overdue promises
  if (data.promises.overdue > 0) {
    insights.push({
      id: 'promises-overdue',
      severity: InsightSeverity.Critical,
      icon: '🔥',
      message: `${data.promises.overdue} commitments are overdue`,
      sourceCardId: 'broken-promises',
      sourceCardName: 'Broken Promises',
      category: 'Immediate Action',
      timestamp: now,
      action: { label: 'Review', target: 'card:broken-promises' },
      relatedPersons: data.promises.items
        .filter(i => i.daysOverdue > 0)
        .map(i => i.promisedTo),
    });
  }

  // At-risk promises
  if (data.promises.atRisk > 0) {
    insights.push({
      id: 'promises-at-risk',
      severity: InsightSeverity.Warning,
      icon: '⚠️',
      message: `${data.promises.atRisk} commitments are at risk of slipping`,
      sourceCardId: 'broken-promises',
      sourceCardName: 'Broken Promises',
      category: 'Immediate Action',
      timestamp: now,
    });
  }

  // Over-committed
  if (data.promises.capacityRatio > 100) {
    insights.push({
      id: 'promises-capacity',
      severity: InsightSeverity.Warning,
      icon: '📊',
      message: `You're ${data.promises.capacityAssessment} (${data.promises.capacityRatio}% capacity)`,
      sourceCardId: 'commitment-vs-capacity',
      sourceCardName: 'Commitment vs. Capacity',
      category: 'Productivity Patterns',
      timestamp: now,
    });
  }

  // On-track count (positive)
  if (data.promises.onTrack > 5) {
    insights.push({
      id: 'promises-on-track',
      severity: InsightSeverity.Positive,
      icon: '✅',
      message: `${data.promises.onTrack} commitments are on track`,
      sourceCardId: 'broken-promises',
      sourceCardName: 'Broken Promises',
      category: 'Immediate Action',
      timestamp: now,
    });
  }

  return insights;
}

function generateMeetingInsights(data: DemoDataset): AggregatedInsight[] {
  const insights: AggregatedInsight[] = [];
  const now = new Date();

  // Low free time
  if (data.meetings.freeTimeMinutes < 60) {
    insights.push({
      id: 'meetings-packed',
      severity: InsightSeverity.Critical,
      icon: '📅',
      message: `Only ${data.meetings.freeTimeMinutes} minutes free tomorrow — ${data.meetings.tomorrowCount} meetings (${data.meetings.tomorrowHours}hrs)`,
      sourceCardId: 'meeting-roi-tracker',
      sourceCardName: 'Meeting ROI Tracker',
      category: 'Productivity Patterns',
      timestamp: now,
      action: { label: 'View calendar', target: 'card:meeting-roi-tracker' },
    });
  }

  // Unprepared meetings
  if (data.meetings.unpreparedCount > 0) {
    insights.push({
      id: 'meetings-unprepped',
      severity: InsightSeverity.Warning,
      icon: '⚠️',
      message: `${data.meetings.unpreparedCount} meetings tomorrow have no preparation`,
      sourceCardId: 'meeting-preparation-gap',
      sourceCardName: 'Meeting Preparation Gap',
      category: 'Immediate Action',
      timestamp: now,
      action: { label: 'Prepare', target: 'card:meeting-preparation-gap' },
    });
  }

  // No agenda meetings
  if (data.meetings.noAgendaCount > 0) {
    insights.push({
      id: 'meetings-no-agenda',
      severity: InsightSeverity.Info,
      icon: '📋',
      message: `${data.meetings.noAgendaCount} meetings have no agenda set`,
      sourceCardId: 'meeting-preparation-gap',
      sourceCardName: 'Meeting Preparation Gap',
      category: 'Immediate Action',
      timestamp: now,
    });
  }

  // Heavy meeting week
  if (data.meetings.weekHours > 15) {
    insights.push({
      id: 'meetings-week-heavy',
      severity: InsightSeverity.Warning,
      icon: '📊',
      message: `${data.meetings.weekHours}hrs of meetings this week — ${data.meetings.recurringPct}% recurring`,
      sourceCardId: 'meeting-roi-tracker',
      sourceCardName: 'Meeting ROI Tracker',
      category: 'Productivity Patterns',
      timestamp: now,
    });
  }

  return insights;
}

function generateCollaborationInsights(data: DemoDataset): AggregatedInsight[] {
  const insights: AggregatedInsight[] = [];
  const now = new Date();

  // Cold relationships
  if (data.collaboration.coldRelationships > 3) {
    insights.push({
      id: 'collab-cold',
      severity: InsightSeverity.Warning,
      icon: '🥶',
      message: `${data.collaboration.coldRelationships} relationships are going cold`,
      sourceCardId: 'communication-debt',
      sourceCardName: 'Communication Debt',
      category: 'Collaboration Health',
      timestamp: now,
      action: { label: 'Review', target: 'card:communication-debt' },
      relatedPersons: data.collaboration.coldPeople.map(p => p.name),
    });
  }

  // Highlight (Sarah Chen)
  if (data.collaboration.highlight) {
    insights.push({
      id: 'collab-highlight',
      severity: InsightSeverity.Warning,
      icon: '💬',
      message: data.collaboration.highlight,
      sourceCardId: 'network-drift',
      sourceCardName: 'Network Drift',
      category: 'Collaboration Health',
      timestamp: now,
      relatedPersons: ['Sarah Chen'],
    });
  }

  // One-way conversations
  if (data.collaboration.oneWayCount > 0) {
    insights.push({
      id: 'collab-one-way',
      severity: InsightSeverity.Info,
      icon: '📢',
      message: `${data.collaboration.oneWayCount} conversations where you're the only one contributing`,
      sourceCardId: 'one-way-conversations',
      sourceCardName: 'One-Way Conversations',
      category: 'Collaboration Health',
      timestamp: now,
    });
  }

  return insights;
}

function generateTeamInsights(data: DemoDataset): AggregatedInsight[] {
  const insights: AggregatedInsight[] = [];
  const now = new Date();

  // Overloaded team members
  if (data.team.overloadedCount > 0) {
    const overloaded = data.team.members.filter(m => m.status === 'overloaded');
    insights.push({
      id: 'team-overloaded',
      severity: InsightSeverity.Critical,
      icon: '🔥',
      message: `${data.team.overloadedCount} team members are overloaded: ${overloaded.map(m => m.name).join(', ')}`,
      sourceCardId: 'delegation-balance',
      sourceCardName: 'Delegation Balance',
      category: 'Manager Toolkit',
      timestamp: now,
      action: { label: 'Rebalance', target: 'card:delegation-balance' },
      relatedPersons: overloaded.map(m => m.name),
    });
  }

  // Burnout risk
  if (data.team.burnoutRisk > 0) {
    insights.push({
      id: 'team-burnout',
      severity: InsightSeverity.Critical,
      icon: '⚡',
      message: `${data.team.burnoutRisk} team member(s) flagged for burnout risk`,
      sourceCardId: 'team-burnout-signals',
      sourceCardName: 'Team Burnout Signals',
      category: 'Manager Toolkit',
      timestamp: now,
    });
  }

  // 1:1 gap
  if (data.team.oneOnOneGap) {
    insights.push({
      id: 'team-1on1',
      severity: InsightSeverity.Info,
      icon: '👥',
      message: `1:1 gap: ${data.team.oneOnOneGap}`,
      sourceCardId: 'one-on-one-gap-detection',
      sourceCardName: '1:1 Gap Detection',
      category: 'Manager Toolkit',
      timestamp: now,
    });
  }

  return insights;
}

function generateGovernanceInsights(data: DemoDataset): AggregatedInsight[] {
  const insights: AggregatedInsight[] = [];
  const now = new Date();

  if (data.governance.staleDocuments > 0) {
    insights.push({
      id: 'gov-stale-docs',
      severity: InsightSeverity.Info,
      icon: '📄',
      message: `${data.governance.staleDocuments} shared documents haven't been updated in 30+ days`,
      sourceCardId: 'governance-dashboard',
      sourceCardName: 'Governance Dashboard',
      category: 'Governance & Compliance',
      timestamp: now,
    });
  }

  if (data.governance.permissionAnomalies > 0) {
    insights.push({
      id: 'gov-permissions',
      severity: InsightSeverity.Warning,
      icon: '🔐',
      message: `${data.governance.permissionAnomalies} permission anomaly detected`,
      sourceCardId: 'governance-dashboard',
      sourceCardName: 'Governance Dashboard',
      category: 'Governance & Compliance',
      timestamp: now,
    });
  }

  return insights;
}

function generateAfterHoursInsights(data: DemoDataset): AggregatedInsight[] {
  const insights: AggregatedInsight[] = [];
  const now = new Date();

  if (data.afterHours.thisWeek > data.afterHours.lastWeek) {
    insights.push({
      id: 'after-hours-trend',
      severity: InsightSeverity.Warning,
      icon: '🌙',
      message: `After-hours activity is ${data.afterHours.trend} — ${data.afterHours.thisWeek} events this week vs ${data.afterHours.lastWeek} last week`,
      sourceCardId: 'after-hours-activity',
      sourceCardName: 'After-Hours Activity',
      category: 'Wellbeing',
      timestamp: now,
    });
  }

  if (data.afterHours.worstDay) {
    insights.push({
      id: 'after-hours-worst',
      severity: InsightSeverity.Info,
      icon: '📆',
      message: `Worst after-hours day: ${data.afterHours.worstDay}`,
      sourceCardId: 'after-hours-activity',
      sourceCardName: 'After-Hours Activity',
      category: 'Wellbeing',
      timestamp: now,
    });
  }

  return insights;
}

// ============================================
// Public API
// ============================================

/**
 * Generate all insights from the demo dataset, sorted by severity
 *
 * @param data - Demo dataset to analyse (defaults to DEMO_DATA)
 * @returns Sorted array of aggregated insights
 */
export function generateInsights(data: DemoDataset = DEMO_DATA): AggregatedInsight[] {
  const allInsights: AggregatedInsight[] = [
    ...generateWaitingInsights(data),
    ...generateFocusInsights(data),
    ...generatePromiseInsights(data),
    ...generateMeetingInsights(data),
    ...generateCollaborationInsights(data),
    ...generateTeamInsights(data),
    ...generateGovernanceInsights(data),
    ...generateAfterHoursInsights(data),
  ];

  // Sort by severity (critical first), then by timestamp (newest first)
  allInsights.sort((a, b) => {
    const severityDiff = severityOrder(a.severity) - severityOrder(b.severity);
    if (severityDiff !== 0) return severityDiff;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return allInsights;
}

/**
 * Generate a summary of insight counts by severity
 *
 * @param insights - Array of insights (or generates fresh if not provided)
 * @param data - Demo dataset (used if insights not provided)
 * @returns Summary with counts and totals
 */
export function generateInsightsSummary(
  insights?: AggregatedInsight[],
  data: DemoDataset = DEMO_DATA
): InsightsSummary {
  const items = insights || generateInsights(data);

  return {
    criticalCount: items.filter(i => i.severity === InsightSeverity.Critical).length,
    warningCount: items.filter(i => i.severity === InsightSeverity.Warning).length,
    infoCount: items.filter(i => i.severity === InsightSeverity.Info).length,
    positiveCount: items.filter(i => i.severity === InsightSeverity.Positive).length,
    totalCount: items.length,
    lastUpdated: new Date(),
  };
}

/**
 * Get insights filtered by severity
 *
 * @param severity - Severity level to filter by
 * @param data - Demo dataset
 * @returns Filtered array of insights
 */
export function getInsightsBySeverity(
  severity: InsightSeverity,
  data: DemoDataset = DEMO_DATA
): AggregatedInsight[] {
  return generateInsights(data).filter(i => i.severity === severity);
}
