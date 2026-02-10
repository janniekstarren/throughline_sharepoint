// ============================================
// useThemeGlowVars - Theme-Responsive Glow CSS Variables
// ============================================
// Sets CSS custom properties on the webpart root element for glow colours.
// In dark themes: glows are more visible (higher opacity).
// In light themes: glows are subtler (lower opacity).

import * as React from 'react';
import { GlowIntensity, GLOW_INTENSITY_MULTIPLIER } from '../styles/adaptiveShadows';

// ============================================
// Glow Variable Definitions
// ============================================

interface GlowVars {
  '--throughline-glow-critical': string;
  '--throughline-glow-critical-wide': string;
  '--throughline-surface-critical': string;
  '--throughline-glow-warning': string;
  '--throughline-glow-warning-wide': string;
  '--throughline-surface-warning': string;
}

function clampOpacity(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function buildGlowVars(isDark: boolean, intensity: GlowIntensity): GlowVars {
  const m = GLOW_INTENSITY_MULTIPLIER[intensity];

  if (isDark) {
    return {
      '--throughline-glow-critical': `rgba(232, 80, 91, ${clampOpacity(0.30 * m)})`,
      '--throughline-glow-critical-wide': `rgba(232, 80, 91, ${clampOpacity(0.15 * m)})`,
      '--throughline-surface-critical': `rgba(232, 80, 91, ${clampOpacity(0.06 * m)})`,
      '--throughline-glow-warning': `rgba(232, 174, 80, ${clampOpacity(0.25 * m)})`,
      '--throughline-glow-warning-wide': `rgba(232, 174, 80, ${clampOpacity(0.10 * m)})`,
      '--throughline-surface-warning': `rgba(232, 174, 80, ${clampOpacity(0.04 * m)})`,
    };
  }

  // Light theme — glows are restrained
  return {
    '--throughline-glow-critical': `rgba(196, 49, 75, ${clampOpacity(0.18 * m)})`,
    '--throughline-glow-critical-wide': `rgba(196, 49, 75, ${clampOpacity(0.06 * m)})`,
    '--throughline-surface-critical': `rgba(196, 49, 75, ${clampOpacity(0.03 * m)})`,
    '--throughline-glow-warning': `rgba(196, 144, 49, ${clampOpacity(0.14 * m)})`,
    '--throughline-glow-warning-wide': `rgba(196, 144, 49, ${clampOpacity(0.05 * m)})`,
    '--throughline-surface-warning': `rgba(196, 144, 49, ${clampOpacity(0.02 * m)})`,
  };
}

// ============================================
// Hook
// ============================================

/**
 * Sets CSS custom properties for theme-responsive glow colours on a container element.
 *
 * @param containerRef - Ref to the dashboard root container
 * @param isDark - Whether the current theme is dark
 * @param intensity - Glow intensity level (from admin settings)
 * @param enabled - Whether adaptive rendering is enabled
 */
export function useThemeGlowVars(
  containerRef: React.RefObject<HTMLDivElement>,
  isDark: boolean,
  intensity: GlowIntensity = 'standard',
  enabled: boolean = true
): void {
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!enabled) {
      // Clear all glow vars when disabled
      el.style.removeProperty('--throughline-glow-critical');
      el.style.removeProperty('--throughline-glow-critical-wide');
      el.style.removeProperty('--throughline-surface-critical');
      el.style.removeProperty('--throughline-glow-warning');
      el.style.removeProperty('--throughline-glow-warning-wide');
      el.style.removeProperty('--throughline-surface-warning');
      return;
    }

    const vars = buildGlowVars(isDark, intensity);
    Object.entries(vars).forEach(([prop, value]) => {
      el.style.setProperty(prop, value);
    });
  }, [containerRef, isDark, intensity, enabled]);
}
