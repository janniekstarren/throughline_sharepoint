import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  FluentProvider,
  createDOMRenderer,
  RendererProvider,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  IEmailMessage,
  IFileItem,
  ITeamMember,
  ISharedFile,
} from '../services/GraphService';
import { useDashboardData, DataMode } from '../hooks/useDashboardData';
// Medium card components (standard list)
import { MyTasksCard } from './MyTasksCard';
import { RecentFilesCard } from './RecentFilesCard';
import { MyTeamCard } from './MyTeamCard';
import { SharedWithMeCard } from './SharedWithMeCard';
import { QuickLinksCard } from './QuickLinksCard';
import { SiteActivityCard } from './SiteActivityCard';
// Large card variants (master-detail layout)
import { TodaysAgendaCardLarge } from './TodaysAgendaCardLarge';
import { UnreadInboxCardLarge } from './UnreadInboxCardLarge';
import { UpcomingWeekCardLarge } from './UpcomingWeekCardLarge';
import { FlaggedEmailsCardLarge } from './FlaggedEmailsCardLarge';
// Waiting On You card
import { WaitingOnYouCard } from './WaitingOnYouCard';
import { WaitingOnOthersCard } from './WaitingOnOthersCard';
import { HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { Salutation, SalutationType, SalutationSize } from './Salutation';
import { CategorySection, IOrderedCard } from './CategorySection';
import { getFluentTheme, ThemeMode } from '../utils/themeUtils';
import styles from './DashboardCards.module.scss';

export interface ICardVisibility {
  showTodaysAgenda: boolean;
  showUnreadInbox: boolean;
  showMyTasks: boolean;
  showRecentFiles: boolean;
  showUpcomingWeek: boolean;
  showFlaggedEmails: boolean;
  showMyTeam: boolean;
  showSharedWithMe: boolean;
  showQuickLinks: boolean;
  showSiteActivity: boolean;
  showWaitingOnYou: boolean;
  showWaitingOnOthers: boolean;
}

// Import ICategoryConfig from CardConfigDialog
import { ICategoryConfig } from '../propertyPane/CardConfigDialog';

// Re-export for convenience
export type { ICategoryConfig };

// Large cards - these get full-width layout (master-detail)
const LARGE_CARDS = ['todaysAgenda', 'unreadInbox', 'upcomingWeek', 'flaggedEmails'];
const isLargeCard = (cardId: string): boolean => LARGE_CARDS.includes(cardId);

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
}

// Default card titles
const DEFAULT_CARD_TITLES: Record<string, string> = {
  todaysAgenda: "Today's Agenda",
  unreadInbox: 'Unread Inbox',
  myTasks: 'My Tasks',
  recentFiles: 'Recent Files',
  upcomingWeek: 'Upcoming Week',
  flaggedEmails: 'Flagged Emails',
  myTeam: 'My Team',
  sharedWithMe: 'Shared With Me',
  quickLinks: 'Quick Links',
  siteActivity: 'Site Activity',
  waitingOnYou: 'Waiting On You',
  waitingOnOthers: 'Waiting On Others',
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

export const DashboardCards: React.FC<IDashboardCardsProps> = ({
  context,
  salutationType,
  salutationSize,
  themeMode,
  cardVisibility,
  cardOrder,
  cardTitles,
  dataMode,
  categoryOrder = [],
  categoryNames = {},
  categoryConfig = {},
  cardCategoryAssignment = {},
  categoryIcons = {},
  waitingOnYouSettings = DEFAULT_WAITING_ON_YOU_SETTINGS,
  waitingOnOthersSettings = DEFAULT_WAITING_ON_OTHERS_SETTINGS,
}) => {
  // Helper to get card title (custom or default)
  const getCardTitle = (cardId: string): string => {
    return cardTitles[cardId] || DEFAULT_CARD_TITLES[cardId] || cardId;
  };
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

  // Consolidated dashboard data hook - replaces 27 individual useState calls
  // Supports both API mode (live Graph data) and Test mode (mock data)
  const { state: dashboardData } = useDashboardData(context, dataMode);

  // Action handler for hover card actions
  // This will be extended in Phase 2/3 to call Graph API for real actions
  const handleItemAction = React.useCallback((action: string, item: IHoverCardItem, itemType: HoverCardItemType): void => {
    console.log('Action triggered:', action, itemType, item);

    // For now, just log actions. In Phase 2/3, this will call GraphService methods
    switch (action) {
      case 'reply':
      case 'forward':
        // Open compose in Outlook (future: in-app compose)
        if (itemType === 'email') {
          const email = item as IEmailMessage;
          window.open(email.webLink, '_blank', 'noopener,noreferrer');
        }
        break;
      case 'flag':
        // Future: graphService.flagEmail(email.id, !email.isFlagged)
        console.log('Flag action - will be implemented with Graph API');
        break;
      case 'markRead':
        // Future: graphService.markEmailAsRead(email.id, !email.isRead)
        console.log('Mark read action - will be implemented with Graph API');
        break;
      case 'delete':
        // Future: graphService.deleteEmail(email.id) with confirmation
        console.log('Delete action - will be implemented with Graph API');
        break;
      case 'accept':
      case 'decline':
      case 'tentative':
        // Future: graphService.respondToEvent(event.id, action)
        console.log(`${action} action - will be implemented with Graph API`);
        break;
      case 'complete':
        // Future: graphService.markTaskComplete(task.id, task.listId)
        console.log('Complete task action - will be implemented with Graph API');
        break;
      case 'download':
        if (itemType === 'file') {
          const file = item as IFileItem;
          // Use webUrl for now, downloadUrl will need to be added via Graph API
          window.open(file.webUrl, '_blank', 'noopener,noreferrer');
        } else if (itemType === 'sharedFile') {
          const sharedFile = item as ISharedFile;
          window.open(sharedFile.webUrl, '_blank', 'noopener,noreferrer');
        }
        break;
      case 'copyLink':
        // Future: graphService.createShareLink(file.id)
        if (itemType === 'file' || itemType === 'sharedFile') {
          const file = item as IFileItem | ISharedFile;
          navigator.clipboard.writeText(file.webUrl).catch(console.error);
        }
        break;
      case 'scheduleMeeting':
        // Future: Open Teams meeting creation
        if (itemType === 'teamMember') {
          const member = item as ITeamMember;
          window.open(`https://teams.microsoft.com/l/meeting/new?attendees=${member.email}`, '_blank', 'noopener,noreferrer');
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, []);

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
      unreadInbox: cardVisibility.showUnreadInbox,
      myTasks: cardVisibility.showMyTasks,
      recentFiles: cardVisibility.showRecentFiles,
      upcomingWeek: cardVisibility.showUpcomingWeek,
      flaggedEmails: cardVisibility.showFlaggedEmails,
      myTeam: cardVisibility.showMyTeam,
      sharedWithMe: cardVisibility.showSharedWithMe,
      quickLinks: cardVisibility.showQuickLinks,
      siteActivity: cardVisibility.showSiteActivity,
      waitingOnYou: cardVisibility.showWaitingOnYou,
      waitingOnOthers: cardVisibility.showWaitingOnOthers,
    };
    return visibilityMap[cardId] ?? false;
  };

  // Render a card by its ID (returns the card element without visibility check)
  // Uses Large card variants for cards with master-detail layout
  const renderCardElement = (cardId: string): React.ReactNode => {
    const cardTitle = getCardTitle(cardId);

    switch (cardId) {
      // Large cards (master-detail layout)
      case 'todaysAgenda':
        return <TodaysAgendaCardLarge events={dashboardData.events.data} loading={dashboardData.events.loading} error={dashboardData.events.error} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'unreadInbox':
        return <UnreadInboxCardLarge emails={dashboardData.emails.data} loading={dashboardData.emails.loading} error={dashboardData.emails.error} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'upcomingWeek':
        return <UpcomingWeekCardLarge events={dashboardData.weekEvents.data} loading={dashboardData.weekEvents.loading} error={dashboardData.weekEvents.error} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'flaggedEmails':
        return <FlaggedEmailsCardLarge emails={dashboardData.flaggedEmails.data} loading={dashboardData.flaggedEmails.loading} error={dashboardData.flaggedEmails.error} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      // Medium cards (standard list)
      case 'myTasks':
        return <MyTasksCard tasks={dashboardData.tasks.data} loading={dashboardData.tasks.loading} error={dashboardData.tasks.error} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'recentFiles':
        return <RecentFilesCard files={dashboardData.files.data} loading={dashboardData.files.loading} error={dashboardData.files.error} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'myTeam':
        return <MyTeamCard members={dashboardData.teamMembers.data} loading={dashboardData.teamMembers.loading} error={dashboardData.teamMembers.error} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'sharedWithMe':
        return <SharedWithMeCard files={dashboardData.sharedFiles.data} loading={dashboardData.sharedFiles.loading} error={dashboardData.sharedFiles.error} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'quickLinks':
        return <QuickLinksCard links={dashboardData.quickLinks.data} title={cardTitle} />;
      case 'siteActivity':
        return <SiteActivityCard activities={dashboardData.siteActivity.data} loading={dashboardData.siteActivity.loading} error={dashboardData.siteActivity.error} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'waitingOnYou':
        return (
          <WaitingOnYouCard
            graphClient={graphClient || null}
            showChart={waitingOnYouSettings.showChart}
            staleDays={waitingOnYouSettings.staleDays}
            includeEmail={waitingOnYouSettings.includeEmail}
            includeTeamsChats={waitingOnYouSettings.includeTeamsChats}
            includeChannels={waitingOnYouSettings.includeChannels}
            includeMentions={waitingOnYouSettings.includeMentions}
            dataMode={dataMode}
          />
        );
      case 'waitingOnOthers':
        return (
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
          isLarge: isLargeCard(id),
          element: renderCardElement(id)
        }));

      return [
        <CategorySection
          key="all"
          categoryId="all"
          showTitle={false}
          orderedCards={orderedCards}
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
        isLarge: isLargeCard(id),
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
        />
      );
    });

    // Render any unassigned cards at the end (fallback)
    const unassignedCards = cardOrder.filter(
      cardId => !renderedCards.has(cardId) && isCardVisible(cardId)
    );

    if (unassignedCards.length > 0) {
      const orderedUnassigned: IOrderedCard[] = unassignedCards.map(id => ({
        id,
        isLarge: isLargeCard(id),
        element: renderCardElement(id)
      }));

      result.push(
        <CategorySection
          key="unassigned"
          categoryId="unassigned"
          showTitle={false}
          orderedCards={orderedUnassigned}
        />
      );
    }

    return result;
  };

  return (
    <RendererProvider renderer={renderer}>
      <FluentProvider theme={currentTheme}>
        <div className={styles.dashboard} ref={portalMountRef}>
          <Salutation type={salutationType} size={salutationSize} userName={userName} />
          {getOrderedCards()}
        </div>
      </FluentProvider>
    </RendererProvider>
  );
};

export default DashboardCards;
