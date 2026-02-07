// ============================================
// SettingsPanel - User Dashboard Settings
// ============================================
// Modal panel for user dashboard customization.
// Uses pure CSS for the sliding panel to avoid React portal issues (Error #310)
// that occur with Fabric v8 Panel and Fluent v9 Drawer in SharePoint.

import * as React from 'react';
import { Settings24Regular, Dismiss24Regular } from '@fluentui/react-icons';
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

type TabValue = 'cards' | 'preferences';

/**
 * SettingsPanel Component
 * User-facing settings panel for dashboard customization.
 * Uses pure CSS sliding panel to avoid React portal issues in SharePoint.
 */
export const SettingsPanel: React.FC<ISettingsPanelProps> = ({
  isOpen,
  onDismiss,
  categories,
  cards,
  hasUserOverrides,
  animationsEnabled,
  onCardSizeChange,
  onCardVisibilityChange,
  onCardReorderInCategory,
  onCardMoveToCategory,
  onAnimationsEnabledChange,
  onResetToDefaults,
}) => {
  const [selectedTab, setSelectedTab] = React.useState<TabValue>('cards');

  // Reset to cards tab when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTab('cards');
    }
  }, [isOpen]);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onDismiss();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDismiss]);

  const handleAnimationsChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      onAnimationsEnabledChange(ev.currentTarget.checked);
    },
    [onAnimationsEnabledChange]
  );

  const handleReset = React.useCallback(() => {
    onResetToDefaults();
  }, [onResetToDefaults]);

  // Don't render anything if not open (but keep the component mounted for animation)
  const panelClasses = [
    styles.settingsPanel,
    isOpen ? styles.open : styles.closed,
  ].join(' ');

  const overlayClasses = [
    styles.overlay,
    isOpen ? styles.overlayVisible : '',
  ].join(' ');

  return (
    <>
      {/* Overlay */}
      <div
        className={overlayClasses}
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={panelClasses} role="dialog" aria-modal="true" aria-label="Dashboard Settings">
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Dashboard Settings</h2>
          <button
            className={styles.closeButton}
            onClick={onDismiss}
            aria-label="Close settings"
          >
            <Dismiss24Regular />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabList}>
          <button
            className={`${styles.tab} ${selectedTab === 'cards' ? styles.tabActive : ''}`}
            onClick={() => setSelectedTab('cards')}
          >
            Cards
          </button>
          <button
            className={`${styles.tab} ${selectedTab === 'preferences' ? styles.tabActive : ''}`}
            onClick={() => setSelectedTab('preferences')}
          >
            Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.content}>
          {selectedTab === 'cards' && (
            <>
              <p className={styles.description}>
                Change card sizes using the dropdown menu on each card.
              </p>
              <CardManager
                categories={categories}
                cards={cards}
                onSizeChange={onCardSizeChange}
                onVisibilityChange={onCardVisibilityChange}
                onReorderInCategory={onCardReorderInCategory}
                onMoveToCategory={onCardMoveToCategory}
              />
            </>
          )}

          {selectedTab === 'preferences' && (
            <>
              <p className={styles.description}>
                Customize your dashboard experience.
              </p>

              <div className={styles.preferenceItem}>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={animationsEnabled}
                    onChange={handleAnimationsChange}
                    className={styles.switchInput}
                  />
                  <span className={styles.switchTrack}>
                    <span className={styles.switchThumb} />
                  </span>
                  <span className={styles.switchText}>Enable animations</span>
                </label>
                <span className={styles.preferenceDescription}>
                  Show smooth animations when cards move or resize.
                </span>
              </div>

              {hasUserOverrides && (
                <div className={styles.resetSection}>
                  <strong>Reset Customizations</strong>
                  <p className={styles.resetDescription}>
                    You have custom settings applied. Click below to restore the default
                    dashboard layout.
                  </p>
                  <button className={styles.resetButton} onClick={handleReset}>
                    Reset to Defaults
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.doneButton} onClick={onDismiss}>
            Done
          </button>
        </div>
      </div>
    </>
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
