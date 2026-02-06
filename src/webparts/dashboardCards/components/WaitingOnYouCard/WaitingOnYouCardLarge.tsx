// ============================================
// WaitingOnYouCardLarge - Large card variant
// Full content view with master-detail layout
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Button,
  Tooltip,
  Avatar,
  TabList,
  Tab,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItemRadio,
  MenuItemCheckbox,
  MenuItem,
  MenuGroup,
  MenuGroupHeader,
  MenuDivider,
} from '@fluentui/react-components';
import {
  PersonClockRegular,
  Clock24Regular,
  Mail24Regular,
  Chat24Regular,
  ChannelShare24Regular,
  Open20Regular,
  ContractDownLeft20Regular,
  ClockAlarm20Regular,
  ClockAlarm20Filled,
  CheckmarkCircle24Regular,
  PeopleRegular,
  PeopleTeamRegular,
  ListRegular,
  ArrowClockwiseRegular,
  Dismiss20Regular,
  ArrowSort20Regular,
  Filter20Regular,
  Crown20Filled,
  ChevronDown20Regular,
  ChevronRight20Regular,
  QuestionCircle20Regular,
  CalendarClock20Regular,
  Mention20Regular,
} from '@fluentui/react-icons';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import {
  StaleConversation,
  PersonGroup,
  TeamGroup,
  GroupedWaitingData,
  WaitingDebtTrend,
  ViewMode,
} from '../../models/WaitingOnYou';
import { useWaitingOnYou } from '../../hooks/useWaitingOnYou';
import { useSnooze } from '../../hooks/useSnooze';
import { SnoozeDialog } from './components/SnoozeDialog';
import { WaitingDebtChart } from './components/WaitingDebtChart';
import { DataMode } from '../../services/testData';
import { getTestWaitingOnYouData, getTestWaitingOnYouTrend } from '../../services/testData/waitingOnYou';
// AI Demo Mode imports
import { AIInsightBanner, AIInsightsPanel } from '../shared/AIComponents';
import { getAIWaitingOnYouCardSummary, getAllWaitingOnYouInsights } from '../../services/testData/aiDemoData';

export interface WaitingOnYouCardLargeProps {
  graphClient: MSGraphClientV3 | null;
  showChart?: boolean;
  staleDays?: number;
  includeEmail?: boolean;
  includeTeamsChats?: boolean;
  includeChannels?: boolean;
  includeMentions?: boolean;
  dataMode?: DataMode;
  /** AI Demo Mode - show AI-enhanced content (only when dataMode === 'test') */
  aiDemoMode?: boolean;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

const useStyles = makeStyles({
  // Tab section
  tabSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  // Toolbar icons
  tabToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
  },
  // Master item styles - for person group
  personGroupItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  personInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  personNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  personName: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  masterItemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  waitDays: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  overdueText: {
    color: tokens.colorPaletteRedForeground1,
  },
  warningText: {
    color: tokens.colorPaletteYellowForeground1,
  },
  typeIcon: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  // Master item for conversations
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationSubject: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Detail panel styles
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  detailHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.3,
  },
  badgeRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  detailIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
  },
  previewContent: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.5,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    whiteSpace: 'pre-wrap',
  },
  senderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  // Person detail - shows all items for a person
  personDetailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  personDetailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    paddingBottom: tokens.spacingVerticalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  personDetailInfo: {
    flex: 1,
  },
  personDetailNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  personDetailName: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  personDetailEmail: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  conversationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  conversationCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  conversationContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  conversationSubjectDetail: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  conversationMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  conversationActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
  },
  // Snooze info box
  snoozeInfoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  snoozeInfoIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
  },
  snoozeInfoText: {
    flex: 1,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  // Expanded item content
  expandedItemContent: {
    marginTop: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  // Action buttons
  actionButton: {
    minWidth: 'auto',
  },
  iconButton: {
    minWidth: '28px',
    padding: '4px',
  },
  // Empty states
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  // VIP icon (manager crown)
  vipIcon: {
    color: tokens.colorPaletteYellowForeground1,
    fontSize: '16px',
    flexShrink: 0,
  },
  managerIcon: {
    color: tokens.colorPaletteYellowForeground1,
    fontSize: '14px',
    flexShrink: 0,
  },
});

// Type for unified list item
type ListItem = {
  type: 'person';
  data: PersonGroup;
} | {
  type: 'team';
  data: TeamGroup;
} | {
  type: 'conversation';
  data: StaleConversation;
};

// Sort modes
type SortMode = 'urgency' | 'name' | 'oldest' | 'newest';

// Format wait duration
const formatWaitDuration = (hours: number): string => {
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

// Get urgency color based on wait time and urgency score
const getUrgencyColor = (urgencyScore: number): 'danger' | 'warning' | 'informative' => {
  if (urgencyScore >= 8) return 'danger';
  if (urgencyScore >= 5) return 'warning';
  return 'informative';
};

// Get conversation type icon
const getTypeIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'email':
      return <Mail24Regular />;
    case 'teams-chat':
      return <Chat24Regular />;
    case 'teams-channel':
      return <ChannelShare24Regular />;
    default:
      return <Mail24Regular />;
  }
};

// Format date for detail panel
const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format snooze until date
const formatSnoozeDate = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `in ${diffDays} days`;

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Sort person groups
const sortPersonGroups = (groups: PersonGroup[], sortMode: SortMode): PersonGroup[] => {
  return [...groups].sort((a, b) => {
    switch (sortMode) {
      case 'name':
        return a.person.displayName.localeCompare(b.person.displayName);
      case 'oldest':
        return b.totalWaitHours - a.totalWaitHours;
      case 'newest':
        return a.totalWaitHours - b.totalWaitHours;
      case 'urgency':
      default:
        return b.maxUrgency - a.maxUrgency;
    }
  });
};

// Sort conversations
const sortConversations = (items: StaleConversation[], sortMode: SortMode): StaleConversation[] => {
  return [...items].sort((a, b) => {
    switch (sortMode) {
      case 'name':
        return a.sender.displayName.localeCompare(b.sender.displayName);
      case 'oldest':
        return b.staleDuration - a.staleDuration;
      case 'newest':
        return a.staleDuration - b.staleDuration;
      case 'urgency':
      default:
        return b.urgencyScore - a.urgencyScore;
    }
  });
};

// Sort label mapping
const sortLabels: Record<SortMode, string> = {
  urgency: 'Urgency',
  name: 'Name',
  oldest: 'Oldest first',
  newest: 'Newest first',
};

export const WaitingOnYouCardLarge: React.FC<WaitingOnYouCardLargeProps> = ({
  graphClient,
  showChart = true,
  staleDays = 2,
  includeEmail = true,
  includeTeamsChats = true,
  includeChannels = false,
  includeMentions = true,
  dataMode = 'api',
  aiDemoMode = false,
  onToggleSize,
}) => {
  const styles = useStyles();
  const [viewMode, setViewMode] = React.useState<ViewMode>('people');
  const [sortMode, setSortMode] = React.useState<SortMode>('urgency');
  const [selectedItem, setSelectedItem] = React.useState<ListItem | undefined>(undefined);
  const [checkedSortValues, setCheckedSortValues] = React.useState<Record<string, string[]>>({ sort: ['urgency'] });
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null);
  const [showChartSection] = React.useState(false);

  // Filter state - content-based filtering (matching WaitingOnOthersCardLarge pattern)
  type FilterType = 'vip' | 'question' | 'deadline' | 'mention';
  const [activeFilters, setActiveFilters] = React.useState<Set<FilterType>>(new Set());
  const [checkedFilterValues, setCheckedFilterValues] = React.useState<Record<string, string[]>>({ filter: [] });

  // Test data state
  const [testData, setTestData] = React.useState<GroupedWaitingData | null>(null);
  const [testTrendData, setTestTrendData] = React.useState<WaitingDebtTrend | null>(null);
  const [testLoading, setTestLoading] = React.useState(dataMode === 'test');

  // Load test data
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestWaitingOnYouData());
        setTestTrendData(getTestWaitingOnYouTrend());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook
  const apiHook = useWaitingOnYou({
    graphClient: dataMode === 'api' ? graphClient : null,
    initialFilter: {
      minStaleDuration: staleDays * 24,
      includeEmail,
      includeTeamsChats,
      includeChannelMessages: includeChannels,
      includeMentions,
    }
  });

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const trendData = dataMode === 'test' ? testTrendData : apiHook.trendData;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;

  const dismissConversation = dataMode === 'test' ? () => {} : apiHook.dismissConversation;
  const snoozeConversation = dataMode === 'test' ? () => {} : apiHook.snoozeConversation;
  const unsnoozeConversation = dataMode === 'test' ? () => {} : apiHook.unsnoozeConversation;

  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestWaitingOnYouData());
          setTestTrendData(getTestWaitingOnYouTrend());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Snooze dialog hook
  const {
    isSnoozeDialogOpen,
    targetConversation,
    openSnoozeDialog,
    closeSnoozeDialog
  } = useSnooze();

  // Handle snooze from dialog
  const handleSnooze = (until: Date, reason?: string) => {
    if (targetConversation) {
      snoozeConversation(targetConversation.id, until, reason);
      closeSnoozeDialog();
    }
  };

  // Handle filter change (matching WaitingOnOthersCardLarge pattern)
  const handleFilterChange = React.useCallback((filters: string[]) => {
    setActiveFilters(new Set(filters as FilterType[]));
    setCheckedFilterValues({ filter: filters });
  }, []);

  // Filter conversations based on filter state - OR logic (any match passes)
  const filterConversation = React.useCallback((conv: StaleConversation): boolean => {
    // If no filters are active, show all items
    if (activeFilters.size === 0) return true;

    // OR logic: show if any filter matches
    if (activeFilters.has('vip') && conv.sender.relationship === 'manager') return true;
    if (activeFilters.has('question') && conv.isQuestion) return true;
    if (activeFilters.has('deadline') && conv.hasDeadlineMention) return true;
    if (activeFilters.has('mention') && conv.isMention) return true;

    return false;
  }, [activeFilters]);

  // Get list items based on view mode
  const listItems: ListItem[] = React.useMemo(() => {
    if (!data) return [];

    if (viewMode === 'people') {
      // Use byPerson only - it already contains all conversations grouped by person
      // ungroupedByPerson is a subset for non-team conversations, not additional people
      const filteredGroups = data.byPerson
        .map(group => ({
          ...group,
          conversations: group.conversations.filter(filterConversation),
          itemCount: group.conversations.filter(filterConversation).length,
        }))
        .filter(group => group.itemCount > 0);
      return sortPersonGroups(filteredGroups, sortMode).map(group => ({
        type: 'person' as const,
        data: group,
      }));
    } else if (viewMode === 'teams') {
      // For teams view, show team groups as items
      const filteredTeams = data.byTeam
        .map(team => ({
          ...team,
          conversations: team.conversations.filter(filterConversation),
          itemCount: team.conversations.filter(filterConversation).length,
        }))
        .filter(team => team.itemCount > 0);
      return filteredTeams.map(team => ({
        type: 'team' as const,
        data: team,
      }));
    } else {
      // List view - show all conversations
      const filteredConversations = data.allConversations.filter(filterConversation);
      return sortConversations(filteredConversations, sortMode).map(conv => ({
        type: 'conversation' as const,
        data: conv,
      }));
    }
  }, [data, viewMode, sortMode, filterConversation]);

  // Reset selection when view mode changes
  React.useEffect(() => {
    if (listItems.length > 0) {
      setSelectedItem(listItems[0]);
    } else {
      setSelectedItem(undefined);
    }
  }, [viewMode, listItems.length]);

  // Handle sort change
  const handleSortChange = React.useCallback((newSort: SortMode) => {
    setSortMode(newSort);
    setCheckedSortValues({ sort: [newSort] });
  }, []);

  // Get item key
  const getItemKey = (item: ListItem): string => {
    if (item.type === 'person') {
      return `person-${item.data.person.id || item.data.person.email}`;
    } else if (item.type === 'team') {
      return `team-${item.data.team.id}`;
    }
    return `conv-${item.data.id}`;
  };

  // Render master item
  const renderMasterItem = (item: ListItem, _isSelected: boolean): React.ReactNode => {
    if (item.type === 'person') {
      const group = item.data;
      const isHighUrgency = group.maxUrgency >= 8;
      const isMediumUrgency = group.maxUrgency >= 5 && !isHighUrgency;
      const isManager = group.person.relationship === 'manager';

      return (
        <div className={styles.personGroupItem}>
          <Avatar
            name={group.person.displayName}
            image={group.person.photoUrl ? { src: group.person.photoUrl } : undefined}
            size={32}
          />
          <div className={styles.personInfo}>
            <div className={styles.personNameRow}>
              <Text className={styles.personName}>{group.person.displayName}</Text>
            </div>
            <div className={styles.itemMeta}>
              <span className={`${styles.waitDays} ${isHighUrgency ? styles.overdueText : isMediumUrgency ? styles.warningText : ''}`}>
                {formatWaitDuration(group.totalWaitHours)} waiting
              </span>
            </div>
          </div>
          <div className={styles.masterItemRight}>
            {isManager && (
              <Tooltip content="Your manager" relationship="label">
                <Crown20Filled className={styles.vipIcon} />
              </Tooltip>
            )}
            <Badge
              appearance="tint"
              color={isHighUrgency ? 'danger' : isMediumUrgency ? 'warning' : 'brand'}
              size="small"
            >
              {group.itemCount}
            </Badge>
          </div>
        </div>
      );
    } else if (item.type === 'team') {
      const team = item.data;
      return (
        <div className={styles.personGroupItem}>
          <Avatar
            name={team.team.displayName}
            image={team.team.photoUrl ? { src: team.team.photoUrl } : undefined}
            size={32}
          />
          <div className={styles.personInfo}>
            <Text className={styles.personName}>{team.team.displayName}</Text>
            <div className={styles.itemMeta}>
              <span>{team.itemCount} items</span>
            </div>
          </div>
        </div>
      );
    } else {
      const conv = item.data;
      const isHighUrgency = conv.urgencyScore >= 8;
      const isMediumUrgency = conv.urgencyScore >= 5 && !isHighUrgency;
      const isSnoozed = !!conv.snoozedUntil;

      return (
        <div className={styles.conversationItem}>
          <Avatar
            name={conv.sender.displayName}
            image={conv.sender.photoUrl ? { src: conv.sender.photoUrl } : undefined}
            size={32}
          />
          <div className={styles.conversationInfo}>
            <Text className={styles.conversationSubject}>{conv.subject}</Text>
            <div className={styles.itemMeta}>
              <span>{conv.sender.displayName}</span>
              {isSnoozed ? (
                <span>
                  <ClockAlarm20Filled style={{ fontSize: '12px' }} />
                  Until {formatSnoozeDate(conv.snoozedUntil!)}
                </span>
              ) : (
                <span className={`${styles.waitDays} ${isHighUrgency ? styles.overdueText : isMediumUrgency ? styles.warningText : ''}`}>
                  {formatWaitDuration(conv.staleDuration)}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  // Render person detail
  const renderPersonDetail = (group: PersonGroup): React.ReactNode => {
    const isManager = group.person.relationship === 'manager';

    return (
      <div className={styles.personDetailContainer}>
        <div className={styles.personDetailHeader}>
          <Avatar
            name={group.person.displayName}
            image={group.person.photoUrl ? { src: group.person.photoUrl } : undefined}
            size={48}
          />
          <div className={styles.personDetailInfo}>
            <div className={styles.personDetailNameRow}>
              <Text className={styles.personDetailName}>{group.person.displayName}</Text>
              {isManager && (
                <Tooltip content="Your manager" relationship="label">
                  <Crown20Filled className={styles.managerIcon} />
                </Tooltip>
              )}
            </div>
            <Text className={styles.personDetailEmail}>{group.person.email}</Text>
          </div>
          <Badge
            appearance="filled"
            color={getUrgencyColor(group.maxUrgency)}
          >
            {group.itemCount} item{group.itemCount > 1 ? 's' : ''} waiting
          </Badge>
        </div>

        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Conversations Waiting</Text>
          <div className={styles.conversationsList}>
            {sortConversations(group.conversations, 'urgency').map(conv => {
              const isExpanded = expandedItemId === conv.id;
              return (
                <div key={conv.id}>
                  <div className={styles.conversationCard}>
                    <div className={styles.conversationContent}>
                      <Text className={styles.conversationSubjectDetail}>{conv.subject}</Text>
                      <div className={styles.conversationMeta}>
                        {getTypeIcon(conv.conversationType)}
                        <span>{formatWaitDuration(conv.staleDuration)} ago</span>
                        {conv.isQuestion && (
                          <Tooltip content="Contains a question" relationship="label">
                            <Badge size="small" appearance="tint" color="informative" icon={<QuestionCircle20Regular />} />
                          </Tooltip>
                        )}
                        {conv.hasDeadlineMention && (
                          <Tooltip content="Mentions a deadline" relationship="label">
                            <Badge size="small" appearance="tint" color="warning" icon={<CalendarClock20Regular />} />
                          </Tooltip>
                        )}
                        {conv.isMention && (
                          <Tooltip content="You were @mentioned" relationship="label">
                            <Badge size="small" appearance="tint" color="brand" icon={<Mention20Regular />} />
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className={styles.conversationActions}>
                      <Tooltip content={isExpanded ? "Collapse" : "Show details"} relationship="label">
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={isExpanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
                          className={styles.iconButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedItemId(isExpanded ? null : conv.id);
                          }}
                        />
                      </Tooltip>
                      <Tooltip content="Open" relationship="label">
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<Open20Regular />}
                          className={styles.iconButton}
                          onClick={() => window.open(conv.webUrl, '_blank', 'noopener,noreferrer')}
                        />
                      </Tooltip>
                      <Tooltip content="Snooze" relationship="label">
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<ClockAlarm20Regular />}
                          className={styles.iconButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            openSnoozeDialog(conv);
                          }}
                        />
                      </Tooltip>
                      <Tooltip content="Dismiss" relationship="label">
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<Dismiss20Regular />}
                          className={styles.iconButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissConversation(conv.id);
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className={styles.expandedItemContent}>
                      <div className={styles.badgeRow}>
                        <Badge color={getUrgencyColor(conv.urgencyScore)} appearance="filled">
                          Urgency: {conv.urgencyScore}/10
                        </Badge>
                        {conv.isQuestion && (
                          <Tooltip content="Contains a question" relationship="label">
                            <Badge color="informative" appearance="tint" icon={<QuestionCircle20Regular />} />
                          </Tooltip>
                        )}
                        {conv.hasDeadlineMention && (
                          <Tooltip content="Mentions a deadline" relationship="label">
                            <Badge color="warning" appearance="tint" icon={<CalendarClock20Regular />} />
                          </Tooltip>
                        )}
                        {conv.isMention && (
                          <Tooltip content="You were @mentioned" relationship="label">
                            <Badge color="brand" appearance="tint" icon={<Mention20Regular />} />
                          </Tooltip>
                        )}
                      </div>
                      <div className={styles.detailRow}>
                        {getTypeIcon(conv.conversationType)}
                        <span style={{ textTransform: 'capitalize' }}>
                          {conv.conversationType.replace('-', ' ')}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <Clock24Regular className={styles.detailIcon} />
                        <span>Received: {formatDateFull(conv.receivedDateTime)}</span>
                      </div>
                      <div className={styles.previewContent}>
                        {conv.preview || 'No preview available'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render conversation detail
  const renderConversationDetail = (conv: StaleConversation): React.ReactNode => {
    const isSnoozed = !!conv.snoozedUntil;
    const isManager = conv.sender.relationship === 'manager';

    return (
      <div className={styles.detailContainer}>
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{conv.subject}</Text>
          <div className={styles.badgeRow}>
            {isSnoozed ? (
              <Badge color="informative" appearance="filled" icon={<ClockAlarm20Filled />}>
                Snoozed until {formatSnoozeDate(conv.snoozedUntil!)}
              </Badge>
            ) : (
              <Badge color={getUrgencyColor(conv.urgencyScore)} appearance="filled">
                Urgency: {conv.urgencyScore}/10
              </Badge>
            )}
            {conv.isQuestion && (
              <Tooltip content="Contains a question" relationship="label">
                <Badge color="informative" appearance="tint" icon={<QuestionCircle20Regular />} />
              </Tooltip>
            )}
            {conv.hasDeadlineMention && (
              <Tooltip content="Mentions a deadline" relationship="label">
                <Badge color="warning" appearance="tint" icon={<CalendarClock20Regular />} />
              </Tooltip>
            )}
            {conv.isMention && (
              <Tooltip content="You were @mentioned" relationship="label">
                <Badge color="brand" appearance="tint" icon={<Mention20Regular />} />
              </Tooltip>
            )}
          </div>
        </div>

        {isSnoozed && (
          <div className={styles.snoozeInfoBox}>
            <ClockAlarm20Filled className={styles.snoozeInfoIcon} />
            <Text className={styles.snoozeInfoText}>
              Snoozed until <strong>{conv.snoozedUntil!.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
            </Text>
          </div>
        )}

        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>From</Text>
          <div className={styles.senderInfo}>
            <Avatar
              name={conv.sender.displayName}
              image={conv.sender.photoUrl ? { src: conv.sender.photoUrl } : undefined}
              size={40}
            />
            <div>
              <div className={styles.personDetailNameRow}>
                <Text weight="semibold">{conv.sender.displayName}</Text>
                {isManager && <Crown20Filled className={styles.managerIcon} />}
              </div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>
                {conv.sender.email}
              </Text>
            </div>
          </div>
        </div>

        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Details</Text>
          <div className={styles.detailRow}>
            {getTypeIcon(conv.conversationType)}
            <span style={{ textTransform: 'capitalize' }}>
              {conv.conversationType.replace('-', ' ')}
            </span>
          </div>
          <div className={styles.detailRow}>
            <Clock24Regular className={styles.detailIcon} />
            <span>Received: {formatDateFull(conv.receivedDateTime)}</span>
          </div>
        </div>

        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Preview</Text>
          <div className={styles.previewContent}>
            {conv.preview || 'No preview available'}
          </div>
        </div>
      </div>
    );
  };

  // Render team detail
  const renderTeamDetail = (team: TeamGroup): React.ReactNode => {
    return (
      <div className={styles.personDetailContainer}>
        <div className={styles.personDetailHeader}>
          <Avatar
            name={team.team.displayName}
            image={team.team.photoUrl ? { src: team.team.photoUrl } : undefined}
            size={48}
          />
          <div className={styles.personDetailInfo}>
            <Text className={styles.personDetailName}>{team.team.displayName}</Text>
            <Text className={styles.personDetailEmail}>{team.people.length} people</Text>
          </div>
          <Badge
            appearance="filled"
            color={getUrgencyColor(team.maxUrgency)}
          >
            {team.itemCount} item{team.itemCount > 1 ? 's' : ''} waiting
          </Badge>
        </div>

        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Conversations</Text>
          <div className={styles.conversationsList}>
            {sortConversations(team.conversations, 'urgency').map(conv => (
              <div key={conv.id} className={styles.conversationCard}>
                <div className={styles.conversationContent}>
                  <Text className={styles.conversationSubjectDetail}>{conv.subject}</Text>
                  <div className={styles.conversationMeta}>
                    {getTypeIcon(conv.conversationType)}
                    <span>{conv.sender.displayName}</span>
                    <span>{formatWaitDuration(conv.staleDuration)} ago</span>
                  </div>
                </div>
                <div className={styles.conversationActions}>
                  <Tooltip content="Open" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Open20Regular />}
                      className={styles.iconButton}
                      onClick={() => window.open(conv.webUrl, '_blank', 'noopener,noreferrer')}
                    />
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (item: ListItem): React.ReactNode => {
    if (item.type === 'person') {
      return renderPersonDetail(item.data);
    } else if (item.type === 'team') {
      return renderTeamDetail(item.data);
    }
    return renderConversationDetail(item.data);
  };

  // Render detail actions
  const renderDetailActions = (item: ListItem): React.ReactNode => {
    if (item.type === 'person') {
      const group = item.data;
      const mostUrgent = sortConversations(group.conversations, 'urgency')[0];

      return (
        <>
          <Tooltip content="Open most urgent" relationship="label">
            <Button
              appearance="primary"
              icon={<Open20Regular />}
              className={styles.actionButton}
              onClick={() => window.open(mostUrgent.webUrl, '_blank', 'noopener,noreferrer')}
            />
          </Tooltip>
          <Tooltip content="Snooze all" relationship="label">
            <Button
              appearance="secondary"
              icon={<ClockAlarm20Regular />}
              className={styles.actionButton}
              onClick={() => openSnoozeDialog(mostUrgent)}
            />
          </Tooltip>
        </>
      );
    } else if (item.type === 'team') {
      const team = item.data;
      return (
        <Tooltip content="Open team" relationship="label">
          <Button
            appearance="primary"
            icon={<Open20Regular />}
            className={styles.actionButton}
            onClick={() => window.open(team.team.webUrl, '_blank', 'noopener,noreferrer')}
          />
        </Tooltip>
      );
    }

    const conv = item.data;
    const isSnoozed = !!conv.snoozedUntil;

    return (
      <>
        <Tooltip content="Open" relationship="label">
          <Button
            appearance="primary"
            icon={<Open20Regular />}
            className={styles.actionButton}
            onClick={() => window.open(conv.webUrl, '_blank', 'noopener,noreferrer')}
          />
        </Tooltip>
        {isSnoozed ? (
          <Tooltip content="Unsnooze" relationship="label">
            <Button
              appearance="secondary"
              icon={<ClockAlarm20Filled />}
              className={styles.actionButton}
              onClick={() => unsnoozeConversation(conv.id)}
            />
          </Tooltip>
        ) : (
          <Tooltip content="Snooze" relationship="label">
            <Button
              appearance="secondary"
              icon={<ClockAlarm20Regular />}
              className={styles.actionButton}
              onClick={() => openSnoozeDialog(conv)}
            />
          </Tooltip>
        )}
        <Tooltip content="Dismiss" relationship="label">
          <Button
            appearance="secondary"
            icon={<Dismiss20Regular />}
            className={styles.actionButton}
            onClick={() => dismissConversation(conv.id)}
          />
        </Tooltip>
      </>
    );
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <PersonClockRegular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select an item to view details</Text>
        {aiDemoMode && (
          <AIInsightsPanel
            insights={getAllWaitingOnYouInsights()}
            maxItems={3}
          />
        )}
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <CheckmarkCircle24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>You're all caught up!</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          No one is waiting on you
        </Text>
      </>
    );
  };

  return (
    <>
      <MasterDetailCard
        items={listItems}
        selectedItem={selectedItem}
        onItemSelect={setSelectedItem}
        getItemKey={getItemKey}
        renderMasterItem={renderMasterItem}
        renderDetailContent={renderDetailContent}
        renderDetailActions={renderDetailActions}
        renderEmptyDetail={renderEmptyDetail}
        renderEmptyState={renderEmptyState}
        icon={<PersonClockRegular />}
        title="Waiting On You"
        itemCount={data?.totalItems ?? 0}
        loading={isLoading}
        error={error?.message}
        emptyMessage="You're all caught up!"
        emptyIcon={<CheckmarkCircle24Regular />}
        headerActions={
          <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
            <Tooltip content="Refresh" relationship="label">
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowClockwiseRegular />}
                onClick={refresh}
              />
            </Tooltip>
            {onToggleSize && (
              <Tooltip content="Collapse to summary view" relationship="label">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<ContractDownLeft20Regular />}
                  onClick={onToggleSize}
                  aria-label="Collapse card"
                />
              </Tooltip>
            )}
          </div>
        }
        headerContent={
          <>
            {/* AI Insight Banner (AI Demo Mode only) */}
            {aiDemoMode && (
              <div style={{ padding: `0 ${tokens.spacingHorizontalM}`, marginBottom: tokens.spacingVerticalS }}>
                <AIInsightBanner
                  summary={getAIWaitingOnYouCardSummary()}
                  insights={getAllWaitingOnYouInsights()}
                  defaultExpanded={false}
                />
              </div>
            )}
            {/* Chart */}
            {showChart && showChartSection && trendData && (data?.totalItems ?? 0) > 0 && (
              <div style={{ padding: `0 ${tokens.spacingHorizontalM}`, marginBottom: tokens.spacingVerticalS }}>
                <WaitingDebtChart trend={trendData} />
              </div>
            )}
            {/* View Mode Tabs + Sort */}
            {(data?.totalItems ?? 0) > 0 && (
              <div className={styles.tabSection}>
                <TabList
                  selectedValue={viewMode}
                  onTabSelect={(_, d) => setViewMode(d.value as ViewMode)}
                  size="small"
                >
                  <Tab value="people" icon={<PeopleRegular />}>
                    People ({data?.totalPeopleWaiting ?? 0})
                  </Tab>
                  <Tab value="teams" icon={<PeopleTeamRegular />}>
                    Teams ({data?.totalTeamsAffected ?? 0})
                  </Tab>
                  <Tab value="list" icon={<ListRegular />}>
                    All ({data?.totalItems ?? 0})
                  </Tab>
                </TabList>
                <div className={styles.tabToolbar}>
                  {/* Filter Menu - content-based filtering like WaitingOnOthersCardLarge */}
                  <Menu
                    checkedValues={checkedFilterValues}
                    onCheckedValueChange={(_, menuData) => {
                      handleFilterChange(menuData.checkedItems);
                    }}
                  >
                    <MenuTrigger disableButtonEnhancement>
                      <Tooltip content={activeFilters.size > 0 ? `${activeFilters.size} filter(s) active` : 'Filter'} relationship="label">
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<Filter20Regular />}
                          aria-label="Filter options"
                        />
                      </Tooltip>
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuGroup>
                          <MenuGroupHeader>Filter by</MenuGroupHeader>
                          <MenuItemCheckbox name="filter" value="vip">
                            VIP (Manager)
                          </MenuItemCheckbox>
                          <MenuItemCheckbox name="filter" value="question">
                            Question asked
                          </MenuItemCheckbox>
                          <MenuItemCheckbox name="filter" value="deadline">
                            Has deadline
                          </MenuItemCheckbox>
                          <MenuItemCheckbox name="filter" value="mention">
                            @Mentioned
                          </MenuItemCheckbox>
                        </MenuGroup>
                        {activeFilters.size > 0 && (
                          <>
                            <MenuDivider />
                            <MenuItem
                              icon={<Dismiss20Regular />}
                              onClick={() => handleFilterChange([])}
                            >
                              Clear all filters
                            </MenuItem>
                          </>
                        )}
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                  {/* Sort Menu */}
                  <Menu
                    checkedValues={checkedSortValues}
                    onCheckedValueChange={(_, menuData) => {
                      if (menuData.checkedItems.length > 0) {
                        handleSortChange(menuData.checkedItems[0] as SortMode);
                      }
                    }}
                  >
                    <MenuTrigger disableButtonEnhancement>
                      <Tooltip content={`Sort: ${sortLabels[sortMode]}`} relationship="label">
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<ArrowSort20Regular />}
                        />
                      </Tooltip>
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuGroup>
                          <MenuGroupHeader>Sort by</MenuGroupHeader>
                          <MenuItemRadio name="sort" value="urgency">
                            Urgency (highest first)
                          </MenuItemRadio>
                          <MenuItemRadio name="sort" value="name">
                            Name
                          </MenuItemRadio>
                          <MenuItemRadio name="sort" value="oldest">
                            Oldest first
                          </MenuItemRadio>
                          <MenuItemRadio name="sort" value="newest">
                            Newest first
                          </MenuItemRadio>
                        </MenuGroup>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </div>
              </div>
            )}
          </>
        }
      />

      {/* Snooze Dialog */}
      <SnoozeDialog
        open={isSnoozeDialogOpen}
        onOpenChange={closeSnoozeDialog}
        onSnooze={handleSnooze}
        conversationSubject={targetConversation?.subject || ''}
      />
    </>
  );
};

export default WaitingOnYouCardLarge;
