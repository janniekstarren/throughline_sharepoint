// ============================================
// CardHeader - Shared card header component
// Consistent header with icon, title, badge, and actions
// ============================================

import * as React from 'react';
import { Text, mergeClasses, Tooltip } from '@fluentui/react-components';
import { useCardStyles } from '../cardStyles';

export type BadgeVariant = 'brand' | 'warning' | 'danger' | 'success';

export interface ICardHeaderProps {
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Card title */
  title: string;
  /** Badge content (e.g., count) */
  badge?: string | number;
  /** Badge variant for coloring */
  badgeVariant?: BadgeVariant;
  /** Action buttons/menu to display on the right */
  actions?: React.ReactNode;
  /** Use subtle background style */
  subtle?: boolean;
  /** Additional class name */
  className?: string;
  /** Custom icon wrapper background color */
  iconWrapperStyle?: React.CSSProperties;
  /** Custom icon color */
  iconStyle?: React.CSSProperties;
}

export const CardHeader: React.FC<ICardHeaderProps> = ({
  icon,
  title,
  badge,
  badgeVariant = 'brand',
  actions,
  subtle = false,
  className,
  iconWrapperStyle,
  iconStyle,
}) => {
  const styles = useCardStyles();
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  React.useEffect(() => {
    const checkOverflow = (): void => {
      const el = titleRef.current;
      if (el) {
        setIsOverflowing(el.scrollWidth > el.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [title]);

  const getBadgeClass = (): string => {
    switch (badgeVariant) {
      case 'warning':
        return mergeClasses(styles.badge, styles.badgeWarning);
      case 'danger':
        return mergeClasses(styles.badge, styles.badgeDanger);
      case 'success':
        return mergeClasses(styles.badge, styles.badgeSuccess);
      default:
        return styles.badge;
    }
  };

  const titleElement = (
    <Text ref={titleRef} className={styles.cardTitle} as="h3">
      {title}
    </Text>
  );

  return (
    <div className={mergeClasses(styles.cardHeader, subtle && styles.cardHeaderSubtle, className)}>
      {icon && (
        <div className={styles.cardIconWrapper} style={iconWrapperStyle}>
          <span className={styles.cardIcon} style={iconStyle}>
            {icon}
          </span>
        </div>
      )}
      {isOverflowing ? (
        <Tooltip content={title} relationship="label">
          {titleElement}
        </Tooltip>
      ) : (
        titleElement
      )}
      {badge !== undefined && badge !== null && (
        <span className={getBadgeClass()}>
          {badge}
        </span>
      )}
      {actions && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default CardHeader;
