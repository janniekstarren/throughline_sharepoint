import * as React from 'react';
import {
  makeStyles,
  tokens,
  Spinner,
  Text,
  Badge,
  mergeClasses,
} from '@fluentui/react-components';
import {
  ErrorCircle24Regular,
  Calendar24Regular,
} from '@fluentui/react-icons';

export interface IMasterDetailCardProps<T> {
  // Data
  items: T[];
  selectedItem: T | undefined;
  onItemSelect: (item: T) => void;
  getItemKey: (item: T) => string;

  // Rendering
  renderMasterItem: (item: T, isSelected: boolean) => React.ReactNode;
  renderDetailContent: (item: T) => React.ReactNode;
  renderDetailActions: (item: T) => React.ReactNode;
  renderEmptyDetail?: () => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;

  // Header
  icon: React.ReactElement;
  title: string;
  itemCount?: number;

  // States
  loading: boolean;
  error?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactElement;
  selectFirstOnLoad?: boolean;

  // Optional header actions (e.g., collapse button)
  headerActions?: React.ReactNode;

  // Optional content below header (e.g., chart, summary)
  headerContent?: React.ReactNode;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // Height determined by content - detail panel sets the height
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow8,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    flexShrink: 0,
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: '16px',
  },
  titleText: {
    flex: 1,
    fontWeight: 600,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  badge: {
    marginLeft: 'auto',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: tokens.spacingHorizontalS,
  },
  body: {
    display: 'flex',
    // Height determined by detail panel content
    overflow: 'hidden',
  },
  // Master panel (left side - list)
  // Scrolls independently if items exceed detail panel height
  masterPanel: {
    width: '40%',
    minWidth: '200px',
    maxHeight: '500px', // Limit master panel height - scrolls if needed
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    overflowY: 'auto',
    backgroundColor: tokens.colorNeutralBackground1,
    // Custom scrollbar
    '::-webkit-scrollbar': {
      width: '6px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke2,
      borderRadius: '3px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: tokens.colorNeutralStroke1,
    },
  },
  // Detail panel (right side - details)
  // This panel determines the card height - no scrolling, content fits
  detailPanel: {
    width: '60%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  detailContent: {
    // Content determines height - no scrolling needed
    padding: tokens.spacingVerticalL,
  },
  detailActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  // Master list item
  masterItem: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    cursor: 'pointer',
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    transitionProperty: 'background-color, border-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  masterItemSelected: {
    backgroundColor: tokens.colorBrandBackground2,
    borderLeft: `3px solid ${tokens.colorBrandForeground1}`,
    paddingLeft: `calc(${tokens.spacingHorizontalM} - 3px)`,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
  },
  // Empty/Loading/Error states
  emptyDetail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalM,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: tokens.spacingVerticalXXL,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: tokens.spacingVerticalXXL,
    gap: tokens.spacingVerticalM,
    color: tokens.colorPaletteRedForeground1,
  },
  errorIcon: {
    fontSize: '32px',
  },
  errorText: {
    fontSize: '13px',
    textAlign: 'center',
  },
  emptyMasterList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalS,
    textAlign: 'center',
  },
});

export function MasterDetailCard<T>({
  items,
  selectedItem,
  onItemSelect,
  getItemKey,
  renderMasterItem,
  renderDetailContent,
  renderDetailActions,
  renderEmptyDetail,
  renderEmptyState,
  icon,
  title,
  itemCount,
  loading,
  error,
  emptyMessage = 'No items to display',
  emptyIcon,
  headerActions,
  headerContent,
}: IMasterDetailCardProps<T>): React.ReactElement {
  const styles = useStyles();

  // Render loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>{icon}</div>
          <Text className={styles.titleText}>{title}</Text>
          {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
        </div>
        <div className={styles.loadingContainer}>
          <Spinner size="medium" label="Loading..." />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>{icon}</div>
          <Text className={styles.titleText}>{title}</Text>
          {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
        </div>
        <div className={styles.errorContainer}>
          <ErrorCircle24Regular className={styles.errorIcon} />
          <Text className={styles.errorText}>{error}</Text>
        </div>
      </div>
    );
  }

  // Render empty state (no items)
  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>{icon}</div>
          <Text className={styles.titleText}>{title}</Text>
          {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
        </div>
        <div className={styles.body}>
          <div className={styles.masterPanel}>
            <div className={styles.emptyMasterList}>
              {emptyIcon || <Calendar24Regular style={{ fontSize: '32px' }} />}
              <Text className={styles.emptyText}>{emptyMessage}</Text>
            </div>
          </div>
          <div className={styles.detailPanel}>
            <div className={styles.emptyDetail}>
              {renderEmptyState ? renderEmptyState() : (
                <>
                  {emptyIcon || <Calendar24Regular className={styles.emptyIcon} />}
                  <Text className={styles.emptyText}>{emptyMessage}</Text>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get display count
  const displayCount = itemCount !== undefined ? itemCount : items.length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>{icon}</div>
        <Text className={styles.titleText}>{title}</Text>
        {displayCount > 0 && (
          <Badge
            appearance="filled"
            color="brand"
            size="small"
            className={styles.badge}
          >
            {displayCount}
          </Badge>
        )}
        {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
      </div>

      {/* Optional header content (e.g., chart, summary) */}
      {headerContent}

      {/* Body - Master/Detail split */}
      <div className={styles.body}>
        {/* Master Panel (Left) */}
        <div className={styles.masterPanel}>
          {items.map((item) => {
            const key = getItemKey(item);
            const isSelected = selectedItem ? getItemKey(selectedItem) === key : false;
            return (
              <div
                key={key}
                className={mergeClasses(
                  styles.masterItem,
                  isSelected && styles.masterItemSelected
                )}
                onClick={() => onItemSelect(item)}
              >
                {renderMasterItem(item, isSelected)}
              </div>
            );
          })}
        </div>

        {/* Detail Panel (Right) */}
        <div className={styles.detailPanel}>
          {selectedItem ? (
            <>
              <div className={styles.detailContent}>
                {renderDetailContent(selectedItem)}
              </div>
              <div className={styles.detailActions}>
                {renderDetailActions(selectedItem)}
              </div>
            </>
          ) : (
            <div className={styles.emptyDetail}>
              {renderEmptyDetail ? renderEmptyDetail() : (
                <>
                  <Calendar24Regular className={styles.emptyIcon} />
                  <Text className={styles.emptyText}>Select an item to view details</Text>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MasterDetailCard;
