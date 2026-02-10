/**
 * HubQueryBox - Frosted glass single-line auto-grow textarea
 *
 * BrainCircuit icon left, Send button right (primary when text present).
 * Enter submits, Shift+Enter newline. Frosted glass container.
 * Includes SuggestionChips below.
 */

import * as React from 'react';
import { Button, Tooltip, makeStyles, tokens, shorthands, mergeClasses } from '@fluentui/react-components';
import { BrainCircuit20Regular, Send20Regular, Send20Filled } from '@fluentui/react-icons';
import { SuggestionChips } from './SuggestionChips';
import { QueryBoxEnter } from './hubMotions';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },

  frostedContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: tokens.spacingHorizontalS,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    boxShadow: tokens.shadow4,
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.3)'),
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: tokens.durationNormal,
    ':focus-within': {
      boxShadow: tokens.shadow8,
      ...shorthands.borderColor(tokens.colorBrandStroke1),
    },
  },

  icon: {
    flexShrink: 0,
    color: tokens.colorPaletteBerryForeground1,
    paddingBottom: '4px',
  },

  textareaWrapper: {
    flex: 1,
    display: 'flex',
    minWidth: 0,
  },

  textarea: {
    width: '100%',
    ...shorthands.border('0', 'none', 'transparent'),
    ...shorthands.padding('4px', '0px'),
    backgroundColor: 'transparent',
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
    color: tokens.colorNeutralForeground1,
    resize: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    minHeight: '24px',
    maxHeight: '120px',
    overflowY: 'auto',
    '::placeholder': {
      color: tokens.colorNeutralForeground4,
    },
  },

  sendButton: {
    flexShrink: 0,
  },

  sendButtonActive: {
    color: tokens.colorBrandForeground1,
  },
});

// ============================================
// Props
// ============================================

export interface IHubQueryBoxProps {
  queryText: string;
  onQueryTextChange: (text: string) => void;
  onSubmit: (query: string) => void;
  isProcessing: boolean;
  hasResults: boolean;
  /** Optional ref to observe visibility */
  queryBoxRef?: React.RefObject<HTMLDivElement>;
  /** Compact mode (for floating dialog) */
  compact?: boolean;
}

// ============================================
// Component
// ============================================

export const HubQueryBox: React.FC<IHubQueryBoxProps> = ({
  queryText,
  onQueryTextChange,
  onSubmit,
  isProcessing,
  hasResults,
  queryBoxRef,
  compact = false,
}) => {
  const styles = useStyles();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  React.useEffect(() => {
    adjustHeight();
  }, [queryText, adjustHeight]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (queryText.trim() && !isProcessing) {
          onSubmit(queryText.trim());
        }
      }
    },
    [queryText, isProcessing, onSubmit]
  );

  const handleSubmitClick = React.useCallback(() => {
    if (queryText.trim() && !isProcessing) {
      onSubmit(queryText.trim());
    }
  }, [queryText, isProcessing, onSubmit]);

  const handleSuggestionClick = React.useCallback(
    (query: string) => {
      onQueryTextChange(query);
      onSubmit(query);
    },
    [onQueryTextChange, onSubmit]
  );

  const hasText = queryText.trim().length > 0;

  return (
    <QueryBoxEnter visible>
      <div className={styles.root} ref={queryBoxRef}>
        <div
          className={styles.frostedContainer}
          style={{ backdropFilter: 'saturate(180%) blur(16px)', WebkitBackdropFilter: 'saturate(180%) blur(16px)' }}
        >
          <div className={styles.icon}>
            <BrainCircuit20Regular />
          </div>

          <div className={styles.textareaWrapper}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={queryText}
              onChange={(e) => onQueryTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={compact ? 'Ask AI...' : 'Ask about your day, meetings, team, or workload...'}
              rows={1}
              disabled={isProcessing}
              aria-label="Query the Intelligence Hub"
            />
          </div>

          <Tooltip content="Send query" relationship="label">
            <Button
              className={mergeClasses(styles.sendButton, hasText && styles.sendButtonActive)}
              appearance={hasText ? 'primary' : 'subtle'}
              size="small"
              icon={hasText ? <Send20Filled /> : <Send20Regular />}
              onClick={handleSubmitClick}
              disabled={!hasText || isProcessing}
              aria-label="Send query"
            />
          </Tooltip>
        </div>

        {/* Suggestion chips (hidden when processing or results showing) */}
        {!isProcessing && !hasResults && (
          <SuggestionChips onSubmit={handleSuggestionClick} />
        )}
      </div>
    </QueryBoxEnter>
  );
};
