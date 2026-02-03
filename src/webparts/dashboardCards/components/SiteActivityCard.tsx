import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  Pulse24Regular,
  ErrorCircle24Regular,
  History24Regular,
  Add16Regular,
  Edit16Regular,
  Delete16Regular,
  Share16Regular,
  FolderArrowRight16Regular,
  Rename16Regular,
  ArrowCounterclockwise16Regular,
  Comment16Regular,
} from '@fluentui/react-icons';
import { ISiteActivity } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface ISiteActivityCardProps {
  activities: ISiteActivity[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

// Fluent UI 9 styles using makeStyles and design tokens
const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    flexShrink: 0,
  },
  cardIcon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
  },
  cardTitle: {
    color: tokens.colorNeutralForeground1,
  },
  cardContent: {
    flex: 1,
    padding: tokens.spacingVerticalM,
    overflowY: 'auto',
    minHeight: 0,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalS,
  },
  errorIcon: {
    fontSize: '24px',
    color: tokens.colorPaletteRedForeground1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalS,
  },
  emptyIcon: {
    fontSize: '32px',
    color: tokens.colorNeutralForeground4,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    flex: 1,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground2,
    textDecoration: 'none',
    color: 'inherit',
    gap: tokens.spacingHorizontalS,
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
    },
  },
  activityIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  activityDescription: {
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '2px 4px',
    lineHeight: '1.4',
  },
  actor: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
  },
  action: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
  },
  itemNameText: {
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: '1 1 0',
    minWidth: 0,
  },
  activityTime: {
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
  },
});

// Action icon component
const ActionIcon: React.FC<{ action: string; color: string }> = ({ action, color }) => {
  const iconProps = { style: { color } };

  switch (action) {
    case 'created':
      return <Add16Regular {...iconProps} />;
    case 'edited':
    case 'modified':
      return <Edit16Regular {...iconProps} />;
    case 'deleted':
      return <Delete16Regular {...iconProps} />;
    case 'shared':
      return <Share16Regular {...iconProps} />;
    case 'moved':
      return <FolderArrowRight16Regular {...iconProps} />;
    case 'renamed':
      return <Rename16Regular {...iconProps} />;
    case 'restored':
      return <ArrowCounterclockwise16Regular {...iconProps} />;
    case 'commented on':
      return <Comment16Regular {...iconProps} />;
    default:
      return <Edit16Regular {...iconProps} />;
  }
};

export const SiteActivityCard: React.FC<ISiteActivityCardProps> = ({ activities, loading, error, onAction, theme, title }) => {
  const styles = useStyles();

  const getActionColor = (action: string): string => {
    const colorMap: Record<string, string> = {
      'created': '#107c10',
      'edited': '#0078d4',
      'deleted': '#d83b01',
      'shared': '#8764b8',
      'moved': '#ffb900',
      'renamed': '#0078d4',
      'restored': '#107c10',
      'commented on': '#0078d4',
      'modified': '#0078d4',
    };
    return colorMap[action] || '#0078d4';
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Pulse24Regular className={styles.cardIcon} />
        <Body1Strong className={styles.cardTitle}>{title || 'Site Activity'}</Body1Strong>
      </div>
      <div className={styles.cardContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner size="medium" />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <ErrorCircle24Regular className={styles.errorIcon} />
            <Text>{error}</Text>
          </div>
        ) : activities.length === 0 ? (
          <MotionWrapper visible={true}>
            <div className={styles.emptyState}>
              <History24Regular className={styles.emptyIcon} />
              <Text>No recent activity</Text>
            </div>
          </MotionWrapper>
        ) : (
          <MotionWrapper visible={true}>
            <div className={styles.activityList}>
              {activities.map(activity => (
                <ItemHoverCard
                  key={activity.id}
                  item={activity}
                  itemType="activity"
                  onAction={onAction}
                  theme={theme}
                >
                  <div
                    className={styles.activityItem}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className={styles.activityIcon}
                      style={{ backgroundColor: `${getActionColor(activity.action)}20` }}
                    >
                      <ActionIcon action={activity.action} color={getActionColor(activity.action)} />
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityDescription}>
                        <Body1 className={styles.actor}>{activity.actor}</Body1>
                        <Caption1 className={styles.action}>{activity.action}</Caption1>
                        <Body1 className={styles.itemNameText}>{activity.itemName}</Body1>
                      </div>
                      <Caption1 className={styles.activityTime}>
                        {formatTime(activity.timestamp)}
                      </Caption1>
                    </div>
                  </div>
                </ItemHoverCard>
              ))}
            </div>
          </MotionWrapper>
        )}
      </div>
    </div>
  );
};

export default SiteActivityCard;
