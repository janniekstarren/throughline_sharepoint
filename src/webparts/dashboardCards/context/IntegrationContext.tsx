// ============================================
// Integration Context
// Provides connected platforms state + ConnectorManager to all components
// ============================================

import * as React from 'react';
import {
  IntegrationCategory,
  ConnectionStatus,
  PlatformRegistration,
} from '../models/Integration';
import { ConnectorManager, connectorManager } from '../services/connectors/ConnectorManager';
import { ConnectorConfig, ConnectionTestResult } from '../services/connectors/IConnector';
import { INTEGRATION_REGISTRY } from '../config/integrationRegistry';
import { SalesforceStub } from '../services/connectors/stubs/SalesforceStub';
import { JiraStub } from '../services/connectors/stubs/JiraStub';

// ============================================
// Context State
// ============================================
export interface IIntegrationState {
  connectorManager: ConnectorManager;
  connectedPlatformIds: string[];
  connectedCategories: IntegrationCategory[];
  platformStatuses: Map<string, ConnectionStatus>;

  connect: (platformId: string, config: ConnectorConfig) => Promise<ConnectionTestResult>;
  disconnect: (platformId: string) => Promise<void>;
  getStatus: (platformId: string) => ConnectionStatus;
  getPlatformById: (platformId: string) => PlatformRegistration | undefined;
  refreshStatuses: () => void;
}

// ============================================
// Default
// ============================================
const defaultState: IIntegrationState = {
  connectorManager,
  connectedPlatformIds: [],
  connectedCategories: [],
  platformStatuses: new Map(),
  connect: async () => ({ success: false, message: 'Not initialized' }),
  disconnect: async () => { /* no-op */ },
  getStatus: () => ConnectionStatus.NotConnected,
  getPlatformById: () => undefined,
  refreshStatuses: () => { /* no-op */ },
};

export const IntegrationContext = React.createContext<IIntegrationState>(defaultState);

// ============================================
// Provider
// ============================================
interface IntegrationProviderProps {
  children: React.ReactNode;
}

export const IntegrationProvider: React.FC<IntegrationProviderProps> = ({ children }) => {
  // Track status changes with a revision counter to trigger re-renders
  const [revision, setRevision] = React.useState(0);

  // Register stub connectors on mount
  React.useEffect(() => {
    if (!connectorManager.hasConnector('salesforce')) {
      connectorManager.registerConnector(new SalesforceStub());
    }
    if (!connectorManager.hasConnector('jira')) {
      connectorManager.registerConnector(new JiraStub());
    }
    // Restore any persisted connections
    connectorManager.restorePersistedConnections();
    setRevision(r => r + 1);
  }, []);

  const refreshStatuses = React.useCallback(() => {
    setRevision(r => r + 1);
  }, []);

  const connect = React.useCallback(async (
    platformId: string,
    config: ConnectorConfig
  ): Promise<ConnectionTestResult> => {
    const result = await connectorManager.connect(platformId, config);
    refreshStatuses();
    return result;
  }, [refreshStatuses]);

  const disconnect = React.useCallback(async (platformId: string): Promise<void> => {
    await connectorManager.disconnect(platformId);
    refreshStatuses();
  }, [refreshStatuses]);

  const getStatus = React.useCallback((platformId: string): ConnectionStatus => {
    return connectorManager.getStatus(platformId);
  }, []);

  const getPlatformById = React.useCallback((platformId: string): PlatformRegistration | undefined => {
    return INTEGRATION_REGISTRY.find(p => p.id === platformId);
  }, []);

  // Derived: connected platform IDs
  const connectedPlatformIds = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    revision; // dependency to trigger recompute
    return connectorManager.getConnectedPlatforms();
  }, [revision]);

  // Derived: connected categories
  const connectedCategories = React.useMemo(() => {
    const categories = new Set<IntegrationCategory>();
    for (const platformId of connectedPlatformIds) {
      const platform = INTEGRATION_REGISTRY.find(p => p.id === platformId);
      if (platform) {
        categories.add(platform.category);
      }
    }
    return Array.from(categories);
  }, [connectedPlatformIds]);

  // Derived: platform statuses map
  const platformStatuses = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    revision;
    const statuses = new Map<string, ConnectionStatus>();
    for (const platform of INTEGRATION_REGISTRY) {
      statuses.set(platform.id, connectorManager.getStatus(platform.id));
    }
    return statuses;
  }, [revision]);

  const contextValue = React.useMemo<IIntegrationState>(() => ({
    connectorManager,
    connectedPlatformIds,
    connectedCategories,
    platformStatuses,
    connect,
    disconnect,
    getStatus,
    getPlatformById,
    refreshStatuses,
  }), [
    connectedPlatformIds,
    connectedCategories,
    platformStatuses,
    connect,
    disconnect,
    getStatus,
    getPlatformById,
    refreshStatuses,
  ]);

  return (
    <IntegrationContext.Provider value={contextValue}>
      {children}
    </IntegrationContext.Provider>
  );
};

// ============================================
// Hook
// ============================================
export function useIntegrations(): IIntegrationState {
  return React.useContext(IntegrationContext);
}
