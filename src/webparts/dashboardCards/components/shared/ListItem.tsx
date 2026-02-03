// ============================================
// ListItem - Shared list item component
// Generic list item for emails, files, tasks, events, etc.
// ============================================

import * as React from 'react';
import { Text, Avatar, mergeClasses } from '@fluentui/react-components';
import { useCardStyles, ListItemEnter } from '../cardStyles';

export type ListItemHighlight = 'none' | 'brand' | 'warning' | 'error' | 'success';

export interface IListItemProps {
  /** Icon element (will be wrapped in icon container) */
  icon?: React.ReactNode;
  /** Avatar image URL (alternative to icon) */
  avatarUrl?: string;
  /** Avatar initials (if no image) */
  avatarInitials?: string;
  /** Avatar name for aria-label */
  avatarName?: string;
  /** Primary text/title */
  title: string;
  /** Secondary text/subtitle */
  subtitle?: string;
  /** Metadata text (small, uppercase) */
  meta?: string;
  /** Right-side content (time, badge, etc.) */
  trailing?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Href for link behavior */
  href?: string;
  /** Highlight variant */
  highlight?: ListItemHighlight;
  /** Compact variant with less padding */
  compact?: boolean;
  /** Additional class name */
  className?: string;
  /** Animate entrance */
  animate?: boolean;
  /** Custom icon wrapper style */
  iconWrapperStyle?: React.CSSProperties;
  /** Allow subtitle to wrap to multiple lines */
  multilineSubtitle?: boolean;
  /** Test ID for testing */
  testId?: string;
}

export const ListItem: React.FC<IListItemProps> = ({
  icon,
  avatarUrl,
  avatarInitials,
  avatarName,
  title,
  subtitle,
  meta,
  trailing,
  onClick,
  href,
  highlight = 'none',
  compact = false,
  className,
  animate = false,
  iconWrapperStyle,
  multilineSubtitle = false,
  testId,
}) => {
  const styles = useCardStyles();

  const getHighlightClass = (): string => {
    switch (highlight) {
      case 'brand':
        return styles.itemHighlight;
      case 'warning':
        return mergeClasses(styles.itemHighlight, styles.itemHighlightWarning);
      case 'error':
        return mergeClasses(styles.itemHighlight, styles.itemHighlightError);
      case 'success':
        return mergeClasses(styles.itemHighlight, styles.itemHighlightSuccess);
      default:
        return '';
    }
  };

  const itemClass = mergeClasses(
    styles.item,
    compact && styles.itemCompact,
    getHighlightClass(),
    className
  );

  const content = (
    <>
      {/* Icon or Avatar */}
      {icon && (
        <div
          className={mergeClasses(styles.itemIcon, compact && styles.itemIconSmall)}
          style={iconWrapperStyle}
        >
          {icon}
        </div>
      )}
      {!icon && (avatarUrl || avatarInitials) && (
        <Avatar
          image={avatarUrl ? { src: avatarUrl } : undefined}
          name={avatarName || avatarInitials}
          initials={avatarInitials}
          size={compact ? 28 : 36}
          className={styles.avatar}
        />
      )}

      {/* Content */}
      <div className={styles.itemContent}>
        <Text className={styles.itemTitle} title={title}>
          {title}
        </Text>
        {subtitle && (
          <Text
            className={mergeClasses(
              styles.itemSubtitle,
              multilineSubtitle && styles.itemSubtitleMultiline
            )}
            title={subtitle}
          >
            {subtitle}
          </Text>
        )}
        {meta && (
          <Text className={styles.itemMeta}>
            {meta}
          </Text>
        )}
      </div>

      {/* Trailing content */}
      {trailing && (
        <div style={{ flexShrink: 0, marginLeft: 'auto' }}>
          {trailing}
        </div>
      )}
    </>
  );

  // Render as link if href provided
  if (href) {
    const linkElement = (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={itemClass}
        data-testid={testId}
      >
        {content}
      </a>
    );

    return animate ? (
      <ListItemEnter visible>{linkElement}</ListItemEnter>
    ) : linkElement;
  }

  // Render as button if onClick provided
  if (onClick) {
    const buttonElement = (
      <button
        type="button"
        onClick={onClick}
        className={itemClass}
        data-testid={testId}
      >
        {content}
      </button>
    );

    return animate ? (
      <ListItemEnter visible>{buttonElement}</ListItemEnter>
    ) : buttonElement;
  }

  // Render as div
  const divElement = (
    <div className={itemClass} data-testid={testId}>
      {content}
    </div>
  );

  return animate ? (
    <ListItemEnter visible>{divElement}</ListItemEnter>
  ) : divElement;
};

export default ListItem;
