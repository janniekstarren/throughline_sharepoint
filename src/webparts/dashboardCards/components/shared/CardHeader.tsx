// ============================================
// CardHeader - Shared card header component
// Consistent header with icon, title, badge, and actions
// ============================================

import * as React from 'react';
import { Text, mergeClasses, Tooltip, Button } from '@fluentui/react-components';
import { ArrowExpand20Regular } from '@fluentui/react-icons';
import { useCardStyles } from '../cardStyles';
import { useCardExpand } from '../CardExpandContext';

export type BadgeVariant = 'brand' | 'warning' | 'danger' | 'success';

export interface ICardHeaderProps {
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Card title */
  title: string;
  /** Card ID for expand functionality (uses context when provided) */
  cardId?: string;
  /** Badge content (e.g., count) */
  badge?: string | number;
  /** Badge variant for coloring */
  badgeVariant?: BadgeVariant;
  /** Action buttons/menu to display on the right */
  actions?: React.ReactNode;
  /** Callback to expand card (overrides context behavior) */
  onExpand?: () => void;
  /** Hide the expand button even when context is available */
  hideExpand?: boolean;
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
  cardId,
  badge,
  badgeVariant = 'brand',
  actions,
  onExpand,
  hideExpand = false,
  subtle = false,
  className,
  iconWrapperStyle,
  iconStyle,
}) => {
  const styles = useCardStyles();
  const cardExpandContext = useCardExpand();
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  // Determine the expand handler - prefer explicit onExpand, then context
  const handleExpand = React.useMemo(() => {
    if (hideExpand) return undefined;
    if (onExpand) return onExpand;
    if (cardExpandContext && cardId) {
      return () => cardExpandContext.expandCard(cardId);
    }
    return undefined;
  }, [hideExpand, onExpand, cardExpandContext, cardId]);

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
    <div
      className={mergeClasses(styles.cardHeader, subtle && styles.cardHeaderSubtle, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
      {(actions || handleExpand) && (
        <div className={styles.cardHeaderActions}>
          {actions}
          {handleExpand && (
            <Tooltip content="Expand" relationship="label">
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowExpand20Regular />}
                className={mergeClasses(
                  styles.cardExpandButton,
                  isHovered && styles.cardExpandButtonVisible
                )}
                onClick={handleExpand}
                aria-label="Expand card"
              />
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};

export default CardHeader;
