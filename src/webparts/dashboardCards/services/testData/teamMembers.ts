// ============================================
// Test Data - Team Members
// ============================================

import { ITeamMember } from '../GraphService';

/**
 * Generate test team members with presence status
 */
export function getTestTeamMembers(): ITeamMember[] {
  return [
    {
      id: 'test-member-1',
      displayName: 'Sarah Johnson',
      email: 'sarah.johnson@contoso.com',
      jobTitle: 'Engineering Manager',
      presence: 'Available',
      photoUrl: undefined,
    },
    {
      id: 'test-member-2',
      displayName: 'Michael Chen',
      email: 'michael.chen@contoso.com',
      jobTitle: 'Senior Developer',
      presence: 'Busy',
      photoUrl: undefined,
    },
    {
      id: 'test-member-3',
      displayName: 'Emma Williams',
      email: 'emma.williams@contoso.com',
      jobTitle: 'Product Manager',
      presence: 'Available',
      photoUrl: undefined,
    },
    {
      id: 'test-member-4',
      displayName: 'David Brown',
      email: 'david.brown@contoso.com',
      jobTitle: 'Business Analyst',
      presence: 'Away',
      photoUrl: undefined,
    },
    {
      id: 'test-member-5',
      displayName: 'Lisa Anderson',
      email: 'lisa.anderson@contoso.com',
      jobTitle: 'UX Designer',
      presence: 'DoNotDisturb',
      photoUrl: undefined,
    },
    {
      id: 'test-member-6',
      displayName: 'James Wilson',
      email: 'james.wilson@contoso.com',
      jobTitle: 'QA Engineer',
      presence: 'Available',
      photoUrl: undefined,
    },
    {
      id: 'test-member-7',
      displayName: 'Jennifer Martinez',
      email: 'jennifer.martinez@contoso.com',
      jobTitle: 'DevOps Engineer',
      presence: 'Offline',
      photoUrl: undefined,
    },
    {
      id: 'test-member-8',
      displayName: 'Robert Taylor',
      email: 'robert.taylor@contoso.com',
      jobTitle: 'Technical Lead',
      presence: 'Busy',
      photoUrl: undefined,
    },
    {
      id: 'test-member-9',
      displayName: 'Amanda Garcia',
      email: 'amanda.garcia@contoso.com',
      jobTitle: 'Scrum Master',
      presence: 'Available',
      photoUrl: undefined,
    },
    {
      id: 'test-member-10',
      displayName: 'Christopher Lee',
      email: 'christopher.lee@contoso.com',
      jobTitle: 'Junior Developer',
      presence: 'Unknown',
      photoUrl: undefined,
    },
  ];
}
