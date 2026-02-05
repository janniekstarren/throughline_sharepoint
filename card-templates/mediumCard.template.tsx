// ============================================
// {{CardName}}Card - Medium Card (Summary View)
// ============================================
// Template file - Copy and rename for new cards
// Replace {{CardName}} with your card name (e.g., "UpcomingMeetings")
// Replace {{cardName}} with camelCase version (e.g., "upcomingMeetings")
// Replace {{CARD_NAME}} with UPPER_SNAKE_CASE (e.g., "UPCOMING_MEETINGS")
// Replace {{CardTitle}} with display title (e.g., "Upcoming Meetings")
// Replace {{CardIcon}} with Fluent UI icon (e.g., "CalendarRegular")

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
} from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  ArrowExpand20Regular,
  {{CardIcon}},
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  use{{CardName}},
  I{{CardName}}Settings,
  DEFAULT_{{CARD_NAME}}_SETTINGS,
} from '../../hooks/use{{CardName}}';
import { {{CardName}}Data } from '../../models/{{CardName}}';
import { BaseCard, CardHeader, EmptyState } from '../shared';
import { useCardStyles, cardTokens } from '../cardStyles';
import { DataMode } from '../../services/testData';
import { getTest{{CardName}}Data, getTest{{CardName}}Trend } from '../../services/testData/{{cardName}}';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  card: {
    height: cardTokens.size.cardTallHeight,
    minHeight: cardTokens.size.cardStandardHeight,
    maxHeight: cardTokens.size.cardTallHeight,
  },
  content: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingVerticalM,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  expandPrompt: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalM,
    marginTop: 'auto',
    cursor: 'pointer',
    color: tokens.colorBrandForeground1,
    fontSize: '13px',
    fontWeight: 500,
    ':hover': {
      textDecoration: 'underline',
    },
  },
});

// ============================================
// Props Interface
// ============================================
interface {{CardName}}CardProps {
  context: WebPartContext;
  settings?: I{{CardName}}Settings;
  dataMode?: DataMode;
  onToggleSize?: () => void;
}

// ============================================
// Component
// ============================================
export const {{CardName}}Card: React.FC<{{CardName}}CardProps> = ({
  context,
  settings = DEFAULT_{{CARD_NAME}}_SETTINGS,
  dataMode = 'api',
  onToggleSize,
}) => {
  const cardStyles = useCardStyles();
  const styles = useStyles();

  // Test data state (used when dataMode === 'test')
  const [testData, setTestData] = useState<{{CardName}}Data | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data when in test mode
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTest{{CardName}}Data());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // API hook (only used when dataMode === 'api')
  const apiHook = use{{CardName}}(context, settings);

  // Select between API and test data based on mode
  const data = dataMode === 'test' ? testData : apiHook.data;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const lastRefreshed = dataMode === 'test' ? new Date() : apiHook.lastRefreshed;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTest{{CardName}}Data());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Top items to display
  const topItems = useMemo(() => {
    if (!data) return [];
    return data.items.slice(0, 3);
  }, [data]);

  // Expand button
  const expandButton = onToggleSize ? (
    <Tooltip content="View all details" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowExpand20Regular />}
        onClick={onToggleSize}
        aria-label="Expand card"
      />
    </Tooltip>
  ) : undefined;

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
      {expandButton}
    </div>
  );

  // Empty state
  if (!isLoading && !error && (!data || data.totalCount === 0)) {
    return (
      <BaseCard testId="{{cardName}}-card" empty>
        <CardHeader
          icon={<{{CardIcon}} />}
          title="{{CardTitle}}"
          actions={expandButton}
        />
        <EmptyState
          icon={<{{CardIcon}} />}
          title="No items"
          description="Nothing to show here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={isLoading && !data}
      error={error?.message}
      loadingMessage="Loading..."
      testId="{{cardName}}-card"
      className={styles.card}
    >
      <CardHeader
        icon={<{{CardIcon}} />}
        title="{{CardTitle}}"
        badge={data?.totalCount}
        actions={headerActions}
      />

      {/* Stats Grid */}
      {data && (
        <div className={styles.content}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <Text className={styles.statLabel}>Total</Text>
              <Text className={styles.statValue}>{data.totalCount}</Text>
            </div>
            {/* Add more stat items as needed */}
          </div>

          {/* Top Items */}
          {topItems.length > 0 && (
            <div className={styles.itemsList}>
              {topItems.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <Text>{item.title}</Text>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expand Prompt */}
      {onToggleSize && (
        <div className={styles.expandPrompt} onClick={onToggleSize}>
          <ArrowExpand20Regular />
          <span>View all {data?.totalCount} items</span>
        </div>
      )}

      {/* Footer */}
      <div className={cardStyles.cardFooter}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {lastRefreshed && `Updated ${lastRefreshed.toLocaleTimeString()}`}
        </Text>
      </div>
    </BaseCard>
  );
};

export default {{CardName}}Card;
