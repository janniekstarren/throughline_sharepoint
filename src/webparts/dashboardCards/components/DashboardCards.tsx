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
// Note: Drag-drop now handled by @dnd-kit in CategorySection
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
import { getFluentTheme, ThemeMode } from '../utils/themeUtils';
import { CardSize } from '../types/CardSize';
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

export const DashboardCards: React.FC<IDashboardCardsProps> = ({
  context,
  salutationType,
  salutationSize,
  themeMode,
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
}) => {
  // Get current user ID for per-user preferences
  const userId = context.pageContext?.user?.loginName || '';

  // Use user preferences hook for per-user card order, collapsed state, and card sizes
  const {
    cardOrder,
    collapsedCardIds,
    setCardOrder: setUserCardOrder,
    setCollapsedCardIds: setUserCollapsedCardIds,
    setCardSize,
    getCardSize,
  } = useUserPreferences({
    userId,
    defaultCardOrder,
    defaultCollapsedCardIds,
  });

  // Animation state (can be toggled via future settings panel)
  const animationsEnabled = true;

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
  }, [cardOrder, setUserCardOrder, onCardOrderChange]);

  // Get theme from SharePoint (converts SP theme to Fluent UI v9, respecting theme mode)
  const [currentTheme, setCurrentTheme] = React.useState<Theme | null>(null);
  const [userName, setUserName] = React.useState<string>('');

  React.useEffect(() => {
    // Get the Fluent UI theme derived from SharePoint's theme, respecting theme mode
    const theme = getFluentTheme(context, themeMode);
    setCurrentTheme(theme);

    // Get current user's display name
    if (context.pageContext?.user?.displayName) {
      setUserName(context.pageContext.user.displayName);
    }
  }, [context, themeMode]);

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

  // Wait for theme to be ready
  if (!currentTheme) {
    return (
      <div className={styles.dashboard}>
        <Spinner label="Loading..." />
      </div>
    );
  }

  // Card size is now handled by CategorySection (large = full width, medium = masonry)
  // CARD_SIZES is still used by isLargeCard() to determine layout

  // Check if a card is visible based on its visibility setting
  const isCardVisible = (cardId: string): boolean => {
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
  };

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
      default:
        return null;
    }
  };

  // Get cards grouped by category using CategorySection with masonry layout
  // Cards are rendered in user-defined order within each category
  const getOrderedCards = (): React.ReactNode[] => {
    const result: React.ReactNode[] = [];

    // Check for valid category configuration:
    // - Must have categories defined
    // - Must have category config
    // - Must have at least one card assigned to a valid category
    const hasValidCategoryConfig = categoryOrder.length > 0 &&
      Object.keys(categoryConfig).length > 0 &&
      Object.values(cardCategoryAssignment).some(catId => categoryOrder.includes(catId));

    if (!hasValidCategoryConfig) {
      // No valid category config - render all cards in a single CategorySection
      // Maintain user's card order
      const orderedCards: IOrderedCard[] = cardOrder
        .filter(id => isCardVisible(id))
        .map(id => {
          const cardSize = getCardSizeForRender(id);
          return {
            id,
            size: cardSize,
            isLarge: cardSize === 'large', // Legacy support
            // Make EmailCard taller when in AI mode (more space for insights)
            isTall: dataMode === 'test' && aiDemoMode && cardSize === 'large' && id === 'email',
            element: renderCardElement(id)
          };
        });

      return [
        <CategorySection
          key="all"
          categoryId="all"
          showTitle={false}
          orderedCards={orderedCards}
          onReorder={handleCardReorder}
          animationsEnabled={animationsEnabled}
        />
      ];
    }

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
          isLarge: cardSize === 'large', // Legacy support
          // Make card taller when in AI mode (more space for insights)
          isTall: dataMode === 'test' && aiDemoMode && cardSize === 'large',
          element: renderCardElement(id)
        };
      });

      const categoryName = categoryNames[categoryId] || categoryId;
      // Use custom icon if set, otherwise fall back to default icon for system categories
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
          isLarge: cardSize === 'large', // Legacy support
          // Make card taller when in AI mode (more space for insights)
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
    <IdPrefixProvider value="throughline-dashboard">
      <RendererProvider renderer={renderer}>
        <FluentProvider theme={currentTheme}>
          <PortalProvider>
            <div className={styles.dashboard} ref={portalMountRef}>
              <Salutation type={salutationType} size={salutationSize} userName={userName} />
              {getOrderedCards()}
            </div>
          </PortalProvider>
        </FluentProvider>
      </RendererProvider>
    </IdPrefixProvider>
  );
};

export default DashboardCards;
