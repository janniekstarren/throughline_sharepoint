/**
 * hubStyles.ts - Shared makeStyles for the Intelligence Hub components
 *
 * Layout: Single-column 700px centre-aligned with full-width insights grid.
 */

import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

// ============================================
// Hub Container Styles
// ============================================

export const useHubContainerStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginBottom: tokens.spacingVerticalL,
    gap: tokens.spacingVerticalL,
  },

  /** Centre column (max 700px) for query box, summary, metrics */
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    width: '100%',
    maxWidth: '700px',
  },

  /** Full width for insights grid */
  fullWidth: {
    width: '100%',
  },

  frostedPanel: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    boxShadow: tokens.shadow4,
  },
});

// ============================================
// Greeting Styles
// ============================================

export const useGreetingStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },

  greetingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },

  greetingText: {
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightBold,
    lineHeight: tokens.lineHeightHero900,
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },

  subline: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForeground2,
    margin: 0,
  },

  collapseButton: {
    flexShrink: 0,
  },
});

// ============================================
// Severity Colors
// ============================================

export const useSeverityStyles = makeStyles({
  critical: {
    color: tokens.colorPaletteRedForeground1,
  },
  criticalBg: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground1,
  },
  criticalBorder: {
    borderLeftColor: tokens.colorPaletteRedBorder2,
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
  },
  warning: {
    color: tokens.colorPaletteMarigoldForeground1,
  },
  warningBg: {
    backgroundColor: tokens.colorPaletteMarigoldBackground2,
    color: tokens.colorPaletteMarigoldForeground1,
  },
  warningBorder: {
    borderLeftColor: tokens.colorPaletteMarigoldBorder2,
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
  },
  info: {
    color: tokens.colorPaletteBlueForeground2,
  },
  infoBg: {
    backgroundColor: tokens.colorPaletteBlueBackground2,
    color: tokens.colorPaletteBlueForeground2,
  },
  infoBorder: {
    borderLeftColor: tokens.colorPaletteBlueBorderActive,
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
  },
  positive: {
    color: tokens.colorPaletteGreenForeground1,
  },
  positiveBg: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground1,
  },
  positiveBorder: {
    borderLeftColor: tokens.colorPaletteGreenBorder2,
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
  },
});

// ============================================
// Results Styles (used by QuerySourceCards, FollowUpChips)
// ============================================

export const useResultsStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },

  summary: {
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground1,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: tokens.spacingVerticalS,
    '@media (min-width: 480px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },

  sourceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    paddingTop: tokens.spacingVerticalS,
    borderTopColor: tokens.colorNeutralStroke2,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
  },

  sourceSectionTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },

  followUps: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    paddingTop: tokens.spacingVerticalS,
  },

  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: tokens.spacingVerticalXS,
  },
});

// ============================================
// Thinking Animation Styles
// ============================================

export const useThinkingStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalL),
  },

  brainIcon: {
    fontSize: '32px',
    color: tokens.colorPaletteBerryForeground1,
  },

  shimmerBar: {
    width: '100%',
    height: '12px',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
  },

  sourceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    alignItems: 'flex-start',
    width: '100%',
  },

  sourceName: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },

  statusText: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    textAlign: 'center' as const,
  },
});
