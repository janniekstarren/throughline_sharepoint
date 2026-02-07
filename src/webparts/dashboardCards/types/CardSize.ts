// ============================================
// Card Size Types
// Defines the three size variants for dashboard cards
// ============================================

/**
 * Card size variants:
 * - 'small': Compact chip/pill showing title, AI icon, expand button
 * - 'medium': Standard card view with summary content
 * - 'large': Expanded master-detail view
 */
export type CardSize = 'small' | 'medium' | 'large';

/**
 * State object mapping card IDs to their current size
 */
export interface ICardSizeState {
  [cardId: string]: CardSize;
}

/**
 * Default size for cards that don't have a stored preference
 */
export const DEFAULT_CARD_SIZE: CardSize = 'medium';

/**
 * Column span values for masonry grid
 * - small: 1 column (compact)
 * - medium: 1 column (standard)
 * - large: 2 columns (wide)
 */
export const CARD_COLUMN_SPANS: Record<CardSize, number> = {
  small: 1,
  medium: 1,
  large: 2,
};

/**
 * Get the column span for a card size
 */
export function getColumnSpan(size: CardSize): number {
  return CARD_COLUMN_SPANS[size];
}

/**
 * Get the next size in the cycle: small → medium → large → small
 */
export function getNextCardSize(currentSize: CardSize): CardSize {
  switch (currentSize) {
    case 'small':
      return 'medium';
    case 'medium':
      return 'large';
    case 'large':
      return 'small';
    default:
      return 'medium';
  }
}
