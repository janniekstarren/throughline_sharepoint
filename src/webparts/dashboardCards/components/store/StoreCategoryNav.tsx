// ============================================
// StoreCategoryNav — Category filter pills for the Card Store
// Reuses frosted glass pill style from CategoryNavRail
// ============================================

import * as React from 'react';
import {
  makeStyles,
  mergeClasses,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import {
  Apps20Regular,
  Flash20Regular,
  DataUsage20Regular,
  Book20Regular,
  PeopleTeam20Regular,
  PersonBoard20Regular,
  Shield20Regular,
  PlugConnected20Regular,
  Diamond20Regular,
  Sparkle20Regular,
} from '@fluentui/react-icons';
import { CardCategory } from '../../models/CardCatalog';

// ============================================
// Styles — Frosted glass pills matching CategoryNavRail
// ============================================

const useStyles = makeStyles({
  rail: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    overflowX: 'auto',
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
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
    paddingRight: tokens.spacingHorizontalM,
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
    // Frosted glass effect
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
    },
  },
  pillActive: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
    borderTopColor: tokens.colorBrandStroke1,
    borderRightColor: tokens.colorBrandStroke1,
    borderBottomColor: tokens.colorBrandStroke1,
    borderLeftColor: tokens.colorBrandStroke1,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightBold,
    boxShadow: tokens.shadow2,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Selected,
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
      color: tokens.colorBrandForeground1,
    },
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
  },
});

// ============================================
// Category items
// ============================================

interface StoreCategoryItem {
  id: string;
  label: string;
  icon?: React.ReactElement;
}

const STORE_CATEGORIES: StoreCategoryItem[] = [
  { id: 'all', label: 'All Cards', icon: <Apps20Regular /> },
  { id: CardCategory.ImmediateAction, label: 'Immediate Action', icon: <Flash20Regular /> },
  { id: CardCategory.ProductivityPatterns, label: 'Productivity', icon: <DataUsage20Regular /> },
  { id: CardCategory.KnowledgeManagement, label: 'Knowledge', icon: <Book20Regular /> },
  { id: CardCategory.CollaborationHealth, label: 'Collaboration', icon: <PeopleTeam20Regular /> },
  { id: CardCategory.ManagerToolkit, label: 'Manager', icon: <PersonBoard20Regular /> },
  { id: CardCategory.GovernanceCompliance, label: 'Governance', icon: <Shield20Regular /> },
  { id: 'integrations', label: 'Integrations', icon: <PlugConnected20Regular /> },
  { id: 'tiers', label: 'Tiers', icon: <Diamond20Regular /> },
  { id: 'new', label: 'New', icon: <Sparkle20Regular /> },
];

// ============================================
// Props
// ============================================

interface StoreCategoryNavProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

// ============================================
// Component
// ============================================

export const StoreCategoryNav: React.FC<StoreCategoryNavProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.rail} role="tablist" aria-label="Store categories">
      {STORE_CATEGORIES.map(cat => (
        <button
          key={cat.id}
          role="tab"
          aria-selected={activeCategory === cat.id}
          className={mergeClasses(
            classes.pill,
            activeCategory === cat.id ? classes.pillActive : undefined,
          )}
          onClick={() => onCategoryChange(cat.id)}
        >
          {cat.icon && <span className={classes.icon}>{cat.icon}</span>}
          {cat.label}
        </button>
      ))}
    </div>
  );
};
