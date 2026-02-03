import * as React from 'react';
import {
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
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { useCardStyles, CardEnter, ListItemEnter } from './cardStyles';

export interface ISiteActivityCardProps {
  activities: ISiteActivity[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}


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
  const styles = useCardStyles();

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
    <CardEnter visible={true}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconWrapper}>
            <Pulse24Regular className={styles.cardIcon} />
          </div>
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
            <div className={styles.emptyState}>
              <History24Regular className={styles.emptyIcon} />
              <Text>No recent activity</Text>
            </div>
          ) : (
            <div className={styles.itemList}>
              {activities.map((activity, index) => (
                <ListItemEnter key={activity.id} visible={true}>
                  <div style={{ animationDelay: `${index * 50}ms` }}>
                    <ItemHoverCard
                      item={activity}
                      itemType="activity"
                      onAction={onAction}
                      theme={theme}
                    >
                      <div
                        className={styles.item}
                        role="button"
                        tabIndex={0}
                        style={{ alignItems: 'flex-start' }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          backgroundColor: `${getActionColor(activity.action)}20`
                        }}>
                          <ActionIcon action={activity.action} color={getActionColor(activity.action)} />
                        </div>
                        <div className={styles.itemContent}>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', lineHeight: '1.4' }}>
                            <Body1 style={{ fontWeight: 600, color: tokens.colorNeutralForeground1 }}>{activity.actor}</Body1>
                            <Caption1 className={styles.itemMeta}>{activity.action}</Caption1>
                            <Body1 className={styles.itemTitle}>{activity.itemName}</Body1>
                          </div>
                          <Caption1 className={styles.itemMeta} style={{ marginTop: '2px' }}>
                            {formatTime(activity.timestamp)}
                          </Caption1>
                        </div>
                      </div>
                    </ItemHoverCard>
                  </div>
                </ListItemEnter>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardEnter>
  );
};

export default SiteActivityCard;
