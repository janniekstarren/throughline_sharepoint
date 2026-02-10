// ============================================
// AfterHoursFootprintCardLarge - Large card variant
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
  WeatherMoon24Regular,
  ArrowClockwiseRegular,
  Clock20Regular,
  Mail20Regular,
  Chat20Regular,
  Document20Regular,
  CalendarLtr20Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { AfterHoursDay } from '../../models/AfterHoursFootprint';
import { useAfterHours } from '../../hooks/useAfterHours';
import { DataMode } from '../../services/testData';

export interface AfterHoursFootprintCardLargeProps {
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
  dayIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralBackground1,
    fontSize: '16px',
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
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  activityRight: {
    marginLeft: 'auto',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
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

const formatMinutesToHours = (minutes: number): string => {
  if (minutes < 60) return `${minutes} minutes`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hour${hrs > 1 ? 's' : ''}`;
};

const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getSeverityColor = (minutes: number): 'danger' | 'warning' | 'informative' => {
  if (minutes >= 120) return 'danger';
  if (minutes >= 60) return 'warning';
  return 'informative';
};

const getSeverityBackgroundColor = (minutes: number): string => {
  if (minutes >= 120) return tokens.colorPaletteRedBackground2;
  if (minutes >= 60) return tokens.colorPaletteYellowBackground2;
  return tokens.colorBrandBackground2;
};

const getActivityIcon = (type: 'email' | 'teams' | 'file'): React.ReactElement => {
  switch (type) {
    case 'email': return <Mail20Regular />;
    case 'teams': return <Chat20Regular />;
    case 'file': return <Document20Regular />;
    default: return <Document20Regular />;
  }
};

const getActivityLabel = (type: 'email' | 'teams' | 'file'): string => {
  switch (type) {
    case 'email': return 'Emails';
    case 'teams': return 'Teams Messages';
    case 'file': return 'File Edits';
    default: return type;
  }
};

// ============================================
// Component
// ============================================

export const AfterHoursFootprintCardLarge: React.FC<AfterHoursFootprintCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedDay, setSelectedDay] = React.useState<AfterHoursDay | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useAfterHours({ dataMode });

  // Sort days by date descending
  const sortedDays = React.useMemo(() => {
    if (!data) return [];
    return [...data.days].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (sortedDays.length > 0 && !selectedDay) {
      setSelectedDay(sortedDays[0]);
    }
  }, [sortedDays.length]);

  // Render master list item
  const renderMasterItem = (day: AfterHoursDay, _isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        <div
          className={styles.dayIcon}
          style={{ backgroundColor: getSeverityBackgroundColor(day.afterHoursMinutes) }}
        >
          <WeatherMoon24Regular />
        </div>
        <div className={styles.masterInfo}>
          <Text className={styles.masterTitle}>{day.dayLabel}</Text>
          <div className={styles.masterMeta}>
            <span>{formatMinutesToHours(day.afterHoursMinutes)}</span>
          </div>
        </div>
        <div className={styles.masterRight}>
          {day.isWeekend && (
            <Badge appearance="tint" color="danger" size="small">
              Weekend
            </Badge>
          )}
          <Badge
            appearance="tint"
            color={getSeverityColor(day.afterHoursMinutes)}
            size="small"
          >
            {formatMinutesToHours(day.afterHoursMinutes)}
          </Badge>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (day: AfterHoursDay): React.ReactNode => {
    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{formatDateFull(day.date)}</Text>
          <div className={styles.badgeRow}>
            <Badge
              appearance="filled"
              color={getSeverityColor(day.afterHoursMinutes)}
            >
              {formatMinutesToHours(day.afterHoursMinutes)} after hours
            </Badge>
            {day.isWeekend && (
              <Badge appearance="filled" color="danger">
                Weekend Work
              </Badge>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Duration</Text>
          <div className={styles.detailRow}>
            <Clock20Regular className={styles.detailIcon} />
            <span>Total after-hours: {formatMinutesToHours(day.afterHoursMinutes)}</span>
          </div>
          <div className={styles.detailRow}>
            <CalendarLtr20Regular className={styles.detailIcon} />
            <span>{day.isWeekend ? 'Weekend day' : 'Weekday'}</span>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Activity Breakdown</Text>
          {day.activities.length > 0 ? (
            day.activities.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                {React.cloneElement(getActivityIcon(activity.type), { className: styles.detailIcon })}
                <span>{getActivityLabel(activity.type)}: {activity.count}</span>
                <span className={styles.activityRight}>
                  Last at {activity.latestTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.detailRow}>
              <span>No activity details available</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (_day: AfterHoursDay): React.ReactNode => {
    return null;
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <WeatherMoon24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a day to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <WeatherMoon24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No after-hours activity</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          Great job maintaining work-life balance!
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<AfterHoursDay>
      items={sortedDays}
      selectedItem={selectedDay}
      onItemSelect={setSelectedDay}
      getItemKey={(d) => d.date.toISOString()}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<WeatherMoon24Regular />}
      title="After Hours Footprint"
      itemCount={data?.days.length ?? 0}
      loading={isLoading}
      error={error?.message}
      emptyMessage="No after-hours activity"
      emptyIcon={<WeatherMoon24Regular />}
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

export default AfterHoursFootprintCardLarge;
