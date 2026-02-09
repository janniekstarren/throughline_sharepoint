// ============================================
// CardContextMenu - Right-click / overflow menu for card actions
// Pin/hide/view size/card details
// ============================================

import * as React from 'react';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
} from '@fluentui/react-components';
import {
  MoreHorizontal20Regular,
  Pin20Regular,
  PinOff20Regular,
  Eye20Regular,
  EyeOff20Regular,
  Info20Regular,
  ResizeLarge20Regular,
  ResizeSmall20Regular,
} from '@fluentui/react-icons';
import { useFeatureFlags } from '../../context/FeatureFlagContext';

// ============================================
// Props
// ============================================

interface CardContextMenuProps {
  cardId: string;
  cardName: string;
  isPinned: boolean;
  isHidden: boolean;
  onTogglePin: () => void;
  onToggleHide: () => void;
  onViewMedium?: () => void;
  onViewLarge?: () => void;
  onShowInfo?: () => void;
}

// ============================================
// Component
// ============================================

export const CardContextMenu: React.FC<CardContextMenuProps> = ({
  isPinned,
  isHidden,
  onTogglePin,
  onToggleHide,
  onViewMedium,
  onViewLarge,
  onShowInfo,
}) => {
  const flags = useFeatureFlags();

  return (
    <Menu>
      <MenuTrigger>
        <Button
          appearance="subtle"
          icon={<MoreHorizontal20Regular />}
          size="small"
          aria-label="Card actions"
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {flags.allowCardPinning && (
            <MenuItem
              icon={isPinned ? <PinOff20Regular /> : <Pin20Regular />}
              onClick={onTogglePin}
            >
              {isPinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
            </MenuItem>
          )}
          {flags.allowCardHiding && (
            <MenuItem
              icon={isHidden ? <Eye20Regular /> : <EyeOff20Regular />}
              onClick={onToggleHide}
            >
              {isHidden ? 'Show card' : 'Hide card'}
            </MenuItem>
          )}
          {(flags.allowCardPinning || flags.allowCardHiding) && (onViewMedium || onViewLarge || onShowInfo) && (
            <MenuDivider />
          )}
          {onViewMedium && (
            <MenuItem
              icon={<ResizeSmall20Regular />}
              onClick={onViewMedium}
            >
              View medium
            </MenuItem>
          )}
          {onViewLarge && (
            <MenuItem
              icon={<ResizeLarge20Regular />}
              onClick={onViewLarge}
            >
              View large
            </MenuItem>
          )}
          {(onViewMedium || onViewLarge) && onShowInfo && <MenuDivider />}
          {onShowInfo && (
            <MenuItem
              icon={<Info20Regular />}
              onClick={onShowInfo}
            >
              Card details
            </MenuItem>
          )}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

export default CardContextMenu;
