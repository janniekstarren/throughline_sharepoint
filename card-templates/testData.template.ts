// ============================================
// {{CardName}} Test Data - Mock Data for Development
// ============================================
// Template file - Copy and rename for new cards
// Replace {{CardName}} with your card name (e.g., "UpcomingMeetings")
// Replace {{cardName}} with camelCase version (e.g., "upcomingMeetings")

import {
  {{CardName}}Data,
  {{CardName}}Item,
  {{CardName}}TrendData,
  {{CardName}}Person,
} from '../../models/{{CardName}}';

// Helper to generate random dates
const getRandomDate = (daysAgo: number, daysRange: number = 30): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo + Math.floor(Math.random() * daysRange));
  return date;
};

// Helper to pick random item from array
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Sample people for test data
const TEST_PEOPLE: {{CardName}}Person[] = [
  { id: '1', displayName: 'Alex Johnson', email: 'alex.johnson@contoso.com' },
  { id: '2', displayName: 'Sarah Miller', email: 'sarah.miller@contoso.com' },
  { id: '3', displayName: 'Mike Chen', email: 'mike.chen@contoso.com' },
  { id: '4', displayName: 'Emily Davis', email: 'emily.davis@contoso.com' },
  { id: '5', displayName: 'James Wilson', email: 'james.wilson@contoso.com' },
];

// Sample titles/subjects
const SAMPLE_TITLES = [
  'Project Update Required',
  'Q4 Budget Review',
  'Team Meeting Notes',
  'Client Feedback Summary',
  'Weekly Status Report',
  'Action Items from Monday',
  'Contract Review Needed',
  'Design Mockups Ready',
];

/**
 * Generate test items
 */
const generateTestItems = (count: number = 8): {{CardName}}Item[] => {
  const items: {{CardName}}Item[] = [];

  for (let i = 0; i < count; i++) {
    items.push({
      id: `test-item-${i + 1}`,
      title: pickRandom(SAMPLE_TITLES),
      createdDate: getRandomDate(Math.floor(Math.random() * 14)),
      // Add more fields as needed
    });
  }

  return items;
};

/**
 * Get test data for the main card
 */
export const getTest{{CardName}}Data = (): {{CardName}}Data => {
  const items = generateTestItems(8);

  return {
    items,
    totalCount: items.length,
  };
};

/**
 * Get test trend data for charts
 */
export const getTest{{CardName}}Trend = (): {{CardName}}TrendData => {
  const dataPoints: Array<{ date: Date; value: number }> = [];
  const today = new Date();

  // Generate 14 days of trend data
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dataPoints.push({
      date,
      value: Math.floor(Math.random() * 10) + 2,
    });
  }

  return {
    dataPoints,
  };
};
