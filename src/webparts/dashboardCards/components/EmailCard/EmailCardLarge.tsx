// ============================================
// EmailCardLarge - Consolidated Email Card (Large View)
// Master-detail layout with tabs: Unread | Flagged | VIPs | Urgent
// With sort, filter, email actions, and attachment links
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Text,
  Button,
  Tooltip,
  Avatar,
  tokens,
  makeStyles,
  TabList,
  Tab,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuGroup,
  MenuGroupHeader,
  MenuItemRadio,
  MenuItemCheckbox,
  MenuItem,
  MenuDivider,
  mergeClasses,
} from '@fluentui/react-components';
import {
  Mail24Regular,
  Mail20Filled,
  Flag24Regular,
  Flag20Regular,
  Flag20Filled,
  ArrowClockwiseRegular,
  
  ArrowSort20Regular,
  Filter20Regular,
  Dismiss20Regular,
  Attach20Regular,
  AlertUrgent20Regular,
  AlertUrgent20Filled,
  AlertUrgent24Regular,
  Clock24Regular,
  Open20Regular,
  ArrowReply20Regular,
  ArrowForward20Regular,
  FlagOff20Regular,
  Crown20Filled,
  DocumentRegular,
  ArrowDownload20Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useEmailCard,
  IEmailCardSettings,
  IEmailFilters,
  IEmailCardItem,
  EmailTabType,
  EmailSortMode,
  DEFAULT_EMAIL_CARD_SETTINGS,
} from '../../hooks/useEmailCard';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { DataMode } from '../../services/testData';
// AI Demo Mode components
import {
  AIBadge,
  AIScore,
  AIInsightBanner,
  AIInsightsPanel,
  AIOnboardingDialog,
} from '../shared/AIComponents';

// Local storage key for onboarding state
const AI_ONBOARDING_KEY = 'dashboardCards_aiOnboardingDismissed';

// ============================================
// Styles
// ============================================
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
  // VIP icon style
  vipIcon: {
    color: tokens.colorPaletteYellowForeground1,
    fontSize: '14px',
  },
  // Master item styles - Clean, minimal design
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    position: 'relative',
  },
  // Unread indicator dot (replaces bold text + icon)
  unreadDot: {
    position: 'absolute',
    left: '-8px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: tokens.colorBrandForeground1,
  },
  emailInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  // Sender row with name and time
  senderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  senderName: {
    fontSize: '12px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  },
  senderNameUnread: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  timeText: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  // Subject line
  emailSubject: {
    fontSize: '13px',
    fontWeight: 400,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.3,
  },
  emailSubjectUnread: {
    fontWeight: 600,
  },
  // Minimal status indicators row (for master list)
  masterStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: '2px',
  },
  // Subtle status indicator (combines priority/VIP/flag into one line)
  masterStatusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  masterStatusUrgent: {
    color: tokens.colorPaletteRedForeground1,
  },
  masterStatusVip: {
    color: tokens.colorPaletteYellowForeground1,
  },
  masterStatusFlagged: {
    color: tokens.colorBrandForeground1,
  },
  masterStatusIcon: {
    fontSize: '12px',
  },
  // Attachment count badge
  attachmentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: '1px 4px',
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
  // Icon-only status row (replaces badges)
  statusIconRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  statusIcon: {
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconUnread: {
    color: tokens.colorBrandForeground1,
  },
  statusIconVip: {
    color: tokens.colorPaletteYellowForeground1,
  },
  statusIconUrgent: {
    color: tokens.colorPaletteRedForeground1,
  },
  statusIconFlagged: {
    color: tokens.colorBrandForeground1,
  },
  statusIconAttachment: {
    color: tokens.colorNeutralForeground3,
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
  senderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  senderDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  senderNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  previewContent: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.5,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    whiteSpace: 'pre-wrap',
    maxHeight: '200px',
    overflow: 'auto',
  },
  // Attachment styles
  attachmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  attachmentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  attachmentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flex: 1,
    minWidth: 0,
  },
  attachmentIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
    flexShrink: 0,
  },
  attachmentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    minWidth: 0,
    flex: 1,
  },
  attachmentName: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  attachmentSize: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  attachmentLink: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorBrandForeground1,
    fontSize: '12px',
    textDecoration: 'none',
    cursor: 'pointer',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  // Action buttons
  actionButton: {
    minWidth: 'auto',
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
});

// ============================================
// Props Interface
// ============================================
interface EmailCardLargeProps {
  context: WebPartContext;
  settings?: IEmailCardSettings;
  dataMode?: DataMode;
  /** AI Demo Mode - show AI insights when true */
  aiDemoMode?: boolean;
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Helper Functions
// ============================================

const formatAge = (hours: number): string => {
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Sort labels for tooltip
const sortLabels: Record<EmailSortMode, string> = {
  priority: 'Priority (VIP first)',
  sender: 'Sender A-Z',
  oldest: 'Oldest first',
  newest: 'Newest first',
};

// ============================================
// Component
// ============================================
export const EmailCardLarge: React.FC<EmailCardLargeProps> = ({
  context,
  settings = DEFAULT_EMAIL_CARD_SETTINGS,
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();

  // Use the consolidated email hook
  const {
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
    refresh,
    // AI Demo Mode data
    aiEnhancedEmails,
    aiCardSummary,
    aiInsights,
  } = useEmailCard(context, settings, dataMode, aiDemoMode);

  // Selected item state
  const [selectedItem, setSelectedItem] = useState<IEmailCardItem | undefined>(undefined);

  // AI Onboarding dialog state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if we should show onboarding when AI mode is enabled
  // Small delay ensures the component is fully mounted before showing dialog
  useEffect(() => {
    if (aiDemoMode) {
      const dismissed = localStorage.getItem(AI_ONBOARDING_KEY);
      if (!dismissed) {
        // Small delay to ensure smooth rendering
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      setShowOnboarding(false);
    }
    return undefined;
  }, [aiDemoMode]);

  // Handle onboarding close
  const handleOnboardingClose = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Handle "Don't show again"
  const handleDontShowAgain = useCallback((checked: boolean) => {
    if (checked) {
      localStorage.setItem(AI_ONBOARDING_KEY, 'true');
    }
  }, []);

  // Menu state for sort/filter
  const [checkedSortValues, setCheckedSortValues] = useState<Record<string, string[]>>({
    sort: [sortMode],
  });
  const [checkedFilterValues, setCheckedFilterValues] = useState<Record<string, string[]>>({
    filter: [],
  });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  // Handle sort change
  const handleSortChange = useCallback((newSort: EmailSortMode) => {
    setSortMode(newSort);
    setCheckedSortValues({ sort: [newSort] });
  }, [setSortMode]);

  // Handle filter change
  const handleFilterChange = useCallback((filterKeys: string[]) => {
    const newFilters: IEmailFilters = {
      vip: filterKeys.includes('vip'),
      flagged: filterKeys.includes('flagged'),
      unread: filterKeys.includes('unread'),
      hasAttachments: filterKeys.includes('hasAttachments'),
      highPriority: filterKeys.includes('highPriority'),
    };
    setFilters(newFilters);
    setCheckedFilterValues({ filter: filterKeys });
  }, [setFilters]);

  // Select first item when tab or filter changes
  React.useEffect(() => {
    if (displayEmails.length > 0) {
      setSelectedItem(displayEmails[0]);
    } else {
      setSelectedItem(undefined);
    }
  }, [activeTab, displayEmails.length]);

  // Get total count for current tab
  const totalCount = useMemo(() => {
    if (!data) return 0;
    switch (activeTab) {
      case 'unread': return data.stats.unreadCount;
      case 'flagged': return data.stats.activeFlagsCount;
      case 'vip': return data.stats.vipTotalCount;
      case 'urgent': return data.stats.urgentCount;
      default: return 0;
    }
  }, [data, activeTab]);

  // Tab icon for header
  const headerIcon = useMemo(() => {
    switch (activeTab) {
      case 'flagged': return <Flag24Regular />;
      case 'vip': return <Crown20Filled style={{ color: tokens.colorPaletteYellowForeground1, fontSize: '24px' }} />;
      case 'urgent': return <AlertUrgent24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />;
      default: return <Mail24Regular />;
    }
  }, [activeTab]);

  // Get item key
  const getItemKey = (item: IEmailCardItem): string => item.id;

  // Get AI data for a specific email item
  const getAIDataForItem = useCallback((itemId: string) => {
    if (!aiDemoMode || !aiEnhancedEmails) return undefined;
    return aiEnhancedEmails.find(e => e.item.id === itemId);
  }, [aiDemoMode, aiEnhancedEmails]);

  // Render master item - Clean, minimal design
  const renderMasterItem = (item: IEmailCardItem, _isSelected: boolean): React.ReactNode => {
    const now = new Date();
    const diffMs = now.getTime() - item.receivedDateTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const aiData = getAIDataForItem(item.id);

    // Determine the primary status to show (only one, prioritized)
    const getPrimaryStatus = (): { icon: React.ReactNode; className: string; label: string } | null => {
      // AI insight takes priority if in AI mode
      if (aiDemoMode && aiData && aiData.aiInsights && aiData.aiInsights.length > 0) {
        const isUrgent = aiData.aiPriority === 'critical' || aiData.aiPriority === 'high';
        return {
          icon: <AIBadge label={isUrgent ? '!' : 'AI'} tooltip={aiData.aiInsights[0]?.title} size="small" />,
          className: '',
          label: '',
        };
      }
      // High importance
      if (item.importance === 'high') {
        return {
          icon: <AlertUrgent20Regular className={styles.masterStatusIcon} />,
          className: styles.masterStatusUrgent,
          label: 'Urgent',
        };
      }
      // VIP sender
      if (item.isVip) {
        return {
          icon: <Crown20Filled className={styles.masterStatusIcon} />,
          className: styles.masterStatusVip,
          label: 'VIP',
        };
      }
      // Flagged
      if (item.isFlagged) {
        return {
          icon: <Flag20Filled className={styles.masterStatusIcon} />,
          className: styles.masterStatusFlagged,
          label: 'Flagged',
        };
      }
      return null;
    };

    const primaryStatus = getPrimaryStatus();
    const hasAttachments = item.hasAttachments && item.attachments && item.attachments.length > 0;
    const attachmentCount = hasAttachments ? item.attachments!.length : 0;

    return (
      <div className={styles.masterItem}>
        {/* Unread indicator dot */}
        {!item.isRead && <div className={styles.unreadDot} />}

        <Avatar
          name={item.from.name}
          size={28}
        />
        <div className={styles.emailInfo}>
          {/* Sender name + time row */}
          <div className={styles.senderRow}>
            <span className={mergeClasses(
              styles.senderName,
              !item.isRead && styles.senderNameUnread
            )}>
              {item.from.name}
            </span>
            <span className={styles.timeText}>
              {formatAge(diffHours)}
            </span>
          </div>

          {/* Subject line */}
          <Text className={mergeClasses(
            styles.emailSubject,
            !item.isRead && styles.emailSubjectUnread
          )}>
            {item.subject}
          </Text>

          {/* Status row - only shown if there's something to display */}
          {(primaryStatus || hasAttachments) && (
            <div className={styles.masterStatusRow}>
              {/* Primary status indicator */}
              {primaryStatus && (
                <span className={mergeClasses(styles.masterStatusIndicator, primaryStatus.className)}>
                  {primaryStatus.icon}
                  {primaryStatus.label && <span>{primaryStatus.label}</span>}
                </span>
              )}

              {/* Attachment count (if any) */}
              {hasAttachments && (
                <span className={styles.attachmentBadge}>
                  <Attach20Regular style={{ fontSize: '10px' }} />
                  {attachmentCount > 1 && attachmentCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (item: IEmailCardItem): React.ReactNode => {
    // Get AI data for this item
    const aiData = getAIDataForItem(item.id);

    return (
      <div className={styles.detailContainer}>
        {/* AI Insights Panel (detailed view for selected item) */}
        {aiDemoMode && aiData && ((aiData.aiInsights && aiData.aiInsights.length > 0) || aiData.aiSuggestion) && (
          <AIInsightsPanel
            insights={aiData.aiInsights || []}
            suggestion={aiData.aiSuggestion}
            maxItems={4}
          />
        )}

        {/* Subject and Status Icons */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{item.subject}</Text>
          <div className={styles.statusIconRow}>
            {/* AI Score (if available) */}
            {aiDemoMode && aiData && aiData.aiScore && (
              <AIScore score={aiData.aiScore} priority={aiData.aiPriority} />
            )}
            {!item.isRead && (
              <Tooltip content="Unread" relationship="label" showDelay={500}>
                <span className={mergeClasses(styles.statusIcon, styles.statusIconUnread)}>
                  <Mail20Filled />
                </span>
              </Tooltip>
            )}
            {item.isVip && (
              <Tooltip content="VIP Contact" relationship="label" showDelay={500}>
                <span className={mergeClasses(styles.statusIcon, styles.statusIconVip)}>
                  <Crown20Filled />
                </span>
              </Tooltip>
            )}
            {item.importance === 'high' && (
              <Tooltip content="High Priority" relationship="label" showDelay={500}>
                <span className={mergeClasses(styles.statusIcon, styles.statusIconUrgent)}>
                  <AlertUrgent20Filled />
                </span>
              </Tooltip>
            )}
            {item.isFlagged && (
              <Tooltip content="Flagged" relationship="label" showDelay={500}>
                <span className={mergeClasses(styles.statusIcon, styles.statusIconFlagged)}>
                  <Flag20Filled />
                </span>
              </Tooltip>
            )}
            {item.hasAttachments && (
              <Tooltip content="Has Attachments" relationship="label" showDelay={500}>
                <span className={mergeClasses(styles.statusIcon, styles.statusIconAttachment)}>
                  <Attach20Regular />
                </span>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Sender Info */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>From</Text>
          <div className={styles.senderInfo}>
            <Avatar
              name={item.from.name}
              size={40}
            />
            <div className={styles.senderDetails}>
              <div className={styles.senderNameRow}>
                <Text weight="semibold">{item.from.name}</Text>
                {item.isVip && <Crown20Filled className={styles.vipIcon} />}
              </div>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                {item.from.email}
              </Text>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Received</Text>
          <div className={styles.detailRow}>
            <Clock24Regular className={styles.detailIcon} />
            <span>{formatDateFull(item.receivedDateTime)}</span>
          </div>
        </div>

        {/* Attachments Section */}
        {item.hasAttachments && item.attachments && item.attachments.length > 0 && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>
              Attachments ({item.attachments.length})
            </Text>
            <div className={styles.attachmentList}>
              {item.attachments.filter(att => !att.isInline).map((attachment) => (
                <div key={attachment.id} className={styles.attachmentItem}>
                  <div className={styles.attachmentInfo}>
                    <DocumentRegular className={styles.attachmentIcon} />
                    <div className={styles.attachmentDetails}>
                      <span className={styles.attachmentName}>{attachment.name}</span>
                      <span className={styles.attachmentSize}>{formatFileSize(attachment.size)}</span>
                    </div>
                  </div>
                  {attachment.contentUrl && (
                    <a
                      href={attachment.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.attachmentLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowDownload20Regular />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Preview */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Preview</Text>
          <div className={styles.previewContent}>
            {item.bodyPreview || 'No preview available'}
          </div>
        </div>
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (item: IEmailCardItem): React.ReactNode => {
    return (
      <>
        <Tooltip content="Reply" relationship="label">
          <Button
            appearance="primary"
            icon={<ArrowReply20Regular />}
            className={styles.actionButton}
            onClick={() => {
              // Open reply in Outlook
              window.open(`${item.webLink}&action=reply`, '_blank', 'noopener,noreferrer');
            }}
          />
        </Tooltip>
        <Tooltip content="Forward" relationship="label">
          <Button
            appearance="secondary"
            icon={<ArrowForward20Regular />}
            className={styles.actionButton}
            onClick={() => {
              // Open forward in Outlook
              window.open(`${item.webLink}&action=forward`, '_blank', 'noopener,noreferrer');
            }}
          />
        </Tooltip>
        {item.isFlagged ? (
          <Tooltip content="Remove flag" relationship="label">
            <Button
              appearance="secondary"
              icon={<FlagOff20Regular />}
              className={styles.actionButton}
              onClick={() => {
                // TODO: Implement unflag functionality
                console.log('Unflag email:', item.id);
              }}
            />
          </Tooltip>
        ) : (
          <Tooltip content="Flag" relationship="label">
            <Button
              appearance="secondary"
              icon={<Flag20Regular />}
              className={styles.actionButton}
              onClick={() => {
                // TODO: Implement flag functionality
                console.log('Flag email:', item.id);
              }}
            />
          </Tooltip>
        )}
        <Tooltip content="Open in Outlook" relationship="label">
          <Button
            appearance="secondary"
            icon={<Open20Regular />}
            className={styles.actionButton}
            onClick={() => window.open(item.webLink, '_blank', 'noopener,noreferrer')}
          />
        </Tooltip>
      </>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <Mail24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select an email to view details</Text>
      </>
    );
  };

  // Render empty state (no emails)
  const renderEmptyState = (): React.ReactNode => {
    switch (activeTab) {
      case 'unread':
        return (
          <>
            <Mail24Regular className={styles.emptyIcon} />
            <Text className={styles.emptyText}>Inbox zero!</Text>
            <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
              No unread emails in your inbox
            </Text>
          </>
        );
      case 'flagged':
        return (
          <>
            <Flag24Regular className={styles.emptyIcon} />
            <Text className={styles.emptyText}>No flagged emails</Text>
            <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
              Flag emails to follow up on them later
            </Text>
          </>
        );
      case 'vip':
        return (
          <>
            <Crown20Filled className={styles.emptyIcon} style={{ color: tokens.colorPaletteYellowForeground1 }} />
            <Text className={styles.emptyText}>No VIP emails</Text>
            <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
              Emails from your manager and key contacts will appear here
            </Text>
          </>
        );
      case 'urgent':
        return (
          <>
            <AlertUrgent24Regular className={styles.emptyIcon} style={{ color: tokens.colorPaletteRedForeground1 }} />
            <Text className={styles.emptyText}>No urgent emails</Text>
            <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
              High importance emails will appear here
            </Text>
          </>
        );
      default:
        return (
          <>
            <Mail24Regular className={styles.emptyIcon} />
            <Text className={styles.emptyText}>No emails</Text>
          </>
        );
    }
  };

  // Get empty message based on tab
  const emptyMessage = useMemo(() => {
    switch (activeTab) {
      case 'unread': return 'No unread emails';
      case 'flagged': return 'No flagged emails';
      case 'vip': return 'No VIP emails';
      case 'urgent': return 'No urgent emails';
      default: return 'No emails';
    }
  }, [activeTab]);

  // Get empty icon based on tab
  const emptyIcon = useMemo(() => {
    switch (activeTab) {
      case 'flagged': return <Flag24Regular />;
      case 'vip': return <Crown20Filled style={{ color: tokens.colorPaletteYellowForeground1 }} />;
      case 'urgent': return <AlertUrgent24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />;
      default: return <Mail24Regular />;
    }
  }, [activeTab]);

  return (
    <>
      {/* AI Onboarding Dialog */}
      <AIOnboardingDialog
        open={showOnboarding}
        onClose={handleOnboardingClose}
        onDontShowAgain={handleDontShowAgain}
      />

      <MasterDetailCard
        items={displayEmails}
        selectedItem={selectedItem}
        onItemSelect={setSelectedItem}
        getItemKey={getItemKey}
        renderMasterItem={renderMasterItem}
        renderDetailContent={renderDetailContent}
        renderDetailActions={renderDetailActions}
        renderEmptyDetail={renderEmptyDetail}
        renderEmptyState={renderEmptyState}
        icon={headerIcon}
        title="Email"
        itemCount={totalCount}
        loading={isLoading && !data}
        error={error?.message}
        emptyMessage={emptyMessage}
        emptyIcon={emptyIcon}
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
          <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
        </div>
      }
      headerContent={
        <>
          {/* AI Insight Banner (same as medium card) - with info icon for onboarding */}
          {aiDemoMode && aiCardSummary && aiInsights && aiInsights.length > 0 && (
            <div style={{ padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}` }}>
              <AIInsightBanner
                summary={aiCardSummary}
                insights={aiInsights}
                defaultExpanded={false}
                onLearnMore={() => setShowOnboarding(true)}
              />
            </div>
          )}

          {/* View Mode Tabs + Sort/Filter */}
          <div className={styles.tabSection}>
            <TabList
              selectedValue={activeTab}
              onTabSelect={(_, d) => setActiveTab(d.value as EmailTabType)}
              size="small"
            >
              <Tab value="unread">
                Unread ({data?.stats.unreadCount ?? 0})
              </Tab>
              <Tab value="flagged">
                Flagged ({data?.stats.activeFlagsCount ?? 0})
              </Tab>
              <Tab value="vip" icon={<Crown20Filled className={styles.vipIcon} />}>
                VIPs ({data?.stats.vipTotalCount ?? 0})
              </Tab>
              <Tab value="urgent" icon={<AlertUrgent20Regular style={{ color: tokens.colorPaletteRedForeground1 }} />}>
                Urgent ({data?.stats.urgentCount ?? 0})
              </Tab>
            </TabList>
            {/* Toolbar: Sort + Filter */}
            <div className={styles.tabToolbar}>
              {/* Sort Menu */}
              <Menu
                checkedValues={checkedSortValues}
                onCheckedValueChange={(_, menuData) => {
                  if (menuData.checkedItems.length > 0) {
                    handleSortChange(menuData.checkedItems[0] as EmailSortMode);
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
                      <MenuItemRadio name="sort" value="sender">
                        Sender A-Z
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
                  <Tooltip content={activeFilterCount > 0 ? `${activeFilterCount} filter(s) active` : 'Filter'} relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Filter20Regular />}
                      className={activeFilterCount > 0 ? styles.filterActive : undefined}
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
                      <MenuItemCheckbox name="filter" value="flagged">
                        Flagged
                      </MenuItemCheckbox>
                      <MenuItemCheckbox name="filter" value="unread">
                        Unread
                      </MenuItemCheckbox>
                      <MenuItemCheckbox name="filter" value="hasAttachments">
                        Has attachments
                      </MenuItemCheckbox>
                      <MenuItemCheckbox name="filter" value="highPriority">
                        High priority
                      </MenuItemCheckbox>
                    </MenuGroup>
                    {activeFilterCount > 0 && (
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
        </>
      }
      />
    </>
  );
};

export default EmailCardLarge;
