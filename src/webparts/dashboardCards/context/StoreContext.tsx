// ============================================
// Store Context — Card Store UI state management
// Controls open/close, navigation, selection
// ============================================

import * as React from 'react';

// ============================================
// Store View — which screen is active
// ============================================
export type StoreView = 'browse' | 'cardDetail' | 'tierDetail';

// ============================================
// Store State Interface
// ============================================
export interface IStoreState {
  // Open/close
  isOpen: boolean;
  openStore: (cardId?: string) => void;
  closeStore: () => void;

  // Navigation
  currentView: StoreView;
  setView: (view: StoreView) => void;

  // Selection
  selectedCardId: string | null;
  selectedTierId: string | null;
  openCardDetail: (cardId: string) => void;
  openTierDetail: (tierId: string) => void;
  goBack: () => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

// ============================================
// Create Context
// ============================================
const StoreContext = React.createContext<IStoreState | undefined>(undefined);

// ============================================
// Store Provider Component
// ============================================
interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Open/close state
  const [isOpen, setIsOpen] = React.useState(false);

  // Navigation state
  const [currentView, setCurrentView] = React.useState<StoreView>('browse');
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = React.useState<string | null>(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');

  // Navigation history for back button
  const [viewHistory, setViewHistory] = React.useState<StoreView[]>([]);

  // Open store, optionally deep-linking to a card
  const openStore = React.useCallback((cardId?: string) => {
    setIsOpen(true);
    if (cardId) {
      setSelectedCardId(cardId);
      setCurrentView('cardDetail');
      setViewHistory(['browse']);
    } else {
      setCurrentView('browse');
      setViewHistory([]);
    }
  }, []);

  // Close store and reset state
  const closeStore = React.useCallback(() => {
    setIsOpen(false);
    // Defer state reset to avoid flicker during close
    setTimeout(() => {
      setCurrentView('browse');
      setSelectedCardId(null);
      setSelectedTierId(null);
      setSearchQuery('');
      setActiveCategory('all');
      setViewHistory([]);
    }, 200);
  }, []);

  // Navigate to card detail
  const openCardDetail = React.useCallback((cardId: string) => {
    setViewHistory(prev => [...prev, currentView]);
    setSelectedCardId(cardId);
    setSelectedTierId(null);
    setCurrentView('cardDetail');
  }, [currentView]);

  // Navigate to tier detail
  const openTierDetail = React.useCallback((tierId: string) => {
    setViewHistory(prev => [...prev, currentView]);
    setSelectedTierId(tierId);
    setSelectedCardId(null);
    setCurrentView('tierDetail');
  }, [currentView]);

  // Go back to previous view
  const goBack = React.useCallback(() => {
    if (viewHistory.length > 0) {
      const previousView = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setCurrentView(previousView);
      if (previousView === 'browse') {
        setSelectedCardId(null);
        setSelectedTierId(null);
      }
    } else {
      setCurrentView('browse');
      setSelectedCardId(null);
      setSelectedTierId(null);
    }
  }, [viewHistory]);

  // Set view directly
  const setView = React.useCallback((view: StoreView) => {
    setViewHistory(prev => [...prev, currentView]);
    setCurrentView(view);
  }, [currentView]);

  // Build context value
  const contextValue: IStoreState = React.useMemo(
    () => ({
      isOpen,
      openStore,
      closeStore,
      currentView,
      setView,
      selectedCardId,
      selectedTierId,
      openCardDetail,
      openTierDetail,
      goBack,
      searchQuery,
      setSearchQuery,
      activeCategory,
      setActiveCategory,
    }),
    [
      isOpen,
      openStore,
      closeStore,
      currentView,
      setView,
      selectedCardId,
      selectedTierId,
      openCardDetail,
      openTierDetail,
      goBack,
      searchQuery,
      activeCategory,
    ]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

// ============================================
// Custom Hook
// ============================================
export function useStore(): IStoreState {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// ============================================
// Export
// ============================================
export default StoreContext;
