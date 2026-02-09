// ============================================
// Placeholder Card
// Shows a preview of unbuilt cards with metadata
// Supports mini, medium, and large sizes
// ============================================

import * as React from 'react';
import {
  Text,
  Badge,
  tokens,
  makeStyles,
  mergeClasses,
  Tooltip,
} from '@fluentui/react-components';
import {
  Sparkle20Regular,
  Database20Regular,
  Info20Regular,
  Clock20Regular,
} from '@fluentui/react-icons';
import {
  CardRegistration,
  CardCategoryMeta,
  LicenseTierMeta,
  CardSize,
} from '../../../models/CardCatalog';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  // Base card container
  // Height is controlled by the grid cell via CategorySection.module.scss
  // (.cardWrapper > * { height: 100%; max-height: none !important; })
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',      // Fill the grid cell
    minHeight: 0,        // Allow shrinking to fit grid cell
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow4,
    overflow: 'hidden',
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: tokens.durationNormal,
    ':hover': {
      boxShadow: tokens.shadow8,
    },
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingHorizontalM,
    flexShrink: 0,
  },

  headerMini: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  },

  categoryIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    flexShrink: 0,
  },

  categoryIconMini: {
    width: '24px',
    height: '24px',
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },

  cardName: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  cardNameMini: {
    fontSize: tokens.fontSizeBase300,
  },

  categoryLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  // Impact rating
  impactBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
  },

  impactDots: {
    display: 'flex',
    gap: '2px',
  },

  impactDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralStroke2,
  },

  impactDotFilled: {
    backgroundColor: tokens.colorBrandBackground,
  },

  // Content area
  content: {
    flex: 1,
    padding: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalM}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    minHeight: 0,
  },

  description: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: 1.4,
  },

  keyValue: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },

  // Skeleton preview area
  skeletonArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalL,
    minHeight: '100px',
  },

  skeletonContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    textAlign: 'center',
  },

  skeletonIcon: {
    fontSize: '32px',
    color: tokens.colorNeutralForeground4,
    opacity: 0.5,
  },

  skeletonText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground4,
  },

  // Meta section
  metaSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },

  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  metaIcon: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground4,
  },

  // Data sources list
  dataSourcesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
  },

  dataSourceBadge: {
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },

  // Coming soon indicator
  comingSoonBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    backgroundColor: tokens.colorPaletteYellowBackground1,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorPaletteYellowForeground2,
  },

  // Intelligence enrichment
  intelligenceRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorPalettePurpleBackground2,
    borderRadius: tokens.borderRadiusSmall,
  },

  intelligenceIcon: {
    color: tokens.colorPalettePurpleForeground2,
    flexShrink: 0,
    marginTop: '2px',
  },

  intelligenceText: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorPalettePurpleForeground2,
    lineHeight: 1.4,
  },

  // Footer
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },

  tierBadge: {
    fontSize: tokens.fontSizeBase100,
  },
});

// ============================================
// Props Interface
// ============================================
interface PlaceholderCardProps {
  card: CardRegistration;
  size: CardSize;
  onRequestInfo?: (cardId: string) => void;
}

// ============================================
// Component
// ============================================
export const PlaceholderCard: React.FC<PlaceholderCardProps> = ({
  card,
  size,
  onRequestInfo,
}) => {
  const styles = useStyles();
  const categoryMeta = CardCategoryMeta[card.category];
  const tierMeta = LicenseTierMeta[card.minimumTier];

  // Render impact dots
  const renderImpactDots = () => {
    const dots = [];
    for (let i = 1; i <= 10; i++) {
      dots.push(
        <div
          key={i}
          className={mergeClasses(
            styles.impactDot,
            i <= card.impactRating && styles.impactDotFilled
          )}
        />
      );
    }
    return dots;
  };

  // Mini card (compact)
  if (size === 'small') {
    return (
      <div className={styles.card}>
        <div className={mergeClasses(styles.header, styles.headerMini)}>
          <div
            className={mergeClasses(styles.categoryIcon, styles.categoryIconMini)}
            style={{ backgroundColor: categoryMeta.color + '20' }}
          >
            <Text style={{ color: categoryMeta.color, fontSize: '14px' }}>
              #{card.catalogNumber}
            </Text>
          </div>
          <div className={styles.headerContent}>
            <Text className={mergeClasses(styles.cardName, styles.cardNameMini)}>
              {card.name}
            </Text>
            <Text className={styles.categoryLabel}>{categoryMeta.displayName}</Text>
          </div>
          <Tooltip content={`Impact: ${card.impactRating}/10`} relationship="label">
            <div className={styles.impactBadge}>
              <div className={styles.impactDots}>{renderImpactDots()}</div>
            </div>
          </Tooltip>
        </div>
        <div className={styles.footer}>
          <span className={styles.comingSoonBadge}>
            <Clock20Regular style={{ fontSize: '12px' }} />
            Coming soon
          </span>
          <Badge
            appearance="outline"
            color="informative"
            className={styles.tierBadge}
          >
            {tierMeta.displayName}
          </Badge>
        </div>
      </div>
    );
  }

  // Medium card
  if (size === 'medium') {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div
            className={styles.categoryIcon}
            style={{ backgroundColor: categoryMeta.color + '20' }}
          >
            <Text style={{ color: categoryMeta.color, fontWeight: 600 }}>
              #{card.catalogNumber}
            </Text>
          </div>
          <div className={styles.headerContent}>
            <Text className={styles.cardName}>{card.name}</Text>
            <Text className={styles.categoryLabel}>{categoryMeta.displayName}</Text>
          </div>
          <Tooltip content={`Impact: ${card.impactRating}/10`} relationship="label">
            <div className={styles.impactBadge}>
              <div className={styles.impactDots}>{renderImpactDots()}</div>
              <Text style={{ marginLeft: tokens.spacingHorizontalXS }}>
                {card.impactRating}/10
              </Text>
            </div>
          </Tooltip>
        </div>

        <div className={styles.content}>
          <Text className={styles.description}>{card.description}</Text>

          <div className={styles.skeletonArea}>
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonIcon}>📊</div>
              <Text className={styles.skeletonText}>
                Visualisation preview
              </Text>
            </div>
          </div>

          {card.intelligenceEnrichment && (
            <div className={styles.intelligenceRow}>
              <Sparkle20Regular className={styles.intelligenceIcon} />
              <Text className={styles.intelligenceText}>
                <strong>With Intelligence:</strong> {card.intelligenceEnrichment}
              </Text>
            </div>
          )}
        </div>

        <div className={styles.metaSection}>
          {card.dataSources && card.dataSources.length > 0 && (
            <div className={styles.metaRow}>
              <Database20Regular className={styles.metaIcon} />
              <div className={styles.dataSourcesList}>
                {card.dataSources.map((source, idx) => (
                  <span key={idx} className={styles.dataSourceBadge}>
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.comingSoonBadge}>
            <Clock20Regular style={{ fontSize: '14px' }} />
            In development
          </span>
          <Badge appearance="outline" color="informative">
            Requires {tierMeta.displayName}
          </Badge>
        </div>
      </div>
    );
  }

  // Large card
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div
          className={styles.categoryIcon}
          style={{ backgroundColor: categoryMeta.color + '20' }}
        >
          <Text style={{ color: categoryMeta.color, fontWeight: 600 }}>
            #{card.catalogNumber}
          </Text>
        </div>
        <div className={styles.headerContent}>
          <Text className={styles.cardName}>{card.name}</Text>
          <Text className={styles.categoryLabel}>{categoryMeta.displayName}</Text>
        </div>
        <Tooltip content={`Impact: ${card.impactRating}/10`} relationship="label">
          <div className={styles.impactBadge}>
            <div className={styles.impactDots}>{renderImpactDots()}</div>
            <Text style={{ marginLeft: tokens.spacingHorizontalXS }}>
              {card.impactRating}/10
            </Text>
          </div>
        </Tooltip>
      </div>

      <div className={styles.content}>
        <Text className={styles.description}>{card.description}</Text>

        <Text className={styles.keyValue}>
          <strong>Key value:</strong> {card.keyValue}
        </Text>

        <div className={styles.skeletonArea} style={{ minHeight: '200px' }}>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonIcon}>📊</div>
            <Text className={styles.skeletonText}>
              Full data visualisation will appear here
            </Text>
            <Text className={styles.skeletonText} style={{ opacity: 0.6 }}>
              Charts, tables, and detailed insights
            </Text>
          </div>
        </div>

        {card.intelligenceEnrichment && (
          <div className={styles.intelligenceRow}>
            <Sparkle20Regular className={styles.intelligenceIcon} />
            <Text className={styles.intelligenceText}>
              <strong>With Intelligence Add-on:</strong> {card.intelligenceEnrichment}
            </Text>
          </div>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className={styles.dataSourcesList}>
            {card.tags.map((tag, idx) => (
              <Badge key={idx} appearance="outline" size="small">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className={styles.metaSection}>
        {card.dataSources && card.dataSources.length > 0 && (
          <div className={styles.metaRow}>
            <Database20Regular className={styles.metaIcon} />
            <Text>Data sources:</Text>
            <div className={styles.dataSourcesList}>
              {card.dataSources.map((source, idx) => (
                <span key={idx} className={styles.dataSourceBadge}>
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className={styles.metaRow}>
          <Info20Regular className={styles.metaIcon} />
          <Text>Card #{card.catalogNumber} in the Throughline catalog</Text>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.comingSoonBadge}>
          <Clock20Regular style={{ fontSize: '14px' }} />
          Placeholder — In development
        </span>
        <Badge appearance="outline" color="informative">
          Requires {tierMeta.displayName} · {tierMeta.price}
        </Badge>
      </div>
    </div>
  );
};

export default PlaceholderCard;
