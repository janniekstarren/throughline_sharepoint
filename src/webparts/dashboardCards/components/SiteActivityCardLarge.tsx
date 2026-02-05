// ============================================
// SiteActivityCardLarge - Large card variant for Site Activity
// Master-detail layout with activity details panel
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Theme,
  Button,
  Tooltip,
  Avatar,
  Badge,
} from '@fluentui/react-components';
import {
  PeopleList24Regular,
  DocumentAdd24Regular,
  DocumentEdit24Regular,
  Delete24Regular,
  Share24Regular,
  ArrowMove24Regular,
  Rename24Regular,
  ArrowUndo24Regular,
  Comment24Regular,
  Clock24Regular,
  Open24Regular,
  Mail24Regular,
  ContractDownLeft20Regular,
} from '@fluentui/react-icons';
import { ISiteActivity } from '../services/GraphService';
import { MasterDetailCard } from './shared/MasterDetailCard';
import { HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface ISiteActivityCardLargeProps {
  activities: ISiteActivity[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

const useStyles = makeStyles({
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

// Action types and their visual styling
type ActionType = 'created' | 'edited' | 'deleted' | 'shared' | 'moved' | 'renamed' | 'restored' | 'commented';

interface ActionStyle {
  icon: React.ReactElement;
  backgroundColor: string;
  foregroundColor: string;
  badgeColor: 'success' | 'informative' | 'danger' | 'warning' | 'important' | 'subtle';
}

const getActionStyle = (action: string): ActionStyle => {
  const actionLower = action.toLowerCase() as ActionType;

  switch (actionLower) {
    case 'created':
      return {
        icon: <DocumentAdd24Regular />,
        backgroundColor: tokens.colorPaletteGreenBackground2,
        foregroundColor: tokens.colorPaletteGreenForeground1,
        badgeColor: 'success',
      };
    case 'edited':
      return {
        icon: <DocumentEdit24Regular />,
        backgroundColor: tokens.colorPaletteBlueBackground2,
        foregroundColor: tokens.colorPaletteBlueForeground2,
        badgeColor: 'informative',
      };
    case 'deleted':
      return {
        icon: <Delete24Regular />,
        backgroundColor: tokens.colorPaletteRedBackground2,
        foregroundColor: tokens.colorPaletteRedForeground1,
        badgeColor: 'danger',
      };
    case 'shared':
      return {
        icon: <Share24Regular />,
        backgroundColor: tokens.colorPalettePurpleBackground2,
        foregroundColor: tokens.colorPalettePurpleForeground2,
        badgeColor: 'important',
      };
    case 'moved':
      return {
        icon: <ArrowMove24Regular />,
        backgroundColor: tokens.colorPaletteYellowBackground2,
        foregroundColor: tokens.colorPaletteYellowForeground2,
        badgeColor: 'warning',
      };
    case 'renamed':
      return {
        icon: <Rename24Regular />,
        backgroundColor: tokens.colorPaletteBlueBackground2,
        foregroundColor: tokens.colorPaletteBlueForeground2,
        badgeColor: 'informative',
      };
    case 'restored':
      return {
        icon: <ArrowUndo24Regular />,
        backgroundColor: tokens.colorPaletteGreenBackground2,
        foregroundColor: tokens.colorPaletteGreenForeground1,
        badgeColor: 'success',
      };
    case 'commented':
      return {
        icon: <Comment24Regular />,
        backgroundColor: tokens.colorPaletteBlueBackground2,
        foregroundColor: tokens.colorPaletteBlueForeground2,
        badgeColor: 'informative',
      };
    default:
      return {
        icon: <DocumentEdit24Regular />,
        backgroundColor: tokens.colorNeutralBackground3,
        foregroundColor: tokens.colorNeutralForeground2,
        badgeColor: 'subtle',
      };
  }
};

// Format relative date
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
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Format full date for detail panel
const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Sort activities by timestamp (most recent first)
const sortActivities = (activities: ISiteActivity[]): ISiteActivity[] => {
  return [...activities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Get action display text
const getActionText = (action: string): string => {
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
};

export const SiteActivityCardLarge: React.FC<ISiteActivityCardLargeProps> = ({
  activities,
  loading,
  error,
  onAction,
  theme,
  title = 'Site Activity',
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedActivity, setSelectedActivity] = React.useState<ISiteActivity | undefined>(undefined);

  // Sort activities
  const sortedActivities = React.useMemo(() => sortActivities(activities), [activities]);

  // Handler for selecting an activity
  const handleSelectActivity = React.useCallback((activity: ISiteActivity): void => {
    setSelectedActivity(activity);
  }, []);

  // Auto-select first activity when activities load
  React.useEffect(() => {
    if (sortedActivities.length > 0 && !selectedActivity) {
      setSelectedActivity(sortedActivities[0]);
    }
  }, [sortedActivities, selectedActivity]);

  // Render master item (compact activity display)
  const renderMasterItem = (activity: ISiteActivity, isSelected: boolean): React.ReactNode => {
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
            {activity.itemName} by {activity.actor} • {formatRelativeDate(activity.timestamp)}
          </Text>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (activity: ISiteActivity): React.ReactNode => {
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
  const renderDetailActions = (activity: ISiteActivity): React.ReactNode => {
    return (
      <>
        {activity.itemUrl && (
          <Button
            appearance="primary"
            icon={<Open24Regular />}
            className={styles.actionButton}
            onClick={() => window.open(activity.itemUrl, '_blank', 'noopener,noreferrer')}
          >
            View Item
          </Button>
        )}
        <Button
          appearance="secondary"
          icon={<Mail24Regular />}
          className={styles.actionButton}
          onClick={() => {
            // Contact actor - would need their email
            console.log('Contact actor:', activity.actor);
          }}
        >
          Contact {activity.actor.split(' ')[0]}
        </Button>
      </>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <PeopleList24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select an activity to view details</Text>
      </>
    );
  };

  // Render empty state (no activities)
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <PeopleList24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No recent activity</Text>
      </>
    );
  };

  return (
    <MasterDetailCard
      items={sortedActivities}
      selectedItem={selectedActivity}
      onItemSelect={handleSelectActivity}
      getItemKey={(activity: ISiteActivity) => activity.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<PeopleList24Regular />}
      title={title}
      itemCount={sortedActivities.length}
      loading={loading}
      error={error}
      emptyMessage="No recent activity"
      emptyIcon={<PeopleList24Regular />}
      headerActions={
        onToggleSize && (
          <Tooltip content="Collapse to compact view" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<ContractDownLeft20Regular />}
              onClick={onToggleSize}
              aria-label="Collapse card"
            />
          </Tooltip>
        )
      }
    />
  );
};

export default SiteActivityCardLarge;
