// ============================================
// ChartCarousel - Carousel for multiple chart views
// ============================================

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Button,
} from '@fluentui/react-components';
import {
  ChevronLeftRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    position: 'relative',
    width: '100%',
  },
  slideContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  slideTrack: {
    display: 'flex',
    transition: 'transform 0.3s ease-in-out',
  },
  slide: {
    flex: '0 0 100%',
    width: '100%',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXS,
  },
  navButton: {
    minWidth: '28px',
    width: '28px',
    height: '28px',
    padding: 0,
    borderRadius: tokens.borderRadiusCircular,
  },
  indicators: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralStroke2,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
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

export interface ChartCarouselProps {
  /** Chart components to display */
  children: React.ReactNode[];
  /** Initial slide index */
  initialIndex?: number;
  /** Auto-play interval in ms (0 to disable) */
  autoPlayInterval?: number;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showIndicators?: boolean;
  /** Callback when slide changes */
  onSlideChange?: (index: number) => void;
}

export const ChartCarousel: React.FC<ChartCarouselProps> = ({
  children,
  initialIndex = 0,
  autoPlayInterval = 0,
  showArrows = true,
  showIndicators = true,
  onSlideChange,
}) => {
  const styles = useStyles();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const slideCount = React.Children.count(children);

  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, slideCount - 1));
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);
  }, [slideCount, onSlideChange]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex === 0 ? slideCount - 1 : currentIndex - 1);
  }, [currentIndex, slideCount, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex === slideCount - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, slideCount, goToSlide]);

  // Auto-play functionality
  React.useEffect(() => {
    if (autoPlayInterval > 0) {
      const timer = setInterval(goToNext, autoPlayInterval);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [autoPlayInterval, goToNext]);

  if (slideCount === 0) return null;

  // If only one slide, render without carousel controls
  if (slideCount === 1) {
    return <div className={styles.container}>{children}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.slideContainer}>
        <div
          className={styles.slideTrack}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} className={styles.slide}>
              {child}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.navigation}>
        {showArrows && (
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronLeftRegular />}
            onClick={goToPrevious}
            className={styles.navButton}
            aria-label="Previous chart"
          />
        )}

        {showIndicators && (
          <div className={styles.indicators}>
            {Array.from({ length: slideCount }).map((_, index) => (
              <div
                key={index}
                className={`${styles.indicator} ${index === currentIndex ? styles.indicatorActive : ''}`}
                onClick={() => goToSlide(index)}
                role="button"
                tabIndex={0}
                aria-label={`Go to chart ${index + 1}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    goToSlide(index);
                  }
                }}
              />
            ))}
          </div>
        )}

        {showArrows && (
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronRightRegular />}
            onClick={goToNext}
            className={styles.navButton}
            aria-label="Next chart"
          />
        )}
      </div>
    </div>
  );
};

export default ChartCarousel;
