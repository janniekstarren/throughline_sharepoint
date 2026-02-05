import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Text,
  Badge,
  Tooltip,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import {
  ArrowTrendingRegular,
  SubtractRegular
} from '@fluentui/react-icons';
import { PendingTrendData } from '../../../models/WaitingOnOthers';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingHorizontalM,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalS,
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
    backgroundColor: tokens.colorPalettePurpleBackground2,
    borderRadius: `${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium} 0 0`,
    minHeight: '4px',
    transition: 'height 0.2s ease',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorPalettePurpleForeground2,
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
    marginTop: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground3,
  },
});

interface WaitingTrendChartProps {
  data: PendingTrendData;
}

const formatDay = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatDayShort = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
};

export const WaitingTrendChart: React.FC<WaitingTrendChartProps> = ({ data }) => {
  const styles = useStyles();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const trendDisplay = useMemo(() => {
    switch (data.trend) {
      case 'improving':
        return { icon: <ArrowTrendingRegular style={{ transform: 'scaleY(-1)' }} />, color: 'success' as const, label: 'Fewer waiting' };
      case 'worsening':
        return { icon: <ArrowTrendingRegular />, color: 'warning' as const, label: 'More waiting' };
      default:
        return { icon: <SubtractRegular />, color: 'informative' as const, label: 'Stable' };
    }
  }, [data.trend]);

  const maxValue = useMemo(() => {
    return Math.max(...data.dataPoints.map(d => d.peopleOwing), 1);
  }, [data.dataPoints]);

  const avgPeople = data.averagePeopleOwing;

  // Show only every other label to avoid crowding
  const showLabel = (index: number): boolean => {
    return index % 2 === 0 || index === data.dataPoints.length - 1;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text size={200} className={styles.title}>
          People owing (14 days)
        </Text>
        <Badge appearance="tint" color={trendDisplay.color} icon={trendDisplay.icon} size="small">
          {trendDisplay.label}
        </Badge>
      </div>

      <div className={styles.chartContainer}>
        {data.dataPoints.map((point, index) => {
          const height = Math.max((point.peopleOwing / maxValue) * 70, 4);
          const tooltipContent = `${formatDay(point.date)}: ${point.peopleOwing} people, ${point.itemCount} items`;

          return (
            <Tooltip
              key={point.date}
              content={tooltipContent}
              relationship="label"
              visible={hoveredIndex === index}
            >
              <div
                className={styles.bar}
                style={{ height: `${height}px` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </Tooltip>
          );
        })}
      </div>

      <div className={styles.xAxisLabels}>
        {data.dataPoints.map((point, index) => (
          <Text key={point.date} size={100} className={styles.xAxisLabel}>
            {showLabel(index) ? formatDayShort(point.date) : ''}
          </Text>
        ))}
      </div>

      <div className={styles.footer}>
        <Text size={200}>Avg: {avgPeople.toFixed(1)} people/day</Text>
      </div>
    </div>
  );
};

export default WaitingTrendChart;
