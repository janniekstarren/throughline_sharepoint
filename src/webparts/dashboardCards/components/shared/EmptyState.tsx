// ============================================
// EmptyState - Shared empty state component
// Consistent empty state display across all cards
// ============================================

import * as React from 'react';
import { Text, Button, mergeClasses } from '@fluentui/react-components';
import { Box24Regular } from '@fluentui/react-icons';
import { useCardStyles } from '../cardStyles';

export interface IEmptyStateProps {
  /** Icon to display (defaults to Box24Regular) */
  icon?: React.ReactNode;
  /** Main message/title */
  title?: string;
  /** Secondary descriptive message */
  description?: string;
  /** Action button text */
  actionText?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Additional class name */
  className?: string;
  /** Compact variant with less padding */
  compact?: boolean;
}

export const EmptyState: React.FC<IEmptyStateProps> = ({
  icon,
  title = 'No items',
  description,
  actionText,
  onAction,
  className,
  compact = false,
}) => {
  const styles = useCardStyles();

  return (
    <div
      className={mergeClasses(styles.emptyState, className)}
      style={compact ? { padding: '20px 16px' } : undefined}
    >
      <span className={styles.emptyIcon}>
        {icon || <Box24Regular />}
      </span>
      {title && (
        <Text className={styles.emptyTitle}>
          {title}
        </Text>
      )}
      {description && (
        <Text className={styles.emptyDescription}>
          {description}
        </Text>
      )}
      {actionText && onAction && (
        <Button
          appearance="primary"
          size="small"
          onClick={onAction}
          style={{ marginTop: '8px' }}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
