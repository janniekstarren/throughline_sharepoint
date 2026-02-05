import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  FluentProvider,
  createDOMRenderer,
  RendererProvider,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
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

// Large cards - these get full-width layout (master-detail)
const LARGE_CARDS = [
  'todaysAgenda', 'upcomingWeek', 'email',
  'myTasks', 'recentFiles', 'sharedWithMe', 'myTeam', 'siteActivity', 'quickLinks',
  'waitingOnYou', 'waitingOnOthers', 'contextSwitching'
];

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

  // Use user preferences hook for per-user card order and collapsed state
  const {
    cardOrder,
    collapsedCardIds,
    setCardOrder: setUserCardOrder,
    setCollapsedCardIds: setUserCollapsedCardIds,
  } = useUserPreferences({
    userId,
    defaultCardOrder,
    defaultCollapsedCardIds,
  });

  // Drag state for switching to grid layout during drag
  const [isDragging, setIsDragging] = React.useState(false);

  // Helper to get card title (custom or default)
  const getCardTitle = (cardId: string): string => {
    return cardTitles[cardId] || DEFAULT_CARD_TITLES[cardId] || cardId;
  };

  // Convert collapsed card IDs to a Set for efficient lookup
  const collapsedCards = React.useMemo(
    () => new Set(collapsedCardIds),
    [collapsedCardIds]
  );

  // Toggle a card between collapsed (medium) and expanded (large)
  const toggleCardSize = React.useCallback((cardId: string): void => {
    const newCollapsedIds = collapsedCards.has(cardId)
      ? collapsedCardIds.filter(id => id !== cardId)
      : [...collapsedCardIds, cardId];

    // Save to user preferences (localStorage)
    setUserCollapsedCardIds(newCollapsedIds);

    // Also notify parent for property pane sync
    if (onCollapsedCardsChange) {
      onCollapsedCardsChange(newCollapsedIds);
    }
  }, [collapsedCards, collapsedCardIds, setUserCollapsedCardIds, onCollapsedCardsChange]);

  // Check if a card should render as large (considering collapsed state)
  const isCardLarge = React.useCallback((cardId: string): boolean => {
    // Only LARGE_CARDS can be large, and only if not collapsed
    return LARGE_CARDS.includes(cardId) && !collapsedCards.has(cardId);
  }, [collapsedCards]);

  // Handle drag end - reorder cards
  const handleDragEnd = React.useCallback((result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index && source.droppableId === destination.droppableId) return;

    // Get all visible cards in their current order
    const visibleCards = cardOrder.filter(id => isCardVisible(id));

    // Get the card being dragged
    const draggedCardId = result.draggableId;

    // Find the source and destination indices in the visible cards array
    const sourceIndex = visibleCards.indexOf(draggedCardId);
    if (sourceIndex === -1) return;

    // Calculate the destination index based on drop position
    // The destination.index from react-beautiful-dnd is relative to the droppable
    // We need to map it back to the full card order
    const newVisibleOrder = [...visibleCards];
    newVisibleOrder.splice(sourceIndex, 1);
    newVisibleOrder.splice(destination.index, 0, draggedCardId);

    // Rebuild the full cardOrder, preserving hidden cards in their positions
    const newCardOrder = cardOrder.map(id => {
      if (visibleCards.includes(id)) {
        // Replace with the reordered visible card at this position
        const visibleIndex = cardOrder.filter(cid => visibleCards.includes(cid)).indexOf(id);
        return newVisibleOrder[visibleIndex];
      }
      return id;
    });

    // Save to user preferences (localStorage)
    setUserCardOrder(newCardOrder);

    // Also notify parent for property pane sync (optional - admin might want to see changes)
    if (onCardOrderChange) {
      onCardOrderChange(newCardOrder);
    }
  }, [cardOrder, cardVisibility, setUserCardOrder, onCardOrderChange]);

  // Handle drag start
  const handleDragStart = React.useCallback(() => {
    setIsDragging(true);
  }, []);

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
    const isLarge = isCardLarge(cardId);

    // Helper to wrap card with error boundary
    const wrapWithErrorBoundary = (card: React.ReactNode): React.ReactNode => (
      <ErrorBoundary componentName={cardTitle} key={cardId}>
        {card}
      </ErrorBoundary>
    );

    switch (cardId) {
      // Enhanced cards with charts, stats, and top items
      // Pass context, dataMode, and onToggleSize - cards handle their own data fetching
      case 'todaysAgenda':
        return wrapWithErrorBoundary(
          isLarge
            ? <TodaysAgendaCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
            : <TodaysAgendaCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
        );
      case 'email':
        return wrapWithErrorBoundary(
          isLarge
            ? <EmailCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
            : <EmailCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
        );
      case 'upcomingWeek':
        return wrapWithErrorBoundary(
          isLarge
            ? <UpcomingWeekCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
            : <UpcomingWeekCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
        );
      case 'myTasks':
        return wrapWithErrorBoundary(
          isLarge
            ? <MyTasksCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
            : <MyTasksCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
        );
      case 'recentFiles':
        return wrapWithErrorBoundary(
          isLarge
            ? <RecentFilesCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
            : <RecentFilesCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
        );
      case 'myTeam':
        return wrapWithErrorBoundary(
          isLarge
            ? <MyTeamCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
            : <MyTeamCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
        );
      case 'sharedWithMe':
        return wrapWithErrorBoundary(
          isLarge
            ? <SharedWithMeCardLarge context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
            : <SharedWithMeCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
        );
      case 'siteActivity':
        // SiteActivityCardLarge not yet updated to new pattern - always use medium
        return wrapWithErrorBoundary(
          <SiteActivityCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
        );
      case 'quickLinks':
        // QuickLinksCardLarge has different props - use medium for now
        return wrapWithErrorBoundary(
          <QuickLinksCard context={context} dataMode={dataMode} aiDemoMode={dataMode === 'test' && aiDemoMode} onToggleSize={() => toggleCardSize(cardId)} />
        );
      // Analytics cards
      case 'waitingOnYou':
        return wrapWithErrorBoundary(
          isLarge
            ? <WaitingOnYouCardLarge
                graphClient={graphClient || null}
                showChart={waitingOnYouSettings.showChart}
                staleDays={waitingOnYouSettings.staleDays}
                includeEmail={waitingOnYouSettings.includeEmail}
                includeTeamsChats={waitingOnYouSettings.includeTeamsChats}
                includeChannels={waitingOnYouSettings.includeChannels}
                includeMentions={waitingOnYouSettings.includeMentions}
                dataMode={dataMode}
                aiDemoMode={dataMode === 'test' && aiDemoMode}
                onToggleSize={() => toggleCardSize(cardId)}
              />
            : <WaitingOnYouCard
                graphClient={graphClient || null}
                showChart={waitingOnYouSettings.showChart}
                staleDays={waitingOnYouSettings.staleDays}
                includeEmail={waitingOnYouSettings.includeEmail}
                includeTeamsChats={waitingOnYouSettings.includeTeamsChats}
                includeChannels={waitingOnYouSettings.includeChannels}
                includeMentions={waitingOnYouSettings.includeMentions}
                dataMode={dataMode}
                aiDemoMode={dataMode === 'test' && aiDemoMode}
                onToggleSize={() => toggleCardSize(cardId)}
              />
        );
      case 'waitingOnOthers':
        return wrapWithErrorBoundary(
          isLarge
            ? <WaitingOnOthersCardLarge
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
                onToggleSize={() => toggleCardSize(cardId)}
              />
            : <WaitingOnOthersCard
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
                onToggleSize={() => toggleCardSize(cardId)}
              />
        );
      case 'contextSwitching':
        return wrapWithErrorBoundary(
          isLarge
            ? <ContextSwitchingCardLarge
                graphClient={graphClient}
                dataMode={dataMode}
                aiDemoMode={dataMode === 'test' && aiDemoMode}
                title={cardTitle}
                onToggleSize={() => toggleCardSize(cardId)}
                settings={{
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
                }}
              />
            : <ContextSwitchingCard
                graphClient={graphClient}
                dataMode={dataMode}
                aiDemoMode={dataMode === 'test' && aiDemoMode}
                title={cardTitle}
                onToggleSize={() => toggleCardSize(cardId)}
                settings={{
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
                }}
              />
        );
      default:
        return null;
    }
  };

  // Get cards grouped by category using CategorySection with masonry layout
  // Cards are rendered in user-defined order within each category
  const getOrderedCards = (): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let globalIndex = 0; // Track global index for drag-and-drop

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
        .map(id => ({
          id,
          isLarge: isCardLarge(id),
          // Make EmailCard taller when in AI mode (more space for insights)
          isTall: dataMode === 'test' && aiDemoMode && isCardLarge(id) && id === 'email',
          element: renderCardElement(id)
        }));

      return [
        <CategorySection
          key="all"
          categoryId="all"
          showTitle={false}
          orderedCards={orderedCards}
          isDragging={isDragging}
          startIndex={0}
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
      const orderedCards: IOrderedCard[] = cardsInCategory.map(id => ({
        id,
        isLarge: isCardLarge(id),
        // Make card taller when in AI mode (more space for insights)
        isTall: dataMode === 'test' && aiDemoMode && isCardLarge(id),
        element: renderCardElement(id)
      }));

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
          isDragging={isDragging}
          startIndex={globalIndex}
        />
      );

      globalIndex += orderedCards.length;
    });

    // Render any unassigned cards at the end (fallback)
    const unassignedCards = cardOrder.filter(
      cardId => !renderedCards.has(cardId) && isCardVisible(cardId)
    );

    if (unassignedCards.length > 0) {
      const orderedUnassigned: IOrderedCard[] = unassignedCards.map(id => ({
        id,
        isLarge: isCardLarge(id),
        // Make card taller when in AI mode (more space for insights)
        isTall: dataMode === 'test' && aiDemoMode && isCardLarge(id),
        element: renderCardElement(id)
      }));

      result.push(
        <CategorySection
          key="unassigned"
          categoryId="unassigned"
          showTitle={false}
          orderedCards={orderedUnassigned}
          isDragging={isDragging}
          startIndex={globalIndex}
        />
      );
    }

    return result;
  };

  return (
    <RendererProvider renderer={renderer}>
      <FluentProvider theme={currentTheme}>
        <DragDropContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <div className={styles.dashboard} ref={portalMountRef}>
            <Salutation type={salutationType} size={salutationSize} userName={userName} />
            {getOrderedCards()}
          </div>
        </DragDropContext>
      </FluentProvider>
    </RendererProvider>
  );
};

export default DashboardCards;
