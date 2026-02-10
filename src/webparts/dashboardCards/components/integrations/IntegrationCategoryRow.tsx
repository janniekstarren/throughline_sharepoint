// ============================================
// IntegrationCategoryRow — Category header + grid of platform cards
// ============================================

import * as React from 'react';
import { makeStyles, tokens, Text } from '@fluentui/react-components';
import {
  IntegrationCategory,
  IntegrationCategoryMeta,
  IntegrationCategoryMetadata,
  PlatformRegistration,
  ConnectionStatus,
} from '../../models/Integration';
import { LicenseTier } from '../../models/CardCatalog';
import { PlatformCard } from './PlatformCard';

const useStyles = makeStyles({
  section: {
    marginBottom: tokens.spacingVerticalL,
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalS,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
  },
  categoryIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
});

interface IntegrationCategoryRowProps {
  category: IntegrationCategory;
  platforms: PlatformRegistration[];
  platformStatuses: Map<string, ConnectionStatus>;
  currentTier: LicenseTier;
  allowConnect: boolean;
  onSelectPlatform: (platformId: string) => void;
  onConnect: (platformId: string) => void;
  onDisconnect: (platformId: string) => void;
  onNotifyMe: (platformId: string) => void;
}

export const IntegrationCategoryRow: React.FC<IntegrationCategoryRowProps> = ({
  category,
  platforms,
  platformStatuses,
  currentTier,
  allowConnect,
  onSelectPlatform,
  onConnect,
  onDisconnect,
  onNotifyMe,
}) => {
  const classes = useStyles();
  const categoryMeta: IntegrationCategoryMetadata = IntegrationCategoryMeta[category];

  if (platforms.length === 0) return null;

  return (
    <div className={classes.section}>
      <div className={classes.categoryHeader}>
        <div className={classes.categoryIcon} style={{ color: categoryMeta.color }}>
          {/* Icon rendered as text placeholder — can use Fluent icon mapping later */}
        </div>
        <Text weight="semibold" size={400}>{categoryMeta.displayName}</Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {categoryMeta.description}
        </Text>
      </div>

      <div className={classes.platformGrid}>
        {platforms.map(platform => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            connectionStatus={platformStatuses.get(platform.id) ?? ConnectionStatus.NotConnected}
            currentTier={currentTier}
            allowConnect={allowConnect}
            onSelect={() => onSelectPlatform(platform.id)}
            onConnect={() => onConnect(platform.id)}
            onDisconnect={() => onDisconnect(platform.id)}
            onNotifyMe={() => onNotifyMe(platform.id)}
          />
        ))}
      </div>
    </div>
  );
};
