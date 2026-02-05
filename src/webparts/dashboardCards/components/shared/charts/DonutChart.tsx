// ============================================
// DonutChart - Reusable donut/pie chart component
// ============================================

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Text,
  Tooltip,
  tokens,
  makeStyles,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: tokens.spacingVerticalXS,
  },
  title: {
    color: tokens.colorNeutralForeground2,
  },
  chartWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabel: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  centerValue: {
    fontSize: '24px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
  },
  centerText: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXXS,
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXS,
    width: '100%',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    cursor: 'pointer',
  },
  legendColor: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendLabel: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
  },
  legendValue: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginLeft: tokens.spacingHorizontalXXS,
  },
});

export interface DonutSegment {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  /** Data segments to display */
  data: DonutSegment[];
  /** Title shown above the chart */
  title?: string;
  /** Size of the chart in pixels */
  size?: number;
  /** Thickness of the donut ring */
  thickness?: number;
  /** Center label value */
  centerValue?: string | number;
  /** Center label text */
  centerText?: string;
  /** Show legend below chart */
  showLegend?: boolean;
  /** Color palette for segments */
  colors?: string[];
}

const DEFAULT_COLORS = [
  tokens.colorPaletteGreenForeground1,
  tokens.colorPaletteBlueForeground2,
  tokens.colorPaletteYellowForeground1,
  tokens.colorPaletteRedForeground1,
  tokens.colorPalettePurpleForeground2,
  tokens.colorPaletteTealForeground2,
  tokens.colorPaletteMarigoldForeground1,
  tokens.colorPalettePinkForeground2,
];

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  size = 120,
  thickness = 20,
  centerValue,
  centerText,
  showLegend = true,
  colors = DEFAULT_COLORS,
}) => {
  const styles = useStyles();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const segments = useMemo(() => {
    let cumulative = 0;
    return data.map((segment, index) => {
      const percentage = total > 0 ? (segment.value / total) * 100 : 0;
      const startAngle = cumulative * 3.6; // Convert percentage to degrees
      cumulative += percentage;
      const endAngle = cumulative * 3.6;
      return {
        ...segment,
        percentage,
        startAngle,
        endAngle,
        color: segment.color || colors[index % colors.length],
      };
    });
  }, [data, total, colors]);

  const radius = size / 2;
  const innerRadius = radius - thickness;
  const center = radius;

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    r: number,
    angleInDegrees: number
  ): { x: number; y: number } => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    x: number,
    y: number,
    innerR: number,
    outerR: number,
    startAngle: number,
    endAngle: number
  ): string => {
    const start = polarToCartesian(x, y, outerR, endAngle);
    const end = polarToCartesian(x, y, outerR, startAngle);
    const innerStart = polarToCartesian(x, y, innerR, endAngle);
    const innerEnd = polarToCartesian(x, y, innerR, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', outerR, outerR, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerR, innerR, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z',
    ].join(' ');
  };

  return (
    <div className={styles.container}>
      {title && (
        <div className={styles.header}>
          <Text size={200} className={styles.title}>
            {title}
          </Text>
        </div>
      )}

      <div className={styles.chartWrapper}>
        <svg width={size} height={size}>
          {segments.map((segment, index) => {
            // Handle case where segment is 100%
            if (segment.percentage >= 99.99) {
              return (
                <circle
                  key={`segment-${index}`}
                  cx={center}
                  cy={center}
                  r={(radius + innerRadius) / 2}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={thickness}
                  opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.4}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
              );
            }

            // Skip segments with 0 value
            if (segment.percentage < 0.01) return null;

            const path = describeArc(
              center,
              center,
              innerRadius,
              radius,
              segment.startAngle,
              segment.endAngle
            );

            return (
              <Tooltip
                key={`segment-${index}`}
                content={`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}
                relationship="label"
                visible={hoveredIndex === index}
              >
                <path
                  d={path}
                  fill={segment.color}
                  opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.4}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                />
              </Tooltip>
            );
          })}
        </svg>

        {(centerValue !== undefined || centerText) && (
          <div className={styles.centerLabel} style={{ width: innerRadius * 1.4, height: innerRadius * 1.4 }}>
            {centerValue !== undefined && (
              <Text className={styles.centerValue}>{centerValue}</Text>
            )}
            {centerText && (
              <Text className={styles.centerText}>{centerText}</Text>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <div className={styles.legend}>
          {segments.map((segment, index) => (
            <div
              key={`legend-${index}`}
              className={styles.legendItem}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={styles.legendColor}
                style={{ backgroundColor: segment.color }}
              />
              <Text className={styles.legendLabel}>{segment.label}</Text>
              <Text className={styles.legendValue}>{segment.value}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonutChart;
