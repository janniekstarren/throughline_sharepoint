/**
 * PropertyPaneResetButtons - Custom property pane control for reset actions
 *
 * Provides two buttons with warning dialogs:
 * 1. Clear Local Storage - Clears user's personal preferences (card order, collapsed state)
 * 2. Reset to Default - Resets webpart properties to factory defaults
 */

import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  type IPropertyPaneField,
  type IPropertyPaneCustomFieldProps,
  PropertyPaneFieldType,
} from '@microsoft/sp-property-pane';
import {
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  DialogTrigger,
  FluentProvider,
  webLightTheme,
  tokens,
  makeStyles,
} from '@fluentui/react-components';
import {
  Warning24Regular,
  Delete24Regular,
  ArrowReset24Regular,
} from '@fluentui/react-icons';

// Styles for the reset buttons component
const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '8px 0',
  },
  buttonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  button: {
    justifyContent: 'flex-start',
    width: '100%',
  },
  description: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    marginLeft: '32px',
    lineHeight: '1.4',
  },
  warningIcon: {
    color: tokens.colorPaletteYellowForeground1,
    marginRight: '8px',
  },
  warningText: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '12px',
    backgroundColor: tokens.colorPaletteYellowBackground1,
    borderRadius: '8px',
    marginBottom: '16px',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontWeight: 600,
    marginBottom: '4px',
  },
  warningDescription: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  dialogSurface: {
    maxWidth: '480px',
  },
});

export interface IPropertyPaneResetButtonsProps {
  onClearLocalStorage: () => void;
  onResetToDefault: () => void;
  userName?: string;
}

interface IPropertyPaneResetButtonsInternalProps extends IPropertyPaneCustomFieldProps, IPropertyPaneResetButtonsProps {
  key: string;
}

// React component for the reset buttons
const ResetButtonsComponent: React.FC<IPropertyPaneResetButtonsProps> = ({
  onClearLocalStorage,
  onResetToDefault,
  userName,
}) => {
  const styles = useStyles();
  const [clearStorageDialogOpen, setClearStorageDialogOpen] = React.useState(false);
  const [resetDefaultDialogOpen, setResetDefaultDialogOpen] = React.useState(false);

  const handleClearLocalStorage = React.useCallback((): void => {
    onClearLocalStorage();
    setClearStorageDialogOpen(false);
  }, [onClearLocalStorage]);

  const handleResetToDefault = React.useCallback((): void => {
    onResetToDefault();
    setResetDefaultDialogOpen(false);
  }, [onResetToDefault]);

  // Stop event propagation to prevent property pane from closing
  const handleButtonClick = React.useCallback((
    e: React.MouseEvent,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
  ): void => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }, []);

  return (
    <div className={styles.container} onClick={(e) => e.stopPropagation()}>
      {/* Clear Local Storage Button */}
      <div className={styles.buttonWrapper}>
        <Button
          className={styles.button}
          appearance="subtle"
          icon={<Delete24Regular />}
          onClick={(e) => handleButtonClick(e, setClearStorageDialogOpen)}
        >
          Clear My Preferences
        </Button>
        <span className={styles.description}>
          Removes your personal card order and layout preferences from this browser.
        </span>
      </div>

      {/* Reset to Default Button */}
      <div className={styles.buttonWrapper}>
        <Button
          className={styles.button}
          appearance="subtle"
          icon={<ArrowReset24Regular />}
          onClick={(e) => handleButtonClick(e, setResetDefaultDialogOpen)}
        >
          Reset Dashboard to Default
        </Button>
        <span className={styles.description}>
          Resets all dashboard settings for everyone viewing this page.
        </span>
      </div>

      {/* Clear Local Storage Confirmation Dialog */}
      <Dialog
        open={clearStorageDialogOpen}
        onOpenChange={(_, data) => setClearStorageDialogOpen(data.open)}
        modalType="alert"
      >
        <DialogSurface className={styles.dialogSurface}>
          <DialogBody>
            <DialogTitle>Clear My Preferences?</DialogTitle>
            <DialogContent>
              <div className={styles.warningText}>
                <Warning24Regular className={styles.warningIcon} />
                <div className={styles.warningContent}>
                  <div className={styles.warningTitle}>This action affects only you</div>
                  <div className={styles.warningDescription}>
                    Your personal preferences stored in this browser will be cleared.
                  </div>
                </div>
              </div>
              <p>This will remove:</p>
              <ul>
                <li>Your custom card order (from drag-and-drop)</li>
                <li>Your expanded/collapsed card preferences</li>
              </ul>
              <p>
                After clearing, the dashboard will use the default settings configured by
                the site administrator. This only affects <strong>this browser</strong> on{' '}
                <strong>this device</strong>.
              </p>
              {userName && (
                <p style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>
                  Clearing preferences for: {userName}
                </p>
              )}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleClearLocalStorage}>
                Clear My Preferences
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Reset to Default Confirmation Dialog */}
      <Dialog
        open={resetDefaultDialogOpen}
        onOpenChange={(_, data) => setResetDefaultDialogOpen(data.open)}
        modalType="alert"
      >
        <DialogSurface className={styles.dialogSurface}>
          <DialogBody>
            <DialogTitle>Reset Dashboard to Default?</DialogTitle>
            <DialogContent>
              <div className={styles.warningText}>
                <Warning24Regular className={styles.warningIcon} />
                <div className={styles.warningContent}>
                  <div className={styles.warningTitle}>This action affects all users</div>
                  <div className={styles.warningDescription}>
                    Dashboard settings will be reset for everyone who views this page.
                  </div>
                </div>
              </div>
              <p>This will reset:</p>
              <ul>
                <li>Card visibility settings (all cards will be shown)</li>
                <li>Card order (restored to default)</li>
                <li>Category configuration</li>
                <li>Custom card titles</li>
                <li>All card-specific settings</li>
              </ul>
              <p>
                <strong>Note:</strong> Individual users who have customized their personal
                preferences (via drag-and-drop) will keep their local settings. They can
                use &ldquo;Clear My Preferences&rdquo; to see the new defaults.
              </p>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleResetToDefault}>
                Reset to Default
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

// Property pane field class
class PropertyPaneResetButtonsBuilder implements IPropertyPaneField<IPropertyPaneResetButtonsInternalProps> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneResetButtonsInternalProps;
  private elem?: HTMLElement;

  constructor(targetProperty: string, properties: IPropertyPaneResetButtonsProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      ...properties,
      key: targetProperty,
      onRender: this.onRender.bind(this),
      onDispose: this.onDispose.bind(this),
    };
  }

  private render(): void {
    if (!this.elem) return;

    const element = React.createElement(
      FluentProvider,
      { theme: webLightTheme },
      React.createElement(ResetButtonsComponent, {
        onClearLocalStorage: this.properties.onClearLocalStorage,
        onResetToDefault: this.properties.onResetToDefault,
        userName: this.properties.userName,
      })
    );

    ReactDom.render(element, this.elem);
  }

  private onRender(elem: HTMLElement): void {
    this.elem = elem;
    this.render();
  }

  private onDispose(): void {
    if (this.elem) {
      ReactDom.unmountComponentAtNode(this.elem);
    }
  }
}

/**
 * Creates a property pane field with reset buttons
 */
export function PropertyPaneResetButtons(
  targetProperty: string,
  properties: IPropertyPaneResetButtonsProps
): IPropertyPaneField<IPropertyPaneResetButtonsInternalProps> {
  return new PropertyPaneResetButtonsBuilder(targetProperty, properties);
}
