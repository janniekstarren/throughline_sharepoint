// ============================================
// SiteActivityCardLarge - Large card with filtering
// Master-detail layout with activity filtering by actor
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Tooltip,
  Avatar,
  Badge,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import {
  History24Regular,
  ArrowClockwiseRegular,
  
  Document24Regular,
  Edit24Regular,
  Share24Regular,
  Delete24Regular,
  Add24Regular,
  Rename24Regular,
  ArrowMove24Regular,
  ArrowUndo24Regular,
  Comment24Regular,
  Clock24Regular,
  Open24Regular,
  Filter24Regular,
} from '@fluentui/react-icons';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { ActivityItem, SiteActivityData } from '../../models/SiteActivity';

export interface ISiteActivityCardLargeProps {
  /** Activity data */
  data: SiteActivityData | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error?: string;
  /** Callback when an activity item is clicked */
  onActivityClick?: (activity: ActivityItem) => void;
  /** Callback to refresh data */
  onRefresh?: () => void;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
  /** Card title override */
  title?: string;
}

const useStyles = makeStyles({
  // Filter bar styles
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  filterDropdown: {
    minWidth: '180px',
  },
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
  },
  actionIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  activityInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  activityAction: {
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  activityMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
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
  actionBadge: {
    alignSelf: 'flex-start',
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.3,
    wordBreak: 'break-word',
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
  detailRowIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
  },
  actorSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingHorizontalM,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  actorInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  actorName: {
    fontSize: '14px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
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

/**
 * Get icon for activity action type (24px size)
 */
const getActionIcon = (action: string): React.ReactElement => {
  switch (action.toLowerCase()) {
    case 'created':
      return <Add24Regular />;
    case 'edited':
    case 'modified':
      return <Edit24Regular />;
    case 'deleted':
      return <Delete24Regular />;
    case 'shared':
      return <Share24Regular />;
    case 'moved':
      return <ArrowMove24Regular />;
    case 'renamed':
      return <Rename24Regular />;
    case 'restored':
      return <ArrowUndo24Regular />;
    case 'commented':
    case 'commented on':
      return <Comment24Regular />;
    default:
      return <Document24Regular />;
  }
};

/**
 * Get styling for activity action type
 */
interface ActionStyle {
  icon: React.ReactElement;
  backgroundColor: string;
  foregroundColor: string;
  badgeColor: 'success' | 'informative' | 'danger' | 'warning' | 'important' | 'subtle';
}

const getActionStyle = (action: string): ActionStyle => {
  const actionLower = action.toLowerCase();

  switch (actionLower) {
    case 'created':
      return {
        icon: getActionIcon(action),
        backgroundColor: tokens.colorPaletteGreenBackground2,
        foregroundColor: tokens.colorPaletteGreenForeground1,
        badgeColor: 'success',
      };
    case 'edited':
    case 'modified':
      return {
        icon: getActionIcon(action),
        backgroundColor: tokens.colorPaletteBlueBackground2,
        foregroundColor: tokens.colorPaletteBlueForeground2,
        badgeColor: 'informative',
      };
    case 'deleted':
      return {
        icon: getActionIcon(action),
        backgroundColor: tokens.colorPaletteRedBackground2,
        foregroundColor: tokens.colorPaletteRedForeground1,
        badgeColor: 'danger',
      };
    case 'shared':
      return {
        icon: getActionIcon(action),
        backgroundColor: tokens.colorPalettePurpleBackground2,
        foregroundColor: tokens.colorPalettePurpleForeground2,
        badgeColor: 'important',
      };
    case 'moved':
      return {
        icon: getActionIcon(action),
        backgroundColor: tokens.colorPaletteYellowBackground2,
        foregroundColor: tokens.colorPaletteYellowForeground2,
        badgeColor: 'warning',
      };
    case 'renamed':
      return {
        icon: getActionIcon(action),
        backgroundColor: tokens.colorPaletteBlueBackground2,
        foregroundColor: tokens.colorPaletteBlueForeground2,
        badgeColor: 'informative',
      };
    case 'restored':
      return {
        icon: getActionIcon(action),
        backgroundColor: tokens.colorPaletteGreenBackground2,
        foregroundColor: tokens.colorPaletteGreenForeground1,
        badgeColor: 'success',
      };
    case 'commented':
    case 'commented on':
      return {
        icon: getActionIcon(action),
        backgroundColor: tokens.colorPaletteTealBackground2,
        foregroundColor: tokens.colorPaletteTealForeground2,
        badgeColor: 'informative',
      };
    default:
      return {
        icon: getActionIcon(action),
        backgroundColor: tokens.colorNeutralBackground3,
        foregroundColor: tokens.colorNeutralForeground2,
        badgeColor: 'subtle',
      };
  }
};

/**
 * Format relative timestamp
 */
const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Format full date for detail panel
 */
const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Get action display text (capitalize first letter)
 */
const getActionText = (action: string): string => {
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
};

export const SiteActivityCardLarge: React.FC<ISiteActivityCardLargeProps> = ({
  data,
  loading,
  error,
  onActivityClick,
  onRefresh,
  onSizeChange,
  title = 'Site Activity',
}) => {
  const styles = useStyles();
  const [selectedActivity, setSelectedActivity] = React.useState<ActivityItem | undefined>(undefined);
  const [actorFilter, setActorFilter] = React.useState<string>('all');

  // Get unique actors for filter dropdown
  const actors = React.useMemo(() => {
    if (!data) return [];
    return Object.keys(data.byActor).sort();
  }, [data]);

  // Filter activities based on selected actor
  const filteredActivities = React.useMemo(() => {
    if (!data) return [];
    if (actorFilter === 'all') {
      return [...data.activities].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    }
    return (data.byActor[actorFilter] || []).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [data, actorFilter]);

  // Auto-select first activity when activities load
  React.useEffect(() => {
    if (filteredActivities.length > 0 && !selectedActivity) {
      setSelectedActivity(filteredActivities[0]);
    }
  }, [filteredActivities, selectedActivity]);

  // Reset selection when filter changes
  React.useEffect(() => {
    if (filteredActivities.length > 0) {
      setSelectedActivity(filteredActivities[0]);
    } else {
      setSelectedActivity(undefined);
    }
  }, [actorFilter]);

  // Handler for selecting an activity
  const handleSelectActivity = React.useCallback((activity: ActivityItem): void => {
    setSelectedActivity(activity);
  }, []);

  // Handle actor filter change
  const handleActorFilterChange = (
    _event: React.SyntheticEvent,
    option: { optionValue?: string }
  ): void => {
    setActorFilter(option.optionValue || 'all');
  };

  // Render master item (compact activity display)
  const renderMasterItem = (activity: ActivityItem, _isSelected: boolean): React.ReactNode => {
    const actionStyle = getActionStyle(activity.action);

    return (
      <div className={styles.masterItem}>
        <div
          className={styles.actionIconWrapper}
          style={{
            backgroundColor: actionStyle.backgroundColor,
            color: actionStyle.foregroundColor,
          }}
        >
          {React.cloneElement(actionStyle.icon, { style: { fontSize: '16px' } })}
        </div>
        <div className={styles.activityInfo}>
          <Text
            className={styles.activityAction}
            style={{ color: actionStyle.foregroundColor }}
          >
            {activity.action}
          </Text>
          <Text className={styles.activityMeta}>
            {activity.itemName} by {activity.actor} - {formatRelativeDate(activity.timestamp)}
          </Text>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (activity: ActivityItem): React.ReactNode => {
    const actionStyle = getActionStyle(activity.action);

    return (
      <div className={styles.detailContainer}>
        {/* Activity Header */}
        <div className={styles.detailHeader}>
          <Badge
            appearance="filled"
            color={actionStyle.badgeColor}
            className={styles.actionBadge}
          >
            {getActionText(activity.action)}
          </Badge>
          <Text className={styles.detailTitle}>{activity.itemName}</Text>
        </div>

        {/* Activity Details Section */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Activity Details</Text>
          <div className={styles.detailRow}>
            {actionStyle.icon}
            <span>Action: {getActionText(activity.action)}</span>
          </div>
          <div className={styles.detailRow}>
            <Clock24Regular className={styles.detailRowIcon} />
            <span>When: {formatFullDate(activity.timestamp)}</span>
          </div>
        </div>

        {/* Actor Section */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Performed By</Text>
          <div className={styles.actorSection}>
            <Avatar
              name={activity.actor}
              image={activity.actorPhotoUrl ? { src: activity.actorPhotoUrl } : undefined}
              size={40}
              color="brand"
            />
            <div className={styles.actorInfo}>
              <Text className={styles.actorName}>{activity.actor}</Text>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (activity: ActivityItem): React.ReactNode => {
    const handleOpenClick = (): void => {
      if (onActivityClick) {
        onActivityClick(activity);
      } else if (activity.itemUrl) {
        window.open(activity.itemUrl, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <>
        {activity.itemUrl && (
          <Button
            appearance="primary"
            icon={<Open24Regular />}
            onClick={handleOpenClick}
          >
            View Item
          </Button>
        )}
      </>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <History24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select an activity to view details</Text>
      </>
    );
  };

  // Render empty state (no activities)
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <History24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No recent activity</Text>
      </>
    );
  };

  // Header actions
  const headerActions = (
    <>
      {onRefresh && (
        <Tooltip content="Refresh" relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowClockwiseRegular />}
            onClick={onRefresh}
            aria-label="Refresh activities"
          />
        </Tooltip>
      )}
      <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
    </>
  );

  // Filter bar content (placed above the master-detail split)
  const filterContent = actors.length > 1 ? (
    <div className={styles.filterBar}>
      <div className={styles.filterLabel}>
        <Filter24Regular style={{ fontSize: '16px' }} />
        <span>Filter by:</span>
      </div>
      <Dropdown
        className={styles.filterDropdown}
        value={actorFilter === 'all' ? 'All actors' : actorFilter}
        onOptionSelect={handleActorFilterChange}
        size="small"
      >
        <Option value="all">All actors</Option>
        {actors.map((actor) => (
          <Option key={actor} value={actor}>
            {actor}
          </Option>
        ))}
      </Dropdown>
    </div>
  ) : undefined;

  return (
    <MasterDetailCard
      items={filteredActivities}
      selectedItem={selectedActivity}
      onItemSelect={handleSelectActivity}
      getItemKey={(activity: ActivityItem) => activity.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<History24Regular />}
      title={title}
      itemCount={filteredActivities.length}
      loading={loading}
      error={error}
      emptyMessage="No recent activity"
      emptyIcon={<History24Regular />}
      headerActions={headerActions}
      headerContent={filterContent}
    />
  );
};

export default SiteActivityCardLarge;
