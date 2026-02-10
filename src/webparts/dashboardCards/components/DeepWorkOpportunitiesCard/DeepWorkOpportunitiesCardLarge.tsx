// ============================================
// DeepWorkOpportunitiesCardLarge - Large card variant
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
  BrainCircuit24Regular,
  ArrowClockwiseRegular,
  Clock20Regular,
  ArrowLeft20Regular,
  ArrowRight20Regular,
} from '@fluentui/react-icons';

import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';
import { DeepWorkBlock } from '../../models/DeepWorkOpportunities';
import { useDeepWork } from '../../hooks/useDeepWork';
import { DataMode } from '../../services/testData';

export interface DeepWorkOpportunitiesCardLargeProps {
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
  qualityIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '14px',
    fontWeight: 600,
  },
  qualityGold: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground1,
  },
  qualitySilver: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  qualityBronze: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground1,
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
  adjacentMeeting: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  qualityExplanation: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.5,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
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

const formatTimeRange = (start: Date, end: Date): string => {
  const fmt = (d: Date): string =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(start)} - ${fmt(end)}`;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} minutes`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hour${hrs > 1 ? 's' : ''}`;
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

const getQualityExplanation = (quality: 'gold' | 'silver' | 'bronze', durationMinutes: number): string => {
  switch (quality) {
    case 'gold':
      return `This is a gold-quality deep work block (${formatDuration(durationMinutes)}). It represents an uninterrupted focus period with no adjacent meetings and sufficient duration for complex cognitive work.`;
    case 'silver':
      return `This is a silver-quality deep work block (${formatDuration(durationMinutes)}). It has good focus potential but may have an adjacent meeting that could create context-switching overhead.`;
    case 'bronze':
      return `This is a bronze-quality deep work block (${formatDuration(durationMinutes)}). While it provides some focus time, it is shorter or sandwiched between meetings, limiting deep work effectiveness.`;
    default:
      return '';
  }
};

// ============================================
// Component
// ============================================

export const DeepWorkOpportunitiesCardLarge: React.FC<DeepWorkOpportunitiesCardLargeProps> = ({
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();
  const [selectedBlock, setSelectedBlock] = React.useState<DeepWorkBlock | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useDeepWork({ dataMode });

  // Sort blocks by date then start time
  const sortedBlocks = React.useMemo(() => {
    if (!data) return [];
    return [...data.blocks].sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.start.getTime() - b.start.getTime();
    });
  }, [data]);

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (sortedBlocks.length > 0 && !selectedBlock) {
      setSelectedBlock(sortedBlocks[0]);
    }
  }, [sortedBlocks.length]);

  // Render master list item
  const renderMasterItem = (block: DeepWorkBlock, _isSelected: boolean): React.ReactNode => {
    const qualityClass =
      block.quality === 'gold'
        ? styles.qualityGold
        : block.quality === 'silver'
        ? styles.qualitySilver
        : styles.qualityBronze;

    return (
      <div className={styles.masterItem}>
        <div className={`${styles.qualityIcon} ${qualityClass}`}>
          {block.quality === 'gold' ? 'G' : block.quality === 'silver' ? 'S' : 'B'}
        </div>
        <div className={styles.masterInfo}>
          <Text className={styles.masterTitle}>{block.dayLabel}</Text>
          <div className={styles.masterMeta}>
            <span>{formatTimeRange(block.start, block.end)}</span>
            <span>{formatDuration(block.durationMinutes)}</span>
          </div>
        </div>
        <div className={styles.masterRight}>
          <Badge
            appearance="tint"
            color={getQualityBadgeColor(block.quality)}
            size="small"
          >
            {getQualityLabel(block.quality)}
          </Badge>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (block: DeepWorkBlock): React.ReactNode => {
    return (
      <div className={styles.detailContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <Text className={styles.detailTitle}>
            {block.dayLabel} - {formatTimeRange(block.start, block.end)}
          </Text>
          <div className={styles.badgeRow}>
            <Badge appearance="filled" color={getQualityBadgeColor(block.quality)}>
              {getQualityLabel(block.quality)} Block
            </Badge>
            <Badge appearance="tint" color="informative">
              {formatDuration(block.durationMinutes)}
            </Badge>
          </div>
        </div>

        {/* Duration Details */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Duration</Text>
          <div className={styles.detailRow}>
            <Clock20Regular className={styles.detailIcon} />
            <span>{formatDuration(block.durationMinutes)}</span>
          </div>
        </div>

        {/* Adjacent Meetings */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Adjacent Meetings</Text>
          {block.adjacentBefore ? (
            <div className={styles.adjacentMeeting}>
              <ArrowLeft20Regular className={styles.detailIcon} />
              <span>Before: {block.adjacentBefore}</span>
            </div>
          ) : (
            <div className={styles.detailRow}>
              <ArrowLeft20Regular className={styles.detailIcon} />
              <span>No meeting before this block</span>
            </div>
          )}
          {block.adjacentAfter ? (
            <div className={styles.adjacentMeeting}>
              <ArrowRight20Regular className={styles.detailIcon} />
              <span>After: {block.adjacentAfter}</span>
            </div>
          ) : (
            <div className={styles.detailRow}>
              <ArrowRight20Regular className={styles.detailIcon} />
              <span>No meeting after this block</span>
            </div>
          )}
        </div>

        {/* Quality Explanation */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Quality Assessment</Text>
          <div className={styles.qualityExplanation}>
            {getQualityExplanation(block.quality, block.durationMinutes)}
          </div>
        </div>
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (_block: DeepWorkBlock): React.ReactNode => {
    return null;
  };

  // Render empty detail
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <BrainCircuit24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a block to view details</Text>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <BrainCircuit24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No deep work blocks found</Text>
        <Text className={styles.emptyText} style={{ fontSize: '12px' }}>
          No uninterrupted focus blocks were detected this week
        </Text>
      </>
    );
  };

  return (
    <MasterDetailCard<DeepWorkBlock>
      items={sortedBlocks}
      selectedItem={selectedBlock}
      onItemSelect={setSelectedBlock}
      getItemKey={(b) => b.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<BrainCircuit24Regular />}
      title="Deep Work Opportunities"
      itemCount={data?.blocks.length ?? 0}
      loading={isLoading}
      error={error?.message}
      emptyMessage="No deep work blocks"
      emptyIcon={<BrainCircuit24Regular />}
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

export default DeepWorkOpportunitiesCardLarge;
