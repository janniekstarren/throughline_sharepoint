// ============================================
// PeakProductivityCardLarge - Large card variant
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
  DataTrending24Regular,
  ArrowClockwiseRegular,
  Clock20Regular,
  Mail20Regular,
  Document20Regular,
  TaskListSquareLtr20Regular,
  Alert20Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { HourlyProductivity } from '../../models/PeakProductivity';
import { usePeakProductivity } from '../../hooks/usePeakProductivity';
import { DataMode } from '../../services/testData';

export interface PeakProductivityCardLargeProps {
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
  hourIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.colorNeutralBackground1,
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
  splitBar: {
    display: 'flex',
    height: '12px',
    borderRadius: tokens.borderRadiusSmall,
    overflow: 'hidden',
    gap: '2px',
    marginTop: tokens.spacingVerticalXS,
  },
  splitBarSegment: {
    height: '100%',
    borderRadius: tokens.borderRadiusSmall,
  },
  splitLegend: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXS,
  },
  legendDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    marginRight: tokens.spacingHorizontalXS,
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

const formatHour = (hour: number): string => {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

const getScoreColor = (score: number): 'success' | 'warning' | 'danger' | 'informative' => {
  if (score >= 80) return 'success';
  if (score >= 50) return 'informative';
  if (score >= 30) return 'warning';
  return 'danger';
};

const getScoreBackgroundColor = (score: number): string => {
  if (score >= 80) return tokens.colorPaletteGreenBackground2;
  if (score >= 50) return tokens.colorBrandBackground2;
  if (score >= 30) return tokens.colorPaletteYellowBackground2;
  return tokens.colorPaletteRedBackground2;
};

// ============================================
// Component
// ============================================

export const PeakProductivityCardLarge: React.FC<PeakProductivityCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedHour, setSelectedHour] = React.useState<HourlyProductivity | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = usePeakProductivity({ dataMode });

  // Sort hours by productivity score descending
  const sortedHours = React.useMemo(() => {
    if (!data) return [];
    return [...data.hourlyProfile].sort((a, b) => b.productivityScore - a.productivityScore);
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (sortedHours.length > 0 && !selectedHour) {
      setSelectedHour(sortedHours[0]);
    }
  }, [sortedHours.length]);

  // Render master list item
  const renderMasterItem = (hour: HourlyProductivity, _isSelected: boolean): React.ReactNode => {
    const totalMinutes = hour.meetingMinutes + hour.focusMinutes;
    const meetingPct = totalMinutes > 0 ? Math.round((hour.meetingMinutes / totalMinutes) * 100) : 0;

    return (
      <div className={styles.masterItem}>
        <div
          className={styles.hourIcon}
          style={{ backgroundColor: getScoreBackgroundColor(hour.productivityScore) }}
        >
          {hour.hour}
        </div>
        <div className={styles.masterInfo}>
          <Text className={styles.masterTitle}>{formatHour(hour.hour)}</Text>
          <div className={styles.masterMeta}>
            <span>Score: {Math.round(hour.productivityScore)}</span>
            <span>Meetings: {meetingPct}%</span>
          </div>
        </div>
        <div className={styles.masterRight}>
          {hour.isPeakHour && (
            <Badge appearance="tint" color="success" size="small">
              Peak
            </Badge>
          )}
          {hour.isMeetingHeavy && (
            <Badge appearance="tint" color="warning" size="small">
              Meetings
            </Badge>
          )}
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (hour: HourlyProductivity): React.ReactNode => {
    const totalMinutes = hour.meetingMinutes + hour.focusMinutes;
    const meetingPct = totalMinutes > 0 ? (hour.meetingMinutes / totalMinutes) * 100 : 0;
    const focusPct = 100 - meetingPct;

    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{formatHour(hour.hour)}</Text>
          <div className={styles.badgeRow}>
            <Badge appearance="filled" color={getScoreColor(hour.productivityScore)}>
              Score: {Math.round(hour.productivityScore)}/100
            </Badge>
            {hour.isPeakHour && (
              <Badge appearance="tint" color="success">
                Peak Hour
              </Badge>
            )}
            {hour.isMeetingHeavy && (
              <Badge appearance="tint" color="warning">
                Meeting Heavy
              </Badge>
            )}
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Activity Breakdown</Text>
          <div className={styles.detailRow}>
            <TaskListSquareLtr20Regular className={styles.detailIcon} />
            <span>Tasks Completed: {hour.tasksCompleted}</span>
          </div>
          <div className={styles.detailRow}>
            <Mail20Regular className={styles.detailIcon} />
            <span>Emails Sent: {hour.emailsSent}</span>
          </div>
          <div className={styles.detailRow}>
            <Document20Regular className={styles.detailIcon} />
            <span>Files Edited: {hour.filesEdited}</span>
          </div>
        </div>

        {/* Meeting/Focus Split */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Time Split</Text>
          <div className={styles.detailRow}>
            <Clock20Regular className={styles.detailIcon} />
            <span>Meeting: {hour.meetingMinutes}min / Focus: {hour.focusMinutes}min</span>
          </div>
          <div className={styles.splitBar}>
            <div
              className={styles.splitBarSegment}
              style={{
                width: `${meetingPct}%`,
                backgroundColor: tokens.colorPaletteYellowForeground1,
              }}
            />
            <div
              className={styles.splitBarSegment}
              style={{
                width: `${focusPct}%`,
                backgroundColor: tokens.colorBrandForeground1,
              }}
            />
          </div>
          <div className={styles.splitLegend}>
            <span>
              <span className={styles.legendDot} style={{ backgroundColor: tokens.colorPaletteYellowForeground1 }} />
              Meetings ({Math.round(meetingPct)}%)
            </span>
            <span>
              <span className={styles.legendDot} style={{ backgroundColor: tokens.colorBrandForeground1 }} />
              Focus ({Math.round(focusPct)}%)
            </span>
          </div>
        </div>

        {/* Misalignment */}
        {hour.misalignmentScore > 0 && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>Misalignment</Text>
            <div className={styles.detailRow}>
              <Alert20Regular className={styles.detailIcon} />
              <span>Misalignment Score: {Math.round(hour.misalignmentScore)}/10</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (_hour: HourlyProductivity): React.ReactNode => {
    return null;
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <DataTrending24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select an hour to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <DataTrending24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No productivity data</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          Productivity patterns will appear here once data is available
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<HourlyProductivity>
      items={sortedHours}
      selectedItem={selectedHour}
      onItemSelect={setSelectedHour}
      getItemKey={(h) => String(h.hour)}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<DataTrending24Regular />}
      title="Peak Productivity"
      itemCount={data?.stats.peakHours.length ?? 0}
      loading={isLoading}
      error={error?.message}
      emptyMessage="No productivity data"
      emptyIcon={<DataTrending24Regular />}
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

export default PeakProductivityCardLarge;
