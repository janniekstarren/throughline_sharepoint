// ============================================
// SmallCard - Compact card chip/pill variant
// Shows title, AI icon with popover, expand button
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Button,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverSurface,
} from '@fluentui/react-components';
import {
  Sparkle20Regular,
  Sparkle20Filled,
  ChevronDown20Regular,
} from '@fluentui/react-icons';

export interface ISmallCardProps {
  /** Card identifier */
  cardId: string;
  /** Card title to display */
  title: string;
  /** Card icon element */
  icon: React.ReactElement;
  /** Optional item count to show as badge */
  itemCount?: number;
  /** Whether AI demo mode is enabled */
  aiDemoMode?: boolean;
  /** AI summary text for popover */
  aiSummary?: string;
  /** AI insights list for popover */
  aiInsights?: string[];
  /** Callback when expand/cycle size is clicked */
  onCycleSize: () => void;
  /** Optional loading state */
  isLoading?: boolean;
  /** Optional error state */
  hasError?: boolean;
}

const useStyles = makeStyles({
  smallCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow2,
    cursor: 'pointer',
    transitionDuration: tokens.durationNormal,
    transitionProperty: 'background-color, box-shadow',
    minHeight: '48px',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: tokens.shadow4,
    },
  },
  smallCardLoading: {
    backgroundColor: tokens.colorNeutralBackground2,
  },
  smallCardError: {
    border: `1px solid ${tokens.colorPaletteRedForeground1}`,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
    flexShrink: 0,
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badge: {
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
    marginLeft: tokens.spacingHorizontalS,
  },
  aiButton: {
    color: tokens.colorBrandForeground1,
  },
  aiPopover: {
    padding: tokens.spacingHorizontalM,
    maxWidth: '300px',
    minWidth: '200px',
  },
  aiPopoverHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
    color: tokens.colorBrandForeground1,
  },
  aiPopoverTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  aiPopoverSummary: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground1,
    marginBottom: tokens.spacingVerticalS,
  },
  aiPopoverInsights: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  aiInsight: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    paddingLeft: tokens.spacingHorizontalS,
    borderLeft: `2px solid ${tokens.colorBrandStroke1}`,
  },
  noInsights: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },
});

export const SmallCard: React.FC<ISmallCardProps> = ({
  title,
  icon,
  itemCount,
  aiDemoMode = false,
  aiSummary,
  aiInsights = [],
  onCycleSize,
  isLoading = false,
  hasError = false,
}) => {
  const styles = useStyles();

  const handleCardClick = (e: React.MouseEvent): void => {
    // Don't trigger if clicking on a button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onCycleSize();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCycleSize();
    }
  };

  return (
    <div
      className={`${styles.smallCard} ${isLoading ? styles.smallCardLoading : ''} ${hasError ? styles.smallCardError : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${title} card. ${itemCount !== undefined ? `${itemCount} items.` : ''} Click to expand.`}
    >
      <div className={styles.content}>
        <span className={styles.icon}>{icon}</span>
        <Text className={styles.title}>{title}</Text>
        {itemCount !== undefined && itemCount > 0 && (
          <Badge
            appearance="filled"
            color="brand"
            size="small"
            className={styles.badge}
          >
            {itemCount}
          </Badge>
        )}
      </div>

      <div className={styles.actions}>
        {aiDemoMode && (
          <Popover positioning="above" withArrow>
            <PopoverTrigger disableButtonEnhancement>
              <Tooltip content="AI Insights" relationship="label">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Sparkle20Regular />}
                  className={styles.aiButton}
                  aria-label="View AI insights"
                  onClick={(e) => e.stopPropagation()}
                />
              </Tooltip>
            </PopoverTrigger>
            <PopoverSurface className={styles.aiPopover}>
              <div className={styles.aiPopoverHeader}>
                <Sparkle20Filled />
                <Text className={styles.aiPopoverTitle}>AI Insights</Text>
              </div>
              {aiSummary && (
                <Text className={styles.aiPopoverSummary}>{aiSummary}</Text>
              )}
              {aiInsights.length > 0 ? (
                <div className={styles.aiPopoverInsights}>
                  {aiInsights.slice(0, 3).map((insight, index) => (
                    <Text key={index} className={styles.aiInsight}>
                      {insight}
                    </Text>
                  ))}
                </div>
              ) : !aiSummary ? (
                <Text className={styles.noInsights}>
                  No AI insights available
                </Text>
              ) : null}
            </PopoverSurface>
          </Popover>
        )}
        <Tooltip content="Expand" relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronDown20Regular />}
            onClick={(e) => {
              e.stopPropagation();
              onCycleSize();
            }}
            aria-label="Expand card"
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default SmallCard;
