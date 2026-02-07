// ============================================
// SettingsPanel - User Dashboard Settings
// ============================================
// Modal panel for user dashboard customization.
// Uses Fabric UI v8 Panel for SharePoint compatibility.

import * as React from 'react';
import {
  Panel,
  PanelType,
  PrimaryButton,
  DefaultButton,
  Pivot,
  PivotItem,
  Toggle,
  Label,
} from '@fluentui/react';
import { Settings24Regular } from '@fluentui/react-icons';
import { CategoryManager } from './CategoryManager';
import { CardManager } from './CardManager';
import { ICategoryConfig, ICardConfig } from '../../models/DashboardConfiguration';
import { CardSize } from '../../types/CardSize';
import styles from './SettingsPanel.module.scss';

/**
 * Props for SettingsPanel
 */
export interface ISettingsPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Close the panel */
  onDismiss: () => void;
  /** Current categories */
  categories: ICategoryConfig[];
  /** Current card configurations */
  cards: Record<string, ICardConfig>;
  /** Whether user has custom preferences */
  hasUserOverrides: boolean;
  /** Whether animations are enabled */
  animationsEnabled: boolean;

  // Category actions
  onCategoryReorder: (categoryIds: string[]) => void;
  onCategoryCollapsedChange: (categoryId: string, collapsed: boolean) => void;

  // Card actions
  onCardSizeChange: (cardId: string, size: CardSize) => void;
  onCardVisibilityChange: (cardId: string, visible: boolean) => void;
  onCardReorderInCategory: (categoryId: string, cardIds: string[]) => void;
  onCardMoveToCategory: (cardId: string, targetCategoryId: string) => void;

  // Global actions
  onAnimationsEnabledChange: (enabled: boolean) => void;
  onResetToDefaults: () => void;
}

/**
 * SettingsPanel Component
 * User-facing settings modal for dashboard customization.
 */
export const SettingsPanel: React.FC<ISettingsPanelProps> = ({
  isOpen,
  onDismiss,
  categories,
  cards,
  hasUserOverrides,
  animationsEnabled,
  onCategoryReorder,
  onCategoryCollapsedChange,
  onCardSizeChange,
  onCardVisibilityChange,
  onCardReorderInCategory,
  onCardMoveToCategory,
  onAnimationsEnabledChange,
  onResetToDefaults,
}) => {
  // Track if there are unsaved changes (used for future confirmation dialog)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isDirty, setIsDirty] = React.useState(false);

  // Reset dirty state when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setIsDirty(false);
    }
  }, [isOpen]);

  // Wrap handlers to track changes
  const handleCategoryReorder = React.useCallback(
    (categoryIds: string[]) => {
      onCategoryReorder(categoryIds);
      setIsDirty(true);
    },
    [onCategoryReorder]
  );

  const handleCardSizeChange = React.useCallback(
    (cardId: string, size: CardSize) => {
      onCardSizeChange(cardId, size);
      setIsDirty(true);
    },
    [onCardSizeChange]
  );

  const handleCardVisibilityChange = React.useCallback(
    (cardId: string, visible: boolean) => {
      onCardVisibilityChange(cardId, visible);
      setIsDirty(true);
    },
    [onCardVisibilityChange]
  );

  const handleCardReorderInCategory = React.useCallback(
    (categoryId: string, cardIds: string[]) => {
      onCardReorderInCategory(categoryId, cardIds);
      setIsDirty(true);
    },
    [onCardReorderInCategory]
  );

  const handleAnimationsChange = React.useCallback(
    (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
      onAnimationsEnabledChange(checked ?? true);
      setIsDirty(true);
    },
    [onAnimationsEnabledChange]
  );

  const handleReset = React.useCallback(() => {
    onResetToDefaults();
    setIsDirty(false);
  }, [onResetToDefaults]);

  // Panel footer buttons
  const onRenderFooterContent = React.useCallback(
    () => (
      <div className={styles.panelFooter}>
        <PrimaryButton onClick={onDismiss}>
          Done
        </PrimaryButton>
        {hasUserOverrides && (
          <DefaultButton onClick={handleReset}>
            Reset to Defaults
          </DefaultButton>
        )}
      </div>
    ),
    [onDismiss, hasUserOverrides, handleReset]
  );

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.medium}
      headerText="Dashboard Settings"
      closeButtonAriaLabel="Close settings"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      styles={{
        main: {
          zIndex: 1000001,
        },
        overlay: {
          zIndex: 1000000,
        },
      }}
    >
      <div className={styles.settingsContent}>
        <Pivot aria-label="Settings tabs">
          {/* Categories Tab */}
          <PivotItem headerText="Categories" itemIcon="GridViewMedium">
            <div className={styles.tabContent}>
              <p className={styles.tabDescription}>
                Drag categories to reorder them on your dashboard.
              </p>
              <CategoryManager
                categories={categories}
                onReorder={handleCategoryReorder}
                onCollapsedChange={onCategoryCollapsedChange}
              />
            </div>
          </PivotItem>

          {/* Cards Tab */}
          <PivotItem headerText="Cards" itemIcon="Tiles">
            <div className={styles.tabContent}>
              <p className={styles.tabDescription}>
                Show, hide, or resize individual cards.
              </p>
              <CardManager
                categories={categories}
                cards={cards}
                onSizeChange={handleCardSizeChange}
                onVisibilityChange={handleCardVisibilityChange}
                onReorderInCategory={handleCardReorderInCategory}
                onMoveToCategory={onCardMoveToCategory}
              />
            </div>
          </PivotItem>

          {/* Preferences Tab */}
          <PivotItem headerText="Preferences" itemIcon="Settings">
            <div className={styles.tabContent}>
              <p className={styles.tabDescription}>
                Customize your dashboard experience.
              </p>

              <div className={styles.preferenceItem}>
                <Toggle
                  label="Enable animations"
                  checked={animationsEnabled}
                  onChange={handleAnimationsChange}
                  inlineLabel
                />
                <span className={styles.preferenceDescription}>
                  Show smooth animations when cards move or resize.
                </span>
              </div>

              {hasUserOverrides && (
                <div className={styles.resetSection}>
                  <Label>Reset Customizations</Label>
                  <p className={styles.resetDescription}>
                    You have custom settings applied. Click below to restore the default
                    dashboard layout.
                  </p>
                  <DefaultButton onClick={handleReset}>
                    Reset to Defaults
                  </DefaultButton>
                </div>
              )}
            </div>
          </PivotItem>
        </Pivot>
      </div>
    </Panel>
  );
};

// ============================================
// Settings Button
// ============================================

/**
 * Props for SettingsButton
 */
export interface ISettingsButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Button label (optional) */
  label?: string;
}

/**
 * SettingsButton Component
 * Button to open the settings panel.
 */
export const SettingsButton: React.FC<ISettingsButtonProps> = ({
  onClick,
  label = 'Settings',
}) => {
  return (
    <button
      className={styles.settingsButton}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Settings24Regular />
    </button>
  );
};

export default SettingsPanel;
