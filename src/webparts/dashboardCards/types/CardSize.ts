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
