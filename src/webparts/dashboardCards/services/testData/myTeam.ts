// ============================================
// MyTeam Test Data - Mock Data for Development
// ============================================

import {
  MyTeamData,
  TeamMember,
  PresenceStatus,
  TeamPresenceData,
} from '../../models/MyTeam';

/**
 * Generate test team members data
 * Creates 8 team members with variety of presence states and job titles
 */
export const getTestMyTeamData = (): MyTeamData => {
  const members: TeamMember[] = [
    {
      id: 'team-member-1',
      displayName: 'Sarah Johnson',
      email: 'sarah.johnson@contoso.com',
      jobTitle: 'Engineering Manager',
      presence: 'Available' as PresenceStatus,
      photoUrl: undefined,
    },
    {
      id: 'team-member-2',
      displayName: 'Michael Chen',
      email: 'michael.chen@contoso.com',
      jobTitle: 'Senior Developer',
      presence: 'Busy' as PresenceStatus,
      photoUrl: undefined,
    },
    {
      id: 'team-member-3',
      displayName: 'Emily Rodriguez',
      email: 'emily.rodriguez@contoso.com',
      jobTitle: 'Product Designer',
      presence: 'Available' as PresenceStatus,
      photoUrl: undefined,
    },
    {
      id: 'team-member-4',
      displayName: 'Alex Kim',
      email: 'alex.kim@contoso.com',
      jobTitle: 'UX Researcher',
      presence: 'Away' as PresenceStatus,
      photoUrl: undefined,
    },
    {
      id: 'team-member-5',
      displayName: 'David Park',
      email: 'david.park@contoso.com',
      jobTitle: 'DevOps Engineer',
      presence: 'DoNotDisturb' as PresenceStatus,
      photoUrl: undefined,
    },
    {
      id: 'team-member-6',
      displayName: 'Lisa Wang',
      email: 'lisa.wang@contoso.com',
      jobTitle: 'Frontend Developer',
      presence: 'Available' as PresenceStatus,
      photoUrl: undefined,
    },
    {
      id: 'team-member-7',
      displayName: 'James Wilson',
      email: 'james.wilson@contoso.com',
      jobTitle: 'Backend Developer',
      presence: 'Busy' as PresenceStatus,
      photoUrl: undefined,
    },
    {
      id: 'team-member-8',
      displayName: 'Rachel Green',
      email: 'rachel.green@contoso.com',
      jobTitle: 'Project Manager',
      presence: 'Offline' as PresenceStatus,
      photoUrl: undefined,
    },
  ];

  // Calculate counts
  const availableCount = members.filter(m => m.presence === 'Available').length;
  const busyCount = members.filter(m => m.presence === 'Busy' || m.presence === 'DoNotDisturb').length;
  const awayCount = members.filter(m => m.presence === 'Away').length;
  const offlineCount = members.filter(m => m.presence === 'Offline' || m.presence === 'Unknown').length;

  return {
    members,
    totalCount: members.length,
    availableCount,
    busyCount,
    awayCount,
    offlineCount,
  };
};

/**
 * Generate test team presence data for donut chart
 * Returns presence distribution for visualization
 */
export const getTestTeamPresenceData = (): TeamPresenceData => {
  const teamData = getTestMyTeamData();
  return {
    available: teamData.availableCount,
    busy: teamData.busyCount,
    away: teamData.awayCount,
    offline: teamData.offlineCount,
  };
};
