/**
 * ThinkingAnimation - Loading state for query processing
 *
 * Shows a pulsing brain icon, shimmer bars, and staggered source card names.
 * Uses custom transparent shimmer bars (not Fluent Skeleton which is opaque white).
 */

import * as React from 'react';
import { makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { BrainCircuit20Regular } from '@fluentui/react-icons';
import { useThinkingStyles } from './hubStyles';
import { ThinkingPulse, ThinkingShimmer, ThinkingSourceName } from './hubMotions';

// Custom shimmer bar styles — transparent-friendly (no opaque white)
const useShimmerStyles = makeStyles({
  shimmerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  shimmerBar: {
    height: '12px',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    animationName: {
      '0%': { opacity: 0.4 },
      '50%': { opacity: 0.8 },
      '100%': { opacity: 0.4 },
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
});

export interface IThinkingAnimationProps {
  /** Source card names being "consulted" */
  sourceNames?: string[];
}

export const ThinkingAnimation: React.FC<IThinkingAnimationProps> = ({
  sourceNames = ['Stale Conversations', 'Broken Promises', 'Focus Time Defender'],
}) => {
  const styles = useThinkingStyles();
  const shimmerStyles = useShimmerStyles();
  const [visibleSources, setVisibleSources] = React.useState(0);

  // Stagger source name appearance
  React.useEffect(() => {
    if (visibleSources < sourceNames.length) {
      const timer = setTimeout(() => {
        setVisibleSources(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visibleSources, sourceNames.length]);

  return (
    <div className={styles.root}>
      {/* Pulsing brain */}
      <ThinkingPulse visible>
        <div className={styles.brainIcon}>
          <BrainCircuit20Regular style={{ fontSize: '32px' }} />
        </div>
      </ThinkingPulse>

      {/* Status text */}
      <ThinkingShimmer visible>
        <p className={styles.statusText}>Analysing your data...</p>
      </ThinkingShimmer>

      {/* Custom transparent shimmer bars (replaces opaque Fluent Skeleton) */}
      <div className={shimmerStyles.shimmerContainer}>
        <div className={shimmerStyles.shimmerBar} style={{ width: '100%' }} />
        <div className={shimmerStyles.shimmerBar} style={{ width: '80%' }} />
        <div className={shimmerStyles.shimmerBar} style={{ width: '60%' }} />
      </div>

      {/* Staggered source card names */}
      <div className={styles.sourceList}>
        {sourceNames.slice(0, visibleSources).map((name, index) => (
          <ThinkingSourceName key={index} visible>
            <span className={styles.sourceName}>Consulting: {name}</span>
          </ThinkingSourceName>
        ))}
      </div>
    </div>
  );
};
