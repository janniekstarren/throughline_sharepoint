// ============================================
// DashboardFooter - Stats bar at bottom of dashboard
// Shows total, accessible, pinned, and locked counts
// ============================================

import * as React from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';
import { useLicense } from '../../context/LicenseContext';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalL,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    marginTop: tokens.spacingVerticalL,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground2,
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  statValue: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
  },
  separator: {
    color: tokens.colorNeutralStroke2,
  },
});

// ============================================
// Props
// ============================================

interface DashboardFooterProps {
  pinnedCount: number;
}

// ============================================
// Component
// ============================================

export const DashboardFooter: React.FC<DashboardFooterProps> = ({ pinnedCount }) => {
  const classes = useStyles();
  const { accessibleCount, lockedCount } = useLicense();
  const total = accessibleCount + lockedCount;

  return (
    <div className={classes.footer}>
      <Text className={classes.stat}>
        <span className={classes.statValue}>{total}</span> cards
      </Text>
      <Text className={classes.separator}>|</Text>
      <Text className={classes.stat}>
        <span className={classes.statValue}>{accessibleCount}</span> accessible
      </Text>
      {pinnedCount > 0 && (
        <>
          <Text className={classes.separator}>|</Text>
          <Text className={classes.stat}>
            <span className={classes.statValue}>{pinnedCount}</span> pinned
          </Text>
        </>
      )}
      {lockedCount > 0 && (
        <>
          <Text className={classes.separator}>|</Text>
          <Text className={classes.stat}>
            <span className={classes.statValue}>{lockedCount}</span> locked
          </Text>
        </>
      )}
    </div>
  );
};

export default DashboardFooter;
