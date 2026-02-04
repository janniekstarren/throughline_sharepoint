// ============================================
// Test Data - Flagged Emails
// ============================================

import { IEmailMessage } from '../GraphService';

/**
 * Generate test flagged email messages
 */
export function getTestFlaggedEmails(): IEmailMessage[] {
  const now = new Date();

  const daysAgo = (days: number): Date => {
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  };

  return [
    {
      id: 'test-flagged-1',
      subject: 'Contract Review Required - Vendor Agreement',
      from: {
        name: 'Legal Department',
        email: 'legal@contoso.com',
      },
      receivedDateTime: daysAgo(1),
      bodyPreview: 'Please review the attached vendor agreement and provide your approval. This contract is due for signature by end of week.',
      importance: 'high',
      hasAttachments: true,
      isRead: true,
      webLink: 'https://outlook.office.com/mail/item/test-flagged-1',
    },
    {
      id: 'test-flagged-2',
      subject: 'Follow-up: Partnership Discussion with Acme Corp',
      from: {
        name: 'David Brown',
        email: 'david.brown@contoso.com',
      },
      receivedDateTime: daysAgo(2),
      bodyPreview: 'Following up on our discussion about the Acme Corp partnership. Can we schedule a call this week to finalize the terms?',
      importance: 'normal',
      hasAttachments: false,
      isRead: true,
      webLink: 'https://outlook.office.com/mail/item/test-flagged-2',
    },
    {
      id: 'test-flagged-3',
      subject: 'Action Required: Performance Review Submission',
      from: {
        name: 'HR Department',
        email: 'hr@contoso.com',
      },
      receivedDateTime: daysAgo(3),
      bodyPreview: 'This is a reminder to complete your self-assessment for the annual performance review. The deadline is approaching.',
      importance: 'high',
      hasAttachments: false,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-flagged-3',
    },
    {
      id: 'test-flagged-4',
      subject: 'RE: Project Timeline Changes',
      from: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
      },
      receivedDateTime: daysAgo(4),
      bodyPreview: 'I agree with the proposed changes. Let me know when you want to discuss the resource allocation adjustments.',
      importance: 'normal',
      hasAttachments: false,
      isRead: true,
      webLink: 'https://outlook.office.com/mail/item/test-flagged-4',
    },
    {
      id: 'test-flagged-5',
      subject: 'Customer Feedback Report - November',
      from: {
        name: 'Customer Success',
        email: 'cs@contoso.com',
      },
      receivedDateTime: daysAgo(5),
      bodyPreview: 'Attached is the customer feedback report for November. There are a few items that need product team attention.',
      importance: 'normal',
      hasAttachments: true,
      isRead: false,
      webLink: 'https://outlook.office.com/mail/item/test-flagged-5',
    },
    {
      id: 'test-flagged-6',
      subject: 'Budget Approval Needed',
      from: {
        name: 'Finance',
        email: 'finance@contoso.com',
      },
      receivedDateTime: daysAgo(7),
      bodyPreview: 'Your budget request for the new equipment is pending approval. Please provide additional justification as requested.',
      importance: 'high',
      hasAttachments: true,
      isRead: true,
      webLink: 'https://outlook.office.com/mail/item/test-flagged-6',
    },
  ];
}
