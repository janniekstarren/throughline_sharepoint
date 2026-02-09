// ============================================
// Card Search
// Weighted matching across card metadata
// ============================================

import { CardRegistration, CardCategoryMeta, CardStatus } from '../models/CardCatalog';

// ============================================
// Types
// ============================================

export interface ISearchResult {
  card: CardRegistration;
  score: number;
  matchedField: string;
  matchedText: string;
}

// ============================================
// Weights
// ============================================

const FIELD_WEIGHTS = {
  name: 100,
  tags: 80,
  description: 60,
  categoryName: 40,
  keyValue: 30,
};

const IMPLEMENTED_BOOST = 20;

// ============================================
// Search
// ============================================

/**
 * Search the card registry by query string.
 * Returns scored results sorted by relevance (descending).
 */
export function searchCards(
  query: string,
  registry: CardRegistration[],
): ISearchResult[] {
  if (!query || query.trim().length === 0) return [];

  const normalizedQuery = query.trim().toLowerCase();
  const results: ISearchResult[] = [];

  for (const card of registry) {
    let bestScore = 0;
    let matchedField = '';
    let matchedText = '';

    // Name match
    const nameScore = scoreMatch(card.name, normalizedQuery);
    if (nameScore > 0) {
      const weighted = nameScore * FIELD_WEIGHTS.name;
      if (weighted > bestScore) {
        bestScore = weighted;
        matchedField = 'name';
        matchedText = card.name;
      }
    }

    // Tags match
    if (card.tags) {
      for (const tag of card.tags) {
        const tagScore = scoreMatch(tag, normalizedQuery);
        if (tagScore > 0) {
          const weighted = tagScore * FIELD_WEIGHTS.tags;
          if (weighted > bestScore) {
            bestScore = weighted;
            matchedField = 'tag';
            matchedText = tag;
          }
        }
      }
    }

    // Description match
    const descScore = scoreMatch(card.description, normalizedQuery);
    if (descScore > 0) {
      const weighted = descScore * FIELD_WEIGHTS.description;
      if (weighted > bestScore) {
        bestScore = weighted;
        matchedField = 'description';
        matchedText = card.description;
      }
    }

    // Category name match
    const catMeta = CardCategoryMeta[card.category];
    if (catMeta) {
      const catScore = scoreMatch(catMeta.displayName, normalizedQuery);
      if (catScore > 0) {
        const weighted = catScore * FIELD_WEIGHTS.categoryName;
        if (weighted > bestScore) {
          bestScore = weighted;
          matchedField = 'category';
          matchedText = catMeta.displayName;
        }
      }
    }

    // Key value match
    const kvScore = scoreMatch(card.keyValue, normalizedQuery);
    if (kvScore > 0) {
      const weighted = kvScore * FIELD_WEIGHTS.keyValue;
      if (weighted > bestScore) {
        bestScore = weighted;
        matchedField = 'keyValue';
        matchedText = card.keyValue;
      }
    }

    // Apply boosts
    if (bestScore > 0) {
      if (card.status === CardStatus.Implemented) {
        bestScore += IMPLEMENTED_BOOST;
      }
      bestScore += card.impactRating;

      results.push({ card, score: bestScore, matchedField, matchedText });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results;
}

// ============================================
// Helpers
// ============================================

/**
 * Simple substring match scoring.
 * Returns 1.0 for exact match, 0.5-0.9 for prefix/contains, 0 for no match.
 */
function scoreMatch(text: string, query: string): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  if (lower === query) return 1.0;
  if (lower.startsWith(query)) return 0.9;
  if (lower.includes(query)) return 0.5;

  // Word-level matching (any word starts with query)
  const words = lower.split(/[\s\-_]+/);
  for (const word of words) {
    if (word.startsWith(query)) return 0.7;
  }

  return 0;
}
