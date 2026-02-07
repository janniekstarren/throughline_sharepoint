// ============================================
// SmallCard - Square card with metric/chart slider
// Shows key metric on slide 1, mini chart on slide 2
// ============================================

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  mergeClasses,
} from '@fluentui/react-components';
import { CardSizeMenu } from './CardSizeMenu';
import { TrendBarChart } from './charts';
import { TrendDataPoint } from './charts/TrendBarChart';
import { CardSize } from '../../types/CardSize';

export interface ISmallCardProps {
  /** Card identifier */
  cardId: string;
  /** Card title to display */
  title: string;
  /** Card icon element */
  icon: React.ReactElement;
  /** Optional item count to show as badge (backwards compatible) */
  itemCount?: number;
  /** Whether AI demo mode is enabled */
  aiDemoMode?: boolean;
  /** AI summary text for popover (backwards compatible, not used in new design) */
  aiSummary?: string;
  /** AI insights list for popover (backwards compatible, not used in new design) */
  aiInsights?: string[];
  /** @deprecated Use onSizeChange instead */
  onCycleSize?: () => void;
  /** Optional loading state */
  isLoading?: boolean;
  /** Optional error state */
  hasError?: boolean;

  // NEW props for enhanced SmallCard
  /** Primary metric value (e.g., 6, 12, "4h") */
  metricValue?: string | number;
  /** Metric label (e.g., "EVENTS", "TASKS", "UNREAD") */
  metricLabel?: string;
  /** Chart data for slide 2 */
  chartData?: TrendDataPoint[];
  /** Chart color scheme */
  chartColor?: 'default' | 'brand' | 'success' | 'warning' | 'danger';
  /** Current card size for menu */
  currentSize?: CardSize;
  /** Callback when size is changed via menu */
  onSizeChange?: (size: CardSize) => void;
}

const useStyles = makeStyles({
  // Square card container
  smallCard: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow4,
    overflow: 'hidden',
    transitionDuration: tokens.durationNormal,
    transitionProperty: 'box-shadow',
    ':hover': {
      boxShadow: tokens.shadow8, // Fluent2 elevation on hover
    },
  },
  smallCardLoading: {
    backgroundColor: tokens.colorNeutralBackground2,
  },
  smallCardError: {
    border: `1px solid ${tokens.colorPaletteRedForeground1}`,
  },

  // Header row
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  headerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headerActions: {
    flexShrink: 0,
  },

  // Slide container
  slideContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 0,
  },
  slideTrack: {
    display: 'flex',
    height: '100%',
    transition: 'transform 0.3s ease-in-out',
  },
  slide: {
    flex: '0 0 100%',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingHorizontalM,
    boxSizing: 'border-box',
  },

  // Metric slide (slide 1)
  metricValue: {
    fontSize: '48px',
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
    lineHeight: 1,
  },
  metricLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: tokens.spacingVerticalXS,
  },

  // Chart slide (slide 2)
  chartSlide: {
    padding: tokens.spacingHorizontalS,
  },
  chartWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Indicators
  indicators: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    padding: tokens.spacingVerticalXS,
    flexShrink: 0,
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralStroke2,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    border: 'none',
    padding: 0,
    ':hover': {
      backgroundColor: tokens.colorNeutralStroke1,
    },
  },
  indicatorActive: {
    backgroundColor: tokens.colorBrandForeground1,
    transform: 'scale(1.2)',
    ':hover': {
      backgroundColor: tokens.colorBrandForeground1,
    },
  },
});

export const SmallCard: React.FC<ISmallCardProps> = ({
  title,
  icon,
  itemCount,
  isLoading = false,
  hasError = false,
  metricValue,
  metricLabel,
  chartData,
  chartColor = 'brand',
  currentSize = 'small',
  onSizeChange,
  onCycleSize,
}) => {
  const styles = useStyles();
  const [activeSlide, setActiveSlide] = useState(0);

  // Determine if we have chart data for slide 2
  const hasChart = chartData && chartData.length > 0;
  const slideCount = hasChart ? 2 : 1;

  // Get display metric value (use metricValue if provided, fall back to itemCount)
  const displayValue = metricValue !== undefined ? metricValue : itemCount;

  // Handle size change (support both new and deprecated props)
  const handleSizeChange = useCallback((size: CardSize) => {
    if (onSizeChange) {
      onSizeChange(size);
    } else if (onCycleSize) {
      // Backwards compatibility: just cycle
      onCycleSize();
    }
  }, [onSizeChange, onCycleSize]);

  // Handle indicator click
  const handleIndicatorClick = useCallback((index: number) => {
    setActiveSlide(index);
  }, []);

  // Handle keyboard navigation on indicators
  const handleIndicatorKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveSlide(index);
    }
  }, []);

  const cardClasses = mergeClasses(
    styles.smallCard,
    isLoading && styles.smallCardLoading,
    hasError && styles.smallCardError
  );

  return (
    <div
      className={cardClasses}
      aria-label={`${title} card. ${displayValue !== undefined ? `${displayValue} ${metricLabel || 'items'}.` : ''}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}>{icon}</span>
        <Text className={styles.headerTitle}>{title}</Text>
        <div className={styles.headerActions}>
          {(onSizeChange || onCycleSize) && (
            <CardSizeMenu
              currentSize={currentSize}
              onSizeChange={handleSizeChange}
              buttonSize="small"
            />
          )}
        </div>
      </div>

      {/* Slides */}
      <div className={styles.slideContainer}>
        <div
          className={styles.slideTrack}
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {/* Slide 1: Metric */}
          <div className={styles.slide}>
            {displayValue !== undefined ? (
              <>
                <Text className={styles.metricValue}>{displayValue}</Text>
                {metricLabel && (
                  <Text className={styles.metricLabel}>{metricLabel}</Text>
                )}
              </>
            ) : (
              <Text className={styles.metricLabel}>No data</Text>
            )}
          </div>

          {/* Slide 2: Chart (if data available) */}
          {hasChart && (
            <div className={mergeClasses(styles.slide, styles.chartSlide)}>
              <div className={styles.chartWrapper}>
                <TrendBarChart
                  data={chartData}
                  height={60}
                  color={chartColor}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicators (only show if multiple slides) */}
      {slideCount > 1 && (
        <div className={styles.indicators}>
          {Array.from({ length: slideCount }).map((_, index) => (
            <button
              key={index}
              className={mergeClasses(
                styles.indicator,
                activeSlide === index && styles.indicatorActive
              )}
              onClick={() => handleIndicatorClick(index)}
              onKeyDown={(e) => handleIndicatorKeyDown(e, index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={activeSlide === index ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SmallCard;
