// ============================================
// DashboardHeader - Sticky floating header bar
// Both expanded and collapsed modes are sticky/floating.
// At rest: nav sits below the action bar as its own row.
// On scroll (stuck): nav slides inline with actions, scrolls horizontally.
// ============================================

import * as React from 'react';
import {
  makeStyles,
  mergeClasses,
  tokens,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  MenuItemRadio,
  Tooltip,
  Badge,
  Text,
  shorthands,
} from '@fluentui/react-components';
import {
  MoreHorizontal20Regular,
  ChevronDown20Regular,
  ChevronRight20Regular,
  Settings20Regular,
  Library20Regular,
  Sparkle20Regular,
  TextFontSize20Regular,
  Navigation20Regular,
  Navigation20Filled,
  Dismiss20Regular,
  Cart20Regular,
} from '@fluentui/react-icons';
import { CardSearch } from './CardSearch';
import { ViewSwitcher, DashboardView } from './ViewSwitcher';
import { LicenseTier, LicenseTierMeta } from '../../models/CardCatalog';
import { CardSize } from '../../types/CardSize';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  // Zero-height sentinel placed before the header to detect scroll position
  sentinel: {
    height: 0,
    width: '100%',
    visibility: 'hidden',
  },

  // Header — always sticky/floating
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalM),
    position: 'sticky',
    top: 0,
    zIndex: 10,
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    // Start transparent, transition to frosted when stuck
    backgroundColor: 'rgba(255, 255, 255, 0)',
    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },

  // Applied when sticky header is actually stuck (user has scrolled past natural position)
  headerStuck: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(32, 32, 32, 0.72)',
    },
    backdropFilter: 'saturate(180%) blur(16px)',
    boxShadow: tokens.shadow4,
  },

  // Inline nav container — takes remaining space, scrolls horizontally
  // Transitions from invisible to visible when header becomes stuck
  navInline: {
    flex: 1,
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none',
    },
    // Animated reveal when stuck
    opacity: 1,
    maxWidth: '9999px',
    transitionProperty: 'opacity, max-width',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },

  // Hidden state for inline nav (not stuck)
  navInlineHidden: {
    opacity: 0,
    maxWidth: '0px',
    overflow: 'hidden',
    transitionDuration: tokens.durationFast,
    transitionTimingFunction: tokens.curveAccelerateMid,
  },

  // Nav below the header — full width, separate row, shown at rest
  // Transitions to hidden when stuck
  navBelow: {
    ...shorthands.padding(tokens.spacingVerticalXS, 0),
    overflow: 'hidden',
    opacity: 1,
    maxHeight: '48px',
    transitionProperty: 'opacity, max-height',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },

  // Hidden state for below nav (stuck — nav moved inline)
  navBelowHidden: {
    opacity: 0,
    maxHeight: '0px',
    paddingTop: '0',
    paddingBottom: '0',
    transitionDuration: tokens.durationFast,
    transitionTimingFunction: tokens.curveAccelerateMid,
  },

  // Actions group (right side) — never shrinks
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },

  // Spacer pushes actions to the right when no nav is inline
  spacer: {
    flex: 1,
  },

  // ---- Collapsed mode: inline expansion ----
  collapsedContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },

  // Inline menu bar that animates in from the hamburger
  inlineMenuBar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    overflow: 'hidden',
  },

  // Enter animation (scaleX from right)
  inlineMenuBarEnter: {
    animationName: {
      from: {
        opacity: 0,
        transform: 'scaleX(0)',
        maxWidth: '0px',
      },
      to: {
        opacity: 1,
        transform: 'scaleX(1)',
        maxWidth: '600px',
      },
    },
    animationDuration: tokens.durationGentle,
    animationTimingFunction: tokens.curveDecelerateMid,
    animationFillMode: 'forwards',
    transformOrigin: 'right center',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
    },
  },

  // Exit animation (scaleX to right)
  inlineMenuBarExit: {
    animationName: {
      from: {
        opacity: 1,
        transform: 'scaleX(1)',
        maxWidth: '600px',
      },
      to: {
        opacity: 0,
        transform: 'scaleX(0)',
        maxWidth: '0px',
      },
    },
    animationDuration: tokens.durationFast,
    animationTimingFunction: tokens.curveAccelerateMid,
    animationFillMode: 'forwards',
    transformOrigin: 'right center',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
    },
  },

  // Hamburger / close icon rotation animation
  iconRotateIn: {
    animationName: {
      from: { transform: 'rotate(-90deg)', opacity: 0 },
      to: { transform: 'rotate(0deg)', opacity: 1 },
    },
    animationDuration: tokens.durationNormal,
    animationTimingFunction: tokens.curveDecelerateMid,
    animationFillMode: 'forwards',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
    },
  },

  tierButton: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  tierBadge: {
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
  },
  tierMenuHeader: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  tierStats: {
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground2,
  },
});

// ============================================
// Props
// ============================================

interface DashboardHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  searchResultCount: number;
  totalCardCount: number;
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onOpenCatalog?: () => void;
  onOpenStore?: () => void;
  onOpenCommandCentre?: () => void;
  showCustomiseButton?: boolean;
  isDemoMode?: boolean;
  currentTier?: LicenseTier;
  onTierChange?: (tier: LicenseTier) => void;
  accessibleCount?: number;
  lockedCount?: number;
  onSetAllCardSizes?: (size: CardSize) => void;
  isCategoriesVisible?: boolean;
  onToggleCategories?: () => void;
  menuMode?: string;
  floatMenu?: boolean;
  /** Category nav element — rendered inline on scroll, below header at rest */
  categoryNavElement?: React.ReactNode;
  aiChatTrigger?: React.ReactNode;
  /** Pulse indicator element — rendered in action bar */
  pulseElement?: React.ReactNode;
}

// ============================================
// Shared menu items (overflow ⋯)
// ============================================

interface OverflowMenuProps {
  onToggleCategories?: () => void;
  isCategoriesVisible: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSetAllCardSizes?: (size: CardSize) => void;
  onOpenCatalog?: () => void;
  onOpenCommandCentre?: () => void;
}

const OverflowMenu: React.FC<OverflowMenuProps> = ({
  onToggleCategories,
  isCategoriesVisible,
  onExpandAll,
  onCollapseAll,
  onSetAllCardSizes,
  onOpenCatalog,
  onOpenCommandCentre,
}) => (
  <Menu>
    <MenuTrigger>
      <Button
        appearance="subtle"
        icon={<MoreHorizontal20Regular />}
        size="small"
        aria-label="More options"
      />
    </MenuTrigger>
    <MenuPopover>
      <MenuList>
        {onToggleCategories && (
          <MenuItem
            icon={<Navigation20Regular />}
            onClick={onToggleCategories}
          >
            {isCategoriesVisible ? 'Hide categories' : 'Show categories'}
          </MenuItem>
        )}
        <MenuItem
          icon={<ChevronDown20Regular />}
          onClick={onExpandAll}
        >
          Expand all
        </MenuItem>
        <MenuItem
          icon={<ChevronRight20Regular />}
          onClick={onCollapseAll}
        >
          Collapse all
        </MenuItem>
        {onSetAllCardSizes && (
          <>
            <MenuDivider />
            <MenuItem
              icon={<TextFontSize20Regular />}
              onClick={() => onSetAllCardSizes('small')}
            >
              All cards small
            </MenuItem>
            <MenuItem
              icon={<TextFontSize20Regular />}
              onClick={() => onSetAllCardSizes('medium')}
            >
              All cards medium
            </MenuItem>
            <MenuItem
              icon={<TextFontSize20Regular />}
              onClick={() => onSetAllCardSizes('large')}
            >
              All cards large
            </MenuItem>
          </>
        )}
        {(onOpenCatalog || onOpenCommandCentre) && <MenuDivider />}
        {onOpenCatalog && (
          <MenuItem
            icon={<Library20Regular />}
            onClick={onOpenCatalog}
          >
            Card Catalog
          </MenuItem>
        )}
        {onOpenCommandCentre && (
          <MenuItem
            icon={<Settings20Regular />}
            onClick={onOpenCommandCentre}
          >
            Customise Dashboard
          </MenuItem>
        )}
      </MenuList>
    </MenuPopover>
  </Menu>
);

// ============================================
// TierSwitcher sub-component
// ============================================

interface TierSwitcherProps {
  isDemoMode: boolean;
  currentTier?: LicenseTier;
  onTierChange?: (tier: LicenseTier) => void;
  currentTierMeta: typeof LicenseTierMeta[LicenseTier] | null;
  accessibleCount: number;
  lockedCount: number;
  classes: ReturnType<typeof useStyles>;
}

const TierSwitcher: React.FC<TierSwitcherProps> = ({
  isDemoMode,
  currentTier,
  onTierChange,
  currentTierMeta,
  accessibleCount,
  lockedCount,
  classes,
}) => {
  if (!isDemoMode || !currentTier || !onTierChange) return null;

  const tierOptions = [
    LicenseTier.Individual,
    LicenseTier.Team,
    LicenseTier.Manager,
    LicenseTier.Leader,
  ];

  return (
    <Menu
      checkedValues={{ tier: [currentTier] }}
      onCheckedValueChange={(_e, data) => {
        const selected = data.checkedItems[0] as LicenseTier;
        if (selected) onTierChange(selected);
      }}
    >
      <MenuTrigger>
        <Tooltip content="Switch license tier (demo)" relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<Sparkle20Regular />}
            aria-label={`Current tier: ${currentTierMeta?.displayName}`}
          >
            <span className={classes.tierButton}>
              <span className={classes.tierBadge}>{currentTierMeta?.displayName}</span>
              <Badge size="small" appearance="filled" color="warning">POC</Badge>
            </span>
          </Button>
        </Tooltip>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <div className={classes.tierMenuHeader}>
            <Sparkle20Regular />
            <Text weight="semibold" size={200}>Throughline Tier</Text>
          </div>
          <MenuDivider />
          {tierOptions.map(tier => {
            const meta = LicenseTierMeta[tier];
            return (
              <MenuItemRadio key={tier} name="tier" value={tier}>
                {meta.displayName} — {meta.price}
              </MenuItemRadio>
            );
          })}
          <MenuDivider />
          <div className={classes.tierStats}>
            {accessibleCount} accessible · {lockedCount} locked · {accessibleCount + lockedCount} total
          </div>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

// ============================================
// Component
// ============================================

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearch,
  onClearSearch,
  searchResultCount,
  totalCardCount,
  currentView,
  onViewChange,
  onExpandAll,
  onCollapseAll,
  onOpenCatalog,
  onOpenStore,
  onOpenCommandCentre,
  showCustomiseButton = true,
  isDemoMode = false,
  currentTier,
  onTierChange,
  accessibleCount = 0,
  lockedCount = 0,
  onSetAllCardSizes,
  isCategoriesVisible = true,
  onToggleCategories,
  menuMode = 'expanded',
  categoryNavElement,
  aiChatTrigger,
  pulseElement,
}) => {
  const classes = useStyles();

  // Track whether the sticky header is actually "stuck" (scrolled past its natural position)
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = React.useState(false);

  React.useEffect(() => {
    if (!sentinelRef.current) {
      setIsStuck(false);
      return;
    }
    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const headerClassName = mergeClasses(
    classes.header,
    isStuck ? classes.headerStuck : undefined,
  );

  const currentTierMeta = currentTier ? LicenseTierMeta[currentTier] : null;

  // Collapsed mode: track if inline menu is open
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);

  const handleToggleMenu = React.useCallback(() => {
    if (isMenuOpen) {
      setIsExiting(true);
      const duration = 150;
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsExiting(false);
      }, duration);
    } else {
      setIsMenuOpen(true);
    }
  }, [isMenuOpen]);

  // Hidden: render nothing
  if (menuMode === 'hidden') {
    return null;
  }

  // ---- COLLAPSED: Hamburger toggles inline to full menu bar ----
  if (menuMode === 'collapsed') {
    return (
      <>
        <div ref={sentinelRef} className={classes.sentinel} />
        <div className={headerClassName}>
          {/* Inline nav — animated: fades in when stuck, fades out when not */}
          {categoryNavElement && (
            <div className={mergeClasses(classes.navInline, !isStuck && classes.navInlineHidden)}>
              {categoryNavElement}
            </div>
          )}

          {/* Spacer pushes actions right when nav is not inline */}
          {!isStuck && <div className={classes.spacer} />}

          {/* Right side: search + inline menu + hamburger */}
          <div className={classes.collapsedContainer}>
            <CardSearch
              searchQuery={searchQuery}
              onSearch={onSearch}
              onClear={onClearSearch}
              resultCount={searchResultCount}
              totalCount={totalCardCount}
            />

            {/* Inline menu bar — slides in when open */}
            {isMenuOpen && (
              <div
                className={`${classes.inlineMenuBar} ${isExiting ? classes.inlineMenuBarExit : classes.inlineMenuBarEnter}`}
              >
                <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />

                <TierSwitcher
                  isDemoMode={isDemoMode}
                  currentTier={currentTier}
                  onTierChange={onTierChange}
                  currentTierMeta={currentTierMeta}
                  accessibleCount={accessibleCount}
                  lockedCount={lockedCount}
                  classes={classes}
                />

                {pulseElement}

                {aiChatTrigger}

                {onOpenCatalog && (
                  <Tooltip content="Card Catalog" relationship="label">
                    <Button
                      appearance="subtle"
                      icon={<Library20Regular />}
                      size="small"
                      onClick={onOpenCatalog}
                      aria-label="Card Catalog"
                    />
                  </Tooltip>
                )}

                {onOpenStore && (
                  <Tooltip content="Card Store" relationship="label">
                    <Button
                      appearance="subtle"
                      icon={<Cart20Regular />}
                      size="small"
                      onClick={onOpenStore}
                      aria-label="Card Store"
                    />
                  </Tooltip>
                )}

                {showCustomiseButton && onOpenCommandCentre && (
                  <Tooltip content="Customise" relationship="label">
                    <Button
                      appearance="subtle"
                      icon={<Settings20Regular />}
                      size="small"
                      onClick={onOpenCommandCentre}
                      aria-label="Customise dashboard"
                    />
                  </Tooltip>
                )}

                <OverflowMenu
                  onToggleCategories={onToggleCategories}
                  isCategoriesVisible={isCategoriesVisible}
                  onExpandAll={onExpandAll}
                  onCollapseAll={onCollapseAll}
                  onSetAllCardSizes={onSetAllCardSizes}
                  onOpenCatalog={onOpenCatalog}
                  onOpenCommandCentre={onOpenCommandCentre}
                />
              </div>
            )}

            {/* Hamburger / Close toggle */}
            <Tooltip content={isMenuOpen ? 'Close menu' : 'Menu'} relationship="label">
              <Button
                appearance="subtle"
                size="small"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                onClick={handleToggleMenu}
                icon={
                  <span key={isMenuOpen ? 'close' : 'open'} className={classes.iconRotateIn}>
                    {isMenuOpen ? <Dismiss20Regular /> : <Navigation20Filled />}
                  </span>
                }
              />
            </Tooltip>
          </div>
        </div>

        {/* Nav below header — animated: visible at rest, collapses when stuck */}
        {categoryNavElement && (
          <div className={mergeClasses(classes.navBelow, isStuck && classes.navBelowHidden)}>
            {categoryNavElement}
          </div>
        )}
      </>
    );
  }

  // ---- EXPANDED: All buttons visible individually ----
  return (
    <>
      <div ref={sentinelRef} className={classes.sentinel} />
      <div className={headerClassName}>
        {/* Inline nav — animated: fades in when stuck, fades out when not */}
        {categoryNavElement && (
          <div className={mergeClasses(classes.navInline, !isStuck && classes.navInlineHidden)}>
            {categoryNavElement}
          </div>
        )}

        {/* Spacer pushes actions right when nav is not inline */}
        {!isStuck && <div className={classes.spacer} />}

        {/* Right side: all action buttons */}
        <div className={classes.actions}>
          <CardSearch
            searchQuery={searchQuery}
            onSearch={onSearch}
            onClear={onClearSearch}
            resultCount={searchResultCount}
            totalCount={totalCardCount}
          />
          <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />

          <TierSwitcher
            isDemoMode={isDemoMode}
            currentTier={currentTier}
            onTierChange={onTierChange}
            currentTierMeta={currentTierMeta}
            accessibleCount={accessibleCount}
            lockedCount={lockedCount}
            classes={classes}
          />

          {pulseElement}

          {aiChatTrigger}

          {onOpenCatalog && (
            <Tooltip content="Card Catalog" relationship="label">
              <Button
                appearance="subtle"
                icon={<Library20Regular />}
                size="small"
                onClick={onOpenCatalog}
                aria-label="Card Catalog"
              />
            </Tooltip>
          )}

          {onOpenStore && (
            <Tooltip content="Card Store" relationship="label">
              <Button
                appearance="subtle"
                icon={<Cart20Regular />}
                size="small"
                onClick={onOpenStore}
                aria-label="Card Store"
              />
            </Tooltip>
          )}

          {showCustomiseButton && onOpenCommandCentre && (
            <Tooltip content="Customise" relationship="label">
              <Button
                appearance="subtle"
                icon={<Settings20Regular />}
                size="small"
                onClick={onOpenCommandCentre}
                aria-label="Customise dashboard"
              />
            </Tooltip>
          )}

          <OverflowMenu
            onToggleCategories={onToggleCategories}
            isCategoriesVisible={isCategoriesVisible}
            onExpandAll={onExpandAll}
            onCollapseAll={onCollapseAll}
            onSetAllCardSizes={onSetAllCardSizes}
            onOpenCatalog={onOpenCatalog}
            onOpenCommandCentre={onOpenCommandCentre}
          />
        </div>
      </div>

      {/* Nav below header — animated: visible at rest, collapses when stuck */}
      {categoryNavElement && (
        <div className={mergeClasses(classes.navBelow, isStuck && classes.navBelowHidden)}>
          {categoryNavElement}
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
