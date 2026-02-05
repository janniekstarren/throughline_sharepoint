// ============================================
// Context Switching Card Styles
// Fluent 2 design system styles
// ============================================

import { makeStyles, tokens } from '@fluentui/react-components';
import { cardTokens } from '../../styles/designTokens';

export const useContextSwitchingStyles = makeStyles({
  // Card container
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: cardTokens.colors.cardBackground,
    borderRadius: cardTokens.borderRadius.card,
    boxShadow: cardTokens.shadow.rest,
    overflow: 'hidden',
    transitionProperty: 'box-shadow',
    transitionDuration: cardTokens.transition.normal,
    ':hover': {
      boxShadow: cardTokens.shadow.hover,
    },
  },

  // Header section
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${cardTokens.spacing.cardPaddingLarge} ${cardTokens.spacing.cardPaddingLarge} ${cardTokens.spacing.headerPadding}`,
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },

  // Focus score circle
  focusScoreContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: tokens.spacingVerticalM,
  },

  focusScoreCircle: {
    position: 'relative',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  focusScoreSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },

  focusScoreBackground: {
    fill: 'none',
    stroke: tokens.colorNeutralStroke2,
    strokeWidth: 8,
  },

  focusScoreProgress: {
    fill: 'none',
    strokeWidth: 8,
    strokeLinecap: 'round',
    transition: 'stroke-dashoffset 0.5s ease',
  },

  focusScoreValue: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  },

  focusScoreNumber: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    lineHeight: 1,
  },

  focusScoreLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },

  focusScoreDescription: {
    marginTop: tokens.spacingVerticalS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
  },

  // Stats row - more breathing room
  statsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    margin: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalS}`,
  },

  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXXS,
  },

  statValue: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },

  statLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  // Tab container
  tabContainer: {
    padding: `0 ${cardTokens.spacing.cardPaddingLarge}`,
    marginBottom: tokens.spacingVerticalS,
  },

  // Content area
  content: {
    flex: 1,
    padding: `0 ${cardTokens.spacing.cardPaddingLarge} ${cardTokens.spacing.cardPaddingLarge}`,
    overflowY: 'auto',
    minHeight: 0,
  },

  // Hourly chart
  chartContainer: {
    padding: tokens.spacingHorizontalM,
  },

  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalS,
  },

  chartTitle: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },

  hourlyChart: {
    height: '80px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
    paddingBottom: tokens.spacingVerticalXS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },

  hourlyBar: {
    flex: 1,
    borderRadius: `${tokens.borderRadiusSmall} ${tokens.borderRadiusSmall} 0 0`,
    minHeight: '4px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    ':hover': {
      opacity: 0.8,
      transform: 'scaleY(1.05)',
      transformOrigin: 'bottom',
    },
  },

  chartXAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: tokens.spacingVerticalXS,
  },

  chartXLabel: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground4,
  },

  // Distribution chart (donut)
  distributionContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    padding: tokens.spacingHorizontalM,
  },

  donutContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    flexShrink: 0,
  },

  donutSvg: {
    transform: 'rotate(-90deg)',
  },

  donutCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },

  donutValue: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
  },

  donutLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  legendContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    flex: 1,
  },

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },

  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    flexShrink: 0,
  },

  legendText: {
    flex: 1,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },

  legendValue: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    minWidth: '30px',
    textAlign: 'right',
  },

  // Timeline/list view
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },

  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },

  timelineIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    flexShrink: 0,
  },

  timelineContent: {
    flex: 1,
    minWidth: 0,
  },

  timelineTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  timelineSubtitle: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  timelineDuration: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
  },

  // Trend chart
  trendContainer: {
    padding: tokens.spacingHorizontalM,
  },

  trendChart: {
    height: '80px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    paddingBottom: tokens.spacingVerticalXS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },

  trendBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },

  trendBarInner: {
    width: '100%',
    borderRadius: `${tokens.borderRadiusSmall} ${tokens.borderRadiusSmall} 0 0`,
    minHeight: '4px',
    transition: 'height 0.2s ease',
  },

  trendStats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: tokens.spacingVerticalS,
  },

  trendStat: {
    display: 'flex',
    flexDirection: 'column',
  },

  trendStatValue: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },

  trendStatLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  // Footer - consistent with other cards
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },

  footerText: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  // Current context indicator
  currentContext: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    margin: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalS}`,
  },

  currentContextIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: tokens.borderRadiusMedium,
  },

  currentContextInfo: {
    flex: 1,
    minWidth: 0,
  },

  currentContextLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  currentContextName: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  currentContextTime: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },

  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalM,
    textAlign: 'center',
  },

  emptyIcon: {
    fontSize: '48px',
    opacity: 0.5,
  },

  // Loading state
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    gap: tokens.spacingVerticalM,
  },

  // Mini card styles
  miniCard: {
    minHeight: '120px',
    maxHeight: '120px',
  },

  miniContent: {
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacingHorizontalM,
    gap: tokens.spacingHorizontalM,
  },

  miniFocusScore: {
    position: 'relative',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  miniStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    flex: 1,
  },

  miniStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  miniStatLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  miniStatValue: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },

  // Divider
  divider: {
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke3,
    margin: `${tokens.spacingVerticalS} 0`,
  },
});
