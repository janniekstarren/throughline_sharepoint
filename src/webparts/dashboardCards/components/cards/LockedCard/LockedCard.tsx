// ============================================
// Locked Card Overlay
// Shows a frosted glass overlay for cards that require
// a higher license tier to access
// ============================================

import * as React from 'react';
import {
  Text,
  Button,
  tokens,
  makeStyles,
  mergeClasses,
} from '@fluentui/react-components';
import {
  LockClosed20Regular,
  ArrowUpRight20Regular,
} from '@fluentui/react-icons';
import {
  CardRegistration,
  LicenseTier,
  LicenseTierMeta,
  CardSize,
} from '../../../models/CardCatalog';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  // Wrapper that contains both the card and overlay
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },

  // Size variants for wrapper
  wrapperMini: {
    height: '120px',
    minHeight: '120px',
    maxHeight: '120px',
  },

  wrapperMedium: {
    height: '480px',
    minHeight: '480px',
    maxHeight: '480px',
  },

  wrapperLarge: {
    height: '720px',
    minHeight: '720px',
    maxHeight: '720px',
  },

  // Blurred card content behind overlay
  blurredContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow4,
    overflow: 'hidden',
    filter: 'blur(4px)',
    opacity: 0.6,
  },

  // Skeleton content for blurred background
  skeletonHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingHorizontalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },

  skeletonIcon: {
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
  },

  skeletonLines: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },

  skeletonLine: {
    height: '12px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
  },

  skeletonLineShort: {
    width: '60%',
  },

  skeletonBody: {
    flex: 1,
    padding: tokens.spacingHorizontalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },

  skeletonChart: {
    flex: 1,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    minHeight: '80px',
  },

  // Frosted glass overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(8px)',
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: tokens.shadow4,
    padding: tokens.spacingHorizontalL,
    textAlign: 'center',
    zIndex: 1,
  },

  // Lock icon container
  lockIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralBackground3,
  },

  lockIconContainerMini: {
    width: '32px',
    height: '32px',
  },

  lockIcon: {
    fontSize: '24px',
    color: tokens.colorNeutralForeground3,
  },

  lockIconMini: {
    fontSize: '16px',
  },

  // Card name
  cardName: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  cardNameMini: {
    fontSize: tokens.fontSizeBase300,
  },

  // Tier requirement badge
  tierBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },

  tierBadgeMini: {
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    fontSize: tokens.fontSizeBase100,
  },

  // Price info
  priceText: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  // Upgrade button
  upgradeButton: {
    marginTop: tokens.spacingVerticalS,
  },

  // Description (hidden in mini)
  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    maxWidth: '280px',
    lineHeight: 1.4,
  },
});

// ============================================
// Props Interface
// ============================================
interface LockedCardProps {
  card: CardRegistration;
  size: CardSize;
  currentTier: LicenseTier;
  onUpgradeClick?: () => void;
}

// ============================================
// Component
// ============================================
export const LockedCard: React.FC<LockedCardProps> = ({
  card,
  size,
  currentTier,
  onUpgradeClick,
}) => {
  const styles = useStyles();
  const requiredTierMeta = LicenseTierMeta[card.minimumTier];
  const currentTierMeta = LicenseTierMeta[currentTier];

  // Mini card (compact overlay)
  if (size === 'small') {
    return (
      <div className={mergeClasses(styles.wrapper, styles.wrapperMini)}>
        {/* Blurred background */}
        <div className={styles.blurredContent}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonLines}>
              <div className={styles.skeletonLine} />
              <div className={mergeClasses(styles.skeletonLine, styles.skeletonLineShort)} />
            </div>
          </div>
        </div>

        {/* Overlay */}
        <div className={styles.overlay}>
          <div className={mergeClasses(styles.lockIconContainer, styles.lockIconContainerMini)}>
            <LockClosed20Regular className={mergeClasses(styles.lockIcon, styles.lockIconMini)} />
          </div>
          <Text className={mergeClasses(styles.cardName, styles.cardNameMini)}>
            {card.name}
          </Text>
          <span className={mergeClasses(styles.tierBadge, styles.tierBadgeMini)}>
            Requires {requiredTierMeta.displayName}
          </span>
        </div>
      </div>
    );
  }

  // Medium card
  if (size === 'medium') {
    return (
      <div className={mergeClasses(styles.wrapper, styles.wrapperMedium)}>
        {/* Blurred background */}
        <div className={styles.blurredContent}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonLines}>
              <div className={styles.skeletonLine} />
              <div className={mergeClasses(styles.skeletonLine, styles.skeletonLineShort)} />
            </div>
          </div>
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} />
            <div className={mergeClasses(styles.skeletonLine, styles.skeletonLineShort)} />
            <div className={styles.skeletonChart} />
          </div>
        </div>

        {/* Overlay */}
        <div className={styles.overlay}>
          <div className={styles.lockIconContainer}>
            <LockClosed20Regular className={styles.lockIcon} />
          </div>
          <Text className={styles.cardName}>{card.name}</Text>
          <Text className={styles.description}>{card.description}</Text>
          <span className={styles.tierBadge}>
            <LockClosed20Regular style={{ fontSize: '14px' }} />
            Requires {requiredTierMeta.displayName} · {requiredTierMeta.price}
          </span>
          {onUpgradeClick && (
            <Button
              appearance="primary"
              size="small"
              icon={<ArrowUpRight20Regular />}
              iconPosition="after"
              className={styles.upgradeButton}
              onClick={onUpgradeClick}
            >
              Upgrade from {currentTierMeta.displayName}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Large card
  return (
    <div className={mergeClasses(styles.wrapper, styles.wrapperLarge)}>
      {/* Blurred background */}
      <div className={styles.blurredContent}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} />
            <div className={mergeClasses(styles.skeletonLine, styles.skeletonLineShort)} />
          </div>
        </div>
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonLine} />
          <div className={mergeClasses(styles.skeletonLine, styles.skeletonLineShort)} />
          <div className={styles.skeletonChart} style={{ minHeight: '200px' }} />
          <div className={styles.skeletonLine} />
        </div>
      </div>

      {/* Overlay */}
      <div className={styles.overlay}>
        <div className={styles.lockIconContainer}>
          <LockClosed20Regular className={styles.lockIcon} />
        </div>
        <Text className={styles.cardName}>{card.name}</Text>
        <Text className={styles.description}>
          {card.description}
        </Text>
        <Text className={styles.description} style={{ marginTop: tokens.spacingVerticalXS }}>
          <strong>Key value:</strong> {card.keyValue}
        </Text>
        <span className={styles.tierBadge}>
          <LockClosed20Regular style={{ fontSize: '14px' }} />
          Requires {requiredTierMeta.displayName} · {requiredTierMeta.price}
        </span>
        <Text className={styles.priceText}>
          You are currently on {currentTierMeta.displayName}
          {currentTierMeta.priceNumeric > 0 && ` (${currentTierMeta.price})`}
        </Text>
        {onUpgradeClick && (
          <Button
            appearance="primary"
            icon={<ArrowUpRight20Regular />}
            iconPosition="after"
            className={styles.upgradeButton}
            onClick={onUpgradeClick}
          >
            Upgrade to {requiredTierMeta.displayName}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LockedCard;
