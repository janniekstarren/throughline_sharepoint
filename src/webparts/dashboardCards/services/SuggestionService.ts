/**
 * SuggestionService - Time-aware query suggestions for the Intelligence Hub
 *
 * Returns contextual suggestion chips based on the time of day:
 * - Morning (before 12pm): "catch me up", reply-focused, meeting prep
 * - Afternoon (12-5pm): focus & productivity, collaboration, delegation
 * - Evening (after 5pm): summary & wind-down, tomorrow prep, team review
 */

export interface QuerySuggestion {
  /** Display text shown in the chip */
  label: string;
  /** The query text submitted when the chip is clicked */
  query: string;
}

// ============================================
// Suggestion Sets
// ============================================

const MORNING_SUGGESTIONS: QuerySuggestion[] = [
  { label: "What needs my attention?", query: "What needs my attention today?" },
  { label: "Who's waiting on me?", query: "Who's waiting on me?" },
  { label: "Prep for tomorrow", query: "What meetings need prep for tomorrow?" },
  { label: "My focus score", query: "How's my focus score?" },
];

const AFTERNOON_SUGGESTIONS: QuerySuggestion[] = [
  { label: "How's my focus?", query: "How fragmented is my day?" },
  { label: "Am I over-committed?", query: "Am I over-committed this week?" },
  { label: "Relationships going cold", query: "Who am I losing touch with?" },
  { label: "Team workload", query: "Who's overloaded on my team?" },
];

const EVENING_SUGGESTIONS: QuerySuggestion[] = [
  { label: "End-of-day summary", query: "Give me an end of day summary" },
  { label: "Tomorrow's calendar", query: "What does tomorrow look like?" },
  { label: "Overdue items", query: "What promises am I behind on?" },
  { label: "Team check-in", query: "How's my team doing?" },
];

// ============================================
// Public API
// ============================================

/**
 * Get time-appropriate query suggestions
 * @param hour - Current hour (0-23). Uses `new Date().getHours()` if not provided.
 * @returns Array of 4 query suggestions appropriate for the time of day
 */
export function getSuggestions(hour?: number): QuerySuggestion[] {
  const currentHour = hour !== undefined ? hour : new Date().getHours();

  if (currentHour < 12) {
    return MORNING_SUGGESTIONS;
  } else if (currentHour < 17) {
    return AFTERNOON_SUGGESTIONS;
  } else {
    return EVENING_SUGGESTIONS;
  }
}

/**
 * Get the time-of-day label (for potential display use)
 * @param hour - Current hour (0-23)
 */
export function getTimeOfDay(hour?: number): 'morning' | 'afternoon' | 'evening' {
  const currentHour = hour !== undefined ? hour : new Date().getHours();

  if (currentHour < 12) return 'morning';
  if (currentHour < 17) return 'afternoon';
  return 'evening';
}
