/**
 * QueryEngine - Pattern-matching NL query processor for the Intelligence Hub
 *
 * This is a POC engine that uses regex pattern matching (no LLM) to:
 * 1. Match user queries against registered intents
 * 2. Generate structured responses from demo data
 * 3. Simulate processing delay (800-1200ms) for realistic UX
 *
 * The first matching intent wins. The fallback intent (always last)
 * catches unrecognised queries.
 */

import { QUERY_INTENTS, QueryResponse, QueryIntent } from '../config/queryIntents';
import { DemoDataset, DEMO_DATA } from '../config/demoData';

// ============================================
// Interfaces
// ============================================

export interface QueryResult {
  response: QueryResponse;
  matchedIntent: string;
  processingTimeMs: number;
}

// ============================================
// Internal Helpers
// ============================================

/**
 * Find the first intent whose patterns match the query
 */
function matchIntent(query: string): QueryIntent | undefined {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return undefined;

  for (const intent of QUERY_INTENTS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(trimmed)) {
        return intent;
      }
    }
  }

  return undefined;
}

/**
 * Generate a random delay between min and max milliseconds
 */
function randomDelay(min: number = 800, max: number = 1200): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// Public API
// ============================================

/**
 * Process a natural language query against the demo dataset
 *
 * @param query - User's natural language question
 * @param data - Demo dataset to query against (defaults to DEMO_DATA)
 * @returns Promise that resolves with the query result after a simulated delay
 */
export async function processQuery(
  query: string,
  data: DemoDataset = DEMO_DATA
): Promise<QueryResult> {
  const startTime = Date.now();
  const delay = randomDelay();

  // Find matching intent
  const intent = matchIntent(query);

  // Simulate processing time
  await new Promise<void>(resolve => setTimeout(resolve, delay));

  // Generate response
  if (intent) {
    const response = intent.generateResponse(data);
    return {
      response,
      matchedIntent: intent.id,
      processingTimeMs: Date.now() - startTime,
    };
  }

  // Should never reach here since fallback catches everything,
  // but just in case:
  return {
    response: {
      summary: "I'm not sure how to help with that. Try asking about your team, meetings, or what needs your attention.",
      confidence: 'low',
      insights: [],
      sourceCards: [],
      suggestedFollowUps: [
        "What needs my attention today?",
        "Who's waiting on me?",
        "How's my team doing?",
      ],
    },
    matchedIntent: 'none',
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Check if a query would match any intent (without generating a response)
 * Useful for real-time input validation or suggestion highlighting
 *
 * @param query - User's query text
 * @returns The intent ID if matched, or undefined
 */
export function previewMatch(query: string): string | undefined {
  const intent = matchIntent(query);
  return intent?.id;
}

/**
 * Get all available intent IDs (for debugging/testing)
 */
export function getAvailableIntents(): string[] {
  return QUERY_INTENTS.map(i => i.id);
}
