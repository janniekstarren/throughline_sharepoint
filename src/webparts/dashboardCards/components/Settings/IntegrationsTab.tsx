// ============================================
// IntegrationsTab - Tab 5: Integrations settings
// Premium grid card layout with category sections
// Master enable/disable toggle + platform detail panel
// Reuses PlatformCard and PlatformDetailPanel from IntegrationsModal
// Includes search bar for platform filtering
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Switch,
  Badge,
  Divider,
  Button,
  SearchBox,
  mergeClasses,
} from '@fluentui/react-components';
import {
  PlugConnected20Regular,
  Add20Regular,
  Search20Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';
import {
  IntegrationCategory,
  IntegrationCategoryMeta,
  IntegrationCategoryMetadata,
  PlatformRegistration,
  ConnectionStatus,
} from '../../models/Integration';
import {
  getThirdPartyPlatforms,
  INTEGRATION_REGISTRY,
  getTotalIntegrationCardCount,
} from '../../config/integrationRegistry';
import { useIntegrations } from '../../context/IntegrationContext';
import { useLicense } from '../../context/LicenseContext';
import { IntegrationCategoryRow } from '../integrations/IntegrationCategoryRow';
import { PlatformDetailPanel } from '../integrations/PlatformDetailPanel';
import { RequestIntegrationForm } from '../integrations/RequestIntegrationForm';

// ============================================
// Styles
// ============================================

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },

  // Master toggle
  masterToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  masterToggleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  masterToggleIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    flexShrink: 0,
  },
  masterToggleLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  // Stats bar
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    paddingLeft: tokens.spacingHorizontalXS,
  },

  // Search bar
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  searchBox: {
    flex: 1,
    maxWidth: '400px',
  },
  searchResultCount: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap' as const,
  },

  // Content area
  contentArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },

  // Empty search state
  emptySearch: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalXXL} 0`,
  },
  emptySearchIcon: {
    color: tokens.colorNeutralForeground4,
    fontSize: '32px',
  },

  // Footer actions
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: tokens.spacingVerticalS,
  },

  disabledOverlay: {
    opacity: 0.45,
    pointerEvents: 'none' as const,
    filter: 'grayscale(0.3)',
  },
});

// ============================================
// Props
// ============================================

interface IntegrationsTabProps {
  /** Whether integrations are globally enabled (user toggle) */
  integrationsEnabled: boolean;
  /** Callback to enable/disable integrations */
  onIntegrationsEnabledChange: (enabled: boolean) => void;
  /** Optional platform ID to deep-link directly to the detail panel */
  initialPlatformId?: string;
}

// ============================================
// View types
// ============================================

type TabView = 'grid' | 'detail' | 'request';

// ============================================
// Component
// ============================================

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  integrationsEnabled,
  onIntegrationsEnabledChange,
  initialPlatformId,
}) => {
  const classes = useStyles();
  const { connect, disconnect, platformStatuses, connectedPlatformIds } = useIntegrations();
  const { currentTier } = useLicense();

  const [view, setView] = React.useState<TabView>(initialPlatformId ? 'detail' : 'grid');
  const [selectedPlatformId, setSelectedPlatformId] = React.useState<string | null>(initialPlatformId ?? null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Deep-link: if initialPlatformId changes (e.g., re-opened with different platform), sync view
  const prevInitialPlatformIdRef = React.useRef(initialPlatformId);
  React.useEffect(() => {
    if (initialPlatformId && initialPlatformId !== prevInitialPlatformIdRef.current) {
      setSelectedPlatformId(initialPlatformId);
      setView('detail');
      prevInitialPlatformIdRef.current = initialPlatformId;
    }
  }, [initialPlatformId]);

  const thirdPartyPlatforms = React.useMemo(() => getThirdPartyPlatforms(), []);

  // Filter platforms by search query
  const filteredPlatforms = React.useMemo(() => {
    if (!searchQuery.trim()) return thirdPartyPlatforms;
    const q = searchQuery.toLowerCase().trim();
    return thirdPartyPlatforms.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.vendor.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
      IntegrationCategoryMeta[p.category].displayName.toLowerCase().includes(q)
    );
  }, [thirdPartyPlatforms, searchQuery]);

  // Group filtered platforms by category (sorted)
  const platformsByCategory = React.useMemo(() => {
    const grouped = new Map<IntegrationCategory, PlatformRegistration[]>();
    const sortedCategories = Object.values(IntegrationCategoryMeta)
      .filter((c: IntegrationCategoryMetadata) => !c.isBuiltIn)
      .sort((a: IntegrationCategoryMetadata, b: IntegrationCategoryMetadata) => a.sortOrder - b.sortOrder);

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

  const handleSelectPlatform = React.useCallback((platformId: string) => {
    setSelectedPlatformId(platformId);
    setView('detail');
  }, []);

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

  const connectedCount = connectedPlatformIds.length;
  const totalIntegrationCards = getTotalIntegrationCardCount();

  return (
    <div className={classes.container}>
      {/* Master toggle */}
      <div className={classes.masterToggle}>
        <div className={classes.masterToggleLeft}>
          <div className={classes.masterToggleIcon}>
            <PlugConnected20Regular />
          </div>
          <div className={classes.masterToggleLabel}>
            <Text weight="semibold" size={300}>
              Enable Integrations
            </Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              Show third-party integration cards and enrichment signals on the dashboard
            </Text>
          </div>
        </div>
        <Switch
          checked={integrationsEnabled}
          onChange={(_e, data) => onIntegrationsEnabledChange(data.checked)}
        />
      </div>

      {/* Stats */}
      <div className={classes.statsRow}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {thirdPartyPlatforms.length} platforms
        </Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          +{totalIntegrationCards} integration cards
        </Text>
        <Badge
          appearance="filled"
          color={connectedCount > 0 ? 'success' : 'informative'}
          size="small"
        >
          {connectedCount} connected
        </Badge>
      </div>

      <Divider />

      {/* Search bar — grid view only */}
      {view === 'grid' && (
        <div className={classes.searchRow}>
          <SearchBox
            className={classes.searchBox}
            placeholder="Search platforms, vendors, categories..."
            value={searchQuery}
            onChange={(_e, data) => setSearchQuery(data.value)}
            dismiss={
              searchQuery ? (
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Dismiss16Regular />}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                />
              ) : null
            }
            contentBefore={<Search20Regular />}
            size="medium"
          />
          {searchQuery && (
            <Text className={classes.searchResultCount}>
              {filteredPlatforms.length} of {thirdPartyPlatforms.length} platforms
            </Text>
          )}
        </div>
      )}

      {/* Content — grid, detail, or request form */}
      <div className={integrationsEnabled ? classes.contentArea : mergeClasses(classes.contentArea, classes.disabledOverlay)}>
        {view === 'grid' && (
          <>
            {filteredPlatforms.length === 0 && searchQuery ? (
              <div className={classes.emptySearch}>
                <Search20Regular className={classes.emptySearchIcon} />
                <Text weight="semibold" size={300}>
                  No platforms match &ldquo;{searchQuery}&rdquo;
                </Text>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                  Try a different search term or browse all platforms
                </Text>
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              </div>
            ) : (
              Array.from(platformsByCategory.entries()).map(([category, platforms]) => (
                <IntegrationCategoryRow
                  key={category}
                  category={category}
                  platforms={platforms}
                  platformStatuses={platformStatuses}
                  currentTier={currentTier}
                  allowConnect={integrationsEnabled}
                  onSelectPlatform={handleSelectPlatform}
                  onConnect={(id) => handleConnect(id)}
                  onDisconnect={handleDisconnect}
                  onNotifyMe={(id) => handleSelectPlatform(id)}
                />
              ))
            )}
          </>
        )}

        {view === 'detail' && selectedPlatform && (
          <PlatformDetailPanel
            platform={selectedPlatform}
            connectionStatus={platformStatuses.get(selectedPlatform.id) ?? ConnectionStatus.NotConnected}
            currentTier={currentTier}
            allowConnect={integrationsEnabled}
            onBack={() => setView('grid')}
            onConnect={(configValues) => handleConnect(selectedPlatform.id, configValues)}
            onDisconnect={() => handleDisconnect(selectedPlatform.id)}
          />
        )}

        {view === 'request' && (
          <RequestIntegrationForm onBack={() => setView('grid')} />
        )}
      </div>

      {/* Footer — request integration link */}
      {view === 'grid' && (
        <>
          <Divider />
          <div className={classes.footer}>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              More signals. Smarter cards.
            </Text>
            <Button
              appearance="subtle"
              size="small"
              icon={<Add20Regular />}
              onClick={() => setView('request')}
            >
              Request an integration
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
