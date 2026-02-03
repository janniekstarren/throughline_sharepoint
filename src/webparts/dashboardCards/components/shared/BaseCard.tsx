// ============================================
// BaseCard - Shared card wrapper component
// Handles loading, error, and empty states consistently
// ============================================

import * as React from 'react';
import { Spinner, Text } from '@fluentui/react-components';
import { ErrorCircle24Regular } from '@fluentui/react-icons';
import { useCardStyles, CardEnter } from '../cardStyles';
import { mergeClasses } from '@fluentui/react-components';

export interface IBaseCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Custom loading message */
  loadingMessage?: string;
  /** Additional class name for the card container */
  className?: string;
  /** Use large card variant (taller min/max height) */
  large?: boolean;
  /** Custom styles to apply to the card */
  style?: React.CSSProperties;
  /** Test ID for testing */
  testId?: string;
}

export const BaseCard: React.FC<IBaseCardProps> = ({
  children,
  loading = false,
  error,
  loadingMessage = 'Loading...',
  className,
  large = false,
  style,
  testId,
}) => {
  const styles = useCardStyles();

  // Loading state
  if (loading) {
    return (
      <div
        className={mergeClasses(styles.card, large && styles.cardLarge, className)}
        style={style}
        data-testid={testId}
      >
        <div className={styles.loadingContainer}>
          <Spinner size="medium" />
          <Text size={200} style={{ color: 'inherit' }}>
            {loadingMessage}
          </Text>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={mergeClasses(styles.card, large && styles.cardLarge, className)}
        style={style}
        data-testid={testId}
      >
        <div className={styles.errorContainer}>
          <ErrorCircle24Regular className={styles.errorIcon} />
          <Text size={200}>{error}</Text>
        </div>
      </div>
    );
  }

  // Normal state with content
  return (
    <CardEnter visible>
      <div
        className={mergeClasses(styles.card, large && styles.cardLarge, className)}
        style={style}
        data-testid={testId}
      >
        {children}
      </div>
    </CardEnter>
  );
};

export default BaseCard;
