// ============================================
// Test Data - Recent Files
// ============================================

import { IFileItem } from '../GraphService';

/**
 * Generate test recent files
 */
export function getTestFiles(): IFileItem[] {
  const now = new Date();

  const hoursAgo = (hours: number): Date => {
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  };

  return [
    {
      id: 'test-file-1',
      name: 'Q4 Budget Proposal.xlsx',
      webUrl: 'https://contoso.sharepoint.com/sites/finance/Q4-Budget-Proposal.xlsx',
      size: 245760,
      lastModifiedDateTime: hoursAgo(1),
      lastModifiedBy: 'Sarah Johnson',
      isFolder: false,
      fileType: 'xlsx',
    },
    {
      id: 'test-file-2',
      name: 'Project Roadmap 2024.pptx',
      webUrl: 'https://contoso.sharepoint.com/sites/product/Project-Roadmap-2024.pptx',
      size: 5242880,
      lastModifiedDateTime: hoursAgo(3),
      lastModifiedBy: 'Michael Chen',
      isFolder: false,
      fileType: 'pptx',
    },
    {
      id: 'test-file-3',
      name: 'Meeting Notes - Sprint Planning.docx',
      webUrl: 'https://contoso.sharepoint.com/sites/team/Meeting-Notes.docx',
      size: 45056,
      lastModifiedDateTime: hoursAgo(5),
      lastModifiedBy: 'You',
      isFolder: false,
      fileType: 'docx',
    },
    {
      id: 'test-file-4',
      name: 'Product Requirements',
      webUrl: 'https://contoso.sharepoint.com/sites/product/requirements',
      size: 0,
      lastModifiedDateTime: hoursAgo(8),
      lastModifiedBy: 'Emma Williams',
      isFolder: true,
    },
    {
      id: 'test-file-5',
      name: 'Technical Architecture.pdf',
      webUrl: 'https://contoso.sharepoint.com/sites/engineering/Technical-Architecture.pdf',
      size: 1048576,
      lastModifiedDateTime: hoursAgo(12),
      lastModifiedBy: 'David Brown',
      isFolder: false,
      fileType: 'pdf',
    },
    {
      id: 'test-file-6',
      name: 'Brand Guidelines.png',
      webUrl: 'https://contoso.sharepoint.com/sites/marketing/Brand-Guidelines.png',
      size: 2097152,
      lastModifiedDateTime: hoursAgo(24),
      lastModifiedBy: 'Marketing Team',
      isFolder: false,
      fileType: 'png',
    },
    {
      id: 'test-file-7',
      name: 'Employee Handbook.docx',
      webUrl: 'https://contoso.sharepoint.com/sites/hr/Employee-Handbook.docx',
      size: 512000,
      lastModifiedDateTime: hoursAgo(48),
      lastModifiedBy: 'HR Department',
      isFolder: false,
      fileType: 'docx',
    },
    {
      id: 'test-file-8',
      name: 'Sales Report - November.xlsx',
      webUrl: 'https://contoso.sharepoint.com/sites/sales/Sales-Report-November.xlsx',
      size: 358400,
      lastModifiedDateTime: hoursAgo(72),
      lastModifiedBy: 'Sales Team',
      isFolder: false,
      fileType: 'xlsx',
    },
    {
      id: 'test-file-9',
      name: 'API Documentation.md',
      webUrl: 'https://contoso.sharepoint.com/sites/dev/API-Documentation.md',
      size: 28672,
      lastModifiedDateTime: hoursAgo(96),
      lastModifiedBy: 'You',
      isFolder: false,
      fileType: 'md',
    },
    {
      id: 'test-file-10',
      name: 'Design Assets',
      webUrl: 'https://contoso.sharepoint.com/sites/design/assets',
      size: 0,
      lastModifiedDateTime: hoursAgo(120),
      lastModifiedBy: 'Design Team',
      isFolder: true,
    },
  ];
}
