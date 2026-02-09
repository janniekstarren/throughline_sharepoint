import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  PropertyPaneSlider,
  PropertyPaneTextField,
  IPropertyPaneGroup,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'DashboardCardsWebPartStrings';
import DashboardCards from './components/DashboardCards';
import { IDashboardCardsProps, ICardVisibility } from './components/DashboardCards';
import { SalutationType, SalutationSize } from './components/Salutation';
import { PropertyPaneCardOrder } from './propertyPane/PropertyPaneCardOrder';
import { PropertyPaneResetButtons } from './propertyPane/PropertyPaneResetButtons';
import { ICategoryConfig } from './propertyPane/CardConfigDialog';
import { DEFAULT_CARD_ORDER } from './propertyPane/CardOrderEditor';
import { clearUserPreferences } from './services/UserPreferencesService';
import { cleanupPortalContainer } from './services/PortalService';

// Card definitions for default category assignment
const CARD_DEFAULT_CATEGORIES: Record<string, string> = {
  todaysAgenda: 'calendar',
  email: 'email',
  myTasks: 'tasks',
  recentFiles: 'files',
  upcomingWeek: 'calendar',
  myTeam: 'people',
  sharedWithMe: 'files',
  quickLinks: 'navigation',
  siteActivity: 'people',
  waitingOnYou: 'email',
  waitingOnOthers: 'email',
  contextSwitching: 'tasks', // productivity/focus fits with tasks
};

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
  salutationSize: SalutationSize;
  // Theme mode
  themeMode: ThemeMode;
  // Data mode: 'api' for live Graph data, 'test' for mock data
  dataMode: DataMode;
  // AI Demo Mode: show AI-enhanced content (only applicable when dataMode === 'test')
  aiDemoMode: boolean;
  // Card visibility toggles
  showTodaysAgenda: boolean;
  showEmail: boolean;
  showMyTasks: boolean;
  showRecentFiles: boolean;
  showUpcomingWeek: boolean;
  showMyTeam: boolean;
  showSharedWithMe: boolean;
  showQuickLinks: boolean;
  showSiteActivity: boolean;
  showWaitingOnYou: boolean;
  showWaitingOnOthers: boolean;
  showContextSwitching: boolean;
  // Card order
  cardOrder: string[];
  // Custom card titles
  cardTitles: Record<string, string>;
  // Custom category names
  categoryNames: Record<string, string>;
  // Category order
  categoryOrder: string[];
  // Category configuration (visibility, showTitle)
  categoryConfig: Record<string, ICategoryConfig>;
  // Card to category assignment
  cardCategoryAssignment: Record<string, string>;
  // Custom category icons
  categoryIcons: Record<string, string>;
  // Waiting On You card settings
  waitingOnYouSettings: IWaitingOnYouSettings;
  // Waiting On Others card settings
  waitingOnOthersSettings: IWaitingOnOthersSettings;
  // Context Switching card settings
  contextSwitchingSettings: IContextSwitchingSettings;
  // Collapsed card IDs (large cards shown as medium)
  collapsedCardIds: string[];
  // Demo mode: show tier switcher FAB for license tier demos
  isDemoMode: boolean;

  // === ADMIN: DEFAULT LAYOUT ===
  defaultView: string;              // 'categories' | 'needs-attention' | 'high-impact' | 'compact'
  defaultCardSize: string;          // 'small' | 'medium' | 'large'
  columnsOverride: number;          // 0 = auto
  showLockedCards: boolean;
  showPlaceholderCards: boolean;
  showCategoryDescriptions: boolean;
  dashboardTitle: string;
  showDashboardTitle: boolean;

  // === ADMIN: USER CUSTOMISATION FEATURE FLAGS ===
  allowUserCustomisation: boolean;
  allowCardHiding: boolean;
  allowCardPinning: boolean;
  allowCardRenaming: boolean;
  allowCategoryReorder: boolean;
  allowCategoryHiding: boolean;
  allowCategoryRenaming: boolean;
  allowViewSwitching: boolean;
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
    // Build card visibility object (default all to true if not set)
    const cardVisibility: ICardVisibility = {
      showTodaysAgenda: this.properties.showTodaysAgenda !== false,
      showEmail: this.properties.showEmail !== false,
      showMyTasks: this.properties.showMyTasks !== false,
      showRecentFiles: this.properties.showRecentFiles !== false,
      showUpcomingWeek: this.properties.showUpcomingWeek !== false,
      showMyTeam: this.properties.showMyTeam !== false,
      showSharedWithMe: this.properties.showSharedWithMe !== false,
      showQuickLinks: this.properties.showQuickLinks !== false,
      showSiteActivity: this.properties.showSiteActivity !== false,
      showWaitingOnYou: this.properties.showWaitingOnYou !== false,
      showWaitingOnOthers: this.properties.showWaitingOnOthers !== false,
      showContextSwitching: this.properties.showContextSwitching !== false,
    };

    // Get card order (default if not set, and ensure new cards are included)
    let cardOrder = this.properties.cardOrder && this.properties.cardOrder.length > 0
      ? this.properties.cardOrder
      : DEFAULT_CARD_ORDER;

    // Ensure any new cards from DEFAULT_CARD_ORDER are added to the end
    const missingCards = DEFAULT_CARD_ORDER.filter(cardId => !cardOrder.includes(cardId));
    if (missingCards.length > 0) {
      cardOrder = [...cardOrder, ...missingCards];
    }

    // Get custom card titles (default to empty object if not set)
    const cardTitles = this.properties.cardTitles || {};

    // Get category configuration
    // IMPORTANT: Only pass non-empty admin category config when EXPLICITLY set by admin.
    // Empty defaults trigger the new 80-card registry-based category layout.
    // The legacy admin-configured layout only activates when admin has customised categories.
    const hasAdminCategoryConfig = this.properties.categoryOrder && this.properties.categoryOrder.length > 0;
    const categoryOrder = hasAdminCategoryConfig
      ? this.properties.categoryOrder
      : [];
    const categoryNames = this.properties.categoryNames || {};
    const categoryConfig = hasAdminCategoryConfig && this.properties.categoryConfig && Object.keys(this.properties.categoryConfig).length > 0
      ? this.properties.categoryConfig
      : {};
    // Only fill card category assignment when admin has configured categories
    let cardCategoryAssignment = hasAdminCategoryConfig
      ? (this.properties.cardCategoryAssignment || {})
      : {};
    if (hasAdminCategoryConfig) {
      // Add default category assignments for any missing cards
      const missingAssignments = DEFAULT_CARD_ORDER.filter(cardId => !cardCategoryAssignment[cardId]);
      if (missingAssignments.length > 0) {
        cardCategoryAssignment = { ...cardCategoryAssignment };
        missingAssignments.forEach(cardId => {
          cardCategoryAssignment[cardId] = CARD_DEFAULT_CATEGORIES[cardId] || 'available';
        });
      }
    }
    const categoryIcons = this.properties.categoryIcons || {};

    const element: React.ReactElement<IDashboardCardsProps> = React.createElement(
      DashboardCards,
      {
        context: this.context,
        salutationType: this.properties.salutationType || 'timeBased',
        salutationSize: this.properties.salutationSize || 'h4',
        themeMode: this.properties.themeMode || 'light',
        dataMode: this.properties.dataMode || 'api',
        aiDemoMode: this.properties.aiDemoMode || false,
        cardVisibility,
        cardOrder,
        cardTitles,
        categoryOrder,
        categoryNames,
        categoryConfig,
        cardCategoryAssignment,
        categoryIcons,
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
        // Collapsed card IDs (large cards shown as medium)
        collapsedCardIds: this.properties.collapsedCardIds || [],
        onCollapsedCardsChange: (cardIds: string[]) => {
          this.properties.collapsedCardIds = cardIds;
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
          showCategoryDescriptions: this.properties.showCategoryDescriptions !== false,
        },
        // Admin layout defaults
        defaultView: this.properties.defaultView || 'categories',
        showLockedCards: this.properties.showLockedCards !== false,
        showPlaceholderCards: this.properties.showPlaceholderCards !== false,
        showCategoryDescriptions: this.properties.showCategoryDescriptions !== false,
        // Card order change callback for drag-and-drop in dashboard
        onCardOrderChange: (newOrder: string[]) => {
          this.properties.cardOrder = newOrder;
          this.render();
          // Refresh property pane if open to show updated order
          if (this.context.propertyPane.isPropertyPaneOpen()) {
            this.context.propertyPane.refresh();
          }
        },
      }
    );

    ReactDom.render(element, this.domElement);
  }

  // Legacy CardConfigDialog and default category methods removed — now using registry-based layout


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
   * Only shows size option when greeting type is not 'none'
   */
  private getGreetingFields(): IPropertyPaneGroup['groupFields'] {
    const fields: IPropertyPaneGroup['groupFields'] = [
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

    // Only show size option if greeting is enabled
    if (this.properties.salutationType !== 'none') {
      fields.push(
        PropertyPaneDropdown('salutationSize', {
          label: strings.SalutationSizeLabel,
          options: [
            { key: 'h1', text: strings.SalutationSizeH1 },
            { key: 'h2', text: strings.SalutationSizeH2 },
            { key: 'h3', text: strings.SalutationSizeH3 },
            { key: 'h4', text: strings.SalutationSizeH4 },
            { key: 'h5', text: strings.SalutationSizeH5 },
          ],
          selectedKey: this.properties.salutationSize || 'h4',
        })
      );
    }

    return fields;
  }

  /**
   * Build the card configuration fields (visibility + order combined)
   */
  private getCardConfigFields(): IPropertyPaneGroup['groupFields'] {
    // Build visibility map
    const cardVisibility: Record<string, boolean> = {
      todaysAgenda: this.properties.showTodaysAgenda !== false,
      email: this.properties.showEmail !== false,
      myTasks: this.properties.showMyTasks !== false,
      recentFiles: this.properties.showRecentFiles !== false,
      upcomingWeek: this.properties.showUpcomingWeek !== false,
      myTeam: this.properties.showMyTeam !== false,
      sharedWithMe: this.properties.showSharedWithMe !== false,
      quickLinks: this.properties.showQuickLinks !== false,
      siteActivity: this.properties.showSiteActivity !== false,
      waitingOnYou: this.properties.showWaitingOnYou !== false,
      waitingOnOthers: this.properties.showWaitingOnOthers !== false,
    };

    // Map cardId to property name
    const propMap: Record<string, keyof IDashboardCardsWebPartProps> = {
      todaysAgenda: 'showTodaysAgenda',
      email: 'showEmail',
      myTasks: 'showMyTasks',
      recentFiles: 'showRecentFiles',
      upcomingWeek: 'showUpcomingWeek',
      myTeam: 'showMyTeam',
      sharedWithMe: 'showSharedWithMe',
      quickLinks: 'showQuickLinks',
      siteActivity: 'showSiteActivity',
      waitingOnYou: 'showWaitingOnYou',
      waitingOnOthers: 'showWaitingOnOthers',
      contextSwitching: 'showContextSwitching',
    };

    const categoryNames = this.properties.categoryNames || {};
    // Only use admin-configured categories — empty triggers registry-based layout
    const hasAdminCategories = this.properties.categoryOrder && this.properties.categoryOrder.length > 0;
    const categoryOrder = hasAdminCategories ? this.properties.categoryOrder : [];
    const categoryConfig = hasAdminCategories ? (this.properties.categoryConfig || {}) : {};

    // Get card order and ensure new cards are included
    let cardOrder = this.properties.cardOrder && this.properties.cardOrder.length > 0
      ? this.properties.cardOrder
      : DEFAULT_CARD_ORDER;
    const missingCards = DEFAULT_CARD_ORDER.filter(cardId => !cardOrder.includes(cardId));
    if (missingCards.length > 0) {
      cardOrder = [...cardOrder, ...missingCards];
    }

    // Only use admin-configured card-to-category assignment
    const cardCategoryAssignment = hasAdminCategories
      ? (this.properties.cardCategoryAssignment || {})
      : {};

    return [
      PropertyPaneCardOrder('cardOrder', {
        label: strings.CardOrderLabel,
        cardOrder,
        cardVisibility,
        categoryNames,
        categoryOrder,
        categoryConfig,
        cardCategoryAssignment,
        onOrderChanged: (newOrder: string[]) => {
          this.properties.cardOrder = newOrder;
          this.render();
        },
        onVisibilityChanged: (cardId: string, visible: boolean) => {
          const propName = propMap[cardId];
          if (propName) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.properties as any)[propName] = visible;
            // Trigger re-render of the webpart to reflect visibility change
            this.render();
          }
        },
        onCategoryNameChanged: (categoryId: string, name: string) => {
          if (!this.properties.categoryNames) {
            this.properties.categoryNames = {};
          }
          this.properties.categoryNames[categoryId] = name;
        },
        onCategoryOrderChanged: (newOrder: string[]) => {
          this.properties.categoryOrder = newOrder;
        },
        onCategoryConfigChanged: (categoryId: string, config: Partial<ICategoryConfig>) => {
          if (!this.properties.categoryConfig) {
            this.properties.categoryConfig = {};
          }
          this.properties.categoryConfig[categoryId] = {
            ...this.properties.categoryConfig[categoryId],
            ...config,
          };
        },
        onCardCategoryChanged: (cardId: string, categoryId: string) => {
          if (!this.properties.cardCategoryAssignment) {
            this.properties.cardCategoryAssignment = {};
          }
          this.properties.cardCategoryAssignment[cardId] = categoryId;
          this.render();
        },
        onCategoryAdded: (categoryId: string, name: string) => {
          if (!this.properties.categoryOrder) {
            this.properties.categoryOrder = [];
          }
          this.properties.categoryOrder.push(categoryId);

          if (!this.properties.categoryNames) {
            this.properties.categoryNames = {};
          }
          this.properties.categoryNames[categoryId] = name;

          if (!this.properties.categoryConfig) {
            this.properties.categoryConfig = {};
          }
          this.properties.categoryConfig[categoryId] = { id: categoryId, visible: true, showTitle: true };

          // Note: CATEGORIES is already updated in the dialog/editor component
        },
        onCategoryDeleted: (categoryId: string) => {
          if (this.properties.categoryOrder) {
            this.properties.categoryOrder = this.properties.categoryOrder.filter(id => id !== categoryId);
          }

          // Move cards to 'available'
          if (this.properties.cardCategoryAssignment) {
            Object.keys(this.properties.cardCategoryAssignment).forEach(cardId => {
              if (this.properties.cardCategoryAssignment[cardId] === categoryId) {
                this.properties.cardCategoryAssignment[cardId] = 'available';
              }
            });
          }

          this.render();
        },
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
    // Reset card visibility - all cards visible
    this.properties.showTodaysAgenda = true;
    this.properties.showEmail = true;
    this.properties.showMyTasks = true;
    this.properties.showRecentFiles = true;
    this.properties.showUpcomingWeek = true;
    this.properties.showMyTeam = true;
    this.properties.showSharedWithMe = true;
    this.properties.showQuickLinks = true;
    this.properties.showSiteActivity = true;
    this.properties.showWaitingOnYou = true;
    this.properties.showWaitingOnOthers = true;
    this.properties.showContextSwitching = true;

    // Reset card order to default
    this.properties.cardOrder = [...DEFAULT_CARD_ORDER];

    // Reset custom card titles
    this.properties.cardTitles = {};

    // Reset category configuration — clear to empty so registry-based layout activates
    this.properties.categoryOrder = [];
    this.properties.categoryNames = {};
    this.properties.categoryConfig = {};
    this.properties.cardCategoryAssignment = {};
    this.properties.categoryIcons = {};

    // Reset collapsed cards
    this.properties.collapsedCardIds = [];

    // Reset greeting settings
    this.properties.salutationType = 'timeBased' as SalutationType;
    this.properties.salutationSize = 'h4' as SalutationSize;

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
            {
              groupName: 'Appearance',
              isCollapsed: true,
              groupFields: this.getAppearanceFields(),
            },
            {
              groupName: strings.GreetingGroupName,
              isCollapsed: true,
              groupFields: this.getGreetingFields(),
            },
            {
              groupName: strings.CardsGroupName,
              isCollapsed: true,
              groupFields: this.getCardConfigFields(),
            },
            {
              groupName: 'Dashboard Display',
              isCollapsed: true,
              groupFields: [
                PropertyPaneTextField('dashboardTitle', {
                  label: 'Dashboard title',
                  value: this.properties.dashboardTitle || 'Throughline',
                }),
                PropertyPaneToggle('showDashboardTitle', {
                  label: 'Show dashboard title',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showDashboardTitle !== false,
                }),
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
                PropertyPaneDropdown('defaultCardSize', {
                  label: 'Default card size',
                  options: [
                    { key: 'small', text: 'Small (grid)' },
                    { key: 'medium', text: 'Medium' },
                    { key: 'large', text: 'Large' },
                  ],
                  selectedKey: this.properties.defaultCardSize || 'small',
                }),
                PropertyPaneSlider('columnsOverride', {
                  label: 'Grid columns (0 = auto)',
                  min: 0,
                  max: 6,
                  value: this.properties.columnsOverride || 0,
                }),
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
                PropertyPaneToggle('showCategoryDescriptions', {
                  label: 'Show category descriptions',
                  onText: 'On',
                  offText: 'Off',
                  checked: this.properties.showCategoryDescriptions !== false,
                }),
              ],
            },
            {
              groupName: 'User Customisation Permissions',
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
