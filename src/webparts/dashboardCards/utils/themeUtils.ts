/**
 * SharePoint to Fluent UI v9 Theme Converter
 *
 * Converts SharePoint theme colors to Fluent UI React v9 design tokens,
 * enabling proper theme inheritance in SPFx webparts.
 */

import {
  Theme,
  BrandVariants,
  createLightTheme,
  createDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { WebPartContext } from '@microsoft/sp-webpart-base';

/**
 * SharePoint theme color slots interface
 * These are the standard SharePoint theme slots available from context.theme or window.__themeState__
 */
export interface ISharePointTheme {
  // Primary brand colors
  themePrimary: string;
  themeDark: string;
  themeDarker: string;
  themeLight: string;
  themeLighter: string;
  themeLighterAlt: string;
  themeTertiary: string;
  themeSecondary: string;

  // Neutral palette
  neutralPrimary: string;
  neutralPrimaryAlt: string;
  neutralSecondary: string;
  neutralSecondaryAlt: string;
  neutralTertiary: string;
  neutralTertiaryAlt: string;
  neutralQuaternary: string;
  neutralQuaternaryAlt: string;
  neutralLight: string;
  neutralLighter: string;
  neutralLighterAlt: string;
  neutralDark: string;
  neutralDarker: string;
  black: string;
  white: string;

  // Semantic colors (optional)
  primaryBackground?: string;
  primaryText?: string;
  bodyBackground?: string;
  bodyText?: string;
  disabledBackground?: string;
  disabledText?: string;
  error?: string;
  errorText?: string;
  accent?: string;
}

/**
 * Calculate relative luminance of a hex color
 * Used to determine if a theme is light or dark
 */
function calculateLuminance(hex: string): number {
  // Remove # if present
  const color = hex.replace('#', '');

  // Parse RGB values
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const color = hex.replace('#', '');
  return {
    r: parseInt(color.substring(0, 2), 16),
    g: parseInt(color.substring(2, 4), 16),
    b: parseInt(color.substring(4, 6), 16),
  };
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;

  const newR = Math.min(255, Math.round(r + (255 - r) * factor));
  const newG = Math.min(255, Math.round(g + (255 - g) * factor));
  const newB = Math.min(255, Math.round(b + (255 - b) * factor));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - percent / 100;

  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Create Fluent UI v9 BrandVariants from a primary color
 * This generates the 10-shade brand ramp required by Fluent themes
 */
function createBrandVariantsFromColor(primaryColor: string): BrandVariants {
  return {
    10: darkenColor(primaryColor, 80),
    20: darkenColor(primaryColor, 70),
    30: darkenColor(primaryColor, 60),
    40: darkenColor(primaryColor, 50),
    50: darkenColor(primaryColor, 40),
    60: darkenColor(primaryColor, 30),
    70: darkenColor(primaryColor, 20),
    80: primaryColor,
    90: lightenColor(primaryColor, 10),
    100: lightenColor(primaryColor, 20),
    110: lightenColor(primaryColor, 30),
    120: lightenColor(primaryColor, 40),
    130: lightenColor(primaryColor, 50),
    140: lightenColor(primaryColor, 60),
    150: lightenColor(primaryColor, 70),
    160: lightenColor(primaryColor, 80),
  };
}

/**
 * Create a Fluent UI v9 Theme from SharePoint theme colors
 */
export function createFluentThemeFromSharePoint(spTheme: ISharePointTheme): Theme {
  // Determine if dark theme based on background luminance
  const backgroundLuminance = calculateLuminance(spTheme.white || '#ffffff');
  const isDark = backgroundLuminance < 0.5;

  // Create brand variants from SharePoint primary color
  const brandVariants = createBrandVariantsFromColor(spTheme.themePrimary || '#0078d4');

  // Create base theme (light or dark)
  const baseTheme = isDark
    ? createDarkTheme(brandVariants)
    : createLightTheme(brandVariants);

  // Override specific tokens with SharePoint colors
  return {
    ...baseTheme,

    // Background colors
    colorNeutralBackground1: spTheme.white,
    colorNeutralBackground1Hover: spTheme.neutralLighterAlt || spTheme.neutralLighter,
    colorNeutralBackground1Pressed: spTheme.neutralLighter,
    colorNeutralBackground2: spTheme.neutralLighterAlt || lightenColor(spTheme.neutralLighter, 50),
    colorNeutralBackground2Hover: spTheme.neutralLighter,
    colorNeutralBackground2Pressed: spTheme.neutralLight,
    colorNeutralBackground3: spTheme.neutralLighter,
    colorNeutralBackground3Hover: spTheme.neutralLight,
    colorNeutralBackground3Pressed: spTheme.neutralQuaternaryAlt,
    colorNeutralBackground4: spTheme.neutralLight,
    colorNeutralBackground5: spTheme.neutralQuaternaryAlt,
    colorNeutralBackground6: spTheme.neutralQuaternary,

    // Foreground colors
    colorNeutralForeground1: spTheme.neutralPrimary,
    colorNeutralForeground1Hover: spTheme.neutralPrimary,
    colorNeutralForeground1Pressed: spTheme.neutralPrimary,
    colorNeutralForeground2: spTheme.neutralSecondary,
    colorNeutralForeground2Hover: spTheme.neutralPrimary,
    colorNeutralForeground2Pressed: spTheme.neutralPrimary,
    colorNeutralForeground3: spTheme.neutralTertiary,
    colorNeutralForeground3Hover: spTheme.neutralSecondary,
    colorNeutralForeground3Pressed: spTheme.neutralSecondary,
    colorNeutralForeground4: spTheme.neutralQuaternary,
    colorNeutralForegroundDisabled: spTheme.neutralTertiaryAlt || spTheme.neutralTertiary,

    // Stroke/border colors
    colorNeutralStroke1: spTheme.neutralQuaternaryAlt || spTheme.neutralLight,
    colorNeutralStroke1Hover: spTheme.neutralTertiaryAlt || spTheme.neutralTertiary,
    colorNeutralStroke1Pressed: spTheme.neutralTertiary,
    colorNeutralStroke2: spTheme.neutralQuaternary || spTheme.neutralLighter,
    colorNeutralStroke3: spTheme.neutralLighter,
    colorNeutralStrokeAccessible: spTheme.neutralSecondary,
    colorNeutralStrokeAccessibleHover: spTheme.neutralPrimary,
    colorNeutralStrokeAccessiblePressed: spTheme.neutralDark,
    colorNeutralStrokeDisabled: spTheme.neutralQuaternary,

    // Brand colors
    colorBrandForeground1: spTheme.themePrimary,
    colorBrandForeground2: spTheme.themeDark,
    colorBrandForegroundLink: spTheme.themePrimary,
    colorBrandForegroundLinkHover: spTheme.themeDark,
    colorBrandForegroundLinkPressed: spTheme.themeDarker,
    colorBrandBackground: spTheme.themePrimary,
    colorBrandBackgroundHover: spTheme.themeDark,
    colorBrandBackgroundPressed: spTheme.themeDarker,
    colorBrandBackground2: spTheme.themeLighterAlt || spTheme.themeLighter,
    colorBrandBackground2Hover: spTheme.themeLighter,
    colorBrandBackground2Pressed: spTheme.themeLight,
    colorBrandStroke1: spTheme.themePrimary,
    colorBrandStroke2: spTheme.themeLight,

    // Compound brand (for selected/active states)
    colorCompoundBrandForeground1: spTheme.themePrimary,
    colorCompoundBrandForeground1Hover: spTheme.themeDark,
    colorCompoundBrandForeground1Pressed: spTheme.themeDarker,
    colorCompoundBrandBackground: spTheme.themePrimary,
    colorCompoundBrandBackgroundHover: spTheme.themeDark,
    colorCompoundBrandBackgroundPressed: spTheme.themeDarker,
    colorCompoundBrandStroke: spTheme.themePrimary,
    colorCompoundBrandStrokeHover: spTheme.themeDark,
    colorCompoundBrandStrokePressed: spTheme.themeDarker,

    // Subtle background (for hover states)
    colorSubtleBackground: 'transparent',
    colorSubtleBackgroundHover: spTheme.neutralLighter,
    colorSubtleBackgroundPressed: spTheme.neutralLight,
    colorSubtleBackgroundSelected: spTheme.neutralLight,
    colorSubtleBackgroundLightAlphaHover: spTheme.neutralLighterAlt || spTheme.neutralLighter,
    colorSubtleBackgroundLightAlphaPressed: spTheme.neutralLighter,
    colorSubtleBackgroundLightAlphaSelected: spTheme.neutralLighter,
  };
}

/**
 * Get SharePoint theme from available sources
 * Checks multiple locations where theme data might be available
 */
export function getSharePointTheme(context?: WebPartContext): ISharePointTheme | undefined {
  // Method 1: Try window.__themeState__ (most reliable for SharePoint Online)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const windowTheme = (window as any).__themeState__?.theme;
  if (windowTheme && windowTheme.themePrimary) {
    return windowTheme as ISharePointTheme;
  }

  // Method 2: Try to read from CSS custom properties
  const cssTheme = getThemeFromCssVariables();
  if (cssTheme) {
    return cssTheme;
  }

  // Method 3: Return default light theme colors
  return getDefaultLightTheme();
}

/**
 * Attempt to read SharePoint theme from CSS custom properties
 */
function getThemeFromCssVariables(): ISharePointTheme | undefined {
  const root = document.documentElement;
  const style = getComputedStyle(root);

  // Try to get theme primary from CSS variable
  const themePrimary = style.getPropertyValue('--themePrimary')?.trim();
  if (!themePrimary) {
    return undefined;
  }

  return {
    themePrimary: themePrimary,
    themeDark: style.getPropertyValue('--themeDark')?.trim() || darkenColor(themePrimary, 20),
    themeDarker: style.getPropertyValue('--themeDarker')?.trim() || darkenColor(themePrimary, 40),
    themeLight: style.getPropertyValue('--themeLight')?.trim() || lightenColor(themePrimary, 30),
    themeLighter: style.getPropertyValue('--themeLighter')?.trim() || lightenColor(themePrimary, 50),
    themeLighterAlt: style.getPropertyValue('--themeLighterAlt')?.trim() || lightenColor(themePrimary, 70),
    themeTertiary: style.getPropertyValue('--themeTertiary')?.trim() || lightenColor(themePrimary, 20),
    themeSecondary: style.getPropertyValue('--themeSecondary')?.trim() || lightenColor(themePrimary, 10),
    neutralPrimary: style.getPropertyValue('--neutralPrimary')?.trim() || '#323130',
    neutralPrimaryAlt: style.getPropertyValue('--neutralPrimaryAlt')?.trim() || '#3b3a39',
    neutralSecondary: style.getPropertyValue('--neutralSecondary')?.trim() || '#605e5c',
    neutralSecondaryAlt: style.getPropertyValue('--neutralSecondaryAlt')?.trim() || '#8a8886',
    neutralTertiary: style.getPropertyValue('--neutralTertiary')?.trim() || '#a19f9d',
    neutralTertiaryAlt: style.getPropertyValue('--neutralTertiaryAlt')?.trim() || '#c8c6c4',
    neutralQuaternary: style.getPropertyValue('--neutralQuaternary')?.trim() || '#d2d0ce',
    neutralQuaternaryAlt: style.getPropertyValue('--neutralQuaternaryAlt')?.trim() || '#e1dfdd',
    neutralLight: style.getPropertyValue('--neutralLight')?.trim() || '#edebe9',
    neutralLighter: style.getPropertyValue('--neutralLighter')?.trim() || '#f3f2f1',
    neutralLighterAlt: style.getPropertyValue('--neutralLighterAlt')?.trim() || '#faf9f8',
    neutralDark: style.getPropertyValue('--neutralDark')?.trim() || '#201f1e',
    neutralDarker: style.getPropertyValue('--neutralDarker')?.trim() || '#11100f',
    black: style.getPropertyValue('--black')?.trim() || '#000000',
    white: style.getPropertyValue('--white')?.trim() || '#ffffff',
  };
}

/**
 * Get default SharePoint light theme colors
 * This matches the standard SharePoint Online light theme
 */
function getDefaultLightTheme(): ISharePointTheme {
  return {
    // Primary brand (SharePoint blue)
    themePrimary: '#0078d4',
    themeDark: '#106ebe',
    themeDarker: '#005a9e',
    themeLight: '#c7e0f4',
    themeLighter: '#deecf9',
    themeLighterAlt: '#eff6fc',
    themeTertiary: '#71afe5',
    themeSecondary: '#2b88d8',

    // Neutral palette (standard SharePoint grays)
    neutralPrimary: '#323130',
    neutralPrimaryAlt: '#3b3a39',
    neutralSecondary: '#605e5c',
    neutralSecondaryAlt: '#8a8886',
    neutralTertiary: '#a19f9d',
    neutralTertiaryAlt: '#c8c6c4',
    neutralQuaternary: '#d2d0ce',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralLight: '#edebe9',
    neutralLighter: '#f3f2f1',
    neutralLighterAlt: '#faf9f8',
    neutralDark: '#201f1e',
    neutralDarker: '#11100f',
    black: '#000000',
    white: '#ffffff',
  };
}

/**
 * Check if the current theme is dark
 */
export function isDarkTheme(spTheme?: ISharePointTheme): boolean {
  if (!spTheme) {
    return false;
  }
  const backgroundLuminance = calculateLuminance(spTheme.white || '#ffffff');
  return backgroundLuminance < 0.5;
}

/**
 * Get default SharePoint dark theme colors
 */
function getDefaultDarkTheme(): ISharePointTheme {
  return {
    // Primary brand (SharePoint blue - brighter for dark mode)
    themePrimary: '#2899f5',
    themeDark: '#52abf5',
    themeDarker: '#7cbdf7',
    themeLight: '#0d3259',
    themeLighter: '#082540',
    themeLighterAlt: '#031a2e',
    themeTertiary: '#1364a3',
    themeSecondary: '#1b7fcc',

    // Neutral palette (dark theme grays - inverted from light theme)
    neutralPrimary: '#ffffff',
    neutralPrimaryAlt: '#f3f2f1',
    neutralSecondary: '#d2d0ce',
    neutralSecondaryAlt: '#c8c6c4',
    neutralTertiary: '#a19f9d',
    neutralTertiaryAlt: '#605e5c',
    neutralQuaternary: '#484644',
    neutralQuaternaryAlt: '#3b3a39',
    neutralLight: '#323130',
    neutralLighter: '#252423',
    neutralLighterAlt: '#201f1e',
    neutralDark: '#f3f2f1',
    neutralDarker: '#ffffff',
    black: '#ffffff',
    white: '#1b1a19', // Dark background color
  };
}

export type ThemeMode = 'auto' | 'light' | 'dark';

/**
 * Get a Fluent UI v9 theme based on mode and SharePoint context
 */
export function getFluentTheme(context?: WebPartContext, themeMode: ThemeMode = 'light'): Theme {
  const spTheme = getSharePointTheme(context);

  // If mode is 'dark', force dark theme
  if (themeMode === 'dark') {
    const darkTheme = getDefaultDarkTheme();
    return createFluentThemeFromSharePoint(darkTheme);
  }

  // If mode is 'light', force light theme
  if (themeMode === 'light') {
    if (spTheme) {
      // Use SP theme but ensure it's light
      const lightSpTheme = { ...spTheme, white: '#ffffff' };
      return createFluentThemeFromSharePoint(lightSpTheme);
    }
    return webLightTheme;
  }

  // Auto mode - use SharePoint theme if available
  if (spTheme) {
    return createFluentThemeFromSharePoint(spTheme);
  }

  return webLightTheme;
}
