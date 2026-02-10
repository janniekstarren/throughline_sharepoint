// ============================================
// Adaptive Shadow Styles
// ============================================
// Weight-driven shadow, background, and border styles for cards.
// Each VisualWeight level has a distinct visual treatment:
// - Critical: Red glow radiating outward
// - Warning: Amber glow, softer than critical
// - Active: Clean standard shadow with category accent border
// - Quiet: Almost flat, reduced opacity, lifts on hover
// - Placeholder: No shadow, depressed surface, dashed border
//
// Theme-responsive glow uses CSS custom properties set by useThemeGlowVars.

import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

// ============================================
// Weight-Based Shadow Styles
// ============================================

export const useAdaptiveShadowStyles = makeStyles({
  // ═══════ CRITICAL (weight 4) — Red glow ═══════
  critical: {
    boxShadow: [
      '0 1px 2px rgba(0, 0, 0, 0.12)',
      '0 0 8px var(--throughline-glow-critical, rgba(196, 49, 75, 0.25))',
      '0 0 24px var(--throughline-glow-critical-wide, rgba(196, 49, 75, 0.12))',
    ].join(', '),
    backgroundColor: 'var(--throughline-surface-critical, rgba(196, 49, 75, 0.04))',
    ...shorthands.borderTop('2px', 'solid', tokens.colorPaletteRedBorderActive),
    transitionProperty: 'box-shadow, background-color, border-color, opacity',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
  },

  criticalHover: {
    boxShadow: [
      '0 2px 4px rgba(0, 0, 0, 0.15)',
      '0 0 12px var(--throughline-glow-critical, rgba(196, 49, 75, 0.30))',
      '0 0 32px var(--throughline-glow-critical-wide, rgba(196, 49, 75, 0.16))',
    ].join(', '),
  },

  // ═══════ WARNING (weight 3) — Amber glow ═══════
  warning: {
    boxShadow: [
      '0 1px 2px rgba(0, 0, 0, 0.12)',
      '0 0 6px var(--throughline-glow-warning, rgba(196, 144, 49, 0.20))',
      '0 0 18px var(--throughline-glow-warning-wide, rgba(196, 144, 49, 0.08))',
    ].join(', '),
    backgroundColor: 'var(--throughline-surface-warning, rgba(196, 144, 49, 0.03))',
    ...shorthands.borderTop('2px', 'solid', tokens.colorPaletteYellowBorderActive),
    transitionProperty: 'box-shadow, background-color, border-color, opacity',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
  },

  warningHover: {
    boxShadow: [
      '0 2px 4px rgba(0, 0, 0, 0.15)',
      '0 0 10px var(--throughline-glow-warning, rgba(196, 144, 49, 0.25))',
      '0 0 24px var(--throughline-glow-warning-wide, rgba(196, 144, 49, 0.12))',
    ].join(', '),
  },

  // ═══════ ACTIVE (weight 2) — Clean standard shadow ═══════
  active: {
    boxShadow: tokens.shadow4,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderTop('2px', 'solid', 'transparent'),
    transitionProperty: 'box-shadow, background-color, border-color, opacity',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
  },

  activeHover: {
    boxShadow: tokens.shadow8,
  },

  // ── Category accent borders for Active cards ──
  accentImmediateAction: {
    ...shorthands.borderTop('2px', 'solid', tokens.colorPaletteRedBorder2),
  },
  accentProductivityPatterns: {
    ...shorthands.borderTop('2px', 'solid', tokens.colorPaletteBlueBorderActive),
  },
  accentKnowledgeManagement: {
    ...shorthands.borderTop('2px', 'solid', tokens.colorPalettePurpleBorderActive),
  },
  accentCollaborationHealth: {
    ...shorthands.borderTop('2px', 'solid', tokens.colorPaletteGreenBorder2),
  },
  accentManagerToolkit: {
    ...shorthands.borderTop('2px', 'solid', tokens.colorPaletteYellowBorder2),
  },
  accentGovernanceCompliance: {
    ...shorthands.borderTop('2px', 'solid', tokens.colorPaletteTealBorderActive),
  },

  // ═══════ QUIET (weight 1) — Nearly flat ═══════
  quiet: {
    boxShadow: tokens.shadow2,
    backgroundColor: tokens.colorNeutralBackground1,
    opacity: 0.75,
    ...shorthands.borderTop('2px', 'solid', 'transparent'),
    transitionProperty: 'box-shadow, background-color, border-color, opacity',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
  },

  quietHover: {
    opacity: 1,
    boxShadow: tokens.shadow4,
  },

  // ═══════ PLACEHOLDER (weight 0) — Depressed surface ═══════
  placeholder: {
    boxShadow: 'none',
    backgroundColor: tokens.colorNeutralBackground2,
    opacity: 0.5,
    ...shorthands.borderTop('2px', 'dashed', tokens.colorNeutralStroke2),
    transitionProperty: 'box-shadow, background-color, border-color, opacity',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
  },

  placeholderHover: {
    opacity: 0.7,
    boxShadow: tokens.shadow2,
  },

  // ═══════ Disabled (adaptive rendering off) — uniform appearance ═══════
  uniform: {
    boxShadow: tokens.shadow4,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderTop('2px', 'solid', 'transparent'),
    transitionProperty: 'box-shadow, background-color, border-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
  },

  uniformHover: {
    boxShadow: tokens.shadow8,
  },
});

// ============================================
// Glow Intensity Multipliers
// ============================================

export type GlowIntensity = 'subtle' | 'standard' | 'vivid';

/** Opacity multiplier for glow intensity levels */
export const GLOW_INTENSITY_MULTIPLIER: Record<GlowIntensity, number> = {
  subtle: 0.6,
  standard: 1.0,
  vivid: 1.5,
};
