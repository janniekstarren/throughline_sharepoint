// ============================================
// Trend Chart Component
// Displays focus score trend over multiple days
// ============================================

import * as React from 'react';
import { useState } from 'react';
import { Text, Badge, Tooltip, tokens } from '@fluentui/react-components';
import {
  ArrowTrendingRegular,
  ArrowUpRegular,
  ArrowDownRegular
} from '@fluentui/react-icons';
import { ContextSwitchingTrend, DailySummary } from '../../../models/ContextSwitching';
import { useContextSwitchingStyles } from '../ContextSwitchingCard.styles';

interface TrendChartProps {
  data: ContextSwitchingTrend;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const styles = useContextSwitchingStyles();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Get trend icon and color
  const getTrendDisplay = (): { icon: React.ReactElement; color: 'success' | 'danger' | 'informative'; label: string } => {
    switch (data.trend) {
      case 'improving':
        return {
          icon: <ArrowUpRegular />,
          color: 'success',
          label: 'Improving'
        };
      case 'worsening':
        return {
          icon: <ArrowDownRegular />,
          color: 'danger',
          label: 'Declining'
        };
      default:
        return {
          icon: <ArrowTrendingRegular />,
          color: 'informative',
          label: 'Stable'
        };
    }
  };

  const trendDisplay = getTrendDisplay();

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatFullDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get color based on focus score
  const getScoreColor = (score: number): string => {
    if (score >= 70) return tokens.colorPaletteGreenForeground1;
    if (score >= 40) return tokens.colorPaletteYellowForeground1;
    return tokens.colorPaletteRedForeground1;
  };

  // Get tooltip content
  const getTooltipContent = (day: DailySummary): string => {
    return `${formatFullDate(day.date)}\nFocus Score: ${day.focusScore}\nSwitches: ${day.totalSwitches}\nAvg Focus: ${day.avgFocusTime}min`;
  };

  // Calculate max for scaling
  const maxScore = 100; // Focus score is always 0-100

  return (
    <div className={styles.trendContainer}>
      <div className={styles.chartHeader}>
        <Text className={styles.chartTitle}>Focus Trend (7 days)</Text>
        <Badge
          appearance="tint"
          color={trendDisplay.color}
          icon={trendDisplay.icon}
          size="small"
        >
          {trendDisplay.label}
        </Badge>
      </div>

      <div className={styles.trendChart}>
        {data.dataPoints.map((day, index) => {
          const height = Math.max((day.focusScore / maxScore) * 70, 4);
          const isHovered = hoveredIndex === index;
          const color = getScoreColor(day.focusScore);

          return (
            <Tooltip
              key={day.date}
              content={getTooltipContent(day)}
              relationship="label"
              visible={isHovered}
            >
              <div className={styles.trendBar}>
                <div
                  className={styles.trendBarInner}
                  style={{
                    height: `${height}px`,
                    backgroundColor: color,
                    opacity: isHovered ? 1 : 0.8
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </div>
            </Tooltip>
          );
        })}
      </div>

      <div className={styles.chartXAxis}>
        {data.dataPoints.map((day, index) => (
          <Text
            key={day.date}
            className={styles.chartXLabel}
            style={{ flex: 1, textAlign: 'center' }}
          >
            {index % 2 === 0 || index === data.dataPoints.length - 1 ? formatDate(day.date) : ''}
          </Text>
        ))}
      </div>

      <div className={styles.trendStats}>
        <div className={styles.trendStat}>
          <Text className={styles.trendStatValue}>{data.weeklyAvgSwitches}</Text>
          <Text className={styles.trendStatLabel}>Avg switches/day</Text>
        </div>
        <div className={styles.trendStat}>
          <Text className={styles.trendStatValue}>{data.weeklyAvgFocusTime}m</Text>
          <Text className={styles.trendStatLabel}>Avg focus time</Text>
        </div>
        <div className={styles.trendStat}>
          <Text
            className={styles.trendStatValue}
            style={{
              color: data.comparisonToLastWeek.switchesChange < 0
                ? tokens.colorPaletteGreenForeground1
                : data.comparisonToLastWeek.switchesChange > 0
                  ? tokens.colorPaletteRedForeground1
                  : tokens.colorNeutralForeground1
            }}
          >
            {data.comparisonToLastWeek.switchesChange > 0 ? '+' : ''}{data.comparisonToLastWeek.switchesChange}%
          </Text>
          <Text className={styles.trendStatLabel}>vs last week</Text>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
