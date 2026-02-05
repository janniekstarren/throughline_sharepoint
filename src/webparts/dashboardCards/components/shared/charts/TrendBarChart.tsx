// ============================================
// TrendBarChart - Reusable 7-day bar chart component
// ============================================

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Text,
  Badge,
  Tooltip,
  tokens,
  makeStyles,
} from '@fluentui/react-components';
import {
  ArrowTrendingRegular,
  SubtractRegular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalXS,
  },
  title: {
    color: tokens.colorNeutralForeground2,
  },
  chartContainer: {
    height: '80px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
    paddingBottom: tokens.spacingVerticalXS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },
  bar: {
    flex: 1,
    borderRadius: `${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium} 0 0`,
    minHeight: '4px',
    transition: 'height 0.2s ease',
    cursor: 'pointer',
  },
  barDefault: {
    backgroundColor: tokens.colorPalettePurpleForeground2,
    ':hover': {
      backgroundColor: tokens.colorPalettePurpleBorderActive,
    },
  },
  barBrand: {
    backgroundColor: tokens.colorBrandForeground2,
    ':hover': {
      backgroundColor: tokens.colorBrandForeground1,
    },
  },
  barSuccess: {
    backgroundColor: tokens.colorPaletteGreenForeground2,
    ':hover': {
      backgroundColor: tokens.colorPaletteGreenBorderActive,
    },
  },
  barWarning: {
    backgroundColor: tokens.colorPaletteYellowForeground2,
    ':hover': {
      backgroundColor: tokens.colorPaletteYellowForeground1,
    },
  },
  barDanger: {
    backgroundColor: tokens.colorPaletteRedForeground2,
    ':hover': {
      backgroundColor: tokens.colorPaletteRedBorderActive,
    },
  },
  xAxisLabels: {
    display: 'flex',
    marginTop: tokens.spacingVerticalXS,
  },
  xAxisLabel: {
    flex: 1,
    textAlign: 'center',
    color: tokens.colorNeutralForeground4,
    fontSize: tokens.fontSizeBase100,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
  },
});

export interface TrendDataPoint {
  date: Date;
  value: number;
  label?: string;
  secondaryValue?: number;
}

export interface TrendBarChartProps {
  /** Data points to display (typically 7 days) */
  data: TrendDataPoint[];
  /** Title shown above the chart */
  title?: string;
  /** Trend direction for the badge */
  trend?: 'improving' | 'worsening' | 'stable';
  /** Custom label for the trend badge */
  trendLabel?: string;
  /** Optional labels for trend states */
  trendLabels?: {
    improving?: string;
    worsening?: string;
    stable?: string;
  };
  /** Height of the chart in pixels */
  height?: number;
  /** Color scheme for the bars */
  color?: 'default' | 'brand' | 'success' | 'warning' | 'danger';
  /** Footer text to display (e.g., "Avg: 5.2 items/day") */
  footerText?: string;
  /** Show average line */
  showAverage?: boolean;
  /** Custom tooltip formatter */
  tooltipFormatter?: (point: TrendDataPoint) => string;
}

const formatDay = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatDayShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const TrendBarChart: React.FC<TrendBarChartProps> = ({
  data,
  title,
  trend = 'stable',
  trendLabel,
  trendLabels = {},
  height = 80,
  color = 'default',
  footerText,
  tooltipFormatter,
}) => {
  const styles = useStyles();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const trendDisplay = useMemo(() => {
    const defaultLabels = {
      improving: trendLabels.improving || 'Improving',
      worsening: trendLabels.worsening || 'Worsening',
      stable: trendLabels.stable || 'Stable',
    };

    switch (trend) {
      case 'improving':
        return {
          icon: <ArrowTrendingRegular style={{ transform: 'scaleY(-1)' }} />,
          color: 'success' as const,
          label: trendLabel || defaultLabels.improving,
        };
      case 'worsening':
        return {
          icon: <ArrowTrendingRegular />,
          color: 'warning' as const,
          label: trendLabel || defaultLabels.worsening,
        };
      default:
        return {
          icon: <SubtractRegular />,
          color: 'informative' as const,
          label: trendLabel || defaultLabels.stable,
        };
    }
  }, [trend, trendLabel, trendLabels]);

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  // Average calculation available for future showAverage feature
  // const average = useMemo(() => {
  //   if (data.length === 0) return 0;
  //   return data.reduce((sum, d) => sum + d.value, 0) / data.length;
  // }, [data]);

  // Show only every other label to avoid crowding
  const showLabel = (index: number): boolean => {
    return index % 2 === 0 || index === data.length - 1;
  };

  const getBarClass = (): string => {
    switch (color) {
      case 'brand':
        return styles.barBrand;
      case 'success':
        return styles.barSuccess;
      case 'warning':
        return styles.barWarning;
      case 'danger':
        return styles.barDanger;
      default:
        return styles.barDefault;
    }
  };

  const defaultTooltipFormatter = (point: TrendDataPoint): string => {
    return `${formatDay(point.date)}: ${point.value}${point.label ? ` ${point.label}` : ''}`;
  };

  return (
    <div className={styles.container}>
      {(title || trend) && (
        <div className={styles.header}>
          {title && (
            <Text size={200} className={styles.title}>
              {title}
            </Text>
          )}
          {trend && (
            <Badge appearance="tint" color={trendDisplay.color} icon={trendDisplay.icon} size="small">
              {trendDisplay.label}
            </Badge>
          )}
        </div>
      )}

      <div className={styles.chartContainer} style={{ height: `${height}px` }}>
        {data.map((point, index) => {
          const barHeight = Math.max((point.value / maxValue) * (height - 10), 4);
          const tooltipContent = tooltipFormatter
            ? tooltipFormatter(point)
            : defaultTooltipFormatter(point);

          return (
            <Tooltip
              key={point.date.toISOString()}
              content={tooltipContent}
              relationship="label"
              visible={hoveredIndex === index}
            >
              <div
                className={`${styles.bar} ${getBarClass()}`}
                style={{ height: `${barHeight}px` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </Tooltip>
          );
        })}
      </div>

      <div className={styles.xAxisLabels}>
        {data.map((point, index) => (
          <Text key={point.date.toISOString()} size={100} className={styles.xAxisLabel}>
            {showLabel(index) ? formatDayShort(point.date) : ''}
          </Text>
        ))}
      </div>

      {footerText && (
        <div className={styles.footer}>
          <Text size={200}>{footerText}</Text>
        </div>
      )}
    </div>
  );
};

export default TrendBarChart;
