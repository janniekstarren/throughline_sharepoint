// ============================================
// AutoSizeNotification - One-Time Teaching MessageBar
// ============================================
// Shows a brief notification the first time the user manually
// manages a card (pin, resize, reorder) to explain that
// auto-promotion respects their choices in Smart mode.

import * as React from 'react';
import {
  MessageBar,
  MessageBarBody,
  MessageBarActions,
  Button,
} from '@fluentui/react-components';
import { isLocalStorageAvailable } from '../../services/UserPreferencesService';

const DISMISSED_KEY = 'throughline_autosize_notification_dismissed';

interface AutoSizeNotificationProps {
  visible: boolean;
}

export const AutoSizeNotification: React.FC<AutoSizeNotificationProps> = ({ visible }) => {
  const [isDismissed, setIsDismissed] = React.useState(() => {
    try {
      return isLocalStorageAvailable() && localStorage.getItem(DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = React.useCallback(() => {
    setIsDismissed(true);
    try {
      if (isLocalStorageAvailable()) {
        localStorage.setItem(DISMISSED_KEY, 'true');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  if (!visible || isDismissed) return null;

  return (
    <MessageBar intent="info" style={{ marginBottom: '12px' }}>
      <MessageBarBody>
        Cards you resize, pin, or reorder won&apos;t be auto-promoted — your layout choices are always respected.
      </MessageBarBody>
      <MessageBarActions>
        <Button appearance="transparent" onClick={handleDismiss}>
          Got it
        </Button>
      </MessageBarActions>
    </MessageBar>
  );
};

AutoSizeNotification.displayName = 'AutoSizeNotification';
