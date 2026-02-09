// ============================================
// ContextSwitchingCardLarge - Context Switching Card (Large View)
// Master-detail layout with tabs: Timeline | Focus Sessions
// With focus score, hourly chart, and detailed switch info
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
  TabList,
  Tab,
  Badge,
} from '@fluentui/react-components';
import {
  BrainCircuitRegular,
  ArrowClockwiseRegular,
  TimelineRegular,
  TargetRegular,
  MailRegular,
  ChatRegular,
  PeopleRegular,
  VideoRegular,
  DocumentRegular,
  CalendarLtrRegular,
  Clock20Regular,
  Timer20Regular,
} from '@fluentui/react-icons';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import {
  ContextSwitchingData,
  ContextSwitchingSettings,
  DEFAULT_CONTEXT_SWITCHING_SETTINGS,
  ContextSwitch,
  ContextType,
  getContextTypeColor,
} from '../../models/ContextSwitching';
import { DataMode } from '../../services/testData';
import { getTestContextSwitchingData } from '../../services/testData/contextSwitching';
import { getAllContextSwitchingInsights } from '../../services/testData/aiDemoData';
import { ContextSwitchingService } from '../../services/ContextSwitchingService';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { FocusScoreCircle, HourlyChart } from './components';
import { AIInsightsPanel } from '../shared/AIComponents';

// ============================================
// Types
// ============================================

type MasterTabType = 'timeline' | 'focus';

interface FocusSession {
  id: string;
  type: ContextType;
  name: string;
  startTime: Date;
  duration: number; // in minutes
  isActive?: boolean;
}

interface ContextSwitchingCardLargeProps {
  graphClient?: MSGraphClientV3;
  dataMode?: DataMode;
  settings?: ContextSwitchingSettings;
  title?: string;
  /** AI Demo Mode - show AI-enhanced content (only when dataMode === 'test') */
  aiDemoMode?: boolean;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  // Tab section
  tabSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    position: 'relative',
  },
  contextIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    flexShrink: 0,
  },
  switchInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  switchName: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  },
  switchTime: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  switchMeta: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  // Focus session styles
  focusDuration: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  activeBadge: {
    marginLeft: tokens.spacingHorizontalXS,
  },
  // Detail content styles
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  detailIconLarge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadiusLarge,
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: tokens.spacingVerticalXS,
  },
  detailMeta: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  // Stats section
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
  },
  statLabel: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  // Overview content
  overviewSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalL,
  },
  chartContainer: {
    width: '100%',
    marginTop: tokens.spacingVerticalM,
  },
});

// ============================================
// Helper Functions
// ============================================

// Get icon for context type
const getContextIcon = (type: ContextType, size: 'small' | 'large' = 'small'): React.ReactElement => {
  const iconSize = size === 'large' ? '24px' : '16px';
  const iconProps = { style: { fontSize: iconSize } };

  switch (type) {
    case 'email':
      return <MailRegular {...iconProps} />;
    case 'teams-chat':
      return <ChatRegular {...iconProps} />;
    case 'teams-channel':
      return <PeopleRegular {...iconProps} />;
    case 'meeting':
      return <VideoRegular {...iconProps} />;
    case 'file':
      return <DocumentRegular {...iconProps} />;
    case 'calendar':
      return <CalendarLtrRegular {...iconProps} />;
    default:
      return <TargetRegular {...iconProps} />;
  }
};

// Format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
};

// Format duration
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Calculate focus sessions from switches
const calculateFocusSessions = (switches: ContextSwitch[]): FocusSession[] => {
  if (switches.length === 0) return [];

  const sessions: FocusSession[] = [];

  // Sort by time descending (most recent first)
  const sortedSwitches = [...switches].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  sortedSwitches.forEach((switchItem, index) => {
    const isFirst = index === 0;
    const nextSwitch = sortedSwitches[index + 1];

    // Calculate duration to next switch (or mark as active if first)
    let duration = 0;
    if (nextSwitch) {
      duration = Math.floor(
        (new Date(switchItem.timestamp).getTime() - new Date(nextSwitch.timestamp).getTime()) / 60000
      );
    }

    // Only include sessions >= 5 minutes
    if (duration >= 5 || isFirst) {
      sessions.push({
        id: `session-${index}`,
        type: switchItem.contextType,
        name: switchItem.contextName,
        startTime: new Date(switchItem.timestamp),
        duration: duration || 0,
        isActive: isFirst,
      });
    }
  });

  return sessions;
};

// ============================================
// Component
// ============================================

export const ContextSwitchingCardLarge: React.FC<ContextSwitchingCardLargeProps> = ({
  graphClient,
  dataMode = 'api',
  settings = DEFAULT_CONTEXT_SWITCHING_SETTINGS,
  title = 'Context Switching',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();

  // State
  const [data, setData] = useState<ContextSwitchingData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [masterTab, setMasterTab] = useState<MasterTabType>('timeline');
  const [selectedSwitch, setSelectedSwitch] = useState<ContextSwitch | undefined>(undefined);
  const [selectedFocusSession, setSelectedFocusSession] = useState<FocusSession | undefined>(undefined);

  // Service ref
  const serviceRef = React.useRef<ContextSwitchingService | undefined>(undefined);

  // Initialize service when graphClient is available
  useEffect(() => {
    if (graphClient && dataMode === 'api') {
      serviceRef.current = new ContextSwitchingService(graphClient, 'me', settings);
    }
  }, [graphClient, dataMode, settings]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      if (dataMode === 'test') {
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(getTestContextSwitchingData());
      } else if (serviceRef.current) {
        const result = await serviceRef.current.getContextSwitchingData();
        setData(result);
      } else if (graphClient) {
        const service = new ContextSwitchingService(graphClient, 'me', settings);
        serviceRef.current = service;
        const result = await service.getContextSwitchingData();
        setData(result);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(getTestContextSwitchingData());
      }
    } catch (err) {
      console.error('Failed to load context switching data:', err);
      setError('Failed to load data');
      try {
        setData(getTestContextSwitchingData());
      } catch {
        // Ignore fallback error
      }
    } finally {
      setLoading(false);
    }
  }, [dataMode, graphClient, settings]);

  // Initial load
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.clearCache();
    }
    setSelectedSwitch(undefined);
    setSelectedFocusSession(undefined);
    void loadData();
  }, [loadData]);

  // Calculate focus sessions
  const focusSessions = useMemo(() => {
    if (!data?.recentSwitches) return [];
    return calculateFocusSessions(data.recentSwitches);
  }, [data?.recentSwitches]);

  // Get items for master panel based on tab
  const masterItems = useMemo(() => {
    if (!data) return [];
    if (masterTab === 'timeline') {
      return data.recentSwitches;
    }
    return focusSessions;
  }, [data, masterTab, focusSessions]);

  // Handle item selection
  const handleItemSelect = useCallback((item: ContextSwitch | FocusSession) => {
    if (masterTab === 'timeline') {
      setSelectedSwitch(item as ContextSwitch);
      setSelectedFocusSession(undefined);
    } else {
      setSelectedFocusSession(item as FocusSession);
      setSelectedSwitch(undefined);
    }
  }, [masterTab]);

  // Get selected item
  const selectedItem = masterTab === 'timeline' ? selectedSwitch : selectedFocusSession;

  // Render master item
  const renderMasterItem = useCallback((item: ContextSwitch | FocusSession, isSelected: boolean) => {
    if (masterTab === 'timeline') {
      const switchItem = item as ContextSwitch;
      const color = getContextTypeColor(switchItem.contextType);

      return (
        <div className={styles.masterItem}>
          <div
            className={styles.contextIcon}
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {getContextIcon(switchItem.contextType)}
          </div>
          <div className={styles.switchInfo}>
            <div className={styles.switchRow}>
              <Text className={styles.switchName}>{switchItem.contextName}</Text>
              <Text className={styles.switchTime}>{formatTimeAgo(new Date(switchItem.timestamp))}</Text>
            </div>
            <div className={styles.switchMeta}>
              <Clock20Regular style={{ fontSize: '12px' }} />
              <span>{formatDuration(switchItem.duration)}</span>
            </div>
          </div>
        </div>
      );
    }

    // Focus session
    const session = item as FocusSession;
    const color = getContextTypeColor(session.type);

    return (
      <div className={styles.masterItem}>
        <div
          className={styles.contextIcon}
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {getContextIcon(session.type)}
        </div>
        <div className={styles.switchInfo}>
          <div className={styles.switchRow}>
            <Text className={styles.switchName}>{session.name}</Text>
            {session.isActive && (
              <Badge appearance="filled" color="success" size="small" className={styles.activeBadge}>
                Active
              </Badge>
            )}
          </div>
          <div className={styles.focusDuration}>
            <Timer20Regular style={{ fontSize: '14px' }} />
            <span>{session.isActive ? 'In progress' : formatDuration(session.duration)}</span>
          </div>
        </div>
      </div>
    );
  }, [masterTab, styles]);

  // Render detail content for switch
  const renderSwitchDetail = useCallback((switchItem: ContextSwitch) => {
    const color = getContextTypeColor(switchItem.contextType);

    return (
      <>
        <div className={styles.detailHeader}>
          <div
            className={styles.detailIconLarge}
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {getContextIcon(switchItem.contextType, 'large')}
          </div>
          <div className={styles.detailInfo}>
            <Text className={styles.detailName}>{switchItem.contextName}</Text>
            <div className={styles.detailMeta}>
              <span>{new Date(switchItem.timestamp).toLocaleTimeString()}</span>
              <span>·</span>
              <span>{formatDuration(switchItem.duration)}</span>
            </div>
          </div>
        </div>
        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <Text className={styles.statValue}>{formatDuration(switchItem.duration)}</Text>
            <Text className={styles.statLabel}>Focus Duration</Text>
          </div>
          <div className={styles.statCard}>
            <Text className={styles.statValue}>{switchItem.contextType}</Text>
            <Text className={styles.statLabel}>Context Type</Text>
          </div>
        </div>
      </>
    );
  }, [styles]);

  // Render detail content for focus session
  const renderFocusSessionDetail = useCallback((session: FocusSession) => {
    const color = getContextTypeColor(session.type);

    return (
      <>
        <div className={styles.detailHeader}>
          <div
            className={styles.detailIconLarge}
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {getContextIcon(session.type, 'large')}
          </div>
          <div className={styles.detailInfo}>
            <Text className={styles.detailName}>
              {session.name}
              {session.isActive && (
                <Badge appearance="filled" color="success" size="small" style={{ marginLeft: '8px' }}>
                  Active
                </Badge>
              )}
            </Text>
            <div className={styles.detailMeta}>
              <span>Started {session.startTime.toLocaleTimeString()}</span>
              <span>·</span>
              <span>{session.isActive ? 'In progress' : formatDuration(session.duration)}</span>
            </div>
          </div>
        </div>
        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <Text className={styles.statValue}>
              {session.isActive ? 'Active' : formatDuration(session.duration)}
            </Text>
            <Text className={styles.statLabel}>Session Duration</Text>
          </div>
          <div className={styles.statCard}>
            <Text className={styles.statValue}>{session.type}</Text>
            <Text className={styles.statLabel}>Context Type</Text>
          </div>
        </div>
      </>
    );
  }, [styles]);

  // Render detail content
  const renderDetailContent = useCallback((item: ContextSwitch | FocusSession) => {
    if (masterTab === 'timeline') {
      return renderSwitchDetail(item as ContextSwitch);
    }
    return renderFocusSessionDetail(item as FocusSession);
  }, [masterTab, renderSwitchDetail, renderFocusSessionDetail]);

  // Render empty detail (no selection - show overview)
  const renderEmptyDetail = useCallback(() => {
    if (!data) return null;

    return (
      <div className={styles.overviewSection}>
        <FocusScoreCircle score={data.todaySummary.focusScore} />
        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <Text className={styles.statValue}>{data.todaySummary.totalSwitches}</Text>
            <Text className={styles.statLabel}>Total Switches</Text>
          </div>
          <div className={styles.statCard}>
            <Text className={styles.statValue}>{formatDuration(data.todaySummary.totalFocusTime)}</Text>
            <Text className={styles.statLabel}>Focus Time</Text>
          </div>
          <div className={styles.statCard}>
            <Text className={styles.statValue}>{data.todaySummary.avgFocusTime}m</Text>
            <Text className={styles.statLabel}>Avg Session</Text>
          </div>
          <div className={styles.statCard}>
            <Text className={styles.statValue}>{data.todaySummary.longestFocus}m</Text>
            <Text className={styles.statLabel}>Longest Focus</Text>
          </div>
        </div>
        {aiDemoMode && (
          <AIInsightsPanel
            insights={getAllContextSwitchingInsights()}
            maxItems={3}
          />
        )}
        {settings.showHourlyChart && data.hourlyData && (
          <div className={styles.chartContainer}>
            <HourlyChart data={data.hourlyData} />
          </div>
        )}
      </div>
    );
  }, [data, settings.showHourlyChart, styles, aiDemoMode]);

  // Render detail actions
  const renderDetailActions = useCallback((item: ContextSwitch | FocusSession) => {
    return (
      <>
        <Button appearance="secondary" size="small">
          View Details
        </Button>
      </>
    );
  }, []);

  // Get item key
  const getItemKey = useCallback((item: ContextSwitch | FocusSession) => {
    if ('id' in item) return item.id;
    return (item as ContextSwitch).timestamp.toString();
  }, []);

  // Header actions
  const headerActions = (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowClockwiseRegular />}
          size="small"
          onClick={handleRefresh}
          disabled={loading}
        />
      </Tooltip>
      <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
    </div>
  );

  // Header content (tabs)
  const headerContent = (
    <div className={styles.tabSection}>
      <TabList
        selectedValue={masterTab}
        onTabSelect={(_, d) => {
          setMasterTab(d.value as MasterTabType);
          setSelectedSwitch(undefined);
          setSelectedFocusSession(undefined);
        }}
        size="small"
      >
        <Tab value="timeline" icon={<TimelineRegular />}>
          Timeline
        </Tab>
        <Tab value="focus" icon={<TargetRegular />}>
          Focus Sessions
        </Tab>
      </TabList>
    </div>
  );

  return (
    <MasterDetailCard
      // Data
      items={masterItems}
      selectedItem={selectedItem}
      onItemSelect={handleItemSelect}
      getItemKey={getItemKey}
      // Rendering
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      // Header
      icon={<BrainCircuitRegular />}
      title={title}
      itemCount={masterItems.length}
      // States
      loading={loading}
      error={error}
      emptyMessage={masterTab === 'timeline' ? 'No context switches today' : 'No focus sessions today'}
      emptyIcon={<BrainCircuitRegular />}
      // Actions
      headerActions={headerActions}
      headerContent={headerContent}
    />
  );
};

export default ContextSwitchingCardLarge;
