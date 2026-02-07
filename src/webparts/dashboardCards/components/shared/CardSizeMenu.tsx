// ============================================
// CardSizeMenu - Size selection dropdown menu
// Uses Fabric UI v8 ContextualMenu (native SharePoint support)
// ============================================

import * as React from 'react';
import { useRef, useState, useCallback } from 'react';
import {
  IContextualMenuProps,
  IContextualMenuItem,
  ContextualMenu,
  DirectionalHint,
  TooltipHost,
} from '@fluentui/react';
import { GridDotsRegular } from '@fluentui/react-icons';
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

// Size labels for display
const SIZE_LABELS: Record<CardSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

export const CardSizeMenu: React.FC<ICardSizeMenuProps> = ({
  currentSize,
  onSizeChange,
  tooltip,
  ariaLabel = 'Change card size',
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't render if onSizeChange is not provided
  if (!onSizeChange) {
    return null;
  }

  const handleMenuItemClick = useCallback(
    (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, item?: IContextualMenuItem): void => {
      if (item?.key) {
        const newSize = item.key as CardSize;
        if (newSize !== currentSize) {
          onSizeChange(newSize);
        }
      }
      setIsMenuOpen(false);
    },
    [currentSize, onSizeChange]
  );

  const menuItems: IContextualMenuItem[] = [
    {
      key: 'small',
      text: SIZE_LABELS.small,
      canCheck: true,
      isChecked: currentSize === 'small',
      onClick: handleMenuItemClick,
    },
    {
      key: 'medium',
      text: SIZE_LABELS.medium,
      canCheck: true,
      isChecked: currentSize === 'medium',
      onClick: handleMenuItemClick,
    },
    {
      key: 'large',
      text: SIZE_LABELS.large,
      canCheck: true,
      isChecked: currentSize === 'large',
      onClick: handleMenuItemClick,
    },
  ];

  const menuProps: IContextualMenuProps = {
    items: menuItems,
    directionalHint: DirectionalHint.bottomRightEdge,
    gapSpace: 4,
    isBeakVisible: false,
    onDismiss: () => setIsMenuOpen(false),
    // Force render in Layer at document.body to escape card's overflow:hidden
    useTargetAsMinWidth: false,
    calloutProps: {
      isBeakVisible: false,
      styles: {
        root: {
          zIndex: 1000001,
        },
      },
    },
  };

  const tooltipContent = tooltip || `Size: ${SIZE_LABELS[currentSize]}`;

  return (
    <div ref={buttonRef} style={{ display: 'inline-block' }}>
      <TooltipHost content={tooltipContent}>
        <button
          aria-label={ariaLabel}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'inherit',
          }}
        >
          <GridDotsRegular />
        </button>
      </TooltipHost>
      {isMenuOpen && buttonRef.current && (
        <ContextualMenu
          {...menuProps}
          target={buttonRef.current}
        />
      )}
    </div>
  );
};

export default CardSizeMenu;
