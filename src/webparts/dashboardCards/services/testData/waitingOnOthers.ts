// ============================================
// Test Data - Waiting On Others (Pending Responses)
// ============================================
// This test data is designed to clearly show the difference between:
// - People View: Groups items by person (e.g., "Sarah Johnson owes you 3 items")
// - All Items View: Shows each individual item separately
// ============================================

import {
  GroupedPendingData,
  PendingTrendData,
  PendingResponse,
  PersonOwesGroup
} from '../../models/WaitingOnOthers';

/**
 * Generate test pending responses
 * Some people have multiple items to demonstrate the People view grouping
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
    // ============================================
    // SARAH JOHNSON - Manager (VIP) - 3 items (demonstrates grouping)
    // ============================================
    {
      id: 'pending-1',
      conversationType: 'email',
      subject: 'Q4 Budget Approval',
      preview: 'Hi Sarah, the Q4 budget proposal is ready for your review. Could you please approve it so we can proceed with planning?',
      recipient: {
        id: 'user-sarah',
        displayName: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
        relationship: 'manager',
        isVip: true
      },
      sentDateTime: hoursAgo(168), // 7 days - OVERDUE
      waitingDuration: 168,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk-sarah-1',
      wasQuestion: false,
      requestedAction: true,
      mentionedDeadline: true,
      reminderCount: 2
    },
    {
      id: 'pending-2',
      conversationType: 'email',
      subject: 'Promotion Discussion Follow-up',
      preview: 'Sarah, following up on our conversation about the promotion timeline. When can we schedule the next steps?',
      recipient: {
        id: 'user-sarah',
        displayName: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
        relationship: 'manager',
        isVip: true
      },
      sentDateTime: hoursAgo(120), // 5 days
      waitingDuration: 120,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk-sarah-2',
      wasQuestion: true,
      requestedAction: false,
      mentionedDeadline: false,
      reminderCount: 1
    },
    {
      id: 'pending-3',
      conversationType: 'teams-chat',
      subject: 'PTO Request for December',
      preview: 'Hi Sarah, just checking if you had a chance to review my PTO request for the holidays?',
      recipient: {
        id: 'user-sarah',
        displayName: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
        relationship: 'manager',
        isVip: true
      },
      sentDateTime: hoursAgo(72), // 3 days
      waitingDuration: 72,
      webUrl: 'https://teams.microsoft.com/l/message/sarah-3',
      chatId: 'chat-sarah-3',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 0
    },

    // ============================================
    // MICHAEL CHEN - Frequent collaborator - 2 items
    // ============================================
    {
      id: 'pending-4',
      conversationType: 'teams-chat',
      subject: 'Code Review: Authentication Module',
      preview: 'Hey Michael, the PR for the auth module is ready. It\'s blocking the release - can you review when you get a chance?',
      recipient: {
        id: 'user-michael',
        displayName: 'Michael Chen',
        email: 'michael.chen@contoso.com',
        relationship: 'frequent'
      },
      sentDateTime: hoursAgo(96), // 4 days
      waitingDuration: 96,
      webUrl: 'https://teams.microsoft.com/l/message/michael-1',
      chatId: 'chat-michael-1',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: true,
      reminderCount: 1
    },
    {
      id: 'pending-5',
      conversationType: 'email',
      subject: 'API Documentation Review',
      preview: 'Michael, I\'ve updated the API docs based on your feedback. Could you give it a final look before we publish?',
      recipient: {
        id: 'user-michael',
        displayName: 'Michael Chen',
        email: 'michael.chen@contoso.com',
        relationship: 'frequent'
      },
      sentDateTime: hoursAgo(48), // 2 days
      waitingDuration: 48,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk-michael-2',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 0
    },

    // ============================================
    // EMILY RODRIGUEZ - Same team - 2 items
    // ============================================
    {
      id: 'pending-6',
      conversationType: 'email',
      subject: 'Vendor Proposal Comparison',
      preview: 'Emily, I\'ve attached the three vendor proposals. Could you review and share your recommendation by Friday?',
      recipient: {
        id: 'user-emily',
        displayName: 'Emily Rodriguez',
        email: 'emily.rodriguez@contoso.com',
        relationship: 'same-team'
      },
      sentDateTime: hoursAgo(80), // 3.3 days
      waitingDuration: 80,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk-emily-1',
      wasQuestion: false,
      requestedAction: true,
      mentionedDeadline: true,
      reminderCount: 0
    },
    {
      id: 'pending-7',
      conversationType: 'teams-chat',
      subject: 'Meeting Notes from Strategy Session',
      preview: 'Emily, could you share the notes from yesterday\'s strategy meeting? I need them for the summary report.',
      recipient: {
        id: 'user-emily',
        displayName: 'Emily Rodriguez',
        email: 'emily.rodriguez@contoso.com',
        relationship: 'same-team'
      },
      sentDateTime: hoursAgo(26), // ~1 day
      waitingDuration: 26,
      webUrl: 'https://teams.microsoft.com/l/message/emily-2',
      chatId: 'chat-emily-2',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 0
    },

    // ============================================
    // JAMES WILSON - External vendor (VIP) - 1 item (MOST OVERDUE)
    // ============================================
    {
      id: 'pending-8',
      conversationType: 'email',
      subject: 'Contract Signature - URGENT',
      preview: 'James, the contract has been ready for your signature for over a week. This is blocking our project kickoff.',
      recipient: {
        id: 'user-james',
        displayName: 'James Wilson',
        email: 'james.wilson@external-vendor.com',
        relationship: 'external',
        isVip: true
      },
      sentDateTime: hoursAgo(192), // 8 days - MOST OVERDUE
      waitingDuration: 192,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk-james-1',
      wasQuestion: false,
      requestedAction: true,
      mentionedDeadline: true,
      reminderCount: 3
    },

    // ============================================
    // LISA WANG - Direct report - 1 item
    // ============================================
    {
      id: 'pending-9',
      conversationType: 'teams-chat',
      subject: 'Sprint Retrospective Feedback',
      preview: 'Lisa, can you fill out the retro survey? Need everyone\'s input before tomorrow\'s meeting.',
      recipient: {
        id: 'user-lisa',
        displayName: 'Lisa Wang',
        email: 'lisa.wang@contoso.com',
        relationship: 'direct-report'
      },
      sentDateTime: hoursAgo(20), // Less than 1 day
      waitingDuration: 20,
      webUrl: 'https://teams.microsoft.com/l/message/lisa-1',
      chatId: 'chat-lisa-1',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: true,
      reminderCount: 0
    },

    // ============================================
    // DAVID PARK - Manager (VIP) - 1 item
    // ============================================
    {
      id: 'pending-10',
      conversationType: 'email',
      subject: 'Annual Review Self-Assessment',
      preview: 'Hi David, I submitted my self-assessment last week. Have you had a chance to review it before our meeting?',
      recipient: {
        id: 'user-david',
        displayName: 'David Park',
        email: 'david.park@contoso.com',
        relationship: 'manager',
        isVip: true
      },
      sentDateTime: hoursAgo(144), // 6 days
      waitingDuration: 144,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk-david-1',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 1
    },

    // ============================================
    // ALEX KIM - Designer - 1 item
    // ============================================
    {
      id: 'pending-11',
      conversationType: 'teams-chat',
      subject: 'Final Design Assets for Landing Page',
      preview: 'Alex, the dev team is waiting on the final designs. When can we expect the assets?',
      recipient: {
        id: 'user-alex',
        displayName: 'Alex Kim',
        email: 'alex.kim@contoso.com',
        relationship: 'same-team'
      },
      sentDateTime: hoursAgo(52), // ~2 days
      waitingDuration: 52,
      webUrl: 'https://teams.microsoft.com/l/message/alex-1',
      chatId: 'chat-alex-1',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 0
    },

    // ============================================
    // SNOOZED ITEMS - To demonstrate snoozed tab
    // ============================================
    {
      id: 'pending-snoozed-1',
      conversationType: 'email',
      subject: 'Conference Room Booking Confirmation',
      preview: 'Hi, can you confirm the conference room booking for next month\'s team meeting?',
      recipient: {
        id: 'user-rachel',
        displayName: 'Rachel Green',
        email: 'rachel.green@contoso.com',
        relationship: 'same-team'
      },
      sentDateTime: hoursAgo(96), // 4 days ago
      waitingDuration: 96,
      webUrl: 'https://outlook.office.com/mail/sentitems/id/AAMk-rachel-1',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 0,
      snoozedUntil: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // Snoozed for 2 more days
    },
    {
      id: 'pending-snoozed-2',
      conversationType: 'teams-chat',
      subject: 'Training Materials Review',
      preview: 'Could you review the updated training materials when you have a chance?',
      recipient: {
        id: 'user-tom',
        displayName: 'Tom Wilson',
        email: 'tom.wilson@contoso.com',
        relationship: 'frequent'
      },
      sentDateTime: hoursAgo(72), // 3 days ago
      waitingDuration: 72,
      webUrl: 'https://teams.microsoft.com/l/message/tom-1',
      chatId: 'chat-tom-1',
      wasQuestion: true,
      requestedAction: true,
      mentionedDeadline: false,
      reminderCount: 1,
      snoozedUntil: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) // Snoozed for 5 more days
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
 *
 * This generates:
 * - 9 people total (7 active + 2 snoozed)
 * - 13 items total (11 active + 2 snoozed)
 * - Sarah Johnson: 3 items (7d, 5d, 3d)
 * - Michael Chen: 2 items (4d, 2d)
 * - Emily Rodriguez: 2 items (3d, 1d)
 * - James Wilson: 1 item (8d - most overdue)
 * - David Park: 1 item (6d)
 * - Alex Kim: 1 item (2d)
 * - Lisa Wang: 1 item (<1d)
 * - Rachel Green: 1 item (SNOOZED)
 * - Tom Wilson: 1 item (SNOOZED)
 *
 * People View shows: 7 rows (one per person with item counts, excluding snoozed)
 * All Items View shows: 11 rows (one per item, excluding snoozed)
 * Snoozed View shows: 2 rows (snoozed items only)
 */
export function getTestWaitingOnOthersData(): GroupedPendingData {
  const allItems = getTestPendingResponses();

  // Separate active and snoozed items
  const activeItems = allItems.filter(item => !item.snoozedUntil);
  const snoozedItems = allItems.filter(item => item.snoozedUntil);

  // Group only active items for People view
  const byPerson = groupByPerson(activeItems);

  const totalWaitHours = activeItems.reduce((sum, item) => sum + item.waitingDuration, 0);
  const oldestWaitDays = activeItems.length > 0
    ? Math.max(...activeItems.map(item => item.waitingDuration)) / 24
    : 0;

  return {
    byPerson,
    allPendingItems: activeItems,
    snoozedItems,
    totalPeopleOwing: byPerson.length,
    totalItems: activeItems.length,
    totalWaitHours,
    oldestWaitDays: Math.round(oldestWaitDays),
    snoozedCount: snoozedItems.length
  };
}

/**
 * Generate test trend data
 */
export function getTestWaitingOnOthersTrend(): PendingTrendData {
  const now = new Date();
  const dataPoints = [];

  // Generate 7 days of trend data showing slight improvement
  const basePeople = 8;
  const baseItems = 13;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    // Trend shows slight improvement (fewer items over time)
    const variation = Math.floor(Math.random() * 2);
    dataPoints.push({
      date: d.toISOString().split('T')[0],
      peopleOwing: basePeople - Math.floor(i / 3) + variation,
      itemCount: baseItems - Math.floor(i / 2) + variation,
      avgWaitDays: Math.floor(Math.random() * 2) + 3
    });
  }

  return {
    dataPoints,
    trend: 'stable',
    averagePeopleOwing: 7,
    longestCurrentWait: 192 // 8 days in hours (James Wilson's contract)
  };
}
