// ============================================
// CommandCentre - Full-screen intelligence settings dialog
// 4 tabs: Cards, Categories, Alerts & Thresholds, Layout
// Pure CSS dialog (not Fluent Dialog) for SharePoint compat
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Tab,
  TabList,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  ArrowReset20Regular,
  ChevronDown20Regular,
} from '@fluentui/react-icons';
import { CardsCanvasTab } from './CardsCanvasTab';
import { CategoriesTab } from './CategoriesTab';
import { AlertsThresholdsTab } from './AlertsThresholdsTab';
import { LayoutTab } from './LayoutTab';
import { IntegrationsTab } from './IntegrationsTab';
import { FeatureFlags } from '../../context/FeatureFlagContext';
import { LicenseTier } from '../../models/CardCatalog';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999990,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: '90vw',
    maxWidth: '1400px',
    height: '90vh',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow64,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 999991,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  tabs: {
    padding: `0 ${tokens.spacingHorizontalXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: tokens.spacingHorizontalXL,
  },
});

// ============================================
// Props
// ============================================

interface CommandCentreProps {
  isOpen: boolean;
  onDismiss: () => void;
  permissions: FeatureFlags;
  pinnedCardIds: string[];
  hiddenCardIds: string[];
  onTogglePin: (cardId: string) => void;
  onToggleHide: (cardId: string) => void;
  onResetAll: () => void;
  currentTier: LicenseTier;
  /** User preference: hide locked/upgrade cards */
  hideLockedCards: boolean;
  onHideLockedCardsChange: (hide: boolean) => void;
  /** User preference: hide in-development/placeholder cards */
  hidePlaceholderCards: boolean;
  onHidePlaceholderCardsChange: (hide: boolean) => void;
  /** User preference: hide integration & in-development cards */
  hideIntegrationAndDevCards: boolean;
  onHideIntegrationAndDevCardsChange: (hide: boolean) => void;
  /** Current effective greeting style */
  salutationType?: string;
  onSalutationTypeChange?: (type: string | undefined) => void;
  /** Current effective theme mode */
  themeMode?: string;
  onThemeModeChange?: (mode: string | undefined) => void;
  /** Current effective category nav mode */
  navMode?: string;
  onNavModeChange?: (mode: string | undefined) => void;
  /** User preference: integrations enabled/disabled */
  integrationsEnabled?: boolean;
  onIntegrationsEnabledChange?: (enabled: boolean) => void;
  /** User preference: float menu (sticky) */
  floatMenu?: boolean;
  onFloatMenuChange?: (float: boolean) => void;
  /** Optional initial tab to open (e.g., 'integrations') */
  initialTab?: string;
  /** Optional platform ID to deep-link to in the integrations tab */
  initialPlatformId?: string;
  /** Opens the Card Store (optionally to a specific card) */
  onOpenStore?: (cardId?: string) => void;
}

// ============================================
// Component
// ============================================

export const CommandCentre: React.FC<CommandCentreProps> = ({
  isOpen,
  onDismiss,
  permissions,
  pinnedCardIds,
  hiddenCardIds,
  onTogglePin,
  onToggleHide,
  onResetAll,
  currentTier,
  hideLockedCards,
  onHideLockedCardsChange,
  hidePlaceholderCards,
  onHidePlaceholderCardsChange,
  hideIntegrationAndDevCards,
  onHideIntegrationAndDevCardsChange,
  salutationType,
  onSalutationTypeChange,
  themeMode,
  onThemeModeChange,
  navMode,
  onNavModeChange,
  integrationsEnabled,
  onIntegrationsEnabledChange,
  floatMenu,
  onFloatMenuChange,
  initialTab,
  initialPlatformId,
  onOpenStore,
}) => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = React.useState(initialTab || 'cards');

  // Sync active tab when initialTab changes while opening
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className={classes.overlay} onClick={onDismiss}>
      <div className={classes.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerLeft}>
            <Text className={classes.title}>Intelligence Command Centre</Text>
            <Text className={classes.subtitle}>
              Your dashboard, your way. Changes save automatically.
            </Text>
          </div>
          <div className={classes.headerRight}>
            <Button appearance="primary" onClick={onDismiss}>
              Done
            </Button>
            <Menu>
              <MenuTrigger>
                <Button
                  appearance="subtle"
                  icon={<ArrowReset20Regular />}
                  iconPosition="before"
                >
                  Reset
                  <ChevronDown20Regular />
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={onResetAll}>
                    Reset all preferences
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={onDismiss}
              aria-label="Close"
            />
          </div>
        </div>

        {/* Tab navigation */}
        <div className={classes.tabs}>
          <TabList
            selectedValue={activeTab}
            onTabSelect={(_ev, data) => setActiveTab(data.value as string)}
          >
            <Tab value="cards">Cards</Tab>
            <Tab value="categories">Categories</Tab>
            <Tab value="alerts">Alerts &amp; Thresholds</Tab>
            <Tab value="layout">Layout</Tab>
            {permissions.showIntegrations && (
              <Tab value="integrations">Integrations</Tab>
            )}
          </TabList>
        </div>

        {/* Tab content */}
        <div className={classes.content}>
          {activeTab === 'cards' && (
            <CardsCanvasTab
              permissions={permissions}
              pinnedCardIds={pinnedCardIds}
              hiddenCardIds={hiddenCardIds}
              onTogglePin={onTogglePin}
              onToggleHide={onToggleHide}
              currentTier={currentTier}
              onOpenStore={onOpenStore}
            />
          )}
          {activeTab === 'categories' && (
            <CategoriesTab />
          )}
          {activeTab === 'alerts' && (
            <AlertsThresholdsTab />
          )}
          {activeTab === 'layout' && (
            <LayoutTab
              hideLockedCards={hideLockedCards}
              onHideLockedCardsChange={onHideLockedCardsChange}
              hidePlaceholderCards={hidePlaceholderCards}
              onHidePlaceholderCardsChange={onHidePlaceholderCardsChange}
              hideIntegrationAndDevCards={hideIntegrationAndDevCards}
              onHideIntegrationAndDevCardsChange={onHideIntegrationAndDevCardsChange}
              salutationType={salutationType}
              onSalutationTypeChange={onSalutationTypeChange}
              themeMode={themeMode}
              onThemeModeChange={onThemeModeChange}
              navMode={navMode}
              onNavModeChange={onNavModeChange}
              floatMenu={floatMenu}
              onFloatMenuChange={onFloatMenuChange}
            />
          )}
          {activeTab === 'integrations' && onIntegrationsEnabledChange && (
            <IntegrationsTab
              integrationsEnabled={integrationsEnabled ?? true}
              onIntegrationsEnabledChange={onIntegrationsEnabledChange}
              initialPlatformId={initialPlatformId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCentre;
