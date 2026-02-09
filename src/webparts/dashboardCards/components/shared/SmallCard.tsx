// ============================================
// SmallCard - Square card with metric/chart slider
// Shows key metric on slide 1, mini chart on slide 2
// Uses pure CSS popover to avoid React Error #310 in SharePoint
// ============================================

import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  mergeClasses,
} from '@fluentui/react-components';
import {
  Sparkle20Regular,
  Sparkle16Regular,
  ChevronRight16Regular,
  Info12Regular,
  Warning12Filled,
  ErrorCircle12Filled,
} from '@fluentui/react-icons';
import { CardSizeMenu } from './CardSizeMenu';
import { TrendBarChart } from './charts';
import { TrendDataPoint } from './charts/TrendBarChart';
import { CardSize } from '../../types/CardSize';
import { getSmartLabel, LabelKey } from '../../utils/labelUtils';
// CSS Module for AI popover (SharePoint-compatible, not makeStyles)
import popoverStyles from './SmallCard.module.scss';

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
  /** AI summary text for popover */
  aiSummary?: string;
  /** AI insights list for popover */
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
  /** Metric label (e.g., "EVENTS", "TASKS", "UNREAD") - deprecated, use smartLabelKey */
  metricLabel?: string;
  /** Label key for smart pluralization (e.g., 'event', 'task', 'email') */
  smartLabelKey?: LabelKey;
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
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },

  // AI button
  aiButton: {
    color: tokens.colorBrandForeground1,
    minWidth: 'auto',
    padding: '4px',
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

  // Indicators - improved visibility
  indicators: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralStroke1,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: 0,
    ':hover': {
      backgroundColor: tokens.colorNeutralStroke1,
      transform: 'scale(1.1)',
    },
  },
  indicatorActive: {
    backgroundColor: tokens.colorBrandForeground1,
    border: `1px solid ${tokens.colorBrandForeground1}`,
    transform: 'scale(1.3)',
    ':hover': {
      backgroundColor: tokens.colorBrandForeground1,
    },
  },
});

export const SmallCard: React.FC<ISmallCardProps> = ({
  title,
  icon,
  itemCount,
  aiDemoMode = false,
  aiSummary,
  aiInsights,
  isLoading = false,
  hasError = false,
  metricValue,
  metricLabel,
  smartLabelKey,
  chartData,
  chartColor = 'brand',
  currentSize = 'small',
  onSizeChange,
  onCycleSize,
}) => {
  const styles = useStyles();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const [isPopoverExpanded, setIsPopoverExpanded] = useState(true);
  const popoverWrapperRef = useRef<HTMLDivElement>(null);

  // Determine if we have chart data for slide 2
  const hasChart = chartData && chartData.length > 0;
  const slideCount = hasChart ? 2 : 1;

  // Get display metric value (use metricValue if provided, fall back to itemCount)
  const displayValue = metricValue !== undefined ? metricValue : itemCount;

  // Compute display label with smart pluralization
  const displayLabel = React.useMemo(() => {
    if (smartLabelKey && displayValue !== undefined) {
      const count = typeof displayValue === 'number' ? displayValue : parseInt(String(displayValue), 10) || 0;
      return getSmartLabel(count, smartLabelKey);
    }
    return metricLabel || '';
  }, [smartLabelKey, displayValue, metricLabel]);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isPopoverVisible) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (popoverWrapperRef.current && !popoverWrapperRef.current.contains(event.target as Node)) {
        setIsPopoverVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverVisible]);

  // Close popover on Escape
  useEffect(() => {
    if (!isPopoverVisible) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsPopoverVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPopoverVisible]);

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
      aria-label={`${title} card. ${displayValue !== undefined ? `${displayValue} ${displayLabel || 'items'}.` : ''}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}>{icon}</span>
        <Text className={styles.headerTitle}>{title}</Text>
        <div className={styles.headerActions}>
          {/* AI Insights Button - Using pure CSS popover for SharePoint compatibility */}
          {aiDemoMode && (aiSummary || (aiInsights && aiInsights.length > 0)) && (
            <div ref={popoverWrapperRef} className={popoverStyles.aiPopoverWrapper}>
              <Button
                appearance="subtle"
                size="small"
                icon={<Sparkle20Regular />}
                className={styles.aiButton}
                aria-label="View AI insights"
                aria-expanded={isPopoverVisible}
                onClick={() => setIsPopoverVisible(!isPopoverVisible)}
              />
              {isPopoverVisible && (
                <div className={popoverStyles.aiPopoverDropdown}>
                  {/* Banner header - collapsible */}
                  <div
                    className={popoverStyles.aiPopoverBanner}
                    onClick={() => setIsPopoverExpanded(!isPopoverExpanded)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setIsPopoverExpanded(!isPopoverExpanded)}
                  >
                    <Sparkle16Regular className={popoverStyles.aiPopoverIcon} />
                    <span className={popoverStyles.aiPopoverText}>
                      {aiSummary || `${aiInsights?.length || 0} AI insights`}
                    </span>
                    <ChevronRight16Regular
                      className={`${popoverStyles.aiPopoverChevron} ${isPopoverExpanded ? popoverStyles.aiPopoverChevronExpanded : ''}`}
                    />
                  </div>
                  {/* Insight items */}
                  {isPopoverExpanded && aiInsights && aiInsights.length > 0 && (
                    <div className={popoverStyles.aiPopoverContent}>
                      {aiInsights.map((insight, idx) => {
                        const isUrgent = insight.toLowerCase().includes('response') || insight.toLowerCase().includes('deadline');
                        const isWarning = insight.toLowerCase().includes('attention') || insight.toLowerCase().includes('pending') || insight.toLowerCase().includes('more');
                        const actionLabel = insight.toLowerCase().includes('response') ? 'Reply now' :
                                           insight.toLowerCase().includes('thread') || insight.toLowerCase().includes('schedule') ? 'Schedule call' : undefined;
                        return (
                          <div key={idx} className={popoverStyles.aiInsightItem}>
                            {isUrgent ? (
                              <ErrorCircle12Filled className={`${popoverStyles.aiInsightIcon} ${popoverStyles.aiInsightIconCritical}`} />
                            ) : isWarning ? (
                              <Warning12Filled className={`${popoverStyles.aiInsightIcon} ${popoverStyles.aiInsightIconWarning}`} />
                            ) : (
                              <Info12Regular className={`${popoverStyles.aiInsightIcon} ${popoverStyles.aiInsightIconInfo}`} />
                            )}
                            <span className={popoverStyles.aiInsightText}>{insight}</span>
                            {actionLabel && (
                              <span className={popoverStyles.aiInsightAction}>
                                {actionLabel}
                                <ChevronRight16Regular style={{ fontSize: 10 }} />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Size Menu */}
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
                {displayLabel && (
                  <Text className={styles.metricLabel}>{displayLabel}</Text>
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
              aria-label={`Go to slide ${index + 1}: ${index === 0 ? 'Overview' : 'Trend'}`}
              aria-current={activeSlide === index ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SmallCard;
