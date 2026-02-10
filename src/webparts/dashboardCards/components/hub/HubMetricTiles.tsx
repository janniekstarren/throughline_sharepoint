/**
 * HubMetricTiles - 4 sparkline metric tiles for the Intelligence Hub
 *
 * Shows: Focus Score, Context Switches, Meeting Load, Overdue Items.
 * Each tile: label + big value + MiniSparkline + trend arrow.
 * 4-column grid (2-col at <600px).
 */

import * as React from 'react';
import { Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import {
  ArrowTrendingDown20Regular,
  ArrowTrending20Regular,
} from '@fluentui/react-icons';
import { MiniSparkline } from './MiniSparkline';
import { MetricTileEnter } from './hubMotions';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 600px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },

  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow2,
    transitionProperty: 'transform, box-shadow',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow4,
    },
  },

  label: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },

  valueRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },

  value: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    lineHeight: '1.1',
    color: tokens.colorNeutralForeground1,
  },

  trendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    fontSize: tokens.fontSizeBase100,
  },

  trendUp: {
    color: tokens.colorPaletteRedForeground1,
  },

  trendDown: {
    color: tokens.colorPaletteGreenForeground1,
  },
});

// ============================================
// Metric Definitions
// ============================================

interface MetricTile {
  id: string;
  label: string;
  value: string;
  sparklineData: number[];
  sparklineColor: string;
  trend: 'up' | 'down';
  trendLabel: string;
}

export interface IHubMetricTilesProps {
  focusScore?: number;
  switchCount?: number;
  meetingHours?: number;
  overdueCount?: number;
}

// ============================================
// Component
// ============================================

export const HubMetricTiles: React.FC<IHubMetricTilesProps> = ({
  focusScore = 42,
  switchCount = 34,
  meetingHours = 5.5,
  overdueCount = 2,
}) => {
  const styles = useStyles();

  const tiles: MetricTile[] = React.useMemo(() => [
    {
      id: 'focus',
      label: 'Focus Score',
      value: `${focusScore}/100`,
      sparklineData: [65, 58, 42, 51, 38, 42, 42],
      sparklineColor: focusScore < 50
        ? tokens.colorPaletteRedForeground1
        : tokens.colorPaletteGreenForeground1,
      trend: 'down' as const,
      trendLabel: 'vs. last week',
    },
    {
      id: 'switches',
      label: 'Context Switches',
      value: `${switchCount}`,
      sparklineData: [22, 28, 31, 25, 34, 29, 34],
      sparklineColor: tokens.colorPaletteMarigoldForeground1,
      trend: 'up' as const,
      trendLabel: '37% above avg',
    },
    {
      id: 'meetings',
      label: 'Meeting Load',
      value: `${meetingHours}hrs`,
      sparklineData: [4, 6, 5.5, 7, 3, 5.5, 5.5],
      sparklineColor: tokens.colorPaletteBlueForeground2,
      trend: 'up' as const,
      trendLabel: 'tomorrow',
    },
    {
      id: 'overdue',
      label: 'Overdue Items',
      value: `${overdueCount}`,
      sparklineData: [0, 1, 1, 2, 1, 2, 2],
      sparklineColor: overdueCount > 0
        ? tokens.colorPaletteRedForeground1
        : tokens.colorPaletteGreenForeground1,
      trend: overdueCount > 0 ? 'up' as const : 'down' as const,
      trendLabel: overdueCount > 0 ? 'action needed' : 'on track',
    },
  ], [focusScore, switchCount, meetingHours, overdueCount]);

  return (
    <div className={styles.grid}>
      {tiles.map((tile) => (
        <MetricTileEnter key={tile.id} visible>
          <div className={styles.tile}>
            <Text className={styles.label}>{tile.label}</Text>
            <div className={styles.valueRow}>
              <Text className={styles.value}>{tile.value}</Text>
              <MiniSparkline
                data={tile.sparklineData}
                color={tile.sparklineColor}
                width={60}
                height={24}
              />
            </div>
            <div className={`${styles.trendRow} ${tile.trend === 'up' ? styles.trendUp : styles.trendDown}`}>
              {tile.trend === 'up' ? <ArrowTrending20Regular /> : <ArrowTrendingDown20Regular />}
              <span>{tile.trendLabel}</span>
            </div>
          </div>
        </MetricTileEnter>
      ))}
    </div>
  );
};
