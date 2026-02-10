// ============================================
// Approval Bottlenecks - Demo/Test Data
// ============================================
// Deterministic demo data for Card #2.
// All dates relative to now for realistic display.

import {
  ApprovalBottlenecksData,
  PendingApproval,
} from '../../models/ApprovalBottlenecks';
import { Person } from '../../models/WaitingOnYou';

// ============================================
// Demo People
// ============================================

const jessicaWong: Person = {
  id: 'user-jessica-wong',
  displayName: 'Jessica Wong',
  email: 'jessica.wong@contoso.com',
  relationship: 'direct-report',
};

const marcusRiley: Person = {
  id: 'user-marcus-riley',
  displayName: 'Marcus Riley',
  email: 'marcus.riley@contoso.com',
  relationship: 'direct-report',
};

const alexChen: Person = {
  id: 'user-alex-chen',
  displayName: 'Alex Chen',
  email: 'alex.chen@contoso.com',
  relationship: 'frequent',
};

const priyaPatel: Person = {
  id: 'user-priya-patel',
  displayName: 'Priya Patel',
  email: 'priya.patel@contoso.com',
  relationship: 'same-team',
};

const tomBaker: Person = {
  id: 'user-tom-baker',
  displayName: 'Tom Baker',
  email: 'tom.baker@contoso.com',
  relationship: 'same-team',
};

// ============================================
// Generator
// ============================================

export function getTestApprovalBottlenecksData(): ApprovalBottlenecksData {
  const now = new Date();

  const pendingApprovals: PendingApproval[] = [
    {
      id: 'appr-001',
      title: 'Q1 Marketing Budget — $45,000 Campaign Spend',
      requestor: jessicaWong,
      requestedDateTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      waitDurationHours: 72,
      type: 'purchase-order',
      urgencyScore: 9,
      urgencyFactors: [
        { factor: 'wait-time-high', points: 2, description: 'Waiting 3 days' },
        { factor: 'sender-direct', points: 1, description: 'From direct report' },
        { factor: 'content-deadline', points: 2, description: 'Vendor deadline Friday' },
      ],
      sourceUrl: 'https://contoso.sharepoint.com/approvals/appr-001',
      amount: 45000,
      currency: 'USD',
      isOverdue: true,
      statedDeadline: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      delegatable: true,
      blockedPeopleCount: 4,
      blockedItems: ['Campaign creative production', 'Media buy scheduling', 'Agency onboarding'],
    },
    {
      id: 'appr-002',
      title: 'Annual Leave Request — Dec 23-Jan 3',
      requestor: marcusRiley,
      requestedDateTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      waitDurationHours: 48,
      type: 'leave-request',
      urgencyScore: 7,
      urgencyFactors: [
        { factor: 'wait-time-moderate', points: 1, description: 'Waiting 2 days' },
        { factor: 'sender-direct', points: 1, description: 'From direct report' },
      ],
      sourceUrl: 'https://contoso.sharepoint.com/approvals/appr-002',
      isOverdue: false,
      delegatable: false,
      blockedPeopleCount: 1,
      blockedItems: ['Flights not yet booked'],
    },
    {
      id: 'appr-003',
      title: 'Technical Design Document — API Gateway Migration',
      requestor: alexChen,
      requestedDateTime: new Date(now.getTime() - 120 * 60 * 60 * 1000),
      waitDurationHours: 120,
      type: 'document-approval',
      urgencyScore: 10,
      urgencyFactors: [
        { factor: 'wait-time-extreme', points: 3, description: 'Waiting 5 days' },
        { factor: 'content-deadline', points: 2, description: 'Sprint starts Monday' },
      ],
      sourceUrl: 'https://contoso.sharepoint.com/sites/engineering/docs/api-gateway-design.docx',
      associatedDocument: 'API Gateway Migration — Technical Design v2.3',
      isOverdue: true,
      statedDeadline: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      delegatable: true,
      blockedPeopleCount: 6,
      blockedItems: ['Backend sprint planning', 'Infrastructure provisioning', 'QA test plan'],
    },
    {
      id: 'appr-004',
      title: 'Expense Report — Client Dinner (Acme Corp)',
      requestor: priyaPatel,
      requestedDateTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      waitDurationHours: 24,
      type: 'expense-report',
      urgencyScore: 4,
      urgencyFactors: [
        { factor: 'wait-time-moderate', points: 1, description: 'Waiting 1 day' },
      ],
      sourceUrl: 'https://contoso.sharepoint.com/approvals/appr-004',
      amount: 380,
      currency: 'USD',
      isOverdue: false,
      delegatable: true,
      blockedPeopleCount: 0,
    },
    {
      id: 'appr-005',
      title: 'SharePoint Site Access — External Contractor (DataViz Ltd)',
      requestor: tomBaker,
      requestedDateTime: new Date(now.getTime() - 36 * 60 * 60 * 1000),
      waitDurationHours: 36,
      type: 'access-request',
      urgencyScore: 6,
      urgencyFactors: [
        { factor: 'wait-time-moderate', points: 1, description: 'Waiting 1.5 days' },
      ],
      sourceUrl: 'https://contoso.sharepoint.com/approvals/appr-005',
      isOverdue: false,
      statedDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      delegatable: true,
      blockedPeopleCount: 2,
      blockedItems: ['Contractor onboarding'],
    },
  ];

  return {
    pendingApprovals,
    stats: {
      totalPending: pendingApprovals.length,
      overdueCount: pendingApprovals.filter(a => a.isOverdue).length,
      avgWaitHours: Math.round(
        pendingApprovals.reduce((sum, a) => sum + a.waitDurationHours, 0) / pendingApprovals.length
      ),
      oldestWaitHours: Math.max(...pendingApprovals.map(a => a.waitDurationHours)),
      blockedPeopleTotal: pendingApprovals.reduce((sum, a) => sum + a.blockedPeopleCount, 0),
    },
    trendData: [
      { date: 'Mon', value: 3 },
      { date: 'Tue', value: 4 },
      { date: 'Wed', value: 4 },
      { date: 'Thu', value: 5 },
      { date: 'Fri', value: 3 },
      { date: 'Sat', value: 3 },
      { date: 'Sun', value: 5 },
    ],
  };
}
