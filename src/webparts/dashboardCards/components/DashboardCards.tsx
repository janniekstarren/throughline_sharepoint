import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  FluentProvider,
  createDOMRenderer,
  RendererProvider,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  GraphService,
  ICalendarEvent,
  IEmailMessage,
  ITaskItem,
  IFileItem,
  ITeamMember,
  ISharedFile,
  ISiteActivity,
  IQuickLink
} from '../services/GraphService';
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
import { HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { Salutation, SalutationType, SalutationSize } from './Salutation';
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
}

// Import ICategoryConfig from CardConfigDialog
import { ICategoryConfig } from '../propertyPane/CardConfigDialog';

// Re-export for convenience
export type { ICategoryConfig };

// Card size type - determines how much space a card takes
export type CardSize = 'large' | 'medium';

// Card sizes - Large cards use master-detail layout, Medium cards use standard list
const CARD_SIZES: Record<string, CardSize> = {
  // Large cards (master-detail layout - 8 columns)
  todaysAgenda: 'large',
  unreadInbox: 'large',
  upcomingWeek: 'large',
  flaggedEmails: 'large',
  // Medium cards (standard list - 4 columns)
  myTasks: 'medium',
  recentFiles: 'medium',
  sharedWithMe: 'medium',
  myTeam: 'medium',
  siteActivity: 'medium',
  quickLinks: 'medium',
};

export interface IDashboardCardsProps {
  context: WebPartContext;
  salutationType: SalutationType;
  salutationSize: SalutationSize;
  themeMode: ThemeMode;
  cardVisibility: ICardVisibility;
  cardOrder: string[];
  cardTitles: Record<string, string>;
  // Category configuration
  categoryOrder?: string[];
  categoryNames?: Record<string, string>;
  categoryConfig?: Record<string, ICategoryConfig>;
  cardCategoryAssignment?: Record<string, string>;
  categoryIcons?: Record<string, string>;
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
};

// Create a renderer for Fluent UI 9 that targets the document
const renderer = createDOMRenderer(document);

export const DashboardCards: React.FC<IDashboardCardsProps> = ({
  context,
  salutationType,
  salutationSize,
  themeMode,
  cardVisibility,
  cardOrder,
  cardTitles,
  categoryOrder = [],
  categoryNames = {},
  categoryConfig = {},
  cardCategoryAssignment = {},
  categoryIcons = {},
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
  // Today's events
  const [events, setEvents] = React.useState<ICalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = React.useState<boolean>(true);
  const [eventsError, setEventsError] = React.useState<string | undefined>(undefined);

  // Unread emails
  const [emails, setEmails] = React.useState<IEmailMessage[]>([]);
  const [emailsLoading, setEmailsLoading] = React.useState<boolean>(true);
  const [emailsError, setEmailsError] = React.useState<string | undefined>(undefined);

  // Tasks
  const [tasks, setTasks] = React.useState<ITaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = React.useState<boolean>(true);
  const [tasksError, setTasksError] = React.useState<string | undefined>(undefined);

  // Recent files
  const [files, setFiles] = React.useState<IFileItem[]>([]);
  const [filesLoading, setFilesLoading] = React.useState<boolean>(true);
  const [filesError, setFilesError] = React.useState<string | undefined>(undefined);

  // Upcoming week events
  const [weekEvents, setWeekEvents] = React.useState<ICalendarEvent[]>([]);
  const [weekEventsLoading, setWeekEventsLoading] = React.useState<boolean>(true);
  const [weekEventsError, setWeekEventsError] = React.useState<string | undefined>(undefined);

  // Flagged emails
  const [flaggedEmails, setFlaggedEmails] = React.useState<IEmailMessage[]>([]);
  const [flaggedEmailsLoading, setFlaggedEmailsLoading] = React.useState<boolean>(true);
  const [flaggedEmailsError, setFlaggedEmailsError] = React.useState<string | undefined>(undefined);

  // Team members
  const [teamMembers, setTeamMembers] = React.useState<ITeamMember[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = React.useState<boolean>(true);
  const [teamMembersError, setTeamMembersError] = React.useState<string | undefined>(undefined);

  // Shared files
  const [sharedFiles, setSharedFiles] = React.useState<ISharedFile[]>([]);
  const [sharedFilesLoading, setSharedFilesLoading] = React.useState<boolean>(true);
  const [sharedFilesError, setSharedFilesError] = React.useState<string | undefined>(undefined);

  // Site activity
  const [siteActivity, setSiteActivity] = React.useState<ISiteActivity[]>([]);
  const [siteActivityLoading, setSiteActivityLoading] = React.useState<boolean>(true);
  const [siteActivityError, setSiteActivityError] = React.useState<string | undefined>(undefined);

  // Quick links (static for now)
  const [quickLinks] = React.useState<IQuickLink[]>([]);

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

  React.useEffect(() => {
    const graphService = new GraphService(context);

    const fetchEvents = async (): Promise<void> => {
      try {
        setEventsLoading(true);
        setEventsError(undefined);
        const todaysEvents = await graphService.getTodaysEvents();
        setEvents(todaysEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setEventsError('Failed to load calendar events.');
      } finally {
        setEventsLoading(false);
      }
    };

    const fetchEmails = async (): Promise<void> => {
      try {
        setEmailsLoading(true);
        setEmailsError(undefined);
        const unreadEmails = await graphService.getUnreadEmails(10);
        setEmails(unreadEmails);
      } catch (err) {
        console.error('Error fetching emails:', err);
        setEmailsError('Failed to load emails.');
      } finally {
        setEmailsLoading(false);
      }
    };

    const fetchTasks = async (): Promise<void> => {
      try {
        setTasksLoading(true);
        setTasksError(undefined);
        const myTasks = await graphService.getTasks(10);
        setTasks(myTasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setTasksError('Failed to load tasks.');
      } finally {
        setTasksLoading(false);
      }
    };

    const fetchFiles = async (): Promise<void> => {
      try {
        setFilesLoading(true);
        setFilesError(undefined);
        const recentFiles = await graphService.getRecentFiles(10);
        setFiles(recentFiles);
      } catch (err) {
        console.error('Error fetching files:', err);
        setFilesError('Failed to load files.');
      } finally {
        setFilesLoading(false);
      }
    };

    const fetchWeekEvents = async (): Promise<void> => {
      try {
        setWeekEventsLoading(true);
        setWeekEventsError(undefined);
        const upcomingEvents = await graphService.getUpcomingWeekEvents();
        setWeekEvents(upcomingEvents);
      } catch (err) {
        console.error('Error fetching week events:', err);
        setWeekEventsError('Failed to load upcoming events.');
      } finally {
        setWeekEventsLoading(false);
      }
    };

    const fetchFlaggedEmails = async (): Promise<void> => {
      try {
        setFlaggedEmailsLoading(true);
        setFlaggedEmailsError(undefined);
        const flagged = await graphService.getFlaggedEmails(10);
        setFlaggedEmails(flagged);
      } catch (err) {
        console.error('Error fetching flagged emails:', err);
        setFlaggedEmailsError('Failed to load flagged emails.');
      } finally {
        setFlaggedEmailsLoading(false);
      }
    };

    const fetchTeamMembers = async (): Promise<void> => {
      try {
        setTeamMembersLoading(true);
        setTeamMembersError(undefined);
        const members = await graphService.getTeamMembers();
        setTeamMembers(members);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setTeamMembersError('Failed to load team members.');
      } finally {
        setTeamMembersLoading(false);
      }
    };

    const fetchSharedFiles = async (): Promise<void> => {
      try {
        setSharedFilesLoading(true);
        setSharedFilesError(undefined);
        const shared = await graphService.getSharedWithMe(10);
        setSharedFiles(shared);
      } catch (err) {
        console.error('Error fetching shared files:', err);
        setSharedFilesError('Failed to load shared files.');
      } finally {
        setSharedFilesLoading(false);
      }
    };

    const fetchSiteActivity = async (): Promise<void> => {
      try {
        setSiteActivityLoading(true);
        setSiteActivityError(undefined);
        const activity = await graphService.getSiteActivity();
        setSiteActivity(activity);
      } catch (err) {
        console.error('Error fetching site activity:', err);
        setSiteActivityError('Failed to load site activity.');
      } finally {
        setSiteActivityLoading(false);
      }
    };

    // Fetch all data
    fetchEvents().catch(console.error);
    fetchEmails().catch(console.error);
    fetchTasks().catch(console.error);
    fetchFiles().catch(console.error);
    fetchWeekEvents().catch(console.error);
    fetchFlaggedEmails().catch(console.error);
    fetchTeamMembers().catch(console.error);
    fetchSharedFiles().catch(console.error);
    fetchSiteActivity().catch(console.error);
  }, [context]);

  // Wait for theme to be ready
  if (!currentTheme) {
    return (
      <div className={styles.dashboard}>
        <Spinner label="Loading..." />
      </div>
    );
  }

  // Get card size class
  const getCardSizeClass = (cardId: string): string => {
    const size = CARD_SIZES[cardId] || 'medium';
    switch (size) {
      case 'large':
        return styles.cardLarge;
      case 'medium':
      default:
        return styles.cardMedium;
    }
  };

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
        return <TodaysAgendaCardLarge events={events} loading={eventsLoading} error={eventsError} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'unreadInbox':
        return <UnreadInboxCardLarge emails={emails} loading={emailsLoading} error={emailsError} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'upcomingWeek':
        return <UpcomingWeekCardLarge events={weekEvents} loading={weekEventsLoading} error={weekEventsError} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'flaggedEmails':
        return <FlaggedEmailsCardLarge emails={flaggedEmails} loading={flaggedEmailsLoading} error={flaggedEmailsError} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      // Medium cards (standard list)
      case 'myTasks':
        return <MyTasksCard tasks={tasks} loading={tasksLoading} error={tasksError} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'recentFiles':
        return <RecentFilesCard files={files} loading={filesLoading} error={filesError} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'myTeam':
        return <MyTeamCard members={teamMembers} loading={teamMembersLoading} error={teamMembersError} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'sharedWithMe':
        return <SharedWithMeCard files={sharedFiles} loading={sharedFilesLoading} error={sharedFilesError} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      case 'quickLinks':
        return <QuickLinksCard links={quickLinks} title={cardTitle} />;
      case 'siteActivity':
        return <SiteActivityCard activities={siteActivity} loading={siteActivityLoading} error={siteActivityError} onAction={handleItemAction} theme={currentTheme} title={cardTitle} />;
      default:
        return null;
    }
  };

  // Render a card wrapped with its size class
  const renderCard = (cardId: string): React.ReactNode => {
    if (!isCardVisible(cardId)) return null;

    return (
      <div key={cardId} className={getCardSizeClass(cardId)}>
        {renderCardElement(cardId)}
      </div>
    );
  };

  // Get cards grouped by category in the correct order
  const getOrderedCards = (): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    const hasCategoryConfig = categoryOrder.length > 0 && Object.keys(cardCategoryAssignment).length > 0;

    if (!hasCategoryConfig) {
      // No category config - render cards in simple order
      cardOrder.forEach(cardId => {
        const card = renderCard(cardId);
        if (card) result.push(card);
      });
      return result;
    }

    // Render cards grouped by category
    categoryOrder.forEach(categoryId => {
      const catConfig = categoryConfig[categoryId];

      // Skip hidden categories
      if (catConfig && !catConfig.visible) return;

      // Get cards in this category (maintaining card order)
      const cardsInCategory = cardOrder.filter(
        cardId => cardCategoryAssignment[cardId] === categoryId && isCardVisible(cardId)
      );

      if (cardsInCategory.length === 0) return;

      // Render category header if showTitle is true
      if (catConfig?.showTitle !== false) {
        const categoryName = categoryNames[categoryId] || categoryId;
        result.push(
          <div key={`category-header-${categoryId}`} className={styles.categoryHeader}>
            <span className={styles.categoryTitle}>{categoryName}</span>
          </div>
        );
      }

      // Render cards in this category
      cardsInCategory.forEach(cardId => {
        const card = renderCard(cardId);
        if (card) result.push(card);
      });
    });

    return result;
  };

  return (
    <RendererProvider renderer={renderer}>
      <FluentProvider theme={currentTheme}>
        <div className={styles.dashboard} ref={portalMountRef}>
          <Salutation type={salutationType} size={salutationSize} userName={userName} />
          <div className={styles.cardGrid}>
            {getOrderedCards()}
          </div>
        </div>
      </FluentProvider>
    </RendererProvider>
  );
};

export default DashboardCards;
