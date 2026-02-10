// ============================================
// Contextual Action Suggestions - Demo/Test Data
// ============================================
// Deterministic demo data for Card #66.
// Aggregates top actions from other cards' data.

import { ContextualActionsData, SuggestedAction } from '../../models/ContextualActions';

// ============================================
// Generator
// ============================================

export function getTestContextualActionsData(): ContextualActionsData {
  const actions: SuggestedAction[] = [
    {
      id: 'action-001',
      title: 'Reply to CFO about contract terms',
      description: 'David Kim sent an urgent email 2 hours ago about revised Acme Corp contract terms needed before his 3pm call.',
      source: 'stale-conversations',
      sourceCardName: 'Stale Conversations',
      urgency: 'critical',
      priorityScore: 10,
      estimatedMinutes: 15,
      actionType: 'reply',
      webUrl: 'https://outlook.office.com/mail/id/urgent-001',
      personContext: 'From David Kim (CFO)',
      timeContext: '2 hours ago',
    },
    {
      id: 'action-002',
      title: 'Approve API Gateway design document',
      description: 'Alex Chen has been waiting 5 days. Sprint planning is blocked and 6 people are waiting on this.',
      source: 'approval-bottlenecks',
      sourceCardName: 'Approval Bottlenecks',
      urgency: 'critical',
      priorityScore: 9,
      estimatedMinutes: 20,
      actionType: 'approve',
      webUrl: 'https://contoso.sharepoint.com/sites/engineering/docs/api-gateway-design.docx',
      personContext: 'From Alex Chen',
      timeContext: '5 days overdue',
    },
    {
      id: 'action-003',
      title: 'Send overdue project timeline to Alex',
      description: 'You committed to sending the updated Project Lighthouse timeline by Thursday. It is now 2 days overdue.',
      source: 'broken-promises',
      sourceCardName: 'Broken Promises',
      urgency: 'warning',
      priorityScore: 8,
      estimatedMinutes: 25,
      actionType: 'follow-up',
      webUrl: 'https://outlook.office.com/mail/id/promise-001',
      personContext: 'Promised to Alex Chen',
      timeContext: '2 days overdue',
    },
    {
      id: 'action-004',
      title: 'Prepare for strategy review with VP',
      description: 'Strategy session in 2 days. No agenda items prepared, low preparation score.',
      source: 'meeting-prep',
      sourceCardName: 'Meeting Prep',
      urgency: 'warning',
      priorityScore: 8,
      estimatedMinutes: 30,
      actionType: 'prepare',
      personContext: 'With Rachel Green (VP)',
      timeContext: 'In 2 days',
    },
    {
      id: 'action-005',
      title: 'Resolve double-booking at 2 PM',
      description: 'Board Prep Review and Client Demo — Acme Corp overlap by 30 minutes today.',
      source: 'pre-meeting-conflicts',
      sourceCardName: 'Pre-Meeting Conflicts',
      urgency: 'warning',
      priorityScore: 7,
      estimatedMinutes: 5,
      actionType: 'resolve',
      timeContext: 'Today 2:00 PM',
    },
    {
      id: 'action-006',
      title: 'Follow up on $120K proposal with Northwind',
      description: 'Sent proposal to Northwind Traders 8 days ago with no reply. Two follow-ups already sent.',
      source: 'waiting-on-external',
      sourceCardName: 'Waiting on External',
      urgency: 'info',
      priorityScore: 7,
      estimatedMinutes: 10,
      actionType: 'follow-up',
      webUrl: 'https://outlook.office.com/mail/id/ext-001',
      personContext: 'Northwind Traders',
      timeContext: '8 days silent',
    },
  ];

  return {
    actions,
    stats: {
      totalActions: actions.length,
      criticalCount: actions.filter(a => a.urgency === 'critical').length,
      warningCount: actions.filter(a => a.urgency === 'warning').length,
      totalEstimatedMinutes: actions.reduce((sum, a) => sum + a.estimatedMinutes, 0),
      topSourceCard: 'Stale Conversations',
    },
  };
}
