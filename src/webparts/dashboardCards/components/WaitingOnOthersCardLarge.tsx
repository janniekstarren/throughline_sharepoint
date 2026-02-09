// ============================================
// WaitingOnOthersCardLarge - Large card variant
// Full content view with tabs for People/All/Snoozed views
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
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItemRadio,
  MenuItemCheckbox,
  MenuItem,
  MenuDivider,
  MenuGroup,
  MenuGroupHeader,
  Toaster,
  useToastController,
  useId,
  Toast,
  ToastTitle,
  ToastBody,
  ToastFooter,
  Link,
  mergeClasses,
} from '@fluentui/react-components';
import {
  ClockRegular,
  Clock24Regular,
  Mail24Regular,
  Chat24Regular,
  ChannelShare24Regular,
  Send20Regular,
  Open20Regular,
  ClockAlarm20Regular,
  ClockAlarm20Filled,
  CheckmarkCircle24Regular,
  DataTrending20Regular,
  DataTrending20Filled,
  PeopleRegular,
  ListRegular,
  ArrowClockwiseRegular,
  Delete20Regular,
  ArrowSort20Regular,
  Crown20Filled,
  Play20Regular,
  Edit20Regular,
  ChevronDown20Regular,
  ChevronRight20Regular,
  Filter20Regular,
  Dismiss20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { MasterDetailCard } from './shared/MasterDetailCard';
import { CardSizeMenu } from './shared';
import { CardSize } from '../types/CardSize';
import { PendingResponse, GroupedPendingData, PendingTrendData, PersonOwesGroup, ViewMode, SortMode } from '../models/WaitingOnOthers';
import { useWaitingOnOthers, IWaitingOnOthersSettings, DEFAULT_WAITING_ON_OTHERS_SETTINGS } from '../hooks/useWaitingOnOthers';
import { WaitingOnOthersService } from '../services/WaitingOnOthersService';
import { ReminderComposer } from './WaitingOnOthersCard/components/ReminderComposer';
import { WaitingTrendChart } from './WaitingOnOthersCard/components/WaitingTrendChart';
import { SnoozeDialog } from './WaitingOnYouCard/components/SnoozeDialog';
import { DataMode } from '../services/testData';
import { getTestWaitingOnOthersData, getTestWaitingOnOthersTrend } from '../services/testData/waitingOnOthers';
// AI Demo Mode imports
import { AIInsightBanner, AIOnboardingDialog } from './shared/AIComponents';
import { IAICardSummary, IAIInsight } from '../models/AITypes';
import {
  getAIEnhancedWaitingOnOthers,
  getAIWaitingOnOthersCardSummary,
  getAllWaitingOnOthersInsights,
  IAIEnhancedPersonGroup,
} from '../services/testData/aiDemoData';

// Local storage key for AI onboarding state
const AI_ONBOARDING_KEY = 'dashboardCards_aiOnboardingDismissed';

export interface IWaitingOnOthersCardLargeProps {
  context: WebPartContext;
  settings?: IWaitingOnOthersSettings;
  dataMode?: DataMode;
  /** Enable AI Demo Mode (only works with test data) */
  aiDemoMode?: boolean;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
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
  // Right-aligned toolbar icons (sort, filter)
  tabToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
  },
  // Active filter icon color
  filterActive: {
    color: tokens.colorBrandForeground1,
  },
  // Master item styles - for "All" view (individual items)
  masterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  // Master item styles - for "People" view (grouped by person)
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
  vipIcon: {
    color: tokens.colorPaletteYellowForeground1,
    fontSize: '12px',
    flexShrink: 0,
  },
  vipIconMaster: {
    color: tokens.colorPaletteYellowForeground1,
    fontSize: '11px',
    flexShrink: 0,
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
  subjectText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  typeIcon: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  itemCountBadge: {
    // alignment handled by masterItemRight container
  },
  // Snoozed indicator
  snoozedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusSmall,
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
  recipientInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  reminderInfo: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
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
  pendingItemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  pendingItemCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  pendingItemContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  pendingItemSubject: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  pendingItemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  pendingItemActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXXS,
    flexShrink: 0,
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
  // Bulk action warning
  bulkWarning: {
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalS,
  },
  // Expanded item content in People mode
  expandedItemContent: {
    marginTop: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  // Animation for removing items
  '@keyframes fadeOutSlide': {
    '0%': {
      opacity: 1,
      transform: 'translateX(0)',
      maxHeight: '200px',
    },
    '50%': {
      opacity: 0,
      transform: 'translateX(20px)',
      maxHeight: '200px',
    },
    '100%': {
      opacity: 0,
      transform: 'translateX(20px)',
      maxHeight: '0px',
      marginBottom: '0px',
      paddingTop: '0px',
      paddingBottom: '0px',
    },
  },
  itemRemoving: {
    animationName: {
      '0%': {
        opacity: 1,
        transform: 'translateX(0)',
        maxHeight: '200px',
      },
      '50%': {
        opacity: 0,
        transform: 'translateX(20px)',
        maxHeight: '200px',
      },
      '100%': {
        opacity: 0,
        transform: 'translateX(20px)',
        maxHeight: '0px',
        marginBottom: '0px',
        paddingTop: '0px',
        paddingBottom: '0px',
      },
    },
    animationDuration: '300ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
    overflow: 'hidden',
  },
});

// Type for unified list item (either a person group or individual item)
type ListItem = {
  type: 'person';
  data: PersonOwesGroup;
} | {
  type: 'item';
  data: PendingResponse;
};

// Bulk action type
type BulkAction = {
  type: 'snooze' | 'discard';
  items: PendingResponse[];
  personName?: string;
};

// Snooze edit state
type SnoozeEditState = {
  item: PendingResponse;
  mode: 'snooze' | 'edit';
};

// Filter types
type FilterType = 'vip' | 'action' | 'question' | 'deadline';

// Format wait duration
const formatWaitDuration = (hours: number): string => {
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

// Get urgency color based on wait time
const getUrgencyColor = (hours: number): 'danger' | 'warning' | 'informative' => {
  const days = hours / 24;
  if (days >= 7) return 'danger';
  if (days >= 3) return 'warning';
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

// Sort pending responses based on sort mode
const sortResponses = (items: PendingResponse[], sortMode: SortMode): PendingResponse[] => {
  return [...items].sort((a, b) => {
    switch (sortMode) {
      case 'name':
        return a.recipient.displayName.localeCompare(b.recipient.displayName);
      case 'oldest':
        return b.waitingDuration - a.waitingDuration;
      case 'newest':
        return a.waitingDuration - b.waitingDuration;
      case 'priority':
      default:
        // Priority: VIP first, then by wait time
        if (a.recipient.isVip && !b.recipient.isVip) return -1;
        if (!a.recipient.isVip && b.recipient.isVip) return 1;
        return b.waitingDuration - a.waitingDuration;
    }
  });
};

// Sort person groups based on sort mode
const sortPersonGroups = (groups: PersonOwesGroup[], sortMode: SortMode): PersonOwesGroup[] => {
  return [...groups].sort((a, b) => {
    switch (sortMode) {
      case 'name':
        return a.person.displayName.localeCompare(b.person.displayName);
      case 'oldest':
        return b.longestWaitHours - a.longestWaitHours;
      case 'newest':
        return a.longestWaitHours - b.longestWaitHours;
      case 'priority':
      default:
        // Priority: VIP first, then by wait time
        if (a.person.isVip && !b.person.isVip) return -1;
        if (!a.person.isVip && b.person.isVip) return 1;
        return b.longestWaitHours - a.longestWaitHours;
    }
  });
};

// Sort label mapping
const sortLabels: Record<SortMode, string> = {
  priority: 'Priority',
  name: 'Name',
  oldest: 'Oldest first',
  newest: 'Newest first',
};

// Type for pending discard (for undo functionality)
type PendingDiscard = {
  item: PendingResponse;
  timeoutId: ReturnType<typeof setTimeout>;
  toastId?: string;
};

export const WaitingOnOthersCardLarge: React.FC<IWaitingOnOthersCardLargeProps> = ({
  context,
  settings = DEFAULT_WAITING_ON_OTHERS_SETTINGS,
  dataMode = 'api',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [viewMode, setViewMode] = React.useState<ViewMode>('people');
  const [sortMode, setSortMode] = React.useState<SortMode>('priority');
  const [selectedItem, setSelectedItem] = React.useState<ListItem | undefined>(undefined);
  const [reminderTarget, setReminderTarget] = React.useState<PendingResponse | null>(null);
  const [snoozeEditState, setSnoozeEditState] = React.useState<SnoozeEditState | null>(null);
  const [showChart, setShowChart] = React.useState(false);
  const [bulkAction, setBulkAction] = React.useState<BulkAction | null>(null);
  const [checkedSortValues, setCheckedSortValues] = React.useState<Record<string, string[]>>({ sort: ['priority'] });
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null);
  const [activeFilters, setActiveFilters] = React.useState<Set<FilterType>>(new Set());
  const [checkedFilterValues, setCheckedFilterValues] = React.useState<Record<string, string[]>>({ filter: [] });

  // AI Demo Mode state
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_aiEnhancedGroups, setAiEnhancedGroups] = React.useState<IAIEnhancedPersonGroup[]>([]);
  const [aiCardSummary, setAiCardSummary] = React.useState<IAICardSummary | undefined>(undefined);
  const [aiInsights, setAiInsights] = React.useState<IAIInsight[]>([]);

  // Handle AI onboarding close
  const handleOnboardingClose = React.useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Handle "Don't show again"
  const handleDontShowAgain = React.useCallback((checked: boolean) => {
    if (checked) {
      localStorage.setItem(AI_ONBOARDING_KEY, 'true');
    }
  }, []);

  // Toast controller for notifications
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  // Track pending discards for undo functionality
  const pendingDiscardsRef = React.useRef<Map<string, PendingDiscard>>(new Map());

  // Track items being animated out (for fade-out effect)
  const [removingItemIds, setRemovingItemIds] = React.useState<Set<string>>(new Set());

  // Test data state
  const [testData, setTestData] = React.useState<GroupedPendingData | null>(null);
  const [testTrendData, setTestTrendData] = React.useState<PendingTrendData | null>(null);
  const [testLoading, setTestLoading] = React.useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestWaitingOnOthersData());
        setTestTrendData(getTestWaitingOnOthersTrend());
        // Load AI demo data if enabled
        if (aiDemoMode) {
          setAiEnhancedGroups(getAIEnhancedWaitingOnOthers());
          setAiCardSummary(getAIWaitingOnOthersCardSummary());
          setAiInsights(getAllWaitingOnOthersInsights());
        }
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode, aiDemoMode]);

  // API hook
  const apiHook = useWaitingOnOthers(context, settings);

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const trendData = dataMode === 'test' ? testTrendData : apiHook.trendData;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  // Note: snoozeItem and unsnoozeItem are handled directly in handlers via snoozeItemInTestData/unsnoozeItemInTestData
  const resolveItem = dataMode === 'test' ? () => {} : apiHook.resolveItem;
  const recordReminderSent = dataMode === 'test' ? () => {} : apiHook.recordReminderSent;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestWaitingOnOthersData());
          setTestTrendData(getTestWaitingOnOthersTrend());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Get items based on view mode, sort, and filters
  const listItems: ListItem[] = React.useMemo(() => {
    if (!data) return [];

    // Helper to check if item passes filters (OR logic - match any selected filter)
    const passesFilters = (item: PendingResponse): boolean => {
      if (activeFilters.size === 0) return true;

      if (activeFilters.has('vip') && item.recipient.isVip) return true;
      if (activeFilters.has('action') && item.requestedAction) return true;
      if (activeFilters.has('question') && item.wasQuestion) return true;
      if (activeFilters.has('deadline') && item.mentionedDeadline) return true;

      return false;
    };

    if (viewMode === 'people') {
      // Filter groups based on whether any of their items pass the filter
      const filteredGroups = data.byPerson
        .map(group => ({
          ...group,
          pendingItems: activeFilters.size > 0
            ? group.pendingItems.filter(passesFilters)
            : group.pendingItems,
        }))
        .filter(group => group.pendingItems.length > 0);

      return sortPersonGroups(filteredGroups, sortMode).map(group => ({
        type: 'person' as const,
        data: { ...group, itemCount: group.pendingItems.length },
      }));
    } else if (viewMode === 'snoozed') {
      // Show snoozed items
      const snoozedItems = data.snoozedItems || [];
      const filtered = activeFilters.size > 0 ? snoozedItems.filter(passesFilters) : snoozedItems;
      return sortResponses(filtered, sortMode).map(item => ({
        type: 'item' as const,
        data: item,
      }));
    } else {
      const filtered = activeFilters.size > 0 ? data.allPendingItems.filter(passesFilters) : data.allPendingItems;
      return sortResponses(filtered, sortMode).map(item => ({
        type: 'item' as const,
        data: item,
      }));
    }
  }, [data, viewMode, sortMode, activeFilters]);

  // Reset selection when view mode changes
  React.useEffect(() => {
    if (listItems.length > 0) {
      setSelectedItem(listItems[0]);
    } else {
      setSelectedItem(undefined);
    }
  }, [viewMode, listItems.length]);

  // Compute the current selected item from the current data
  // This ensures the detail panel always shows up-to-date data
  const currentSelectedItem = React.useMemo((): ListItem | undefined => {
    if (!selectedItem || !data) return undefined;

    if (selectedItem.type === 'person') {
      // Find the current person group from fresh data
      const currentGroup = data.byPerson.find(
        g => g.person.id === selectedItem.data.person.id
      );
      if (currentGroup) {
        return { type: 'person', data: currentGroup };
      }
      // Person no longer exists (all items discarded), clear selection
      return listItems.length > 0 ? listItems[0] : undefined;
    } else {
      // Find the current item from fresh data
      const allItems = [
        ...data.allPendingItems,
        ...(data.snoozedItems || []),
      ];
      const currentItem = allItems.find(i => i.id === selectedItem.data.id);
      if (currentItem) {
        return { type: 'item', data: currentItem };
      }
      // Item no longer exists, clear selection
      return listItems.length > 0 ? listItems[0] : undefined;
    }
  }, [selectedItem, data, listItems]);

  // Handler for selecting an item
  const handleSelectItem = React.useCallback((item: ListItem): void => {
    setSelectedItem(item);
  }, []);

  // Handle sort change
  const handleSortChange = React.useCallback((newSort: SortMode) => {
    setSortMode(newSort);
    setCheckedSortValues({ sort: [newSort] });
  }, []);

  // Handle filter change
  const handleFilterChange = React.useCallback((filters: string[]) => {
    setActiveFilters(new Set(filters as FilterType[]));
    setCheckedFilterValues({ filter: filters });
  }, []);

  // Handle sending reminder
  const handleSendReminder = React.useCallback(async (subject: string, body: string, template: string) => {
    if (!reminderTarget) return false;

    try {
      const graphClient = await context.msGraphClientFactory.getClient('3');
      const userResponse = await graphClient.api('/me').select('id,mail').get();

      const service = new WaitingOnOthersService(
        graphClient,
        userResponse.id,
        userResponse.mail,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        null as any
      );

      const success = await service.sendReminder(reminderTarget, subject, body);

      if (success) {
        recordReminderSent(reminderTarget.id, template);
        setReminderTarget(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to send reminder:', err);
      return false;
    }
  }, [reminderTarget, context, recordReminderSent]);

  // Helper to remove item from test data
  const removeItemFromTestData = React.useCallback((itemId: string) => {
    if (dataMode !== 'test') return;

    setTestData(prevData => {
      if (!prevData) return prevData;

      // Remove from allPendingItems
      const newAllPendingItems = prevData.allPendingItems.filter(i => i.id !== itemId);

      // Remove from snoozedItems
      const newSnoozedItems = (prevData.snoozedItems || []).filter(i => i.id !== itemId);

      // Rebuild byPerson groups
      const newByPerson = prevData.byPerson
        .map(group => ({
          ...group,
          pendingItems: group.pendingItems.filter(i => i.id !== itemId),
          itemCount: group.pendingItems.filter(i => i.id !== itemId).length,
        }))
        .filter(group => group.itemCount > 0);

      return {
        ...prevData,
        allPendingItems: newAllPendingItems,
        snoozedItems: newSnoozedItems,
        byPerson: newByPerson,
        totalItems: newAllPendingItems.length,
        totalPeopleOwing: newByPerson.length,
        snoozedCount: newSnoozedItems.length,
      };
    });
  }, [dataMode]);

  // Helper to restore item to test data
  const restoreItemToTestData = React.useCallback((item: PendingResponse) => {
    if (dataMode !== 'test') return;

    setTestData(prevData => {
      if (!prevData) return prevData;

      // Check if item is snoozed
      const isSnoozed = !!item.snoozedUntil;

      // Add back to appropriate list
      const newAllPendingItems = isSnoozed
        ? prevData.allPendingItems
        : [...prevData.allPendingItems, item];

      const newSnoozedItems = isSnoozed
        ? [...(prevData.snoozedItems || []), item]
        : prevData.snoozedItems || [];

      // Rebuild byPerson groups
      const existingGroup = prevData.byPerson.find(g => g.person.id === item.recipient.id);
      let newByPerson: PersonOwesGroup[];

      if (!isSnoozed) {
        if (existingGroup) {
          newByPerson = prevData.byPerson.map(group => {
            if (group.person.id === item.recipient.id) {
              return {
                ...group,
                pendingItems: [...group.pendingItems, item],
                itemCount: group.itemCount + 1,
              };
            }
            return group;
          });
        } else {
          newByPerson = [
            ...prevData.byPerson,
            {
              person: item.recipient,
              pendingItems: [item],
              totalWaitHours: item.waitingDuration,
              longestWaitHours: item.waitingDuration,
              oldestItemDate: item.sentDateTime,
              itemCount: 1,
              snoozedCount: 0,
              reminderSentCount: item.reminderCount > 0 ? 1 : 0,
            },
          ];
        }
      } else {
        newByPerson = prevData.byPerson;
      }

      return {
        ...prevData,
        allPendingItems: newAllPendingItems,
        snoozedItems: newSnoozedItems,
        byPerson: newByPerson,
        totalItems: newAllPendingItems.length,
        totalPeopleOwing: newByPerson.length,
        snoozedCount: newSnoozedItems.length,
      };
    });
  }, [dataMode]);

  // Helper to snooze item in test data
  const snoozeItemInTestData = React.useCallback((itemId: string, until: Date, _reason?: string) => {
    if (dataMode !== 'test') return;

    setTestData(prevData => {
      if (!prevData) return prevData;

      // Find the item in allPendingItems
      const itemToSnooze = prevData.allPendingItems.find(i => i.id === itemId);
      if (!itemToSnooze) return prevData;

      // Create snoozed version
      const snoozedItem: PendingResponse = {
        ...itemToSnooze,
        snoozedUntil: until,
      };

      // Remove from allPendingItems
      const newAllPendingItems = prevData.allPendingItems.filter(i => i.id !== itemId);

      // Add to snoozedItems
      const newSnoozedItems = [...(prevData.snoozedItems || []), snoozedItem];

      // Update byPerson groups
      const newByPerson = prevData.byPerson
        .map(group => ({
          ...group,
          pendingItems: group.pendingItems.filter(i => i.id !== itemId),
          itemCount: group.pendingItems.filter(i => i.id !== itemId).length,
          snoozedCount: group.snoozedCount + (group.person.id === itemToSnooze.recipient.id ? 1 : 0),
        }))
        .filter(group => group.itemCount > 0);

      return {
        ...prevData,
        allPendingItems: newAllPendingItems,
        snoozedItems: newSnoozedItems,
        byPerson: newByPerson,
        totalItems: newAllPendingItems.length,
        totalPeopleOwing: newByPerson.length,
        snoozedCount: newSnoozedItems.length,
      };
    });
  }, [dataMode]);

  // Helper to unsnooze item in test data
  const unsnoozeItemInTestData = React.useCallback((itemId: string) => {
    if (dataMode !== 'test') return;

    setTestData(prevData => {
      if (!prevData) return prevData;

      // Find the item in snoozedItems
      const itemToUnsnooze = (prevData.snoozedItems || []).find(i => i.id === itemId);
      if (!itemToUnsnooze) return prevData;

      // Create unsnoozed version
      const unsnoozedItem: PendingResponse = {
        ...itemToUnsnooze,
        snoozedUntil: undefined,
      };

      // Remove from snoozedItems
      const newSnoozedItems = (prevData.snoozedItems || []).filter(i => i.id !== itemId);

      // Add to allPendingItems
      const newAllPendingItems = [...prevData.allPendingItems, unsnoozedItem];

      // Update byPerson groups
      const existingGroup = prevData.byPerson.find(g => g.person.id === unsnoozedItem.recipient.id);
      let newByPerson: PersonOwesGroup[];

      if (existingGroup) {
        newByPerson = prevData.byPerson.map(group => {
          if (group.person.id === unsnoozedItem.recipient.id) {
            return {
              ...group,
              pendingItems: [...group.pendingItems, unsnoozedItem],
              itemCount: group.itemCount + 1,
              snoozedCount: Math.max(0, group.snoozedCount - 1),
            };
          }
          return group;
        });
      } else {
        // Create new group for this person
        newByPerson = [
          ...prevData.byPerson,
          {
            person: unsnoozedItem.recipient,
            pendingItems: [unsnoozedItem],
            totalWaitHours: unsnoozedItem.waitingDuration,
            longestWaitHours: unsnoozedItem.waitingDuration,
            oldestItemDate: unsnoozedItem.sentDateTime,
            itemCount: 1,
            snoozedCount: 0,
            reminderSentCount: unsnoozedItem.reminderCount > 0 ? 1 : 0,
          },
        ];
      }

      return {
        ...prevData,
        allPendingItems: newAllPendingItems,
        snoozedItems: newSnoozedItems,
        byPerson: newByPerson,
        totalItems: newAllPendingItems.length,
        totalPeopleOwing: newByPerson.length,
        snoozedCount: newSnoozedItems.length,
      };
    });
  }, [dataMode]);

  // Handle undo discard
  const handleUndoDiscard = React.useCallback((itemId: string) => {
    const pendingDiscard = pendingDiscardsRef.current.get(itemId);
    if (pendingDiscard) {
      clearTimeout(pendingDiscard.timeoutId);
      restoreItemToTestData(pendingDiscard.item);
      pendingDiscardsRef.current.delete(itemId);

      dispatchToast(
        <Toast>
          <ToastTitle>Item restored</ToastTitle>
        </Toast>,
        { intent: 'success', timeout: 2000 }
      );
    }
  }, [restoreItemToTestData, dispatchToast]);

  // Handle discard for single item with toast and undo
  const handleDiscard = React.useCallback((item: PendingResponse) => {
    // For API mode, just call resolveItem
    if (dataMode !== 'test') {
      resolveItem(item.id, 'no-longer-needed');
      return;
    }

    // For test mode, implement with animation and undo
    // First, add to removing set to trigger animation
    setRemovingItemIds(prev => new Set(prev).add(item.id));

    // After animation completes, remove from data
    setTimeout(() => {
      removeItemFromTestData(item.id);
      setRemovingItemIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 300); // Match animation duration

    // Generate a unique toast ID for this discard
    const toastId = `discard-${item.id}-${Date.now()}`;

    // Set up delayed permanent delete (for undo window)
    const timeoutId = setTimeout(() => {
      pendingDiscardsRef.current.delete(item.id);
    }, 5000);

    // Store for potential undo
    pendingDiscardsRef.current.set(item.id, { item, timeoutId, toastId });

    // Show toast with undo action
    dispatchToast(
      <Toast>
        <ToastTitle>Item discarded</ToastTitle>
        <ToastBody subtitle={item.subject}>
          {item.recipient.displayName}
        </ToastBody>
        <ToastFooter>
          <Link onClick={() => handleUndoDiscard(item.id)}>Undo</Link>
        </ToastFooter>
      </Toast>,
      { toastId, intent: 'info', pauseOnHover: true, timeout: 5000 }
    );
  }, [dataMode, resolveItem, removeItemFromTestData, dispatchToast, handleUndoDiscard]);

  // Handle unsnooze (action now)
  const handleUnsnooze = React.useCallback((item: PendingResponse) => {
    if (dataMode === 'test') {
      unsnoozeItemInTestData(item.id);
    } else {
      apiHook.unsnoozeItem(item.id);
    }
  }, [dataMode, unsnoozeItemInTestData, apiHook]);

  // Handle bulk snooze confirmation
  const handleBulkSnoozeConfirm = React.useCallback(() => {
    if (bulkAction && bulkAction.type === 'snooze') {
      setSnoozeEditState({ item: bulkAction.items[0], mode: 'snooze' });
      setBulkAction(null);
    }
  }, [bulkAction]);

  // Handle bulk discard confirmation
  const handleBulkDiscardConfirm = React.useCallback(() => {
    if (bulkAction && bulkAction.type === 'discard') {
      bulkAction.items.forEach(item => {
        handleDiscard(item);
      });
      setBulkAction(null);
    }
  }, [bulkAction, handleDiscard]);

  // Handle snooze with bulk support
  const handleSnoozeComplete = React.useCallback((until: Date, reason?: string) => {
    const doSnooze = (itemId: string) => {
      if (dataMode === 'test') {
        snoozeItemInTestData(itemId, until, reason);
      } else {
        apiHook.snoozeItem(itemId, until, reason);
      }
    };

    if (snoozeEditState && bulkAction && bulkAction.type === 'snooze') {
      bulkAction.items.forEach(item => {
        doSnooze(item.id);
      });
      setSnoozeEditState(null);
    } else if (snoozeEditState) {
      doSnooze(snoozeEditState.item.id);
      setSnoozeEditState(null);
    }
  }, [snoozeEditState, bulkAction, dataMode, snoozeItemInTestData, apiHook]);

  // Get item key
  const getItemKey = (item: ListItem): string => {
    if (item.type === 'person') {
      return `person-${item.data.person.id || item.data.person.email}`;
    }
    return `item-${item.data.id}`;
  };

  // Render master item
  const renderMasterItem = (item: ListItem, _isSelected: boolean): React.ReactNode => {
    if (item.type === 'person') {
      const group = item.data;
      const isOverdue = group.longestWaitHours >= 168;
      const isWarning = group.longestWaitHours >= 72 && !isOverdue;

      return (
        <div className={mergeClasses(styles.personGroupItem)}>
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
              <span className={`${styles.waitDays} ${isOverdue ? styles.overdueText : isWarning ? styles.warningText : ''}`}>
                <ClockRegular style={{ fontSize: '12px' }} />
                {formatWaitDuration(group.longestWaitHours)} longest
              </span>
            </div>
          </div>
          <div className={styles.masterItemRight}>
            {group.person.isVip && (
              <Crown20Filled className={styles.vipIconMaster} />
            )}
            <Badge
              appearance="tint"
              color={isOverdue ? 'danger' : isWarning ? 'warning' : 'brand'}
              size="small"
              className={styles.itemCountBadge}
            >
              {group.itemCount}
            </Badge>
          </div>
        </div>
      );
    } else {
      const pendingItem = item.data;
      const waitDays = pendingItem.waitingDuration / 24;
      const isOverdue = waitDays >= 7;
      const isWarning = waitDays >= 3 && !isOverdue;
      const isSnoozed = !!pendingItem.snoozedUntil;
      const isRemoving = removingItemIds.has(pendingItem.id);

      return (
        <div className={mergeClasses(styles.masterItem, isRemoving && styles.itemRemoving)}>
          <Avatar
            name={pendingItem.recipient.displayName}
            image={pendingItem.recipient.photoUrl ? { src: pendingItem.recipient.photoUrl } : undefined}
            size={32}
          />
          <div className={styles.personInfo}>
            <div className={styles.personNameRow}>
              <Text className={styles.personName}>{pendingItem.subject}</Text>
            </div>
            <div className={styles.itemMeta}>
              <span className={styles.subjectText}>{pendingItem.recipient.displayName}</span>
              {isSnoozed ? (
                <span className={styles.snoozedBadge}>
                  <ClockAlarm20Filled style={{ fontSize: '12px' }} />
                  Until {formatSnoozeDate(pendingItem.snoozedUntil!)}
                </span>
              ) : (
                <span className={`${styles.waitDays} ${isOverdue ? styles.overdueText : isWarning ? styles.warningText : ''}`}>
                  <ClockRegular style={{ fontSize: '12px' }} />
                  {formatWaitDuration(pendingItem.waitingDuration)}
                </span>
              )}
            </div>
          </div>
          {pendingItem.recipient.isVip && (
            <div className={styles.masterItemRight}>
              <Crown20Filled className={styles.vipIconMaster} />
            </div>
          )}
        </div>
      );
    }
  };

  // Render detail content for a person
  const renderPersonDetail = (group: PersonOwesGroup): React.ReactNode => {
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
              {group.person.isVip && (
                <Crown20Filled className={styles.vipIcon} />
              )}
            </div>
            <Text className={styles.personDetailEmail}>{group.person.email}</Text>
          </div>
          <Badge
            appearance="filled"
            color={getUrgencyColor(group.longestWaitHours)}
          >
            {group.itemCount} item{group.itemCount > 1 ? 's' : ''} pending
          </Badge>
        </div>

        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Pending Responses</Text>
          <div className={styles.pendingItemsList}>
            {sortResponses(group.pendingItems, 'oldest').map(item => {
              const isExpanded = expandedItemId === item.id;
              const isRemoving = removingItemIds.has(item.id);
              return (
                <div key={item.id} className={isRemoving ? styles.itemRemoving : undefined}>
                  <div className={styles.pendingItemCard}>
                    <div className={styles.pendingItemContent}>
                      <Text className={styles.pendingItemSubject}>{item.subject}</Text>
                      <div className={styles.pendingItemMeta}>
                        {getTypeIcon(item.conversationType)}
                        <span>{formatWaitDuration(item.waitingDuration)} ago</span>
                        {item.wasQuestion && <Badge size="small" appearance="outline">Question</Badge>}
                        {item.requestedAction && <Badge size="small" appearance="outline" color="warning">Action</Badge>}
                      </div>
                    </div>
                    <div className={styles.pendingItemActions}>
                      <Tooltip content={isExpanded ? "Collapse" : "Show details"} relationship="label">
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={isExpanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
                          className={styles.iconButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedItemId(isExpanded ? null : item.id);
                          }}
                        />
                      </Tooltip>
                      <Tooltip content="Open" relationship="label">
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<Open20Regular />}
                          className={styles.iconButton}
                          onClick={() => window.open(item.webUrl, '_blank', 'noopener,noreferrer')}
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
                            setSnoozeEditState({ item, mode: 'snooze' });
                          }}
                        />
                      </Tooltip>
                      <Tooltip content="Discard" relationship="label">
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<Delete20Regular />}
                          className={styles.iconButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDiscard(item);
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>
                  {/* Expanded content - same info as All mode detail view */}
                  {isExpanded && (
                    <div className={styles.expandedItemContent}>
                      {/* Badges row */}
                      <div className={styles.badgeRow}>
                        <Badge color={getUrgencyColor(item.waitingDuration)} appearance="filled">
                          Waiting {formatWaitDuration(item.waitingDuration)}
                        </Badge>
                        {item.recipient.isVip && (
                          <Badge color="warning" appearance="filled" icon={<Crown20Filled />}>
                            VIP
                          </Badge>
                        )}
                        {item.wasQuestion && (
                          <Badge color="informative" appearance="outline">
                            Question
                          </Badge>
                        )}
                        {item.requestedAction && (
                          <Badge color="warning" appearance="outline">
                            Action Requested
                          </Badge>
                        )}
                        {item.mentionedDeadline && (
                          <Badge color="danger" appearance="outline">
                            Has Deadline
                          </Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className={styles.detailRow}>
                        {getTypeIcon(item.conversationType)}
                        <span style={{ textTransform: 'capitalize' }}>
                          {item.conversationType.replace('-', ' ')}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <Clock24Regular className={styles.detailIcon} />
                        <span>Sent: {formatDateFull(item.sentDateTime)}</span>
                      </div>

                      {/* Message preview */}
                      <div className={styles.previewContent}>
                        {item.preview || 'No preview available'}
                      </div>

                      {/* Reminder count */}
                      {item.reminderCount > 0 && (
                        <Text className={styles.reminderInfo}>
                          {item.reminderCount} reminder{item.reminderCount > 1 ? 's' : ''} sent
                        </Text>
                      )}
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

  // Render detail content for an individual item (including snoozed)
  const renderItemDetail = (item: PendingResponse): React.ReactNode => {
    const isSnoozed = !!item.snoozedUntil;

    return (
      <div className={styles.detailContainer}>
        {/* Subject and Badges */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{item.subject}</Text>
          <div className={styles.badgeRow}>
            {isSnoozed ? (
              <Badge color="informative" appearance="filled" icon={<ClockAlarm20Filled />}>
                Snoozed until {formatSnoozeDate(item.snoozedUntil!)}
              </Badge>
            ) : (
              <Badge color={getUrgencyColor(item.waitingDuration)} appearance="filled">
                Waiting {formatWaitDuration(item.waitingDuration)}
              </Badge>
            )}
            {item.recipient.isVip && (
              <Badge color="warning" appearance="filled" icon={<Crown20Filled />}>
                VIP
              </Badge>
            )}
            {item.wasQuestion && (
              <Badge color="informative" appearance="outline">
                Question
              </Badge>
            )}
            {item.requestedAction && (
              <Badge color="warning" appearance="outline">
                Action Requested
              </Badge>
            )}
            {item.mentionedDeadline && (
              <Badge color="danger" appearance="outline">
                Has Deadline
              </Badge>
            )}
          </div>
        </div>

        {/* Snooze Info Box (only for snoozed items) */}
        {isSnoozed && (
          <div className={styles.snoozeInfoBox}>
            <ClockAlarm20Filled className={styles.snoozeInfoIcon} />
            <Text className={styles.snoozeInfoText}>
              This item is snoozed until <strong>{item.snoozedUntil!.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
            </Text>
          </div>
        )}

        {/* Recipient Info */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Waiting On</Text>
          <div className={styles.recipientInfo}>
            <Avatar
              name={item.recipient.displayName}
              image={item.recipient.photoUrl ? { src: item.recipient.photoUrl } : undefined}
              size={40}
            />
            <div>
              <div className={styles.personDetailNameRow}>
                <Text weight="semibold">{item.recipient.displayName}</Text>
                {item.recipient.isVip && <Crown20Filled className={styles.vipIcon} />}
              </div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>
                {item.recipient.email}
              </Text>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Details</Text>
          <div className={styles.detailRow}>
            {getTypeIcon(item.conversationType)}
            <span style={{ textTransform: 'capitalize' }}>
              {item.conversationType.replace('-', ' ')}
            </span>
          </div>
          <div className={styles.detailRow}>
            <Clock24Regular className={styles.detailIcon} />
            <span>Sent: {formatDateFull(item.sentDateTime)}</span>
          </div>
        </div>

        {/* Your Message */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Your Message</Text>
          <div className={styles.previewContent}>
            {item.preview || 'No preview available'}
          </div>
        </div>

        {/* Reminder Info */}
        {item.reminderCount > 0 && (
          <Text className={styles.reminderInfo}>
            {item.reminderCount} reminder{item.reminderCount > 1 ? 's' : ''} sent
          </Text>
        )}
      </div>
    );
  };

  // Render detail content based on selection
  const renderDetailContent = (item: ListItem): React.ReactNode => {
    if (item.type === 'person') {
      return renderPersonDetail(item.data);
    }
    return renderItemDetail(item.data);
  };

  // Render detail actions
  const renderDetailActions = (item: ListItem): React.ReactNode => {
    if (item.type === 'person') {
      const group = item.data;
      const mostOverdueItem = sortResponses(group.pendingItems, 'oldest')[0];
      const itemCount = group.itemCount;

      return (
        <>
          <Tooltip content="Send reminder" relationship="label">
            <Button
              appearance="primary"
              icon={<Send20Regular />}
              className={styles.actionButton}
              onClick={() => setReminderTarget(mostOverdueItem)}
            />
          </Tooltip>
          <Tooltip content={`Snooze all ${itemCount} items`} relationship="label">
            <Button
              appearance="secondary"
              icon={<ClockAlarm20Regular />}
              className={styles.actionButton}
              onClick={() => setBulkAction({
                type: 'snooze',
                items: group.pendingItems,
                personName: group.person.displayName
              })}
            />
          </Tooltip>
          <Tooltip content={`Discard all ${itemCount} items`} relationship="label">
            <Button
              appearance="secondary"
              icon={<Delete20Regular />}
              className={styles.actionButton}
              onClick={() => setBulkAction({
                type: 'discard',
                items: group.pendingItems,
                personName: group.person.displayName
              })}
            />
          </Tooltip>
          <Tooltip content="Open oldest item" relationship="label">
            <Button
              appearance="secondary"
              icon={<Open20Regular />}
              className={styles.actionButton}
              onClick={() => window.open(mostOverdueItem.webUrl, '_blank', 'noopener,noreferrer')}
            />
          </Tooltip>
        </>
      );
    }

    const pendingItem = item.data;
    const isSnoozed = !!pendingItem.snoozedUntil;

    if (isSnoozed) {
      // Snoozed item actions: Action Now, Change Time, Discard, Open
      return (
        <>
          <Tooltip content="Action now (unsnooze)" relationship="label">
            <Button
              appearance="primary"
              icon={<Play20Regular />}
              className={styles.actionButton}
              onClick={() => handleUnsnooze(pendingItem)}
            />
          </Tooltip>
          <Tooltip content="Change snooze time" relationship="label">
            <Button
              appearance="secondary"
              icon={<Edit20Regular />}
              className={styles.actionButton}
              onClick={() => setSnoozeEditState({ item: pendingItem, mode: 'edit' })}
            />
          </Tooltip>
          <Tooltip content="Discard" relationship="label">
            <Button
              appearance="secondary"
              icon={<Delete20Regular />}
              className={styles.actionButton}
              onClick={() => handleDiscard(pendingItem)}
            />
          </Tooltip>
          <Tooltip content="Open" relationship="label">
            <Button
              appearance="secondary"
              icon={<Open20Regular />}
              className={styles.actionButton}
              onClick={() => window.open(pendingItem.webUrl, '_blank', 'noopener,noreferrer')}
            />
          </Tooltip>
        </>
      );
    }

    // Regular item actions
    return (
      <>
        <Tooltip content="Send reminder" relationship="label">
          <Button
            appearance="primary"
            icon={<Send20Regular />}
            className={styles.actionButton}
            onClick={() => setReminderTarget(pendingItem)}
          />
        </Tooltip>
        <Tooltip content="Snooze" relationship="label">
          <Button
            appearance="secondary"
            icon={<ClockAlarm20Regular />}
            className={styles.actionButton}
            onClick={() => setSnoozeEditState({ item: pendingItem, mode: 'snooze' })}
          />
        </Tooltip>
        <Tooltip content="Discard" relationship="label">
          <Button
            appearance="secondary"
            icon={<Delete20Regular />}
            className={styles.actionButton}
            onClick={() => handleDiscard(pendingItem)}
          />
        </Tooltip>
        <Tooltip content="Open" relationship="label">
          <Button
            appearance="secondary"
            icon={<Open20Regular />}
            className={styles.actionButton}
            onClick={() => window.open(pendingItem.webUrl, '_blank', 'noopener,noreferrer')}
          />
        </Tooltip>
      </>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <ClockRegular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select an item to view details</Text>
      </>
    );
  };

  // Render empty state (no items)
  const renderEmptyState = (): React.ReactNode => {
    if (viewMode === 'snoozed') {
      return (
        <>
          <ClockAlarm20Regular className={styles.emptyIcon} />
          <Text className={styles.emptyText}>No snoozed items</Text>
          <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
            Items you snooze will appear here
          </Text>
        </>
      );
    }
    return (
      <>
        <CheckmarkCircle24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No pending responses!</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          Everyone has responded to you. Nice!
        </Text>
      </>
    );
  };

  // Get snoozed count
  const snoozedCount = data?.snoozedCount ?? 0;

  return (
    <>
      <MasterDetailCard
        items={listItems}
        selectedItem={currentSelectedItem}
        onItemSelect={handleSelectItem}
        getItemKey={getItemKey}
        renderMasterItem={renderMasterItem}
        renderDetailContent={renderDetailContent}
        renderDetailActions={renderDetailActions}
        renderEmptyDetail={renderEmptyDetail}
        renderEmptyState={renderEmptyState}
        icon={<ClockRegular />}
        title="Waiting On Others"
        itemCount={data?.totalItems ?? 0}
        loading={isLoading}
        error={error?.message}
        emptyMessage={viewMode === 'snoozed' ? "No snoozed items" : "No pending responses"}
        emptyIcon={viewMode === 'snoozed' ? <ClockAlarm20Regular /> : <CheckmarkCircle24Regular />}
        headerActions={
          <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
            {/* Refresh button */}
            <Tooltip content="Refresh" relationship="label">
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowClockwiseRegular />}
                onClick={refresh}
              />
            </Tooltip>
            {/* Chart toggle */}
            {settings.showChart && trendData && (data?.totalItems ?? 0) > 0 && (
              <Tooltip content={showChart ? "Hide trend" : "Show trend"} relationship="label">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={showChart ? <DataTrending20Filled /> : <DataTrending20Regular />}
                  onClick={() => setShowChart(!showChart)}
                />
              </Tooltip>
            )}
            <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
          </div>
        }
        headerContent={
          <>
            {/* AI Insight Banner (AI Demo Mode only) */}
            {aiDemoMode && aiCardSummary && aiInsights && aiInsights.length > 0 && (
              <div style={{ padding: `0 ${tokens.spacingHorizontalM}`, marginBottom: tokens.spacingVerticalS }}>
                <AIInsightBanner
                  summary={aiCardSummary}
                  insights={aiInsights}
                  defaultExpanded={false}
                  onLearnMore={() => setShowOnboarding(true)}
                />
              </div>
            )}

            {/* Chart */}
            {settings.showChart && showChart && trendData && (data?.totalItems ?? 0) > 0 && (
              <div style={{ padding: `0 ${tokens.spacingHorizontalM}`, marginBottom: tokens.spacingVerticalS }}>
                <WaitingTrendChart data={trendData} />
              </div>
            )}
            {/* View Mode Tabs + Sort */}
            {((data?.totalItems ?? 0) > 0 || snoozedCount > 0) && (
              <div className={styles.tabSection}>
                <TabList
                  selectedValue={viewMode}
                  onTabSelect={(_, d) => setViewMode(d.value as ViewMode)}
                  size="small"
                >
                  <Tab value="people" icon={<PeopleRegular />}>
                    People ({data?.totalPeopleOwing ?? 0})
                  </Tab>
                  <Tab value="list" icon={<ListRegular />}>
                    All ({data?.totalItems ?? 0})
                  </Tab>
                  <Tab value="snoozed" icon={<ClockAlarm20Regular />}>
                    Snoozed ({snoozedCount})
                  </Tab>
                </TabList>
                {/* Toolbar: Sort + Filter */}
                <div className={styles.tabToolbar}>
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
                          <MenuItemRadio name="sort" value="priority">
                            Priority (VIP first)
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
                  {/* Filter Menu */}
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
                          className={activeFilters.size > 0 ? styles.filterActive : undefined}
                        />
                      </Tooltip>
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuGroup>
                          <MenuGroupHeader>Filter by</MenuGroupHeader>
                          <MenuItemCheckbox name="filter" value="vip">
                            VIP contacts
                          </MenuItemCheckbox>
                          <MenuItemCheckbox name="filter" value="action">
                            Action requested
                          </MenuItemCheckbox>
                          <MenuItemCheckbox name="filter" value="question">
                            Question asked
                          </MenuItemCheckbox>
                          <MenuItemCheckbox name="filter" value="deadline">
                            Has deadline
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
                </div>
              </div>
            )}
          </>
        }
      />

      {/* Reminder Composer Dialog */}
      {reminderTarget && (
        <ReminderComposer
          open={!!reminderTarget}
          onOpenChange={(open) => !open && setReminderTarget(null)}
          pendingItem={reminderTarget}
          onSend={handleSendReminder}
        />
      )}

      {/* Snooze Dialog */}
      {snoozeEditState && (
        <SnoozeDialog
          open={!!snoozeEditState}
          onOpenChange={(open) => !open && setSnoozeEditState(null)}
          onSnooze={handleSnoozeComplete}
          conversationSubject={snoozeEditState.item.subject}
          currentSnoozeDate={snoozeEditState.mode === 'edit' ? snoozeEditState.item.snoozedUntil : undefined}
          mode={snoozeEditState.mode}
        />
      )}

      {/* Bulk Action Confirmation Dialog */}
      <Dialog
        open={!!bulkAction}
        onOpenChange={(_, dialogData) => !dialogData.open && setBulkAction(null)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              {bulkAction?.type === 'snooze' ? 'Snooze All Items' : 'Discard All Items'}
            </DialogTitle>
            <DialogContent>
              {bulkAction?.type === 'snooze' ? (
                <Text>
                  This will snooze all <strong>{bulkAction.items.length} items</strong> from{' '}
                  <strong>{bulkAction.personName}</strong>. They will be hidden until the snooze period ends.
                </Text>
              ) : (
                <Text>
                  This will discard all <strong>{bulkAction?.items.length} items</strong> from{' '}
                  <strong>{bulkAction?.personName}</strong>. They will be marked as no longer needed and removed from your list.
                </Text>
              )}
              <div className={styles.bulkWarning}>
                This action will apply to all items for this person.
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setBulkAction(null)}>
                Cancel
              </Button>
              {bulkAction?.type === 'snooze' ? (
                <Button appearance="primary" onClick={handleBulkSnoozeConfirm}>
                  Continue to Snooze
                </Button>
              ) : (
                <Button
                  appearance="primary"
                  style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
                  onClick={handleBulkDiscardConfirm}
                >
                  Discard All
                </Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* AI Onboarding Dialog */}
      <AIOnboardingDialog
        open={showOnboarding}
        onClose={handleOnboardingClose}
        onDontShowAgain={handleDontShowAgain}
      />

      {/* Toast notifications */}
      <Toaster toasterId={toasterId} position="bottom-end" />
    </>
  );
};

export default WaitingOnOthersCardLarge;
