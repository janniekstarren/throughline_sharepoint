// ============================================
// CardSizeMenu - Size selection dropdown menu
// Uses pure CSS dropdown to avoid React Error #310 in SharePoint
// ============================================

import * as React from 'react';
import { useRef, useState, useCallback, useEffect } from 'react';
import { GridDotsRegular, Checkmark16Regular } from '@fluentui/react-icons';
import { CardSize } from '../../types/CardSize';
import styles from './CardSizeMenu.module.scss';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleSizeClick = useCallback(
    (size: CardSize) => {
      if (size !== currentSize && onSizeChange) {
        onSizeChange(size);
      }
      setIsMenuOpen(false);
    },
    [currentSize, onSizeChange]
  );

  // Don't render if onSizeChange is not provided - MUST be after all hooks
  if (!onSizeChange) {
    return null;
  }

  const tooltipContent = tooltip || `Size: ${SIZE_LABELS[currentSize]}`;

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        className={styles.triggerButton}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        title={tooltipContent}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <GridDotsRegular />
      </button>

      {isMenuOpen && (
        <div className={styles.dropdown} role="menu">
          {(['small', 'medium', 'large'] as CardSize[]).map((size) => (
            <button
              key={size}
              className={`${styles.menuItem} ${currentSize === size ? styles.menuItemActive : ''}`}
              role="menuitem"
              aria-checked={currentSize === size}
              onClick={() => handleSizeClick(size)}
            >
              <span className={styles.checkmark}>
                {currentSize === size && <Checkmark16Regular />}
              </span>
              <span>{SIZE_LABELS[size]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardSizeMenu;
