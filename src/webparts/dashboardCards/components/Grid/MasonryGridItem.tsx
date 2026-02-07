// ============================================
// MasonryGridItem - Individual Card Wrapper
// ============================================
// Wraps each card with absolute positioning and CSS transitions.
// Handles animation states for enter, move, and exit.

import * as React from 'react';
import { IMasonryPosition } from '../../services/MasonryLayoutEngine';
import styles from './MasonryGrid.module.scss';

/**
 * Animation state for the grid item
 */
export type ItemAnimationState = 'entering' | 'entered' | 'exiting' | 'exited';

/**
 * Props for MasonryGridItem
 */
export interface IMasonryGridItemProps {
  /** Unique item ID */
  id: string;
  /** Position data from layout engine */
  position: IMasonryPosition;
  /** Whether animations are enabled */
  animationsEnabled?: boolean;
  /** Callback to register element for height measurement */
  onRegister?: (id: string, element: HTMLElement | null) => void;
  /** Child content (the card) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom style overrides */
  style?: React.CSSProperties;
}

/**
 * MasonryGridItem Component
 * Positions a card within the masonry grid using CSS transforms.
 */
export const MasonryGridItem: React.FC<IMasonryGridItemProps> = ({
  id,
  position,
  animationsEnabled = true,
  onRegister,
  children,
  className,
  style,
}) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [animationState, setAnimationState] = React.useState<ItemAnimationState>('entering');
  const prevPositionRef = React.useRef<{ x: number; y: number } | null>(null);

  // Register element for height measurement
  React.useEffect(() => {
    if (onRegister && elementRef.current) {
      onRegister(id, elementRef.current);
    }

    return () => {
      if (onRegister) {
        onRegister(id, null);
      }
    };
  }, [id, onRegister]);

  // Handle animation state transitions
  React.useEffect(() => {
    if (!animationsEnabled) {
      setAnimationState('entered');
      return;
    }

    // Initial enter animation
    if (animationState === 'entering') {
      // Use requestAnimationFrame to ensure the entering state is rendered first
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationState('entered');
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [animationsEnabled, animationState]);

  // Track position changes for move detection
  React.useEffect(() => {
    const prevPos = prevPositionRef.current;
    if (prevPos && (prevPos.x !== position.x || prevPos.y !== position.y)) {
      // Position changed - item moved
      // The CSS transition will handle the animation
    }
    prevPositionRef.current = { x: position.x, y: position.y };
  }, [position.x, position.y]);

  // Calculate transform style
  const transformStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: position.width,
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    // Use will-change for better performance during animations
    willChange: animationsEnabled ? 'transform, opacity' : 'auto',
    ...style,
  };

  // Build className
  const itemClassName = [
    styles.masonryGridItem,
    animationsEnabled && styles.animated,
    animationsEnabled && animationState === 'entering' && styles.entering,
    animationsEnabled && animationState === 'entered' && styles.entered,
    animationsEnabled && animationState === 'exiting' && styles.exiting,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={elementRef}
      className={itemClassName}
      style={transformStyle}
      data-masonry-id={id}
    >
      {children}
    </div>
  );
};

export default MasonryGridItem;
