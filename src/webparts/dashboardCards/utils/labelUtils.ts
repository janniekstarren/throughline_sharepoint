// ============================================
// Smart Label Pluralization Utility
// Handles singular/plural/zero cases for SmallCard metrics
// ============================================

/**
 * Label keys for smart pluralization
 * Each key maps to a specific context with appropriate labels
 */
export type LabelKey =
  | 'event'     // Calendar events
  | 'email'     // Emails
  | 'unread'    // Unread emails
  | 'task'      // Tasks
  | 'file'      // Files
  | 'person'    // Team members/people
  | 'activity'  // Site activities
  | 'link'      // Quick links
  | 'waiting'   // Items waiting on you
  | 'pending'   // Items pending from others
  | 'switch'    // Context switches
  | 'shared'    // Shared items
  | 'conflict'  // Scheduling conflicts
  | 'action'    // Suggested actions
  // Productivity Patterns cards
  | 'hour'      // Peak hours / after-hours
  | 'block'     // Deep work blocks
  | 'meeting'   // Meetings (prep gap, creep)
  | 'score'     // Composite scores (overload, capacity)
  | 'month'     // Seasonal/monthly periods
  | 'pattern';  // Response patterns

interface LabelRule {
  zero: string;      // Label when count is 0
  one: string;       // Label when count is 1
  other: string;     // Label when count > 1
}

/**
 * Pluralization rules for each label key
 * Zero cases provide positive messaging where appropriate
 */
const LABEL_RULES: Record<LabelKey, LabelRule> = {
  event:    { zero: 'No events',    one: 'Event',    other: 'Events' },
  email:    { zero: 'No emails',    one: 'Email',    other: 'Emails' },
  unread:   { zero: 'Inbox zero!',  one: 'Unread',   other: 'Unread' },
  task:     { zero: 'All done!',    one: 'Task',     other: 'Tasks' },
  file:     { zero: 'No files',     one: 'File',     other: 'Files' },
  person:   { zero: 'No contacts',  one: 'Person',   other: 'People' },
  activity: { zero: 'No activity',  one: 'Activity', other: 'Activities' },
  link:     { zero: 'No links',     one: 'Link',     other: 'Links' },
  waiting:  { zero: 'All clear!',   one: 'Waiting',  other: 'Waiting' },
  pending:  { zero: 'All clear!',   one: 'Pending',  other: 'Pending' },
  switch:   { zero: 'Focused!',     one: 'Switch',   other: 'Switches' },
  shared:   { zero: 'No shares',    one: 'Shared',   other: 'Shared' },
  conflict: { zero: 'No conflicts', one: 'Conflict', other: 'Conflicts' },
  action:   { zero: 'All clear!',   one: 'Action',   other: 'Actions' },
  // Productivity Patterns cards
  hour:     { zero: 'On track!',   one: 'Hour',     other: 'Hours' },
  block:    { zero: 'No blocks',   one: 'Block',    other: 'Blocks' },
  meeting:  { zero: 'No meetings', one: 'Meeting',  other: 'Meetings' },
  score:    { zero: 'Healthy!',    one: 'Point',    other: 'Points' },
  month:    { zero: 'No data',     one: 'Month',    other: 'Months' },
  pattern:  { zero: 'No patterns', one: 'Pattern',  other: 'Patterns' },
};

/**
 * Get the appropriate label for a count based on the label key
 * @param count - The numeric count to pluralize
 * @param labelKey - The type of item being counted
 * @returns The pluralized label string
 *
 * @example
 * getSmartLabel(0, 'task')   // "All done!"
 * getSmartLabel(1, 'task')   // "Task"
 * getSmartLabel(5, 'task')   // "Tasks"
 * getSmartLabel(1, 'person') // "Person"
 * getSmartLabel(3, 'person') // "People"
 */
export function getSmartLabel(count: number, labelKey: LabelKey): string {
  const rule = LABEL_RULES[labelKey];
  if (!rule) {
    // Fallback for unknown keys
    return count === 1 ? 'Item' : 'Items';
  }

  if (count === 0) return rule.zero;
  if (count === 1) return rule.one;
  return rule.other;
}

/**
 * Check if a string is a valid LabelKey
 */
export function isValidLabelKey(key: string): key is LabelKey {
  return key in LABEL_RULES;
}
