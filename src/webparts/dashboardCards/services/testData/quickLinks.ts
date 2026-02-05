// ============================================
// Test Data - Quick Links
// Provides mock quick links data for testing/demo mode
// ============================================

import {
  QuickLink,
  QuickLinksData,
  LinksCategoryData,
  toQuickLinksData,
  toLinksCategoryData,
} from '../../models/QuickLinks';

/**
 * Generate test quick links with categories
 */
export function getTestQuickLinksData(): QuickLinksData {
  const links = getTestQuickLinks();
  return toQuickLinksData(links, 'General');
}

/**
 * Generate array of test quick links
 * Returns 10 links across different categories with usage data
 */
export function getTestQuickLinks(): QuickLink[] {
  const now = new Date();
  const daysAgo = (days: number): Date => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return [
    // Tools category
    {
      id: 'test-link-1',
      title: 'Outlook',
      url: 'https://outlook.office.com',
      icon: 'Mail',
      description: 'Email, calendar, and contacts',
      category: 'Tools',
      isFavorite: true,
      lastUsed: daysAgo(0), // Today
      usageCount: 45,
    },
    {
      id: 'test-link-2',
      title: 'Teams',
      url: 'https://teams.microsoft.com',
      icon: 'TeamsLogo',
      description: 'Chat, meetings, and collaboration',
      category: 'Tools',
      isFavorite: true,
      lastUsed: daysAgo(1), // Yesterday
      usageCount: 38,
    },
    {
      id: 'test-link-3',
      title: 'OneDrive',
      url: 'https://onedrive.com',
      icon: 'OneDrive',
      description: 'Personal cloud storage',
      category: 'Tools',
      isFavorite: false,
      lastUsed: daysAgo(2),
      usageCount: 22,
    },
    {
      id: 'test-link-4',
      title: 'SharePoint',
      url: 'https://contoso.sharepoint.com',
      icon: 'SharepointLogo',
      description: 'Team sites and documents',
      category: 'Tools',
      isFavorite: true,
      lastUsed: daysAgo(3),
      usageCount: 18,
    },

    // Documentation category
    {
      id: 'test-link-5',
      title: 'OneNote',
      url: 'https://onenote.com',
      icon: 'OneNoteLogo',
      description: 'Digital notebooks',
      category: 'Documentation',
      isFavorite: false,
      lastUsed: daysAgo(5),
      usageCount: 12,
    },
    {
      id: 'test-link-6',
      title: 'Company Wiki',
      url: 'https://contoso.sharepoint.com/wiki',
      icon: 'Book',
      description: 'Internal knowledge base',
      category: 'Documentation',
      isFavorite: false,
      lastUsed: daysAgo(10), // Older than 7 days
      usageCount: 8,
    },
    {
      id: 'test-link-7',
      title: 'Help Desk',
      url: 'https://support.contoso.com',
      icon: 'Help',
      description: 'IT support portal',
      category: 'Documentation',
      isFavorite: false,
      lastUsed: daysAgo(14),
      usageCount: 5,
    },

    // Resources category
    {
      id: 'test-link-8',
      title: 'Planner',
      url: 'https://tasks.office.com',
      icon: 'PlannerLogo',
      description: 'Project and task management',
      category: 'Resources',
      isFavorite: true,
      lastUsed: daysAgo(1),
      usageCount: 28,
    },
    {
      id: 'test-link-9',
      title: 'HR Portal',
      url: 'https://hr.contoso.com',
      icon: 'People',
      description: 'Human resources',
      category: 'Resources',
      isFavorite: false,
      lastUsed: daysAgo(20),
      usageCount: 3,
    },
    {
      id: 'test-link-10',
      title: 'Training',
      url: 'https://learn.microsoft.com',
      icon: 'Education',
      description: 'Learning and development',
      category: 'Resources',
      isFavorite: false,
      lastUsed: daysAgo(4),
      usageCount: 15,
    },
  ];
}

/**
 * Generate test quick links for specific category
 */
export function getTestQuickLinksByCategory(category: string): QuickLink[] {
  return getTestQuickLinks().filter((link) => link.category === category);
}

/**
 * Get available test categories
 */
export function getTestCategories(): string[] {
  const links = getTestQuickLinks();
  const categories = new Set(links.map((link) => link.category || 'General'));
  return Array.from(categories);
}

/**
 * Get category distribution data for donut chart
 */
export function getTestLinksCategoryData(): LinksCategoryData[] {
  const data = getTestQuickLinksData();
  return toLinksCategoryData(data.byCategory);
}
