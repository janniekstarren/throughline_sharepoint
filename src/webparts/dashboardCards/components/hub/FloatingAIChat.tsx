/**
 * FloatingAIChat - Non-modal dialog with query box + results
 *
 * 420px wide, max-height 500px. Contains compact HubQueryBox,
 * SuggestionChips, QueryResultDisplay, ThinkingAnimation.
 * Shares the same query engine via useQueryInterface.
 */

import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  Button,
  Text,
  makeStyles,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import { BrainCircuit20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { IQueryInterface } from '../../hooks/useQueryInterface';
import { HubQueryBox } from './HubQueryBox';
import { ThinkingAnimation } from './ThinkingAnimation';
import { QueryResultDisplay } from './QueryResultDisplay';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  surface: {
    width: '420px',
    maxWidth: '95vw',
    maxHeight: '500px',
    position: 'fixed' as const,
    bottom: '80px',
    right: '24px',
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    boxShadow: tokens.shadow16,
    ...shorthands.overflow('hidden'),
  },

  title: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },

  titleIcon: {
    color: tokens.colorPaletteBerryForeground1,
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    overflowY: 'auto',
    maxHeight: '380px',
    ...shorthands.padding(0, tokens.spacingHorizontalS, tokens.spacingVerticalS),
  },
});

// ============================================
// Props
// ============================================

export interface IFloatingAIChatProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Close the dialog */
  onClose: () => void;
  /** Shared query interface (same instance as Hub) */
  queryInterface: IQueryInterface;
}

// ============================================
// Component
// ============================================

export const FloatingAIChat: React.FC<IFloatingAIChatProps> = ({
  isOpen,
  onClose,
  queryInterface,
}) => {
  const styles = useStyles();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(_e, data) => {
        if (!data.open) onClose();
      }}
      modalType="non-modal"
    >
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                onClick={onClose}
                aria-label="Close"
                size="small"
              />
            }
          >
            <div className={styles.title}>
              <BrainCircuit20Regular className={styles.titleIcon} />
              <Text>Ask AI</Text>
            </div>
          </DialogTitle>

          <DialogContent className={styles.content}>
            {/* Compact query box */}
            <HubQueryBox
              queryText={queryInterface.queryText}
              onQueryTextChange={queryInterface.setQueryText}
              onSubmit={(query) => queryInterface.submitQuery(query)}
              isProcessing={queryInterface.isProcessing}
              hasResults={!!queryInterface.results}
              compact
            />

            {/* Thinking animation */}
            {queryInterface.isProcessing && (
              <ThinkingAnimation sourceNames={queryInterface.thinkingSourceNames} />
            )}

            {/* Results (compact mode) */}
            {queryInterface.results && !queryInterface.isProcessing && (
              <QueryResultDisplay
                results={queryInterface.results}
                onFollowUp={(query) => queryInterface.handleFollowUp(query)}
                onDismiss={() => queryInterface.clearResults()}
                compact
              />
            )}
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
