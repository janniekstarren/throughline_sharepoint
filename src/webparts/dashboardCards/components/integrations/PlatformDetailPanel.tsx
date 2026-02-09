// ============================================
// PlatformDetailPanel — Expanded view for a single platform
// Shows unlocked cards, enriched cards, config form, and actions
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Button,
  Divider,
} from '@fluentui/react-components';
import {
  PlugConnected20Regular,
  PlugDisconnected20Regular,
  ArrowLeft20Regular,
  ArrowRight16Regular,
  Add16Regular,
  ChevronDown16Regular,
  ChevronRight16Regular,
} from '@fluentui/react-icons';
import {
  PlatformRegistration,
  ConnectionStatus,
  PlatformStatus,
  IntegrationCategoryMeta,
} from '../../models/Integration';
import { LicenseTier, LicenseTierMeta } from '../../models/CardCatalog';
import { CARD_REGISTRY } from '../../config/cardRegistry';
import { getEnrichmentDescription } from '../../config/enrichmentDescriptions';
import { getPlatformIconPath } from '../../config/platformIcons';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';
import { ConnectionConfigForm } from './ConnectionConfigForm';

const useStyles = makeStyles({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  platformIcon: {
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  platformSvgIcon: {
    width: '26px',
    height: '26px',
    fill: tokens.colorBrandForeground1,
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  cardItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
    overflow: 'hidden',
  },
  cardItemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationFaster,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },
  cardItemIcon: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
  },
  cardItemContent: {
    flex: 1,
    minWidth: 0,
  },
  cardItemChevron: {
    flexShrink: 0,
    color: tokens.colorNeutralForeground4,
    transitionProperty: 'transform',
    transitionDuration: tokens.durationFaster,
  },
  cardItemExpanded: {
    padding: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalS}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  cardDescription: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.4',
  },
  enrichmentDescription: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
  },
  cardMeta: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  infoRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalL,
    flexWrap: 'wrap',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  infoLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    textTransform: 'uppercase',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
});

interface PlatformDetailPanelProps {
  platform: PlatformRegistration;
  connectionStatus: ConnectionStatus;
  currentTier: LicenseTier;
  allowConnect: boolean;
  onBack: () => void;
  onConnect: (configValues: Record<string, string>) => void;
  onDisconnect: () => void;
}

export const PlatformDetailPanel: React.FC<PlatformDetailPanelProps> = ({
  platform,
  connectionStatus,
  currentTier,
  allowConnect,
  onBack,
  onConnect,
  onDisconnect,
}) => {
  const classes = useStyles();
  const [showConfigForm, setShowConfigForm] = React.useState(false);
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());

  const isConnected = connectionStatus === ConnectionStatus.Connected;
  const isLocked = LicenseTierMeta[currentTier].sortOrder < LicenseTierMeta[platform.minimumTier].sortOrder;
  const isAvailable = platform.status === PlatformStatus.Available;
  const canConnect = isAvailable && !isLocked && allowConnect && !isConnected;

  const categoryMeta = IntegrationCategoryMeta[platform.category];
  const initials = platform.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const iconPath = getPlatformIconPath(platform.id);

  // Resolve card from registry
  const resolveCard = (cardId: string) => {
    return CARD_REGISTRY.find(c => c.id === cardId);
  };

  // Resolve card names from IDs
  const resolveCardName = (cardId: string): string => {
    const card = resolveCard(cardId);
    return card?.name ?? cardId;
  };

  // Toggle expand/collapse of a card item
  const toggleCardExpanded = React.useCallback((cardId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  return (
    <div className={classes.panel}>
      <Button
        appearance="subtle"
        icon={<ArrowLeft20Regular />}
        className={classes.backButton}
        onClick={onBack}
      >
        Back to all integrations
      </Button>

      {/* Header */}
      <div className={classes.header}>
        <div className={classes.platformIcon}>
          {iconPath ? (
            <svg
              className={classes.platformSvgIcon}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d={iconPath} />
            </svg>
          ) : (
            initials
          )}
        </div>
        <div className={classes.headerInfo}>
          <Text weight="bold" size={500}>{platform.name}</Text>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            {platform.vendor} — {categoryMeta.displayName}
          </Text>
          <IntegrationStatusBadge
            connectionStatus={connectionStatus}
            platformStatus={platform.status}
          />
        </div>
      </div>

      <Text size={300}>{platform.description}</Text>

      {/* Info row */}
      <div className={classes.infoRow}>
        <div className={classes.infoItem}>
          <span className={classes.infoLabel}>Auth type</span>
          <Text size={200}>{platform.authType}</Text>
        </div>
        <div className={classes.infoItem}>
          <span className={classes.infoLabel}>Connector</span>
          <Text size={200}>{platform.connectorType}</Text>
        </div>
        <div className={classes.infoItem}>
          <span className={classes.infoLabel}>Min. tier</span>
          <Text size={200}>{LicenseTierMeta[platform.minimumTier].displayName}</Text>
        </div>
      </div>

      <Divider />

      {/* Mode 1: Unlocked Cards */}
      {platform.unlockedCardIds.length > 0 && (
        <div className={classes.section}>
          <div className={classes.sectionTitle}>
            <ArrowRight16Regular />
            <Text weight="semibold" size={300}>
              Cards Unlocked ({platform.unlockedCardIds.length})
            </Text>
            <Badge appearance="filled" color="success" size="small">Mode 1</Badge>
          </div>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            These new cards appear on your dashboard when this integration is connected.
          </Text>
          <div className={classes.cardList}>
            {platform.unlockedCardIds.map(cardId => {
              const cardReg = resolveCard(cardId);
              const isExpanded = expandedCards.has(cardId);
              return (
                <div key={cardId} className={classes.cardItem}>
                  <div
                    className={classes.cardItemHeader}
                    onClick={() => toggleCardExpanded(cardId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCardExpanded(cardId); } }}
                    aria-expanded={isExpanded}
                  >
                    <Add16Regular className={classes.cardItemIcon} />
                    <div className={classes.cardItemContent}>
                      <Text size={200} weight="semibold">{resolveCardName(cardId)}</Text>
                    </div>
                    {isExpanded
                      ? <ChevronDown16Regular className={classes.cardItemChevron} />
                      : <ChevronRight16Regular className={classes.cardItemChevron} />
                    }
                  </div>
                  {isExpanded && cardReg && (
                    <div className={classes.cardItemExpanded}>
                      <Text className={classes.cardDescription}>{cardReg.description}</Text>
                      <div className={classes.cardMeta}>
                        {cardReg.impactRating && (
                          <Badge appearance="outline" size="small">
                            Impact: {cardReg.impactRating}/10
                          </Badge>
                        )}
                        <Badge appearance="outline" size="small" color="informative">
                          {LicenseTierMeta[cardReg.minimumTier].displayName}
                        </Badge>
                        {cardReg.dataSources?.map((ds, i) => (
                          <Badge key={i} appearance="tint" size="small">{ds}</Badge>
                        ))}
                      </div>
                      {cardReg.keyValue && (
                        <Text size={100} style={{ color: tokens.colorNeutralForeground3, fontStyle: 'italic' }}>
                          Key value: {cardReg.keyValue}
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Enriched Cards */}
      {platform.enrichedCardIds.length > 0 && (
        <div className={classes.section}>
          <div className={classes.sectionTitle}>
            <PlugConnected20Regular />
            <Text weight="semibold" size={300}>
              Existing Cards Enriched ({platform.enrichedCardIds.length})
            </Text>
            <Badge appearance="tint" color="informative" size="small">Mode 2</Badge>
          </div>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            These existing M365 cards gain additional signals from this integration.
          </Text>
          <div className={classes.cardList}>
            {platform.enrichedCardIds.map(cardId => {
              const cardReg = resolveCard(cardId);
              const isExpanded = expandedCards.has(cardId);
              return (
                <div key={cardId} className={classes.cardItem}>
                  <div
                    className={classes.cardItemHeader}
                    onClick={() => toggleCardExpanded(cardId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCardExpanded(cardId); } }}
                    aria-expanded={isExpanded}
                  >
                    <PlugConnected20Regular className={classes.cardItemIcon} style={{ fontSize: '16px' }} />
                    <div className={classes.cardItemContent}>
                      <Text size={200} weight="semibold">{resolveCardName(cardId)}</Text>
                      <Text className={classes.enrichmentDescription}>
                        {getEnrichmentDescription(platform.id, cardId)}
                      </Text>
                    </div>
                    {isExpanded
                      ? <ChevronDown16Regular className={classes.cardItemChevron} />
                      : <ChevronRight16Regular className={classes.cardItemChevron} />
                    }
                  </div>
                  {isExpanded && cardReg && (
                    <div className={classes.cardItemExpanded}>
                      <Text className={classes.cardDescription}>{cardReg.description}</Text>
                      <div className={classes.cardMeta}>
                        {cardReg.impactRating && (
                          <Badge appearance="outline" size="small">
                            Impact: {cardReg.impactRating}/10
                          </Badge>
                        )}
                        <Badge appearance="outline" size="small" color="informative">
                          {LicenseTierMeta[cardReg.minimumTier].displayName}
                        </Badge>
                        {cardReg.dataSources?.map((ds, i) => (
                          <Badge key={i} appearance="tint" size="small">{ds}</Badge>
                        ))}
                      </div>
                      {cardReg.keyValue && (
                        <Text size={100} style={{ color: tokens.colorNeutralForeground3, fontStyle: 'italic' }}>
                          Key value: {cardReg.keyValue}
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Divider />

      {/* Actions */}
      {showConfigForm ? (
        <ConnectionConfigForm
          platform={platform}
          onConnect={(configValues) => {
            onConnect(configValues);
            setShowConfigForm(false);
          }}
          onCancel={() => setShowConfigForm(false)}
        />
      ) : (
        <div className={classes.actions}>
          {canConnect && (
            <Button
              appearance="primary"
              icon={<PlugConnected20Regular />}
              onClick={() => {
                if (platform.configFields?.length) {
                  setShowConfigForm(true);
                } else {
                  onConnect({});
                }
              }}
            >
              Connect {platform.name}
            </Button>
          )}
          {isConnected && (
            <Button
              appearance="subtle"
              icon={<PlugDisconnected20Regular />}
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          )}
          {isLocked && (
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              Requires {LicenseTierMeta[platform.minimumTier].displayName} ({LicenseTierMeta[platform.minimumTier].price})
            </Text>
          )}
        </div>
      )}
    </div>
  );
};
