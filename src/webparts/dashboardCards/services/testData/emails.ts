// ============================================
// Test Data - Unread Emails
// ============================================

import { IEmailMessage } from '../GraphService';

/**
 * Generate test unread email messages
 */
export function getTestEmails(): IEmailMessage[] {
  const now = new Date();

  const hoursAgo = (hours: number): Date => {
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  };

  return [
    {
      id: 'test-email-1',
      subject: 'Q4 Budget Proposal - Action Required',
      from: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
      },
      receivedDateTime: hoursAgo(1),
      bodyPreview: 'Hi team, please review the attached Q4 budget proposal and provide your feedback by end of day Friday. We need to finalize the numbers before the board meeting next week.',
      importance: 'high',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-1',
    },
    {
      id: 'test-email-2',
      subject: 'New Campaign Assets Ready for Review',
      from: {
        name: 'Marketing Team',
        email: 'marketing@contoso.com',
      },
      receivedDateTime: hoursAgo(2),
      bodyPreview: 'The creative team has finished the new campaign assets. Please review and let us know if any changes are needed before we go live.',
      importance: 'normal',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-2',
    },
    {
      id: 'test-email-3',
      subject: 'Reminder: Benefits Enrollment Deadline',
      from: {
        name: 'HR Department',
        email: 'hr@contoso.com',
      },
      receivedDateTime: hoursAgo(4),
      bodyPreview: 'This is a friendly reminder that the benefits enrollment period ends this Friday. Please make sure to complete your selections in the benefits portal.',
      importance: 'normal',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-3',
    },
    {
      id: 'test-email-4',
      subject: 'RE: Sprint Planning - Updated Timeline',
      from: {
        name: 'Michael Chen',
        email: 'michael.chen@contoso.com',
      },
      receivedDateTime: hoursAgo(5),
      bodyPreview: 'Thanks for the update. I think we should push the API integration to next sprint. Let me know what you think about the revised timeline.',
      importance: 'normal',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-4',
    },
    {
      id: 'test-email-5',
      subject: 'URGENT: Server Maintenance Tonight',
      from: {
        name: 'IT Operations',
        email: 'it-ops@contoso.com',
      },
      receivedDateTime: hoursAgo(6),
      bodyPreview: 'Please be advised that we will be performing scheduled maintenance on the production servers tonight from 10 PM to 2 AM. Expect brief service interruptions.',
      importance: 'high',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-5',
    },
    {
      id: 'test-email-6',
      subject: 'Meeting Notes: Product Strategy Session',
      from: {
        name: 'Emma Williams',
        email: 'emma.williams@contoso.com',
      },
      receivedDateTime: hoursAgo(8),
      bodyPreview: 'Hi everyone, attached are the meeting notes from today\'s product strategy session. Please review the action items and update your tasks accordingly.',
      importance: 'normal',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-6',
    },
    {
      id: 'test-email-7',
      subject: 'Invoice #INV-2024-0892 - Payment Received',
      from: {
        name: 'Finance',
        email: 'finance@contoso.com',
      },
      receivedDateTime: hoursAgo(12),
      bodyPreview: 'This is to confirm that payment for invoice #INV-2024-0892 has been received. Thank you for your prompt payment.',
      importance: 'normal',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-7',
    },
    {
      id: 'test-email-8',
      subject: 'Team Building Event - RSVP Required',
      from: {
        name: 'Office Manager',
        email: 'office.manager@contoso.com',
      },
      receivedDateTime: hoursAgo(18),
      bodyPreview: 'We\'re organizing a team building event next month! Please RSVP by clicking the link below and let us know your dietary preferences.',
      importance: 'normal',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-8',
    },
    {
      id: 'test-email-9',
      subject: 'Weekly Status Report - Week 45',
      from: {
        name: 'Project Coordinator',
        email: 'coordinator@contoso.com',
      },
      receivedDateTime: hoursAgo(24),
      bodyPreview: 'Please find attached the weekly status report for Week 45. Key highlights include the successful launch of the beta feature and customer feedback summary.',
      importance: 'normal',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-9',
    },
    {
      id: 'test-email-10',
      subject: 'FW: Partnership Opportunity - Acme Corp',
      from: {
        name: 'David Brown',
        email: 'david.brown@contoso.com',
      },
      receivedDateTime: hoursAgo(36),
      bodyPreview: 'Forwarding this for your review. Acme Corp is interested in exploring a partnership. Could you take a look and let me know if this aligns with our strategy?',
      importance: 'normal',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-email-10',
    },
  ];
}
