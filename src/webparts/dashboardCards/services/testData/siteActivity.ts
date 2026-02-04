// ============================================
// Test Data - Site Activity
// ============================================

import { ISiteActivity } from '../GraphService';

/**
 * Generate test site activity
 */
export function getTestSiteActivity(): ISiteActivity[] {
  const now = new Date();

  const minutesAgo = (minutes: number): Date => {
    return new Date(now.getTime() - minutes * 60 * 1000);
  };

  return [
    {
      id: 'test-activity-1',
      action: 'edited',
      itemName: 'Project Roadmap 2024.pptx',
      itemUrl: 'https://contoso.sharepoint.com/sites/product/Project-Roadmap-2024.pptx',
      actor: 'Michael Chen',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(5),
    },
    {
      id: 'test-activity-2',
      action: 'created',
      itemName: 'Sprint Planning Notes.docx',
      itemUrl: 'https://contoso.sharepoint.com/sites/team/Sprint-Planning-Notes.docx',
      actor: 'Sarah Johnson',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(15),
    },
    {
      id: 'test-activity-3',
      action: 'shared',
      itemName: 'Q4 Budget Analysis.xlsx',
      itemUrl: 'https://contoso.sharepoint.com/sites/finance/Q4-Budget-Analysis.xlsx',
      actor: 'Finance Team',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(30),
    },
    {
      id: 'test-activity-4',
      action: 'commented on',
      itemName: 'Design Mockups.fig',
      itemUrl: 'https://contoso.sharepoint.com/sites/design/Design-Mockups.fig',
      actor: 'Lisa Anderson',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(45),
    },
    {
      id: 'test-activity-5',
      action: 'deleted',
      itemName: 'Old Template.docx',
      actor: 'David Brown',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(60),
    },
    {
      id: 'test-activity-6',
      action: 'renamed',
      itemName: 'API Documentation v2.md',
      itemUrl: 'https://contoso.sharepoint.com/sites/dev/API-Documentation-v2.md',
      actor: 'Robert Taylor',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(90),
    },
    {
      id: 'test-activity-7',
      action: 'moved',
      itemName: 'Archived Reports',
      itemUrl: 'https://contoso.sharepoint.com/sites/archive/Reports',
      actor: 'Emma Williams',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(120),
    },
    {
      id: 'test-activity-8',
      action: 'created',
      itemName: 'Meeting Recording - Client Call.mp4',
      itemUrl: 'https://contoso.sharepoint.com/sites/team/Meeting-Recording.mp4',
      actor: 'Jennifer Martinez',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(180),
    },
    {
      id: 'test-activity-9',
      action: 'edited',
      itemName: 'Employee Onboarding Checklist.xlsx',
      itemUrl: 'https://contoso.sharepoint.com/sites/hr/Onboarding-Checklist.xlsx',
      actor: 'HR Department',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(240),
    },
    {
      id: 'test-activity-10',
      action: 'restored',
      itemName: 'Legacy Code Documentation.pdf',
      itemUrl: 'https://contoso.sharepoint.com/sites/dev/Legacy-Docs.pdf',
      actor: 'James Wilson',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(300),
    },
    {
      id: 'test-activity-11',
      action: 'shared',
      itemName: 'Customer Feedback Summary.docx',
      itemUrl: 'https://contoso.sharepoint.com/sites/cs/Feedback-Summary.docx',
      actor: 'Customer Success',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(360),
    },
    {
      id: 'test-activity-12',
      action: 'modified',
      itemName: 'Security Policy.pdf',
      itemUrl: 'https://contoso.sharepoint.com/sites/it/Security-Policy.pdf',
      actor: 'IT Operations',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(420),
    },
  ];
}
