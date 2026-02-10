/**
 * FloatingAIChatTrigger - ChatSparkle icon button for the menu bar
 *
 * Appears when the Hub query box scrolls out of view (via IntersectionObserver).
 * Filled variant when dialog is open. Uses AI accent color.
 */

import * as React from 'react';
import { Button, Tooltip, makeStyles, tokens, mergeClasses } from '@fluentui/react-components';
import { ChatSparkle20Regular, ChatSparkle20Filled } from '@fluentui/react-icons';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  root: {
    transitionProperty: 'opacity, transform',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMax,
  },

  visible: {
    opacity: 1,
    transform: 'scale(1)',
  },

  hidden: {
    opacity: 0,
    transform: 'scale(0.8)',
    pointerEvents: 'none' as const,
  },

  button: {
    color: tokens.colorPaletteBerryForeground1,
  },
});

// ============================================
// Props
// ============================================

export interface IFloatingAIChatTriggerProps {
  /** Whether the dialog is currently open */
  isDialogOpen: boolean;
  /** Toggle the dialog */
  onToggle: () => void;
  /** Whether the trigger should be visible (Hub query box out of view) */
  isVisible: boolean;
}

// ============================================
// Component
// ============================================

export const FloatingAIChatTrigger: React.FC<IFloatingAIChatTriggerProps> = ({
  isDialogOpen,
  onToggle,
  isVisible,
}) => {
  const styles = useStyles();

  return (
    <div className={mergeClasses(styles.root, isVisible ? styles.visible : styles.hidden)}>
      <Tooltip
        content={isDialogOpen ? 'Close AI Assistant' : 'Ask AI'}
        relationship="label"
      >
        <Button
          className={styles.button}
          appearance="subtle"
          size="small"
          icon={isDialogOpen ? <ChatSparkle20Filled /> : <ChatSparkle20Regular />}
          onClick={onToggle}
          aria-label={isDialogOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        />
      </Tooltip>
    </div>
  );
};
