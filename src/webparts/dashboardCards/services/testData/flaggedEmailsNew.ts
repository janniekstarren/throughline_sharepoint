// ============================================
// FlaggedEmails Test Data - Mock Data for Development
// ============================================

import {
  FlaggedEmailsData,
  FlaggedEmail,
  FlagsTrendData,
} from '../../models/FlaggedEmails';
import { TrendDataPoint } from '../../components/shared/charts';

/**
 * Generate test flagged emails data
 * Creates dynamic dates based on current time
 */
export const getTestFlaggedEmailsData = (): FlaggedEmailsData => {
  const now = new Date();

  const daysAgo = (days: number): Date => {
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  };

  const hoursAgo = (hours: number): Date => {
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  };

  // VIP senders (manager, direct reports, frequent contacts)
  // These should match the VIP list in useEmailCard.ts
  const vipSenders = {
    manager: { name: 'Sarah Chen', email: 'sarah.chen@contoso.com' },
    directReport: { name: 'Alex Kim', email: 'alex.kim@contoso.com' },
    frequent: { name: 'Michael Chen', email: 'michael.chen@contoso.com' },
  };

  const emails: FlaggedEmail[] = [
    {
      id: 'flagged-email-1',
      subject: 'Contract Review Required - Vendor Agreement',
      from: {
        name: 'Legal Department',
        email: 'legal@contoso.com',
      },
      receivedDateTime: hoursAgo(2),
      bodyPreview: 'Please review the attached vendor agreement and provide your approval by end of week. This contract is critical for the Q1 launch.',
      importance: 'high',
      hasAttachments: true,
      flagStatus: 'flagged',
      webLink: 'https://outlook.office.com/mail/item/flagged-email-1',
    },
    // VIP flagged email from manager
    {
      id: 'flagged-email-2',
      subject: 'Follow-up: Team restructuring discussion',
      from: vipSenders.manager,
      receivedDateTime: hoursAgo(5),
      bodyPreview: 'Following up on our discussion about the team restructuring. Can we schedule a call this week to finalize the org chart changes?',
      importance: 'high',
      hasAttachments: false,
      flagStatus: 'flagged',
      webLink: 'https://outlook.office.com/mail/item/flagged-email-2',
    },
    {
      id: 'flagged-email-3',
      subject: 'Action Required: Performance Review Submission',
      from: {
        name: 'HR Department',
        email: 'hr@contoso.com',
      },
      receivedDateTime: daysAgo(1),
      bodyPreview: 'This is a reminder to complete your self-assessment for the annual performance review. The deadline is approaching quickly.',
      importance: 'high',
      hasAttachments: false,
      flagStatus: 'flagged',
      webLink: 'https://outlook.office.com/mail/item/flagged-email-3',
    },
    // VIP flagged email from direct report - completed
    {
      id: 'flagged-email-4',
      subject: 'RE: Sprint Backlog Updates',
      from: vipSenders.directReport,
      receivedDateTime: daysAgo(2),
      bodyPreview: 'I have updated the sprint backlog as discussed. Let me know when you want to review the priority changes for the next sprint.',
      importance: 'normal',
      hasAttachments: false,
      flagStatus: 'complete',
      webLink: 'https://outlook.office.com/mail/item/flagged-email-4',
    },
    {
      id: 'flagged-email-5',
      subject: 'Customer Feedback Report - November',
      from: {
        name: 'Customer Success Team',
        email: 'cs@contoso.com',
      },
      receivedDateTime: daysAgo(3),
      bodyPreview: 'Attached is the customer feedback report for November. There are a few items that need product team attention regarding the new dashboard features.',
      importance: 'normal',
      hasAttachments: true,
      flagStatus: 'flagged',
      webLink: 'https://outlook.office.com/mail/item/flagged-email-5',
    },
    // VIP flagged email from frequent contact
    {
      id: 'flagged-email-6',
      subject: 'API Integration Docs Review',
      from: vipSenders.frequent,
      receivedDateTime: daysAgo(4),
      bodyPreview: 'Can you review the updated API integration documentation? I need your feedback before publishing to the external developers.',
      importance: 'normal',
      hasAttachments: true,
      flagStatus: 'flagged',
      webLink: 'https://outlook.office.com/mail/item/flagged-email-6',
    },
    {
      id: 'flagged-email-7',
      subject: 'Meeting Notes: Strategy Session',
      from: {
        name: 'Executive Assistant',
        email: 'ea@contoso.com',
      },
      receivedDateTime: daysAgo(5),
      bodyPreview: 'Please find attached the meeting notes from yesterday\'s strategy session. Action items are highlighted and need your sign-off.',
      importance: 'normal',
      hasAttachments: true,
      flagStatus: 'complete',
      webLink: 'https://outlook.office.com/mail/item/flagged-email-7',
    },
    {
      id: 'flagged-email-8',
      subject: 'Urgent: Client Escalation - TechCorp Account',
      from: {
        name: 'Account Manager',
        email: 'account.manager@contoso.com',
      },
      receivedDateTime: daysAgo(1),
      bodyPreview: 'We have an urgent escalation from the TechCorp account. They are experiencing issues with the integration and need immediate support.',
      importance: 'high',
      hasAttachments: false,
      flagStatus: 'flagged',
      webLink: 'https://outlook.office.com/mail/item/flagged-email-8',
    },
  ];

  const completedCount = emails.filter(e => e.flagStatus === 'complete').length;
  const activeEmails = emails.filter(e => e.flagStatus === 'flagged');

  // Calculate average age of active flags
  const agesInDays = activeEmails.map(e => {
    return (now.getTime() - e.receivedDateTime.getTime()) / (1000 * 60 * 60 * 24);
  });
  const averageAgeDays = agesInDays.length > 0
    ? Math.round((agesInDays.reduce((a, b) => a + b, 0) / agesInDays.length) * 10) / 10
    : 0;

  // Find oldest active flag
  const oldestFlagDays = agesInDays.length > 0
    ? Math.round(Math.max(...agesInDays))
    : 0;

  // Simulated completed this week (random between 3-7)
  const completedThisWeek = Math.floor(Math.random() * 5) + 3;

  return {
    emails,
    totalCount: emails.length,
    completedCount,
    completedThisWeek,
    averageAgeDays,
    oldestFlagDays,
  };
};

/**
 * Generate trend data for flag completion over the last 7 days
 */
export const getTestFlagsTrendData = (): FlagsTrendData => {
  const dataPoints: TrendDataPoint[] = [];
  const values: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Generate realistic flag completion counts (0-4 completed per day)
    const value = Math.floor(Math.random() * 5);
    values.push(value);

    dataPoints.push({
      date,
      value,
      label: 'completed',
    });
  }

  // Calculate trend based on first half vs second half average
  const firstHalf = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = values.slice(4).reduce((a, b) => a + b, 0) / 3;
  const diff = secondHalf - firstHalf;

  // Higher completion rate = improving, lower = worsening
  let trend: 'improving' | 'worsening' | 'stable';
  if (diff > 0.5) {
    trend = 'improving';
  } else if (diff < -0.5) {
    trend = 'worsening';
  } else {
    trend = 'stable';
  }

  const averageCompletedPerDay = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    dataPoints,
    trend,
    averageCompletedPerDay: Math.round(averageCompletedPerDay * 10) / 10,
  };
};
