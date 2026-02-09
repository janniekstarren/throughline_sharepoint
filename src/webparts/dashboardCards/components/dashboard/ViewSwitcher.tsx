// ============================================
// ViewSwitcher - Dashboard view presets
// ============================================

import * as React from 'react';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItemRadio,
  Button,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Grid20Regular,
  Checkmark20Regular,
} from '@fluentui/react-icons';

// ============================================
// View definitions
// ============================================

export type DashboardView =
  | 'categories'
  | 'needsAttention'
  | 'highImpact'
  | 'compact';

interface ViewDefinition {
  id: DashboardView;
  label: string;
  description: string;
}

const VIEWS: ViewDefinition[] = [
  { id: 'categories', label: 'Categories', description: 'Group by category' },
  { id: 'needsAttention', label: 'Needs Attention', description: 'Cards with alerts first' },
  { id: 'highImpact', label: 'High Impact', description: 'Sorted by impact rating' },
  { id: 'compact', label: 'Compact', description: 'Smaller cards, more density' },
];

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  button: {
    minWidth: 'auto',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  check: {
    color: tokens.colorBrandForeground1,
  },
});

// ============================================
// Props
// ============================================

interface ViewSwitcherProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

// ============================================
// Component
// ============================================

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
}) => {
  const classes = useStyles();

  const checkedValues = React.useMemo(
    () => ({ view: [currentView] }),
    [currentView]
  );

  const handleChange = React.useCallback(
    (_ev: unknown, data: { name: string; checkedItems: string[] }) => {
      if (data.checkedItems.length > 0) {
        onViewChange(data.checkedItems[0] as DashboardView);
      }
    },
    [onViewChange]
  );

  const activeLabel = VIEWS.find(v => v.id === currentView)?.label || 'View';

  return (
    <Menu checkedValues={checkedValues} onCheckedValueChange={handleChange}>
      <MenuTrigger>
        <Button
          className={classes.button}
          appearance="subtle"
          icon={<Grid20Regular />}
          size="small"
        >
          {activeLabel}
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {VIEWS.map(view => (
            <MenuItemRadio key={view.id} name="view" value={view.id}>
              <div className={classes.menuItem}>
                {view.id === currentView && (
                  <Checkmark20Regular className={classes.check} />
                )}
                <span>{view.label}</span>
              </div>
            </MenuItemRadio>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default ViewSwitcher;
