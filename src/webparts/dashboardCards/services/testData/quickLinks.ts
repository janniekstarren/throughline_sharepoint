// ============================================
// Test Data - Quick Links
// ============================================

import { IQuickLink } from '../GraphService';

/**
 * Generate test quick links
 */
export function getTestQuickLinks(): IQuickLink[] {
  return [
    {
      id: 'test-link-1',
      title: 'Outlook',
      url: 'https://outlook.office.com',
      icon: 'Mail',
    },
    {
      id: 'test-link-2',
      title: 'Teams',
      url: 'https://teams.microsoft.com',
      icon: 'TeamsLogo',
    },
    {
      id: 'test-link-3',
      title: 'OneDrive',
      url: 'https://onedrive.com',
      icon: 'OneDrive',
    },
    {
      id: 'test-link-4',
      title: 'SharePoint',
      url: 'https://contoso.sharepoint.com',
      icon: 'SharepointLogo',
    },
    {
      id: 'test-link-5',
      title: 'Planner',
      url: 'https://tasks.office.com',
      icon: 'PlannerLogo',
    },
    {
      id: 'test-link-6',
      title: 'OneNote',
      url: 'https://onenote.com',
      icon: 'OneNoteLogo',
    },
  ];
}
