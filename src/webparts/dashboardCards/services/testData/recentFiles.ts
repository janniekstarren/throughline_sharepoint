// ============================================
// RecentFiles Test Data - Mock Data for Development
// ============================================

import {
  RecentFilesData,
  FileItem,
  FilesTrendData,
} from '../../models/RecentFiles';
import { TrendDataPoint } from '../../components/shared/charts';

/**
 * Generate test recent files data
 * Creates a variety of file types and folders
 */
export const getTestRecentFilesData = (): RecentFilesData => {
  const now = new Date();

  const createDate = (hoursAgo: number): Date => {
    const date = new Date(now);
    date.setHours(date.getHours() - hoursAgo);
    return date;
  };

  const files: FileItem[] = [
    {
      id: 'test-file-1',
      name: 'Q1 Budget Report.xlsx',
      webUrl: 'https://contoso.sharepoint.com/sites/finance/Q1-Budget-Report.xlsx',
      size: 245760, // 240 KB
      lastModifiedDateTime: createDate(1),
      lastModifiedBy: {
        displayName: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
      },
      isFolder: false,
      fileType: 'xlsx',
    },
    {
      id: 'test-file-2',
      name: 'Project Proposal.docx',
      webUrl: 'https://contoso.sharepoint.com/sites/projects/Project-Proposal.docx',
      size: 156672, // 153 KB
      lastModifiedDateTime: createDate(2),
      lastModifiedBy: {
        displayName: 'Michael Chen',
        email: 'michael.chen@contoso.com',
      },
      isFolder: false,
      fileType: 'docx',
    },
    {
      id: 'test-file-3',
      name: 'Client Presentation.pptx',
      webUrl: 'https://contoso.sharepoint.com/sites/sales/Client-Presentation.pptx',
      size: 5242880, // 5 MB
      lastModifiedDateTime: createDate(4),
      lastModifiedBy: {
        displayName: 'Emily Davis',
        email: 'emily.davis@contoso.com',
      },
      isFolder: false,
      fileType: 'pptx',
    },
    {
      id: 'test-folder-1',
      name: 'Project Documents',
      webUrl: 'https://contoso.sharepoint.com/sites/projects/Documents',
      size: 0,
      lastModifiedDateTime: createDate(5),
      lastModifiedBy: {
        displayName: 'John Smith',
        email: 'john.smith@contoso.com',
      },
      isFolder: true,
    },
    {
      id: 'test-file-4',
      name: 'Contract Agreement.pdf',
      webUrl: 'https://contoso.sharepoint.com/sites/legal/Contract-Agreement.pdf',
      size: 1048576, // 1 MB
      lastModifiedDateTime: createDate(8),
      lastModifiedBy: {
        displayName: 'Lisa Anderson',
        email: 'lisa.anderson@contoso.com',
      },
      isFolder: false,
      fileType: 'pdf',
    },
    {
      id: 'test-file-5',
      name: 'Meeting Notes.docx',
      webUrl: 'https://contoso.sharepoint.com/sites/team/Meeting-Notes.docx',
      size: 45056, // 44 KB
      lastModifiedDateTime: createDate(12),
      lastModifiedBy: {
        displayName: 'Sarah Johnson',
        email: 'sarah.johnson@contoso.com',
      },
      isFolder: false,
      fileType: 'docx',
    },
    {
      id: 'test-folder-2',
      name: 'Marketing Assets',
      webUrl: 'https://contoso.sharepoint.com/sites/marketing/Assets',
      size: 0,
      lastModifiedDateTime: createDate(16),
      lastModifiedBy: {
        displayName: 'David Wilson',
        email: 'david.wilson@contoso.com',
      },
      isFolder: true,
    },
    {
      id: 'test-file-6',
      name: 'Sales Data Analysis.xlsx',
      webUrl: 'https://contoso.sharepoint.com/sites/sales/Sales-Data-Analysis.xlsx',
      size: 512000, // 500 KB
      lastModifiedDateTime: createDate(24),
      lastModifiedBy: {
        displayName: 'Emily Davis',
        email: 'emily.davis@contoso.com',
      },
      isFolder: false,
      fileType: 'xlsx',
    },
    {
      id: 'test-file-7',
      name: 'Product Roadmap.pptx',
      webUrl: 'https://contoso.sharepoint.com/sites/product/Product-Roadmap.pptx',
      size: 3145728, // 3 MB
      lastModifiedDateTime: createDate(48),
      lastModifiedBy: {
        displayName: 'Michael Chen',
        email: 'michael.chen@contoso.com',
      },
      isFolder: false,
      fileType: 'pptx',
    },
    {
      id: 'test-file-8',
      name: 'Employee Handbook.pdf',
      webUrl: 'https://contoso.sharepoint.com/sites/hr/Employee-Handbook.pdf',
      size: 2097152, // 2 MB
      lastModifiedDateTime: createDate(72),
      lastModifiedBy: {
        displayName: 'Jennifer Lee',
        email: 'jennifer.lee@contoso.com',
      },
      isFolder: false,
      fileType: 'pdf',
    },
  ];

  const folderCount = files.filter(f => f.isFolder).length;

  // Calculate document counts by type
  const docsCount = files.filter(f => {
    const type = f.fileType?.toLowerCase();
    return type === 'docx' || type === 'doc' || type === 'pdf';
  }).length;

  const sheetsCount = files.filter(f => {
    const type = f.fileType?.toLowerCase();
    return type === 'xlsx' || type === 'xls';
  }).length;

  const slidesCount = files.filter(f => {
    const type = f.fileType?.toLowerCase();
    return type === 'pptx' || type === 'ppt';
  }).length;

  return {
    files,
    totalCount: files.length,
    folderCount,
    docsCount,
    sheetsCount,
    slidesCount,
  };
};

/**
 * Generate trend data for file activity over the last 7 days
 */
export const getTestFilesTrendData = (): FilesTrendData => {
  const dataPoints: TrendDataPoint[] = [];
  const values: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Generate realistic file modification counts (1-6 files per day)
    const value = Math.floor(Math.random() * 6) + 1;
    values.push(value);

    dataPoints.push({
      date,
      value,
      label: 'files modified',
    });
  }

  // Calculate trend based on first half vs second half average
  const firstHalf = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = values.slice(4).reduce((a, b) => a + b, 0) / 3;
  const diff = secondHalf - firstHalf;

  let trend: 'more active' | 'less active' | 'steady';
  if (diff > 1) {
    trend = 'more active';
  } else if (diff < -1) {
    trend = 'less active';
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
