// ============================================
// UnreadInbox Test Data - Mock Data for Development
// ============================================

import {
  UnreadInboxData,
  EmailMessage,
  InboxTrendData,
} from '../../models/UnreadInbox';
import { TrendDataPoint } from '../../components/shared/charts';

/**
 * Generate test unread emails
 * Creates dynamic dates based on current time
 */
export const getTestUnreadInboxData = (): UnreadInboxData => {
  const now = new Date();

  const hoursAgo = (hours: number): Date => {
    const date = new Date(now);
    date.setHours(date.getHours() - hours);
    return date;
  };

  // VIP senders (manager, direct reports, frequent contacts)
  // These should match the VIP list in useEmailCard.ts
  const vipSenders = {
    manager: { name: 'Sarah Chen', email: 'sarah.chen@contoso.com' },
    directReport: { name: 'Alex Kim', email: 'alex.kim@contoso.com' },
    frequent: { name: 'Michael Chen', email: 'michael.chen@contoso.com' },
  };

  const emails: EmailMessage[] = [
    // VIP email from manager - HIGH priority
    {
      id: 'test-email-1',
      subject: 'URGENT: Q4 Budget Approval Required',
      from: vipSenders.manager,
      receivedDateTime: hoursAgo(1),
      bodyPreview: 'Hi, I need your approval on the Q4 budget proposal. The deadline is end of day today. Please review the attached document and let me know if you have any questions.',
      importance: 'high',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-1',
    },
    // VIP email from frequent contact
    {
      id: 'test-email-2',
      subject: 'Re: Project Timeline Update',
      from: vipSenders.frequent,
      receivedDateTime: hoursAgo(2),
      bodyPreview: 'Thanks for the update. I have reviewed the new timeline and it looks good. Let me know when you want to schedule the kickoff meeting.',
      importance: 'normal',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-2',
    },
    {
      id: 'test-email-3',
      subject: 'Meeting Notes: Client Presentation',
      from: {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@contoso.com',
      },
      receivedDateTime: hoursAgo(3),
      bodyPreview: 'Here are the notes from today\'s client presentation. Key action items are highlighted. Please review and add any additional comments.',
      importance: 'normal',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-3',
    },
    {
      id: 'test-email-4',
      subject: 'IMPORTANT: Security Training Reminder',
      from: {
        name: 'IT Security Team',
        email: 'security@contoso.com',
      },
      receivedDateTime: hoursAgo(5),
      bodyPreview: 'This is a reminder that your annual security training is due by Friday. Please complete the modules in the learning portal.',
      importance: 'high',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-4',
    },
    {
      id: 'test-email-5',
      subject: 'Team Lunch Tomorrow',
      from: {
        name: 'Rachel Green',
        email: 'rachel.green@contoso.com',
      },
      receivedDateTime: hoursAgo(8),
      bodyPreview: 'Hi everyone! Just a reminder about our team lunch tomorrow at 12:30 PM. We will be going to the new Italian restaurant downtown.',
      importance: 'low',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-5',
    },
    // VIP email from direct report - HIGH priority code review
    {
      id: 'test-email-6',
      subject: 'Re: Code Review Request - PR #1234',
      from: vipSenders.directReport,
      receivedDateTime: hoursAgo(12),
      bodyPreview: 'I have addressed all the feedback from the code review. Could you please take another look when you have a chance? The PR is blocking the release.',
      importance: 'high',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-6',
    },
    {
      id: 'test-email-7',
      subject: 'Weekly Status Report',
      from: {
        name: 'David Park',
        email: 'david.park@contoso.com',
      },
      receivedDateTime: hoursAgo(18),
      bodyPreview: 'Please find attached the weekly status report for the development team. Key highlights include completion of sprint goals and upcoming milestones.',
      importance: 'normal',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-7',
    },
    {
      id: 'test-email-8',
      subject: 'Vendor Contract Review',
      from: {
        name: 'James Wilson',
        email: 'james.wilson@external.com',
      },
      receivedDateTime: hoursAgo(24),
      bodyPreview: 'Hi, I have attached the updated vendor contract for your review. Legal has approved the terms. Please sign and return by end of week.',
      importance: 'normal',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-8',
    },
    // Another VIP email from manager
    {
      id: 'test-email-9',
      subject: 'Quick sync about Q1 planning',
      from: vipSenders.manager,
      receivedDateTime: hoursAgo(36),
      bodyPreview: 'I would like to discuss the Q1 planning and team structure changes with you. Can we schedule a quick call this week? I have some ideas that might help.',
      importance: 'normal',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-9',
    },
    {
      id: 'test-email-10',
      subject: 'Holiday Schedule Announcement',
      from: {
        name: 'HR Department',
        email: 'hr@contoso.com',
      },
      receivedDateTime: hoursAgo(48),
      bodyPreview: 'Please review the attached holiday schedule for the upcoming year. Make sure to submit your time-off requests early for popular dates.',
      importance: 'low',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/inbox/id/test-email-10',
    },
  ];

  const highImportanceCount = emails.filter(e => e.importance === 'high').length;
  const attachmentCount = emails.filter(e => e.hasAttachments).length;

  // Calculate oldest unread hours
  const oldestEmail = emails.reduce((oldest, email) => {
    return email.receivedDateTime < oldest.receivedDateTime ? email : oldest;
  }, emails[0]);
  const oldestUnreadHours = oldestEmail
    ? Math.floor((now.getTime() - oldestEmail.receivedDateTime.getTime()) / (1000 * 60 * 60))
    : 0;

  return {
    emails,
    totalCount: emails.length,
    highImportanceCount,
    highPriorityCount: highImportanceCount,
    attachmentCount,
    oldestUnreadHours,
  };
};

/**
 * Generate trend data for the last 7 days of email volume
 */
export const getTestInboxTrendData = (): InboxTrendData => {
  const dataPoints: TrendDataPoint[] = [];
  const values: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Generate realistic email counts (5-25 emails per day)
    const value = Math.floor(Math.random() * 21) + 5;
    values.push(value);

    dataPoints.push({
      date,
      value,
      label: 'emails',
    });
  }

  // Calculate trend based on first half vs second half average
  const firstHalf = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = values.slice(4).reduce((a, b) => a + b, 0) / 3;
  const diff = secondHalf - firstHalf;

  let trend: 'fewer' | 'more' | 'steady';
  if (diff > 2) {
    trend = 'more';
  } else if (diff < -2) {
    trend = 'fewer';
  } else {
    trend = 'steady';
  }

  const averageEmailsPerDay = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    dataPoints,
    trend,
    averageEmailsPerDay: Math.round(averageEmailsPerDay * 10) / 10,
  };
};
