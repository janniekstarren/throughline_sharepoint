// ============================================
// DashboardHeader - Sticky header with search, view, and actions
// Supports 3 modes: expanded (all buttons), collapsed (hamburger), hidden
// Collapsed: hamburger toggles inline to full menu bar with Fluent2 motion
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
} from '@fluentui/react-icons';
// Fluent2 motion timing — using tokens.duration* (string) for Griffel compatibility
// motionTokens from @fluentui/react-motion are numeric, Griffel needs strings
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
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} 0`,
    zIndex: 10,
    transitionProperty: 'background-color, box-shadow, border-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
  },
  // Floating (sticky) mode — position only, background is transparent until scrolled
  headerFloating: {
    position: 'sticky',
    top: 0,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    // Use explicit rgba(0) to prevent white-flash during CSS transitions
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderBottom: '1px solid rgba(0, 0, 0, 0)',
    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
  },
  // Applied when sticky header is actually stuck (user has scrolled past natural position)
  // Frosted glass effect with backdrop-filter blur, matching nav pill border radius
  headerFloatingStuck: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(32, 32, 32, 0.72)',
    },
    backdropFilter: 'saturate(180%) blur(16px)',
    borderBottom: 'none',
    borderRadius: tokens.borderRadiusCircular,
    boxShadow: tokens.shadow4,
  },
  // Static mode — stays in flow, no shadow, inherits background
  headerStatic: {
    position: 'relative',
    backgroundColor: 'inherit',
  },
  spacer: {
    flex: 1,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },

  // ---- Collapsed mode: inline expansion ----
  collapsedContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
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
  onOpenCommandCentre?: () => void;
  showCustomiseButton?: boolean;
  /** Demo mode: show tier switcher in the header bar */
  isDemoMode?: boolean;
  currentTier?: LicenseTier;
  onTierChange?: (tier: LicenseTier) => void;
  accessibleCount?: number;
  lockedCount?: number;
  /** Callback to set all visible card sizes at once */
  onSetAllCardSizes?: (size: CardSize) => void;
  /** Whether the category nav rail is currently visible */
  isCategoriesVisible?: boolean;
  /** Callback to toggle category nav visibility */
  onToggleCategories?: () => void;
  /** Menu display mode: expanded (all buttons) | collapsed (hamburger) | hidden */
  menuMode?: string;
  /** Float menu (sticky) or keep at top (static). Default: collapsed=float, expanded=static */
  floatMenu?: boolean;
}

// ============================================
// Shared menu items (overflow ⋯ in expanded, part of inline bar in collapsed)
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
  floatMenu,
}) => {
  const classes = useStyles();

  // Determine floating behaviour:
  // - collapsed mode defaults to floating (sticky)
  // - expanded mode defaults to static (in-flow)
  // - explicit floatMenu prop overrides the default
  const isFloating = floatMenu !== undefined
    ? floatMenu
    : menuMode === 'collapsed';

  // Track whether the sticky header is actually "stuck" (scrolled past its natural position)
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = React.useState(false);

  React.useEffect(() => {
    if (!isFloating || !sentinelRef.current) {
      setIsStuck(false);
      return;
    }
    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is NOT intersecting, the header has left its natural position
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isFloating]);

  const headerClassName = mergeClasses(
    classes.header,
    isFloating ? classes.headerFloating : classes.headerStatic,
    isFloating && isStuck ? classes.headerFloatingStuck : undefined,
  );

  // Collapsed mode: track if inline menu is open
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  // Track exit animation before unmounting
  const [isExiting, setIsExiting] = React.useState(false);

  const handleToggleMenu = React.useCallback(() => {
    if (isMenuOpen) {
      // Start exit animation, then unmount
      setIsExiting(true);
      const duration = 150; // matches durationFast
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsExiting(false);
      }, duration);
    } else {
      setIsMenuOpen(true);
    }
  }, [isMenuOpen]);

  const tierOptions = [
    LicenseTier.Individual,
    LicenseTier.Team,
    LicenseTier.Manager,
    LicenseTier.Leader,
  ];

  const currentTierMeta = currentTier ? LicenseTierMeta[currentTier] : null;

  // Hidden: render nothing
  if (menuMode === 'hidden') {
    return null;
  }

  // ---- COLLAPSED: Hamburger toggles inline to full menu bar ----
  if (menuMode === 'collapsed') {
    return (
      <>
      {/* Sentinel: when this scrolls out of view, the sticky header shows its background */}
      <div ref={sentinelRef} className={classes.sentinel} />
      <div className={headerClassName}>
        <div className={classes.spacer} />
        <div className={classes.collapsedContainer}>
          {/* Search always visible */}
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

              {/* Tier Switcher — demo mode only */}
              {isDemoMode && currentTier && onTierChange && (
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
              )}

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

          {/* Hamburger / Close toggle — icon rotates on state change */}
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
      </>
    );
  }

  // ---- EXPANDED: All buttons visible individually (default) ----
  return (
    <>
    {/* Sentinel: when this scrolls out of view, the sticky header shows its background */}
    <div ref={sentinelRef} className={classes.sentinel} />
    <div className={headerClassName}>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {/* Search icon — expands into pill-shaped search bar on click */}
        <CardSearch
          searchQuery={searchQuery}
          onSearch={onSearch}
          onClear={onClearSearch}
          resultCount={searchResultCount}
          totalCount={totalCardCount}
        />
        <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />

        {/* Tier Switcher — only visible in demo mode */}
        {isDemoMode && currentTier && onTierChange && (
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
                    <Badge
                      size="small"
                      appearance="filled"
                      color="warning"
                    >
                      POC
                    </Badge>
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
                    <MenuItemRadio
                      key={tier}
                      name="tier"
                      value={tier}
                    >
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
        )}

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
    </>
  );
};

export default DashboardHeader;
