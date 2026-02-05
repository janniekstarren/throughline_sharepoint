// ============================================
// SharedWithMe Test Data - Mock Data for Development
// ============================================

import {
  SharedWithMeData,
  SharedFile,
  SharingTrendData,
} from '../../models/SharedWithMe';
import { TrendDataPoint } from '../../components/shared/charts';

/**
 * Generate test shared files data
 * Creates dynamic dates based on current time
 */
export const getTestSharedWithMeData = (): SharedWithMeData => {
  const now = new Date();

  const daysAgo = (days: number): Date => {
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  };

  const hoursAgo = (hours: number): Date => {
    const date = new Date(now);
    date.setHours(date.getHours() - hours);
    return date;
  };

  const files: SharedFile[] = [
    {
      id: 'shared-file-1',
      name: 'Q4 Marketing Strategy.pptx',
      webUrl: 'https://contoso.sharepoint.com/sites/Marketing/Shared%20Documents/Q4%20Marketing%20Strategy.pptx',
      size: 4521984,
      sharedBy: {
        id: 'user-sarah-1',
        displayName: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
      },
      sharedDateTime: hoursAgo(2),
      fileType: 'pptx',
      lastModifiedDateTime: hoursAgo(1),
    },
    {
      id: 'shared-file-2',
      name: 'Budget Analysis 2024.xlsx',
      webUrl: 'https://contoso.sharepoint.com/sites/Finance/Shared%20Documents/Budget%20Analysis%202024.xlsx',
      size: 1256432,
      sharedBy: {
        id: 'user-michael-2',
        displayName: 'Michael Chen',
        email: 'michael.chen@contoso.com',
      },
      sharedDateTime: hoursAgo(8),
      fileType: 'xlsx',
      lastModifiedDateTime: hoursAgo(4),
    },
    {
      id: 'shared-file-3',
      name: 'Project Requirements Document.docx',
      webUrl: 'https://contoso.sharepoint.com/sites/Engineering/Shared%20Documents/Project%20Requirements%20Document.docx',
      size: 892156,
      sharedBy: {
        id: 'user-emily-3',
        displayName: 'Emily Rodriguez',
        email: 'emily.rodriguez@contoso.com',
      },
      sharedDateTime: daysAgo(1),
      fileType: 'docx',
      lastModifiedDateTime: daysAgo(1),
    },
    {
      id: 'shared-file-4',
      name: 'Design Mockups v2.pdf',
      webUrl: 'https://contoso.sharepoint.com/sites/Design/Shared%20Documents/Design%20Mockups%20v2.pdf',
      size: 8765432,
      sharedBy: {
        id: 'user-alex-4',
        displayName: 'Alex Kim',
        email: 'alex.kim@contoso.com',
      },
      sharedDateTime: daysAgo(2),
      fileType: 'pdf',
      lastModifiedDateTime: daysAgo(2),
    },
    {
      id: 'shared-file-5',
      name: 'Team Photo.jpg',
      webUrl: 'https://contoso.sharepoint.com/sites/HR/Shared%20Documents/Team%20Photo.jpg',
      size: 3421890,
      sharedBy: {
        id: 'user-rachel-5',
        displayName: 'Rachel Green',
        email: 'rachel.green@contoso.com',
      },
      sharedDateTime: daysAgo(3),
      fileType: 'jpg',
      lastModifiedDateTime: daysAgo(3),
    },
    {
      id: 'shared-file-6',
      name: 'API Documentation.md',
      webUrl: 'https://contoso.sharepoint.com/sites/Engineering/Shared%20Documents/API%20Documentation.md',
      size: 125678,
      sharedBy: {
        id: 'user-david-6',
        displayName: 'David Park',
        email: 'david.park@contoso.com',
      },
      sharedDateTime: daysAgo(5),
      fileType: 'md',
      lastModifiedDateTime: daysAgo(4),
    },
    {
      id: 'shared-file-7',
      name: 'Client Contract - Acme Corp.pdf',
      webUrl: 'https://contoso.sharepoint.com/sites/Legal/Shared%20Documents/Client%20Contract%20-%20Acme%20Corp.pdf',
      size: 567890,
      sharedBy: {
        id: 'user-james-7',
        displayName: 'James Wilson',
        email: 'james.wilson@external.com',
      },
      sharedDateTime: daysAgo(7),
      fileType: 'pdf',
      lastModifiedDateTime: daysAgo(6),
    },
    {
      id: 'shared-file-8',
      name: 'Sprint Planning Template.xlsx',
      webUrl: 'https://contoso.sharepoint.com/sites/PMO/Shared%20Documents/Sprint%20Planning%20Template.xlsx',
      size: 234567,
      sharedBy: {
        id: 'user-lisa-8',
        displayName: 'Lisa Wang',
        email: 'lisa.wang@contoso.com',
      },
      sharedDateTime: daysAgo(10),
      fileType: 'xlsx',
      lastModifiedDateTime: daysAgo(8),
    },
  ];

  // Count recent files (within last 24 hours)
  const oneDayAgo = hoursAgo(24);
  const recentCount = files.filter(
    (f) => f.sharedDateTime >= oneDayAgo
  ).length;

  // Count unique sharers
  const uniqueSharers = new Set(files.map((f) => f.sharedBy.id));
  const uniqueSharersCount = uniqueSharers.size;

  // Calculate total size
  const totalSizeBytes = files.reduce((sum, f) => sum + f.size, 0);

  return {
    files,
    totalCount: files.length,
    recentCount,
    uniqueSharersCount,
    totalSizeBytes,
  };
};

/**
 * Generate trend data for the last 7 days (files shared per day)
 */
export const getTestSharingTrendData = (): SharingTrendData => {
  const dataPoints: TrendDataPoint[] = [];
  const values: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Generate realistic file sharing counts (0-5 files per day)
    const value = Math.floor(Math.random() * 6);
    values.push(value);

    dataPoints.push({
      date,
      value,
      label: 'files shared',
    });
  }

  // Calculate trend based on first half vs second half average
  const firstHalf = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = values.slice(4).reduce((a, b) => a + b, 0) / 3;
  const diff = secondHalf - firstHalf;

  let trend: 'more sharing' | 'less sharing' | 'steady';
  if (diff > 0.5) {
    trend = 'more sharing';
  } else if (diff < -0.5) {
    trend = 'less sharing';
  } else {
    trend = 'steady';
  }

  const averageFilesPerDay = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    dataPoints,
    trend,
    averageFilesPerDay: Math.round(averageFilesPerDay * 10) / 10,
  };
};
