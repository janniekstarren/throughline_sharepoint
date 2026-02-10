// ============================================
// Pulse - Global Status Indicator
// ============================================
// Displays a small coloured dot + label in the sticky header
// showing the overall urgency state of the dashboard.
// - Critical: Red pulsing dot + "N need attention"
// - Warning: Amber static dot + "N items flagged"
// - All clear: Green static dot + "All clear"
// Hidden when adaptive rendering is disabled.

import * as React from 'react';
import { makeStyles, tokens, mergeClasses, shorthands } from '@fluentui/react-components';
import { Tooltip } from '@fluentui/react-components';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  // Base pill — matches the CategoryNavRail frosted glass style
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'default',
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    height: '32px',
    borderRadius: tokens.borderRadiusCircular,
    borderTopWidth: tokens.strokeWidthThin,
    borderRightWidth: tokens.strokeWidthThin,
    borderBottomWidth: tokens.strokeWidthThin,
    borderLeftWidth: tokens.strokeWidthThin,
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(32, 32, 32, 0.6)',
    },
    transitionProperty: 'background-color, border-color',
    transitionDuration: tokens.durationFast,
    ...shorthands.outline('0'),
  },

  // State-specific pill colouring
  rootCritical: {
    backgroundColor: 'rgba(196, 43, 28, 0.08)',
    borderTopColor: 'rgba(196, 43, 28, 0.35)',
    borderRightColor: 'rgba(196, 43, 28, 0.35)',
    borderBottomColor: 'rgba(196, 43, 28, 0.35)',
    borderLeftColor: 'rgba(196, 43, 28, 0.35)',
    ':hover': {
      backgroundColor: 'rgba(196, 43, 28, 0.12)',
    },
  },

  rootWarning: {
    backgroundColor: 'rgba(200, 137, 0, 0.08)',
    borderTopColor: 'rgba(200, 137, 0, 0.35)',
    borderRightColor: 'rgba(200, 137, 0, 0.35)',
    borderBottomColor: 'rgba(200, 137, 0, 0.35)',
    borderLeftColor: 'rgba(200, 137, 0, 0.35)',
    ':hover': {
      backgroundColor: 'rgba(200, 137, 0, 0.12)',
    },
  },

  rootClear: {
    backgroundColor: 'rgba(16, 124, 16, 0.06)',
    borderTopColor: 'rgba(16, 124, 16, 0.25)',
    borderRightColor: 'rgba(16, 124, 16, 0.25)',
    borderBottomColor: 'rgba(16, 124, 16, 0.25)',
    borderLeftColor: 'rgba(16, 124, 16, 0.25)',
    ':hover': {
      backgroundColor: 'rgba(16, 124, 16, 0.10)',
    },
  },

  hidden: {
    display: 'none',
  },

  dot: {
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
  },

  dotCritical: {
    backgroundColor: tokens.colorPaletteRedBackground3,
    animationName: {
      '0%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.3)', opacity: 0.7 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
    animationDuration: '2s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },

  dotWarning: {
    backgroundColor: tokens.colorPaletteYellowBackground3,
  },

  dotClear: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
  },

  label: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    whiteSpace: 'nowrap',
  },

  labelCritical: {
    color: tokens.colorPaletteRedForeground1,
  },

  labelWarning: {
    color: tokens.colorPaletteYellowForeground1,
  },

  labelClear: {
    color: tokens.colorPaletteGreenForeground1,
  },
});

// ============================================
// Props
// ============================================

export interface IPulseProps {
  criticalCount: number;
  warningCount: number;
  isAdaptiveEnabled: boolean;
  showPulse: boolean;
  onClick?: () => void;
}

// ============================================
// Component
// ============================================

export const Pulse: React.FC<IPulseProps> = ({
  criticalCount,
  warningCount,
  isAdaptiveEnabled,
  showPulse,
  onClick,
}) => {
  const styles = useStyles();

  if (!isAdaptiveEnabled || !showPulse) {
    return null;
  }

  let dotClass: string;
  let rootClass: string;
  let labelClass: string;
  let label: string;
  let tooltip: string;

  if (criticalCount > 0) {
    dotClass = mergeClasses(styles.dot, styles.dotCritical);
    rootClass = mergeClasses(styles.root, styles.rootCritical);
    labelClass = mergeClasses(styles.label, styles.labelCritical);
    label = `${criticalCount} need attention`;
    tooltip = `${criticalCount} critical item${criticalCount > 1 ? 's' : ''} require immediate attention`;
  } else if (warningCount > 0) {
    dotClass = mergeClasses(styles.dot, styles.dotWarning);
    rootClass = mergeClasses(styles.root, styles.rootWarning);
    labelClass = mergeClasses(styles.label, styles.labelWarning);
    label = `${warningCount} flagged`;
    tooltip = `${warningCount} item${warningCount > 1 ? 's' : ''} flagged for review`;
  } else {
    dotClass = mergeClasses(styles.dot, styles.dotClear);
    rootClass = mergeClasses(styles.root, styles.rootClear);
    labelClass = mergeClasses(styles.label, styles.labelClear);
    label = 'All clear';
    tooltip = 'No urgent items detected';
  }

  return (
    <Tooltip content={tooltip} relationship="label">
      <span
        className={rootClass}
        onClick={onClick}
        role={onClick ? 'button' : 'status'}
        tabIndex={onClick ? 0 : undefined}
        aria-label={tooltip}
      >
        <span className={dotClass} />
        <span className={labelClass}>{label}</span>
      </span>
    </Tooltip>
  );
};

Pulse.displayName = 'Pulse';
