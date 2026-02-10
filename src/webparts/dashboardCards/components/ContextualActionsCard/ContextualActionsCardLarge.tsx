// ============================================
// ContextualActionsCardLarge - Card #66 (Large View)
// Master-detail layout showing all suggested actions
// with full details in the right panel.
// ============================================

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  Text,
  Button,
  Tooltip,
  tokens,
  makeStyles,
  Badge,
  mergeClasses,
} from '@fluentui/react-components';
import {
  Lightbulb24Regular,
  ArrowClockwiseRegular,
  Open16Regular,
  Circle12Filled,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  SuggestedAction,
  ActionUrgency,
} from '../../models/ContextualActions';
import { useContextualActions } from '../../hooks/useContextualActions';
import { DataMode } from '../../services/testData';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { CardSizeMenu } from '../shared';
import { CardSize } from '../../types/CardSize';

// ============================================
// Props
// ============================================

interface ContextualActionsCardLargeProps {
  context: WebPartContext;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  onSizeChange?: (size: CardSize) => void;
}

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  // Master item row
  masterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  priorityRank: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground3,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
  },
  urgencyDot: {
    flexShrink: 0,
    fontSize: '12px',
  },
  urgencyCritical: {
    color: tokens.colorPaletteRedForeground1,
  },
  urgencyWarning: {
    color: tokens.colorPaletteYellowForeground1,
  },
  urgencyInfo: {
    color: tokens.colorBrandForeground1,
  },
  urgencyPositive: {
    color: tokens.colorPaletteGreenForeground1,
  },
  masterInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
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
    gap: tokens.spacingHorizontalXS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  sourceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `1px ${tokens.spacingHorizontalXS}`,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground3,
    fontSize: '10px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  },

  // Detail panel styles
  detailHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  detailIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: tokens.borderRadiusMedium,
    flexShrink: 0,
  },
  detailInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  detailDescription: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.5',
    marginBottom: tokens.spacingVerticalM,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
  },
  detailField: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  detailFieldLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  detailFieldValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  urgencyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
});

// ============================================
// Helpers
// ============================================

const getUrgencyClass = (
  urgency: ActionUrgency,
  styles: ReturnType<typeof useStyles>
): string => {
  switch (urgency) {
    case 'critical':
      return styles.urgencyCritical;
    case 'warning':
      return styles.urgencyWarning;
    case 'info':
      return styles.urgencyInfo;
    case 'positive':
      return styles.urgencyPositive;
    default:
      return styles.urgencyInfo;
  }
};

const getUrgencyBadgeColor = (urgency: ActionUrgency): 'danger' | 'warning' | 'informative' | 'success' => {
  switch (urgency) {
    case 'critical':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'info':
      return 'informative';
    case 'positive':
      return 'success';
    default:
      return 'informative';
  }
};

const getUrgencyBackgroundColor = (urgency: ActionUrgency): string => {
  switch (urgency) {
    case 'critical':
      return tokens.colorPaletteRedBackground2;
    case 'warning':
      return tokens.colorPaletteYellowBackground2;
    case 'info':
      return tokens.colorBrandBackground2;
    case 'positive':
      return tokens.colorPaletteGreenBackground2;
    default:
      return tokens.colorBrandBackground2;
  }
};

const getUrgencyForegroundColor = (urgency: ActionUrgency): string => {
  switch (urgency) {
    case 'critical':
      return tokens.colorPaletteRedForeground1;
    case 'warning':
      return tokens.colorPaletteYellowForeground1;
    case 'info':
      return tokens.colorBrandForeground1;
    case 'positive':
      return tokens.colorPaletteGreenForeground1;
    default:
      return tokens.colorBrandForeground1;
  }
};

const formatActionType = (type: string): string => {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ============================================
// Component
// ============================================

export const ContextualActionsCardLarge: React.FC<ContextualActionsCardLargeProps> = ({
  context,
  dataMode = 'test',
  aiDemoMode = false,
  onSizeChange,
}) => {
  const styles = useStyles();

  // State
  const [selectedAction, setSelectedAction] = useState<SuggestedAction | undefined>(undefined);

  // Data hook
  const { data, isLoading, error, refresh } = useContextualActions({
    dataMode,
  });

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setSelectedAction(undefined);
    void refresh();
  }, [refresh]);

  // ============================================
  // Render master item
  // ============================================
  const renderMasterItem = useCallback(
    (action: SuggestedAction, isSelected: boolean) => {
      const index = data?.actions.indexOf(action) ?? 0;

      return (
        <div className={styles.masterItem}>
          <span className={styles.priorityRank}>{index + 1}</span>
          <Circle12Filled
            className={mergeClasses(
              styles.urgencyDot,
              getUrgencyClass(action.urgency, styles)
            )}
          />
          <div className={styles.masterInfo}>
            <Text className={styles.masterTitle}>{action.title}</Text>
            <div className={styles.masterMeta}>
              <span className={styles.sourceChip}>{action.sourceCardName}</span>
            </div>
          </div>
        </div>
      );
    },
    [data?.actions, styles]
  );

  // ============================================
  // Render detail content
  // ============================================
  const renderDetailContent = useCallback(
    (action: SuggestedAction) => (
      <>
        <div className={styles.detailHeader}>
          <div
            className={styles.detailIconWrapper}
            style={{
              backgroundColor: getUrgencyBackgroundColor(action.urgency),
              color: getUrgencyForegroundColor(action.urgency),
            }}
          >
            <Lightbulb24Regular />
          </div>
          <div className={styles.detailInfo}>
            <Text className={styles.detailTitle}>{action.title}</Text>
          </div>
        </div>

        <Text className={styles.detailDescription}>{action.description}</Text>

        <div className={styles.detailGrid}>
          <div className={styles.detailField}>
            <Text className={styles.detailFieldLabel}>Source Card</Text>
            <Text className={styles.detailFieldValue}>{action.sourceCardName}</Text>
          </div>
          <div className={styles.detailField}>
            <Text className={styles.detailFieldLabel}>Urgency</Text>
            <div className={styles.urgencyBadge}>
              <Badge
                appearance="tint"
                color={getUrgencyBadgeColor(action.urgency)}
                size="small"
              >
                {action.urgency}
              </Badge>
            </div>
          </div>
          {action.personContext && (
            <div className={styles.detailField}>
              <Text className={styles.detailFieldLabel}>Person</Text>
              <Text className={styles.detailFieldValue}>{action.personContext}</Text>
            </div>
          )}
          {action.timeContext && (
            <div className={styles.detailField}>
              <Text className={styles.detailFieldLabel}>Time Context</Text>
              <Text className={styles.detailFieldValue}>{action.timeContext}</Text>
            </div>
          )}
          <div className={styles.detailField}>
            <Text className={styles.detailFieldLabel}>Estimated Time</Text>
            <Text className={styles.detailFieldValue}>{action.estimatedMinutes} min</Text>
          </div>
          <div className={styles.detailField}>
            <Text className={styles.detailFieldLabel}>Priority Score</Text>
            <Text className={styles.detailFieldValue}>{action.priorityScore}/10</Text>
          </div>
        </div>
      </>
    ),
    [styles]
  );

  // ============================================
  // Render detail actions
  // ============================================
  const renderDetailActions = useCallback(
    (action: SuggestedAction) => (
      <>
        {action.webUrl && (
          <Button
            appearance="primary"
            size="small"
            icon={<Open16Regular />}
            onClick={() => window.open(action.webUrl, '_blank', 'noopener,noreferrer')}
          >
            Open Source
          </Button>
        )}
        <Button appearance="secondary" size="small">
          {formatActionType(action.actionType)}
        </Button>
      </>
    ),
    []
  );

  // ============================================
  // Header actions
  // ============================================
  const headerActions = (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowClockwiseRegular />}
          size="small"
          onClick={handleRefresh}
          disabled={isLoading}
        />
      </Tooltip>
      <CardSizeMenu currentSize="large" onSizeChange={onSizeChange} />
    </div>
  );

  return (
    <MasterDetailCard<SuggestedAction>
      // Data
      items={data?.actions ?? []}
      selectedItem={selectedAction}
      onItemSelect={setSelectedAction}
      getItemKey={(a) => a.id}
      // Rendering
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      // Header
      icon={<Lightbulb24Regular />}
      title="Next Actions"
      itemCount={data?.stats.totalActions}
      // States
      loading={isLoading}
      error={error?.message}
      emptyMessage="No actions to suggest right now"
      emptyIcon={<Lightbulb24Regular />}
      // Actions
      headerActions={headerActions}
    />
  );
};

export default ContextualActionsCardLarge;
