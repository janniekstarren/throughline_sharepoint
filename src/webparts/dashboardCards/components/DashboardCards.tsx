import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  FluentProvider,
  createDOMRenderer,
  RendererProvider,
  Theme,
  Spinner,
  IdPrefixProvider,
} from '@fluentui/react-components';
// Note: Drag-drop temporarily disabled to fix React Error #310
import { PortalProvider } from '../contexts/PortalContext';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { DataMode } from '../hooks/useDashboardData';
import { useUserPreferences } from '../hooks/useUserPreferences';
// Shared components
import { ErrorBoundary } from './shared';
// Enhanced card components (with charts, stats, top items)
// Import from subfolder index.ts files which export both medium and large variants
import { TodaysAgendaCard, TodaysAgendaCardLarge } from './TodaysAgendaCard';
import { UpcomingWeekCard, UpcomingWeekCardLarge } from './UpcomingWeekCard';
import { MyTasksCard, MyTasksCardLarge } from './MyTasksCard';
// Consolidated Email card (replaces UnreadInboxCard and FlaggedEmailsCard)
import { EmailCard, EmailCardLarge } from './EmailCard';
import { RecentFilesCard, RecentFilesCardLarge } from './RecentFilesCard';
import { MyTeamCard, MyTeamCardLarge } from './MyTeamCard';
import { SharedWithMeCard, SharedWithMeCardLarge } from './SharedWithMeCard';
import { SiteActivityCard } from './SiteActivityCard';
import { QuickLinksCard } from './QuickLinksCard';
// Waiting On cards
import { WaitingOnYouCard, WaitingOnYouCardLarge } from './WaitingOnYouCard';
import { WaitingOnOthersCard } from './WaitingOnOthersCard';
import { WaitingOnOthersCardLarge } from './WaitingOnOthersCardLarge';
// Context Switching card
import { ContextSwitchingCard, ContextSwitchingCardLarge } from './ContextSwitchingCard';
import { Salutation, SalutationType, SalutationSize } from './Salutation';
import { CategorySection, IOrderedCard } from './CategorySection';
// Legacy SettingsPanel removed — replaced by Command Centre
import { getFluentTheme, ThemeMode } from '../utils/themeUtils';
import { CardSize } from '../types/CardSize';
import { LicenseProvider, useLicense } from '../context/LicenseContext';
import { CardCategory, CardRegistration, CardStatus } from '../models/CardCatalog';
// TierSwitcher FAB removed — tier switching now in DashboardHeader menu bar
import { renderCardFromRegistry } from '../utils/cardRenderer';
import { resolveCard } from '../utils/cardUtils';
import { useCardRegistry } from '../hooks/useCardRegistry';
import { useCardPreferences } from '../hooks/useCardPreferences';
import { DashboardFooter } from './dashboard/DashboardFooter';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { CategoryNavRail, INavPill } from './dashboard/CategoryNavRail';
import { DashboardView } from './dashboard/ViewSwitcher';
import { searchCards } from '../utils/cardSearch';
import { CARD_REGISTRY } from '../config/cardRegistry';
import { getTierDefaultSizes } from '../config/tierLayouts';
import { FeatureFlagProvider, useFeatureFlags } from '../context/FeatureFlagContext';
import { IntegrationProvider, useIntegrations } from '../context/IntegrationContext';
import { CardCatalogPanel } from './dashboard/CardCatalogPanel';
import { CommandCentre } from './Settings/CommandCentre';
import { IntegrationsModal } from './integrations/IntegrationsModal';
import styles from './DashboardCards.module.scss';

export interface ICardVisibility {
  showTodaysAgenda: boolean;
  showEmail: boolean;
  showMyTasks: boolean;
  showRecentFiles: boolean;
  showUpcomingWeek: boolean;
  showMyTeam: boolean;
  showSharedWithMe: boolean;
  showQuickLinks: boolean;
  showSiteActivity: boolean;
  showWaitingOnYou: boolean;
  showWaitingOnOthers: boolean;
  showContextSwitching: boolean;
}

// Import ICategoryConfig from CardConfigDialog
import { ICategoryConfig } from '../propertyPane/CardConfigDialog';

// Re-export for convenience
export type { ICategoryConfig };

// Cards that have large variants (master-detail layout)
// Note: All cards now support 3 sizes (small/medium/large) via cardSizes
const _CARDS_WITH_LARGE_VARIANT = [
  'todaysAgenda', 'upcomingWeek', 'email',
  'myTasks', 'recentFiles', 'sharedWithMe', 'myTeam', 'siteActivity', 'quickLinks',
  'waitingOnYou', 'waitingOnOthers', 'contextSwitching'
];
void _CARDS_WITH_LARGE_VARIANT; // Suppress unused warning - kept for documentation

// Default icon IDs for system categories (matches AVAILABLE_ICONS in CardConfigDialog)
const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  calendar: 'calendar',
  email: 'mail',
  tasks: 'tasks',
  files: 'document',
  people: 'people',
  navigation: 'link',
};

// Waiting On You card settings
export interface IWaitingOnYouSettings {
  staleDays: number;
  includeEmail: boolean;
  includeTeamsChats: boolean;
  includeChannels: boolean;
  includeMentions: boolean;
  showChart: boolean;
}

// Waiting On Others card settings
export interface IWaitingOnOthersSettings {
  minWaitHours: number;
  includeEmail: boolean;
  includeTeamsChats: boolean;
  includeMentions: boolean;
  showChart: boolean;
}

// Context Switching card settings
export interface IContextSwitchingSettings {
  trackEmail: boolean;
  trackTeamsChat: boolean;
  trackTeamsChannel: boolean;
  trackMeetings: boolean;
  trackFiles: boolean;
  focusGoal: number;
  showFocusScore: boolean;
  showHourlyChart: boolean;
  showDistribution: boolean;
}

export interface IDashboardCardsProps {
  context: WebPartContext;
  salutationType: SalutationType;
  salutationSize: SalutationSize;
  themeMode: ThemeMode;
  cardVisibility: ICardVisibility;
  cardOrder: string[];
  cardTitles: Record<string, string>;
  // Data mode: 'api' for live Graph data, 'test' for mock data
  dataMode: DataMode;
  // AI Demo Mode: show AI-enhanced content (only applicable when dataMode === 'test')
  aiDemoMode?: boolean;
  // Category configuration
  categoryOrder?: string[];
  categoryNames?: Record<string, string>;
  categoryConfig?: Record<string, ICategoryConfig>;
  cardCategoryAssignment?: Record<string, string>;
  categoryIcons?: Record<string, string>;
  // Waiting On You settings
  waitingOnYouSettings?: IWaitingOnYouSettings;
  // Waiting On Others settings
  waitingOnOthersSettings?: IWaitingOnOthersSettings;
  // Context Switching settings
  contextSwitchingSettings?: IContextSwitchingSettings;
  // Collapsed card IDs (large cards shown as medium) - for persistence
  collapsedCardIds?: string[];
  // Callback when collapsed cards change (for persistence)
  onCollapsedCardsChange?: (cardIds: string[]) => void;
  // Callback when card order changes via drag-and-drop
  onCardOrderChange?: (newOrder: string[]) => void;
  // Demo mode: show tier switcher FAB
  isDemoMode?: boolean;
  // Admin feature flags
  featureFlags?: {
    allowUserCustomisation: boolean;
    allowCardHiding: boolean;
    allowCardPinning: boolean;
    allowCardRenaming: boolean;
    allowCategoryReorder: boolean;
    allowCategoryHiding: boolean;
    allowCategoryRenaming: boolean;
    allowViewSwitching: boolean;
    isDemoMode: boolean;
    showLockedCards: boolean;
    showPlaceholderCards: boolean;
    showCategoryDescriptions: boolean;
  };
  // Admin layout defaults
  defaultView?: string;
  showLockedCards?: boolean;
  showPlaceholderCards?: boolean;
  showCategoryDescriptions?: boolean;
}

// Default card titles
const DEFAULT_CARD_TITLES: Record<string, string> = {
  todaysAgenda: "Today's Agenda",
  email: 'Email',
  myTasks: 'My Tasks',
  recentFiles: 'Recent Files',
  upcomingWeek: 'Upcoming Week',
  myTeam: 'My Team',
  sharedWithMe: 'Shared With Me',
  quickLinks: 'Quick Links',
  siteActivity: 'Site Activity',
  waitingOnYou: 'Waiting On You',
  waitingOnOthers: 'Waiting On Others',
  contextSwitching: 'Context Switching',
};

// Create a renderer for Fluent UI 9 that targets the document
const renderer = createDOMRenderer(document);

// Default Waiting On You settings
const DEFAULT_WAITING_ON_YOU_SETTINGS: IWaitingOnYouSettings = {
  staleDays: 2,
  includeEmail: true,
  includeTeamsChats: true,
  includeChannels: false,
  includeMentions: true,
  showChart: true,
};

// Default Waiting On Others settings
const DEFAULT_WAITING_ON_OTHERS_SETTINGS: IWaitingOnOthersSettings = {
  minWaitHours: 24,
  includeEmail: true,
  includeTeamsChats: true,
  includeMentions: true,
  showChart: true,
};

// Default Context Switching settings
const DEFAULT_CONTEXT_SWITCHING_SETTINGS: IContextSwitchingSettings = {
  trackEmail: true,
  trackTeamsChat: true,
  trackTeamsChannel: true,
  trackMeetings: true,
  trackFiles: true,
  focusGoal: 25,
  showFocusScore: true,
  showHourlyChart: true,
  showDistribution: true,
};

export const DashboardCards: React.FC<IDashboardCardsProps> = (props) => {
  const { context, themeMode: adminThemeMode, featureFlags } = props;

  // Allow user override of theme mode (stored in localStorage via useCardPreferences)
  const [userThemeOverride, setUserThemeOverride] = React.useState<ThemeMode | undefined>(undefined);

  // Effective theme: user override wins, then admin default
  const effectiveThemeMode: ThemeMode = userThemeOverride || adminThemeMode;

  // Get theme from SharePoint (converts SP theme to Fluent UI v9, respecting theme mode)
  const [currentTheme, setCurrentTheme] = React.useState<Theme | null>(null);

  React.useEffect(() => {
    const theme = getFluentTheme(context, effectiveThemeMode);
    setCurrentTheme(theme);
  }, [context, effectiveThemeMode]);

  // Wait for theme to be ready
  if (!currentTheme) {
    return (
      <div className={styles.dashboard}>
        <Spinner label="Loading..." />
      </div>
    );
  }

  // Render provider stack FIRST, then inner component.
  // LicenseProvider must wrap DashboardCardsInner so useLicense() works correctly.
  return (
    <IdPrefixProvider value="throughline-dashboard">
      <RendererProvider renderer={renderer}>
        <FluentProvider theme={currentTheme} style={{ background: 'transparent' }}>
          <FeatureFlagProvider flags={featureFlags || {}}>
          <LicenseProvider>
          <IntegrationProvider>
            <DashboardCardsInner
              {...props}
              currentTheme={currentTheme}
              userThemeOverride={userThemeOverride}
              onUserThemeOverrideChange={setUserThemeOverride}
            />
          </IntegrationProvider>
          </LicenseProvider>
          </FeatureFlagProvider>
        </FluentProvider>
      </RendererProvider>
    </IdPrefixProvider>
  );
};

// ============================================
// Inner component — runs INSIDE LicenseProvider
// All hooks that depend on LicenseContext live here
// ============================================

interface IDashboardCardsInnerProps extends IDashboardCardsProps {
  currentTheme: Theme;
  userThemeOverride?: ThemeMode;
  onUserThemeOverrideChange?: (mode: ThemeMode | undefined) => void;
}

const DashboardCardsInner: React.FC<IDashboardCardsInnerProps> = ({
  context,
  salutationType: adminSalutationType,
  salutationSize,
  currentTheme,
  cardVisibility,
  cardOrder: defaultCardOrder,
  cardTitles,
  dataMode,
  aiDemoMode = false,
  categoryOrder = [],
  categoryNames = {},
  categoryConfig = {},
  cardCategoryAssignment = {},
  categoryIcons = {},
  waitingOnYouSettings = DEFAULT_WAITING_ON_YOU_SETTINGS,
  waitingOnOthersSettings = DEFAULT_WAITING_ON_OTHERS_SETTINGS,
  contextSwitchingSettings = DEFAULT_CONTEXT_SWITCHING_SETTINGS,
  collapsedCardIds: defaultCollapsedCardIds = [],
  onCollapsedCardsChange,
  onCardOrderChange,
  isDemoMode = false,
  featureFlags,
  showLockedCards = true,
  showPlaceholderCards = true,
  showCategoryDescriptions = true,
  themeMode: adminThemeMode,
  userThemeOverride,
  onUserThemeOverrideChange,
}) => {
  // Get current user ID for per-user preferences
  const userId = context.pageContext?.user?.loginName || '';

  // License state — NOW correctly inside LicenseProvider!
  const licenseState = useLicense();

  // Compute tier-appropriate default card sizes (large for hero cards, small for placeholders)
  const tierDefaultSizes = React.useMemo(
    () => getTierDefaultSizes(licenseState.currentTier),
    [licenseState.currentTier]
  );

  // Use user preferences hook for per-user card order, collapsed state, and card sizes
  const {
    cardOrder,
    collapsedCardIds,
    setCardOrder: setUserCardOrder,
    setCollapsedCardIds: setUserCollapsedCardIds,
    setCardSize,
    setAllCardSizes,
    getCardSize,
    resetToDefaults,
  } = useUserPreferences({
    userId,
    defaultCardOrder,
    defaultCollapsedCardIds,
    defaultCardSizes: tierDefaultSizes,
  });

  // Animation state (can be toggled via Command Centre in the future)
  const [animationsEnabled] = React.useState(true);

  // Helper to get card title (custom or default)
  const getCardTitle = (cardId: string): string => {
    return cardTitles[cardId] || DEFAULT_CARD_TITLES[cardId] || cardId;
  };

  // Convert collapsed card IDs to a Set for efficient lookup
  const collapsedCards = React.useMemo(
    () => new Set(collapsedCardIds),
    [collapsedCardIds]
  );

  // Legacy toggle function - kept for backwards compatibility with collapsedCardIds
  // New code should use cycleCardSize for 3-tier sizing
  void collapsedCards; // Suppress unused warning - kept for legacy support
  void setUserCollapsedCardIds; // Suppress unused warning

  // Get the current size of a card (for 3-tier sizing)
  const getCardSizeForRender = React.useCallback((cardId: string): CardSize => {
    return getCardSize(cardId);
  }, [getCardSize]);

  // Handle setting card size directly (used by CardSizeMenu dropdown)
  const handleSetCardSize = React.useCallback((cardId: string, size: CardSize): void => {
    setCardSize(cardId, size);
  }, [setCardSize]);

  // Check if a card is visible based on its visibility setting
  const isCardVisible = React.useCallback((cardId: string): boolean => {
    const visibilityMap: Record<string, boolean> = {
      todaysAgenda: cardVisibility.showTodaysAgenda,
      email: cardVisibility.showEmail,
      myTasks: cardVisibility.showMyTasks,
      recentFiles: cardVisibility.showRecentFiles,
      upcomingWeek: cardVisibility.showUpcomingWeek,
      myTeam: cardVisibility.showMyTeam,
      sharedWithMe: cardVisibility.showSharedWithMe,
      quickLinks: cardVisibility.showQuickLinks,
      siteActivity: cardVisibility.showSiteActivity,
      waitingOnYou: cardVisibility.showWaitingOnYou,
      waitingOnOthers: cardVisibility.showWaitingOnOthers,
      contextSwitching: cardVisibility.showContextSwitching,
    };
    return visibilityMap[cardId] ?? false;
  }, [cardVisibility]);

  // Handle card reorder within a category (called from CategorySection)
  const handleCardReorder = React.useCallback((newCardIds: string[]) => {
    // Rebuild the full cardOrder with the new order for visible cards
    const visibleCards = cardOrder.filter(id => isCardVisible(id));

    // Create a map of old positions to new positions for visible cards
    const reorderedVisible = newCardIds.filter(id => visibleCards.includes(id));

    // Rebuild cardOrder preserving hidden cards
    let visibleIndex = 0;
    const newCardOrder = cardOrder.map(id => {
      if (isCardVisible(id)) {
        const newId = reorderedVisible[visibleIndex] || id;
        visibleIndex++;
        return newId;
      }
      return id;
    });

    // Save to user preferences (localStorage)
    setUserCardOrder(newCardOrder);

    // Also notify parent for property pane sync (optional - admin might want to see changes)
    if (onCardOrderChange) {
      onCardOrderChange(newCardOrder);
    }
  }, [cardOrder, isCardVisible, setUserCardOrder, onCardOrderChange]);

  // User display name
  const [userName, setUserName] = React.useState<string>('');

  React.useEffect(() => {
    if (context.pageContext?.user?.displayName) {
      setUserName(context.pageContext.user.displayName);
    }
  }, [context]);

  // Create a ref for the portal mount node
  const portalMountRef = React.useRef<HTMLDivElement>(null);

  // Graph client for WaitingOnYou card
  const [graphClient, setGraphClient] = React.useState<MSGraphClientV3 | undefined>(undefined);

  // Initialize Graph client
  React.useEffect(() => {
    context.msGraphClientFactory
      .getClient('3')
      .then((client: MSGraphClientV3) => {
        setGraphClient(client);
      })
      .catch((err: Error) => {
        console.error('Failed to get Graph client:', err);
      });
  }, [context]);

  // Card catalog preferences (pinned, hidden, category collapse)
  const cardPrefs = useCardPreferences(userId);

  // Sync user theme override from localStorage on mount
  React.useEffect(() => {
    if (cardPrefs.themeMode && onUserThemeOverrideChange) {
      onUserThemeOverrideChange(cardPrefs.themeMode as ThemeMode);
    }
  }, [cardPrefs.themeMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effective salutation type: user override wins, then admin default
  const effectiveSalutationType = (cardPrefs.salutationType || adminSalutationType) as SalutationType;

  // Effective theme mode for display (user override wins)
  const effectiveThemeMode: ThemeMode = (cardPrefs.themeMode || adminThemeMode) as ThemeMode;

  // Effective menu mode: user override wins, default is 'expanded'
  const effectiveMenuMode = cardPrefs.navMode || 'expanded';

  // Category nav rail visibility — independent toggle
  const [isCategoriesVisible, setIsCategoriesVisible] = React.useState(true);

  // Re-sync when menu mode changes (e.g. user changes setting in Command Centre)
  React.useEffect(() => {
    // When menu is hidden, also hide categories
    if (effectiveMenuMode === 'hidden') {
      setIsCategoriesVisible(false);
    }
  }, [effectiveMenuMode]);

  // Integration state — MUST be before useCardRegistry (hooks above early returns)
  const { connectedPlatformIds, connectedCategories } = useIntegrations();
  const flags = useFeatureFlags();

  // Integrations enabled = admin flag (showIntegrations) AND user preference
  const effectiveIntegrationsEnabled = flags.showIntegrations && cardPrefs.integrationsEnabled;

  // Registry-based card grouping (all 94 cards, categorized by tier + integration status)
  // NOW correctly uses LicenseContext because we're inside LicenseProvider
  const cardRegistry = useCardRegistry(
    cardPrefs.hiddenCardIds,
    cardPrefs.pinnedCardIds,
    connectedPlatformIds,
    connectedCategories,
  );

  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentView, setCurrentView] = React.useState<DashboardView>('categories');

  // Catalog panel state
  const [isCatalogOpen, setIsCatalogOpen] = React.useState(false);

  // Command Centre state
  const [isCommandCentreOpen, setIsCommandCentreOpen] = React.useState(false);
  const [commandCentreInitialTab, setCommandCentreInitialTab] = React.useState<string | undefined>(undefined);
  const [commandCentreInitialPlatformId, setCommandCentreInitialPlatformId] = React.useState<string | undefined>(undefined);

  // Open Command Centre to a specific tab, optionally with a platform deep link
  const openCommandCentreTab = React.useCallback((tab: string, platformId?: string) => {
    setCommandCentreInitialTab(tab);
    setCommandCentreInitialPlatformId(platformId);
    setIsCommandCentreOpen(true);
  }, []);

  // Integrations modal state
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = React.useState(false);

  // Debounced search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) return [];
    return searchCards(searchQuery, CARD_REGISTRY);
  }, [searchQuery]);

  // Search handlers
  const handleSearch = React.useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = React.useCallback(() => {
    setSearchQuery('');
  }, []);

  // View change
  const handleViewChange = React.useCallback((view: DashboardView) => {
    setCurrentView(view);
  }, []);

  // Nav rail pills — "Overview" is always first, then categories, then locked
  const navPills: INavPill[] = React.useMemo(() => {
    const pills: INavPill[] = [];

    // "Overview" — flat grid of all accessible cards (no category grouping)
    pills.push({ id: 'overview', label: 'Overview', count: cardRegistry.totalCards });

    if (cardRegistry.pinnedCards.length > 0) {
      pills.push({ id: 'pinned', label: 'Pinned', count: cardRegistry.pinnedCards.length });
    }

    for (const group of cardRegistry.categorizedCards) {
      if (group.cards.length === 0) continue;
      pills.push({
        id: group.category.id,
        label: group.category.displayName,
        count: group.cards.length,
        color: group.category.color,
      });
    }

    // "Integrations" — shows all integration cards (connected or not) so users can discover them
    // Only visible when admin showIntegrations flag AND user integrationsEnabled pref are both true
    if (effectiveIntegrationsEnabled && cardRegistry.allIntegrationCards.length > 0) {
      pills.push({
        id: 'integrations',
        label: 'Integrations',
        count: cardRegistry.allIntegrationCards.length,
        color: '#0E7C7B',
      });
    }

    if (cardRegistry.lockedCards.length > 0) {
      pills.push({ id: 'locked', label: 'Locked', count: cardRegistry.lockedCards.length });
    }

    return pills;
  }, [cardRegistry, effectiveIntegrationsEnabled]);

  // Active category tracking (for nav rail highlighting)
  // Default to empty string — grouped category view, no specific pill highlighted
  const [activeCategory, setActiveCategory] = React.useState('');
  // Track whether user explicitly clicked a pill (vs scroll spy updating)
  const isUserClickRef = React.useRef(false);
  // Track whether we're in a flat-grid mode (overview or integrations) — ref avoids re-creating observer
  const isOverviewRef = React.useRef(false);
  isOverviewRef.current = activeCategory === 'overview' || activeCategory === 'integrations';

  // Scroll-spy: observe category sections and highlight the current one in the nav rail
  // IMPORTANT: deps do NOT include activeCategory to avoid re-creating observer on every
  // highlight change, which causes scroll position instability ("jump back up").
  React.useEffect(() => {
    if (searchQuery) return;

    const sections = document.querySelectorAll('[data-category-id]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip updates if in overview mode or user just clicked a pill
        if (isOverviewRef.current || isUserClickRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const catId = (entry.target as HTMLElement).getAttribute('data-category-id');
            if (catId) setActiveCategory(catId);
            break;
          }
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [searchQuery, cardRegistry]); // eslint-disable-line react-hooks/exhaustive-deps

  // Find the actual scrolling container — SharePoint uses a nested div, not window.
  // Falls back to documentElement for local workbench / non-SP contexts.
  const getScrollContainer = React.useCallback((): Element | Window => {
    // SharePoint modern page scroll containers (ordered by specificity)
    const selectors = [
      '[data-automation-id="contentScrollRegion"]',
      '[data-automation-id="workbenchPageContent"]',
      '.SPCanvas-canvas',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.scrollHeight > el.clientHeight) return el;
    }
    return window;
  }, []);

  // Scroll a target element into view within the correct scroll container
  const scrollToElement = React.useCallback((el: Element) => {
    const container = getScrollContainer();
    const rect = el.getBoundingClientRect();
    const offset = 80; // Account for sticky header + nav rail

    if (container === window) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({ top: Math.max(0, scrollTop + rect.top - offset), behavior: 'smooth' });
    } else {
      const containerEl = container as Element;
      const containerRect = containerEl.getBoundingClientRect();
      const targetY = containerEl.scrollTop + (rect.top - containerRect.top) - offset;
      containerEl.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  }, [getScrollContainer]);

  // Scroll to category on pill click, or switch to overview/integrations mode
  const handleCategoryNavClick = React.useCallback((categoryId: string) => {
    const wasOverview = isOverviewRef.current;
    setActiveCategory(categoryId);
    // "overview" and "integrations" don't scroll — they switch the entire grid to a flat layout
    if (categoryId === 'overview' || categoryId === 'integrations') return;
    // Temporarily disable scroll-spy to avoid conflicting updates during smooth scroll
    isUserClickRef.current = true;

    // Helper: find the target section and scroll to it
    const doScroll = (): void => {
      const el = document.querySelector(`[data-category-id="${categoryId}"]`);
      if (el) {
        scrollToElement(el);
      }
    };

    if (wasOverview) {
      // Switching from overview → categorized: DOM hasn't re-rendered yet.
      // Defer scroll until React has committed the new layout.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          doScroll();
        });
      });
    } else {
      doScroll();
    }

    // Re-enable scroll-spy after scroll animation settles
    setTimeout(() => { isUserClickRef.current = false; }, 800);
  }, [scrollToElement]);

  // Expand/collapse all
  const handleExpandAll = React.useCallback(() => {
    cardPrefs.expandAllCategories();
  }, [cardPrefs]);

  const handleCollapseAll = React.useCallback(() => {
    const allIds = cardRegistry.categorizedCards
      .map(g => g.category.id)
      .filter(id => id !== undefined);
    cardPrefs.collapseAllCategories(allIds);
  }, [cardPrefs, cardRegistry]);

  // Card size is now handled by CategorySection (large = full width, medium = masonry)
  // CARD_SIZES is still used by isLargeCard() to determine layout

  // Render a card by its ID (returns the card element without visibility check)
  // Uses Large card variants for cards with master-detail layout unless collapsed
  // Wraps each card with ErrorBoundary to prevent cascading failures
  const renderCardElement = (cardId: string): React.ReactNode => {
    const cardTitle = getCardTitle(cardId);

    // Helper to wrap card with error boundary
    const wrapWithErrorBoundary = (card: React.ReactNode): React.ReactNode => (
      <ErrorBoundary componentName={cardTitle} key={cardId}>
        {card}
      </ErrorBoundary>
    );

    // Get card size for this card
    const cardSize = getCardSizeForRender(cardId);

    switch (cardId) {
      // Enhanced cards with charts, stats, and top items
      // All cards now support small/medium/large sizes
      case 'todaysAgenda':
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <TodaysAgendaCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
          );
        }
        return wrapWithErrorBoundary(
          <TodaysAgendaCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} size={cardSize} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
        );
      case 'email':
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <EmailCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
          );
        }
        return wrapWithErrorBoundary(
          <EmailCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} size={cardSize} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
        );
      case 'upcomingWeek':
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <UpcomingWeekCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
          );
        }
        return wrapWithErrorBoundary(
          <UpcomingWeekCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} size={cardSize} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
        );
      case 'myTasks':
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <MyTasksCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
          );
        }
        return wrapWithErrorBoundary(
          <MyTasksCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} size={cardSize} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
        );
      case 'recentFiles':
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <RecentFilesCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
          );
        }
        return wrapWithErrorBoundary(
          <RecentFilesCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} size={cardSize} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
        );
      case 'myTeam':
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <MyTeamCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
          );
        }
        return wrapWithErrorBoundary(
          <MyTeamCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} size={cardSize} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
        );
      case 'sharedWithMe':
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <SharedWithMeCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
          );
        }
        return wrapWithErrorBoundary(
          <SharedWithMeCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} size={cardSize} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
        );
      case 'siteActivity':
        // SiteActivityCardLarge not yet updated to new pattern - always use medium or small
        return wrapWithErrorBoundary(
          <SiteActivityCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} size={cardSize} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
        );
      case 'quickLinks':
        // QuickLinksCardLarge has different props - use medium or small for now
        return wrapWithErrorBoundary(
          <QuickLinksCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} size={cardSize} onSizeChange={(size) => handleSetCardSize(cardId, size)} />
        );
      // Analytics cards
      case 'waitingOnYou': {
        const cardSize = getCardSizeForRender(cardId);
        // Large size uses the large card variant
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <WaitingOnYouCardLarge
              graphClient={graphClient || null}
              showChart={waitingOnYouSettings.showChart}
              staleDays={waitingOnYouSettings.staleDays}
              includeEmail={waitingOnYouSettings.includeEmail}
              includeTeamsChats={waitingOnYouSettings.includeTeamsChats}
              includeChannels={waitingOnYouSettings.includeChannels}
              includeMentions={waitingOnYouSettings.includeMentions}
              dataMode={dataMode}
              aiDemoMode={dataMode === 'test' && aiDemoMode}
              onSizeChange={(size) => handleSetCardSize(cardId, size)}
            />
          );
        }
        // Small and Medium sizes use the standard card with size prop
        return wrapWithErrorBoundary(
          <WaitingOnYouCard
            graphClient={graphClient || null}
            showChart={waitingOnYouSettings.showChart}
            staleDays={waitingOnYouSettings.staleDays}
            includeEmail={waitingOnYouSettings.includeEmail}
            includeTeamsChats={waitingOnYouSettings.includeTeamsChats}
            includeChannels={waitingOnYouSettings.includeChannels}
            includeMentions={waitingOnYouSettings.includeMentions}
            dataMode={dataMode}
            aiDemoMode={dataMode === 'test' && aiDemoMode}
            size={cardSize}
            onSizeChange={(size) => handleSetCardSize(cardId, size)}
          />
        );
      }
      case 'waitingOnOthers': {
        const cardSize = getCardSizeForRender(cardId);
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <WaitingOnOthersCardLarge
              context={context}
              settings={{
                minWaitHours: waitingOnOthersSettings.minWaitHours,
                includeEmail: waitingOnOthersSettings.includeEmail,
                includeTeamsChats: waitingOnOthersSettings.includeTeamsChats,
                includeMentions: waitingOnOthersSettings.includeMentions,
                showChart: waitingOnOthersSettings.showChart,
              }}
              dataMode={dataMode}
              aiDemoMode={dataMode === 'test' && aiDemoMode}
              onSizeChange={(size) => handleSetCardSize(cardId, size)}
            />
          );
        }
        return wrapWithErrorBoundary(
          <WaitingOnOthersCard
            context={context}
            settings={{
              minWaitHours: waitingOnOthersSettings.minWaitHours,
              includeEmail: waitingOnOthersSettings.includeEmail,
              includeTeamsChats: waitingOnOthersSettings.includeTeamsChats,
              includeMentions: waitingOnOthersSettings.includeMentions,
              showChart: waitingOnOthersSettings.showChart,
            }}
            dataMode={dataMode}
            aiDemoMode={dataMode === 'test' && aiDemoMode}
            size={cardSize}
            onSizeChange={(size) => handleSetCardSize(cardId, size)}
          />
        );
      }
      case 'contextSwitching': {
        const cardSize = getCardSizeForRender(cardId);
        const contextSettings = {
          minSwitchDuration: 30,
          trackEmail: contextSwitchingSettings.trackEmail,
          trackTeamsChat: contextSwitchingSettings.trackTeamsChat,
          trackTeamsChannel: contextSwitchingSettings.trackTeamsChannel,
          trackMeetings: contextSwitchingSettings.trackMeetings,
          trackFiles: contextSwitchingSettings.trackFiles,
          trackTasks: false,
          focusGoal: contextSwitchingSettings.focusGoal,
          workingHoursStart: 9,
          workingHoursEnd: 17,
          showFocusScore: contextSwitchingSettings.showFocusScore,
          showHourlyChart: contextSwitchingSettings.showHourlyChart,
          showDistribution: contextSwitchingSettings.showDistribution,
          trendDays: 7,
        };
        if (cardSize === 'large') {
          return wrapWithErrorBoundary(
            <ContextSwitchingCardLarge
              graphClient={graphClient}
              dataMode={dataMode}
              aiDemoMode={dataMode === 'test' && aiDemoMode}
              title={cardTitle}
              onSizeChange={(size) => handleSetCardSize(cardId, size)}
              settings={contextSettings}
            />
          );
        }
        return wrapWithErrorBoundary(
          <ContextSwitchingCard
            graphClient={graphClient}
            dataMode={dataMode}
            aiDemoMode={dataMode === 'test' && aiDemoMode}
            title={cardTitle}
            size={cardSize}
            onSizeChange={(size) => handleSetCardSize(cardId, size)}
            settings={contextSettings}
          />
        );
      }
      default: {
        // Registry-based fallback: render placeholder or locked cards for IDs not in the switch-case
        const registryCard = resolveCard(cardId);
        if (registryCard) {
          const renderProps = {
            context,
            graphClient: graphClient || null,
            dataMode,
            aiDemoMode: dataMode === 'test' && aiDemoMode,
            size: cardSize,
            onSizeChange: (size: CardSize) => handleSetCardSize(cardId, size),
            waitingOnYouSettings,
            waitingOnOthersSettings,
            contextSwitchingSettings,
            cardTitle,
            onOpenIntegrations: (platformId: string) => openCommandCentreTab('integrations', platformId),
          };
          return wrapWithErrorBoundary(
            renderCardFromRegistry(
              registryCard,
              renderProps,
              licenseState.currentTier,
              licenseState.isCardAccessible(registryCard.id),
            ) as React.ReactElement
          );
        }
        return null;
      }
    }
  };

  // Helper: render a card registration as an IOrderedCard for CategorySection
  // Optional sizeOverride forces a specific card size (used by compact view)
  const registryCardToOrdered = (card: { id: string; existingCardId?: string; status: string }, sizeOverride?: CardSize): IOrderedCard => {
    // Use existingCardId (legacy ID) for implemented cards, registry ID otherwise
    const renderableId = card.existingCardId || card.id;
    // Size key: legacy ID for implemented cards, registry ID for placeholders
    // This matches the keys used in tierLayouts.ts defaults
    const sizeKey = card.existingCardId || card.id;
    const cardSize = sizeOverride ?? getCardSizeForRender(sizeKey);
    return {
      id: card.id,
      size: cardSize,
      isLarge: cardSize === 'large',
      element: renderCardElement(renderableId),
    };
  };

  // Get cards grouped by category using CategorySection with masonry layout
  // Cards are rendered in user-defined order within each category
  const getOrderedCards = (): React.ReactNode[] => {
    const result: React.ReactNode[] = [];

    // Check for valid admin category configuration:
    // - Must have categories defined
    // - Must have category config
    // - Must have at least one card assigned to a valid category
    const hasValidCategoryConfig = categoryOrder.length > 0 &&
      Object.keys(categoryConfig).length > 0 &&
      Object.values(cardCategoryAssignment).some(catId => categoryOrder.includes(catId));

    console.log('[Throughline] Layout decision:', {
      hasValidCategoryConfig,
      categoryOrderLength: categoryOrder.length,
      categoryConfigKeys: Object.keys(categoryConfig).length,
      cardCategoryAssignmentKeys: Object.keys(cardCategoryAssignment).length,
      registryCards: cardRegistry.totalCards,
      tier: licenseState.currentTier,
    });

    if (!hasValidCategoryConfig) {
      // ============================================
      // REGISTRY-BASED CATEGORY LAYOUT
      // Uses the 80-card registry grouped by 6 canonical categories
      // ============================================

      // Effective "hide locked" = admin disabled OR user chose to hide
      const effectiveHideLockedCards = !showLockedCards || cardPrefs.hideLockedCards;
      // Effective "hide placeholders" = admin disabled OR user chose to hide
      const effectiveHidePlaceholders = !showPlaceholderCards || cardPrefs.hidePlaceholderCards;

      // Build locked card ID set from the registry (already computed by useCardRegistry)
      const lockedCardIds = new Set(cardRegistry.lockedCards.map(c => c.id));

      // Card filter: removes locked and/or placeholder cards based on settings
      const shouldShowCard = (c: { id: string; status?: string }): boolean => {
        if (effectiveHideLockedCards && lockedCardIds.has(c.id)) return false;
        if (effectiveHidePlaceholders && c.status === CardStatus.Placeholder) return false;
        return true;
      };

      // Pinned section (filter locked/placeholder cards if hiding)
      const pinnedToShow = cardRegistry.pinnedCards.filter(shouldShowCard);

      if (pinnedToShow.length > 0) {
        const pinnedOrdered: IOrderedCard[] = pinnedToShow
          .map(card => registryCardToOrdered(card))
          .filter(c => c.element !== null);

        if (pinnedOrdered.length > 0) {
          result.push(
            <CategorySection
              key="pinned"
              categoryId="pinned"
              categoryName="Pinned"
              iconId="star"
              orderedCards={pinnedOrdered}
              collapsed={cardPrefs.isCategoryCollapsed('pinned')}
              onToggleCollapsed={() => cardPrefs.toggleCategoryCollapse('pinned')}
              animationsEnabled={animationsEnabled}
            />
          );
        }
      }

      // Category sections (6 canonical categories)
      for (const group of cardRegistry.categorizedCards) {
        if (group.cards.length === 0) continue;

        const catMeta = group.category;
        const catId = catMeta.id;

        // Map Fluent icon name to the icon ID used by getIconById
        const iconMap: Record<string, string> = {
          FlashRegular: 'flash',
          PulseRegular: 'heartPulse',
          BookRegular: 'book',
          PeopleRegular: 'people',
          PersonBoardRegular: 'person',
          ShieldRegular: 'shield',
        };
        const iconId = iconMap[catMeta.icon] || 'grid';

        // Filter locked/placeholder cards from the group based on settings
        const cardsToShow = group.cards.filter(shouldShowCard);

        const orderedCards: IOrderedCard[] = cardsToShow
          .map(card => registryCardToOrdered(card))
          .filter(c => c.element !== null);

        if (orderedCards.length === 0) continue;

        const summaryParts: string[] = [];
        if (group.accessibleCount > 0) summaryParts.push(`${group.accessibleCount} accessible`);
        if (group.lockedCount > 0 && !effectiveHideLockedCards) summaryParts.push(`${group.lockedCount} locked`);
        const collapsedSummary = summaryParts.join(' · ');

        result.push(
          <CategorySection
            key={catId}
            categoryId={catId}
            categoryName={catMeta.displayName}
            iconId={iconId}
            categoryColor={catMeta.color}
            description={showCategoryDescriptions ? catMeta.description : undefined}
            orderedCards={orderedCards}
            collapsed={cardPrefs.isCategoryCollapsed(catId)}
            onToggleCollapsed={() => cardPrefs.toggleCategoryCollapse(catId)}
            collapsedSummary={collapsedSummary}
            animationsEnabled={animationsEnabled}
          />
        );
      }

      // Locked section at bottom (collapsed by default) — hidden by admin or user preference
      if (!effectiveHideLockedCards && cardRegistry.lockedCards.length > 0) {
        const lockedOrdered: IOrderedCard[] = cardRegistry.lockedCards
          .map(card => registryCardToOrdered(card))
          .filter(c => c.element !== null);

        if (lockedOrdered.length > 0) {
          // Locked section defaults to collapsed (inverse of normal categories).
          // If 'locked' is in collapsedCategories, treat as EXPANDED (toggled open).
          const isLockedCollapsed = !cardPrefs.isCategoryCollapsed('locked');
          result.push(
            <CategorySection
              key="locked"
              categoryId="locked"
              categoryName={`Locked (${cardRegistry.lockedCards.length})`}
              iconId="lock"
              orderedCards={lockedOrdered}
              collapsed={isLockedCollapsed}
              onToggleCollapsed={() => cardPrefs.toggleCategoryCollapse('locked')}
              collapsedSummary={`${cardRegistry.lockedCards.length} cards · Upgrade to unlock`}
              animationsEnabled={animationsEnabled}
            />
          );
        }
      }

      return result;
    }

    // ============================================
    // ADMIN-CONFIGURED CATEGORY LAYOUT (legacy path)
    // Uses admin property pane category configuration
    // ============================================

    // Track which cards have been rendered
    const renderedCards = new Set<string>();

    // Render each category with its own CategorySection
    categoryOrder.forEach(categoryId => {
      const catConfig = categoryConfig[categoryId];

      // Skip hidden categories
      if (catConfig && !catConfig.visible) return;

      // Get cards in this category (maintaining card order from cardOrder)
      const cardsInCategory = cardOrder.filter(
        cardId => cardCategoryAssignment[cardId] === categoryId && isCardVisible(cardId)
      );

      if (cardsInCategory.length === 0) return;

      // Track these cards as rendered
      cardsInCategory.forEach(id => renderedCards.add(id));

      // Create ordered cards array that preserves user's order
      const orderedCards: IOrderedCard[] = cardsInCategory.map(id => {
        const cardSize = getCardSizeForRender(id);
        return {
          id,
          size: cardSize,
          isLarge: cardSize === 'large',
          isTall: dataMode === 'test' && aiDemoMode && cardSize === 'large',
          element: renderCardElement(id)
        };
      });

      const categoryName = categoryNames[categoryId] || categoryId;
      const iconId = categoryIcons[categoryId] || DEFAULT_CATEGORY_ICONS[categoryId];

      result.push(
        <CategorySection
          key={categoryId}
          categoryId={categoryId}
          categoryName={categoryName}
          showTitle={catConfig?.showTitle !== false}
          iconId={iconId}
          orderedCards={orderedCards}
          onReorder={handleCardReorder}
          animationsEnabled={animationsEnabled}
        />
      );
    });

    // Render any unassigned cards at the end (fallback)
    const unassignedCards = cardOrder.filter(
      cardId => !renderedCards.has(cardId) && isCardVisible(cardId)
    );

    if (unassignedCards.length > 0) {
      const orderedUnassigned: IOrderedCard[] = unassignedCards.map(id => {
        const cardSize = getCardSizeForRender(id);
        return {
          id,
          size: cardSize,
          isLarge: cardSize === 'large',
          isTall: dataMode === 'test' && aiDemoMode && cardSize === 'large',
          element: renderCardElement(id)
        };
      });

      result.push(
        <CategorySection
          key="unassigned"
          categoryId="unassigned"
          showTitle={false}
          orderedCards={orderedUnassigned}
          onReorder={handleCardReorder}
          animationsEnabled={animationsEnabled}
        />
      );
    }

    return result;
  };

  return (
    <PortalProvider>
      <div className={styles.dashboard} ref={portalMountRef}>
        {/* Header with Salutation */}
        <div className={styles.dashboardHeader}>
          <Salutation type={effectiveSalutationType} size={salutationSize} userName={userName} />
        </div>

        {/* Dashboard search, view switcher, and overflow menu */}
        <DashboardHeader
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          searchResultCount={searchResults.length}
          totalCardCount={cardRegistry.totalCards}
          currentView={currentView}
          onViewChange={handleViewChange}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onOpenCatalog={() => setIsCatalogOpen(true)}
          onOpenCommandCentre={() => setIsCommandCentreOpen(true)}
          showCustomiseButton={featureFlags?.allowUserCustomisation !== false}
          isDemoMode={isDemoMode}
          currentTier={licenseState.currentTier}
          onTierChange={licenseState.setTier}
          accessibleCount={cardRegistry.totalAccessible}
          lockedCount={cardRegistry.totalLocked}
          onSetAllCardSizes={setAllCardSizes}
          isCategoriesVisible={isCategoriesVisible}
          onToggleCategories={() => setIsCategoriesVisible(prev => !prev)}
          menuMode={effectiveMenuMode}
          floatMenu={cardPrefs.floatMenu}
        />

        {/* Category nav rail — visible when toggled on and menu is not hidden */}
        {!searchQuery && effectiveMenuMode !== 'hidden' && isCategoriesVisible && (
          <CategoryNavRail
            pills={navPills}
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryNavClick}
          />
        )}

        {/* Card grid — search results, overview (flat), view modes, or category sections */}
        {searchQuery ? (
          <CategorySection
            key="search-results"
            categoryId="search-results"
            categoryName={`Search Results (${searchResults.length})`}
            showTitle={true}
            orderedCards={searchResults.map(result => registryCardToOrdered(result.card))}
            animationsEnabled={animationsEnabled}
          />
        ) : activeCategory === 'overview' ? (
          // Overview: flat grid of ALL cards — no category grouping
          <CategorySection
            key="overview"
            categoryId="overview"
            showTitle={false}
            orderedCards={(() => {
              const hideLockedInOverview = !showLockedCards || cardPrefs.hideLockedCards;
              const hidePlaceholdersInOverview = !showPlaceholderCards || cardPrefs.hidePlaceholderCards;
              const lockedIds = new Set(cardRegistry.lockedCards.map(c => c.id));
              // Combine all accessible cards (sorted by impact) + optionally locked cards
              const allCards = hideLockedInOverview
                ? cardRegistry.allAccessibleCards
                : [...cardRegistry.allAccessibleCards, ...cardRegistry.lockedCards];
              return allCards
                .filter(c => {
                  if (hidePlaceholdersInOverview && c.status === CardStatus.Placeholder) return false;
                  if (hideLockedInOverview && lockedIds.has(c.id)) return false;
                  return true;
                })
                .map(card => registryCardToOrdered(card))
                .filter(c => c.element !== null);
            })()}
            animationsEnabled={animationsEnabled}
          />
        ) : activeCategory === 'integrations' ? (
          // Integrations: flat grid of all integration cards (connected + available)
          <CategorySection
            key="integrations"
            categoryId="integrations"
            categoryName={`Integration Cards (${cardRegistry.allIntegrationCards.length})`}
            iconId="plug"
            showTitle={true}
            orderedCards={cardRegistry.allIntegrationCards
              .map(card => registryCardToOrdered(card))
              .filter(c => c.element !== null)}
            animationsEnabled={animationsEnabled}
          />
        ) : currentView === 'needsAttention' ? (
          // Needs Attention: Immediate Action cards first, then rest sorted by impact
          <CategorySection
            key="needs-attention"
            categoryId="needs-attention"
            categoryName="Needs Attention"
            iconId="flash"
            showTitle={true}
            orderedCards={(() => {
              const effectiveHideLocked = !showLockedCards || cardPrefs.hideLockedCards;
              const effectiveHidePlaceholders = !showPlaceholderCards || cardPrefs.hidePlaceholderCards;
              const lockedIds = new Set(cardRegistry.lockedCards.map(c => c.id));
              const allCards: CardRegistration[] = effectiveHideLocked
                ? [...cardRegistry.allAccessibleCards]
                : [...cardRegistry.allAccessibleCards, ...cardRegistry.lockedCards];
              return allCards
                .filter(c => {
                  if (effectiveHidePlaceholders && c.status === CardStatus.Placeholder) return false;
                  if (effectiveHideLocked && lockedIds.has(c.id)) return false;
                  return true;
                })
                // Sort: Immediate Action first, then by descending impact
                .sort((a, b) => {
                  const aIsImmediate = a.category === CardCategory.ImmediateAction ? 1 : 0;
                  const bIsImmediate = b.category === CardCategory.ImmediateAction ? 1 : 0;
                  if (aIsImmediate !== bIsImmediate) return bIsImmediate - aIsImmediate;
                  return b.impactRating - a.impactRating;
                })
                .map(card => registryCardToOrdered(card))
                .filter(c => c.element !== null);
            })()}
            animationsEnabled={animationsEnabled}
          />
        ) : currentView === 'highImpact' ? (
          // High Impact: all cards sorted by impact rating descending
          <CategorySection
            key="high-impact"
            categoryId="high-impact"
            categoryName="High Impact"
            iconId="heartPulse"
            showTitle={true}
            orderedCards={(() => {
              const effectiveHideLocked = !showLockedCards || cardPrefs.hideLockedCards;
              const effectiveHidePlaceholders = !showPlaceholderCards || cardPrefs.hidePlaceholderCards;
              const lockedIds = new Set(cardRegistry.lockedCards.map(c => c.id));
              const allCards: CardRegistration[] = effectiveHideLocked
                ? [...cardRegistry.allAccessibleCards]
                : [...cardRegistry.allAccessibleCards, ...cardRegistry.lockedCards];
              return allCards
                .filter(c => {
                  if (effectiveHidePlaceholders && c.status === CardStatus.Placeholder) return false;
                  if (effectiveHideLocked && lockedIds.has(c.id)) return false;
                  return true;
                })
                .sort((a, b) => b.impactRating - a.impactRating)
                .map(card => registryCardToOrdered(card))
                .filter(c => c.element !== null);
            })()}
            animationsEnabled={animationsEnabled}
          />
        ) : currentView === 'compact' ? (
          // Compact: same as categories view but all cards forced to small size
          (() => {
            const effectiveHideLocked = !showLockedCards || cardPrefs.hideLockedCards;
            const effectiveHidePlaceholders = !showPlaceholderCards || cardPrefs.hidePlaceholderCards;
            const lockedIds = new Set(cardRegistry.lockedCards.map(c => c.id));
            const allCards: CardRegistration[] = effectiveHideLocked
              ? [...cardRegistry.allAccessibleCards]
              : [...cardRegistry.allAccessibleCards, ...cardRegistry.lockedCards];
            const filtered = allCards.filter(c => {
              if (effectiveHidePlaceholders && c.status === CardStatus.Placeholder) return false;
              if (effectiveHideLocked && lockedIds.has(c.id)) return false;
              return true;
            });
            return (
              <CategorySection
                key="compact"
                categoryId="compact"
                showTitle={false}
                orderedCards={filtered
                  .map(card => registryCardToOrdered(card, 'small'))
                  .filter(c => c.element !== null)}
                animationsEnabled={animationsEnabled}
              />
            );
          })()
        ) : (
          getOrderedCards()
        )}

        {/* Dashboard Footer - card stats */}
        <DashboardFooter pinnedCount={cardRegistry.pinnedCards.length} />

        {/* Card Catalog Panel */}
        <CardCatalogPanel
          isOpen={isCatalogOpen}
          onDismiss={() => setIsCatalogOpen(false)}
          pinnedCardIds={cardPrefs.pinnedCardIds}
          hiddenCardIds={cardPrefs.hiddenCardIds}
          onTogglePin={cardPrefs.togglePin}
          onToggleHide={cardPrefs.toggleHide}
        />

        {/* Intelligence Command Centre */}
        <CommandCentre
          isOpen={isCommandCentreOpen}
          onDismiss={() => { setIsCommandCentreOpen(false); setCommandCentreInitialTab(undefined); setCommandCentreInitialPlatformId(undefined); }}
          initialTab={commandCentreInitialTab}
          initialPlatformId={commandCentreInitialPlatformId}
          permissions={{
            allowUserCustomisation: true,
            allowCardHiding: true,
            allowCardPinning: true,
            allowCardRenaming: true,
            allowCategoryReorder: true,
            allowCategoryHiding: true,
            allowCategoryRenaming: true,
            allowViewSwitching: true,
            isDemoMode: isDemoMode,
            showLockedCards: showLockedCards,
            showPlaceholderCards: showPlaceholderCards,
            showCategoryDescriptions: showCategoryDescriptions,
            showIntegrations: true,
            allowIntegrationConnect: true,
            showComingSoonPlatforms: true,
            showRequestedPlatforms: true,
            hasAnyUserFeature: true,
            ...featureFlags,
          }}
          pinnedCardIds={cardPrefs.pinnedCardIds}
          hiddenCardIds={cardPrefs.hiddenCardIds}
          onTogglePin={cardPrefs.togglePin}
          onToggleHide={cardPrefs.toggleHide}
          onResetAll={() => {
            // Reset card sizes to tier-appropriate defaults
            resetToDefaults();
            // Reset category collapse state
            cardPrefs.expandAllCategories();
            // Reset locked cards visibility
            cardPrefs.setHideLockedCards(false);
            // Reset placeholder cards visibility
            cardPrefs.setHidePlaceholderCards(false);
            // Reset greeting and theme to admin defaults
            cardPrefs.setSalutationType(undefined);
            cardPrefs.setThemeMode(undefined);
            cardPrefs.setNavMode(undefined);
            cardPrefs.setIntegrationsEnabled(true);
            cardPrefs.setFloatMenu(undefined);
            setIsCategoriesVisible(true);
            if (onUserThemeOverrideChange) {
              onUserThemeOverrideChange(undefined);
            }
          }}
          currentTier={licenseState.currentTier}
          hideLockedCards={cardPrefs.hideLockedCards}
          onHideLockedCardsChange={cardPrefs.setHideLockedCards}
          hidePlaceholderCards={cardPrefs.hidePlaceholderCards}
          onHidePlaceholderCardsChange={cardPrefs.setHidePlaceholderCards}
          salutationType={effectiveSalutationType}
          onSalutationTypeChange={(type) => {
            cardPrefs.setSalutationType(type);
          }}
          themeMode={effectiveThemeMode}
          onThemeModeChange={(mode) => {
            cardPrefs.setThemeMode(mode);
            if (onUserThemeOverrideChange) {
              onUserThemeOverrideChange(mode as ThemeMode | undefined);
            }
          }}
          navMode={effectiveMenuMode}
          onNavModeChange={(mode) => {
            cardPrefs.setNavMode(mode);
          }}
          integrationsEnabled={cardPrefs.integrationsEnabled}
          onIntegrationsEnabledChange={cardPrefs.setIntegrationsEnabled}
          floatMenu={cardPrefs.floatMenu}
          onFloatMenuChange={(float) => cardPrefs.setFloatMenu(float)}
        />

        {/* Integrations Modal */}
        <IntegrationsModal
          isOpen={isIntegrationsModalOpen}
          onDismiss={() => setIsIntegrationsModalOpen(false)}
          allowConnect={flags.allowIntegrationConnect}
          showComingSoon={flags.showComingSoonPlatforms}
          showRequested={flags.showRequestedPlatforms}
        />
      </div>
    </PortalProvider>
  );
};

export default DashboardCards;
