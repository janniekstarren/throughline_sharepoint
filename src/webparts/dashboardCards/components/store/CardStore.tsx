// ============================================
// CardStore — Full-screen modal shell for the Card Store
// Pure CSS overlay (same pattern as CommandCentre.tsx)
// Three internal views: browse, cardDetail, tierDetail
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Input,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Search20Regular,
  ArrowLeft20Regular,
} from '@fluentui/react-icons';
import { CARD_REGISTRY } from '../../config/cardRegistry';
import { STORE_LISTINGS, getStoreListing } from '../../config/storeListings';
import { CardCategory } from '../../models/CardCatalog';
import { CardEntitlement } from '../../models/CardEntitlement';
import { useEntitlements } from '../../hooks/useEntitlements';
import { useLicense } from '../../context/LicenseContext';
import { LicenseTier } from '../../models/CardCatalog';
import { StoreCategoryNav } from './StoreCategoryNav';
import { StoreHero } from './StoreHero';
import { StoreCuratedSection } from './StoreCuratedSection';
import { StoreSearchResults } from './StoreSearchResults';
import { StoreCardDetail } from './StoreCardDetail';
import { StoreTierDetail } from './StoreTierDetail';
import { StoreTierCard } from './StoreTierCard';
import { SpendAdvisor } from './SpendAdvisor';
import { TIER_STORE_LISTINGS } from '../../config/tierStoreListings';

// ============================================
// Styles (follows CommandCentre.tsx pattern)
// ============================================

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999990,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: '95vw',
    maxWidth: '1600px',
    height: '92vh',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow64,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 999991,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  headerTitle: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  searchBox: {
    width: '280px',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: tokens.spacingHorizontalXL,
  },
});

// ============================================
// Props
// ============================================

interface CardStoreProps {
  isOpen: boolean;
  onDismiss: () => void;
  initialCardId?: string;
}

// ============================================
// Component
// ============================================

export const CardStore: React.FC<CardStoreProps> = ({
  isOpen,
  onDismiss,
  initialCardId,
}) => {
  const classes = useStyles();
  const { entitlementMap, startTrial, purchaseCard } = useEntitlements();
  const { currentTier } = useLicense();

  // Local navigation state (self-contained, no StoreContext needed for browse)
  const [currentView, setCurrentView] = React.useState<'browse' | 'cardDetail' | 'tierDetail'>('browse');
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = React.useState<LicenseTier | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');

  // Handle initial card deep-link
  React.useEffect(() => {
    if (isOpen && initialCardId) {
      setSelectedCardId(initialCardId);
      setCurrentView('cardDetail');
    }
  }, [isOpen, initialCardId]);

  // Reset state when closed
  React.useEffect(() => {
    if (!isOpen) {
      // Defer reset to avoid flicker
      const timeout = setTimeout(() => {
        setCurrentView('browse');
        setSelectedCardId(null);
        setSelectedTierId(null);
        setSearchQuery('');
        setActiveCategory('all');
      }, 200);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isOpen]);

  // Navigate to card detail
  const handleCardClick = React.useCallback((cardId: string) => {
    setSelectedCardId(cardId);
    setCurrentView('cardDetail');
  }, []);

  // Go back to browse
  const handleBack = React.useCallback(() => {
    setCurrentView('browse');
    setSelectedCardId(null);
    setSelectedTierId(null);
  }, []);

  // Navigate to tier detail
  const handleTierClick = React.useCallback((tierId: LicenseTier) => {
    setSelectedTierId(tierId);
    setCurrentView('tierDetail');
  }, []);

  // Trial & purchase handlers
  const handleStartTrial = React.useCallback((cardId: string) => {
    startTrial(cardId);
  }, [startTrial]);

  const handlePurchase = React.useCallback((cardId: string) => {
    purchaseCard(cardId, 'monthly');
  }, [purchaseCard]);

  // ---- Filtered cards ----
  const filteredCards = React.useMemo(() => {
    let cards = [...CARD_REGISTRY];

    // Category filter
    if (activeCategory !== 'all') {
      if (activeCategory === 'integrations') {
        cards = cards.filter(c => c.isIntegrationCard);
      } else if (activeCategory === 'tiers') {
        // Show tier subscriptions view — handled separately
        return [];
      } else if (activeCategory === 'new') {
        cards = cards.filter(c => {
          const listing = STORE_LISTINGS[c.id];
          return listing?.isNew;
        });
      } else {
        cards = cards.filter(c => c.category === activeCategory);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      cards = cards.filter(c => {
        const listing = STORE_LISTINGS[c.id];
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.tags?.some(t => t.toLowerCase().includes(q))) ||
          (listing?.headline?.toLowerCase().includes(q)) ||
          (listing?.longDescription?.toLowerCase().includes(q))
        );
      });
    }

    return cards;
  }, [activeCategory, searchQuery]);

  // ---- Curated sections (only on 'all' category with no search) ----
  const isDefaultBrowse = activeCategory === 'all' && !searchQuery.trim();

  const popularCards = React.useMemo(() => {
    if (!isDefaultBrowse) return [];
    return [...CARD_REGISTRY]
      .filter(c => STORE_LISTINGS[c.id]?.popularityRank !== undefined)
      .sort((a, b) => (STORE_LISTINGS[a.id]?.popularityRank ?? 99) - (STORE_LISTINGS[b.id]?.popularityRank ?? 99))
      .slice(0, 10);
  }, [isDefaultBrowse]);

  const newCards = React.useMemo(() => {
    if (!isDefaultBrowse) return [];
    return CARD_REGISTRY.filter(c => STORE_LISTINGS[c.id]?.isNew).slice(0, 10);
  }, [isDefaultBrowse]);

  const trendingCards = React.useMemo(() => {
    if (!isDefaultBrowse) return [];
    return CARD_REGISTRY.filter(c => STORE_LISTINGS[c.id]?.isTrending).slice(0, 10);
  }, [isDefaultBrowse]);

  const premiumCards = React.useMemo(() => {
    if (!isDefaultBrowse) return [];
    return CARD_REGISTRY.filter(c => {
      const listing = STORE_LISTINGS[c.id];
      return listing?.requiresIntelligence || listing?.pricingTier === 'enterprise';
    }).slice(0, 10);
  }, [isDefaultBrowse]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className={classes.overlay}
      onClick={onDismiss}
      role="presentation"
    >
      <div
        className={classes.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Card Store"
      >
        {/* ---- Header ---- */}
        <div className={classes.header}>
          <div className={classes.headerLeft}>
            {currentView !== 'browse' && (
              <Button
                appearance="subtle"
                icon={<ArrowLeft20Regular />}
                size="small"
                onClick={handleBack}
                aria-label="Back to store"
              />
            )}
            <div className={classes.headerTitle}>
              <Text className={classes.title}>
                {currentView === 'browse' ? '🛒 Card Store' :
                 currentView === 'cardDetail' && selectedCardId
                   ? CARD_REGISTRY.find(c => c.id === selectedCardId)?.name || 'Card Detail'
                   : 'Tier Detail'}
              </Text>
              <Text className={classes.subtitle}>
                {currentView === 'browse'
                  ? `${CARD_REGISTRY.length} intelligence cards · Browse, discover, and activate`
                  : currentView === 'cardDetail'
                  ? getStoreListing(selectedCardId || '').headline
                  : 'Compare tiers and find your best fit'}
              </Text>
            </div>
          </div>
          <div className={classes.headerRight}>
            {currentView === 'browse' && (
              <Input
                className={classes.searchBox}
                contentBefore={<Search20Regular />}
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(_e, data) => setSearchQuery(data.value)}
                size="small"
              />
            )}
            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={onDismiss}
              aria-label="Close store"
            />
          </div>
        </div>

        {/* ---- Category Nav (browse view only) ---- */}
        {currentView === 'browse' && (
          <div className={classes.toolbar}>
            <StoreCategoryNav
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        )}

        {/* ---- Content ---- */}
        <div className={classes.content}>
          {currentView === 'browse' && (
            <StoreBrowseView
              isDefaultBrowse={isDefaultBrowse}
              filteredCards={filteredCards}
              popularCards={popularCards}
              newCards={newCards}
              trendingCards={trendingCards}
              premiumCards={premiumCards}
              entitlementMap={entitlementMap}
              currentTier={currentTier}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onCardClick={handleCardClick}
              onTierClick={handleTierClick}
              onStartTrial={handleStartTrial}
              onPurchase={handlePurchase}
            />
          )}

          {currentView === 'cardDetail' && selectedCardId && (
            <StoreCardDetail
              cardId={selectedCardId}
              entitlementMap={entitlementMap}
              currentTier={currentTier as LicenseTier}
              onStartTrial={handleStartTrial}
              onPurchase={handlePurchase}
              onCardClick={handleCardClick}
            />
          )}

          {currentView === 'tierDetail' && selectedTierId && (
            <StoreTierDetail
              tierId={selectedTierId}
              onCardClick={handleCardClick}
            />
          )}
        </div>

        {/* ---- SpendAdvisor Footer ---- */}
        <SpendAdvisor />
      </div>
    </div>
  );
};

// ============================================
// Browse View — Hero + Curated + Grid
// ============================================

interface StoreBrowseViewProps {
  isDefaultBrowse: boolean;
  filteredCards: typeof CARD_REGISTRY;
  popularCards: typeof CARD_REGISTRY;
  newCards: typeof CARD_REGISTRY;
  trendingCards: typeof CARD_REGISTRY;
  premiumCards: typeof CARD_REGISTRY;
  entitlementMap: Map<string, CardEntitlement>;
  currentTier: string;
  activeCategory: string;
  searchQuery: string;
  onCardClick: (cardId: string) => void;
  onTierClick: (tierId: LicenseTier) => void;
  onStartTrial: (cardId: string) => void;
  onPurchase: (cardId: string) => void;
}

const StoreBrowseView: React.FC<StoreBrowseViewProps> = ({
  isDefaultBrowse,
  filteredCards,
  popularCards,
  newCards,
  trendingCards,
  premiumCards,
  entitlementMap,
  currentTier,
  activeCategory,
  searchQuery,
  onCardClick,
  onTierClick,
  onStartTrial,
  onPurchase,
}) => {
  // Tiers category view
  if (activeCategory === 'tiers') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Text weight="semibold" size={500}>Tier Subscriptions</Text>
        <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
          Subscribe to a tier to unlock all included cards. Each tier builds on the previous one.
        </Text>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {TIER_STORE_LISTINGS.map(tierListing => (
            <StoreTierCard
              key={tierListing.tierId}
              tierListing={tierListing}
              onClick={onTierClick}
            />
          ))}
        </div>
      </div>
    );
  }
  if (isDefaultBrowse) {
    return (
      <>
        {/* Hero carousel */}
        <StoreHero onCardClick={onCardClick} />

        {/* Curated sections */}
        {popularCards.length > 0 && (
          <StoreCuratedSection
            title="Most Popular"
            emoji="🔥"
            cards={popularCards}
            listings={STORE_LISTINGS}
            entitlementMap={entitlementMap}
            currentTier={currentTier as never}
            onCardClick={onCardClick}
            onStartTrial={onStartTrial}
            onPurchase={onPurchase}
          />
        )}

        {trendingCards.length > 0 && (
          <StoreCuratedSection
            title="Trending Now"
            emoji="📈"
            cards={trendingCards}
            listings={STORE_LISTINGS}
            entitlementMap={entitlementMap}
            currentTier={currentTier as never}
            onCardClick={onCardClick}
            onStartTrial={onStartTrial}
            onPurchase={onPurchase}
          />
        )}

        {newCards.length > 0 && (
          <StoreCuratedSection
            title="Recently Added"
            emoji="✨"
            cards={newCards}
            listings={STORE_LISTINGS}
            entitlementMap={entitlementMap}
            currentTier={currentTier as never}
            onCardClick={onCardClick}
            onStartTrial={onStartTrial}
            onPurchase={onPurchase}
          />
        )}

        {premiumCards.length > 0 && (
          <StoreCuratedSection
            title="Premium Intelligence"
            emoji="💎"
            cards={premiumCards}
            listings={STORE_LISTINGS}
            entitlementMap={entitlementMap}
            currentTier={currentTier as never}
            onCardClick={onCardClick}
            onStartTrial={onStartTrial}
            onPurchase={onPurchase}
          />
        )}

        {/* All cards grid */}
        <StoreSearchResults
          title="All Cards"
          cards={CARD_REGISTRY as never}
          listings={STORE_LISTINGS}
          entitlementMap={entitlementMap}
          currentTier={currentTier as never}
          onCardClick={onCardClick}
          onStartTrial={onStartTrial}
          onPurchase={onPurchase}
        />
      </>
    );
  }

  // Filtered or search view
  const title = searchQuery
    ? `Results for "${searchQuery}"`
    : getCategoryLabel(activeCategory);

  return (
    <StoreSearchResults
      title={title}
      cards={filteredCards}
      listings={STORE_LISTINGS}
      entitlementMap={entitlementMap}
      currentTier={currentTier as never}
      onCardClick={onCardClick}
      onStartTrial={onStartTrial}
      onPurchase={onPurchase}
    />
  );
};

// ============================================
// Helpers
// ============================================

function getCategoryLabel(categoryId: string): string {
  const labels: Record<string, string> = {
    'all': 'All Cards',
    [CardCategory.ImmediateAction]: 'Immediate Action',
    [CardCategory.ProductivityPatterns]: 'Productivity Patterns',
    [CardCategory.KnowledgeManagement]: 'Knowledge Management',
    [CardCategory.CollaborationHealth]: 'Collaboration Health',
    [CardCategory.ManagerToolkit]: 'Manager Toolkit',
    [CardCategory.GovernanceCompliance]: 'Governance & Compliance',
    'integrations': 'Integration Cards',
    'tiers': 'Tier Subscriptions',
    'new': 'New Cards',
  };
  return labels[categoryId] || 'Cards';
}
