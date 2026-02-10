/**
 * QueryIntents - Pattern-matched NL query intents for the Intelligence Hub
 *
 * Each intent has regex patterns that match user queries, references to
 * source card IDs (from cardRegistry.ts), and a response generator
 * that produces structured answers from the demo dataset.
 *
 * The fallback intent (always last) catches unrecognised queries.
 */

import { DemoDataset } from './demoData';

// ============================================
// Interfaces
// ============================================

export interface ResponseInsight {
  id: string;
  type: 'metric' | 'person' | 'alert' | 'trend' | 'action';
  icon: string;
  title: string;
  value: string;
  urgency: 'critical' | 'warning' | 'info' | 'positive';
  cardId: string;
  action?: {
    label: string;
    onClick: string;   // 'open-card' | 'open-email' | 'open-teams' etc.
  };
}

export interface SourceCardRef {
  cardId: string;
  cardName: string;
  category: string;
  contribution: string;
}

export interface QueryResponse {
  summary: string;
  confidence: 'high' | 'medium' | 'low';
  insights: ResponseInsight[];
  sourceCards: SourceCardRef[];
  suggestedFollowUps: string[];
}

export interface QueryIntent {
  id: string;
  patterns: RegExp[];
  cardSources: string[];
  generateResponse: (data: DemoDataset) => QueryResponse;
}

// ============================================
// Intent Registry
// ============================================

export const QUERY_INTENTS: QueryIntent[] = [
  // ═══════ WAITING / BLOCKING ═══════
  {
    id: 'waiting-on-me',
    patterns: [
      /who('s| is) waiting/i,
      /waiting on me/i,
      /need(s?) (my |a )?repl(y|ies)/i,
      /haven'?t (I )?replied/i,
      /stale (conversation|chat|thread)/i,
      /blocking anyone/i,
      /who am I keeping/i,
      /outstanding (replies|responses|messages)/i,
    ],
    cardSources: ['stale-conversations', 'approval-bottlenecks'],
    generateResponse: (data) => ({
      summary: `You have ${data.waitingOnYou.total} people waiting on you right now. ${data.waitingOnYou.urgent} are urgent — your manager Alex Chen has been waiting ${data.waitingOnYou.managerWaitHours} hours.`,
      confidence: 'high',
      insights: data.waitingOnYou.items.map(item => ({
        id: item.id,
        type: 'person' as const,
        icon: item.urgency === 'critical' ? '🔴' : item.urgency === 'warning' ? '🟡' : '🔵',
        title: item.name,
        value: `Waiting ${item.waitTime} · ${item.channel} · "${item.snippet}"`,
        urgency: item.urgency,
        cardId: 'stale-conversations',
        action: { label: 'Reply', onClick: 'open-teams' },
      })),
      sourceCards: [
        { cardId: 'stale-conversations', cardName: 'Stale Conversations', category: 'Immediate Action', contribution: `Identified ${data.waitingOnYou.total} waiting conversations` },
      ],
      suggestedFollowUps: [
        'Which of these is most urgent?',
        'How long has my manager been waiting?',
        'Show my response time trends',
      ],
    }),
  },

  // ═══════ FOCUS / FRAGMENTATION ═══════
  {
    id: 'focus-fragmentation',
    patterns: [
      /focus (score|time|block)/i,
      /fragmented/i,
      /context switch/i,
      /how (many|often) .*(switch|interrupt)/i,
      /deep work/i,
      /distract/i,
      /concentration/i,
      /productivity.*(score|today|week)/i,
    ],
    cardSources: ['context-switch-counter', 'focus-time-defender'],
    generateResponse: (data) => ({
      summary: `Your focus score today is ${data.focus.score}/100 — ${data.focus.assessment}. You've had ${data.focus.switchCount} context switches so far, which is ${data.focus.vsAverage} your weekly average.`,
      confidence: 'high',
      insights: [
        { id: 'focus-score', type: 'metric', icon: '🎯', title: 'Focus Score', value: `${data.focus.score}/100 — ${data.focus.assessment}`, urgency: data.focus.score < 40 ? 'critical' : data.focus.score < 60 ? 'warning' : 'positive', cardId: 'focus-time-defender' },
        { id: 'switch-count', type: 'metric', icon: '🔄', title: 'Context Switches', value: `${data.focus.switchCount} today (${data.focus.vsAverage} avg)`, urgency: data.focus.switchCount > 30 ? 'warning' : 'info', cardId: 'context-switch-counter' },
        { id: 'deep-work', type: 'metric', icon: '🧘', title: 'Deep Work Blocks', value: `${data.focus.deepWorkBlocks} blocks (${data.focus.deepWorkMinutes} min total)`, urgency: data.focus.deepWorkBlocks < 2 ? 'warning' : 'positive', cardId: 'focus-time-defender' },
        { id: 'worst-offender', type: 'alert', icon: '⚠️', title: 'Biggest Interrupter', value: `${data.focus.biggestInterrupter} (${data.focus.interrupterCount} interruptions)`, urgency: 'warning', cardId: 'context-switch-counter' },
      ],
      sourceCards: [
        { cardId: 'context-switch-counter', cardName: 'Context Switch Counter', category: 'Productivity Patterns', contribution: `Tracked ${data.focus.switchCount} switches` },
        { cardId: 'focus-time-defender', cardName: 'Focus Time Defender', category: 'Productivity Patterns', contribution: `Measured ${data.focus.deepWorkMinutes} min deep work` },
      ],
      suggestedFollowUps: [
        'When am I most focused during the day?',
        'What\'s interrupting me most?',
        'How does this compare to last week?',
      ],
    }),
  },

  // ═══════ COMMITMENTS / PROMISES ═══════
  {
    id: 'broken-promises',
    patterns: [
      /promise/i,
      /commit(ment|ted)/i,
      /overdue/i,
      /behind on/i,
      /missed deadline/i,
      /follow.?up/i,
      /dropped.?ball/i,
      /what('s| did I) (say|commit|promise)/i,
      /over.?commit/i,
    ],
    cardSources: ['broken-promises', 'commitment-vs-capacity'],
    generateResponse: (data) => ({
      summary: `You have ${data.promises.overdue} overdue commitments and ${data.promises.atRisk} at risk of slipping. Your commitment-to-capacity ratio is ${data.promises.capacityRatio}% — ${data.promises.capacityAssessment}.`,
      confidence: 'high',
      insights: data.promises.items.map(item => ({
        id: item.id,
        type: 'alert' as const,
        icon: item.daysOverdue > 0 ? '🔥' : '⚠️',
        title: item.description,
        value: item.daysOverdue > 0 ? `${item.daysOverdue} days overdue · promised to ${item.promisedTo}` : `Due ${item.dueIn} · for ${item.promisedTo}`,
        urgency: item.daysOverdue > 2 ? 'critical' as const : item.daysOverdue > 0 ? 'warning' as const : 'info' as const,
        cardId: 'broken-promises',
      })),
      sourceCards: [
        { cardId: 'broken-promises', cardName: 'Broken Promises', category: 'Immediate Action', contribution: `Found ${data.promises.overdue} overdue items` },
        { cardId: 'commitment-vs-capacity', cardName: 'Commitment vs. Capacity', category: 'Productivity Patterns', contribution: `Capacity ratio: ${data.promises.capacityRatio}%` },
      ],
      suggestedFollowUps: [
        'Which promise is most at risk?',
        'Am I over-committed this week?',
        'What can I delegate?',
      ],
    }),
  },

  // ═══════ COLLABORATION / RELATIONSHIPS ═══════
  {
    id: 'collaboration-health',
    patterns: [
      /collaborat/i,
      /relationship/i,
      /going cold/i,
      /communi.*debt/i,
      /network/i,
      /who.*(lost touch|cold|silent)/i,
      /team health/i,
      /one.?way.*convo/i,
    ],
    cardSources: ['communication-debt', 'network-drift', 'silent-stakeholders', 'one-way-conversations'],
    generateResponse: (data) => ({
      summary: `${data.collaboration.coldRelationships} relationships are going cold, and you have ${data.collaboration.oneWayCount} one-way conversations where you're doing all the talking. ${data.collaboration.highlight}`,
      confidence: 'high',
      insights: [
        { id: 'cold-count', type: 'metric', icon: '🥶', title: 'Relationships Going Cold', value: `${data.collaboration.coldRelationships} people (no interaction in 14+ days)`, urgency: data.collaboration.coldRelationships > 3 ? 'warning' : 'info', cardId: 'communication-debt' },
        ...data.collaboration.coldPeople.map(p => ({
          id: p.id, type: 'person' as const, icon: '💬', title: p.name,
          value: `Last interaction: ${p.lastInteraction} · ${p.role}`,
          urgency: 'warning' as const, cardId: 'communication-debt',
          action: { label: 'Reach out', onClick: 'open-teams' },
        })),
        { id: 'one-way', type: 'metric', icon: '📢', title: 'One-Way Conversations', value: `${data.collaboration.oneWayCount} threads where you're the only one talking`, urgency: 'info', cardId: 'one-way-conversations' },
      ],
      sourceCards: [
        { cardId: 'communication-debt', cardName: 'Communication Debt', category: 'Collaboration Health', contribution: `${data.collaboration.coldRelationships} cold relationships` },
        { cardId: 'one-way-conversations', cardName: 'One-Way Conversations', category: 'Collaboration Health', contribution: `${data.collaboration.oneWayCount} one-sided threads` },
      ],
      suggestedFollowUps: [
        'Who\'s the most important person I\'m losing touch with?',
        'Show my communication patterns',
        'Any silent stakeholders I should worry about?',
      ],
    }),
  },

  // ═══════ MEETINGS / CALENDAR ═══════
  {
    id: 'meetings',
    patterns: [
      /meeting/i,
      /calendar/i,
      /schedule/i,
      /tomorrow/i,
      /this week/i,
      /prep(ar)/i,
      /agenda/i,
      /free time/i,
      /meeting.*(overload|heavy|too many)/i,
    ],
    cardSources: ['meeting-preparation-gap', 'meeting-roi-tracker', 'focus-time-defender'],
    generateResponse: (data) => ({
      summary: `Tomorrow you have ${data.meetings.tomorrowCount} meetings (${data.meetings.tomorrowHours} hours). ${data.meetings.unpreparedCount} have no preparation, and ${data.meetings.noAgendaCount} have no agenda. ${data.meetings.weekAssessment}.`,
      confidence: 'high',
      insights: [
        { id: 'tomorrow', type: 'metric', icon: '📅', title: 'Tomorrow', value: `${data.meetings.tomorrowCount} meetings · ${data.meetings.tomorrowHours}hrs · ${data.meetings.freeTimeMinutes}min free`, urgency: data.meetings.freeTimeMinutes < 60 ? 'critical' : 'info', cardId: 'meeting-roi-tracker' },
        ...data.meetings.unprepared.map(m => ({
          id: m.id, type: 'alert' as const, icon: '⚠️', title: m.title,
          value: `${m.time} · ${m.attendees} attendees · No prep done`,
          urgency: 'warning' as const, cardId: 'meeting-preparation-gap',
        })),
        { id: 'week-load', type: 'trend', icon: '📊', title: 'This Week', value: `${data.meetings.weekTotal} meetings · ${data.meetings.weekHours}hrs total · ${data.meetings.recurringPct}% recurring`, urgency: data.meetings.weekHours > 25 ? 'warning' : 'info', cardId: 'meeting-roi-tracker' },
      ],
      sourceCards: [
        { cardId: 'meeting-preparation-gap', cardName: 'Meeting Preparation Gap', category: 'Immediate Action', contribution: `${data.meetings.unpreparedCount} unprepared meetings` },
        { cardId: 'meeting-roi-tracker', cardName: 'Meeting ROI Tracker', category: 'Productivity Patterns', contribution: `${data.meetings.weekHours}hrs this week` },
      ],
      suggestedFollowUps: [
        'Which meetings can I skip?',
        'What should I prepare for tomorrow?',
        'How does my meeting load compare to last week?',
      ],
    }),
  },

  // ═══════ DAY SUMMARY ═══════
  {
    id: 'daily-summary',
    patterns: [
      /summar(y|ise)/i,
      /what('s| is) (going on|happening)/i,
      /brief(ing)?/i,
      /overview/i,
      /what should I (know|do|focus)/i,
      /catch me up/i,
      /what('s|s) (new|important)/i,
      /today/i,
      /attention/i,
    ],
    cardSources: ['stale-conversations', 'context-switch-counter', 'broken-promises', 'meeting-preparation-gap', 'communication-debt'],
    generateResponse: (data) => ({
      summary: `Here's your briefing: ${data.waitingOnYou.urgent} urgent items need replies, you have ${data.promises.overdue} overdue commitments, and tomorrow's calendar is ${data.meetings.tomorrowHours > 5 ? 'packed' : 'manageable'} at ${data.meetings.tomorrowHours} hours of meetings.`,
      confidence: 'high',
      insights: [
        { id: 'urgent', type: 'alert', icon: '🔴', title: 'Urgent Replies Needed', value: `${data.waitingOnYou.urgent} people waiting (${data.waitingOnYou.total} total)`, urgency: 'critical', cardId: 'stale-conversations' },
        { id: 'overdue', type: 'alert', icon: '🔥', title: 'Overdue Commitments', value: `${data.promises.overdue} past due, ${data.promises.atRisk} at risk`, urgency: data.promises.overdue > 0 ? 'critical' : 'info', cardId: 'broken-promises' },
        { id: 'focus', type: 'metric', icon: '🎯', title: 'Focus Score', value: `${data.focus.score}/100 — ${data.focus.switchCount} switches so far`, urgency: data.focus.score < 50 ? 'warning' : 'positive', cardId: 'context-switch-counter' },
        { id: 'calendar', type: 'metric', icon: '📅', title: 'Tomorrow', value: `${data.meetings.tomorrowCount} meetings (${data.meetings.unpreparedCount} need prep)`, urgency: data.meetings.unpreparedCount > 0 ? 'warning' : 'info', cardId: 'meeting-preparation-gap' },
        { id: 'cold', type: 'metric', icon: '💬', title: 'Relationships', value: `${data.collaboration.coldRelationships} going cold`, urgency: data.collaboration.coldRelationships > 3 ? 'warning' : 'info', cardId: 'communication-debt' },
      ],
      sourceCards: [
        { cardId: 'stale-conversations', cardName: 'Stale Conversations', category: 'Immediate Action', contribution: `${data.waitingOnYou.total} waiting` },
        { cardId: 'broken-promises', cardName: 'Broken Promises', category: 'Immediate Action', contribution: `${data.promises.overdue} overdue` },
        { cardId: 'context-switch-counter', cardName: 'Context Switch Counter', category: 'Productivity Patterns', contribution: `Focus: ${data.focus.score}/100` },
        { cardId: 'meeting-preparation-gap', cardName: 'Meeting Prep Gap', category: 'Immediate Action', contribution: `${data.meetings.unpreparedCount} unprepped` },
        { cardId: 'communication-debt', cardName: 'Communication Debt', category: 'Collaboration Health', contribution: `${data.collaboration.coldRelationships} cold` },
      ],
      suggestedFollowUps: [
        'Who should I reply to first?',
        'What can I delegate?',
        'How\'s my week looking?',
      ],
    }),
  },

  // ═══════ MANAGER-SPECIFIC ═══════
  {
    id: 'team-health',
    patterns: [
      /team/i,
      /direct report/i,
      /burnout/i,
      /delegat/i,
      /1.?on.?1|one.?on.?one/i,
      /attrition/i,
      /workload.*(balance|distribution)/i,
      /who('s| is) overloaded/i,
    ],
    cardSources: ['delegation-balance', 'team-burnout-signals', 'one-on-one-gap-detection', 'attrition-risk-signals'],
    generateResponse: (data) => ({
      summary: `Your team of ${data.team.size} has ${data.team.overloadedCount} members showing overload signals. ${data.team.burnoutRisk} are flagged for burnout risk, and you're ${data.team.oneOnOneGap} on 1:1s.`,
      confidence: 'medium',
      insights: [
        { id: 'overloaded', type: 'alert', icon: '🔥', title: 'Overloaded Team Members', value: `${data.team.overloadedCount} of ${data.team.size} showing high load`, urgency: data.team.overloadedCount > 2 ? 'critical' : 'warning', cardId: 'delegation-balance' },
        ...data.team.members.filter(m => m.status !== 'ok').map(m => ({
          id: m.id, type: 'person' as const, icon: m.status === 'overloaded' ? '🔴' : '🟡',
          title: m.name, value: `${m.taskCount} active tasks · ${m.meetingHours}hrs meetings · ${m.statusLabel}`,
          urgency: (m.status === 'overloaded' ? 'critical' : 'warning') as 'critical' | 'warning',
          cardId: 'delegation-balance',
        })),
        { id: '1on1', type: 'metric', icon: '👥', title: '1:1 Coverage', value: data.team.oneOnOneGap, urgency: 'info', cardId: 'one-on-one-gap-detection' },
      ],
      sourceCards: [
        { cardId: 'delegation-balance', cardName: 'Delegation Balance', category: 'Manager Toolkit', contribution: `${data.team.overloadedCount} overloaded` },
        { cardId: 'team-burnout-signals', cardName: 'Team Burnout Signals', category: 'Manager Toolkit', contribution: `${data.team.burnoutRisk} at risk` },
      ],
      suggestedFollowUps: [
        'Who should I redistribute work from?',
        'When was my last 1:1 with each report?',
        'Show attrition risk signals',
      ],
    }),
  },

  // ═══════ FALLBACK ═══════
  {
    id: 'fallback',
    patterns: [/.*/],  // Matches everything — always last in the array
    cardSources: [],
    generateResponse: () => ({
      summary: 'I\'m not sure I understand that question yet, but here are some things I can help with. Try asking about who\'s waiting on you, your focus score, upcoming meetings, or your team\'s workload.',
      confidence: 'low',
      insights: [],
      sourceCards: [],
      suggestedFollowUps: [
        'What needs my attention today?',
        'Who\'s waiting on me?',
        'How\'s my focus score?',
        'Show my team\'s workload',
      ],
    }),
  },
];
