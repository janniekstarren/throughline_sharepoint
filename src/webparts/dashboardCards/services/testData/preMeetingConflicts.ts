// ============================================
// Pre-Meeting Conflicts - Demo/Test Data
// ============================================
// Deterministic demo data for Card #7.
// All dates relative to now for realistic display.

import {
  PreMeetingConflictsData,
  MeetingConflict,
  ConflictMeeting,
} from '../../models/PreMeetingConflicts';

// ============================================
// Helper: create a meeting at relative hours from now
// ============================================

function meetingAt(
  hoursFromNow: number,
  durationMinutes: number,
  overrides: Partial<ConflictMeeting>
): ConflictMeeting {
  const now = new Date();
  const start = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return {
    id: `meeting-${Math.abs(hoursFromNow)}-${durationMinutes}`,
    subject: 'Meeting',
    startDateTime: start,
    endDateTime: end,
    isOnline: true,
    organizer: 'Unknown',
    attendeeCount: 3,
    importance: 'normal',
    webUrl: 'https://teams.microsoft.com/meeting',
    isAllDay: false,
    ...overrides,
  };
}

// ============================================
// Generator
// ============================================

export function getTestPreMeetingConflictsData(): PreMeetingConflictsData {
  const conflicts: MeetingConflict[] = [
    // Conflict 1: Double-booking (overlap)
    {
      id: 'conflict-001',
      type: 'overlap',
      severity: 'high',
      meetings: [
        meetingAt(3, 60, {
          id: 'mtg-board-prep',
          subject: 'Board Prep Review',
          organizer: 'David Kim (CFO)',
          attendeeCount: 8,
          importance: 'high',
          webUrl: 'https://teams.microsoft.com/meeting/board-prep',
        }),
        meetingAt(3.5, 90, {
          id: 'mtg-client-demo',
          subject: 'Client Demo — Acme Corp',
          organizer: 'Priya Patel',
          attendeeCount: 12,
          importance: 'high',
          webUrl: 'https://teams.microsoft.com/meeting/client-demo',
        }),
      ],
      overlapMinutes: 30,
      gapMinutes: 0,
      suggestedAction: 'Reschedule one or delegate attendance',
      timeSlot: 'Today 2:00 PM - 3:30 PM',
    },
    // Conflict 2: Back-to-back (no transition)
    {
      id: 'conflict-002',
      type: 'back-to-back',
      severity: 'medium',
      meetings: [
        meetingAt(6, 30, {
          id: 'mtg-one-on-one',
          subject: '1:1 with Sarah Martinez',
          organizer: 'You',
          attendeeCount: 2,
          importance: 'normal',
          webUrl: 'https://teams.microsoft.com/meeting/1on1-sarah',
        }),
        meetingAt(6.5, 60, {
          id: 'mtg-sprint-planning',
          subject: 'Sprint Planning — Q1 Kickoff',
          organizer: 'Alex Chen',
          attendeeCount: 15,
          importance: 'normal',
          location: 'Room 4B',
          isOnline: false,
          webUrl: 'https://teams.microsoft.com/meeting/sprint-planning',
        }),
      ],
      overlapMinutes: 0,
      gapMinutes: 0,
      suggestedAction: 'Allow 5-10 min buffer for room transition',
      timeSlot: 'Today 5:00 PM - 6:30 PM',
    },
    // Conflict 3: Triple-booking
    {
      id: 'conflict-003',
      type: 'triple-booking',
      severity: 'high',
      meetings: [
        meetingAt(26, 60, {
          id: 'mtg-all-hands',
          subject: 'All-Hands Town Hall',
          organizer: 'CEO Office',
          attendeeCount: 200,
          importance: 'high',
          webUrl: 'https://teams.microsoft.com/meeting/all-hands',
        }),
        meetingAt(26, 45, {
          id: 'mtg-design-review',
          subject: 'Design Review — Dashboard v3',
          organizer: 'Jessica Wong',
          attendeeCount: 6,
          importance: 'normal',
          webUrl: 'https://teams.microsoft.com/meeting/design-review',
        }),
        meetingAt(26.25, 30, {
          id: 'mtg-vendor-call',
          subject: 'Vendor Sync — DataViz Ltd',
          organizer: 'Tom Baker',
          attendeeCount: 4,
          importance: 'normal',
          webUrl: 'https://teams.microsoft.com/meeting/vendor-call',
        }),
      ],
      overlapMinutes: 45,
      gapMinutes: 0,
      suggestedAction: 'Attend All-Hands, reschedule Design Review and Vendor Sync',
      timeSlot: 'Tomorrow 10:00 AM - 11:00 AM',
    },
  ];

  return {
    conflicts,
    stats: {
      totalConflicts: conflicts.length,
      overlapCount: conflicts.filter(c => c.type === 'overlap').length,
      backToBackCount: conflicts.filter(c => c.type === 'back-to-back').length,
      tripleBookingCount: conflicts.filter(c => c.type === 'triple-booking').length,
      affectedHours: 4.5,
    },
    trendData: [
      { date: 'Mon', value: 1 },
      { date: 'Tue', value: 2 },
      { date: 'Wed', value: 0 },
      { date: 'Thu', value: 3 },
      { date: 'Fri', value: 1 },
      { date: 'Sat', value: 0 },
      { date: 'Sun', value: 2 },
    ],
  };
}
