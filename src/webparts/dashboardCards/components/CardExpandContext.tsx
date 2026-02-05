// ============================================
// CardExpandContext - Provides expand functionality to all cards
// ============================================

import * as React from 'react';

export interface ICardExpandContext {
  /** Callback to expand a card by its ID */
  expandCard: (cardId: string) => void;
  /** The currently expanded card ID (null if none) */
  expandedCardId: string | null;
}

const CardExpandContext = React.createContext<ICardExpandContext | undefined>(undefined);

export interface ICardExpandProviderProps {
  expandCard: (cardId: string) => void;
  expandedCardId: string | null;
  children: React.ReactNode;
}

export const CardExpandProvider: React.FC<ICardExpandProviderProps> = ({
  expandCard,
  expandedCardId,
  children,
}) => {
  const value = React.useMemo(
    () => ({ expandCard, expandedCardId }),
    [expandCard, expandedCardId]
  );

  return (
    <CardExpandContext.Provider value={value}>
      {children}
    </CardExpandContext.Provider>
  );
};

/**
 * Hook to access card expand functionality
 * Returns undefined when used outside of a CardExpandProvider
 */
export const useCardExpand = (): ICardExpandContext | undefined => {
  return React.useContext(CardExpandContext);
};

export default CardExpandContext;
