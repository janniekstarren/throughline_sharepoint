// ============================================
// CategoryNavRail - Horizontal scrollable pill nav (Fluent UI v9)
// Click to scroll to category section
// ============================================

import * as React from 'react';
import {
  makeStyles,
  mergeClasses,
  tokens,
  CounterBadge,
  shorthands,
} from '@fluentui/react-components';

// ============================================
// Styles — Fluent2 design language
// ============================================

const useStyles = makeStyles({
  rail: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    overflowX: 'auto',
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none',
    },
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusCircular,
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
    // Frosted glass effect — semi-transparent with backdrop blur
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(32, 32, 32, 0.6)',
    },
    backdropFilter: 'saturate(180%) blur(16px)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    fontFamily: tokens.fontFamilyBase,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase200,
    height: '32px',
    ...shorthands.outline('0'),
    transitionProperty: 'background-color, border-color, color, box-shadow',
    transitionDuration: tokens.durationFaster,
    transitionTimingFunction: tokens.curveDecelerateMin,
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      borderTopColor: tokens.colorNeutralStroke1Hover,
      borderRightColor: tokens.colorNeutralStroke1Hover,
      borderBottomColor: tokens.colorNeutralStroke1Hover,
      borderLeftColor: tokens.colorNeutralStroke1Hover,
      color: tokens.colorNeutralForeground1,
    },
    ':active': {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      color: tokens.colorNeutralForeground1,
      transform: 'scale(0.98)',
    },
    ':focus-visible': {
      ...shorthands.outline(tokens.strokeWidthThick, 'solid', tokens.colorStrokeFocus2),
      outlineOffset: '2px',
    },
  },
  pillActive: {
    backgroundColor: tokens.colorBrandBackground2,
    backdropFilter: 'saturate(180%) blur(16px)',
    borderTopColor: tokens.colorBrandStroke1,
    borderRightColor: tokens.colorBrandStroke1,
    borderBottomColor: tokens.colorBrandStroke1,
    borderLeftColor: tokens.colorBrandStroke1,
    color: tokens.colorBrandForeground1,
    boxShadow: tokens.shadow2,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
      color: tokens.colorBrandForeground1,
    },
  },
  pillWithColor: {
    // Applied when a category has a custom color and is active
    // Background color set via inline style
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: tokens.lineHeightBase200,
  },
});

// ============================================
// Props
// ============================================

export interface INavPill {
  id: string;
  label: string;
  count: number;
  color?: string;
}

interface CategoryNavRailProps {
  pills: INavPill[];
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

// ============================================
// Component
// ============================================

export const CategoryNavRail: React.FC<CategoryNavRailProps> = ({
  pills,
  activeCategory,
  onCategoryClick,
}) => {
  const classes = useStyles();
  const railRef = React.useRef<HTMLElement>(null);

  // Scroll the active pill into view horizontally within the rail.
  // IMPORTANT: Do NOT use scrollIntoView — it scrolls the entire SharePoint page
  // vertically, causing the "jump back up" bug. Instead, adjust the rail's
  // scrollLeft directly for horizontal-only scrolling.
  React.useEffect(() => {
    if (activeCategory && railRef.current) {
      const activeEl = railRef.current.querySelector(`[data-pill-id="${activeCategory}"]`) as HTMLElement | null;
      if (activeEl) {
        const rail = railRef.current;
        const pillLeft = activeEl.offsetLeft;
        const pillWidth = activeEl.offsetWidth;
        const railScrollLeft = rail.scrollLeft;
        const railWidth = rail.clientWidth;

        // If pill is to the left of the visible area, scroll left
        if (pillLeft < railScrollLeft) {
          rail.scrollTo({ left: pillLeft - 8, behavior: 'smooth' });
        }
        // If pill is to the right of the visible area, scroll right
        else if (pillLeft + pillWidth > railScrollLeft + railWidth) {
          rail.scrollTo({ left: pillLeft + pillWidth - railWidth + 8, behavior: 'smooth' });
        }
      }
    }
  }, [activeCategory]);

  return (
    <nav
      ref={railRef}
      className={classes.rail}
      role="tablist"
      aria-label="Card categories"
    >
      {pills.map(pill => {
        const isActive = pill.id === activeCategory;
        // When active and pill has a custom color, tint the background
        const activeColorStyle = isActive && pill.color
          ? {
              backgroundColor: `${pill.color}18`,
              borderColor: `${pill.color}60`,
              color: pill.color,
            }
          : undefined;

        return (
          <button
            key={pill.id}
            data-pill-id={pill.id}
            className={mergeClasses(
              classes.pill,
              isActive && classes.pillActive,
              isActive && pill.color && classes.pillWithColor,
            )}
            onClick={() => onCategoryClick(pill.id)}
            role="tab"
            aria-selected={isActive}
            style={activeColorStyle}
            type="button"
          >
            <span className={classes.label}>{pill.label}</span>
            <CounterBadge
              count={pill.count}
              size="small"
              appearance={isActive ? 'filled' : 'ghost'}
              color={isActive ? 'brand' : 'informative'}
              showZero
              overflowCount={999}
            />
          </button>
        );
      })}
    </nav>
  );
};

export default CategoryNavRail;
