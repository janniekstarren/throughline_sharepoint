import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneField,
  PropertyPaneFieldType,
  IPropertyPaneCustomFieldProps,
} from '@microsoft/sp-property-pane';
import { CardOrderEditor, ICardOrderEditorProps } from './CardOrderEditor';
import { ICategoryConfig } from './CardConfigDialog';

export interface IPropertyPaneCardOrderProps {
  label: string;
  cardOrder: string[];
  cardVisibility: Record<string, boolean>;
  categoryNames: Record<string, string>;
  categoryOrder: string[];
  categoryConfig: Record<string, ICategoryConfig>;
  cardCategoryAssignment: Record<string, string>;
  onOrderChanged: (newOrder: string[]) => void;
  onVisibilityChanged: (cardId: string, visible: boolean) => void;
  onCategoryNameChanged: (categoryId: string, name: string) => void;
  onCategoryOrderChanged: (newOrder: string[]) => void;
  onCategoryConfigChanged: (categoryId: string, config: Partial<ICategoryConfig>) => void;
  onCardCategoryChanged: (cardId: string, categoryId: string) => void;
  onCategoryAdded: (categoryId: string, name: string) => void;
  onCategoryDeleted: (categoryId: string) => void;
}

interface IPropertyPaneCardOrderInternalProps extends IPropertyPaneCardOrderProps, IPropertyPaneCustomFieldProps {
  key: string;
}

class PropertyPaneCardOrderBuilder implements IPropertyPaneField<IPropertyPaneCardOrderInternalProps> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneCardOrderInternalProps;
  private elem?: HTMLElement;
  private currentCardOrder: string[];
  private currentCardVisibility: Record<string, boolean>;
  private currentCategoryNames: Record<string, string>;
  private currentCategoryOrder: string[];
  private currentCategoryConfig: Record<string, ICategoryConfig>;
  private currentCardCategoryAssignment: Record<string, string>;

  constructor(targetProperty: string, properties: IPropertyPaneCardOrderProps) {
    this.targetProperty = targetProperty;
    this.currentCardOrder = [...properties.cardOrder];
    this.currentCardVisibility = { ...properties.cardVisibility };
    this.currentCategoryNames = { ...(properties.categoryNames || {}) };
    this.currentCategoryOrder = [...(properties.categoryOrder || [])];
    this.currentCategoryConfig = { ...(properties.categoryConfig || {}) };
    this.currentCardCategoryAssignment = { ...(properties.cardCategoryAssignment || {}) };
    this.properties = {
      key: `cardOrder_${Date.now()}`,
      ...properties,
      onRender: this.onRender.bind(this),
      onDispose: this.onDispose.bind(this),
    };
  }

  private onRender(elem: HTMLElement, ctx?: unknown, changeCallback?: (targetProperty?: string, newValue?: string[]) => void): void {
    if (!this.elem) {
      this.elem = elem;
    }

    this.renderComponent(elem, changeCallback);
  }

  private renderComponent(
    elem: HTMLElement,
    changeCallback?: (targetProperty?: string, newValue?: string[]) => void
  ): void {
    const handleOrderChanged = (newOrder: string[]): void => {
      this.currentCardOrder = [...newOrder];
      if (changeCallback) {
        changeCallback(this.targetProperty, newOrder);
      }
      this.properties.onOrderChanged(newOrder);
      this.renderComponent(elem, changeCallback);
    };

    const handleVisibilityChanged = (cardId: string, visible: boolean): void => {
      this.currentCardVisibility = {
        ...this.currentCardVisibility,
        [cardId]: visible,
      };
      this.properties.onVisibilityChanged(cardId, visible);
      this.renderComponent(elem, changeCallback);
    };

    const handleCategoryNameChanged = (categoryId: string, name: string): void => {
      this.currentCategoryNames = {
        ...this.currentCategoryNames,
        [categoryId]: name,
      };
      this.properties.onCategoryNameChanged(categoryId, name);
      this.renderComponent(elem, changeCallback);
    };

    const handleCategoryOrderChanged = (newOrder: string[]): void => {
      this.currentCategoryOrder = [...newOrder];
      this.properties.onCategoryOrderChanged(newOrder);
      this.renderComponent(elem, changeCallback);
    };

    const handleCategoryConfigChanged = (categoryId: string, config: Partial<ICategoryConfig>): void => {
      this.currentCategoryConfig = {
        ...this.currentCategoryConfig,
        [categoryId]: {
          ...this.currentCategoryConfig[categoryId],
          ...config,
        },
      };
      this.properties.onCategoryConfigChanged(categoryId, config);
      this.renderComponent(elem, changeCallback);
    };

    const handleCardCategoryChanged = (cardId: string, categoryId: string): void => {
      this.currentCardCategoryAssignment = {
        ...this.currentCardCategoryAssignment,
        [cardId]: categoryId,
      };
      this.properties.onCardCategoryChanged(cardId, categoryId);
      this.renderComponent(elem, changeCallback);
    };

    const handleCategoryAdded = (categoryId: string, name: string): void => {
      this.currentCategoryOrder = [...this.currentCategoryOrder, categoryId];
      this.currentCategoryNames = {
        ...this.currentCategoryNames,
        [categoryId]: name,
      };
      this.currentCategoryConfig = {
        ...this.currentCategoryConfig,
        [categoryId]: { id: categoryId, visible: true, showTitle: true },
      };
      this.properties.onCategoryAdded(categoryId, name);
      this.renderComponent(elem, changeCallback);
    };

    const handleCategoryDeleted = (categoryId: string): void => {
      this.currentCategoryOrder = this.currentCategoryOrder.filter(id => id !== categoryId);
      // Move cards in deleted category to 'available'
      Object.keys(this.currentCardCategoryAssignment).forEach(cardId => {
        if (this.currentCardCategoryAssignment[cardId] === categoryId) {
          this.currentCardCategoryAssignment[cardId] = 'available';
        }
      });
      this.properties.onCategoryDeleted(categoryId);
      this.renderComponent(elem, changeCallback);
    };

    const element: React.ReactElement<ICardOrderEditorProps> = React.createElement(
      CardOrderEditor,
      {
        label: this.properties.label,
        cardOrder: this.currentCardOrder,
        cardVisibility: this.currentCardVisibility,
        categoryNames: this.currentCategoryNames,
        categoryOrder: this.currentCategoryOrder,
        categoryConfig: this.currentCategoryConfig,
        cardCategoryAssignment: this.currentCardCategoryAssignment,
        onOrderChanged: handleOrderChanged,
        onVisibilityChanged: handleVisibilityChanged,
        onCategoryNameChanged: handleCategoryNameChanged,
        onCategoryOrderChanged: handleCategoryOrderChanged,
        onCategoryConfigChanged: handleCategoryConfigChanged,
        onCardCategoryChanged: handleCardCategoryChanged,
        onCategoryAdded: handleCategoryAdded,
        onCategoryDeleted: handleCategoryDeleted,
      }
    );

    ReactDom.render(element, elem);
  }

  private onDispose(elem: HTMLElement): void {
    if (elem) {
      ReactDom.unmountComponentAtNode(elem);
    }
  }
}

export function PropertyPaneCardOrder(
  targetProperty: string,
  properties: IPropertyPaneCardOrderProps
): IPropertyPaneField<IPropertyPaneCardOrderInternalProps> {
  return new PropertyPaneCardOrderBuilder(targetProperty, properties);
}
