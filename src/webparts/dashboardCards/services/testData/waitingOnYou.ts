// ============================================
// Test Data - Waiting On You (Stale Conversations)
// ============================================

import {
  GroupedWaitingData,
  WaitingDebtTrend,
  StaleConversation,
  PersonGroup,
  TeamGroup,
  Team,
  Person
} from '../../models/WaitingOnYou';

/**
 * Generate test stale conversations
 */
function getTestStaleConversations(): StaleConversation[] {
  const now = new Date();

  // Helper to subtract hours
  const hoursAgo = (hours: number): Date => {
    const d = new Date(now);
    d.setHours(d.getHours() - hours);
    return d;
  };

  return [
    {
      id: 'conv-1',
      conversationType: 'email',
      subject: 'Q4 Budget Review - Need Your Approval',
      preview: 'Hi, could you please review the attached budget proposal and let me know your thoughts? We need to finalize this by Friday.',
      sender: {
        id: 'user-1',
        displayName: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
        relationship: 'manager',
        avgResponseTimeHours: 4
      },
      receivedDateTime: hoursAgo(72),
      staleDuration: 72,
      urgencyScore: 8,
      urgencyFactors: [
        { factor: 'sender-manager', points: 2, description: 'From your manager' },
        { factor: 'wait-time-high', points: 2, description: 'Waiting > 3 days' },
        { factor: 'content-deadline', points: 2, description: 'Mentions deadline' },
        { factor: 'content-question', points: 1, description: 'Contains question' }
      ],
      webUrl: 'https://outlook.office.com/mail/inbox/id/AAMk...',
      isQuestion: true,
      hasDeadlineMention: true,
      isMention: false
    },
    {
      id: 'conv-2',
      conversationType: 'teams-chat',
      subject: 'Project Status Update',
      preview: '@You Can you share the latest status on the deployment timeline? The stakeholders are asking.',
      sender: {
        id: 'user-2',
        displayName: 'Michael Chen',
        email: 'michael.chen@contoso.com',
        relationship: 'frequent',
        avgResponseTimeHours: 8
      },
      receivedDateTime: hoursAgo(56),
      staleDuration: 56,
      urgencyScore: 6,
      urgencyFactors: [
        { factor: 'wait-time-moderate', points: 1, description: 'Waiting > 2 days' },
        { factor: 'content-mention', points: 2, description: 'You were @mentioned' },
        { factor: 'content-question', points: 1, description: 'Contains question' },
        { factor: 'sender-frequent', points: 1, description: 'Frequent collaborator' }
      ],
      webUrl: 'https://teams.microsoft.com/l/message/...',
      chatId: 'chat-123',
      replyToId: 'msg-456',
      isQuestion: true,
      hasDeadlineMention: false,
      isMention: true
    },
    {
      id: 'conv-3',
      conversationType: 'email',
      subject: 'Client Meeting Follow-up - Action Items',
      preview: 'Following up on our meeting with Acme Corp. Could you review the action items and confirm ownership?',
      sender: {
        id: 'user-3',
        displayName: 'Emily Rodriguez',
        email: 'emily.rodriguez@contoso.com',
        relationship: 'same-team',
        avgResponseTimeHours: 12
      },
      receivedDateTime: hoursAgo(48),
      staleDuration: 48,
      urgencyScore: 5,
      urgencyFactors: [
        { factor: 'wait-time-moderate', points: 1, description: 'Waiting > 2 days' },
        { factor: 'content-question', points: 1, description: 'Contains question' },
        { factor: 'sender-external', points: 1, description: 'Involves external client' }
      ],
      webUrl: 'https://outlook.office.com/mail/inbox/id/AAMk...',
      isQuestion: true,
      hasDeadlineMention: false,
      isMention: false
    },
    {
      id: 'conv-4',
      conversationType: 'teams-channel',
      subject: 'Design Review - Homepage Redesign',
      preview: '@You What do you think about the color scheme? We need design sign-off before development starts.',
      sender: {
        id: 'user-4',
        displayName: 'Alex Kim',
        email: 'alex.kim@contoso.com',
        relationship: 'same-team'
      },
      receivedDateTime: hoursAgo(96),
      staleDuration: 96,
      urgencyScore: 7,
      urgencyFactors: [
        { factor: 'wait-time-high', points: 2, description: 'Waiting > 3 days' },
        { factor: 'content-mention', points: 2, description: 'You were @mentioned' },
        { factor: 'content-question', points: 1, description: 'Contains question' }
      ],
      webUrl: 'https://teams.microsoft.com/l/message/...',
      teamId: 'team-1',
      teamName: 'Product Design',
      channelId: 'channel-1',
      channelName: 'Design Reviews',
      isQuestion: true,
      hasDeadlineMention: false,
      isMention: true
    },
    {
      id: 'conv-4b',
      conversationType: 'teams-channel',
      subject: 'UI Component Library Update',
      preview: '@You Can you review the new button styles in the component library?',
      sender: {
        id: 'user-9',
        displayName: 'Tom Bradley',
        email: 'tom.bradley@contoso.com',
        relationship: 'same-team'
      },
      receivedDateTime: hoursAgo(40),
      staleDuration: 40,
      urgencyScore: 5,
      urgencyFactors: [
        { factor: 'content-mention', points: 2, description: 'You were @mentioned' },
        { factor: 'content-question', points: 1, description: 'Contains question' }
      ],
      webUrl: 'https://teams.microsoft.com/l/message/...',
      teamId: 'team-1',
      teamName: 'Product Design',
      channelId: 'channel-2',
      channelName: 'Component Library',
      isQuestion: true,
      hasDeadlineMention: false,
      isMention: true
    },
    {
      id: 'conv-5',
      conversationType: 'email',
      subject: 'URGENT: Security Incident Report',
      preview: 'Please review the attached security incident report and provide your assessment ASAP.',
      sender: {
        id: 'user-5',
        displayName: 'David Park',
        email: 'david.park@contoso.com',
        relationship: 'other'
      },
      receivedDateTime: hoursAgo(24),
      staleDuration: 24,
      urgencyScore: 7,
      urgencyFactors: [
        { factor: 'content-urgent', points: 1, description: 'Marked as urgent' },
        { factor: 'content-question', points: 1, description: 'Contains question' }
      ],
      webUrl: 'https://outlook.office.com/mail/inbox/id/AAMk...',
      isQuestion: true,
      hasDeadlineMention: false,
      isMention: false
    },
    {
      id: 'conv-6',
      conversationType: 'teams-chat',
      subject: 'Quick question about API integration',
      preview: 'Hey, quick question - which authentication method should we use for the new API endpoint?',
      sender: {
        id: 'user-6',
        displayName: 'Lisa Wang',
        email: 'lisa.wang@contoso.com',
        relationship: 'direct-report'
      },
      receivedDateTime: hoursAgo(36),
      staleDuration: 36,
      urgencyScore: 5,
      urgencyFactors: [
        { factor: 'sender-direct', points: 1, description: 'From direct report' },
        { factor: 'content-question', points: 1, description: 'Contains question' }
      ],
      webUrl: 'https://teams.microsoft.com/l/message/...',
      chatId: 'chat-789',
      isQuestion: true,
      hasDeadlineMention: false,
      isMention: false
    },
    {
      id: 'conv-7',
      conversationType: 'email',
      subject: 'Contract Review Request - Vendor Agreement',
      preview: 'Could you please review the attached vendor contract? Legal needs our feedback by EOD Thursday.',
      sender: {
        id: 'user-7',
        displayName: 'James Wilson',
        email: 'james.wilson@external.com',
        relationship: 'external'
      },
      receivedDateTime: hoursAgo(60),
      staleDuration: 60,
      urgencyScore: 6,
      urgencyFactors: [
        { factor: 'wait-time-moderate', points: 1, description: 'Waiting > 2 days' },
        { factor: 'sender-external', points: 1, description: 'External contact' },
        { factor: 'content-deadline', points: 2, description: 'Mentions deadline' },
        { factor: 'content-question', points: 1, description: 'Contains question' }
      ],
      webUrl: 'https://outlook.office.com/mail/inbox/id/AAMk...',
      isQuestion: true,
      hasDeadlineMention: true,
      isMention: false
    },
    {
      id: 'conv-8',
      conversationType: 'teams-chat',
      subject: 'Team Building Event Planning',
      preview: 'Are you available for the team building event next Friday? Need headcount by tomorrow.',
      sender: {
        id: 'user-8',
        displayName: 'Rachel Green',
        email: 'rachel.green@contoso.com',
        relationship: 'same-team'
      },
      receivedDateTime: hoursAgo(28),
      staleDuration: 28,
      urgencyScore: 4,
      urgencyFactors: [
        { factor: 'content-deadline', points: 2, description: 'Mentions deadline' },
        { factor: 'content-question', points: 1, description: 'Contains question' }
      ],
      webUrl: 'https://teams.microsoft.com/l/message/...',
      chatId: 'chat-321',
      isQuestion: true,
      hasDeadlineMention: true,
      isMention: false
    },
    {
      id: 'conv-9',
      conversationType: 'teams-channel',
      subject: 'Sprint Planning - Need Story Points',
      preview: '@You Could you estimate the story points for the authentication tasks?',
      sender: {
        id: 'user-10',
        displayName: 'Chris Martinez',
        email: 'chris.martinez@contoso.com',
        relationship: 'same-team'
      },
      receivedDateTime: hoursAgo(52),
      staleDuration: 52,
      urgencyScore: 6,
      urgencyFactors: [
        { factor: 'wait-time-moderate', points: 1, description: 'Waiting > 2 days' },
        { factor: 'content-mention', points: 2, description: 'You were @mentioned' },
        { factor: 'content-question', points: 1, description: 'Contains question' }
      ],
      webUrl: 'https://teams.microsoft.com/l/message/...',
      teamId: 'team-2',
      teamName: 'Engineering',
      channelId: 'channel-3',
      channelName: 'Sprint Planning',
      isQuestion: true,
      hasDeadlineMention: false,
      isMention: true
    },
    {
      id: 'conv-10',
      conversationType: 'teams-channel',
      subject: 'Code Review Requested',
      preview: '@You PR #1234 is ready for your review. It\'s blocking the release.',
      sender: {
        id: 'user-11',
        displayName: 'Nina Patel',
        email: 'nina.patel@contoso.com',
        relationship: 'same-team'
      },
      receivedDateTime: hoursAgo(30),
      staleDuration: 30,
      urgencyScore: 7,
      urgencyFactors: [
        { factor: 'content-mention', points: 2, description: 'You were @mentioned' },
        { factor: 'content-urgent', points: 1, description: 'Blocking release' },
        { factor: 'content-question', points: 1, description: 'Requests action' }
      ],
      webUrl: 'https://teams.microsoft.com/l/message/...',
      teamId: 'team-2',
      teamName: 'Engineering',
      channelId: 'channel-4',
      channelName: 'Code Reviews',
      isQuestion: false,
      hasDeadlineMention: false,
      isMention: true
    },
    {
      id: 'conv-11',
      conversationType: 'teams-channel',
      subject: 'Marketing Campaign Feedback',
      preview: '@You Please review the Q1 campaign assets when you have a moment.',
      sender: {
        id: 'user-12',
        displayName: 'Jessica Lee',
        email: 'jessica.lee@contoso.com',
        relationship: 'frequent'
      },
      receivedDateTime: hoursAgo(68),
      staleDuration: 68,
      urgencyScore: 5,
      urgencyFactors: [
        { factor: 'wait-time-moderate', points: 1, description: 'Waiting > 2 days' },
        { factor: 'content-mention', points: 2, description: 'You were @mentioned' }
      ],
      webUrl: 'https://teams.microsoft.com/l/message/...',
      teamId: 'team-3',
      teamName: 'Marketing',
      channelId: 'channel-5',
      channelName: 'Campaigns',
      isQuestion: false,
      hasDeadlineMention: false,
      isMention: true
    }
  ];
}

/**
 * Test teams data
 */
function getTestTeams(): Team[] {
  return [
    {
      id: 'team-1',
      displayName: 'Product Design',
      webUrl: 'https://teams.microsoft.com/l/team/...',
      type: 'team'
    },
    {
      id: 'team-2',
      displayName: 'Engineering',
      webUrl: 'https://teams.microsoft.com/l/team/...',
      type: 'team'
    },
    {
      id: 'team-3',
      displayName: 'Marketing',
      webUrl: 'https://teams.microsoft.com/l/team/...',
      type: 'team'
    }
  ];
}

/**
 * Group conversations by person
 */
function groupByPerson(conversations: StaleConversation[]): PersonGroup[] {
  const groupMap = new Map<string, PersonGroup>();

  conversations.forEach(conv => {
    const personId = conv.sender.id;
    if (!groupMap.has(personId)) {
      groupMap.set(personId, {
        person: conv.sender,
        conversations: [],
        totalWaitHours: 0,
        oldestItemDate: conv.receivedDateTime,
        itemCount: 0,
        maxUrgency: 0,
        snoozedCount: 0
      });
    }

    const group = groupMap.get(personId)!;
    group.conversations.push(conv);
    group.totalWaitHours += conv.staleDuration;
    group.itemCount++;
    group.maxUrgency = Math.max(group.maxUrgency, conv.urgencyScore);
    if (conv.receivedDateTime < group.oldestItemDate) {
      group.oldestItemDate = conv.receivedDateTime;
    }
    if (conv.snoozedUntil) {
      group.snoozedCount++;
    }
  });

  return Array.from(groupMap.values()).sort((a, b) => b.maxUrgency - a.maxUrgency);
}

/**
 * Group conversations by team
 */
function groupByTeam(conversations: StaleConversation[], teams: Team[]): TeamGroup[] {
  const teamMap = new Map<string, TeamGroup>();

  // Initialize team groups
  teams.forEach(team => {
    teamMap.set(team.id, {
      team,
      people: [],
      conversations: [],
      totalWaitHours: 0,
      oldestItemDate: new Date(),
      itemCount: 0,
      maxUrgency: 0,
      snoozedCount: 0
    });
  });

  // Group conversations by team
  const peopleByTeam = new Map<string, Set<string>>();

  conversations.forEach(conv => {
    if (conv.teamId && teamMap.has(conv.teamId)) {
      const group = teamMap.get(conv.teamId)!;
      group.conversations.push(conv);
      group.totalWaitHours += conv.staleDuration;
      group.itemCount++;
      group.maxUrgency = Math.max(group.maxUrgency, conv.urgencyScore);

      if (group.itemCount === 1 || conv.receivedDateTime < group.oldestItemDate) {
        group.oldestItemDate = conv.receivedDateTime;
      }
      if (conv.snoozedUntil) {
        group.snoozedCount++;
      }

      // Track unique people per team
      if (!peopleByTeam.has(conv.teamId)) {
        peopleByTeam.set(conv.teamId, new Set());
      }
      peopleByTeam.get(conv.teamId)!.add(conv.sender.id);
    }
  });

  // Add people to team groups
  teamMap.forEach((group, teamId) => {
    const personIds = peopleByTeam.get(teamId);
    if (personIds) {
      const uniquePeople: Person[] = [];
      const seenIds = new Set<string>();

      group.conversations.forEach(conv => {
        if (!seenIds.has(conv.sender.id)) {
          seenIds.add(conv.sender.id);
          uniquePeople.push(conv.sender);
        }
      });

      group.people = uniquePeople;
    }
  });

  // Filter out empty teams and sort by urgency
  return Array.from(teamMap.values())
    .filter(g => g.itemCount > 0)
    .sort((a, b) => b.maxUrgency - a.maxUrgency);
}

/**
 * Generate test grouped waiting data
 */
export function getTestWaitingOnYouData(): GroupedWaitingData {
  const conversations = getTestStaleConversations();
  const teams = getTestTeams();
  const byPerson = groupByPerson(conversations);
  const byTeam = groupByTeam(conversations, teams);

  // Conversations without team association (for ungrouped view)
  const ungroupedConversations = conversations.filter(c => !c.teamId);
  const ungroupedByPerson = groupByPerson(ungroupedConversations);

  return {
    byPerson,
    byTeam,
    ungroupedByPerson,
    allConversations: conversations,
    totalPeopleWaiting: byPerson.length,
    totalTeamsAffected: byTeam.length,
    totalItems: conversations.length,
    totalWaitHours: conversations.reduce((sum, c) => sum + c.staleDuration, 0),
    criticalCount: conversations.filter(c => c.urgencyScore >= 7).length,
    snoozedCount: 0
  };
}

/**
 * Generate test trend data
 */
export function getTestWaitingOnYouTrend(): WaitingDebtTrend {
  const now = new Date();
  const dataPoints = [];

  // Generate 7 days of trend data
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    dataPoints.push({
      date: d.toISOString().split('T')[0],
      peopleWaiting: Math.floor(Math.random() * 5) + 4, // 4-8 people
      itemCount: Math.floor(Math.random() * 6) + 6, // 6-11 items
      totalWaitHours: Math.floor(Math.random() * 200) + 200 // 200-400 hours
    });
  }

  return {
    dataPoints,
    trend: 'stable',
    averagePeopleWaiting: 6,
    peakDay: dataPoints[2].date
  };
}
