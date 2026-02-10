// ============================================
// MeetingCreepCardLarge - Large card variant
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
} from '@fluentui/react-components';
import {
  CalendarAdd24Regular,
  ArrowClockwiseRegular,
  Open16Regular,
  Clock20Regular,
  People20Regular,
  CalendarLtr20Regular,
  ArrowTrendingLines20Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { MeetingCreepMonth } from '../../models/MeetingCreep';
import { useMeetingCreep } from '../../hooks/useMeetingCreep';
import { DataMode } from '../../services/testData';

export interface MeetingCreepCardLargeProps {
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  masterInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  masterTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  masterMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  masterRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  growthUp: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: '11px',
    fontWeight: 500,
  },
  growthDown: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: '11px',
    fontWeight: 500,
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
  breakdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingVerticalS,
  },
  breakdownItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: 'center',
  },
  breakdownLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
  },
  breakdownValue: {
    fontSize: '20px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
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
// Helpers
// ============================================

const formatHours = (hours: number): string => {
  if (hours === Math.floor(hours)) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ============================================
// Component
// ============================================

export const MeetingCreepCardLarge: React.FC<MeetingCreepCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedMonth, setSelectedMonth] = React.useState<MeetingCreepMonth | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useMeetingCreep({ dataMode });

  // Sort months chronologically (most recent first)
  const sortedMonths = React.useMemo(() => {
    if (!data) return [];
    return [...data.months].reverse();
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (sortedMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(sortedMonths[0]);
    }
  }, [sortedMonths.length]);

  // Compute growth indicator for a month relative to original order
  const getMonthGrowth = React.useCallback((month: MeetingCreepMonth): number | undefined => {
    if (!data) return undefined;
    const originalIndex = data.months.indexOf(month);
    if (originalIndex <= 0) return undefined;
    const prev = data.months[originalIndex - 1];
    if (prev.totalMeetingHours === 0) return undefined;
    return ((month.totalMeetingHours - prev.totalMeetingHours) / prev.totalMeetingHours) * 100;
  }, [data]);

  // Render master list item
  const renderMasterItem = (month: MeetingCreepMonth, _isSelected: boolean): React.ReactNode => {
    const growth = getMonthGrowth(month);

    return (
      <div className={styles.masterItem}>
        <div className={styles.masterInfo}>
          <Text className={styles.masterTitle}>{month.month}</Text>
          <div className={styles.masterMeta}>
            <span>{formatHours(month.totalMeetingHours)}</span>
            <span>{month.meetingCount} meetings</span>
          </div>
        </div>
        <div className={styles.masterRight}>
          {growth !== undefined && (
            <span className={growth > 0 ? styles.growthUp : styles.growthDown}>
              {growth > 0 ? '+' : ''}{Math.round(growth)}%
            </span>
          )}
          <Badge
            appearance="outline"
            color="informative"
            size="small"
          >
            {formatHours(month.totalMeetingHours)}
          </Badge>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (month: MeetingCreepMonth): React.ReactNode => {
    const growth = getMonthGrowth(month);

    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{month.month}</Text>
          <div className={styles.badgeRow}>
            <Badge appearance="filled" color="brand">
              {formatHours(month.totalMeetingHours)} total
            </Badge>
            <Badge appearance="tint" color="informative">
              {month.meetingCount} meetings
            </Badge>
            {growth !== undefined && (
              <Badge
                appearance="tint"
                color={growth > 30 ? 'danger' : growth > 15 ? 'warning' : growth < 0 ? 'success' : 'informative'}
              >
                {growth > 0 ? '+' : ''}{Math.round(growth)}% growth
              </Badge>
            )}
          </div>
        </div>

        {/* Meeting Breakdown */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Meeting Breakdown</Text>
          <div className={styles.breakdownGrid}>
            <div className={styles.breakdownItem}>
              <Text className={styles.breakdownLabel}>Recurring</Text>
              <Text className={styles.breakdownValue}>{formatHours(month.recurringHours)}</Text>
            </div>
            <div className={styles.breakdownItem}>
              <Text className={styles.breakdownLabel}>Ad-hoc</Text>
              <Text className={styles.breakdownValue}>{formatHours(month.adhocHours)}</Text>
            </div>
            <div className={styles.breakdownItem}>
              <Text className={styles.breakdownLabel}>1:1</Text>
              <Text className={styles.breakdownValue}>{formatHours(month.oneOnOneHours)}</Text>
            </div>
            <div className={styles.breakdownItem}>
              <Text className={styles.breakdownLabel}>Group</Text>
              <Text className={styles.breakdownValue}>{formatHours(month.groupMeetingHours)}</Text>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Details</Text>
          <div className={styles.detailRow}>
            <Clock20Regular className={styles.detailIcon} />
            <span>Avg Duration: {formatDuration(month.avgMeetingDuration)}</span>
          </div>
          <div className={styles.detailRow}>
            <CalendarLtr20Regular className={styles.detailIcon} />
            <span>Meeting Count: {month.meetingCount}</span>
          </div>
          <div className={styles.detailRow}>
            <People20Regular className={styles.detailIcon} />
            <span>Avg Attendees: {month.attendeeAvg.toFixed(1)}</span>
          </div>
          <div className={styles.detailRow}>
            <ArrowTrendingLines20Regular className={styles.detailIcon} />
            <span>Total Hours: {formatHours(month.totalMeetingHours)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (month: MeetingCreepMonth): React.ReactNode => {
    return (
      <Tooltip content="View in calendar" relationship="label">
        <Button
          appearance="primary"
          icon={<Open16Regular />}
        >
          View Calendar
        </Button>
      </Tooltip>
    );
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <CalendarAdd24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a month to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <CalendarAdd24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No meeting data</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          Meeting trend data will appear once calendar history is available
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<MeetingCreepMonth>
      items={sortedMonths}
      selectedItem={selectedMonth}
      onItemSelect={setSelectedMonth}
      getItemKey={(m) => m.month}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<CalendarAdd24Regular />}
      title="Meeting Creep"
      itemCount={data?.months.length ?? 0}
      loading={isLoading}
      error={error?.message}
      emptyMessage="No meeting trend data"
      emptyIcon={<CalendarAdd24Regular />}
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
          <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
        </div>
      }
    />
  );
};

export default MeetingCreepCardLarge;
