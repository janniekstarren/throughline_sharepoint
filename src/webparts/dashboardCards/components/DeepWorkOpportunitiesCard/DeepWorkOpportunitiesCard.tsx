// ============================================
// DeepWorkOpportunitiesCard - Card with size variants
// Small: Compact chip with metric and chart
// Medium: Summary view with stats and block list
// Large: Full master-detail layout
// ============================================

import * as React from 'react';
import { useMemo, useCallback } from 'react';
import {
  makeStyles,
  Text,
  Button,
  Tooltip,
  tokens,
  Badge,
} from '@fluentui/react-components';
import {
  BrainCircuit24Regular,
  ArrowClockwiseRegular,
  Diamond20Regular,
  Star20Regular,
  Circle20Regular,
  CalendarLtr20Regular,
} from '@fluentui/react-icons';

import { DeepWorkBlock } from '../../models/DeepWorkOpportunities';
import { useDeepWork } from '../../hooks/useDeepWork';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface DeepWorkOpportunitiesCardProps {
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  /** Card size: 'small' | 'medium' | 'large' */
  size?: CardSize;
  /** Callback when size changes via dropdown menu */
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useDeepWorkStyles = makeStyles({
  card: {
    height: 'auto',
    minHeight: '280px',
    maxHeight: '600px',
  },

  // Stats grid - 2x2 layout
  statsGrid: {
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
    color: tokens.colorNeutralForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueSuccess: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteGreenForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueWarning: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteYellowForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },
  statValueDanger: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteRedForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },

  // Block list section
  blockListSection: {
    padding: `0 ${tokens.spacingHorizontalL}`,
    paddingBottom: tokens.spacingVerticalL,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: tokens.spacingVerticalS,
  },
  blockList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  blockRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  blockInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  blockTimeRange: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  blockDuration: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  blockBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
});

// ============================================
// Helpers
// ============================================

const formatTimeRange = (start: Date, end: Date): string => {
  const fmt = (d: Date): string =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(start)} - ${fmt(end)}`;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

const getQualityBadgeColor = (quality: 'gold' | 'silver' | 'bronze'): 'success' | 'warning' | 'informative' => {
  switch (quality) {
    case 'gold': return 'success';
    case 'silver': return 'informative';
    case 'bronze': return 'warning';
    default: return 'informative';
  }
};

const getQualityLabel = (quality: 'gold' | 'silver' | 'bronze'): string => {
  return quality.charAt(0).toUpperCase() + quality.slice(1);
};

// ============================================
// Component
// ============================================

export const DeepWorkOpportunitiesCard: React.FC<DeepWorkOpportunitiesCardProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  size = 'medium',
  onSizeChange,
}) => {
  const handleSizeChange = useCallback(
    (newSize: CardSize) => {
      if (onSizeChange) onSizeChange(newSize);
    },
    [onSizeChange]
  );

  const styles = useDeepWorkStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useDeepWork({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="deepWorkOpportunities"
        title="Deep Work"
        icon={<BrainCircuit24Regular />}
        metricValue={data?.stats.goldBlockCount ?? 0}
        smartLabelKey="block"
        chartData={data?.dailyBreakdown.map(d => ({ date: new Date(d.day), value: d.totalMinutes }))}
        chartColor={data?.stats.goldBlockCount === 0 ? 'danger' : data?.stats.goldBlockCount !== undefined && data.stats.goldBlockCount <= 1 ? 'warning' : 'success'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Top 4 blocks sorted by quality then duration
  const topBlocks = useMemo(() => {
    if (!data) return [];
    const qualityOrder = { gold: 0, silver: 1, bronze: 2 };
    return [...data.blocks]
      .sort((a, b) => {
        const qDiff = qualityOrder[a.quality] - qualityOrder[b.quality];
        if (qDiff !== 0) return qDiff;
        return b.durationMinutes - a.durationMinutes;
      })
      .slice(0, 4);
  }, [data]);

  // Header actions
  const headerActions = (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowClockwiseRegular />}
          size="small"
          onClick={refresh}
        />
      </Tooltip>
      <CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />
    </div>
  );

  // Empty state
  if (!isLoading && !error && (!data || data.blocks.length === 0)) {
    return (
      <BaseCard testId="deep-work-card" empty>
        <CardHeader
          icon={<BrainCircuit24Regular />}
          title="Deep Work Opportunities"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<BrainCircuit24Regular />}
          title="No deep work blocks found"
          description="No uninterrupted focus blocks were detected this week"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Finding deep work blocks..."
      testId="deep-work-card"
      className={styles.card}
    >
      <CardHeader
        icon={<BrainCircuit24Regular />}
        title="Deep Work Opportunities"
        badge={data?.stats.goldBlockCount}
        badgeVariant={
          data && data.stats.goldBlockCount === 0
            ? 'danger'
            : data && data.stats.goldBlockCount <= 1
            ? 'warning'
            : 'brand'
        }
        actions={headerActions}
      />

      <div className={cardStyles.cardContent}>
        {/* Statistics Grid */}
        {data && (
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Diamond20Regular className={styles.statIcon} />
                Gold
              </div>
              <Text className={data.stats.goldBlockCount > 0 ? styles.statValueSuccess : styles.statValueDanger}>
                {data.stats.goldBlockCount}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Star20Regular className={styles.statIcon} />
                Silver
              </div>
              <Text className={styles.statValue}>{data.stats.silverBlockCount}</Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Circle20Regular className={styles.statIcon} />
                Bronze
              </div>
              <Text className={styles.statValue}>{data.stats.bronzeBlockCount}</Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <CalendarLtr20Regular className={styles.statIcon} />
                Best Day
              </div>
              <Text className={styles.statValue}>
                {data.stats.bestDay || 'N/A'}
              </Text>
            </div>
          </div>
        )}

        {/* Block List - Top 4 */}
        {topBlocks.length > 0 && (
          <div className={styles.blockListSection}>
            <Text className={styles.sectionLabel}>Top Blocks</Text>
            <div className={styles.blockList}>
              {topBlocks.map((block: DeepWorkBlock) => (
                <div key={block.id} className={styles.blockRow}>
                  <div className={styles.blockInfo}>
                    <span className={styles.blockTimeRange}>
                      {formatTimeRange(block.start, block.end)}
                    </span>
                    <span className={styles.blockDuration}>
                      {block.dayLabel} - {formatDuration(block.durationMinutes)}
                    </span>
                  </div>
                  <div className={styles.blockBadges}>
                    <Badge
                      appearance="tint"
                      color={getQualityBadgeColor(block.quality)}
                      size="small"
                    >
                      {getQualityLabel(block.quality)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cardStyles.cardFooter}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
        </Text>
      </div>
    </BaseCard>
  );
};

export default DeepWorkOpportunitiesCard;
