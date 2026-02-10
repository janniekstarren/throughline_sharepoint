/**
 * HubInsightCard - Frosted glass insight card with Fluent icons
 *
 * Uses resolveInsightIcon() to convert emoji to Fluent icon components.
 * Frosted glass background matching navigation pills.
 * Severity-coloured gradient box-shadow around the card (no bar).
 * Hover lift animation.
 */

import * as React from 'react';
import { Text, Button, makeStyles, tokens, shorthands, mergeClasses } from '@fluentui/react-components';
import { AggregatedInsight, InsightSeverity } from '../../models/InsightRollup';
import { resolveInsightIcon } from './iconMapping';
import { InsightCardPresence } from './hubMotions';

// ============================================
// Severity shadow colours — applied as box-shadow around entire card
// ============================================

const SEVERITY_SHADOWS: Record<string, string> = {
  critical: '0 2px 12px rgba(196, 43, 28, 0.18), 0 0 0 1px rgba(196, 43, 28, 0.10)',
  warning:  '0 2px 12px rgba(234, 163, 0, 0.16), 0 0 0 1px rgba(234, 163, 0, 0.10)',
  info:     '0 2px 12px rgba(0, 108, 190, 0.14), 0 0 0 1px rgba(0, 108, 190, 0.08)',
  positive: '0 2px 12px rgba(16, 124, 16, 0.14), 0 0 0 1px rgba(16, 124, 16, 0.08)',
};

const SEVERITY_HOVER_SHADOWS: Record<string, string> = {
  critical: '0 4px 20px rgba(196, 43, 28, 0.25), 0 0 0 1px rgba(196, 43, 28, 0.15)',
  warning:  '0 4px 20px rgba(234, 163, 0, 0.22), 0 0 0 1px rgba(234, 163, 0, 0.14)',
  info:     '0 4px 20px rgba(0, 108, 190, 0.20), 0 0 0 1px rgba(0, 108, 190, 0.12)',
  positive: '0 4px 20px rgba(16, 124, 16, 0.20), 0 0 0 1px rgba(16, 124, 16, 0.12)',
};

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    cursor: 'pointer',
    // Frosted glass — matches navigation pill style
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(32, 32, 32, 0.6)',
    },
    ...shorthands.border(tokens.strokeWidthThin, 'solid', tokens.colorNeutralStroke2),
    transitionProperty: 'transform, box-shadow, background-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
    ':hover': {
      transform: 'translateY(-2px)',
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
    },
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },

  iconSquare: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    flexShrink: 0,
  },

  iconCritical: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground1,
  },
  iconWarning: {
    backgroundColor: tokens.colorPaletteMarigoldBackground2,
    color: tokens.colorPaletteMarigoldForeground1,
  },
  iconInfo: {
    backgroundColor: tokens.colorPaletteBlueBackground2,
    color: tokens.colorPaletteBlueForeground2,
  },
  iconPositive: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground1,
  },

  message: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },

  meta: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    paddingLeft: '36px', // Align with message after icon
  },

  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: tokens.spacingVerticalXXS,
  },
});

// ============================================
// Props
// ============================================

export interface IHubInsightCardProps {
  insight: AggregatedInsight;
  onInsightClick?: (insight: AggregatedInsight) => void;
}

// ============================================
// Component
// ============================================

export const HubInsightCard: React.FC<IHubInsightCardProps> = ({ insight, onInsightClick }) => {
  const styles = useStyles();

  const iconBgClass = React.useMemo(() => {
    switch (insight.severity) {
      case InsightSeverity.Critical: return styles.iconCritical;
      case InsightSeverity.Warning: return styles.iconWarning;
      case InsightSeverity.Info: return styles.iconInfo;
      case InsightSeverity.Positive: return styles.iconPositive;
      default: return styles.iconInfo;
    }
  }, [insight.severity, styles]);

  const severityKey = React.useMemo(() => {
    switch (insight.severity) {
      case InsightSeverity.Critical: return 'critical';
      case InsightSeverity.Warning: return 'warning';
      case InsightSeverity.Info: return 'info';
      case InsightSeverity.Positive: return 'positive';
      default: return 'info';
    }
  }, [insight.severity]);

  const IconComponent = React.useMemo(
    () => resolveInsightIcon(insight.icon),
    [insight.icon]
  );

  const handleClick = React.useCallback(() => {
    if (onInsightClick) {
      onInsightClick(insight);
    } else {
      // Default: scroll to the source card
      const element = document.getElementById(insight.sourceCardId);
      if (element) {
        const rect = element.getBoundingClientRect();
        window.scrollTo({
          top: window.scrollY + rect.top - 120,
          behavior: 'smooth',
        });
      }
    }
  }, [insight, onInsightClick]);

  // Hover state for dynamic shadow
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    backdropFilter: 'saturate(180%) blur(16px)',
    boxShadow: isHovered
      ? SEVERITY_HOVER_SHADOWS[severityKey]
      : SEVERITY_SHADOWS[severityKey],
  };

  return (
    <InsightCardPresence visible>
      <div
        className={styles.root}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label={`${insight.severity}: ${insight.message}`}
        style={cardStyle}
      >
        <div className={styles.header}>
          <div className={mergeClasses(styles.iconSquare, iconBgClass)}>
            <IconComponent />
          </div>
          <Text className={styles.message}>{insight.message}</Text>
        </div>
        <Text className={styles.meta}>
          {insight.sourceCardName} &middot; {insight.category}
        </Text>
        {insight.action && (
          <div className={styles.actionRow}>
            <Button
              size="small"
              appearance="subtle"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {insight.action.label}
            </Button>
          </div>
        )}
      </div>
    </InsightCardPresence>
  );
};
