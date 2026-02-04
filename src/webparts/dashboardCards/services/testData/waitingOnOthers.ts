// ============================================
// Test Data - Waiting On Others (Pending Responses)
// ============================================

import {
  GroupedPendingData,
  PendingTrendData,
  PendingResponse,
  PersonOwesGroup
} from '../../models/WaitingOnOthers';

/**
 * Generate test pending responses
 */
function getTestPendingResponses(): PendingResponse[] {
  const now = new Date();

  // Helper to subtract hours
  const hoursAgo = (hours: number): Date => {
    const d = new Date(now);
    d.setHours(d.getHours() - hours);
    return d;
  };

  return [
    {
      id: 'pending-1',
      conversationType: 'email',
      subject: 'Project Timeline Confirmation',
      preview: 'Hi Sarah, could you confirm the timeline for the Q4 deliverables? I need to update the project plan.',
      recipient: {
        id: 'user-1',
        displayName: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
        relationship: 'manager'
      },
      sentDateTime: hoursAgo(72),
      waitingDuration: 72,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk...',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 0
    },
    {
      id: 'pending-2',
      conversationType: 'teams-chat',
      subject: 'Code Review Request',
      preview: 'Hey Michael, can you review my PR when you get a chance? It\'s blocking the feature release.',
      recipient: {
        id: 'user-2',
        displayName: 'Michael Chen',
        email: 'michael.chen@contoso.com',
        relationship: 'frequent'
      },
      sentDateTime: hoursAgo(48),
      waitingDuration: 48,
      webUrl: 'https://teams.microsoft.com/l/message/...',
      chatId: 'chat-456',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 0
    },
    {
      id: 'pending-3',
      conversationType: 'email',
      subject: 'Vendor Proposal Review',
      preview: 'Emily, I\'ve attached the vendor proposals for your review. Please let me know your recommendations by Friday.',
      recipient: {
        id: 'user-3',
        displayName: 'Emily Rodriguez',
        email: 'emily.rodriguez@contoso.com',
        relationship: 'same-team'
      },
      sentDateTime: hoursAgo(96),
      waitingDuration: 96,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk...',
      wasQuestion: false,
      requestedAction: true,
      mentionedDeadline: true,
      reminderCount: 1
    },
    {
      id: 'pending-4',
      conversationType: 'teams-chat',
      subject: 'Design Assets Request',
      preview: 'Alex, when can I expect the final design assets? The development team is waiting.',
      recipient: {
        id: 'user-4',
        displayName: 'Alex Kim',
        email: 'alex.kim@contoso.com',
        relationship: 'same-team'
      },
      sentDateTime: hoursAgo(36),
      waitingDuration: 36,
      webUrl: 'https://teams.microsoft.com/l/message/...',
      chatId: 'chat-789',
      wasQuestion: true,
      requestedAction: false,
      mentionedDeadline: false,
      reminderCount: 0
    },
    {
      id: 'pending-5',
      conversationType: 'email',
      subject: 'Budget Approval Request',
      preview: 'Hi David, I submitted the budget request last week. Could you please approve it when you have time?',
      recipient: {
        id: 'user-5',
        displayName: 'David Park',
        email: 'david.park@contoso.com',
        relationship: 'manager'
      },
      sentDateTime: hoursAgo(120),
      waitingDuration: 120,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk...',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 2
    },
    {
      id: 'pending-6',
      conversationType: 'email',
      subject: 'Contract Signature Needed',
      preview: 'James, the contract is ready for your signature. Please sign and return at your earliest convenience.',
      recipient: {
        id: 'user-6',
        displayName: 'James Wilson',
        email: 'james.wilson@external.com',
        relationship: 'external'
      },
      sentDateTime: hoursAgo(168),
      waitingDuration: 168,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk...',
      wasQuestion: false,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 1
    },
    {
      id: 'pending-7',
      conversationType: 'teams-chat',
      subject: 'Status Update Request',
      preview: 'Lisa, can you send me a quick status update on the API integration? Need it for the standup.',
      recipient: {
        id: 'user-7',
        displayName: 'Lisa Wang',
        email: 'lisa.wang@contoso.com',
        relationship: 'direct-report'
      },
      sentDateTime: hoursAgo(24),
      waitingDuration: 24,
      webUrl: 'https://teams.microsoft.com/l/message/...',
      chatId: 'chat-321',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 0
    },
    {
      id: 'pending-8',
      conversationType: 'email',
      subject: 'Meeting Reschedule Confirmation',
      preview: 'Rachel, does next Tuesday at 2pm work for the rescheduled meeting? Please confirm.',
      recipient: {
        id: 'user-8',
        displayName: 'Rachel Green',
        email: 'rachel.green@contoso.com',
        relationship: 'same-team'
      },
      sentDateTime: hoursAgo(30),
      waitingDuration: 30,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk...',
      wasQuestion: true,
      requestedAction: false,
      mentionedDeadline: false,
      reminderCount: 0
    },
    {
      id: 'pending-9',
      conversationType: 'email',
      subject: 'Interview Feedback',
      preview: 'Hi team, please share your interview feedback for the candidate we met yesterday.',
      recipient: {
        id: 'user-9',
        displayName: 'Tom Bradley',
        email: 'tom.bradley@contoso.com',
        relationship: 'same-team'
      },
      sentDateTime: hoursAgo(52),
      waitingDuration: 52,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk...',
      wasQuestion: false,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 0
    }
  ];
}

/**
 * Group pending responses by person
 */
function groupByPerson(pendingItems: PendingResponse[]): PersonOwesGroup[] {
  const groupMap = new Map<string, PersonOwesGroup>();

  pendingItems.forEach(item => {
    const personId = item.recipient.id;
    if (!groupMap.has(personId)) {
      groupMap.set(personId, {
        person: item.recipient,
        pendingItems: [],
        totalWaitHours: 0,
        longestWaitHours: 0,
        oldestItemDate: item.sentDateTime,
        itemCount: 0,
        snoozedCount: 0,
        reminderSentCount: 0
      });
    }

    const group = groupMap.get(personId)!;
    group.pendingItems.push(item);
    group.totalWaitHours += item.waitingDuration;
    group.longestWaitHours = Math.max(group.longestWaitHours, item.waitingDuration);
    group.itemCount++;
    if (item.sentDateTime < group.oldestItemDate) {
      group.oldestItemDate = item.sentDateTime;
    }
    if (item.snoozedUntil) {
      group.snoozedCount++;
    }
    if (item.reminderCount > 0) {
      group.reminderSentCount++;
    }
  });

  return Array.from(groupMap.values()).sort((a, b) => b.longestWaitHours - a.longestWaitHours);
}

/**
 * Generate test grouped pending data
 */
export function getTestWaitingOnOthersData(): GroupedPendingData {
  const pendingItems = getTestPendingResponses();
  const byPerson = groupByPerson(pendingItems);

  const totalWaitHours = pendingItems.reduce((sum, item) => sum + item.waitingDuration, 0);
  const oldestWaitDays = Math.max(...pendingItems.map(item => item.waitingDuration)) / 24;

  return {
    byPerson,
    allPendingItems: pendingItems,
    totalPeopleOwing: byPerson.length,
    totalItems: pendingItems.length,
    totalWaitHours,
    oldestWaitDays: Math.round(oldestWaitDays),
    snoozedCount: 0
  };
}

/**
 * Generate test trend data
 */
export function getTestWaitingOnOthersTrend(): PendingTrendData {
  const now = new Date();
  const dataPoints = [];

  // Generate 7 days of trend data
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    dataPoints.push({
      date: d.toISOString().split('T')[0],
      peopleOwing: Math.floor(Math.random() * 4) + 5, // 5-8 people
      itemCount: Math.floor(Math.random() * 5) + 7, // 7-11 items
      avgWaitDays: Math.floor(Math.random() * 3) + 2 // 2-4 days
    });
  }

  return {
    dataPoints,
    trend: 'stable',
    averagePeopleOwing: 6,
    longestCurrentWait: 168 // 7 days in hours
  };
}
