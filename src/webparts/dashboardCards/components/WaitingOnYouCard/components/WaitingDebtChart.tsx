// src/webparts/dashboardCards/components/WaitingOnYouCard/components/WaitingDebtChart.tsx

import * as React from 'react';
import {
  Text,
  Badge,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import {
  ArrowTrendingRegular,
  ArrowUpRegular,
  ArrowDownRegular
} from '@fluentui/react-icons';
import { WaitingDebtTrend } from '../../../models/WaitingOnYou';

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalM,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalS,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  trendBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: `${tokens.borderRadiusSmall} ${tokens.borderRadiusSmall} 0 0`,
    minHeight: '4px',
    transition: 'height 0.2s ease',
    position: 'relative',
  },
  barTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalXS,
    boxShadow: tokens.shadow8,
    whiteSpace: 'nowrap',
    zIndex: 10,
    marginBottom: '4px',
  },
  stats: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    marginTop: tokens.spacingVerticalS,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    color: tokens.colorNeutralForeground3,
  },
  xAxisLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: tokens.spacingVerticalXS,
  },
  xAxisLabel: {
    color: tokens.colorNeutralForeground3,
    fontSize: '10px',
  },
});

interface WaitingDebtChartProps {
  trend: WaitingDebtTrend;
}

export const WaitingDebtChart: React.FC<WaitingDebtChartProps> = ({ trend }) => {
  const styles = useStyles();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | undefined>(undefined);

  const getTrendIcon = (): React.ReactElement => {
    switch (trend.trend) {
      case 'improving':
        return <ArrowDownRegular />;
      case 'worsening':
        return <ArrowUpRegular />;
      default:
        return <ArrowTrendingRegular />;
    }
  };

  const getTrendColor = (): 'success' | 'danger' | 'subtle' => {
    switch (trend.trend) {
      case 'improving':
        return 'success';
      case 'worsening':
        return 'danger';
      default:
        return 'subtle';
    }
  };

  const getTrendLabel = (): string => {
    switch (trend.trend) {
      case 'improving':
        return 'Improving';
      case 'worsening':
        return 'Getting worse';
      default:
        return 'Stable';
    }
  };

  // Calculate max value for scaling
  const maxValue = Math.max(...trend.dataPoints.map(d => d.peopleWaiting), 1);

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

  // Get first and last dates for x-axis labels
  const firstDate = trend.dataPoints.length > 0 ? formatDate(trend.dataPoints[0].date) : '';
  const lastDate = trend.dataPoints.length > 0 ? formatDate(trend.dataPoints[trend.dataPoints.length - 1].date) : '';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Text weight="semibold" size={300}>Response Debt</Text>
        </div>
        <Badge
          appearance="outline"
          color={getTrendColor()}
          size="small"
          className={styles.trendBadge}
          icon={getTrendIcon()}
        >
          {getTrendLabel()}
        </Badge>
      </div>

      <div className={styles.chartContainer}>
        {trend.dataPoints.map((point, index) => {
          const height = (point.peopleWaiting / maxValue) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={point.date}
              className={styles.bar}
              style={{
                height: `${Math.max(height, 5)}%`,
                opacity: isHovered ? 1 : 0.8,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(undefined)}
            >
              {isHovered && (
                <div className={styles.barTooltip}>
                  <Text size={200} weight="semibold">{formatFullDate(point.date)}</Text>
                  <br />
                  <Text size={200}>{point.peopleWaiting} people</Text>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.xAxisLabels}>
        <Text className={styles.xAxisLabel}>{firstDate}</Text>
        <Text className={styles.xAxisLabel}>{lastDate}</Text>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <Text size={200} className={styles.statLabel}>Average</Text>
          <Text weight="semibold" size={300}>
            {trend.averagePeopleWaiting.toFixed(1)} people
          </Text>
        </div>
        <div className={styles.stat}>
          <Text size={200} className={styles.statLabel}>Peak day</Text>
          <Text weight="semibold" size={300}>
            {trend.peakDay}
          </Text>
        </div>
      </div>
    </div>
  );
};
