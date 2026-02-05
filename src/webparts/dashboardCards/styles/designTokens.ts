// ============================================
// Design Tokens - Fluent2 Unified Styling System
// ============================================
// This file provides a centralized token system for consistent styling
// across all dashboard card components. All values use Fluent UI v9 tokens.

import { tokens } from '@fluentui/react-components';

// ============================================
// Card Tokens
// ============================================

export const cardTokens = {
  // Border Radius
  borderRadius: {
    card: tokens.borderRadiusXLarge,        // 12px - main card container
    cardSubtle: tokens.borderRadiusLarge,   // 8px - inner sections
    item: tokens.borderRadiusMedium,        // 6px - list items
    button: tokens.borderRadiusMedium,      // 6px - buttons
    badge: tokens.borderRadiusCircular,     // pill shape for badges
    avatar: tokens.borderRadiusCircular,    // circular avatars
    input: tokens.borderRadiusMedium,       // 6px - input fields
  },

  // Shadows (using Fluent tokens)
  shadow: {
    rest: tokens.shadow4,                   // subtle shadow at rest
    hover: tokens.shadow8,                  // elevated on hover
    elevated: tokens.shadow16,              // dialogs, popovers
    focus: tokens.shadow4,                  // focus state shadow
  },

  // Spacing
  spacing: {
    // Card-level spacing
    cardPadding: tokens.spacingHorizontalL,       // 16px
    cardPaddingLarge: tokens.spacingHorizontalXL, // 20px
    headerPadding: tokens.spacingVerticalM,       // 12px
    contentPadding: tokens.spacingVerticalM,      // 12px
    footerPadding: tokens.spacingVerticalS,       // 8px

    // Element spacing
    itemGap: tokens.spacingVerticalS,             // 8px - between list items
    itemGapSmall: tokens.spacingVerticalXS,       // 4px - tight spacing
    sectionGap: tokens.spacingVerticalM,          // 12px - between sections
    iconGap: tokens.spacingHorizontalS,           // 8px - icon to text
    badgeGap: tokens.spacingHorizontalXS,         // 4px - badge spacing

    // Component internal spacing
    buttonPaddingH: tokens.spacingHorizontalM,    // 12px
    buttonPaddingV: tokens.spacingVerticalS,      // 8px
    inputPaddingH: tokens.spacingHorizontalM,     // 12px
    inputPaddingV: tokens.spacingVerticalSNudge,  // 6px
  },

  // Sizing
  size: {
    // Card dimensions
    cardMinWidth: '380px',        // Minimum card width for readability
    cardMinHeight: '280px',       // Reduced for compact cards
    cardStandardHeight: '400px',  // Standard card height
    cardMaxHeight: '520px',       // Maximum card height
    cardLargeMinHeight: '320px',
    cardLargeMaxHeight: '520px',

    // Height variants
    cardCompactHeight: '280px',   // For summary/quick links cards
    cardTallHeight: '520px',      // For content-heavy cards

    // Icon sizes
    iconSmall: '16px',
    iconMedium: '20px',
    iconLarge: '24px',
    iconXLarge: '32px',

    // Avatar sizes
    avatarSmall: '24px',
    avatarMedium: '32px',
    avatarLarge: '40px',

    // Header icon wrapper
    headerIconSize: '32px',

    // Item icon wrapper
    itemIconSize: '40px',
  },

  // Typography
  typography: {
    // Card title
    titleSize: tokens.fontSizeBase400,            // 16px
    titleWeight: tokens.fontWeightSemibold,       // 600
    titleLineHeight: tokens.lineHeightBase400,    // 22px

    // Section/group title
    sectionTitleSize: tokens.fontSizeBase300,     // 14px
    sectionTitleWeight: tokens.fontWeightSemibold,

    // Item primary text
    itemTitleSize: tokens.fontSizeBase300,        // 14px
    itemTitleWeight: tokens.fontWeightSemibold,

    // Item secondary text
    itemSubtitleSize: tokens.fontSizeBase200,     // 12px
    itemSubtitleWeight: tokens.fontWeightRegular,

    // Metadata/caption
    metaSize: tokens.fontSizeBase100,             // 10px
    metaWeight: tokens.fontWeightMedium,          // 500

    // Badge text
    badgeSize: tokens.fontSizeBase100,            // 10px
    badgeWeight: tokens.fontWeightSemibold,
  },

  // Colors - Surface & Background
  colors: {
    // Card backgrounds
    cardBackground: tokens.colorNeutralBackground1,
    cardBackgroundHover: tokens.colorNeutralBackground1Hover,
    cardBackgroundPressed: tokens.colorNeutralBackground1Pressed,

    // Header backgrounds
    headerBackground: 'transparent',
    headerBackgroundSubtle: tokens.colorNeutralBackground2,

    // Item backgrounds
    itemBackground: 'transparent',
    itemBackgroundHover: tokens.colorNeutralBackground3,
    itemBackgroundSelected: tokens.colorNeutralBackground3Selected,
    itemBackgroundPressed: tokens.colorNeutralBackground3Pressed,

    // Subtle backgrounds
    subtleBackground: tokens.colorNeutralBackground2,
    subtleBackgroundHover: tokens.colorNeutralBackground2Hover,

    // Icon wrapper backgrounds
    iconWrapperBackground: tokens.colorBrandBackground2,
    iconWrapperBackgroundHover: tokens.colorBrandBackground2Hover,

    // Text colors
    textPrimary: tokens.colorNeutralForeground1,
    textSecondary: tokens.colorNeutralForeground2,
    textTertiary: tokens.colorNeutralForeground3,
    textDisabled: tokens.colorNeutralForegroundDisabled,
    textBrand: tokens.colorBrandForeground1,
    textSuccess: tokens.colorPaletteGreenForeground1,
    textWarning: tokens.colorPaletteYellowForeground1,
    textDanger: tokens.colorPaletteRedForeground1,

    // Border colors
    border: tokens.colorNeutralStroke1,
    borderSubtle: tokens.colorNeutralStroke2,
    borderHover: tokens.colorNeutralStroke1Hover,
    borderFocus: tokens.colorBrandStroke1,
    borderTransparent: 'transparent',

    // Brand colors
    brand: tokens.colorBrandForeground1,
    brandBackground: tokens.colorBrandBackground,
    brandBackgroundSubtle: tokens.colorBrandBackground2,

    // Status colors
    success: tokens.colorPaletteGreenBackground3,
    successSubtle: tokens.colorPaletteGreenBackground1,
    warning: tokens.colorPaletteYellowBackground3,
    warningSubtle: tokens.colorPaletteYellowBackground1,
    danger: tokens.colorPaletteRedBackground3,
    dangerSubtle: tokens.colorPaletteRedBackground1,

    // Icon colors
    iconPrimary: tokens.colorNeutralForeground1,
    iconSecondary: tokens.colorNeutralForeground2,
    iconBrand: tokens.colorBrandForeground1,
    iconOnBrand: tokens.colorNeutralForegroundOnBrand,
  },

  // Transitions
  transition: {
    fast: tokens.durationFast,                    // 100ms
    normal: tokens.durationNormal,                // 200ms
    slow: tokens.durationSlow,                    // 300ms
    easing: tokens.curveEasyEase,                 // ease-in-out
    easingAccelerate: tokens.curveAccelerateMax,  // ease-in
    easingDecelerate: tokens.curveDecelerateMax,  // ease-out
  },
};

// ============================================
// Semantic Tokens for Specific Use Cases
// ============================================

export const semanticTokens = {
  // Waiting On You card (Blue theme)
  waitingOnYou: {
    accent: tokens.colorBrandForeground1,
    accentBackground: tokens.colorBrandBackground2,
    urgentBackground: tokens.colorPaletteRedBackground1,
    urgentForeground: tokens.colorPaletteRedForeground1,
  },

  // Waiting On Others card (Purple theme)
  waitingOnOthers: {
    accent: tokens.colorPaletteBerryForeground1,
    accentBackground: tokens.colorPaletteBerryBackground2,
    reminderBackground: tokens.colorPaletteYellowBackground1,
    reminderForeground: tokens.colorPaletteYellowForeground1,
  },

  // Calendar/Agenda cards
  calendar: {
    accent: tokens.colorPaletteBlueForeground2,
    accentBackground: tokens.colorPaletteBlueBackground2,
    meetingOnline: tokens.colorPalettePurpleForeground2,
    meetingInPerson: tokens.colorPaletteBlueForeground2,
  },

  // Tasks card
  tasks: {
    accent: tokens.colorPaletteGreenForeground1,
    accentBackground: tokens.colorPaletteGreenBackground2,
    overdue: tokens.colorPaletteRedForeground1,
    dueToday: tokens.colorPaletteYellowForeground1,
  },

  // Email cards
  email: {
    accent: tokens.colorBrandForeground1,
    accentBackground: tokens.colorBrandBackground2,
    flagged: tokens.colorPaletteRedForeground1,
    unread: tokens.colorBrandForeground1,
  },

  // Files cards
  files: {
    accent: tokens.colorPaletteTealForeground2,
    accentBackground: tokens.colorPaletteTealBackground2,
  },

  // People cards
  people: {
    accent: tokens.colorPalettePurpleForeground2,
    accentBackground: tokens.colorPalettePurpleBackground2,
  },
};

// ============================================
// Utility Styles
// ============================================

export const utilityStyles = {
  // Truncate text with ellipsis
  truncate: {
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },

  // Multi-line truncate (2 lines)
  truncateMultiline: {
    overflow: 'hidden' as const,
    display: '-webkit-box' as const,
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
  },

  // Flex center
  flexCenter: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Flex between
  flexBetween: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },

  // Flex start
  flexStart: {
    display: 'flex' as const,
    alignItems: 'flex-start' as const,
  },

  // Flex column
  flexColumn: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
  },

  // Scrollable container
  scrollable: {
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
  },

  // Focus visible outline
  focusOutline: {
    outlineStyle: 'solid' as const,
    outlineWidth: '2px',
    outlineColor: tokens.colorBrandStroke1,
    outlineOffset: '2px',
  },

  // Interactive element reset
  interactiveReset: {
    cursor: 'pointer' as const,
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
    color: 'inherit',
  },
};

// ============================================
// Breakpoints
// ============================================

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
};

// ============================================
// Z-Index Scale
// ============================================

export const zIndex = {
  card: 1,
  cardHover: 2,
  dropdown: 100,
  modal: 1000,
  tooltip: 1100,
  toast: 1200,
};
