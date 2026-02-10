import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  PropertyPaneSlider,
  IPropertyPaneGroup,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'DashboardCardsWebPartStrings';
import DashboardCards from './components/DashboardCards';
import { IDashboardCardsProps } from './components/DashboardCards';
import { SalutationType } from './components/Salutation';
import { PropertyPaneResetButtons } from './propertyPane/PropertyPaneResetButtons';
import { clearUserPreferences } from './services/UserPreferencesService';
import { cleanupPortalContainer } from './services/PortalService';

export type ThemeMode = 'auto' | 'light' | 'dark';

// Waiting On You card settings
export interface IWaitingOnYouSettings {
  staleDays: number;           // Days before a conversation is considered stale (default: 2)
  includeEmail: boolean;       // Include emails (default: true)
  includeTeamsChats: boolean;  // Include Teams chats (default: true)
  includeChannels: boolean;    // Include channel messages (default: false)
  includeMentions: boolean;    // Include @mentions in Teams messages (default: true)
  showChart: boolean;          // Show the trend chart (default: true)
}

// Waiting On Others card settings
export interface IWaitingOnOthersSettings {
  minWaitHours: number;        // Minimum hours before showing (default: 24)
  includeEmail: boolean;       // Include emails (default: true)
  includeTeamsChats: boolean;  // Include Teams chats (default: true)
  includeMentions: boolean;    // Prioritize messages where you @mentioned someone (default: true)
  showChart: boolean;          // Show the trend chart (default: true)
}

// Context Switching card settings
export interface IContextSwitchingSettings {
  trackEmail: boolean;         // Track email context switches (default: true)
  trackTeamsChat: boolean;     // Track Teams chat switches (default: true)
  trackTeamsChannel: boolean;  // Track Teams channel switches (default: true)
  trackMeetings: boolean;      // Track meeting switches (default: true)
  trackFiles: boolean;         // Track file access switches (default: true)
  focusGoal: number;           // Focus goal in minutes (default: 25)
  showFocusScore: boolean;     // Show focus score circle (default: true)
  showHourlyChart: boolean;    // Show hourly bar chart (default: true)
  showDistribution: boolean;   // Show context type distribution (default: true)
}

// Data mode type
export type DataMode = 'api' | 'test';

export interface IDashboardCardsWebPartProps {
  salutationType: SalutationType;
  // Theme mode
  themeMode: ThemeMode;
  // Data mode: 'api' for live Graph data, 'test' for mock data
  dataMode: DataMode;
  // AI Demo Mode: show AI-enhanced content (only applicable when dataMode === 'test')
  aiDemoMode: boolean;

  // --- Legacy: persisted in SP property bag but no longer used in UI ---
  salutationSize?: string;
  showTodaysAgenda?: boolean;
  showEmail?: boolean;
  showMyTasks?: boolean;
  showRecentFiles?: boolean;
  showUpcomingWeek?: boolean;
  showMyTeam?: boolean;
  showSharedWithMe?: boolean;
  showQuickLinks?: boolean;
  showSiteActivity?: boolean;
  showWaitingOnYou?: boolean;
  showWaitingOnOthers?: boolean;
  showContextSwitching?: boolean;
  cardOrder?: string[];
  cardTitles?: Record<string, string>;
  categoryNames?: Record<string, string>;
  categoryOrder?: string[];
  categoryConfig?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  cardCategoryAssignment?: Record<string, string>;
  categoryIcons?: Record<string, string>;
  collapsedCardIds?: string[];
  defaultCardSize?: string;
  columnsOverride?: number;
  dashboardTitle?: string;
  showDashboardTitle?: boolean;
  // --- End legacy ---

  // Waiting On You card settings
  waitingOnYouSettings: IWaitingOnYouSettings;
  // Waiting On Others card settings
  waitingOnOthersSettings: IWaitingOnOthersSettings;
  // Context Switching card settings
  contextSwitchingSettings: IContextSwitchingSettings;
  // Demo mode: show tier switcher FAB for license tier demos
  isDemoMode: boolean;

  // === ADMIN: DEFAULT LAYOUT ===
  defaultView: string;              // 'categories' | 'needs-attention' | 'high-impact' | 'compact'
  showLockedCards: boolean;
  showPlaceholderCards: boolean;
  showIntegrationAndDevCards: boolean;
  showCategoryDescriptions: boolean;

  // === ADMIN: USER CUSTOMISATION FEATURE FLAGS ===
  allowUserCustomisation: boolean;
  allowCardHiding: boolean;
  allowCardPinning: boolean;
  allowCardRenaming: boolean;
  allowCategoryReorder: boolean;
  allowCategoryHiding: boolean;
  allowCategoryRenaming: boolean;
  allowViewSwitching: boolean;

  // === ADMIN: CARD STORE FEATURE FLAGS ===
  showCardStore: boolean;
  allowAlaCartePurchase: boolean;
  allowTrials: boolean;
  showPricing: boolean;

  // === ADMIN: INTELLIGENCE HUB FLAGS ===
  showIntelligenceHub: boolean;
  showGreeting: boolean;
  showQueryBox: boolean;
  showInsightsRollup: boolean;
  hubStartCollapsed: boolean;
  insightsRefreshInterval: number;   // seconds (0 = manual only)
  showFloatingAIChat: boolean;       // Floating AI chat dialog toggle
  // Adaptive Rendering
  enableAdaptiveRendering: boolean;  // Master toggle for adaptive visual rendering
  enableAutoPromotion: boolean;      // Allow auto-promotion of card sizes
  showPulse: boolean;                // Show global status pulse indicator
  glowIntensity: string;             // 'subtle' | 'standard' | 'vivid'
}

export default class DashboardCardsWebPart extends BaseClientSideWebPart<IDashboardCardsWebPartProps> {
  protected async onInit(): Promise<void> {
    await super.onInit();
    this._migrateFromLegacyCategories();
    this._injectPropertyPaneStyles();
  }

  /**
   * Migration: Clear legacy category configuration from persisted properties.
   *
   * Previously, the dashboard used 6 admin-configured categories
   * ('calendar', 'email', 'tasks', 'files', 'people', 'navigation').
   * The new registry-based layout (80 cards, 6 canonical categories) activates
   * only when categoryOrder is empty. If old values are persisted in the
   * SharePoint property bag, clear them so the new layout activates.
   */
  private _migrateFromLegacyCategories(): void {
    const legacyCategoryIds = ['calendar', 'email', 'tasks', 'files', 'people', 'navigation'];

    if (this.properties.categoryOrder && this.properties.categoryOrder.length > 0) {
      // Check if the stored categoryOrder matches the old legacy defaults
      const isLegacy = this.properties.categoryOrder.every(
        (catId: string) => legacyCategoryIds.includes(catId) || catId === 'available'
      );

      if (isLegacy) {
        console.log('[Throughline] Migrating from legacy category config to registry-based layout');
        this.properties.categoryOrder = [];
        this.properties.categoryConfig = {};
        this.properties.cardCategoryAssignment = {};
        this.properties.categoryIcons = {};
        // Note: categoryNames is preserved in case admin renamed categories deliberately
      }
    }
  }

  private _injectPropertyPaneStyles(): void {
    const styleId = 'throughline-property-pane-styles';
    if (document.getElementById(styleId)) {
      return; // Already injected
    }

    const styles = `
      /* Property Pane Overrides - Fluent 2 Design (theme-aware) */
      .propertyPanePageContent::-webkit-scrollbar { width: 6px; }
      .propertyPanePageContent::-webkit-scrollbar-track { background: transparent; }
      .propertyPanePageContent::-webkit-scrollbar-thumb { background: var(--neutralTertiaryAlt, rgba(0,0,0,0.1)); border-radius: 3px; }
      .propertyPanePageContent::-webkit-scrollbar-thumb:hover { background: var(--neutralTertiary, rgba(0,0,0,0.15)); }

      /* Property pane groups (accordions) - use inherit for colors */
      .ms-PropertyPaneGroup { margin-bottom: 12px !important; border-radius: 10px !important; overflow: hidden !important; }
      .ms-PropertyPaneGroup-group { border: none !important; }
      .ms-PropertyPaneGroup-groupHeader { border-radius: 10px !important; padding: 14px 16px !important; font-weight: 600 !important; font-size: 14px !important; letter-spacing: -0.01em !important; }

      /* Dropdowns - Fabric UI */
      .ms-Dropdown .ms-Dropdown-title { border-radius: 8px !important; }
      .ms-Dropdown-callout { border-radius: 8px !important; border: none !important; overflow: hidden !important; }
      .ms-Dropdown-item { border-radius: 6px !important; margin: 2px 4px !important; }

      /* Text fields - Fabric UI */
      .ms-TextField .ms-TextField-fieldGroup { border-radius: 8px !important; }

      /* Labels */
      .ms-Label { font-weight: 500 !important; font-size: 13px !important; }

      /* Toggles - Fabric UI */
      .ms-Toggle .ms-Toggle-background { border-radius: 10px !important; }
      .ms-Toggle .ms-Toggle-thumb { border-radius: 50% !important; }

      /* Buttons - Fabric UI */
      .ms-Button { border-radius: 8px !important; }

      /* Checkbox - Fabric UI */
      .ms-Checkbox .ms-Checkbox-checkbox { border-radius: 4px !important; }

      /* Fluent UI v9 (fui-*) Overrides */
      /* Switch/Toggle */
      .fui-Switch__indicator { border-radius: 10px !important; }
      .fui-Switch__input { border-radius: 10px !important; }

      /* Input fields */
      .fui-Input { border-radius: 8px !important; }
      .fui-Input__input { border-radius: 8px !important; }

      /* Buttons */
      .fui-Button { border-radius: 8px !important; }

      /* Dropdown/Combobox */
      .fui-Dropdown { border-radius: 8px !important; }
      .fui-Listbox { border-radius: 8px !important; }
      .fui-Option { border-radius: 6px !important; margin: 2px 4px !important; }

      /* Checkbox */
      .fui-Checkbox__indicator { border-radius: 4px !important; }

      /* Dialog Surface */
      .fui-DialogSurface { border-radius: 16px !important; }
      .fui-DialogBody { border-radius: 16px !important; overflow: hidden !important; }

      /* Popover Surface */
      .fui-PopoverSurface { border-radius: 12px !important; }

      /* Portal z-index for Fluent UI Popover/Menu in SharePoint */
      /* These render in portals outside component DOM - need global CSS */
      /* Target all possible portal containers SharePoint might use */
      [data-portal-node] { z-index: 1000000 !important; }
      .fui-MenuPopover { z-index: 1000001 !important; }
      .fui-PopoverSurface { z-index: 1000001 !important; }

      /* SharePoint-specific portal targeting */
      body > div[class*="fui-FluentProvider"] { z-index: 1000000 !important; }
      body > div[data-popper-placement] { z-index: 1000001 !important; }
      .fui-Portal { z-index: 1000000 !important; }

      /* Ensure Menu/Popover content is above SP chrome */
      .fui-Menu { z-index: 1000001 !important; }
      .fui-MenuList { z-index: 1000001 !important; }
      .fui-Popover { z-index: 1000001 !important; }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  public render(): void {
    const element: React.ReactElement<IDashboardCardsProps> = React.createElement(
      DashboardCards,
      {
        context: this.context,
        salutationType: this.properties.salutationType || 'timeBased',
        themeMode: this.properties.themeMode || 'light',
        dataMode: this.properties.dataMode || 'api',
        aiDemoMode: this.properties.aiDemoMode || false,
        waitingOnYouSettings: this.properties.waitingOnYouSettings || {
          staleDays: 2,
          includeEmail: true,
          includeTeamsChats: true,
          includeChannels: false,
          includeMentions: true,
          showChart: true,
        },
        waitingOnOthersSettings: this.properties.waitingOnOthersSettings || {
          minWaitHours: 24,
          includeEmail: true,
          includeTeamsChats: true,
          includeMentions: true,
          showChart: true,
        },
        contextSwitchingSettings: this.properties.contextSwitchingSettings || {
          trackEmail: true,
          trackTeamsChat: true,
          trackTeamsChannel: true,
          trackMeetings: true,
          trackFiles: true,
          focusGoal: 25,
          showFocusScore: true,
          showHourlyChart: true,
          showDistribution: true,
        },
        // Demo mode for tier switcher
        isDemoMode: this.properties.isDemoMode || false,
        // Admin feature flags
        featureFlags: {
          allowUserCustomisation: this.properties.allowUserCustomisation !== false,
          allowCardHiding: this.properties.allowCardHiding !== false,
          allowCardPinning: this.properties.allowCardPinning !== false,
          allowCardRenaming: this.properties.allowCardRenaming !== false,
          allowCategoryReorder: this.properties.allowCategoryReorder !== false,
          allowCategoryHiding: this.properties.allowCategoryHiding !== false,
          allowCategoryRenaming: this.properties.allowCategoryRenaming !== false,
          allowViewSwitching: this.properties.allowViewSwitching !== false,
          isDemoMode: this.properties.isDemoMode || false,
          showLockedCards: this.properties.showLockedCards !== false,
          showPlaceholderCards: this.properties.showPlaceholderCards !== false,
          showIntegrationAndDevCards: this.properties.showIntegrationAndDevCards !== false,
          showCategoryDescriptions: this.properties.showCategoryDescriptions !== false,
          // Card Store flags
          showCardStore: this.properties.showCardStore !== false,
          allowAlaCartePurchase: this.properties.allowAlaCartePurchase !== false,
          allowTrials: this.properties.allowTrials !== false,
          showPricing: this.properties.showPricing !== false,
          // Intelligence Hub flags
          showIntelligenceHub: this.properties.showIntelligenceHub !== false,
          showGreeting: this.properties.showGreeting !== false,
          showQueryBox: this.properties.showQueryBox !== false,
          showInsightsRollup: this.properties.showInsightsRollup !== false,
          hubStartCollapsed: this.properties.hubStartCollapsed || false,
          insightsRefreshInterval: this.properties.insightsRefreshInterval ?? 300,
          enableFloatingAIChat: this.properties.showFloatingAIChat !== false,
          // Adaptive Rendering flags
          enableAdaptiveRendering: this.properties.enableAdaptiveRendering !== false,
          enableAutoPromotion: this.properties.enableAutoPromotion !== false,
          showPulse: this.properties.showPulse !== false,
          glowIntensity: (this.properties.glowIntensity as 'subtle' | 'standard' | 'vivid') || 'standard',
        },
        // Admin layout defaults
        defaultView: this.properties.defaultView || 'categories',
        showLockedCards: this.properties.showLockedCards !== false,
        showPlaceholderCards: this.properties.showPlaceholderCards !== false,
        showCategoryDescriptions: this.properties.showCategoryDescriptions !== false,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
    // Clean up portal container for Fluent UI popovers
    cleanupPortalContainer();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  /**
   * Build the greeting settings group fields
   * Returns the salutationType dropdown only.
   */
  private getGreetingFields(): IPropertyPaneGroup['groupFields'] {
    return [
      PropertyPaneDropdown('salutationType', {
        label: strings.SalutationTypeLabel,
        options: [
          { key: 'timeBased', text: strings.SalutationTimeBased },
          { key: 'worldHello', text: strings.SalutationWorldHello },
          { key: 'claude', text: strings.SalutationClaude },
          { key: 'none', text: strings.SalutationNone },
        ],
        selectedKey: this.properties.salutationType || 'timeBased',
      }),
    ];
  }

  /**
   * Determines when the reactive property pane re-renders the web part
   */
  protected get disableReactivePropertyChanges(): boolean {
    return false; // Enable reactive updates
  }

  /**
   * Build the appearance settings group fields
   */
  private getAppearanceFields(): IPropertyPaneGroup['groupFields'] {
    return [
      PropertyPaneDropdown('themeMode', {
        label: strings.ThemeModeLabel,
        options: [
          { key: 'auto', text: strings.ThemeModeAuto },
          { key: 'light', text: strings.ThemeModeLight },
          { key: 'dark', text: strings.ThemeModeDark },
        ],
        selectedKey: this.properties.themeMode || 'light',
      }),
      PropertyPaneDropdown('dataMode', {
        label: strings.DataModeLabel,
        options: [
          { key: 'api', text: strings.DataModeApi },
          { key: 'test', text: strings.DataModeTest },
        ],
        selectedKey: this.properties.dataMode || 'api',
      }),
      // AI Demo Mode toggle - only shown when in test mode
      ...(this.properties.dataMode === 'test' ? [
        PropertyPaneToggle('aiDemoMode', {
          label: strings.AiDemoModeLabel,
          onText: strings.AiDemoModeOn,
          offText: strings.AiDemoModeOff,
          checked: this.properties.aiDemoMode || false,
        }),
      ] : []),
    ];
  }

  /**
   * Clear user's local storage preferences
   */
  private _clearLocalStoragePreferences(): void {
    const userId = this.context.pageContext?.user?.loginName || '';
    if (userId) {
      clearUserPreferences(userId);
      // Re-render to show default settings
      this.render();
    }
  }

  /**
   * Reset all webpart properties to default values
   */
  private _resetToDefaultSettings(): void {
    // Reset greeting settings
    this.properties.salutationType = 'timeBased' as SalutationType;

    // Reset appearance
    this.properties.themeMode = 'light' as ThemeMode;
    this.properties.dataMode = 'api' as DataMode;

    // Reset Waiting On You settings
    this.properties.waitingOnYouSettings = {
      staleDays: 2,
      includeEmail: true,
      includeTeamsChats: true,
      includeChannels: false,
      includeMentions: true,
      showChart: true,
    };

    // Reset Waiting On Others settings
    this.properties.waitingOnOthersSettings = {
      minWaitHours: 24,
      includeEmail: true,
      includeTeamsChats: true,
      includeMentions: true,
      showChart: true,
    };

    // Reset Context Switching settings
    this.properties.contextSwitchingSettings = {
      trackEmail: true,
      trackTeamsChat: true,
      trackTeamsChannel: true,
      trackMeetings: true,
      trackFiles: true,
      focusGoal: 25,
      showFocusScore: true,
      showHourlyChart: true,
      showDistribution: true,
    };

    // Re-render
    this.render();

    // Refresh property pane
    this.context.propertyPane.refresh();
  }

  /**
   * Build the reset/maintenance settings group fields
   */
  private getResetFields(): IPropertyPaneGroup['groupFields'] {
    const userName = this.context.pageContext?.user?.displayName || '';

    return [
      PropertyPaneResetButtons('resetButtons', {
        onClearLocalStorage: () => this._clearLocalStoragePreferences(),
        onResetToDefault: () => this._resetToDefaultSettings(),
        userName,
      }),
    ];
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          displayGroupsAsAccordion: true,
          groups: [
            // --- Intelligence Hub ---
            {
              groupName: 'Intelligence Hub',
              isCollapsed: false,
              groupFields: [
                PropertyPaneToggle('showIntelligenceHub', {
                  label: 'Show Intelligence Hub',
                  onText: 'Visible',
                  offText: 'Hidden',
                  checked: this.properties.showIntelligenceHub !== false,
                }),
                PropertyPaneToggle('showGreeting', {
                  label: 'Show greeting',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showGreeting !== false,
                  disabled: this.properties.showIntelligenceHub === false,
                }),
                PropertyPaneToggle('showQueryBox', {
                  label: 'Show query box',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showQueryBox !== false,
                  disabled: this.properties.showIntelligenceHub === false,
                }),
                PropertyPaneToggle('showInsightsRollup', {
                  label: 'Show insights rollup',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showInsightsRollup !== false,
                  disabled: this.properties.showIntelligenceHub === false,
                }),
                PropertyPaneToggle('hubStartCollapsed', {
                  label: 'Start collapsed',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.hubStartCollapsed || false,
                  disabled: this.properties.showIntelligenceHub === false,
                }),
                PropertyPaneSlider('insightsRefreshInterval', {
                  label: 'Insights refresh (seconds, 0 = manual)',
                  min: 0,
                  max: 900,
                  step: 60,
                  value: this.properties.insightsRefreshInterval ?? 300,
                  disabled: this.properties.showIntelligenceHub === false,
                }),
                PropertyPaneToggle('showFloatingAIChat', {
                  label: 'Floating AI Chat',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showFloatingAIChat !== false,
                  disabled: this.properties.showIntelligenceHub === false,
                }),
              ],
            },
            // --- Adaptive Rendering ---
            {
              groupName: 'Adaptive Rendering',
              isCollapsed: true,
              groupFields: [
                PropertyPaneToggle('enableAdaptiveRendering', {
                  label: 'Enable adaptive card rendering',
                  onText: 'Cards respond visually to data urgency',
                  offText: 'Uniform card appearance (classic mode)',
                  checked: this.properties.enableAdaptiveRendering !== false,
                }),
                PropertyPaneToggle('enableAutoPromotion', {
                  label: 'Allow auto-sizing of cards',
                  onText: 'Urgent cards can promote to larger size',
                  offText: 'All cards stay at chosen size',
                  checked: this.properties.enableAutoPromotion !== false,
                  disabled: this.properties.enableAdaptiveRendering === false,
                }),
                PropertyPaneToggle('showPulse', {
                  label: 'Show status pulse in header',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showPulse !== false,
                  disabled: this.properties.enableAdaptiveRendering === false,
                }),
                PropertyPaneDropdown('glowIntensity', {
                  label: 'Glow intensity',
                  options: [
                    { key: 'subtle', text: 'Subtle — soft ambient glow' },
                    { key: 'standard', text: 'Standard — clear urgency glow' },
                    { key: 'vivid', text: 'Vivid — strong urgency glow' },
                  ],
                  selectedKey: this.properties.glowIntensity || 'standard',
                  disabled: this.properties.enableAdaptiveRendering === false,
                }),
              ],
            },
            // --- Card Store ---
            {
              groupName: 'Card Store',
              isCollapsed: false,
              groupFields: [
                PropertyPaneToggle('showCardStore', {
                  label: 'Show Card Store',
                  onText: 'Visible',
                  offText: 'Hidden',
                  checked: this.properties.showCardStore !== false,
                }),
                PropertyPaneToggle('allowAlaCartePurchase', {
                  label: 'Allow a la carte purchase',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowAlaCartePurchase !== false,
                  disabled: this.properties.showCardStore === false,
                }),
                PropertyPaneToggle('allowTrials', {
                  label: 'Allow free trials',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowTrials !== false,
                  disabled: this.properties.showCardStore === false,
                }),
                PropertyPaneToggle('showPricing', {
                  label: 'Show pricing',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showPricing !== false,
                  disabled: this.properties.showCardStore === false,
                }),
              ],
            },
            // --- Dashboard Display (merged with Appearance) ---
            {
              groupName: 'Dashboard Display',
              isCollapsed: true,
              groupFields: [
                ...this.getAppearanceFields(),
                PropertyPaneDropdown('defaultView', {
                  label: 'Default dashboard view',
                  options: [
                    { key: 'categories', text: 'Categories (grouped)' },
                    { key: 'needs-attention', text: 'Needs Attention' },
                    { key: 'high-impact', text: 'High Impact (9-10)' },
                    { key: 'compact', text: 'Compact (dense grid)' },
                  ],
                  selectedKey: this.properties.defaultView || 'categories',
                }),
                ...this.getGreetingFields(),
                PropertyPaneToggle('showLockedCards', {
                  label: 'Show locked/upgrade cards',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showLockedCards !== false,
                }),
                PropertyPaneToggle('showPlaceholderCards', {
                  label: 'Show in-development cards',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showPlaceholderCards !== false,
                }),
                PropertyPaneToggle('showIntegrationAndDevCards', {
                  label: 'Show integration & in-development cards',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showIntegrationAndDevCards !== false,
                }),
                PropertyPaneToggle('showCategoryDescriptions', {
                  label: 'Show category descriptions',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showCategoryDescriptions !== false,
                }),
              ],
            },
            // --- User Customisation ---
            {
              groupName: 'User Customisation',
              isCollapsed: true,
              groupFields: [
                PropertyPaneToggle('allowUserCustomisation', {
                  label: 'Enable user settings panel',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowUserCustomisation !== false,
                }),
                PropertyPaneToggle('allowCardHiding', {
                  label: 'Allow users to hide cards',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowCardHiding !== false,
                  disabled: this.properties.allowUserCustomisation === false,
                }),
                PropertyPaneToggle('allowCardPinning', {
                  label: 'Allow users to pin/reorder cards',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowCardPinning !== false,
                  disabled: this.properties.allowUserCustomisation === false,
                }),
                PropertyPaneToggle('allowCardRenaming', {
                  label: 'Allow users to rename cards',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowCardRenaming !== false,
                  disabled: this.properties.allowUserCustomisation === false,
                }),
                PropertyPaneToggle('allowCategoryReorder', {
                  label: 'Allow users to reorder categories',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowCategoryReorder !== false,
                  disabled: this.properties.allowUserCustomisation === false,
                }),
                PropertyPaneToggle('allowCategoryHiding', {
                  label: 'Allow users to hide categories',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowCategoryHiding !== false,
                  disabled: this.properties.allowUserCustomisation === false,
                }),
                PropertyPaneToggle('allowCategoryRenaming', {
                  label: 'Allow users to rename categories',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowCategoryRenaming !== false,
                  disabled: this.properties.allowUserCustomisation === false,
                }),
                PropertyPaneToggle('allowViewSwitching', {
                  label: 'Allow users to switch views',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.allowViewSwitching !== false,
                  disabled: this.properties.allowUserCustomisation === false,
                }),
              ],
            },
            // --- Demo & POC ---
            {
              groupName: 'Demo & POC',
              isCollapsed: true,
              groupFields: [
                PropertyPaneToggle('isDemoMode', {
                  label: 'Demo mode (show tier switcher)',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.isDemoMode || false,
                }),
              ],
            },
            // --- Reset & Maintenance ---
            {
              groupName: 'Reset & Maintenance',
              isCollapsed: true,
              groupFields: this.getResetFields(),
            },
          ]
        }
      ]
    };
  }
}
