// ============================================
// SiteActivityCard - Displays recent site activity
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  tokens,
  Caption1,
  Body1,
  Theme,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  Pulse24Regular,
  History24Regular,
  Add16Regular,
  Edit16Regular,
  Delete16Regular,
  Share16Regular,
  FolderArrowRight16Regular,
  Rename16Regular,
  ArrowCounterclockwise16Regular,
  Comment16Regular,
  ArrowExpand20Regular,
} from '@fluentui/react-icons';
import { ISiteActivity } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { BaseCard, CardHeader, EmptyState } from './shared';
import { useCardStyles } from './cardStyles';

export interface ISiteActivityCardProps {
  activities: ISiteActivity[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
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

export const SiteActivityCard: React.FC<ISiteActivityCardProps> = ({
  activities,
  loading,
  error,
  onAction,
  theme,
  title,
  onToggleSize,
}) => {
  const styles = useCardStyles();

  // Expand button for switching to large card view
  const expandButton = onToggleSize ? (
    <Tooltip content="Expand to detailed view" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowExpand20Regular />}
        onClick={onToggleSize}
        aria-label="Expand card"
      />
    </Tooltip>
  ) : undefined;

  const getActionColor = (action: string): string => {
    const colorMap: Record<string, string> = {
      'created': tokens.colorPaletteGreenForeground1,
      'edited': tokens.colorBrandForeground1,
      'deleted': tokens.colorPaletteRedForeground1,
      'shared': tokens.colorPalettePurpleForeground2,
      'moved': tokens.colorPaletteYellowForeground1,
      'renamed': tokens.colorBrandForeground1,
      'restored': tokens.colorPaletteGreenForeground1,
      'commented on': tokens.colorBrandForeground1,
      'modified': tokens.colorBrandForeground1,
    };
    return colorMap[action] || tokens.colorBrandForeground1;
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

  // Empty state
  if (!loading && !error && activities.length === 0) {
    return (
      <BaseCard testId="site-activity-card">
        <CardHeader
          icon={<Pulse24Regular />}
          title={title || 'Site Activity'}
          cardId="siteActivity"
          actions={expandButton}
        />
        <EmptyState
          icon={<History24Regular />}
          title="No recent activity"
          description="Activity will appear here as it happens"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={loading}
      error={error}
      loadingMessage="Loading activity..."
      testId="site-activity-card"
    >
      <CardHeader
        icon={<Pulse24Regular />}
        title={title || 'Site Activity'}
        cardId="siteActivity"
        badge={activities.length > 0 ? activities.length : undefined}
        actions={expandButton}
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div className={styles.itemList}>
            {activities.map(activity => (
              <ItemHoverCard
                key={activity.id}
                item={activity}
                itemType="activity"
                onAction={onAction}
                theme={theme}
              >
                <div
                  className={styles.item}
                  role="button"
                  tabIndex={0}
                  style={{ alignItems: 'flex-start', gap: tokens.spacingHorizontalS }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: tokens.borderRadiusCircular,
                    flexShrink: 0,
                    backgroundColor: `${getActionColor(activity.action)}20`
                  }}>
                    <ActionIcon action={activity.action} color={getActionColor(activity.action)} />
                  </div>
                  <div className={styles.itemContent}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '2px 4px',
                      lineHeight: '1.4'
                    }}>
                      <Body1 style={{
                        fontWeight: tokens.fontWeightSemibold,
                        color: tokens.colorNeutralForeground1,
                        whiteSpace: 'nowrap'
                      }}>
                        {activity.actor}
                      </Body1>
                      <Caption1 style={{
                        color: tokens.colorNeutralForeground3,
                        whiteSpace: 'nowrap'
                      }}>
                        {activity.action}
                      </Caption1>
                      <Body1 style={{
                        color: tokens.colorNeutralForeground1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: '1 1 0',
                        minWidth: 0
                      }}>
                        {activity.itemName}
                      </Body1>
                    </div>
                    <Caption1 style={{
                      marginTop: tokens.spacingVerticalXS,
                      color: tokens.colorNeutralForeground3
                    }}>
                      {formatTime(activity.timestamp)}
                    </Caption1>
                  </div>
                </div>
              </ItemHoverCard>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </BaseCard>
  );
};

export default SiteActivityCard;
