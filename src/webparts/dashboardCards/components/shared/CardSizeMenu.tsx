// ============================================
// CardSizeMenu - Size selection dropdown menu
// Used across all card sizes (small/medium/large)
// ============================================

import * as React from 'react';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItemRadio,
  Button,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  GridDots20Regular,
} from '@fluentui/react-icons';
import { CardSize } from '../../types/CardSize';

export interface ICardSizeMenuProps {
  /** Current card size */
  currentSize: CardSize;
  /** Callback when size is changed. If undefined, menu is not rendered */
  onSizeChange?: (size: CardSize) => void;
  /** Button appearance */
  appearance?: 'subtle' | 'transparent';
  /** Button size */
  buttonSize?: 'small' | 'medium';
  /** Tooltip text */
  tooltip?: string;
  /** Aria label for accessibility */
  ariaLabel?: string;
}

const useStyles = makeStyles({
  menuButton: {
    minWidth: 'auto',
  },
  menuPopover: {
    zIndex: 1000000, // High z-index for SharePoint visibility
  },
  menuList: {
    minWidth: '140px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
});

// Size labels for display
const SIZE_LABELS: Record<CardSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

export const CardSizeMenu: React.FC<ICardSizeMenuProps> = ({
  currentSize,
  onSizeChange,
  appearance = 'subtle',
  buttonSize = 'small',
  tooltip,
  ariaLabel = 'Change card size',
}) => {
  const styles = useStyles();

  // Don't render if onSizeChange is not provided
  if (!onSizeChange) {
    return null;
  }

  // Controlled checked values for the menu
  const checkedValues = {
    size: [currentSize],
  };

  // Handle size selection
  const handleCheckedValueChange = (
    _: unknown,
    data: { name: string; checkedItems: string[] }
  ): void => {
    if (data.checkedItems.length > 0) {
      const newSize = data.checkedItems[0] as CardSize;
      if (newSize !== currentSize) {
        onSizeChange(newSize);
      }
    }
  };

  const tooltipContent = tooltip || `Size: ${SIZE_LABELS[currentSize]}`;

  return (
    <Menu
      checkedValues={checkedValues}
      onCheckedValueChange={handleCheckedValueChange}
    >
      <MenuTrigger disableButtonEnhancement>
        <Tooltip content={tooltipContent} relationship="label">
          <Button
            appearance={appearance}
            size={buttonSize}
            icon={<GridDots20Regular />}
            className={styles.menuButton}
            aria-label={ariaLabel}
          />
        </Tooltip>
      </MenuTrigger>
      <MenuPopover className={styles.menuPopover}>
        <MenuList className={styles.menuList}>
          <MenuItemRadio name="size" value="small">
            {SIZE_LABELS.small}
          </MenuItemRadio>
          <MenuItemRadio name="size" value="medium">
            {SIZE_LABELS.medium}
          </MenuItemRadio>
          <MenuItemRadio name="size" value="large">
            {SIZE_LABELS.large}
          </MenuItemRadio>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default CardSizeMenu;
