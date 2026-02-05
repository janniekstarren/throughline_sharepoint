// ============================================
// useEmailCard Hook - Consolidated Email Data Management
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  IEmailCardItem,
  IEmailCardData,
  IEmailCardStats,
  IEmailTrendData,
  IVipContact,
  IEmailCardSettings,
  IEmailFilters,
  IEmailAttachment,
  EmailTabType,
  EmailSortMode,
  DEFAULT_EMAIL_CARD_SETTINGS,
  DEFAULT_EMAIL_FILTERS,
  ITrendDataPoint,
} from '../models/EmailCard';
import { UnreadInboxService } from '../services/UnreadInboxService';
import { FlaggedEmailsService } from '../services/FlaggedEmailsService';
import { GraphCacheService } from '../services/GraphCacheService';
import { TrendDataPoint } from '../components/shared/charts';
import { DataMode } from '../services/testData';
import { getTestUnreadInboxData, getTestInboxTrendData } from '../services/testData/unreadInbox';
import { getTestFlaggedEmailsData, getTestFlagsTrendData } from '../services/testData/flaggedEmailsNew';
// AI Demo Mode imports
import { IAIEnhancedItem, IAICardSummary, IAIInsight } from '../models/AITypes';
import { getAIEnhancedEmails, getAIEmailCardSummary, getAllEmailInsights } from '../services/testData/aiDemoData';

// Re-export types for convenience
export {
  IEmailCardItem,
  IEmailCardSettings,
  IEmailFilters,
  EmailTabType,
  EmailSortMode,
  DEFAULT_EMAIL_CARD_SETTINGS,
  DEFAULT_EMAIL_FILTERS,
};

/**
 * Return type for the useEmailCard hook
 */
export interface UseEmailCardResult {
  /** Complete email card data */
  data: IEmailCardData | null;
  /** Currently active tab */
  activeTab: EmailTabType;
  /** Set the active tab */
  setActiveTab: (tab: EmailTabType) => void;
  /** Current sort mode */
  sortMode: EmailSortMode;
  /** Set sort mode */
  setSortMode: (mode: EmailSortMode) => void;
  /** Active filters */
  filters: IEmailFilters;
  /** Set filters */
  setFilters: (filters: IEmailFilters) => void;
  /** Filtered and sorted emails for current tab */
  displayEmails: IEmailCardItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Last refresh timestamp */
  lastRefreshed: Date | null;
  /** Refresh all data */
  refresh: () => Promise<void>;
  // AI Demo Mode data
  /** AI-enhanced email items (when aiDemoMode is true) */
  aiEnhancedEmails?: IAIEnhancedItem<IEmailCardItem>[];
  /** AI card summary (when aiDemoMode is true) */
  aiCardSummary?: IAICardSummary;
  /** All AI insights (when aiDemoMode is true) */
  aiInsights?: IAIInsight[];
}

/**
 * Generate sample attachments for test data
 */
const generateSampleAttachments = (emailId: string, subject: string): IEmailAttachment[] => {
  const attachmentTypes = [
    { ext: 'pdf', type: 'application/pdf', name: 'Document' },
    { ext: 'docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Report' },
    { ext: 'xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'Spreadsheet' },
    { ext: 'pptx', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', name: 'Presentation' },
  ];

  const type = attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)];
  const baseName = subject.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_');

  return [
    {
      id: `${emailId}-att-1`,
      name: `${type.name}_${baseName}.${type.ext}`,
      size: Math.floor(Math.random() * 5000000) + 50000, // 50KB - 5MB
      contentType: type.type,
      isInline: false,
      contentUrl: `https://outlook.office.com/owa/attachment/${emailId}/att-1`,
    },
  ];
};

/**
 * Convert UnreadInboxService email to IEmailCardItem
 */
const convertUnreadEmail = (
  email: {
    id: string;
    subject: string;
    from: { name: string; email: string };
    receivedDateTime: Date;
    bodyPreview: string;
    importance: 'low' | 'normal' | 'high';
    hasAttachments: boolean;
    isRead: boolean;
    webLink: string;
  },
  vipEmails: Set<string>,
  addSampleAttachments: boolean = false
): IEmailCardItem => ({
  id: email.id,
  subject: email.subject,
  from: email.from,
  receivedDateTime: email.receivedDateTime,
  bodyPreview: email.bodyPreview,
  importance: email.importance,
  hasAttachments: email.hasAttachments,
  isRead: email.isRead,
  webLink: email.webLink,
  isFlagged: false,
  isVip: vipEmails.has(email.from.email.toLowerCase()),
  attachments: email.hasAttachments && addSampleAttachments
    ? generateSampleAttachments(email.id, email.subject)
    : undefined,
});

/**
 * Convert FlaggedEmailsService email to IEmailCardItem
 */
const convertFlaggedEmail = (
  email: {
    id: string;
    subject: string;
    from: { name: string; email: string };
    receivedDateTime: Date;
    bodyPreview: string;
    importance: 'low' | 'normal' | 'high';
    hasAttachments: boolean;
    flagStatus: 'flagged' | 'complete' | 'notFlagged';
    webLink: string;
  },
  vipEmails: Set<string>,
  addSampleAttachments: boolean = false
): IEmailCardItem => ({
  id: email.id,
  subject: email.subject,
  from: email.from,
  receivedDateTime: email.receivedDateTime,
  bodyPreview: email.bodyPreview,
  importance: email.importance,
  hasAttachments: email.hasAttachments,
  isRead: true, // Flagged emails are typically read
  webLink: email.webLink,
  isFlagged: email.flagStatus === 'flagged',
  flagStatus: email.flagStatus,
  isVip: vipEmails.has(email.from.email.toLowerCase()),
  attachments: email.hasAttachments && addSampleAttachments
    ? generateSampleAttachments(email.id, email.subject)
    : undefined,
});

/**
 * Hook for managing consolidated Email card data
 */
export const useEmailCard = (
  context: WebPartContext,
  settings: IEmailCardSettings = DEFAULT_EMAIL_CARD_SETTINGS,
  dataMode: DataMode = 'test',
  aiDemoMode: boolean = false
): UseEmailCardResult => {
  // Data state
  const [data, setData] = useState<IEmailCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<EmailTabType>(settings.defaultTab);
  const [sortMode, setSortMode] = useState<EmailSortMode>('newest');
  const [filters, setFilters] = useState<IEmailFilters>(DEFAULT_EMAIL_FILTERS);

  /**
   * Fetch VIP contacts (manager, direct reports, frequent collaborators)
   */
  const fetchVipContacts = useCallback(async (): Promise<IVipContact[]> => {
    if (!settings.enableAutoVipDetection) {
      // Only use manual VIP list
      return settings.manualVipEmails.map(email => ({
        email: email.toLowerCase(),
        displayName: email,
        reason: 'manual' as const,
      }));
    }

    try {
      const graphClient = await context.msGraphClientFactory.getClient('3');
      const cacheService = new GraphCacheService(graphClient);

      const [manager, directReports, frequentCollaborators] = await Promise.all([
        cacheService.getManager(),
        cacheService.getDirectReports(),
        cacheService.getFrequentCollaborators(),
      ]);

      const vipContacts: IVipContact[] = [];

      // Add manager
      if (manager) {
        vipContacts.push({
          email: manager.email.toLowerCase(),
          displayName: manager.displayName,
          reason: 'manager',
        });
      }

      // Add direct reports
      directReports.forEach(report => {
        if (report.email) {
          vipContacts.push({
            email: report.email.toLowerCase(),
            displayName: report.displayName,
            reason: 'direct_report',
          });
        }
      });

      // Add top frequent collaborators
      frequentCollaborators
        .slice(0, settings.frequentSendersCount)
        .forEach(collab => {
          if (collab.email && !vipContacts.some(v => v.email === collab.email.toLowerCase())) {
            vipContacts.push({
              email: collab.email.toLowerCase(),
              displayName: collab.displayName,
              reason: 'frequent',
            });
          }
        });

      // Add manual VIPs
      settings.manualVipEmails.forEach(email => {
        const lowerEmail = email.toLowerCase();
        if (!vipContacts.some(v => v.email === lowerEmail)) {
          vipContacts.push({
            email: lowerEmail,
            displayName: email,
            reason: 'manual',
          });
        }
      });

      return vipContacts;
    } catch (err) {
      console.error('Error fetching VIP contacts:', err);
      // Return manual VIPs on error
      return settings.manualVipEmails.map(email => ({
        email: email.toLowerCase(),
        displayName: email,
        reason: 'manual' as const,
      }));
    }
  }, [context, settings]);

  /**
   * Fetch all email data
   */
  const fetchData = useCallback(async () => {
    if (!settings.enabled) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use test data mode
      if (dataMode === 'test') {
        const testUnread = getTestUnreadInboxData();
        const testFlagged = getTestFlaggedEmailsData();
        const testUnreadTrend = getTestInboxTrendData();
        const testFlaggedTrend = getTestFlagsTrendData();

        // Create mock VIP contacts - must match senders in test data
        const vipContacts: IVipContact[] = [
          { email: 'sarah.chen@contoso.com', displayName: 'Sarah Chen', reason: 'manager' },
          { email: 'alex.kim@contoso.com', displayName: 'Alex Kim', reason: 'direct_report' },
          { email: 'michael.chen@contoso.com', displayName: 'Michael Chen', reason: 'frequent' },
        ];
        const vipEmails = new Set(vipContacts.map(v => v.email.toLowerCase()));

        // Convert emails (with sample attachments for test data)
        const unreadEmails = testUnread.emails.map(e => convertUnreadEmail(e, vipEmails, true));
        const flaggedEmails = testFlagged.emails.map(e => convertFlaggedEmail(e, vipEmails, true));

        // VIP emails are filtered from both unread and flagged
        const allEmails = [...unreadEmails, ...flaggedEmails];
        const vipEmailsFiltered = allEmails.filter(e => e.isVip);
        const uniqueVipEmails = vipEmailsFiltered.filter(
          (e, idx, arr) => arr.findIndex(x => x.id === e.id) === idx
        );

        // Urgent emails are high importance from both unread and flagged
        const urgentEmails = allEmails
          .filter(e => e.importance === 'high')
          .filter((e, idx, arr) => arr.findIndex(x => x.id === e.id) === idx);

        // Calculate stats
        const stats: IEmailCardStats = {
          // Unread stats
          unreadCount: testUnread.totalCount,
          highPriorityCount: testUnread.highPriorityCount,
          withAttachmentsCount: testUnread.attachmentCount,
          oldestUnreadHours: testUnread.oldestUnreadHours,
          // Flagged stats
          activeFlagsCount: testFlagged.totalCount - testFlagged.completedCount,
          completedThisWeekCount: testFlagged.completedThisWeek,
          averageFlagAgeDays: testFlagged.averageAgeDays,
          oldestFlagDays: testFlagged.oldestFlagDays,
          // VIP stats
          vipUnreadCount: uniqueVipEmails.filter(e => !e.isRead).length,
          vipTotalCount: uniqueVipEmails.length,
          vipContactsCount: vipContacts.length,
          vipUrgentCount: uniqueVipEmails.filter(e => e.importance === 'high').length,
          // Urgent stats
          urgentCount: urgentEmails.length,
          urgentUnreadCount: urgentEmails.filter(e => !e.isRead).length,
          urgentVipCount: urgentEmails.filter(e => e.isVip).length,
          oldestUrgentHours: urgentEmails.length > 0
            ? Math.max(...urgentEmails.map(e => (Date.now() - e.receivedDateTime.getTime()) / (1000 * 60 * 60)))
            : 0,
        };

        // Build trend data
        const trendData: IEmailTrendData = {
          dataPoints: testUnreadTrend.dataPoints.map((p: TrendDataPoint, i: number) => ({
            date: p.date,
            unreadValue: p.value,
            flaggedValue: testFlaggedTrend.dataPoints[i]?.value || 0,
            vipValue: Math.floor(p.value * 0.2), // Mock VIP as 20% of unread
            urgentValue: Math.floor(p.value * 0.15), // Mock urgent as 15% of unread
          })),
          unreadTrend: testUnreadTrend.trend === 'fewer' ? 'improving' : testUnreadTrend.trend === 'more' ? 'worsening' : 'stable',
          flaggedTrend: testFlaggedTrend.trend,
          vipTrend: 'stable',
          urgentTrend: 'stable',
          unreadAverage: testUnreadTrend.averageEmailsPerDay,
          flaggedAverage: testFlaggedTrend.averageCompletedPerDay,
          vipAverage: Math.floor(testUnreadTrend.averageEmailsPerDay * 0.2),
          urgentAverage: Math.floor(testUnreadTrend.averageEmailsPerDay * 0.15),
        };

        setData({
          unreadEmails,
          flaggedEmails,
          vipEmails: uniqueVipEmails,
          urgentEmails,
          vipContacts,
          stats,
          trendData,
        });
        setLastRefreshed(new Date());
        setIsLoading(false);
        return;
      }

      // Fetch VIP contacts first
      const vipContacts = await fetchVipContacts();
      const vipEmails = new Set(vipContacts.map(v => v.email.toLowerCase()));

      // Fetch unread and flagged emails in parallel
      const unreadService = new UnreadInboxService(context);
      const flaggedService = new FlaggedEmailsService(context);

      const [unreadResult, flaggedResult] = await Promise.all([
        unreadService.getData({ enabled: true, maxItems: settings.maxItems, showHighImportance: true }),
        flaggedService.getData({ enabled: true, maxItems: settings.maxItems, showCompleted: true }),
      ]);

      // Convert emails
      const unreadEmails = unreadResult.emails.map(e => convertUnreadEmail(e, vipEmails));
      const flaggedEmails = flaggedResult.emails.map(e => convertFlaggedEmail(e, vipEmails));

      // VIP emails - combine from both sources
      const allEmails = [...unreadEmails, ...flaggedEmails];
      const vipEmailsFiltered = allEmails.filter(e => e.isVip);
      const uniqueVipEmails = vipEmailsFiltered.filter(
        (e, idx, arr) => arr.findIndex(x => x.id === e.id) === idx
      );

      // Urgent emails are high importance from both unread and flagged
      const urgentEmails = allEmails
        .filter(e => e.importance === 'high')
        .filter((e, idx, arr) => arr.findIndex(x => x.id === e.id) === idx);

      // Calculate stats
      const stats: IEmailCardStats = {
        // Unread stats
        unreadCount: unreadResult.totalCount,
        highPriorityCount: unreadResult.highPriorityCount,
        withAttachmentsCount: unreadResult.attachmentCount,
        oldestUnreadHours: unreadResult.oldestUnreadHours,
        // Flagged stats
        activeFlagsCount: flaggedResult.totalCount - flaggedResult.completedCount,
        completedThisWeekCount: flaggedResult.completedThisWeek,
        averageFlagAgeDays: flaggedResult.averageAgeDays,
        oldestFlagDays: flaggedResult.oldestFlagDays,
        // VIP stats
        vipUnreadCount: uniqueVipEmails.filter(e => !e.isRead).length,
        vipTotalCount: uniqueVipEmails.length,
        vipContactsCount: vipContacts.length,
        vipUrgentCount: uniqueVipEmails.filter(e => e.importance === 'high').length,
        // Urgent stats
        urgentCount: urgentEmails.length,
        urgentUnreadCount: urgentEmails.filter(e => !e.isRead).length,
        urgentVipCount: urgentEmails.filter(e => e.isVip).length,
        oldestUrgentHours: urgentEmails.length > 0
          ? Math.max(...urgentEmails.map(e => (Date.now() - e.receivedDateTime.getTime()) / (1000 * 60 * 60)))
          : 0,
      };

      // Build trend data (mock for now - could be enhanced with real historical data)
      const now = new Date();
      const dataPoints: ITrendDataPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dataPoints.push({
          date,
          unreadValue: Math.floor(Math.random() * 10) + 5,
          flaggedValue: Math.floor(Math.random() * 5) + 1,
          vipValue: Math.floor(Math.random() * 3) + 1,
          urgentValue: Math.floor(Math.random() * 3) + 1,
        });
      }

      const trendData: IEmailTrendData = {
        dataPoints,
        unreadTrend: 'stable',
        flaggedTrend: 'stable',
        vipTrend: 'stable',
        urgentTrend: 'stable',
        unreadAverage: dataPoints.reduce((sum, p) => sum + p.unreadValue, 0) / dataPoints.length,
        flaggedAverage: dataPoints.reduce((sum, p) => sum + p.flaggedValue, 0) / dataPoints.length,
        vipAverage: dataPoints.reduce((sum, p) => sum + p.vipValue, 0) / dataPoints.length,
        urgentAverage: dataPoints.reduce((sum, p) => sum + p.urgentValue, 0) / dataPoints.length,
      };

      setData({
        unreadEmails,
        flaggedEmails,
        vipEmails: uniqueVipEmails,
        urgentEmails,
        vipContacts,
        stats,
        trendData,
      });
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching email data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch email data'));
    } finally {
      setIsLoading(false);
    }
  }, [context, settings, dataMode, fetchVipContacts]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Get emails for current tab, filtered and sorted
   */
  const displayEmails = useMemo(() => {
    if (!data) return [];

    // Get base emails for current tab
    let emails: IEmailCardItem[] = [];
    switch (activeTab) {
      case 'unread':
        emails = [...data.unreadEmails];
        break;
      case 'flagged':
        emails = [...data.flaggedEmails];
        break;
      case 'vip':
        emails = [...data.vipEmails];
        break;
      case 'urgent':
        emails = [...data.urgentEmails];
        break;
    }

    // Apply filters
    if (filters.vip) {
      emails = emails.filter(e => e.isVip);
    }
    if (filters.flagged) {
      emails = emails.filter(e => e.isFlagged);
    }
    if (filters.unread) {
      emails = emails.filter(e => !e.isRead);
    }
    if (filters.hasAttachments) {
      emails = emails.filter(e => e.hasAttachments);
    }
    if (filters.highPriority) {
      emails = emails.filter(e => e.importance === 'high');
    }

    // Apply sorting
    emails.sort((a, b) => {
      switch (sortMode) {
        case 'priority':
          // VIP first, then high importance, then by date
          if (a.isVip && !b.isVip) return -1;
          if (!a.isVip && b.isVip) return 1;
          if (a.importance === 'high' && b.importance !== 'high') return -1;
          if (a.importance !== 'high' && b.importance === 'high') return 1;
          return b.receivedDateTime.getTime() - a.receivedDateTime.getTime();
        case 'sender':
          return a.from.name.localeCompare(b.from.name);
        case 'oldest':
          return a.receivedDateTime.getTime() - b.receivedDateTime.getTime();
        case 'newest':
        default:
          return b.receivedDateTime.getTime() - a.receivedDateTime.getTime();
      }
    });

    return emails;
  }, [data, activeTab, filters, sortMode]);

  // AI Demo Mode data (memoized)
  const aiEnhancedEmails = useMemo(() => {
    if (!aiDemoMode) return undefined;
    return getAIEnhancedEmails();
  }, [aiDemoMode]);

  const aiCardSummary = useMemo(() => {
    if (!aiDemoMode) return undefined;
    return getAIEmailCardSummary();
  }, [aiDemoMode]);

  const aiInsights = useMemo(() => {
    if (!aiDemoMode) return undefined;
    return getAllEmailInsights();
  }, [aiDemoMode]);

  return {
    data,
    activeTab,
    setActiveTab,
    sortMode,
    setSortMode,
    filters,
    setFilters,
    displayEmails,
    isLoading,
    error,
    lastRefreshed,
    refresh: fetchData,
    // AI Demo Mode data
    aiEnhancedEmails,
    aiCardSummary,
    aiInsights,
  };
};

export default useEmailCard;
