// ============================================
// IntegrationsModal — Main integration management dialog
// Shows all platforms grouped by category with connect/configure/request actions
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Text,
  Divider,
  Badge,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  PlugConnected20Regular,
  Add20Regular,
} from '@fluentui/react-icons';
import {
  IntegrationCategory,
  IntegrationCategoryMeta,
  ConnectionStatus,
  PlatformRegistration,
  PlatformStatus,
} from '../../models/Integration';
// LicenseTier not imported directly — useLicense provides currentTier
import { INTEGRATION_REGISTRY, getThirdPartyPlatforms, getTotalIntegrationCardCount } from '../../config/integrationRegistry';
import { useIntegrations } from '../../context/IntegrationContext';
import { useLicense } from '../../context/LicenseContext';
import { IntegrationCategoryRow } from './IntegrationCategoryRow';
import { PlatformDetailPanel } from './PlatformDetailPanel';
import { RequestIntegrationForm } from './RequestIntegrationForm';

const useStyles = makeStyles({
  surface: {
    maxWidth: '860px',
    width: '90vw',
    maxHeight: '85vh',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightRegular,
  },
  content: {
    overflowY: 'auto',
    paddingRight: tokens.spacingHorizontalXS,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  footerStats: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flex: 1,
  },
});

type ModalView = 'list' | 'detail' | 'request';

interface IntegrationsModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  allowConnect?: boolean;
  showComingSoon?: boolean;
  showRequested?: boolean;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({
  isOpen,
  onDismiss,
  allowConnect = true,
  showComingSoon = true,
  showRequested = true,
}) => {
  const classes = useStyles();
  const { connect, disconnect, platformStatuses, connectedPlatformIds } = useIntegrations();
  const { currentTier } = useLicense();

  const [view, setView] = React.useState<ModalView>('list');
  const [selectedPlatformId, setSelectedPlatformId] = React.useState<string | null>(null);

  // Reset view when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setView('list');
      setSelectedPlatformId(null);
    }
  }, [isOpen]);

  // Filter platforms based on feature flags
  const filteredPlatforms = React.useMemo(() => {
    return getThirdPartyPlatforms().filter(p => {
      if (p.status === PlatformStatus.ComingSoon || p.status === PlatformStatus.InDevelopment) {
        return showComingSoon;
      }
      if (p.status === PlatformStatus.Requested) {
        return showRequested;
      }
      return true;
    });
  }, [showComingSoon, showRequested]);

  // Group platforms by category
  const platformsByCategory = React.useMemo(() => {
    const grouped = new Map<IntegrationCategory, PlatformRegistration[]>();
    const sortedCategories = Object.values(IntegrationCategoryMeta)
      .filter(c => !c.isBuiltIn)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    for (const cat of sortedCategories) {
      grouped.set(cat.id, []);
    }
    for (const platform of filteredPlatforms) {
      const list = grouped.get(platform.category);
      if (list) list.push(platform);
    }
    return grouped;
  }, [filteredPlatforms]);

  const selectedPlatform = selectedPlatformId
    ? INTEGRATION_REGISTRY.find(p => p.id === selectedPlatformId)
    : null;

  const handleConnect = React.useCallback(async (platformId: string, configValues?: Record<string, string>) => {
    await connect(platformId, {
      platformId,
      authCredentials: {},
      configValues: configValues ?? {},
      syncInterval: 300000,
      dataScope: 'personal',
    });
  }, [connect]);

  const handleDisconnect = React.useCallback(async (platformId: string) => {
    await disconnect(platformId);
  }, [disconnect]);

  const handleSelectPlatform = React.useCallback((platformId: string) => {
    setSelectedPlatformId(platformId);
    setView('detail');
  }, []);

  const connectedCount = connectedPlatformIds.length;
  const totalIntegrationCards = getTotalIntegrationCardCount();

  return (
    <Dialog open={isOpen} onOpenChange={(_e, data) => { if (!data.open) onDismiss(); }}>
      <DialogSurface className={classes.surface}>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={onDismiss}
                aria-label="Close"
              />
            }
          >
            <div className={classes.titleRow}>
              <div>
                <PlugConnected20Regular />
                {' '}Integrations
                <br />
                <span className={classes.subtitle}>
                  More signals. Smarter cards.
                </span>
              </div>
            </div>
          </DialogTitle>

          <DialogContent className={classes.content}>
            {view === 'list' && (
              <>
                {Array.from(platformsByCategory.entries()).map(([category, platforms]) => (
                  <IntegrationCategoryRow
                    key={category}
                    category={category}
                    platforms={platforms}
                    platformStatuses={platformStatuses}
                    currentTier={currentTier}
                    allowConnect={allowConnect}
                    onSelectPlatform={handleSelectPlatform}
                    onConnect={(id) => handleConnect(id)}
                    onDisconnect={handleDisconnect}
                    onNotifyMe={(id) => handleSelectPlatform(id)}
                  />
                ))}
              </>
            )}

            {view === 'detail' && selectedPlatform && (
              <PlatformDetailPanel
                platform={selectedPlatform}
                connectionStatus={platformStatuses.get(selectedPlatform.id) ?? ConnectionStatus.NotConnected}
                currentTier={currentTier}
                allowConnect={allowConnect}
                onBack={() => setView('list')}
                onConnect={(configValues) => handleConnect(selectedPlatform.id, configValues)}
                onDisconnect={() => handleDisconnect(selectedPlatform.id)}
              />
            )}

            {view === 'request' && (
              <RequestIntegrationForm onBack={() => setView('list')} />
            )}
          </DialogContent>

          <Divider />

          <DialogActions>
            <div className={classes.footer}>
              <div className={classes.footerStats}>
                <Text size={200}>
                  {filteredPlatforms.length} platforms
                </Text>
                <Text size={200}>
                  +{totalIntegrationCards} integration cards
                </Text>
                <Badge appearance="filled" color="success" size="small">
                  {connectedCount} connected
                </Badge>
              </div>
              {view === 'list' && (
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Add20Regular />}
                  onClick={() => setView('request')}
                >
                  Request an integration
                </Button>
              )}
            </div>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
