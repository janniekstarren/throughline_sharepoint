// ============================================
// Hourly Chart Component
// Displays context switches by hour in a bar chart
// ============================================

import * as React from 'react';
import { useState } from 'react';
import { Text, Tooltip } from '@fluentui/react-components';
import { HourlySwitchData, getContextTypeColor, getContextTypeLabel } from '../../../models/ContextSwitching';
import { useContextSwitchingStyles } from '../ContextSwitchingCard.styles';

interface HourlyChartProps {
  data: HourlySwitchData[];
  title?: string;
}

export const HourlyChart: React.FC<HourlyChartProps> = ({
  data,
  title = 'Switches by Hour'
}) => {
  const styles = useContextSwitchingStyles();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate max for scaling
  const maxSwitches = Math.max(...data.map(d => d.switchCount), 1);

  // Format hour for display
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    if (hour < 12) return `${hour}am`;
    return `${hour - 12}pm`;
  };

  // Get tooltip content
  const getTooltipContent = (item: HourlySwitchData): string => {
    return `${formatHour(item.hour)}: ${item.switchCount} switches\nDominant: ${getContextTypeLabel(item.dominantContext)}\nFocus: ${item.focusTime}min`;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <Text className={styles.chartTitle}>{title}</Text>
      </div>

      <div className={styles.hourlyChart}>
        {data.map((item, index) => {
          const height = Math.max((item.switchCount / maxSwitches) * 70, 4);
          const color = getContextTypeColor(item.dominantContext);
          const isHovered = hoveredIndex === index;

          return (
            <Tooltip
              key={item.hour}
              content={getTooltipContent(item)}
              relationship="label"
              visible={isHovered}
            >
              <div
                className={styles.hourlyBar}
                style={{
                  height: `${height}px`,
                  backgroundColor: color,
                  opacity: isHovered ? 1 : 0.8
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </Tooltip>
          );
        })}
      </div>

      <div className={styles.chartXAxis}>
        <Text className={styles.chartXLabel}>{formatHour(data[0]?.hour || 9)}</Text>
        <Text className={styles.chartXLabel}>{formatHour(data[Math.floor(data.length / 2)]?.hour || 13)}</Text>
        <Text className={styles.chartXLabel}>{formatHour(data[data.length - 1]?.hour || 17)}</Text>
      </div>
    </div>
  );
};

export default HourlyChart;
