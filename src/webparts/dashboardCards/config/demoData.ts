/**
 * DemoData - Complete demo dataset for the Intelligence Hub POC
 *
 * This is a self-consistent snapshot of a fictional user's work life.
 * All data is interconnected: Alex Chen is always the manager,
 * Marcus Reid is always overloaded, Sarah Chen is always going cold.
 *
 * Used by QueryEngine for NL query responses and InsightAggregator
 * for the Insights Rollup panel.
 */

// ============================================
// Interfaces
// ============================================

export interface DemoUser {
  firstName: string;
  displayName: string;
  role: string;
  team: string;
  directReports: number;
  tier: string;
}

export interface DemoWaitingItem {
  id: string;
  name: string;
  relationship: string;
  channel: string;
  waitTime: string;
  snippet: string;
  urgency: 'critical' | 'warning' | 'info';
}

export interface DemoWaitingOnYou {
  total: number;
  urgent: number;
  managerWaitHours: number;
  items: DemoWaitingItem[];
}

export interface DemoFocusHourly {
  hour: string;
  switches: number;
}

export interface DemoFocus {
  score: number;
  assessment: string;
  switchCount: number;
  vsAverage: string;
  deepWorkBlocks: number;
  deepWorkMinutes: number;
  biggestInterrupter: string;
  interrupterCount: number;
  hourlyPattern: DemoFocusHourly[];
  bestFocusWindow: string;
}

export interface DemoPromiseItem {
  id: string;
  description: string;
  promisedTo: string;
  daysOverdue: number;
  dueIn: string;
}

export interface DemoPromises {
  overdue: number;
  atRisk: number;
  onTrack: number;
  capacityRatio: number;
  capacityAssessment: string;
  items: DemoPromiseItem[];
}

export interface DemoMeetingItem {
  id: string;
  title: string;
  time: string;
  attendees: number;
}

export interface DemoMeetings {
  tomorrowCount: number;
  tomorrowHours: number;
  freeTimeMinutes: number;
  unpreparedCount: number;
  noAgendaCount: number;
  weekTotal: number;
  weekHours: number;
  recurringPct: number;
  weekAssessment: string;
  unprepared: DemoMeetingItem[];
}

export interface DemoColdPerson {
  id: string;
  name: string;
  lastInteraction: string;
  role: string;
}

export interface DemoCollaboration {
  coldRelationships: number;
  oneWayCount: number;
  highlight: string;
  coldPeople: DemoColdPerson[];
}

export interface DemoTeamMember {
  id: string;
  name: string;
  taskCount: number;
  meetingHours: number;
  status: string;
  statusLabel: string;
}

export interface DemoTeam {
  size: number;
  overloadedCount: number;
  burnoutRisk: number;
  oneOnOneGap: string;
  members: DemoTeamMember[];
}

export interface DemoGovernance {
  staleDocuments: number;
  permissionAnomalies: number;
  complianceGaps: number;
}

export interface DemoAfterHours {
  thisWeek: number;
  lastWeek: number;
  trend: string;
  worstDay: string;
}

export interface DemoDataset {
  user: DemoUser;
  waitingOnYou: DemoWaitingOnYou;
  focus: DemoFocus;
  promises: DemoPromises;
  meetings: DemoMeetings;
  collaboration: DemoCollaboration;
  team: DemoTeam;
  governance: DemoGovernance;
  afterHours: DemoAfterHours;
}

// ============================================
// Demo Data Constant
// ============================================

export const DEMO_DATA: DemoDataset = {
  user: {
    firstName: 'Janniek',
    displayName: 'Janniek Starren',
    role: 'Senior Product Manager',
    team: 'Product & Design',
    directReports: 5,
    tier: 'Manager',
  },

  waitingOnYou: {
    total: 4,
    urgent: 2,
    managerWaitHours: 18,
    items: [
      { id: 'w1', name: 'Alex Chen', relationship: 'manager', channel: 'Teams', waitTime: '18 hours', snippet: 'Can you review the architecture doc before standup?', urgency: 'critical' },
      { id: 'w2', name: 'Priya Patel', relationship: 'cross-team', channel: 'Email', waitTime: '12 hours', snippet: 'Need your sign-off on the Q3 budget allocation', urgency: 'critical' },
      { id: 'w3', name: 'Marcus Reid', relationship: 'direct-report', channel: 'Teams', waitTime: '6 hours', snippet: 'Updated the status deck — can you take a look?', urgency: 'warning' },
      { id: 'w4', name: 'Jordan Lee', relationship: 'frequent', channel: 'Email', waitTime: '3 hours', snippet: 'Thoughts on the new onboarding flow?', urgency: 'info' },
    ],
  },

  focus: {
    score: 42,
    assessment: 'heavily fragmented',
    switchCount: 34,
    vsAverage: '37% above',
    deepWorkBlocks: 1,
    deepWorkMinutes: 47,
    biggestInterrupter: 'Teams notifications',
    interrupterCount: 14,
    hourlyPattern: [
      { hour: '8am', switches: 2 }, { hour: '9am', switches: 6 },
      { hour: '10am', switches: 3 }, { hour: '11am', switches: 8 },
      { hour: '12pm', switches: 4 }, { hour: '1pm', switches: 3 },
      { hour: '2pm', switches: 5 }, { hour: '3pm', switches: 3 },
    ],
    bestFocusWindow: 'Tuesday and Thursday, 9-11am',
  },

  promises: {
    overdue: 2,
    atRisk: 3,
    onTrack: 8,
    capacityRatio: 127,
    capacityAssessment: 'over-committed by 27%',
    items: [
      { id: 'p1', description: 'Deliver Q3 roadmap presentation', promisedTo: 'Alex Chen', daysOverdue: 3, dueIn: '' },
      { id: 'p2', description: 'Review hiring pipeline for UX role', promisedTo: 'HR Team', daysOverdue: 1, dueIn: '' },
      { id: 'p3', description: 'Finalise integration partner shortlist', promisedTo: 'Priya Patel', daysOverdue: 0, dueIn: 'tomorrow' },
      { id: 'p4', description: 'Write post-mortem for Sprint 14', promisedTo: 'Engineering', daysOverdue: 0, dueIn: '2 days' },
      { id: 'p5', description: 'Budget reforecast for H2', promisedTo: 'Finance', daysOverdue: 0, dueIn: '3 days' },
    ],
  },

  meetings: {
    tomorrowCount: 6,
    tomorrowHours: 5.5,
    freeTimeMinutes: 30,
    unpreparedCount: 3,
    noAgendaCount: 2,
    weekTotal: 24,
    weekHours: 19,
    recurringPct: 62,
    weekAssessment: 'Your week is 76% meetings — well above the 50% healthy threshold',
    unprepared: [
      { id: 'm1', title: 'Q3 Strategy Review', time: '9:00 AM', attendees: 8 },
      { id: 'm2', title: 'Partner Integration Kickoff', time: '11:30 AM', attendees: 12 },
      { id: 'm3', title: 'Board Prep Dry Run', time: '3:00 PM', attendees: 5 },
    ],
  },

  collaboration: {
    coldRelationships: 5,
    oneWayCount: 3,
    highlight: 'Sarah Chen from Design hasn\'t interacted with you in 16 days — you used to collaborate weekly.',
    coldPeople: [
      { id: 'c1', name: 'Sarah Chen', lastInteraction: '16 days ago', role: 'Design Lead — used to collaborate weekly' },
      { id: 'c2', name: 'Tom Nakamura', lastInteraction: '21 days ago', role: 'Engineering Manager — key dependency' },
      { id: 'c3', name: 'Emma Blackwood', lastInteraction: '14 days ago', role: 'External stakeholder — Contoso partnership' },
    ],
  },

  team: {
    size: 5,
    overloadedCount: 2,
    burnoutRisk: 1,
    oneOnOneGap: '2 weeks behind with Lisa (last: Jan 27)',
    members: [
      { id: 't1', name: 'Marcus Reid', taskCount: 23, meetingHours: 28, status: 'overloaded', statusLabel: 'Critical overload — 23 tasks, 28hr meetings' },
      { id: 't2', name: 'Aisha Okonkwo', taskCount: 18, meetingHours: 22, status: 'overloaded', statusLabel: 'High load — nearing capacity' },
      { id: 't3', name: 'Lisa Fernandez', taskCount: 12, meetingHours: 15, status: 'warning', statusLabel: '1:1 overdue by 2 weeks' },
      { id: 't4', name: 'David Kim', taskCount: 8, meetingHours: 12, status: 'ok', statusLabel: 'Balanced workload' },
      { id: 't5', name: 'Raj Mehta', taskCount: 10, meetingHours: 14, status: 'ok', statusLabel: 'On track' },
    ],
  },

  governance: {
    staleDocuments: 3,
    permissionAnomalies: 1,
    complianceGaps: 0,
  },

  afterHours: {
    thisWeek: 7,
    lastWeek: 4,
    trend: 'up 75%',
    worstDay: 'Monday (3 after-hours activities)',
  },
};
