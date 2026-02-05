// ============================================
// StatsGrid - Reusable 2x2 statistics grid component
// ============================================

import * as React from 'react';
import {
  Text,
  tokens,
  makeStyles,
  mergeClasses,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    textAlign: 'center',
  },
  statLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  statIcon: {
    fontSize: '14px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 600,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueDefault: {
    color: tokens.colorNeutralForeground1,
  },
  statValueBrand: {
    color: tokens.colorBrandForeground1,
  },
  statValueSuccess: {
    color: tokens.colorPaletteGreenForeground1,
  },
  statValueWarning: {
    color: tokens.colorPaletteYellowForeground1,
  },
  statValueDanger: {
    color: tokens.colorPaletteRedForeground1,
  },
});

export type StatColor = 'default' | 'brand' | 'success' | 'warning' | 'danger';

export interface StatItem {
  /** Label text displayed above the value */
  label: string;
  /** Value to display (can be string or number) */
  value: string | number;
  /** Optional icon to display next to the label */
  icon?: React.ReactNode;
  /** Color scheme for the value */
  color?: StatColor;
}

export interface StatsGridProps {
  /** Array of exactly 4 stat items */
  stats: [StatItem, StatItem, StatItem, StatItem];
  /** Optional custom className */
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, className }) => {
  const styles = useStyles();

  const getValueClass = (color?: StatColor): string => {
    switch (color) {
      case 'brand':
        return styles.statValueBrand;
      case 'success':
        return styles.statValueSuccess;
      case 'warning':
        return styles.statValueWarning;
      case 'danger':
        return styles.statValueDanger;
      default:
        return styles.statValueDefault;
    }
  };

  return (
    <div className={mergeClasses(styles.grid, className)}>
      {stats.map((stat, index) => (
        <div key={`stat-${index}`} className={styles.statItem}>
          <div className={styles.statLabel}>
            {stat.icon && <span className={styles.statIcon}>{stat.icon}</span>}
            {stat.label}
          </div>
          <Text className={mergeClasses(styles.statValue, getValueClass(stat.color))}>
            {stat.value}
          </Text>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
