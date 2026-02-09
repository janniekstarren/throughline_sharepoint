// ============================================
// PlatformCard — Individual platform tile in the Integrations Modal
// 5 states: Available+NotConnected, Connected, ComingSoon, Locked, Requested
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Tooltip,
  Card,
  CardHeader,
} from '@fluentui/react-components';
import {
  PlugConnected20Regular,
  PlugDisconnected20Regular,
  Alert20Regular,
  ThumbLike20Regular,
  LockClosed20Regular,
  Settings20Regular,
  ArrowRight16Regular,
} from '@fluentui/react-icons';
import {
  PlatformRegistration,
  PlatformStatus,
  ConnectionStatus,
} from '../../models/Integration';
import { LicenseTier, LicenseTierMeta } from '../../models/CardCatalog';
import { getPlatformIconPath } from '../../config/platformIcons';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';

const useStyles = makeStyles({
  card: {
    width: '100%',
    minHeight: '180px',
    cursor: 'pointer',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveDecelerateMid,
    transitionProperty: 'box-shadow, transform',
    ':hover': {
      boxShadow: tokens.shadow8,
      transform: 'translateY(-1px)',
    },
  },
  cardLocked: {
    opacity: 0.7,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  platformIcon: {
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  platformSvgIcon: {
    width: '18px',
    height: '18px',
    fill: tokens.colorBrandForeground1,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  body: {
    padding: `0 ${tokens.spacingHorizontalM} ${tokens.spacingVerticalM}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  cardCounts: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  countLine: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXS,
  },
  tierInfo: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
});

interface PlatformCardProps {
  platform: PlatformRegistration;
  connectionStatus: ConnectionStatus;
  currentTier: LicenseTier;
  allowConnect: boolean;
  onSelect: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onNotifyMe?: () => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  connectionStatus,
  currentTier,
  allowConnect,
  onSelect,
  onConnect,
  onDisconnect,
  onNotifyMe,
}) => {
  const classes = useStyles();

  const isConnected = connectionStatus === ConnectionStatus.Connected;
  const isLocked = LicenseTierMeta[currentTier].sortOrder < LicenseTierMeta[platform.minimumTier].sortOrder;
  const isComingSoon = platform.status === PlatformStatus.ComingSoon || platform.status === PlatformStatus.InDevelopment;
  const isRequested = platform.status === PlatformStatus.Requested;
  const isAvailable = platform.status === PlatformStatus.Available;

  const unlockedCount = platform.unlockedCardIds.length;
  const enrichedCount = platform.enrichedCardIds.length;

  // Platform initials for icon placeholder
  const initials = platform.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const iconPath = getPlatformIconPath(platform.id);

  return (
    <Card
      className={`${classes.card} ${isLocked ? classes.cardLocked : ''}`}
      onClick={onSelect}
      role="button"
      aria-label={`${platform.name} — ${isConnected ? 'Connected' : platform.status}`}
    >
      <CardHeader
        image={
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
        }
        header={
          <div className={classes.titleRow}>
            <Text weight="semibold" size={300}>{platform.name}</Text>
            <IntegrationStatusBadge
              connectionStatus={connectionStatus}
              platformStatus={platform.status}
            />
          </div>
        }
        description={
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            {platform.vendor}
          </Text>
        }
      />

      <div className={classes.body}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
          {platform.description}
        </Text>

        <div className={classes.cardCounts}>
          {unlockedCount > 0 && (
            <span className={classes.countLine}>
              <ArrowRight16Regular />
              +{unlockedCount} new card{unlockedCount !== 1 ? 's' : ''}
            </span>
          )}
          {enrichedCount > 0 && (
            <span className={classes.countLine}>
              <PlugConnected20Regular />
              Enriches {enrichedCount} existing
            </span>
          )}
        </div>

        {isLocked && (
          <span className={classes.tierInfo}>
            <LockClosed20Regular />
            Requires {LicenseTierMeta[platform.minimumTier].displayName} ({LicenseTierMeta[platform.minimumTier].price})
          </span>
        )}

        <div className={classes.actions}>
          {isConnected && (
            <>
              <Tooltip content="Configure" relationship="label">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Settings20Regular />}
                  onClick={(e) => { e.stopPropagation(); onSelect(); }}
                >
                  Configure
                </Button>
              </Tooltip>
              <Tooltip content="Disconnect" relationship="label">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<PlugDisconnected20Regular />}
                  onClick={(e) => { e.stopPropagation(); onDisconnect?.(); }}
                >
                  Disconnect
                </Button>
              </Tooltip>
            </>
          )}
          {!isConnected && isAvailable && !isLocked && allowConnect && (
            <Button
              appearance="primary"
              size="small"
              icon={<PlugConnected20Regular />}
              onClick={(e) => { e.stopPropagation(); onConnect?.(); }}
            >
              Connect
            </Button>
          )}
          {isComingSoon && (
            <Button
              appearance="subtle"
              size="small"
              icon={<Alert20Regular />}
              onClick={(e) => { e.stopPropagation(); onNotifyMe?.(); }}
            >
              Notify Me
            </Button>
          )}
          {isRequested && (
            <Button
              appearance="subtle"
              size="small"
              icon={<ThumbLike20Regular />}
              onClick={(e) => { e.stopPropagation(); onNotifyMe?.(); }}
            >
              Vote
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
