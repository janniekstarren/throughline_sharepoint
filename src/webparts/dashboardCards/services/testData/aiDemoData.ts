// ============================================
// AI Demo Data - Test data for AI Demo Mode
// ============================================
// Provides AI-enhanced items with insights, scores, and suggestions

import {
  IAIInsight,
  IAIEnhancedItem,
  IAICardSummary,
} from '../../models/AITypes';
import { IEmailCardItem } from '../../models/EmailCard';
import { PendingResponse, PersonOwesGroup } from '../../models/WaitingOnOthers';
import { CalendarEvent } from '../../models/TodaysAgenda';
import { TaskItem } from '../../models/MyTasks';

// ============================================
// Helper to create dates relative to now
// ============================================
const hoursAgo = (hours: number): Date => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
};

// ============================================
// AI Enhanced Email Data
// ============================================

export const getAIEnhancedEmails = (): IAIEnhancedItem<IEmailCardItem>[] => [
  // Critical urgency email from manager
  {
    item: {
      id: 'ai-email-1',
      subject: 'Q4 Budget Review - Action Required',
      from: { name: 'Sarah Chen', email: 'sarah.chen@contoso.com' },
      receivedDateTime: hoursAgo(2),
      bodyPreview: 'Hi, I need your input on the Q4 budget allocations before our meeting tomorrow. Please review the attached spreadsheet and provide your feedback on the marketing spend...',
      importance: 'high',
      hasAttachments: true,
      isRead: false,
      webLink: '#',
      isFlagged: false,
      isVip: true,
    },
    aiScore: 92,
    aiPriority: 'critical',
    aiSuggestion: 'Respond before tomorrow\'s meeting',
    aiInsights: [
      {
        id: 'insight-1a',
        type: 'urgency',
        severity: 'critical',
        title: 'Response needed today',
        description: 'Based on meeting schedule and sender patterns, this requires a response before your 2pm meeting tomorrow.',
        confidence: 94,
        reasoning: 'Sarah typically follows up within 4 hours if no response. Meeting context requires input.',
        actionLabel: 'Reply now',
        actionType: 'reply',
      },
      {
        id: 'insight-1b',
        type: 'pattern',
        severity: 'info',
        title: 'VIP sender',
        description: 'You respond to 95% of Sarah\'s emails within 2 hours.',
        confidence: 98,
      },
    ],
  },

  // Anomaly detected - unusual volume
  {
    item: {
      id: 'ai-email-2',
      subject: 'RE: Project Timeline Update',
      from: { name: 'Finance Team', email: 'finance@contoso.com' },
      receivedDateTime: hoursAgo(1),
      bodyPreview: 'Thank you for the update. We have some concerns about the proposed timeline and would like to schedule a call to discuss the budget implications...',
      importance: 'normal',
      hasAttachments: false,
      isRead: false,
      webLink: '#',
      isFlagged: false,
      isVip: false,
    },
    aiScore: 78,
    aiPriority: 'high',
    aiSuggestion: 'Thread has multiple exchanges - consider a call',
    aiInsights: [
      {
        id: 'insight-2a',
        type: 'anomaly',
        severity: 'warning',
        title: '2x more Finance emails',
        description: 'You\'ve received twice as many emails from Finance this week compared to your average.',
        confidence: 91,
        reasoning: 'Detected increased communication pattern from Finance department. May indicate budget review period.',
      },
      {
        id: 'insight-2b',
        type: 'suggestion',
        severity: 'warning',
        title: 'Thread needs attention',
        description: 'This thread has had 3 back-and-forth exchanges. Consider scheduling a call to resolve quickly.',
        confidence: 82,
        actionLabel: 'Schedule call',
        actionType: 'scheduleMeeting',
      },
    ],
  },

  // Low priority - FYI only
  {
    item: {
      id: 'ai-email-3',
      subject: 'Weekly Team Update',
      from: { name: 'Mike Johnson', email: 'mike.j@contoso.com' },
      receivedDateTime: hoursAgo(5),
      bodyPreview: 'Here\'s this week\'s team update. Key highlights include the completion of the onboarding process and upcoming team building event...',
      importance: 'normal',
      hasAttachments: false,
      isRead: false,
      webLink: '#',
      isFlagged: false,
      isVip: false,
    },
    aiScore: 35,
    aiPriority: 'low',
    aiSuggestion: 'Informational - read when convenient',
    aiInsights: [
      {
        id: 'insight-3a',
        type: 'suggestion',
        severity: 'info',
        title: 'FYI only',
        description: 'This appears to be an informational update. No action typically required based on past patterns.',
        confidence: 87,
        reasoning: 'Weekly updates from Mike are usually informational. You\'ve never replied to these in the past.',
      },
    ],
  },

  // Flagged email with follow-up suggestion
  {
    item: {
      id: 'ai-email-4',
      subject: 'Client Proposal Draft - Please Review',
      from: { name: 'Alex Kim', email: 'alex.kim@contoso.com' },
      receivedDateTime: hoursAgo(48),
      bodyPreview: 'I\'ve attached the latest version of the client proposal. Could you please review sections 3 and 4 and provide your feedback by end of week?',
      importance: 'normal',
      hasAttachments: true,
      isRead: true,
      webLink: '#',
      isFlagged: true,
      flagStatus: 'flagged',
      flaggedDate: hoursAgo(47),
      isVip: true,
    },
    aiScore: 72,
    aiPriority: 'high',
    aiSuggestion: 'Deadline approaching - review soon',
    aiInsights: [
      {
        id: 'insight-4a',
        type: 'urgency',
        severity: 'warning',
        title: 'Deadline approaching',
        description: 'The requested feedback deadline is end of week. You have 2 days remaining.',
        confidence: 95,
        reasoning: 'Email explicitly mentions "end of week" deadline. Currently 2 days away.',
      },
      {
        id: 'insight-4b',
        type: 'prediction',
        severity: 'info',
        title: 'Effort: ~30 mins',
        description: 'Based on similar review requests, this typically takes about 30 minutes.',
        confidence: 76,
      },
    ],
  },

  // Urgent email with important attendees
  {
    item: {
      id: 'ai-email-5',
      subject: 'Urgent: Board Meeting Prep Materials Needed',
      from: { name: 'Executive Assistant', email: 'ea@contoso.com' },
      receivedDateTime: hoursAgo(3),
      bodyPreview: 'The CEO has requested updated project metrics for the board meeting next Monday. Please provide your department\'s Q3 results by Friday...',
      importance: 'high',
      hasAttachments: false,
      isRead: false,
      webLink: '#',
      isFlagged: false,
      isVip: false,
    },
    aiScore: 88,
    aiPriority: 'critical',
    aiSuggestion: 'Executive request - prioritize this',
    aiInsights: [
      {
        id: 'insight-5a',
        type: 'urgency',
        severity: 'critical',
        title: 'Executive request',
        description: 'This request originates from CEO level. Board meeting materials are typically high priority.',
        confidence: 96,
        reasoning: 'Email mentions CEO and board meeting. These typically have strict deadlines.',
      },
      {
        id: 'insight-5b',
        type: 'suggestion',
        severity: 'warning',
        title: 'Related task exists',
        description: 'You have a "Q3 Metrics Report" task that may contain the needed information.',
        confidence: 73,
        actionLabel: 'View task',
        actionType: 'viewTask',
      },
    ],
  },

  // Pattern detection - sender response time
  {
    item: {
      id: 'ai-email-6',
      subject: 'Quick question about the API integration',
      from: { name: 'Dev Team', email: 'dev@contoso.com' },
      receivedDateTime: hoursAgo(6),
      bodyPreview: 'We\'re running into an issue with the authentication flow. Can you clarify if we should use OAuth 2.0 or the API key approach for the external integration?',
      importance: 'normal',
      hasAttachments: false,
      isRead: false,
      webLink: '#',
      isFlagged: false,
      isVip: false,
    },
    aiScore: 65,
    aiPriority: 'medium',
    aiSuggestion: 'Technical question - may need quick clarification',
    aiInsights: [
      {
        id: 'insight-6a',
        type: 'pattern',
        severity: 'info',
        title: 'Quick response expected',
        description: 'Dev team questions typically get resolved within 4 hours. This is now 6 hours old.',
        confidence: 84,
        reasoning: 'Historical data shows 78% of dev team questions are answered within 4 hours.',
      },
      {
        id: 'insight-6b',
        type: 'suggestion',
        severity: 'info',
        title: 'Possible blocker',
        description: 'This may be blocking development work. Consider responding soon.',
        confidence: 68,
      },
    ],
  },
];

// ============================================
// AI Card Summaries
// ============================================

export const getAIEmailCardSummary = (): IAICardSummary => {
  const emails = getAIEnhancedEmails();
  // Use reduce instead of flatMap for ES5 compatibility
  const allInsights = emails.reduce<IAIInsight[]>((acc, e) => {
    return acc.concat(e.aiInsights || []);
  }, []);
  const criticalCount = allInsights.filter((i) => i.severity === 'critical').length;
  const warningCount = allInsights.filter((i) => i.severity === 'warning').length;

  return {
    insightCount: allInsights.length,
    criticalCount,
    warningCount,
    topInsight: allInsights.find((i) => i.severity === 'critical'),
    summary: criticalCount > 0
      ? `${criticalCount} urgent item${criticalCount > 1 ? 's' : ''} need${criticalCount === 1 ? 's' : ''} attention`
      : `${allInsights.length} AI insights available`,
  };
};

// ============================================
// Helper function to get AI data for an email by ID
// ============================================

export const getAIDataForEmail = (emailId: string): IAIEnhancedItem<IEmailCardItem> | undefined => {
  return getAIEnhancedEmails().find((e) => e.item.id === emailId);
};

// ============================================
// Get all AI insights across emails
// ============================================

export const getAllEmailInsights = (): IAIInsight[] => {
  // Use reduce instead of flatMap for ES5 compatibility
  return getAIEnhancedEmails().reduce<IAIInsight[]>((acc, e) => {
    return acc.concat(e.aiInsights || []);
  }, []);
};

// ============================================
// AI Enhanced WaitingOnOthers Data
// ============================================

/**
 * AI-enhanced pending response item
 */
export interface IAIEnhancedPendingResponse extends IAIEnhancedItem<PendingResponse> {
  /** Follow-up specific insights */
  followUpInsights?: {
    daysSinceLastContact: number;
    responseExpectation: 'overdue' | 'expected-soon' | 'normal';
    suggestedFollowUpAction?: string;
    escalationRecommended?: boolean;
    historicalResponseTime?: string;
    patternDetected?: string;
  };
}

/**
 * AI-enhanced person group (people who owe responses)
 */
export interface IAIEnhancedPersonGroup {
  group: PersonOwesGroup;
  aiScore: number;
  aiPriority: 'critical' | 'high' | 'medium' | 'low';
  aiInsights: IAIInsight[];
  aiSuggestion?: string;
  /** Enhanced items within the group */
  aiEnhancedItems: IAIEnhancedPendingResponse[];
}

export const getAIEnhancedWaitingOnOthers = (): IAIEnhancedPersonGroup[] => [
  // Critical - Manager hasn't responded, overdue
  {
    group: {
      person: {
        id: 'person-1',
        displayName: 'Sarah Chen',
        email: 'sarah.chen@contoso.com',
        relationship: 'manager',
        isVip: true,
      },
      pendingItems: [],
      totalWaitHours: 192, // 8 days
      longestWaitHours: 192,
      oldestItemDate: hoursAgo(192),
      itemCount: 2,
      snoozedCount: 0,
      reminderSentCount: 1,
    },
    aiScore: 95,
    aiPriority: 'critical',
    aiSuggestion: 'Consider escalation or in-person follow-up',
    aiInsights: [
      {
        id: 'wo-insight-1a',
        type: 'urgency',
        severity: 'critical',
        title: 'Response overdue by 5 days',
        description: 'Sarah usually responds within 72 hours. This is now 8 days with no response.',
        confidence: 96,
        reasoning: 'Based on 47 previous interactions, Sarah\'s average response time is 18 hours.',
        actionLabel: 'Send reminder',
        actionType: 'sendReminder',
      },
      {
        id: 'wo-insight-1b',
        type: 'suggestion',
        severity: 'warning',
        title: 'Escalation recommended',
        description: 'Given the delay and importance, consider scheduling a brief meeting.',
        confidence: 82,
        actionLabel: 'Schedule meeting',
        actionType: 'scheduleMeeting',
      },
    ],
    aiEnhancedItems: [],
  },

  // High priority - External stakeholder
  {
    group: {
      person: {
        id: 'person-2',
        displayName: 'Marcus Johnson',
        email: 'marcus.j@partner.com',
        relationship: 'external',
        isVip: true,
      },
      pendingItems: [],
      totalWaitHours: 96, // 4 days
      longestWaitHours: 96,
      oldestItemDate: hoursAgo(96),
      itemCount: 1,
      snoozedCount: 0,
      reminderSentCount: 0,
    },
    aiScore: 78,
    aiPriority: 'high',
    aiSuggestion: 'External partner - maintain relationship with polite follow-up',
    aiInsights: [
      {
        id: 'wo-insight-2a',
        type: 'pattern',
        severity: 'warning',
        title: 'Unusual delay for partner',
        description: 'Marcus typically responds within 48 hours. This is now 4 days.',
        confidence: 88,
        reasoning: 'Partner communications usually have faster turnaround due to business importance.',
      },
      {
        id: 'wo-insight-2b',
        type: 'suggestion',
        severity: 'info',
        title: 'May be traveling',
        description: 'Pattern suggests possible out-of-office. Check calendar or send gentle follow-up.',
        confidence: 65,
        actionLabel: 'Gentle reminder',
        actionType: 'sendReminder',
      },
    ],
    aiEnhancedItems: [],
  },

  // Medium priority - Direct report
  {
    group: {
      person: {
        id: 'person-3',
        displayName: 'Emily Zhang',
        email: 'emily.zhang@contoso.com',
        relationship: 'direct-report',
        isVip: false,
      },
      pendingItems: [],
      totalWaitHours: 48,
      longestWaitHours: 48,
      oldestItemDate: hoursAgo(48),
      itemCount: 3,
      snoozedCount: 0,
      reminderSentCount: 0,
    },
    aiScore: 62,
    aiPriority: 'medium',
    aiSuggestion: 'Multiple items pending - consider consolidating in 1:1',
    aiInsights: [
      {
        id: 'wo-insight-3a',
        type: 'pattern',
        severity: 'info',
        title: '3 items pending',
        description: 'Emily has 3 pending items from you. Consider consolidating in your next 1:1.',
        confidence: 92,
        reasoning: 'Detected pattern of multiple small requests. May be more efficient to discuss in person.',
      },
      {
        id: 'wo-insight-3b',
        type: 'prediction',
        severity: 'info',
        title: 'Response expected today',
        description: 'Based on historical patterns, expect a response within the next 12 hours.',
        confidence: 75,
      },
    ],
    aiEnhancedItems: [],
  },

  // Low priority - Normal wait
  {
    group: {
      person: {
        id: 'person-4',
        displayName: 'David Kim',
        email: 'david.kim@contoso.com',
        relationship: 'same-team',
        isVip: false,
      },
      pendingItems: [],
      totalWaitHours: 24,
      longestWaitHours: 24,
      oldestItemDate: hoursAgo(24),
      itemCount: 1,
      snoozedCount: 0,
      reminderSentCount: 0,
    },
    aiScore: 35,
    aiPriority: 'low',
    aiSuggestion: 'Within normal response window',
    aiInsights: [
      {
        id: 'wo-insight-4a',
        type: 'prediction',
        severity: 'info',
        title: 'On track',
        description: 'David typically responds within 48 hours. Still within expected window.',
        confidence: 94,
        reasoning: 'Historical response time for David averages 32 hours.',
      },
    ],
    aiEnhancedItems: [],
  },

  // Warning - Potential blocker
  {
    group: {
      person: {
        id: 'person-5',
        displayName: 'Alex Rivera',
        email: 'alex.rivera@contoso.com',
        relationship: 'frequent',
        isVip: false,
      },
      pendingItems: [],
      totalWaitHours: 72,
      longestWaitHours: 72,
      oldestItemDate: hoursAgo(72),
      itemCount: 1,
      snoozedCount: 0,
      reminderSentCount: 0,
    },
    aiScore: 70,
    aiPriority: 'high',
    aiSuggestion: 'May be blocking downstream work',
    aiInsights: [
      {
        id: 'wo-insight-5a',
        type: 'urgency',
        severity: 'warning',
        title: 'Potential project blocker',
        description: 'This response is needed for the API integration milestone next week.',
        confidence: 78,
        reasoning: 'Cross-referenced with your tasks and calendar. Deadline approaching.',
        actionLabel: 'Escalate',
        actionType: 'escalate',
      },
      {
        id: 'wo-insight-5b',
        type: 'pattern',
        severity: 'info',
        title: 'Busy period detected',
        description: 'Alex\'s response time has been slower this week (avg 60h vs usual 24h).',
        confidence: 71,
      },
    ],
    aiEnhancedItems: [],
  },
];

// ============================================
// AI WaitingOnOthers Card Summary
// ============================================

export const getAIWaitingOnOthersCardSummary = (): IAICardSummary => {
  const groups = getAIEnhancedWaitingOnOthers();
  const allInsights = groups.reduce<IAIInsight[]>((acc, g) => {
    return acc.concat(g.aiInsights || []);
  }, []);
  const criticalCount = allInsights.filter((i) => i.severity === 'critical').length;
  const warningCount = allInsights.filter((i) => i.severity === 'warning').length;

  return {
    insightCount: allInsights.length,
    criticalCount,
    warningCount,
    topInsight: allInsights.find((i) => i.severity === 'critical'),
    summary: criticalCount > 0
      ? `${criticalCount} overdue response${criticalCount > 1 ? 's' : ''} need${criticalCount === 1 ? 's' : ''} attention`
      : `${allInsights.length} follow-up insights available`,
  };
};

// ============================================
// Get all AI insights across WaitingOnOthers
// ============================================

export const getAllWaitingOnOthersInsights = (): IAIInsight[] => {
  return getAIEnhancedWaitingOnOthers().reduce<IAIInsight[]>((acc, g) => {
    return acc.concat(g.aiInsights || []);
  }, []);
};

// ============================================
// Get AI data for a specific person group by ID
// ============================================

export const getAIDataForPerson = (personId: string): IAIEnhancedPersonGroup | undefined => {
  return getAIEnhancedWaitingOnOthers().find((g) => g.group.person.id === personId);
};

// ============================================
// AI Enhanced TodaysAgenda Data
// ============================================

/**
 * AI-enhanced calendar event item
 */
export interface IAIEnhancedCalendarEvent extends IAIEnhancedItem<CalendarEvent> {
  /** Meeting prep specific insights */
  prepInsights?: {
    prepTimeMinutes: number;
    relatedEmails?: number;
    relatedTasks?: number;
    keyAttendees?: string[];
    conflictDetected?: boolean;
    travelTimeNeeded?: boolean;
  };
}

export const getAIEnhancedEvents = (): IAIEnhancedCalendarEvent[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return [
    // Critical - Meeting with VIP, needs prep
    {
      item: {
        id: 'ai-event-1',
        subject: 'Q4 Budget Review with CFO',
        start: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2pm today
        end: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3pm today
        location: 'Conference Room A',
        isAllDay: false,
        isOnlineMeeting: true,
        onlineMeetingUrl: '#',
        webLink: '#',
      },
      aiScore: 95,
      aiPriority: 'critical',
      aiSuggestion: 'Prep recommended - 30 min before meeting',
      prepInsights: {
        prepTimeMinutes: 30,
        relatedEmails: 3,
        relatedTasks: 1,
        keyAttendees: ['CFO', 'VP Finance'],
      },
      aiInsights: [
        {
          id: 'event-insight-1a',
          type: 'urgency',
          severity: 'critical',
          title: 'Prep recommended',
          description: 'Review Q4 budget email from Sarah before this meeting.',
          confidence: 94,
          reasoning: 'Cross-referenced with email thread about Q4 budget that requires your input.',
          actionLabel: 'View email',
          actionType: 'viewEmail',
        },
        {
          id: 'event-insight-1b',
          type: 'pattern',
          severity: 'warning',
          title: 'Key stakeholders',
          description: 'CFO and VP Finance attending. These meetings typically result in action items.',
          confidence: 91,
        },
      ],
    },

    // Warning - Back-to-back meetings
    {
      item: {
        id: 'ai-event-2',
        subject: 'Team Standup',
        start: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9am
        end: new Date(today.getTime() + 9.5 * 60 * 60 * 1000), // 9:30am
        isAllDay: false,
        isOnlineMeeting: true,
        onlineMeetingUrl: '#',
        webLink: '#',
      },
      aiScore: 65,
      aiPriority: 'medium',
      aiSuggestion: 'Back-to-back with next meeting',
      prepInsights: {
        prepTimeMinutes: 0,
        conflictDetected: true,
      },
      aiInsights: [
        {
          id: 'event-insight-2a',
          type: 'anomaly',
          severity: 'warning',
          title: 'No buffer time',
          description: 'This meeting ends at 9:30am and your next meeting starts at 9:30am.',
          confidence: 100,
          reasoning: 'Detected zero gap between consecutive meetings.',
        },
      ],
    },

    // Info - Regular recurring meeting
    {
      item: {
        id: 'ai-event-3',
        subject: 'Weekly 1:1 with Emily',
        start: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10am
        end: new Date(today.getTime() + 10.5 * 60 * 60 * 1000), // 10:30am
        isAllDay: false,
        isOnlineMeeting: true,
        onlineMeetingUrl: '#',
        webLink: '#',
      },
      aiScore: 45,
      aiPriority: 'low',
      aiSuggestion: 'Topics available from pending items',
      prepInsights: {
        prepTimeMinutes: 5,
        relatedTasks: 3,
      },
      aiInsights: [
        {
          id: 'event-insight-3a',
          type: 'suggestion',
          severity: 'info',
          title: '3 pending items',
          description: 'You have 3 items waiting on Emily. Good opportunity to discuss.',
          confidence: 88,
          reasoning: 'Cross-referenced with WaitingOnOthers data.',
          actionLabel: 'View items',
          actionType: 'viewItems',
        },
      ],
    },

    // High - External meeting needs travel
    {
      item: {
        id: 'ai-event-4',
        subject: 'Client Demo - Acme Corp',
        start: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3pm
        end: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4pm
        location: '123 Main St, Client Office',
        isAllDay: false,
        isOnlineMeeting: false,
        webLink: '#',
      },
      aiScore: 82,
      aiPriority: 'high',
      aiSuggestion: 'Leave by 2:30pm for travel time',
      prepInsights: {
        prepTimeMinutes: 45,
        travelTimeNeeded: true,
        keyAttendees: ['Client CTO'],
      },
      aiInsights: [
        {
          id: 'event-insight-4a',
          type: 'urgency',
          severity: 'warning',
          title: 'Travel time needed',
          description: 'This is an in-person meeting. Allow 25-30 minutes for travel.',
          confidence: 85,
          reasoning: 'Location is off-site. Traffic patterns suggest 25 min travel time.',
        },
        {
          id: 'event-insight-4b',
          type: 'prediction',
          severity: 'info',
          title: 'Demo prep: 15 min',
          description: 'Similar client demos typically require 15 minutes of prep time.',
          confidence: 76,
        },
      ],
    },

    // Low priority - All day event
    {
      item: {
        id: 'ai-event-5',
        subject: 'Company All-Hands (Optional)',
        start: new Date(today.getTime() + 12 * 60 * 60 * 1000), // Noon
        end: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1pm
        isAllDay: false,
        isOnlineMeeting: true,
        onlineMeetingUrl: '#',
        webLink: '#',
      },
      aiScore: 25,
      aiPriority: 'low',
      aiSuggestion: 'Recording usually available',
      aiInsights: [
        {
          id: 'event-insight-5a',
          type: 'pattern',
          severity: 'info',
          title: 'Optional attendance',
          description: 'You\'ve skipped 3 of the last 5 all-hands. Recording is usually available.',
          confidence: 90,
        },
      ],
    },
  ];
};

// ============================================
// AI TodaysAgenda Card Summary
// ============================================

export const getAIAgendaCardSummary = (): IAICardSummary => {
  const events = getAIEnhancedEvents();
  const allInsights = events.reduce<IAIInsight[]>((acc, e) => {
    return acc.concat(e.aiInsights || []);
  }, []);
  const criticalCount = allInsights.filter((i) => i.severity === 'critical').length;
  const warningCount = allInsights.filter((i) => i.severity === 'warning').length;

  return {
    insightCount: allInsights.length,
    criticalCount,
    warningCount,
    topInsight: allInsights.find((i) => i.severity === 'critical'),
    summary: criticalCount > 0
      ? `${criticalCount} meeting${criticalCount > 1 ? 's' : ''} need${criticalCount === 1 ? 's' : ''} prep`
      : warningCount > 0
      ? `${warningCount} scheduling conflict${warningCount > 1 ? 's' : ''}`
      : `${allInsights.length} meeting insights available`,
  };
};

// ============================================
// Get all AI insights across events
// ============================================

export const getAllAgendaInsights = (): IAIInsight[] => {
  return getAIEnhancedEvents().reduce<IAIInsight[]>((acc, e) => {
    return acc.concat(e.aiInsights || []);
  }, []);
};

// ============================================
// Get AI data for a specific event by ID
// ============================================

export const getAIDataForEvent = (eventId: string): IAIEnhancedCalendarEvent | undefined => {
  return getAIEnhancedEvents().find((e) => e.item.id === eventId);
};

// ============================================
// AI Enhanced MyTasks Data
// ============================================

/**
 * AI-enhanced task item
 */
export interface IAIEnhancedTaskItem extends IAIEnhancedItem<TaskItem> {
  /** Task-specific insights */
  taskInsights?: {
    estimatedMinutes?: number;
    blocksOthers?: boolean;
    blockedBy?: string[];
    relatedEmails?: number;
    relatedMeetings?: number;
    similarTasksCompleted?: number;
    suggestedTimeSlot?: string;
  };
}

export const getAIEnhancedTasks = (): IAIEnhancedTaskItem[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return [
    // Critical - Blocking task
    {
      item: {
        id: 'ai-task-1',
        title: 'Complete API documentation',
        status: 'inProgress',
        importance: 'high',
        dueDateTime: yesterday,
        listName: 'Development',
        isOverdue: true,
        webUrl: '#',
        body: 'Document all API endpoints for the integration project.',
        createdDateTime: twoDaysAgo,
        lastModifiedDateTime: now,
      },
      aiScore: 95,
      aiPriority: 'critical',
      aiSuggestion: 'Complete today - blocking 2 other tasks',
      taskInsights: {
        estimatedMinutes: 120,
        blocksOthers: true,
        relatedEmails: 2,
        similarTasksCompleted: 3,
      },
      aiInsights: [
        {
          id: 'task-insight-1a',
          type: 'urgency',
          severity: 'critical',
          title: 'Blocking work',
          description: 'This task blocks 2 other tasks assigned to your teammates.',
          confidence: 94,
          reasoning: 'Dependency analysis shows Emily and David are waiting for this.',
          actionLabel: 'Start now',
          actionType: 'startTask',
        },
        {
          id: 'task-insight-1b',
          type: 'prediction',
          severity: 'warning',
          title: 'Effort: ~2 hours',
          description: 'Based on similar documentation tasks, expect 2 hours of work.',
          confidence: 82,
          reasoning: 'Average time for your previous API documentation: 1.8 hours.',
        },
      ],
    },

    // High - Related to upcoming meeting
    {
      item: {
        id: 'ai-task-2',
        title: 'Prepare Q4 budget presentation',
        status: 'notStarted',
        importance: 'high',
        dueDateTime: tomorrow,
        listName: 'Finance',
        isOverdue: false,
        webUrl: '#',
        body: 'Create slides for the budget review meeting.',
        createdDateTime: twoDaysAgo,
      },
      aiScore: 88,
      aiPriority: 'high',
      aiSuggestion: 'Needed for tomorrow\'s CFO meeting',
      taskInsights: {
        estimatedMinutes: 90,
        relatedMeetings: 1,
        relatedEmails: 3,
        suggestedTimeSlot: 'Today 11am-12:30pm (free)',
      },
      aiInsights: [
        {
          id: 'task-insight-2a',
          type: 'urgency',
          severity: 'warning',
          title: 'Meeting dependency',
          description: 'This presentation is needed for your Q4 Budget Review meeting tomorrow.',
          confidence: 96,
          reasoning: 'Matched task subject with upcoming calendar event.',
        },
        {
          id: 'task-insight-2b',
          type: 'suggestion',
          severity: 'info',
          title: 'Best time: 11am-12:30pm',
          description: 'You have a free slot today that\'s long enough for this task.',
          confidence: 78,
          actionLabel: 'Block time',
          actionType: 'blockTime',
        },
      ],
    },

    // Medium - Recurring task
    {
      item: {
        id: 'ai-task-3',
        title: 'Review team pull requests',
        status: 'notStarted',
        importance: 'normal',
        dueDateTime: tomorrow,
        listName: 'Development',
        isOverdue: false,
        webUrl: '#',
      },
      aiScore: 55,
      aiPriority: 'medium',
      aiSuggestion: '4 PRs pending your review',
      taskInsights: {
        estimatedMinutes: 45,
        blocksOthers: true,
      },
      aiInsights: [
        {
          id: 'task-insight-3a',
          type: 'pattern',
          severity: 'info',
          title: '4 PRs pending',
          description: 'You have 4 pull requests waiting for your review.',
          confidence: 100,
          reasoning: 'Cross-referenced with GitHub integration.',
        },
        {
          id: 'task-insight-3b',
          type: 'prediction',
          severity: 'info',
          title: 'Effort: ~45 min',
          description: 'Average review time: 11 min per PR.',
          confidence: 85,
        },
      ],
    },

    // Low - Nice to have
    {
      item: {
        id: 'ai-task-4',
        title: 'Organize project files',
        status: 'notStarted',
        importance: 'low',
        dueDateTime: nextWeek,
        listName: 'Admin',
        isOverdue: false,
        webUrl: '#',
      },
      aiScore: 25,
      aiPriority: 'low',
      aiSuggestion: 'Can defer if needed',
      aiInsights: [
        {
          id: 'task-insight-4a',
          type: 'suggestion',
          severity: 'info',
          title: 'Low impact',
          description: 'This task has been deferred 3 times. Consider removing if no longer needed.',
          confidence: 72,
        },
      ],
    },

    // Warning - Overdue but lower impact
    {
      item: {
        id: 'ai-task-5',
        title: 'Update team wiki',
        status: 'inProgress',
        importance: 'normal',
        dueDateTime: twoDaysAgo,
        listName: 'Documentation',
        isOverdue: true,
        webUrl: '#',
        body: 'Update the onboarding section with new process.',
      },
      aiScore: 62,
      aiPriority: 'medium',
      aiSuggestion: 'Overdue but lower urgency',
      taskInsights: {
        estimatedMinutes: 30,
        similarTasksCompleted: 5,
      },
      aiInsights: [
        {
          id: 'task-insight-5a',
          type: 'pattern',
          severity: 'warning',
          title: 'Overdue 2 days',
          description: 'This task is overdue, but has no downstream dependencies.',
          confidence: 88,
          reasoning: 'No blockers detected. Wiki updates are typically flexible.',
        },
        {
          id: 'task-insight-5b',
          type: 'prediction',
          severity: 'info',
          title: 'Quick task: ~30 min',
          description: 'Similar wiki updates took you 25-35 minutes.',
          confidence: 81,
        },
      ],
    },
  ];
};

// ============================================
// AI MyTasks Card Summary
// ============================================

export const getAITasksCardSummary = (): IAICardSummary => {
  const tasks = getAIEnhancedTasks();
  const allInsights = tasks.reduce<IAIInsight[]>((acc, t) => {
    return acc.concat(t.aiInsights || []);
  }, []);
  const criticalCount = allInsights.filter((i) => i.severity === 'critical').length;
  const warningCount = allInsights.filter((i) => i.severity === 'warning').length;
  const blockingTasks = tasks.filter((t) => t.taskInsights?.blocksOthers).length;

  return {
    insightCount: allInsights.length,
    criticalCount,
    warningCount,
    topInsight: allInsights.find((i) => i.severity === 'critical'),
    summary: blockingTasks > 0
      ? `${blockingTasks} task${blockingTasks > 1 ? 's' : ''} blocking others`
      : criticalCount > 0
      ? `${criticalCount} urgent task${criticalCount > 1 ? 's' : ''}`
      : `${allInsights.length} task insights available`,
  };
};

// ============================================
// Get all AI insights across tasks
// ============================================

export const getAllTasksInsights = (): IAIInsight[] => {
  return getAIEnhancedTasks().reduce<IAIInsight[]>((acc, t) => {
    return acc.concat(t.aiInsights || []);
  }, []);
};

// ============================================
// Get AI data for a specific task by ID
// ============================================

export const getAIDataForTask = (taskId: string): IAIEnhancedTaskItem | undefined => {
  return getAIEnhancedTasks().find((t) => t.item.id === taskId);
};

// ============================================
// Generic AI Card Summaries
// For cards that don't have detailed AI data yet
// ============================================

export const getGenericAICardSummary = (cardType: string): IAICardSummary => {
  const summaries: Record<string, IAICardSummary> = {
    upcomingWeek: {
      insightCount: 4,
      criticalCount: 1,
      warningCount: 2,
      topInsight: {
        id: 'week-insight-1',
        type: 'pattern',
        severity: 'critical',
        title: 'Heavy meeting week',
        description: 'You have 23 meetings scheduled this week, 40% more than average.',
        confidence: 92,
      },
      summary: 'Heavy meeting week - 40% above average',
    },
    recentFiles: {
      insightCount: 3,
      criticalCount: 0,
      warningCount: 1,
      topInsight: {
        id: 'files-insight-1',
        type: 'suggestion',
        severity: 'warning',
        title: 'Stale document',
        description: 'Q3 Report.docx hasn\'t been updated in 2 weeks but has pending comments.',
        confidence: 85,
      },
      summary: '1 document needs attention',
    },
    myTeam: {
      insightCount: 2,
      criticalCount: 0,
      warningCount: 1,
      topInsight: {
        id: 'team-insight-1',
        type: 'pattern',
        severity: 'warning',
        title: 'Team availability',
        description: '3 team members have overlapping PTO next week.',
        confidence: 100,
      },
      summary: 'Potential coverage gap next week',
    },
    sharedWithMe: {
      insightCount: 2,
      criticalCount: 0,
      warningCount: 1,
      topInsight: {
        id: 'shared-insight-1',
        type: 'suggestion',
        severity: 'warning',
        title: 'Unreviewed document',
        description: 'Budget Proposal shared 5 days ago - your review was requested.',
        confidence: 88,
      },
      summary: '1 shared document awaiting review',
    },
    siteActivity: {
      insightCount: 3,
      criticalCount: 0,
      warningCount: 0,
      topInsight: {
        id: 'site-insight-1',
        type: 'anomaly',
        severity: 'info',
        title: 'Activity spike',
        description: 'Site activity is 2x higher than usual today.',
        confidence: 94,
      },
      summary: 'Unusual site activity detected',
    },
    quickLinks: {
      insightCount: 1,
      criticalCount: 0,
      warningCount: 0,
      topInsight: {
        id: 'links-insight-1',
        type: 'suggestion',
        severity: 'info',
        title: 'Frequently used',
        description: 'Consider adding SharePoint Admin as a quick link - you visit it daily.',
        confidence: 76,
      },
      summary: '1 suggested quick link',
    },
    waitingOnYou: {
      insightCount: 4,
      criticalCount: 2,
      warningCount: 1,
      topInsight: {
        id: 'woy-insight-1',
        type: 'urgency',
        severity: 'critical',
        title: 'Response overdue',
        description: 'CFO is waiting for your budget approval - 3 days overdue.',
        confidence: 98,
      },
      summary: '2 urgent items need your response',
    },
    contextSwitching: {
      insightCount: 3,
      criticalCount: 0,
      warningCount: 1,
      topInsight: {
        id: 'ctx-insight-1',
        type: 'pattern',
        severity: 'warning',
        title: 'High fragmentation',
        description: 'Your focus time is 30% below goal. Consider blocking deep work time.',
        confidence: 89,
      },
      summary: 'Focus time below goal',
    },
  };

  return summaries[cardType] || {
    insightCount: 0,
    criticalCount: 0,
    warningCount: 0,
    summary: 'No insights available',
  };
};

export const getGenericAIInsights = (cardType: string): IAIInsight[] => {
  const insightsByType: Record<string, IAIInsight[]> = {
    upcomingWeek: [
      {
        id: 'week-insight-1',
        type: 'pattern',
        severity: 'critical',
        title: 'Heavy meeting week',
        description: 'You have 23 meetings scheduled this week, 40% more than average.',
        confidence: 92,
        reasoning: 'Compared to your 6-week average of 16 meetings per week.',
      },
      {
        id: 'week-insight-2',
        type: 'suggestion',
        severity: 'warning',
        title: 'Back-to-back Wednesday',
        description: 'Wednesday has 6 consecutive meetings with no breaks.',
        confidence: 100,
      },
    ],
    recentFiles: [
      {
        id: 'files-insight-1',
        type: 'suggestion',
        severity: 'warning',
        title: 'Stale document',
        description: 'Q3 Report.docx hasn\'t been updated in 2 weeks but has pending comments.',
        confidence: 85,
      },
      {
        id: 'files-insight-2',
        type: 'pattern',
        severity: 'info',
        title: 'Frequently accessed',
        description: 'You access Budget Template.xlsx daily. Consider pinning it.',
        confidence: 91,
      },
    ],
    myTeam: [
      {
        id: 'team-insight-1',
        type: 'pattern',
        severity: 'warning',
        title: 'Team availability',
        description: '3 team members have overlapping PTO next week.',
        confidence: 100,
      },
      {
        id: 'team-insight-2',
        type: 'suggestion',
        severity: 'info',
        title: 'Check-in due',
        description: 'You haven\'t had a 1:1 with David in 3 weeks.',
        confidence: 82,
      },
    ],
  };

  return insightsByType[cardType] || [];
};
