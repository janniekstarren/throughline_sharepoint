// ============================================
// TopItemsList - Reusable top 3 items section
// ============================================

import * as React from 'react';
import {
  Text,
  Badge,
  Avatar,
  tokens,
  makeStyles,
  mergeClasses,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    padding: `0 ${tokens.spacingHorizontalL}`,
    paddingBottom: tokens.spacingVerticalL,
  },
  header: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: tokens.spacingVerticalS,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  itemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
  },
  itemSubtitle: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badgeContainer: {
    flexShrink: 0,
  },
});

export type BadgeColor = 'informative' | 'brand' | 'success' | 'warning' | 'danger' | 'important';

export interface TopItem {
  /** Unique identifier */
  id: string;
  /** Primary text to display */
  title: string;
  /** Secondary text (optional) */
  subtitle?: string;
  /** Icon to display (optional, mutually exclusive with avatar) */
  icon?: React.ReactNode;
  /** Avatar props (optional, mutually exclusive with icon) */
  avatar?: {
    name: string;
    image?: string;
  };
  /** Badge text (optional) */
  badge?: string;
  /** Badge color */
  badgeColor?: BadgeColor;
  /** Click handler */
  onClick?: () => void;
}

export interface TopItemsListProps {
  /** Section header text */
  header: string;
  /** Array of items to display (max 3) */
  items: TopItem[];
  /** Optional custom className */
  className?: string;
  /** Max items to show (default: 3) */
  maxItems?: number;
}

export const TopItemsList: React.FC<TopItemsListProps> = ({
  header,
  items,
  className,
  maxItems = 3,
}) => {
  const styles = useStyles();
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <div className={mergeClasses(styles.container, className)}>
      <Text className={styles.header}>{header}</Text>
      <div className={styles.list}>
        {displayItems.map((item) => (
          <div
            key={item.id}
            className={styles.itemRow}
            onClick={item.onClick}
            role={item.onClick ? 'button' : undefined}
            tabIndex={item.onClick ? 0 : undefined}
            onKeyDown={
              item.onClick
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      item.onClick?.();
                    }
                  }
                : undefined
            }
          >
            {item.avatar ? (
              <Avatar
                name={item.avatar.name}
                image={item.avatar.image ? { src: item.avatar.image } : undefined}
                size={24}
              />
            ) : item.icon ? (
              <span className={styles.itemIcon}>{item.icon}</span>
            ) : null}

            <div className={styles.itemContent}>
              <Text className={styles.itemTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text className={styles.itemSubtitle}>{item.subtitle}</Text>
              )}
            </div>

            {item.badge && (
              <div className={styles.badgeContainer}>
                <Badge
                  appearance="tint"
                  color={item.badgeColor || 'informative'}
                  size="small"
                >
                  {item.badge}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopItemsList;
