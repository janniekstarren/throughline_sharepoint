import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useStyles = makeStyles({
  card: {
    width: '100%',
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: tokens.shadow4,
    backgroundColor: tokens.colorNeutralBackground1,
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
    gap: tokens.spacingHorizontalXXS,
  },
  subheader: {
    color: tokens.colorNeutralForeground3,
  },
  tabContainer: {
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
  divider: {
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalS,
  },
  content: {
    maxHeight: '400px',
    overflowY: 'auto',
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacingVerticalXXL,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    gap: tokens.spacingVerticalS,
  },
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptySubtext: {
    color: tokens.colorNeutralForeground3,
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    padding: tokens.spacingVerticalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  footerText: {
    color: tokens.colorNeutralForeground4,
  },
});
