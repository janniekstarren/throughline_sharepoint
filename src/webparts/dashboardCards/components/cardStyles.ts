import { makeStyles, tokens } from '@fluentui/react-components';
import {
  createPresenceComponent,
  motionTokens,
} from '@fluentui/react-motion';
import { cardTokens, utilityStyles } from '../styles/designTokens';

// ============================================
// MOTION COMPONENTS
// ============================================

export const CardEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMid,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMid,
  },
});

export const ListItemEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateX(-8px)' },
      { opacity: 1, transform: 'translateX(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMid,
  },
  exit: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMid,
  },
});

// ============================================
// SHARED CARD STYLES
// Modern Fluent 2 - Clean, Minimal, Sophisticated
// Using centralized design tokens for consistency
// ============================================

export const useCardStyles = makeStyles({
  // Base card container
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%', // Fill the masonry column width
    minHeight: cardTokens.size.cardMinHeight,
    height: cardTokens.size.cardStandardHeight,
    maxHeight: cardTokens.size.cardMaxHeight,
    backgroundColor: cardTokens.colors.cardBackground,
    borderRadius: cardTokens.borderRadius.card,
    boxShadow: cardTokens.shadow.rest,
    overflow: 'hidden',
    transitionProperty: 'box-shadow, transform',
    transitionDuration: cardTokens.transition.normal,
    transitionTimingFunction: cardTokens.transition.easing,
    ':hover': {
      boxShadow: cardTokens.shadow.hover,
    },
  },

  // Large card variant (full width, taller)
  cardLarge: {
    minHeight: cardTokens.size.cardLargeMinHeight,
    maxHeight: cardTokens.size.cardLargeMaxHeight,
  },

  // Height variants for masonry layout
  cardCompact: {
    height: cardTokens.size.cardCompactHeight,
    minHeight: cardTokens.size.cardCompactHeight,
    maxHeight: cardTokens.size.cardCompactHeight,
  },

  cardStandard: {
    height: cardTokens.size.cardStandardHeight,
    minHeight: cardTokens.size.cardMinHeight,
    maxHeight: cardTokens.size.cardMaxHeight,
  },

  cardTall: {
    height: cardTokens.size.cardTallHeight,
    minHeight: cardTokens.size.cardStandardHeight,
    maxHeight: cardTokens.size.cardTallHeight,
  },

  // Auto height for dynamic content
  cardAuto: {
    height: 'auto',
    minHeight: cardTokens.size.cardMinHeight,
    maxHeight: cardTokens.size.cardMaxHeight,
  },

  // Clean header - NO gray background, NO border
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: cardTokens.spacing.iconGap,
    padding: `${cardTokens.spacing.cardPaddingLarge} ${cardTokens.spacing.cardPaddingLarge} ${cardTokens.spacing.headerPadding}`,
    flexShrink: 0,
  },

  // Header with subtle background
  cardHeaderSubtle: {
    backgroundColor: cardTokens.colors.headerBackgroundSubtle,
    borderBottom: `1px solid ${cardTokens.colors.borderSubtle}`,
  },

  cardIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: cardTokens.size.headerIconSize,
    height: cardTokens.size.headerIconSize,
    borderRadius: cardTokens.borderRadius.cardSubtle,
    backgroundColor: cardTokens.colors.iconWrapperBackground,
  },

  cardIcon: {
    fontSize: cardTokens.size.iconSmall,
    color: cardTokens.colors.iconBrand,
  },

  cardTitle: {
    flex: 1,
    fontSize: cardTokens.typography.titleSize,
    fontWeight: cardTokens.typography.titleWeight,
    color: cardTokens.colors.textPrimary,
    letterSpacing: '-0.01em',
    ...utilityStyles.truncate,
  },

  // Badge in header
  badge: {
    marginLeft: 'auto',
    padding: `2px ${cardTokens.spacing.badgeGap}`,
    paddingLeft: cardTokens.spacing.iconGap,
    paddingRight: cardTokens.spacing.iconGap,
    borderRadius: cardTokens.borderRadius.badge,
    backgroundColor: cardTokens.colors.brandBackgroundSubtle,
    color: cardTokens.colors.brand,
    fontSize: cardTokens.typography.badgeSize,
    fontWeight: cardTokens.typography.badgeWeight,
  },

  badgeWarning: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground2,
  },

  badgeDanger: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
  },

  badgeSuccess: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground2,
  },

  // Content area with custom scrollbar
  cardContent: {
    flex: 1,
    padding: `0 ${cardTokens.spacing.cardPaddingLarge} ${cardTokens.spacing.cardPaddingLarge}`,
    overflowY: 'auto',
    minHeight: 0,
    '::-webkit-scrollbar': {
      width: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      background: cardTokens.colors.borderSubtle,
      borderRadius: '3px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: cardTokens.colors.border,
    },
  },

  // Content with compact padding
  cardContentCompact: {
    padding: `0 ${cardTokens.spacing.cardPadding} ${cardTokens.spacing.cardPadding}`,
  },

  // State containers
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${cardTokens.spacing.cardPaddingLarge} ${cardTokens.spacing.cardPadding}`,
    flex: 1,
    gap: cardTokens.spacing.sectionGap,
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${cardTokens.spacing.cardPaddingLarge} ${cardTokens.spacing.cardPadding}`,
    color: cardTokens.colors.textTertiary,
    gap: cardTokens.spacing.sectionGap,
    textAlign: 'center',
  },

  errorIcon: {
    fontSize: cardTokens.size.iconXLarge,
    color: cardTokens.colors.textDanger,
    opacity: 0.5,
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${cardTokens.spacing.cardPaddingLarge} ${cardTokens.spacing.cardPadding}`,
    color: cardTokens.colors.textTertiary,
    gap: cardTokens.spacing.sectionGap,
    textAlign: 'center',
  },

  emptyIcon: {
    fontSize: cardTokens.size.iconXLarge,
    color: tokens.colorNeutralForeground4,
    opacity: 0.5,
  },

  emptyTitle: {
    fontSize: cardTokens.typography.itemTitleSize,
    fontWeight: cardTokens.typography.itemTitleWeight,
    color: cardTokens.colors.textSecondary,
  },

  emptyDescription: {
    fontSize: cardTokens.typography.itemSubtitleSize,
    color: cardTokens.colors.textTertiary,
  },

  // Item list
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: cardTokens.spacing.itemGapSmall,
  },

  // Clean item - NO gray background, hover only
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: `${cardTokens.spacing.contentPadding} ${cardTokens.spacing.cardPadding}`,
    borderRadius: cardTokens.borderRadius.item,
    backgroundColor: cardTokens.colors.itemBackground,
    textDecoration: 'none',
    color: 'inherit',
    gap: cardTokens.spacing.sectionGap,
    transitionProperty: 'background-color, transform',
    transitionDuration: cardTokens.transition.fast,
    transitionTimingFunction: cardTokens.transition.easing,
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    ':hover': {
      backgroundColor: cardTokens.colors.itemBackgroundHover,
    },
    ':focus-visible': {
      ...utilityStyles.focusOutline,
      outlineOffset: '-2px',
    },
  },

  // Compact item variant
  itemCompact: {
    padding: `${cardTokens.spacing.itemGap} ${cardTokens.spacing.sectionGap}`,
    gap: cardTokens.spacing.iconGap,
  },

  // Highlighted item (current event, overdue task)
  itemHighlight: {
    position: 'relative',
    backgroundColor: cardTokens.colors.brandBackgroundSubtle,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
    '::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: cardTokens.spacing.itemGap,
      bottom: cardTokens.spacing.itemGap,
      width: '3px',
      borderRadius: '2px',
      backgroundColor: cardTokens.colors.brand,
    },
  },

  itemHighlightWarning: {
    backgroundColor: cardTokens.colors.warningSubtle,
    ':hover': {
      backgroundColor: tokens.colorPaletteYellowBackground2,
    },
    '::before': {
      backgroundColor: tokens.colorPaletteYellowForeground1,
    },
  },

  itemHighlightError: {
    backgroundColor: cardTokens.colors.dangerSubtle,
    ':hover': {
      backgroundColor: tokens.colorPaletteRedBackground2,
    },
    '::before': {
      backgroundColor: cardTokens.colors.textDanger,
    },
  },

  itemHighlightSuccess: {
    backgroundColor: cardTokens.colors.successSubtle,
    ':hover': {
      backgroundColor: tokens.colorPaletteGreenBackground2,
    },
    '::before': {
      backgroundColor: tokens.colorPaletteGreenForeground1,
    },
  },

  // Item icon container
  itemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: cardTokens.size.itemIconSize,
    height: cardTokens.size.itemIconSize,
    borderRadius: cardTokens.borderRadius.cardSubtle,
    backgroundColor: cardTokens.colors.iconWrapperBackground,
    color: cardTokens.colors.iconBrand,
    fontSize: cardTokens.size.iconSmall,
    flexShrink: 0,
  },

  // Smaller icon container variant
  itemIconSmall: {
    width: cardTokens.size.avatarMedium,
    height: cardTokens.size.avatarMedium,
  },

  // Item content
  itemContent: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  itemTitle: {
    fontSize: cardTokens.typography.itemTitleSize,
    fontWeight: cardTokens.typography.itemTitleWeight,
    color: cardTokens.colors.textPrimary,
    lineHeight: '1.4',
    ...utilityStyles.truncate,
  },

  itemSubtitle: {
    fontSize: cardTokens.typography.itemSubtitleSize,
    color: cardTokens.colors.textTertiary,
    lineHeight: '1.4',
    ...utilityStyles.truncate,
  },

  itemMeta: {
    fontSize: cardTokens.typography.metaSize,
    color: tokens.colorNeutralForeground4,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    fontWeight: cardTokens.typography.metaWeight,
  },

  // Two-line subtitle (for previews)
  itemSubtitleMultiline: {
    ...utilityStyles.truncateMultiline,
    whiteSpace: 'normal',
  },

  // Time display
  timeBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '50px',
    flexShrink: 0,
  },

  timeMain: {
    fontSize: '13px',
    fontWeight: cardTokens.typography.titleWeight,
    color: cardTokens.colors.textPrimary,
  },

  timeSub: {
    fontSize: cardTokens.typography.metaSize,
    color: tokens.colorNeutralForeground4,
  },

  // Avatar
  avatar: {
    width: cardTokens.size.avatarLarge,
    height: cardTokens.size.avatarLarge,
    borderRadius: cardTokens.borderRadius.avatar,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: cardTokens.colors.subtleBackground,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarSmall: {
    width: cardTokens.size.avatarSmall,
    height: cardTokens.size.avatarSmall,
  },

  avatarMedium: {
    width: cardTokens.size.avatarMedium,
    height: cardTokens.size.avatarMedium,
  },

  // Action button
  actionButton: {
    flexShrink: 0,
    borderRadius: cardTokens.borderRadius.button,
    transitionProperty: 'transform, box-shadow',
    transitionDuration: cardTokens.transition.fast,
    ':hover': {
      transform: 'scale(1.05)',
    },
    ':active': {
      transform: 'scale(0.98)',
    },
  },

  // Grid layout (for Quick Links)
  gridLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: cardTokens.spacing.itemGap,
  },

  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: cardTokens.spacing.itemGap,
    padding: `${cardTokens.spacing.cardPadding} ${cardTokens.spacing.itemGap}`,
    borderRadius: cardTokens.borderRadius.item,
    backgroundColor: cardTokens.colors.itemBackground,
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: cardTokens.transition.fast,
    transitionTimingFunction: cardTokens.transition.easing,
    ':hover': {
      backgroundColor: cardTokens.colors.itemBackgroundHover,
      transform: 'translateY(-2px)',
    },
    ':focus-visible': {
      ...utilityStyles.focusOutline,
      outlineOffset: '-2px',
    },
  },

  gridItemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: cardTokens.borderRadius.card,
    backgroundColor: cardTokens.colors.iconWrapperBackground,
    color: cardTokens.colors.iconBrand,
    fontSize: cardTokens.size.iconMedium,
  },

  gridItemLabel: {
    fontSize: cardTokens.typography.itemSubtitleSize,
    fontWeight: cardTokens.typography.itemTitleWeight,
    color: cardTokens.colors.textPrimary,
    textAlign: 'center',
    lineHeight: '1.3',
    ...utilityStyles.truncateMultiline,
  },

  // Day group header (for upcoming week)
  dayHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: cardTokens.spacing.sectionGap,
    color: cardTokens.colors.brand,
    fontSize: cardTokens.typography.metaSize,
    fontWeight: cardTokens.typography.titleWeight,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: cardTokens.spacing.itemGap,
    marginTop: cardTokens.spacing.cardPadding,
    ':first-child': {
      marginTop: 0,
    },
  },

  // Section divider
  sectionDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: cardTokens.spacing.itemGap,
    padding: `${cardTokens.spacing.headerPadding} 0`,
  },

  sectionDividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: cardTokens.colors.borderSubtle,
  },

  sectionDividerText: {
    fontSize: cardTokens.typography.metaSize,
    fontWeight: cardTokens.typography.metaWeight,
    color: cardTokens.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Card footer
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${cardTokens.spacing.footerPadding} ${cardTokens.spacing.cardPaddingLarge}`,
    borderTop: `1px solid ${cardTokens.colors.borderSubtle}`,
  },

  footerText: {
    fontSize: cardTokens.typography.metaSize,
    color: cardTokens.colors.textTertiary,
  },

  // Tabs/View switcher in header
  tabList: {
    display: 'flex',
    gap: cardTokens.spacing.itemGapSmall,
    padding: `0 ${cardTokens.spacing.cardPaddingLarge}`,
    marginBottom: cardTokens.spacing.headerPadding,
  },

  tab: {
    padding: `${cardTokens.spacing.itemGapSmall} ${cardTokens.spacing.sectionGap}`,
    borderRadius: cardTokens.borderRadius.button,
    fontSize: cardTokens.typography.itemSubtitleSize,
    fontWeight: cardTokens.typography.itemTitleWeight,
    color: cardTokens.colors.textSecondary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transitionProperty: 'background-color, color',
    transitionDuration: cardTokens.transition.fast,
    ':hover': {
      backgroundColor: cardTokens.colors.subtleBackgroundHover,
    },
  },

  tabActive: {
    backgroundColor: cardTokens.colors.brandBackgroundSubtle,
    color: cardTokens.colors.brand,
  },

  // Filter bar
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: cardTokens.spacing.itemGap,
    padding: `${cardTokens.spacing.itemGap} ${cardTokens.spacing.cardPaddingLarge}`,
    borderBottom: `1px solid ${cardTokens.colors.borderSubtle}`,
  },

  // Relationship badge
  relationshipBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: cardTokens.spacing.badgeGap,
    padding: `2px ${cardTokens.spacing.itemGapSmall}`,
    borderRadius: cardTokens.borderRadius.badge,
    fontSize: cardTokens.typography.metaSize,
    fontWeight: cardTokens.typography.metaWeight,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },

  relationshipManager: {
    backgroundColor: tokens.colorPalettePurpleBackground2,
    color: tokens.colorPalettePurpleForeground2,
  },

  relationshipDirectReport: {
    backgroundColor: tokens.colorPaletteTealBackground2,
    color: tokens.colorPaletteTealForeground2,
  },

  relationshipFrequent: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },

  relationshipExternal: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },

  // ============================================
  // Card Header Actions (expand, settings, etc.)
  // ============================================

  // Header action button container
  cardHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: cardTokens.spacing.itemGapSmall,
    marginLeft: 'auto',
  },

  // Expand button - appears on hover
  cardExpandButton: {
    minWidth: '28px',
    width: '28px',
    height: '28px',
    padding: 0,
    borderRadius: cardTokens.borderRadius.button,
    color: cardTokens.colors.textTertiary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    opacity: 0,
    transitionProperty: 'opacity, background-color, color',
    transitionDuration: cardTokens.transition.fast,
    ':hover': {
      backgroundColor: cardTokens.colors.subtleBackgroundHover,
      color: cardTokens.colors.textPrimary,
    },
    ':focus-visible': {
      opacity: 1,
      ...utilityStyles.focusOutline,
    },
  },

  // Show expand button on card hover
  cardExpandButtonVisible: {
    opacity: 1,
  },

  // Settings/more button
  cardSettingsButton: {
    minWidth: '28px',
    width: '28px',
    height: '28px',
    padding: 0,
    borderRadius: cardTokens.borderRadius.button,
    color: cardTokens.colors.textTertiary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transitionProperty: 'background-color, color',
    transitionDuration: cardTokens.transition.fast,
    ':hover': {
      backgroundColor: cardTokens.colors.subtleBackgroundHover,
      color: cardTokens.colors.textPrimary,
    },
    ':focus-visible': {
      ...utilityStyles.focusOutline,
    },
  },
});

// ============================================
// Re-export design tokens for direct use
// ============================================
export { cardTokens, utilityStyles } from '../styles/designTokens';
