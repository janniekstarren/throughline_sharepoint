import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneField,
  PropertyPaneFieldType,
  IPropertyPaneCustomFieldProps,
} from '@microsoft/sp-property-pane';
import { Button, makeStyles, tokens, FluentProvider, webLightTheme } from '@fluentui/react-components';
import { Settings24Regular } from '@fluentui/react-icons';

export interface IPropertyPaneConfigureButtonProps {
  text: string;
  onClick: () => void;
}

interface IPropertyPaneConfigureButtonInternalProps extends IPropertyPaneConfigureButtonProps, IPropertyPaneCustomFieldProps {
  key: string;
}

// Minimum width for large tablets/desktops (768px)
const MIN_DESKTOP_WIDTH = 768;

const useStyles = makeStyles({
  container: {
    padding: `${tokens.spacingVerticalS} 0`,
  },
  button: {
    width: '100%',
  },
  hidden: {
    display: 'none',
  },
  mobileMessage: {
    padding: tokens.spacingVerticalS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

const ConfigureButton: React.FC<IPropertyPaneConfigureButtonProps> = ({ text, onClick }) => {
  const styles = useStyles();
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= MIN_DESKTOP_WIDTH);

  React.useEffect(() => {
    const handleResize = (): void => {
      setIsDesktop(window.innerWidth >= MIN_DESKTOP_WIDTH);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container}>
        {isDesktop ? (
          <Button
            appearance="primary"
            icon={<Settings24Regular />}
            className={styles.button}
            onClick={onClick}
          >
            {text}
          </Button>
        ) : (
          <div className={styles.mobileMessage}>
            Card configuration is available on larger screens
          </div>
        )}
      </div>
    </FluentProvider>
  );
};

class PropertyPaneConfigureButtonBuilder implements IPropertyPaneField<IPropertyPaneConfigureButtonInternalProps> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneConfigureButtonInternalProps;
  private elem?: HTMLElement;

  constructor(targetProperty: string, properties: IPropertyPaneConfigureButtonProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      key: `configureButton_${Date.now()}`,
      ...properties,
      onRender: this.onRender.bind(this),
      onDispose: this.onDispose.bind(this),
    };
  }

  private onRender(elem: HTMLElement): void {
    if (!this.elem) {
      this.elem = elem;
    }

    const element: React.ReactElement<IPropertyPaneConfigureButtonProps> = React.createElement(
      ConfigureButton,
      {
        text: this.properties.text,
        onClick: this.properties.onClick,
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

export function PropertyPaneConfigureButton(
  targetProperty: string,
  properties: IPropertyPaneConfigureButtonProps
): IPropertyPaneField<IPropertyPaneConfigureButtonInternalProps> {
  return new PropertyPaneConfigureButtonBuilder(targetProperty, properties);
}
