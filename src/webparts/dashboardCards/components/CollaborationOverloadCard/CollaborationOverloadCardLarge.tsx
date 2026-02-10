// ============================================
// CollaborationOverloadCardLarge - Large card variant
// Full content view with master-detail layout
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  PeopleQueue24Regular,
  ArrowClockwiseRegular,
  Gauge20Regular,
  ArrowUp16Regular,
  ArrowDown16Regular,
  Subtract16Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { CollaborationMetric } from '../../models/CollaborationOverload';
import { useCollaborationOverload } from '../../hooks/useCollaborationOverload';
import { DataMode } from '../../services/testData';

export interface CollaborationOverloadCardLargeProps {
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  masterInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  masterTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  masterMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  masterRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  trendImproving: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorPaletteGreenForeground1,
  },
  trendWorsening: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorPaletteRedForeground1,
  },
  trendStable: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },

  // Detail panel styles
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  detailHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    lineHeight: 1.3,
  },
  badgeRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  detailIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
  },
  comparisonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  comparisonItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXXS,
    flex: 1,
  },
  comparisonLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
  },
  comparisonValue: {
    fontSize: '20px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  percentileBar: {
    width: '100%',
    height: '8px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: tokens.spacingVerticalXS,
  },
  percentileFill: {
    height: '100%',
    borderRadius: '4px',
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
  },
  weightInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  weightLabel: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  weightValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginLeft: 'auto',
  },

  // Empty states
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Helpers
// ============================================

const getPercentileColor = (percentile: number): string => {
  if (percentile >= 80) return tokens.colorPaletteRedForeground1;
  if (percentile >= 60) return tokens.colorPaletteYellowForeground1;
  return tokens.colorPaletteGreenForeground1;
};

const getPercentileBadgeColor = (percentile: number): 'danger' | 'warning' | 'success' => {
  if (percentile >= 80) return 'danger';
  if (percentile >= 60) return 'warning';
  return 'success';
};

// ============================================
// Component
// ============================================

export const CollaborationOverloadCardLarge: React.FC<CollaborationOverloadCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedMetric, setSelectedMetric] = React.useState<CollaborationMetric | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useCollaborationOverload({ dataMode });

  // Convert metrics object to array and sort by percentile descending (worst first)
  const metricsArray = React.useMemo(() => {
    if (!data) return [];
    return Object.values(data.metrics).sort((a, b) => b.percentile - a.percentile);
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (metricsArray.length > 0 && !selectedMetric) {
      setSelectedMetric(metricsArray[0]);
    }
  }, [metricsArray.length]);

  // Render master list item
  const renderMasterItem = (metric: CollaborationMetric, _isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        <div className={styles.masterInfo}>
          <Text className={styles.masterTitle}>{metric.name}</Text>
          <div className={styles.masterMeta}>
            <span>{metric.currentValue} {metric.unit}</span>
          </div>
        </div>
        <div className={styles.masterRight}>
          <span
            className={
              metric.trend === 'improving'
                ? styles.trendImproving
                : metric.trend === 'worsening'
                ? styles.trendWorsening
                : styles.trendStable
            }
          >
            {metric.trend === 'improving' ? (
              <ArrowDown16Regular />
            ) : metric.trend === 'worsening' ? (
              <ArrowUp16Regular />
            ) : (
              <Subtract16Regular />
            )}
            {metric.trend}
          </span>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (metric: CollaborationMetric): React.ReactNode => {
    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>{metric.name}</Text>
          <div className={styles.badgeRow}>
            <Badge
              appearance="filled"
              color={getPercentileBadgeColor(metric.percentile)}
            >
              {Math.round(metric.percentile)}th percentile
            </Badge>
            <Badge
              appearance="tint"
              color={
                metric.trend === 'improving'
                  ? 'success'
                  : metric.trend === 'worsening'
                  ? 'danger'
                  : 'informative'
              }
            >
              {metric.trend.charAt(0).toUpperCase() + metric.trend.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Current vs Benchmark */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Current vs Benchmark</Text>
          <div className={styles.comparisonRow}>
            <div className={styles.comparisonItem}>
              <Text className={styles.comparisonLabel}>Current</Text>
              <Text className={styles.comparisonValue}>
                {metric.currentValue} {metric.unit}
              </Text>
            </div>
            <div className={styles.comparisonItem}>
              <Text className={styles.comparisonLabel}>Benchmark</Text>
              <Text className={styles.comparisonValue}>
                {metric.benchmarkValue} {metric.unit}
              </Text>
            </div>
          </div>
        </div>

        {/* Percentile */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Percentile</Text>
          <div className={styles.detailRow}>
            <Gauge20Regular className={styles.detailIcon} />
            <span>{Math.round(metric.percentile)}th percentile</span>
          </div>
          <div className={styles.percentileBar}>
            <div
              className={styles.percentileFill}
              style={{
                width: `${Math.min(metric.percentile, 100)}%`,
                backgroundColor: getPercentileColor(metric.percentile),
              }}
            />
          </div>
        </div>

        {/* Weight in Composite Score */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Composite Score Weight</Text>
          <div className={styles.weightInfo}>
            <Text className={styles.weightLabel}>Weight in overall score</Text>
            <Text className={styles.weightValue}>{Math.round(metric.weight * 100)}%</Text>
          </div>
        </div>

        {/* Trend Data */}
        {metric.trendData && metric.trendData.length > 0 && (
          <div className={styles.detailSection}>
            <Text className={styles.sectionLabel}>Recent Trend ({metric.trendData.length} data points)</Text>
            <div className={styles.detailRow}>
              <span>
                Latest: {metric.trendData[metric.trendData.length - 1].value} {metric.unit}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span>
                Earliest: {metric.trendData[0].value} {metric.unit}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (_metric: CollaborationMetric): React.ReactNode => {
    return (
      <Tooltip content="View analytics" relationship="label">
        <Button
          appearance="primary"
          icon={<PeopleQueue24Regular />}
          onClick={() => window.open('https://myanalytics.microsoft.com', '_blank', 'noopener,noreferrer')}
        >
          View Analytics
        </Button>
      </Tooltip>
    );
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <PeopleQueue24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a metric to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <PeopleQueue24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No collaboration data</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          Collaboration metrics are not yet available
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<CollaborationMetric>
      items={metricsArray}
      selectedItem={selectedMetric}
      onItemSelect={setSelectedMetric}
      getItemKey={(m) => m.name}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<PeopleQueue24Regular />}
      title="Collaboration Overload"
      itemCount={metricsArray.length}
      loading={isLoading}
      error={error?.message}
      emptyMessage="No collaboration data"
      emptyIcon={<PeopleQueue24Regular />}
      headerActions={
        <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
          <Tooltip content="Refresh" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowClockwiseRegular />}
              onClick={refresh}
            />
          </Tooltip>
          <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
        </div>
      }
    />
  );
};

export default CollaborationOverloadCardLarge;
