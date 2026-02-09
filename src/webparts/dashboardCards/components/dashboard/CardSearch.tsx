// ============================================
// CardSearch — Expandable "Spotlight Search" (Fluent UI v9)
// Collapsed: subtle search icon in header actions
// Expanded: pill-shaped search bar with slide-out animation
// Keyboard: Ctrl+K / Cmd+K / "/" to open, Escape to close
// ============================================

import * as React from 'react';
import {
  Button,
  Text,
  Badge,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Search20Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';

// ============================================
// Styles — pill-shaped search bar matching nav pills
// ============================================

const useStyles = makeStyles({
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  // Collapsed: icon button (matches Settings/Catalog/More buttons)
  searchButton: {
    minWidth: 'auto',
    color: tokens.colorNeutralForeground2,
  },

  // Expanded: overlay container — floats above header, doesn't push content
  searchBarContainer: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 20,
    width: '280px',
    animationName: {
      from: {
        opacity: 0,
        transform: 'translateY(-50%) scaleX(0.7)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(-50%) scaleX(1)',
      },
    },
    animationDuration: tokens.durationNormal,
    animationTimingFunction: tokens.curveDecelerateMax,
    animationFillMode: 'forwards',
    transformOrigin: 'right center',
    // Reduced motion: instant
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
    },
  },

  // Pill-shaped bar — borderless at rest, subtle focus ring
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    height: '32px',
    width: '100%',
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusCircular,
    borderTopWidth: '0',
    borderRightWidth: '0',
    borderBottomWidth: '0',
    borderLeftWidth: '0',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: tokens.durationFaster,
    transitionTimingFunction: tokens.curveDecelerateMin,
    boxShadow: tokens.shadow4,
    ':focus-within': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      boxShadow: `${tokens.shadow4}, 0 0 0 1px ${tokens.colorNeutralStroke2}`,
    },
  },

  // Search icon inside the bar
  searchIcon: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground2,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
  },

  // Native input — transparent, explicit text color for SP compatibility
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: tokens.fontSizeBase200,
    fontFamily: tokens.fontFamilyBase,
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase200,
    minWidth: 0,
    height: '100%',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: tokens.spacingHorizontalXS,
    paddingRight: tokens.spacingHorizontalXS,
    // Force inherit from Fluent theme — native inputs ignore CSS variables
    // unless explicitly set via the 'color' shorthand on the element itself
    WebkitTextFillColor: tokens.colorNeutralForeground1,
    '::placeholder': {
      color: tokens.colorNeutralForeground2,
      WebkitTextFillColor: tokens.colorNeutralForeground2,
      opacity: '1',
    },
  },

  // Result count badge
  resultBadge: {
    flexShrink: 0,
  },

  // Close button — explicit size, no shrink
  closeButton: {
    minWidth: '26px',
    width: '26px',
    height: '26px',
    padding: '0',
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Keyboard shortcut hint in tooltip
  kbd: {
    display: 'inline-block',
    paddingLeft: tokens.spacingHorizontalXS,
    paddingRight: tokens.spacingHorizontalXS,
    marginLeft: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase100,
    fontFamily: tokens.fontFamilyMonospace,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    borderTopWidth: tokens.strokeWidthThin,
    borderRightWidth: tokens.strokeWidthThin,
    borderBottomWidth: tokens.strokeWidthThin,
    borderLeftWidth: tokens.strokeWidthThin,
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    lineHeight: '18px',
  },
});

// ============================================
// Props (unchanged from original)
// ============================================

interface CardSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  searchQuery: string;
  resultCount: number;
  totalCount: number;
}

// ============================================
// Component
// ============================================

export const CardSearch: React.FC<CardSearchProps> = ({
  onSearch,
  onClear,
  searchQuery,
  resultCount,
  totalCount,
}) => {
  const classes = useStyles();

  // Expand/collapse state
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Refs
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // ---- Handlers ----

  const handleExpand = React.useCallback(() => {
    setIsExpanded(true);
  }, []);

  const handleCollapse = React.useCallback(() => {
    setIsExpanded(false);
    // Clear query on close
    if (searchQuery) {
      onClear();
    }
    // Return focus to the trigger button
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, [searchQuery, onClear]);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value) {
        onSearch(value);
      } else {
        onClear();
      }
    },
    [onSearch, onClear]
  );

  // ---- Effects ----

  // Auto-focus input when expanded
  React.useEffect(() => {
    if (isExpanded && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isExpanded]);

  // Keyboard shortcuts: Ctrl+K / Cmd+K, "/", Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isExpanded) {
          inputRef.current?.focus();
        } else {
          handleExpand();
        }
        return;
      }
      // "/" to open (only when no other input is focused)
      if (e.key === '/' && !isExpanded) {
        const active = document.activeElement;
        const isInputFocused =
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          (active as HTMLElement)?.isContentEditable;
        if (!isInputFocused) {
          e.preventDefault();
          handleExpand();
        }
        return;
      }
      // Escape to close
      if (e.key === 'Escape' && isExpanded) {
        handleCollapse();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, handleExpand, handleCollapse]);

  // Click-outside to close
  React.useEffect(() => {
    if (!isExpanded) return undefined;

    const handleClickOutside = (e: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        handleCollapse();
      }
    };

    // Defer listener to avoid expand-click from immediately triggering collapse
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, handleCollapse]);

  // ---- Render ----

  return (
    <div ref={wrapperRef} className={classes.wrapper}>
      {/* Collapsed: search icon button */}
      {!isExpanded && (
        <Tooltip
          content={
            <span>
              Search cards <kbd className={classes.kbd}>⌘K</kbd>
            </span>
          }
          relationship="label"
        >
          <Button
            ref={triggerRef}
            appearance="subtle"
            icon={<Search20Regular />}
            size="small"
            onClick={handleExpand}
            aria-label="Search cards (Ctrl+K)"
          />
        </Tooltip>
      )}

      {/* Expanded: animated pill-shaped search bar */}
      {isExpanded && (
        <div className={classes.searchBarContainer}>
          <div className={classes.searchBar}>
            <span className={classes.searchIcon}>
              <Search20Regular />
            </span>
            <input
              ref={inputRef}
              className={classes.searchInput}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search cards..."
              aria-label="Search cards"
              aria-describedby={searchQuery ? 'throughline-search-count' : undefined}
            />
            {searchQuery && (
              <Badge
                id="throughline-search-count"
                className={classes.resultBadge}
                size="medium"
                appearance="tint"
                color={resultCount > 0 ? 'brand' : 'danger'}
              >
                <Text size={100} weight="semibold">
                  {resultCount} / {totalCount}
                </Text>
              </Badge>
            )}
            <Button
              appearance="subtle"
              icon={<Dismiss16Regular />}
              size="small"
              onClick={handleCollapse}
              aria-label="Close search"
              className={classes.closeButton}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSearch;
