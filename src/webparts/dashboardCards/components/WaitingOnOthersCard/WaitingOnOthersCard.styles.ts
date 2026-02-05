import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    ...shorthands.borderRadius(tokens.borderRadiusXLarge), // 12px - consistent with other cards
    boxShadow: tokens.shadow4,
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  headerActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  subheader: {
    color: tokens.colorNeutralForeground3,
  },
  tabContainer: {
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalXS,
  },
  divider: {
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalS,
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacingVerticalXXL,
    flex: 1,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    flex: 1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    gap: tokens.spacingVerticalS,
    flex: 1,
  },
  emptyIcon: {
    fontSize: '32px', // Consistent with cardTokens.size.iconXLarge
    color: tokens.colorNeutralForeground4,
    opacity: 0.5, // Match shared EmptyState styling
  },
  emptySubtext: {
    color: tokens.colorNeutralForeground3,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  footerText: {
    color: tokens.colorNeutralForeground3,
  },
  // Chart section styling
  chartSection: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    marginLeft: tokens.spacingHorizontalM,
    marginRight: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalS,
    overflow: 'hidden',
  },
});
