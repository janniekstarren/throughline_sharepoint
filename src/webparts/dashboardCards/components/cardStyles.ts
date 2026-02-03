import { makeStyles, tokens } from '@fluentui/react-components';
import {
  createPresenceComponent,
  motionTokens,
} from '@fluentui/react-motion';

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
// ============================================

export const useCardStyles = makeStyles({
  // Base card container
  card: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '320px',
    maxHeight: '440px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    transitionProperty: 'box-shadow, transform',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.67, 1)',
    ':hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)',
    },
  },

  // Clean header - NO gray background, NO border
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px 14px',
    flexShrink: 0,
  },

  cardIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground2,
  },

  cardIcon: {
    fontSize: '16px',
    color: tokens.colorBrandForeground1,
  },

  cardTitle: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
    letterSpacing: '-0.01em',
  },

  // Badge in header
  badge: {
    marginLeft: 'auto',
    padding: '2px 10px',
    borderRadius: '100px',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '11px',
    fontWeight: '600',
  },

  badgeWarning: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground2,
  },

  // Content area with custom scrollbar
  cardContent: {
    flex: 1,
    padding: '0 24px 20px',
    overflowY: 'auto',
    minHeight: 0,
    '::-webkit-scrollbar': {
      width: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke2,
      borderRadius: '3px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: tokens.colorNeutralStroke1,
    },
  },

  // State containers
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    flex: 1,
    gap: '12px',
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: tokens.colorNeutralForeground3,
    gap: '12px',
    textAlign: 'center',
  },

  errorIcon: {
    fontSize: '40px',
    color: tokens.colorPaletteRedForeground1,
    opacity: 0.5,
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: tokens.colorNeutralForeground3,
    gap: '12px',
    textAlign: 'center',
  },

  emptyIcon: {
    fontSize: '40px',
    color: tokens.colorNeutralForeground4,
    opacity: 0.5,
  },

  // Item list
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  // Clean item - NO gray background, hover only
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '14px 16px',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    textDecoration: 'none',
    color: 'inherit',
    gap: '14px',
    transitionProperty: 'background-color, transform',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.67, 1)',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '-2px',
    },
  },

  // Highlighted item (current event, overdue task)
  itemHighlight: {
    position: 'relative',
    backgroundColor: tokens.colorBrandBackground2,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
    '::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '8px',
      bottom: '8px',
      width: '3px',
      borderRadius: '2px',
      backgroundColor: tokens.colorBrandForeground1,
    },
  },

  itemHighlightError: {
    '::before': {
      backgroundColor: tokens.colorPaletteRedForeground1,
    },
  },

  // Item icon container
  itemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '16px',
    flexShrink: 0,
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
    fontSize: '14px',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
    lineHeight: '1.4',
  },

  itemSubtitle: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  itemMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground4,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    fontWeight: '500',
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
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
  },

  timeSub: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground4,
  },

  // Avatar
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Action button
  actionButton: {
    flexShrink: 0,
    borderRadius: '8px',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.15s',
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
    gap: '8px',
  },

  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 8px',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.67, 1)',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      transform: 'translateY(-2px)',
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '-2px',
    },
  },

  gridItemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '20px',
  },

  gridItemLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: tokens.colorNeutralForeground1,
    textAlign: 'center',
    lineHeight: '1.3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },

  // Day group header (for upcoming week)
  dayHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: tokens.colorBrandForeground1,
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    marginTop: '16px',
    ':first-child': {
      marginTop: 0,
    },
  },
});
