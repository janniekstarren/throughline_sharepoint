import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  IPropertyPaneGroup,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { FluentProvider } from '@fluentui/react-components';
import * as strings from 'DashboardCardsWebPartStrings';
import DashboardCards from './components/DashboardCards';
import { IDashboardCardsProps, ICardVisibility } from './components/DashboardCards';
import { SalutationType, SalutationSize } from './components/Salutation';
import { PropertyPaneCardOrder } from './propertyPane/PropertyPaneCardOrder';
import { PropertyPaneConfigureButton } from './propertyPane/PropertyPaneConfigureButton';
import { CardConfigDialog, ICardConfig, ICategoryConfig, DEFAULT_CATEGORY_ORDER } from './propertyPane/CardConfigDialog';
import { DEFAULT_CARD_ORDER } from './propertyPane/CardOrderEditor';
import { getFluentTheme } from './utils/themeUtils';

// Card definitions for default category assignment
const CARD_DEFAULT_CATEGORIES: Record<string, string> = {
  todaysAgenda: 'calendar',
  unreadInbox: 'email',
  myTasks: 'tasks',
  recentFiles: 'files',
  upcomingWeek: 'calendar',
  flaggedEmails: 'email',
  myTeam: 'people',
  sharedWithMe: 'files',
  quickLinks: 'navigation',
  siteActivity: 'people',
  waitingOnYou: 'email',
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

export interface IDashboardCardsWebPartProps {
  salutationType: SalutationType;
  salutationSize: SalutationSize;
  // Theme mode
  themeMode: ThemeMode;
  // Card visibility toggles
  showTodaysAgenda: boolean;
  showUnreadInbox: boolean;
  showMyTasks: boolean;
  showRecentFiles: boolean;
  showUpcomingWeek: boolean;
  showFlaggedEmails: boolean;
  showMyTeam: boolean;
  showSharedWithMe: boolean;
  showQuickLinks: boolean;
  showSiteActivity: boolean;
  showWaitingOnYou: boolean;
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
}

export default class DashboardCardsWebPart extends BaseClientSideWebPart<IDashboardCardsWebPartProps> {
  private _dialogContainer: HTMLDivElement | null = null;
  private _isDialogOpen: boolean = false;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this._injectPropertyPaneStyles();
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
      showUnreadInbox: this.properties.showUnreadInbox !== false,
      showMyTasks: this.properties.showMyTasks !== false,
      showRecentFiles: this.properties.showRecentFiles !== false,
      showUpcomingWeek: this.properties.showUpcomingWeek !== false,
      showFlaggedEmails: this.properties.showFlaggedEmails !== false,
      showMyTeam: this.properties.showMyTeam !== false,
      showSharedWithMe: this.properties.showSharedWithMe !== false,
      showQuickLinks: this.properties.showQuickLinks !== false,
      showSiteActivity: this.properties.showSiteActivity !== false,
      showWaitingOnYou: this.properties.showWaitingOnYou !== false,
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

    // Get category configuration - use defaults if not set
    const categoryOrder = this.properties.categoryOrder && this.properties.categoryOrder.length > 0
      ? this.properties.categoryOrder
      : [...DEFAULT_CATEGORY_ORDER];
    const categoryNames = this.properties.categoryNames || {};
    const categoryConfig = this.properties.categoryConfig && Object.keys(this.properties.categoryConfig).length > 0
      ? this.properties.categoryConfig
      : this._getDefaultCategoryConfig();
    // Get card category assignment, ensuring new cards have default assignments
    let cardCategoryAssignment = this.properties.cardCategoryAssignment || {};
    // Add default category assignments for any missing cards
    const missingAssignments = DEFAULT_CARD_ORDER.filter(cardId => !cardCategoryAssignment[cardId]);
    if (missingAssignments.length > 0) {
      cardCategoryAssignment = { ...cardCategoryAssignment };
      missingAssignments.forEach(cardId => {
        cardCategoryAssignment[cardId] = CARD_DEFAULT_CATEGORIES[cardId] || 'available';
      });
    }
    const categoryIcons = this.properties.categoryIcons || {};

    const element: React.ReactElement<IDashboardCardsProps> = React.createElement(
      DashboardCards,
      {
        context: this.context,
        salutationType: this.properties.salutationType || 'timeBased',
        salutationSize: this.properties.salutationSize || 'h4',
        themeMode: this.properties.themeMode || 'light',
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
      }
    );

    ReactDom.render(element, this.domElement);
  }

  // Minimum width for large tablets/desktops (768px)
  private static readonly MIN_DESKTOP_WIDTH = 768;

  // Get default card category assignment
  private _getDefaultCardCategoryAssignment(): Record<string, string> {
    const assignment: Record<string, string> = {};
    DEFAULT_CARD_ORDER.forEach(cardId => {
      assignment[cardId] = CARD_DEFAULT_CATEGORIES[cardId] || 'available';
    });
    return assignment;
  }

  // Get default category config
  private _getDefaultCategoryConfig(): Record<string, ICategoryConfig> {
    const config: Record<string, ICategoryConfig> = {};
    [...DEFAULT_CATEGORY_ORDER, 'available'].forEach(catId => {
      config[catId] = { id: catId, visible: true, showTitle: true };
    });
    return config;
  }

  private _openCardConfigDialog(): void {
    console.log('Opening card config dialog...');

    // Check if screen is large enough
    if (window.innerWidth < DashboardCardsWebPart.MIN_DESKTOP_WIDTH) {
      console.log('Screen too small for dialog');
      return;
    }

    if (this._isDialogOpen) {
      console.log('Dialog already open, returning');
      return;
    }

    // Create dialog container if it doesn't exist
    if (!this._dialogContainer) {
      console.log('Creating dialog container...');
      this._dialogContainer = document.createElement('div');
      this._dialogContainer.id = 'card-config-dialog-container';
      // Set high z-index to appear above SharePoint UI
      this._dialogContainer.style.position = 'relative';
      this._dialogContainer.style.zIndex = '1000000';
      document.body.appendChild(this._dialogContainer);

      // Inject global styles for the dialog portal
      const styleId = 'card-config-dialog-styles';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
          .fui-DialogSurface {
            z-index: 1000001 !important;
            border-radius: 16px !important;
          }
          .fui-DialogBody {
            border-radius: 16px !important;
            overflow: hidden !important;
          }
          .fui-Dialog__backdrop {
            z-index: 1000000 !important;
          }
          [data-portal-node] {
            z-index: 1000000 !important;
          }
          .fui-PopoverSurface {
            border-radius: 12px !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    }

    this._isDialogOpen = true;
    console.log('Rendering dialog...');
    this._renderDialog();
    console.log('Dialog rendered');
  }

  private _closeCardConfigDialog(): void {
    this._isDialogOpen = false;
    this._renderDialog();
  }

  private _handleDialogSave(config: ICardConfig): void {
    // Map cardId to property name for visibility
    const propMap: Record<string, keyof IDashboardCardsWebPartProps> = {
      todaysAgenda: 'showTodaysAgenda',
      unreadInbox: 'showUnreadInbox',
      myTasks: 'showMyTasks',
      recentFiles: 'showRecentFiles',
      upcomingWeek: 'showUpcomingWeek',
      flaggedEmails: 'showFlaggedEmails',
      myTeam: 'showMyTeam',
      sharedWithMe: 'showSharedWithMe',
      quickLinks: 'showQuickLinks',
      siteActivity: 'showSiteActivity',
      waitingOnYou: 'showWaitingOnYou',
    };

    // Update card order
    this.properties.cardOrder = config.cardOrder;

    // Update card visibility
    Object.entries(config.cardVisibility).forEach(([cardId, visible]) => {
      const propName = propMap[cardId];
      if (propName) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.properties as any)[propName] = visible;
      }
    });

    // Update custom card titles
    this.properties.cardTitles = config.cardTitles;

    // Update custom category names
    this.properties.categoryNames = config.categoryNames;

    // Update category order
    this.properties.categoryOrder = config.categoryOrder;

    // Update category config
    this.properties.categoryConfig = config.categoryConfig;

    // Update card category assignment
    this.properties.cardCategoryAssignment = config.cardCategoryAssignment;

    // Update custom category icons
    this.properties.categoryIcons = config.categoryIcons || {};

    // Close dialog and re-render
    this._closeCardConfigDialog();
    this.render();

    // Refresh the property pane to show updated values
    this.context.propertyPane.refresh();
  }

  private _renderDialog(): void {
    if (!this._dialogContainer) return;

    // Build current visibility map
    const cardVisibility: Record<string, boolean> = {
      todaysAgenda: this.properties.showTodaysAgenda !== false,
      unreadInbox: this.properties.showUnreadInbox !== false,
      myTasks: this.properties.showMyTasks !== false,
      recentFiles: this.properties.showRecentFiles !== false,
      upcomingWeek: this.properties.showUpcomingWeek !== false,
      flaggedEmails: this.properties.showFlaggedEmails !== false,
      myTeam: this.properties.showMyTeam !== false,
      sharedWithMe: this.properties.showSharedWithMe !== false,
      quickLinks: this.properties.showQuickLinks !== false,
      siteActivity: this.properties.showSiteActivity !== false,
      waitingOnYou: this.properties.showWaitingOnYou !== false,
    };

    // Get card order and ensure new cards are included
    let cardOrder = this.properties.cardOrder && this.properties.cardOrder.length > 0
      ? this.properties.cardOrder
      : DEFAULT_CARD_ORDER;
    // Ensure any new cards from DEFAULT_CARD_ORDER are added to the end
    const missingCards = DEFAULT_CARD_ORDER.filter(cardId => !cardOrder.includes(cardId));
    if (missingCards.length > 0) {
      cardOrder = [...cardOrder, ...missingCards];
    }

    const cardTitles = this.properties.cardTitles || {};
    const categoryNames = this.properties.categoryNames || {};
    const categoryOrder = this.properties.categoryOrder && this.properties.categoryOrder.length > 0
      ? this.properties.categoryOrder
      : [...DEFAULT_CATEGORY_ORDER];
    const categoryConfig = this.properties.categoryConfig || this._getDefaultCategoryConfig();
    // Get card category assignment, ensuring new cards have default assignments
    let cardCategoryAssignment = this.properties.cardCategoryAssignment || this._getDefaultCardCategoryAssignment();
    const missingAssignments = DEFAULT_CARD_ORDER.filter(cardId => !cardCategoryAssignment[cardId]);
    if (missingAssignments.length > 0) {
      cardCategoryAssignment = { ...cardCategoryAssignment };
      missingAssignments.forEach(cardId => {
        cardCategoryAssignment[cardId] = CARD_DEFAULT_CATEGORIES[cardId] || 'available';
      });
    }

    // Get Fluent theme from SharePoint context
    const theme = getFluentTheme(this.context);

    // Get Waiting On You settings with defaults
    const waitingOnYouSettings: IWaitingOnYouSettings = this.properties.waitingOnYouSettings || {
      staleDays: 2,
      includeEmail: true,
      includeTeamsChats: true,
      includeChannels: false,
      includeMentions: true,
      showChart: true,
    };

    // Create the dialog with proper FluentProvider wrapping
    const cardConfigDialog = React.createElement(CardConfigDialog, {
      open: this._isDialogOpen,
      onClose: () => this._closeCardConfigDialog(),
      cardOrder,
      cardVisibility,
      cardTitles,
      categoryNames,
      categoryOrder,
      categoryConfig,
      cardCategoryAssignment,
      categoryIcons: this.properties.categoryIcons || {},
      onSave: (config: ICardConfig) => this._handleDialogSave(config),
      waitingOnYouSettings,
      onWaitingOnYouSettingsChanged: (settings: IWaitingOnYouSettings) => {
        this.properties.waitingOnYouSettings = settings;
        this.render();
      },
    });

    const dialogElement = React.createElement(
      FluentProvider,
      { theme },
      cardConfigDialog
    );

    ReactDom.render(dialogElement, this._dialogContainer);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
    // Clean up dialog container
    if (this._dialogContainer) {
      ReactDom.unmountComponentAtNode(this._dialogContainer);
      document.body.removeChild(this._dialogContainer);
      this._dialogContainer = null;
    }
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
      unreadInbox: this.properties.showUnreadInbox !== false,
      myTasks: this.properties.showMyTasks !== false,
      recentFiles: this.properties.showRecentFiles !== false,
      upcomingWeek: this.properties.showUpcomingWeek !== false,
      flaggedEmails: this.properties.showFlaggedEmails !== false,
      myTeam: this.properties.showMyTeam !== false,
      sharedWithMe: this.properties.showSharedWithMe !== false,
      quickLinks: this.properties.showQuickLinks !== false,
      siteActivity: this.properties.showSiteActivity !== false,
      waitingOnYou: this.properties.showWaitingOnYou !== false,
    };

    // Map cardId to property name
    const propMap: Record<string, keyof IDashboardCardsWebPartProps> = {
      todaysAgenda: 'showTodaysAgenda',
      unreadInbox: 'showUnreadInbox',
      myTasks: 'showMyTasks',
      recentFiles: 'showRecentFiles',
      upcomingWeek: 'showUpcomingWeek',
      flaggedEmails: 'showFlaggedEmails',
      myTeam: 'showMyTeam',
      sharedWithMe: 'showSharedWithMe',
      quickLinks: 'showQuickLinks',
      siteActivity: 'showSiteActivity',
      waitingOnYou: 'showWaitingOnYou',
    };

    const categoryNames = this.properties.categoryNames || {};
    const categoryOrder = this.properties.categoryOrder && this.properties.categoryOrder.length > 0
      ? this.properties.categoryOrder
      : [...DEFAULT_CATEGORY_ORDER];
    const categoryConfig = this.properties.categoryConfig || this._getDefaultCategoryConfig();

    // Get card order and ensure new cards are included
    let cardOrder = this.properties.cardOrder && this.properties.cardOrder.length > 0
      ? this.properties.cardOrder
      : DEFAULT_CARD_ORDER;
    const missingCards = DEFAULT_CARD_ORDER.filter(cardId => !cardOrder.includes(cardId));
    if (missingCards.length > 0) {
      cardOrder = [...cardOrder, ...missingCards];
    }

    // Get card category assignment, ensuring new cards have default assignments
    let cardCategoryAssignment = this.properties.cardCategoryAssignment || this._getDefaultCardCategoryAssignment();
    const missingAssignments = DEFAULT_CARD_ORDER.filter(cardId => !cardCategoryAssignment[cardId]);
    if (missingAssignments.length > 0) {
      cardCategoryAssignment = { ...cardCategoryAssignment };
      missingAssignments.forEach(cardId => {
        cardCategoryAssignment[cardId] = CARD_DEFAULT_CATEGORIES[cardId] || 'available';
      });
    }

    return [
      PropertyPaneConfigureButton('configureCards', {
        text: strings.ConfigureCardsButton,
        onClick: () => this._openCardConfigDialog(),
      }),
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
            this.properties.categoryConfig = this._getDefaultCategoryConfig();
          }
          this.properties.categoryConfig[categoryId] = {
            ...this.properties.categoryConfig[categoryId],
            ...config,
          };
        },
        onCardCategoryChanged: (cardId: string, categoryId: string) => {
          if (!this.properties.cardCategoryAssignment) {
            this.properties.cardCategoryAssignment = this._getDefaultCardCategoryAssignment();
          }
          this.properties.cardCategoryAssignment[cardId] = categoryId;
          this.render();
        },
        onCategoryAdded: (categoryId: string, name: string) => {
          if (!this.properties.categoryOrder) {
            this.properties.categoryOrder = [...DEFAULT_CATEGORY_ORDER];
          }
          this.properties.categoryOrder.push(categoryId);

          if (!this.properties.categoryNames) {
            this.properties.categoryNames = {};
          }
          this.properties.categoryNames[categoryId] = name;

          if (!this.properties.categoryConfig) {
            this.properties.categoryConfig = this._getDefaultCategoryConfig();
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
        label: 'Theme Mode',
        options: [
          { key: 'auto', text: 'Auto (follow system)' },
          { key: 'light', text: 'Light' },
          { key: 'dark', text: 'Dark' },
        ],
        selectedKey: this.properties.themeMode || 'light',
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
          ]
        }
      ]
    };
  }
}
