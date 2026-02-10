// ============================================
// Meeting Prep Gap - Demo/Test Data
// ============================================
// Deterministic demo data for Card #15.
// All dates relative to now for realistic display.

import {
  MeetingPrepGapData,
  UnpreparedMeeting,
} from '../../models/MeetingPrepGap';

// ============================================
// Generator
// ============================================

export function generateMeetingPrepGapDemoData(): MeetingPrepGapData {
  const now = new Date();

  const unpreparedMeetings: UnpreparedMeeting[] = [
    // Meeting 1: Board presentation — high-stakes, very unprepared
    {
      id: 'prep-001',
      subject: 'Q1 Board Presentation — Revenue & Strategy',
      startDateTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
      attendeeCount: 12,
      organizer: 'David Kim (CFO)',
      hoursUntil: 4,
      relatedDocuments: [
        {
          name: 'Q1 Revenue Dashboard.pptx',
          url: 'https://contoso.sharepoint.com/sites/finance/Q1-Revenue-Dashboard.pptx',
          lastOpened: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          isOpened: false,
        },
        {
          name: 'Board Talking Points.docx',
          url: 'https://contoso.sharepoint.com/sites/finance/Board-Talking-Points.docx',
          isOpened: false,
        },
        {
          name: 'Competitive Analysis Q1.xlsx',
          url: 'https://contoso.sharepoint.com/sites/strategy/Competitive-Analysis-Q1.xlsx',
          isOpened: false,
        },
      ],
      prepScore: 20,
      isHighStakes: true,
    },
    // Meeting 2: Client review — partially prepared
    {
      id: 'prep-002',
      subject: 'Client Quarterly Review — Acme Corp',
      startDateTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
      attendeeCount: 8,
      organizer: 'Priya Patel',
      hoursUntil: 6,
      relatedDocuments: [
        {
          name: 'Acme Corp Account Summary.pptx',
          url: 'https://contoso.sharepoint.com/sites/sales/Acme-Account-Summary.pptx',
          lastOpened: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          isOpened: true,
        },
        {
          name: 'Acme Corp SLA Metrics.xlsx',
          url: 'https://contoso.sharepoint.com/sites/sales/Acme-SLA-Metrics.xlsx',
          isOpened: false,
        },
      ],
      prepScore: 40,
      isHighStakes: false,
    },
    // Meeting 3: Team standup — well prepared
    {
      id: 'prep-003',
      subject: 'Engineering Team Standup',
      startDateTime: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
      attendeeCount: 6,
      organizer: 'You',
      hoursUntil: 1,
      relatedDocuments: [
        {
          name: 'Sprint Board',
          url: 'https://contoso.sharepoint.com/sites/engineering/sprint-board',
          lastOpened: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
          isOpened: true,
        },
      ],
      prepScore: 95,
      isHighStakes: false,
    },
  ];

  return {
    unpreparedMeetings,
    stats: {
      totalUpcoming: 3,
      unpreparedCount: 2, // Board presentation (20%) and Client review (40%) < 50%
      avgPrepScore: Math.round((20 + 40 + 95) / 3),
      highStakesUnprepared: 1,
    },
  };
}
