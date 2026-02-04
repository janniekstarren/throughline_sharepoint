// ============================================
// Test Data - Shared Files
// ============================================

import { ISharedFile } from '../GraphService';

/**
 * Generate test shared files
 */
export function getTestSharedFiles(): ISharedFile[] {
  const now = new Date();

  const daysAgo = (days: number): Date => {
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  };

  return [
    {
      id: 'test-shared-1',
      name: 'Q4 Marketing Plan.pptx',
      webUrl: 'https://contoso.sharepoint.com/shared/Q4-Marketing-Plan.pptx',
      size: 4194304,
      sharedBy: 'Marketing Team',
      sharedDateTime: daysAgo(1),
      fileType: 'pptx',
    },
    {
      id: 'test-shared-2',
      name: 'Product Roadmap 2025.xlsx',
      webUrl: 'https://contoso.sharepoint.com/shared/Product-Roadmap-2025.xlsx',
      size: 245760,
      sharedBy: 'Emma Williams',
      sharedDateTime: daysAgo(2),
      fileType: 'xlsx',
    },
    {
      id: 'test-shared-3',
      name: 'Architecture Decision Record.docx',
      webUrl: 'https://contoso.sharepoint.com/shared/ADR.docx',
      size: 98304,
      sharedBy: 'Robert Taylor',
      sharedDateTime: daysAgo(3),
      fileType: 'docx',
    },
    {
      id: 'test-shared-4',
      name: 'Brand Assets.zip',
      webUrl: 'https://contoso.sharepoint.com/shared/Brand-Assets.zip',
      size: 52428800,
      sharedBy: 'Lisa Anderson',
      sharedDateTime: daysAgo(4),
      fileType: 'zip',
    },
    {
      id: 'test-shared-5',
      name: 'Customer Analysis Report.pdf',
      webUrl: 'https://contoso.sharepoint.com/shared/Customer-Analysis.pdf',
      size: 2097152,
      sharedBy: 'David Brown',
      sharedDateTime: daysAgo(5),
      fileType: 'pdf',
    },
    {
      id: 'test-shared-6',
      name: 'Team Photo - Offsite 2024.jpg',
      webUrl: 'https://contoso.sharepoint.com/shared/Team-Photo-2024.jpg',
      size: 3145728,
      sharedBy: 'Office Manager',
      sharedDateTime: daysAgo(7),
      fileType: 'jpg',
    },
    {
      id: 'test-shared-7',
      name: 'API Integration Guide.md',
      webUrl: 'https://contoso.sharepoint.com/shared/API-Guide.md',
      size: 45056,
      sharedBy: 'Michael Chen',
      sharedDateTime: daysAgo(10),
      fileType: 'md',
    },
    {
      id: 'test-shared-8',
      name: 'Budget Template FY2025.xlsx',
      webUrl: 'https://contoso.sharepoint.com/shared/Budget-Template.xlsx',
      size: 153600,
      sharedBy: 'Finance Team',
      sharedDateTime: daysAgo(14),
      fileType: 'xlsx',
    },
  ];
}
