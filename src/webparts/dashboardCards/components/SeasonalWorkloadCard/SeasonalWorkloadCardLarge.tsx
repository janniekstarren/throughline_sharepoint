// ============================================
// SeasonalWorkloadCardLarge - Large card variant
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
  CalendarPatternRegular,
  ArrowClockwiseRegular,
  Open16Regular,
  CalendarLtr20Regular,
  Mail20Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { SeasonalPeriod } from '../../models/SeasonalWorkload';
import { useSeasonalWorkload } from '../../hooks/useSeasonalWorkload';
import { DataMode } from '../../services/testData';

export interface SeasonalWorkloadCardLargeProps {
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
  masterTitleCurrent: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
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
  scoreComparison: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  scoreItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXXS,
    flex: 1,
  },
  scoreLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: '24px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
  },
  annotationText: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    fontStyle: 'italic',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  yoySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  yoyRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
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

const getWorkloadColor = (score: number): 'danger' | 'warning' | 'success' => {
  if (score > 75) return 'danger';
  if (score >= 50) return 'warning';
  return 'success';
};

// ============================================
// Component
// ============================================

export const SeasonalWorkloadCardLarge: React.FC<SeasonalWorkloadCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedMonth, setSelectedMonth] = React.useState<SeasonalPeriod | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useSeasonalWorkload({ dataMode });

  // Use months as-is (already in chronological order)
  const months = React.useMemo(() => {
    if (!data) return [];
    return data.months;
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [months.length]);

  // Find year-over-year data for a given month
  const getYoYData = React.useCallback((monthLabel: string) => {
    if (!data?.yearOverYearComparison) return undefined;
    return data.yearOverYearComparison.find(y => y.month === monthLabel);
  }, [data]);

  // Render master list item
  const renderMasterItem = (month: SeasonalPeriod, _isSelected: boolean): React.ReactNode => {
    const isCurrent = data ? data.months.indexOf(month) === data.currentMonth : false;

    return (
      <div className={styles.masterItem}>
        <div className={styles.masterInfo}>
          <Text className={isCurrent ? styles.masterTitleCurrent : styles.masterTitle}>
            {month.monthLabel}
          </Text>
          <div className={styles.masterMeta}>
            <span>Score: {month.predictedWorkloadScore}</span>
            {month.isUpcoming && <span>Upcoming</span>}
          </div>
        </div>
        <div className={styles.masterRight}>
          {isCurrent && (
            <Badge appearance="filled" color="brand" size="small">
              Current
            </Badge>
          )}
          {month.isPeak && (
            <Badge appearance="tint" color="danger" size="small">
              Peak
            </Badge>
          )}
          <Badge
            appearance="outline"
            color={getWorkloadColor(month.predictedWorkloadScore)}
            size="small"
          >
            {month.predictedWorkloadScore}
          </Badge>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (month: SeasonalPeriod): React.ReactNode => {
    const isCurrent = data ? data.months.indexOf(month) === data.currentMonth : false;
    const yoyData = getYoYData(month.monthLabel);

    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{month.monthLabel}</Text>
          <div className={styles.badgeRow}>
            {isCurrent && (
              <Badge appearance="filled" color="brand">
                Current Month
              </Badge>
            )}
            {month.isPeak && (
              <Badge appearance="filled" color="danger">
                Peak Period
              </Badge>
            )}
            {month.isUpcoming && (
              <Badge appearance="tint" color="informative">
                Upcoming
              </Badge>
            )}
          </div>
        </div>

        {/* Historical Averages */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Historical Averages</Text>
          <div className={styles.detailRow}>
            <CalendarLtr20Regular className={styles.detailIcon} />
            <span>Avg Meeting Hours: {month.historicalAvgMeetingHours.toFixed(1)}h</span>
          </div>
          <div className={styles.detailRow}>
            <Mail20Regular className={styles.detailIcon} />
            <span>Avg Email Volume: {month.historicalAvgEmailVolume}</span>
          </div>
        </div>

        {/* Workload Scores */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Workload Scores</Text>
          <div className={styles.scoreComparison}>
            <div className={styles.scoreItem}>
              <Text className={styles.scoreLabel}>Historical</Text>
              <Text className={styles.scoreValue}>{month.historicalWorkloadScore}</Text>
            </div>
            <div className={styles.scoreItem}>
              <Text className={styles.scoreLabel}>Predicted</Text>
              <Text className={styles.scoreValue} style={{
                color: month.predictedWorkloadScore > 75
                  ? tokens.colorPaletteRedForeground1
                  : month.predictedWorkloadScore > 50
                  ? tokens.colorPaletteYellowForeground1
                  : tokens.colorPaletteGreenForeground1,
              }}>
                {month.predictedWorkloadScore}
              </Text>
            </div>
          </div>
        </div>

        {/* Annotation */}
        {month.annotation && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>Notes</Text>
            <Text className={styles.annotationText}>{month.annotation}</Text>
          </div>
        )}

        {/* Year-over-Year Comparison */}
        {yoyData && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>Year-over-Year</Text>
            <div className={styles.yoySection}>
              <div className={styles.yoyRow}>
                <span>This Year</span>
                <Badge
                  appearance="tint"
                  color={getWorkloadColor(yoyData.thisYear)}
                  size="small"
                >
                  {yoyData.thisYear}
                </Badge>
              </div>
              <div className={styles.yoyRow}>
                <span>Last Year</span>
                <Badge
                  appearance="outline"
                  color="informative"
                  size="small"
                >
                  {yoyData.lastYear}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (month: SeasonalPeriod): React.ReactNode => {
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
        <CalendarPatternRegular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a month to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <CalendarPatternRegular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No seasonal data</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          Workload pattern data will appear once enough history is collected
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<SeasonalPeriod>
      items={months}
      selectedItem={selectedMonth}
      onItemSelect={setSelectedMonth}
      getItemKey={(m) => m.monthLabel}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<CalendarPatternRegular />}
      title="Seasonal Patterns"
      itemCount={data?.months.length ?? 0}
      loading={isLoading}
      error={error?.message}
      emptyMessage="No seasonal data available"
      emptyIcon={<CalendarPatternRegular />}
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

export default SeasonalWorkloadCardLarge;
