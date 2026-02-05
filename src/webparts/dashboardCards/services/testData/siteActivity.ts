// ============================================
// Test Data - Site Activity
// ============================================

import { ActivityItem, SiteActivityData, ActivityTrendData } from '../../models/SiteActivity';
import { TrendDataPoint } from '../../components/shared/charts';
import { ISiteActivity } from '../GraphService';

/**
 * Generate test activity items with variety of actions
 */
function getTestActivityItems(): ActivityItem[] {
  const now = new Date();

  const minutesAgo = (minutes: number): Date => {
    return new Date(now.getTime() - minutes * 60 * 1000);
  };

  return [
    {
      id: 'activity-1',
      action: 'edited',
      itemName: 'Project Roadmap 2024.pptx',
      itemUrl: 'https://contoso.sharepoint.com/sites/product/Project-Roadmap-2024.pptx',
      actor: 'Michael Chen',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(5),
    },
    {
      id: 'activity-2',
      action: 'created',
      itemName: 'Sprint Planning Notes.docx',
      itemUrl: 'https://contoso.sharepoint.com/sites/team/Sprint-Planning-Notes.docx',
      actor: 'Sarah Johnson',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(15),
    },
    {
      id: 'activity-3',
      action: 'shared',
      itemName: 'Q4 Budget Analysis.xlsx',
      itemUrl: 'https://contoso.sharepoint.com/sites/finance/Q4-Budget-Analysis.xlsx',
      actor: 'Finance Team',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(30),
    },
    {
      id: 'activity-4',
      action: 'commented',
      itemName: 'Design Mockups.fig',
      itemUrl: 'https://contoso.sharepoint.com/sites/design/Design-Mockups.fig',
      actor: 'Lisa Anderson',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(45),
    },
    {
      id: 'activity-5',
      action: 'deleted',
      itemName: 'Old Template.docx',
      actor: 'David Brown',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(60),
    },
    {
      id: 'activity-6',
      action: 'renamed',
      itemName: 'API Documentation v2.md',
      itemUrl: 'https://contoso.sharepoint.com/sites/dev/API-Documentation-v2.md',
      actor: 'Robert Taylor',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(90),
    },
    {
      id: 'activity-7',
      action: 'moved',
      itemName: 'Archived Reports',
      itemUrl: 'https://contoso.sharepoint.com/sites/archive/Reports',
      actor: 'Emma Williams',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(120),
    },
    {
      id: 'activity-8',
      action: 'created',
      itemName: 'Meeting Recording - Client Call.mp4',
      itemUrl: 'https://contoso.sharepoint.com/sites/team/Meeting-Recording.mp4',
      actor: 'Jennifer Martinez',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(180),
    },
    {
      id: 'activity-9',
      action: 'modified',
      itemName: 'Employee Onboarding Checklist.xlsx',
      itemUrl: 'https://contoso.sharepoint.com/sites/hr/Onboarding-Checklist.xlsx',
      actor: 'HR Department',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(240),
    },
    {
      id: 'activity-10',
      action: 'restored',
      itemName: 'Legacy Code Documentation.pdf',
      itemUrl: 'https://contoso.sharepoint.com/sites/dev/Legacy-Docs.pdf',
      actor: 'James Wilson',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(300),
    },
    {
      id: 'activity-11',
      action: 'shared',
      itemName: 'Customer Feedback Summary.docx',
      itemUrl: 'https://contoso.sharepoint.com/sites/cs/Feedback-Summary.docx',
      actor: 'Customer Success',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(360),
    },
    {
      id: 'activity-12',
      action: 'edited',
      itemName: 'Security Policy.pdf',
      itemUrl: 'https://contoso.sharepoint.com/sites/it/Security-Policy.pdf',
      actor: 'IT Operations',
      actorPhotoUrl: undefined,
      timestamp: minutesAgo(420),
    },
  ];
}

/**
 * Groups activities by actor name
 */
function groupByActor(activities: ActivityItem[]): Record<string, ActivityItem[]> {
  return activities.reduce((groups, activity) => {
    const actor = activity.actor;
    if (!groups[actor]) {
      groups[actor] = [];
    }
    groups[actor].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);
}

/**
 * Find the top actor (most active person)
 */
function findTopActor(byActor: Record<string, ActivityItem[]>): string {
  let topActor = '';
  let maxCount = 0;

  for (const [actor, items] of Object.entries(byActor)) {
    if (items.length > maxCount) {
      maxCount = items.length;
      topActor = actor;
    }
  }

  return topActor || 'Unknown';
}

/**
 * Generate test site activity data conforming to SiteActivityData interface
 */
export function getTestSiteActivityData(): SiteActivityData {
  const activities = getTestActivityItems();
  const byActor = groupByActor(activities);

  // Simulate current user is "Sarah Johnson"
  const currentUserName = 'Sarah Johnson';
  const byYouCount = byActor[currentUserName]?.length || 0;
  const byOthersCount = activities.length - byYouCount;
  const topActorName = findTopActor(byActor);

  return {
    activities,
    totalCount: activities.length,
    byActor,
    byYouCount,
    byOthersCount,
    topActorName,
  };
}

/**
 * Generate trend data for the last 7 days (activities per day)
 */
export function getTestActivityTrendData(): ActivityTrendData {
  const dataPoints: TrendDataPoint[] = [];
  const values: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Generate realistic activity counts (3-15 activities per day)
    const value = Math.floor(Math.random() * 13) + 3;
    values.push(value);

    dataPoints.push({
      date,
      value,
      label: 'activities',
    });
  }

  // Calculate trend based on first half vs second half average
  const firstHalf = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = values.slice(4).reduce((a, b) => a + b, 0) / 3;
  const diff = secondHalf - firstHalf;

  let trend: 'more active' | 'less active' | 'steady';
  if (diff > 2) {
    trend = 'more active';
  } else if (diff < -2) {
    trend = 'less active';
  } else {
    trend = 'steady';
  }

  const averageActivitiesPerDay = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    dataPoints,
    trend,
    averageActivitiesPerDay: Math.round(averageActivitiesPerDay * 10) / 10,
  };
}

/**
 * Generate test site activity in ISiteActivity format (legacy compatibility)
 * @deprecated Use getTestSiteActivityData() instead
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
