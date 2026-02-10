// ============================================
// EmailResponseCard - Card with size variants
// Small: Compact chip with metric and chart
// Medium: Summary view with stats and response groups
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
  MailArrowForwardRegular,
  ArrowClockwiseRegular,
  Clock20Regular,
  Mail20Regular,
  ArrowTrendingLines20Regular,
  ArrowUp16Regular,
  ArrowDown16Regular,
} from '@fluentui/react-icons';

import { ResponsePatternGroup } from '../../models/EmailResponse';
import { useEmailResponse } from '../../hooks/useEmailResponse';
import { DataMode } from '../../services/testData';
// Shared components
import { BaseCard, CardHeader, CardSizeMenu, EmptyState, SmallCard } from '../shared';
import { useCardStyles } from '../cardStyles';
// Card size type
import { CardSize } from '../../types/CardSize';

export interface EmailResponseCardProps {
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

const useEmailResponseStyles = makeStyles({
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
  statValueGood: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorPaletteGreenForeground1,
    lineHeight: 1,
    textAlign: 'center',
  },

  // Group list section
  groupListSection: {
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
  groupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  groupRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  groupInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  groupLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  groupMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  groupBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  trendUp: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorPaletteRedForeground1,
  },
  trendDown: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    color: tokens.colorPaletteGreenForeground1,
  },
});

// ============================================
// Helpers
// ============================================

const formatResponseTime = (minutes: number): string => {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

const getResponseTimeColor = (minutes: number): 'danger' | 'warning' | 'success' => {
  if (minutes > 480) return 'danger'; // > 8h
  if (minutes > 120) return 'warning'; // > 2h
  return 'success'; // < 2h
};

const getResponseTimeValueClass = (
  minutes: number,
  styles: {
    statValue: string;
    statValueGood: string;
    statValueWarning: string;
    statValueDanger: string;
  }
): string => {
  if (minutes > 480) return styles.statValueDanger;
  if (minutes > 120) return styles.statValueWarning;
  return styles.statValueGood;
};

// ============================================
// Component
// ============================================

export const EmailResponseCard: React.FC<EmailResponseCardProps> = ({
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

  const styles = useEmailResponseStyles();
  const cardStyles = useCardStyles();

  // Data hook
  const { data, isLoading, error, lastRefreshed, refresh } = useEmailResponse({
    dataMode,
  });

  // ============================================
  // SMALL CARD VARIANT
  // ============================================
  if (size === 'small') {
    return (
      <SmallCard
        cardId="emailResponse"
        title="Response Time"
        icon={<MailArrowForwardRegular />}
        metricValue={data?.stats.unansweredOver24h ?? 0}
        smartLabelKey="email"
        chartData={data?.trendData?.map(p => ({ date: new Date(p.date), value: p.value }))}
        chartColor={(data?.stats?.unansweredOver24h ?? 0) >= 10 ? 'danger' : (data?.stats?.unansweredOver24h ?? 0) >= 5 ? 'warning' : 'brand'}
        currentSize={size}
        onSizeChange={handleSizeChange}
        isLoading={isLoading}
        hasError={!!error}
      />
    );
  }

  // Format overall average for display
  const overallAvgFormatted = useMemo(() => {
    if (!data) return '0m';
    return formatResponseTime(data.stats.overallAvgMinutes);
  }, [data]);

  // Format median for display
  const medianFormatted = useMemo(() => {
    if (!data) return '0m';
    return formatResponseTime(data.stats.overallMedianMinutes);
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
  if (!isLoading && !error && (!data || data.stats.totalAnalysed === 0)) {
    return (
      <BaseCard testId="email-response-card" empty>
        <CardHeader
          icon={<MailArrowForwardRegular />}
          title="Email Response Time"
          actions={<CardSizeMenu currentSize={size} onSizeChange={handleSizeChange} />}
        />
        <EmptyState
          icon={<MailArrowForwardRegular />}
          title="No email data"
          description="No email response patterns to analyse yet"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Analysing email response patterns..."
      testId="email-response-card"
      className={styles.card}
    >
      <CardHeader
        icon={<MailArrowForwardRegular />}
        title="Email Response Time"
        badge={data?.stats.unansweredOver24h}
        badgeVariant={
          data && data.stats.unansweredOver24h >= 10
            ? 'danger'
            : data && data.stats.unansweredOver24h >= 5
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
                <Clock20Regular className={styles.statIcon} />
                Avg Time
              </div>
              <Text className={getResponseTimeValueClass(data.stats.overallAvgMinutes, styles)}>
                {overallAvgFormatted}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <ArrowTrendingLines20Regular className={styles.statIcon} />
                Median
              </div>
              <Text className={getResponseTimeValueClass(data.stats.overallMedianMinutes, styles)}>
                {medianFormatted}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <MailArrowForwardRegular className={styles.statIcon} />
                Unanswered 24h+
              </div>
              <Text className={data.stats.unansweredOver24h >= 10 ? styles.statValueDanger : data.stats.unansweredOver24h >= 5 ? styles.statValueWarning : styles.statValue}>
                {data.stats.unansweredOver24h}
              </Text>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>
                <Mail20Regular className={styles.statIcon} />
                Analysed
              </div>
              <Text className={styles.statValue}>{data.stats.totalAnalysed}</Text>
            </div>
          </div>
        )}

        {/* Response Groups */}
        {data && data.groups.length > 0 && (
          <div className={styles.groupListSection}>
            <Text className={styles.sectionLabel}>Response Patterns</Text>
            <div className={styles.groupList}>
              {data.groups.map((group: ResponsePatternGroup) => (
                <div key={group.groupLabel} className={styles.groupRow}>
                  <div className={styles.groupInfo}>
                    <span className={styles.groupLabel}>{group.groupLabel}</span>
                    <span className={styles.groupMeta}>
                      {formatResponseTime(group.avgResponseMinutes)} avg &middot; {group.emailCount} emails
                    </span>
                  </div>
                  <div className={styles.groupBadges}>
                    <Badge
                      appearance="tint"
                      color={getResponseTimeColor(group.avgResponseMinutes)}
                      size="small"
                    >
                      {formatResponseTime(group.avgResponseMinutes)}
                    </Badge>
                    {group.trendVsLastMonth !== 0 && (
                      <span className={group.trendVsLastMonth > 0 ? styles.trendUp : styles.trendDown}>
                        {group.trendVsLastMonth > 0 ? (
                          <ArrowUp16Regular />
                        ) : (
                          <ArrowDown16Regular />
                        )}
                        {Math.abs(Math.round(group.trendVsLastMonth))}%
                      </span>
                    )}
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

export default EmailResponseCard;
