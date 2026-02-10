// ============================================
// TrialCountdown — "12 days left" trial countdown display
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
} from '@fluentui/react-components';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorPaletteYellowForeground2,
  },
  urgent: {
    color: tokens.colorPaletteRedForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  progressBar: {
    width: '40px',
    height: '3px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: tokens.borderRadiusCircular,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: tokens.borderRadiusCircular,
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
  },
  progressNormal: {
    backgroundColor: tokens.colorPaletteYellowForeground2,
  },
  progressUrgent: {
    backgroundColor: tokens.colorPaletteRedForeground1,
  },
});

// ============================================
// Props
// ============================================

interface TrialCountdownProps {
  daysRemaining: number;
  totalDays?: number; // for progress bar calculation
  showProgress?: boolean;
}

// ============================================
// Component
// ============================================

export const TrialCountdown: React.FC<TrialCountdownProps> = ({
  daysRemaining,
  totalDays = 14,
  showProgress = false,
}) => {
  const classes = useStyles();
  const isUrgent = daysRemaining <= 3;
  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));

  return (
    <span className={classes.container}>
      <span className={isUrgent ? classes.urgent : undefined}>
        {daysRemaining === 0 ? 'Expires today' :
         daysRemaining === 1 ? '1 day left' :
         `${daysRemaining} days left`}
      </span>
      {showProgress && (
        <span className={classes.progressBar}>
          <span
            className={`${classes.progressFill} ${isUrgent ? classes.progressUrgent : classes.progressNormal}`}
            style={{ width: `${progressPercent}%` }}
          />
        </span>
      )}
    </span>
  );
};
