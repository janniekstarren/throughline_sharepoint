// ============================================
// Distribution Chart Component
// Displays context type distribution as a donut chart
// ============================================

import * as React from 'react';
import { Text, tokens } from '@fluentui/react-components';
import { ContextDistribution } from '../../../models/ContextSwitching';
import { useContextSwitchingStyles } from '../ContextSwitchingCard.styles';

interface DistributionChartProps {
  data: ContextDistribution[];
  totalSwitches: number;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  data,
  totalSwitches
}) => {
  const styles = useContextSwitchingStyles();

  // Donut chart configuration
  const size = 120;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  // Calculate stroke dash arrays for each segment
  const getSegments = (): { offset: number; length: number; color: string }[] => {
    const segments: { offset: number; length: number; color: string }[] = [];
    let currentOffset = 0;

    data.forEach(item => {
      const segmentLength = (item.percentage / 100) * circumference;
      segments.push({
        offset: currentOffset,
        length: segmentLength,
        color: item.color
      });
      currentOffset += segmentLength;
    });

    return segments;
  };

  const segments = getSegments();

  // Sort data for legend (highest first)
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // Take top 5 for legend
  const topItems = sortedData.slice(0, 5);
  const otherItems = sortedData.slice(5);
  const otherCount = otherItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={styles.distributionContainer}>
      {/* Donut Chart */}
      <div className={styles.donutContainer}>
        <svg
          className={styles.donutSvg}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={tokens.colorNeutralStroke2}
            strokeWidth={strokeWidth}
          />
          {/* Segment circles */}
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.length} ${circumference - segment.length}`}
              strokeDashoffset={-segment.offset}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          ))}
        </svg>
        {/* Center text */}
        <div className={styles.donutCenter}>
          <Text className={styles.donutValue}>{totalSwitches}</Text>
          <Text className={styles.donutLabel}>total</Text>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legendContainer}>
        {topItems.map(item => (
          <div key={item.contextType} className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: item.color }}
            />
            <Text className={styles.legendText}>{item.label}</Text>
            <Text className={styles.legendValue}>{item.count}</Text>
          </div>
        ))}
        {otherCount > 0 && (
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: tokens.colorNeutralForeground4 }}
            />
            <Text className={styles.legendText}>Other</Text>
            <Text className={styles.legendValue}>{otherCount}</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributionChart;
