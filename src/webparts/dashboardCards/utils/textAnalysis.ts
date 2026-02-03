// ============================================
// Text Analysis Utilities
// Shared utilities for analyzing message content
// Used by WaitingOnYouService and WaitingOnOthersService
// ============================================

/**
 * Patterns for detecting questions in text
 */
const QUESTION_PATTERNS: RegExp[] = [
  /\?/,                                          // Direct question mark
  /can you/i, /could you/i, /would you/i,       // Request forms
  /what do you think/i, /thoughts\??/i,         // Opinion seeking
  /let me know/i, /waiting for/i, /need your/i, // Response expected
  /please (confirm|review|approve|check)/i      // Confirmation requests
];

/**
 * Patterns for detecting action requests in text
 */
const ACTION_REQUEST_PATTERNS: RegExp[] = [
  /please (send|provide|share|review|approve|confirm|check|update|complete|submit)/i,
  /can you (send|provide|share|review|approve|confirm|check|update|complete|submit)/i,
  /could you (send|provide|share|review|approve|confirm|check|update|complete|submit)/i,
  /need you to/i,
  /action required/i,
  /requires (your )?action/i,
  /waiting (for|on) you to/i
];

/**
 * Patterns for detecting deadline mentions in text
 */
const DEADLINE_PATTERNS: RegExp[] = [
  /by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  /by (end of day|eod|cob|close of business)/i,
  /deadline/i,
  /due (by|on|date)/i,
  /urgent/i,
  /asap/i,
  /time.?sensitive/i,
  /by \d{1,2}(\/|-)\d{1,2}/,                    // Date patterns like "by 3/15" or "by 3-15"
  /by (tomorrow|today|next week)/i
];

/**
 * Patterns for detecting @mentions in text
 */
const MENTION_PATTERNS: RegExp[] = [
  /@\w+/,                                        // @username format
  /<at id="[^"]*">/i,                           // Teams HTML mention format
  /\[mention\]/i                                 // Common mention placeholder
];

/**
 * Detect if text contains a question or request for response
 * @param text - The text content to analyze
 * @returns true if the text appears to be asking a question
 */
export function detectQuestion(text?: string): boolean {
  if (!text) return false;
  return QUESTION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Detect if text contains an action request
 * @param text - The text content to analyze
 * @returns true if the text contains an action request
 */
export function detectActionRequest(text?: string): boolean {
  if (!text) return false;
  return ACTION_REQUEST_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Detect if text mentions a deadline or urgency
 * @param text - The text content to analyze
 * @returns true if the text mentions a deadline
 */
export function detectDeadline(text?: string): boolean {
  if (!text) return false;
  return DEADLINE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Detect if text contains @mentions
 * @param text - The text content to analyze
 * @returns true if the text contains mentions
 */
export function detectMention(text?: string): boolean {
  if (!text) return false;
  return MENTION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Strip HTML tags from content
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')      // Remove HTML tags
    .replace(/&nbsp;/g, ' ')       // Replace non-breaking spaces
    .replace(/&amp;/g, '&')        // Decode ampersands
    .replace(/&lt;/g, '<')         // Decode less-than
    .replace(/&gt;/g, '>')         // Decode greater-than
    .replace(/&quot;/g, '"')       // Decode quotes
    .replace(/&#39;/g, "'")        // Decode apostrophes
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .trim();
}

/**
 * Extract a preview from text content
 * @param text - The text to create a preview from
 * @param maxLength - Maximum length of the preview (default: 200)
 * @returns Truncated text with ellipsis if needed
 */
export function extractPreview(text?: string, maxLength: number = 200): string {
  if (!text) return '';
  const clean = stripHtml(text);
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + '...';
}

/**
 * Calculate urgency score based on text analysis
 * Higher score = more urgent
 * @param text - The text to analyze
 * @returns Urgency score from 0-10
 */
export function calculateUrgencyScore(text?: string): number {
  if (!text) return 0;

  let score = 0;

  // Question adds urgency
  if (detectQuestion(text)) score += 2;

  // Action request adds more urgency
  if (detectActionRequest(text)) score += 3;

  // Deadline mention adds significant urgency
  if (detectDeadline(text)) score += 4;

  // @mention adds urgency
  if (detectMention(text)) score += 2;

  // Cap at 10
  return Math.min(score, 10);
}

/**
 * Analyze text and return all detected indicators
 * @param text - The text to analyze
 * @returns Object with all analysis results
 */
export interface TextAnalysisResult {
  hasQuestion: boolean;
  hasActionRequest: boolean;
  hasDeadline: boolean;
  hasMention: boolean;
  urgencyScore: number;
  preview: string;
}

export function analyzeText(text?: string, previewLength: number = 200): TextAnalysisResult {
  return {
    hasQuestion: detectQuestion(text),
    hasActionRequest: detectActionRequest(text),
    hasDeadline: detectDeadline(text),
    hasMention: detectMention(text),
    urgencyScore: calculateUrgencyScore(text),
    preview: extractPreview(text, previewLength)
  };
}
