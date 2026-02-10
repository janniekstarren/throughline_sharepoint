// ============================================
// AdaptiveCardSurface - Weight-Driven Card Wrapper
// ============================================
// Wraps every card in the grid, applying visual treatment based on
// the card's computed VisualWeight. When adaptive rendering is
// disabled, renders a uniform standard surface.

import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { VisualWeight } from '../../models/VisualWeight';
import { CardCategory } from '../../models/CardCatalog';
import { useAdaptiveShadowStyles } from '../../styles/adaptiveShadows';

// ============================================
// Props
// ============================================

export interface IAdaptiveCardSurfaceProps {
  /** Computed visual weight for this card */
  weight: VisualWeight;
  /** Card category (for accent border on Active cards) */
  category?: CardCategory;
  /** Whether adaptive rendering is enabled (admin + user flags) */
  isAdaptiveEnabled: boolean;
  /** Card content */
  children: React.ReactNode;
}

// ============================================
// Component
// ============================================

export const AdaptiveCardSurface: React.FC<IAdaptiveCardSurfaceProps> = ({
  weight,
  category,
  isAdaptiveEnabled,
  children,
}) => {
  const styles = useAdaptiveShadowStyles();
  const [isHovered, setIsHovered] = React.useState(false);

  // Build the className based on weight and adaptive state
  const className = React.useMemo(() => {
    if (!isAdaptiveEnabled) {
      // Uniform rendering — no adaptive treatment
      return mergeClasses(
        styles.uniform,
        isHovered && styles.uniformHover
      );
    }

    // Adaptive rendering — apply weight-driven styles
    switch (weight) {
      case VisualWeight.Critical:
        return mergeClasses(
          styles.critical,
          isHovered && styles.criticalHover
        );

      case VisualWeight.Warning:
        return mergeClasses(
          styles.warning,
          isHovered && styles.warningHover
        );

      case VisualWeight.Active: {
        const accentClass = category ? getCategoryAccentClass(category, styles) : undefined;
        return mergeClasses(
          styles.active,
          accentClass,
          isHovered && styles.activeHover
        );
      }

      case VisualWeight.Quiet:
        return mergeClasses(
          styles.quiet,
          isHovered && styles.quietHover
        );

      case VisualWeight.Placeholder:
        return mergeClasses(
          styles.placeholder,
          isHovered && styles.placeholderHover
        );

      default:
        return mergeClasses(
          styles.active,
          isHovered && styles.activeHover
        );
    }
  }, [isAdaptiveEnabled, weight, category, isHovered, styles]);

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-visual-weight={isAdaptiveEnabled ? weight : undefined}
      style={{
        borderRadius: 'inherit',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
};

AdaptiveCardSurface.displayName = 'AdaptiveCardSurface';

// ============================================
// Helpers
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCategoryAccentClass(category: CardCategory, styles: any): string | undefined {
  switch (category) {
    case CardCategory.ImmediateAction:
      return styles.accentImmediateAction;
    case CardCategory.ProductivityPatterns:
      return styles.accentProductivityPatterns;
    case CardCategory.KnowledgeManagement:
      return styles.accentKnowledgeManagement;
    case CardCategory.CollaborationHealth:
      return styles.accentCollaborationHealth;
    case CardCategory.ManagerToolkit:
      return styles.accentManagerToolkit;
    case CardCategory.GovernanceCompliance:
      return styles.accentGovernanceCompliance;
    default:
      return undefined;
  }
}
