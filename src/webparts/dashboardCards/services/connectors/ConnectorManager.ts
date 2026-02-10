// ============================================
// Connector Manager — Manages all connector instances
// ============================================

import { ConnectionStatus } from '../../models/Integration';
import {
  IConnector,
  ConnectorConfig,
  ConnectionTestResult,
  SignalFetchOptions,
  IntegrationSignal,
  ConnectorHealthMetrics,
} from './IConnector';

const STORAGE_KEY_PREFIX = 'throughline-connector-';

export class ConnectorManager {
  private connectors: Map<string, IConnector> = new Map();
  private configs: Map<string, ConnectorConfig> = new Map();

  registerConnector(connector: IConnector): void {
    this.connectors.set(connector.platformId, connector);
  }

  async connect(platformId: string, config: ConnectorConfig): Promise<ConnectionTestResult> {
    const connector = this.connectors.get(platformId);
    if (!connector) {
      return { success: false, message: `No connector registered for ${platformId}` };
    }

    await connector.initialize(config);
    this.configs.set(platformId, config);
    this.persistConfig(platformId, config);

    return connector.testConnection();
  }

  async disconnect(platformId: string): Promise<void> {
    const connector = this.connectors.get(platformId);
    if (connector) {
      await connector.disconnect();
      this.configs.delete(platformId);
      this.clearPersistedConfig(platformId);
    }
  }

  getConnectedPlatforms(): string[] {
    return Array.from(this.connectors.entries())
      .filter(([, c]) => c.getConnectionStatus() === ConnectionStatus.Connected)
      .map(([id]) => id);
  }

  getStatus(platformId: string): ConnectionStatus {
    return this.connectors.get(platformId)?.getConnectionStatus()
      ?? ConnectionStatus.NotConnected;
  }

  getHealthMetrics(platformId: string): ConnectorHealthMetrics | undefined {
    return this.connectors.get(platformId)?.getHealthMetrics();
  }

  async fetchAllSignals(options?: SignalFetchOptions): Promise<IntegrationSignal[]> {
    const results: IntegrationSignal[] = [];
    const entries = Array.from(this.connectors.entries());
    for (let i = 0; i < entries.length; i++) {
      const id = entries[i][0];
      const connector = entries[i][1];
      if (connector.getConnectionStatus() === ConnectionStatus.Connected) {
        try {
          const signals = await connector.fetchSignals(options ?? {});
          results.push(...signals);
        } catch (err) {
          console.warn(`Failed to fetch signals from ${id}:`, err);
        }
      }
    }
    return results;
  }

  async fetchSignalsForCard(
    cardId: string,
    options?: Partial<SignalFetchOptions>
  ): Promise<IntegrationSignal[]> {
    return this.fetchAllSignals({ ...options, targetCardIds: [cardId] });
  }

  hasConnector(platformId: string): boolean {
    return this.connectors.has(platformId);
  }

  private persistConfig(platformId: string, config: ConnectorConfig): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${platformId}`;
      localStorage.setItem(key, JSON.stringify(config));
    } catch {
      // Ignore localStorage errors
    }
  }

  private clearPersistedConfig(platformId: string): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${platformId}`;
      localStorage.removeItem(key);
    } catch {
      // Ignore localStorage errors
    }
  }

  restorePersistedConnections(): void {
    const keys = Array.from(this.connectors.keys());
    for (let i = 0; i < keys.length; i++) {
      const platformId = keys[i];
      try {
        const key = `${STORAGE_KEY_PREFIX}${platformId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const config = JSON.parse(stored) as ConnectorConfig;
          this.connect(platformId, config).catch(() => {
            // Silently fail on restore — user can re-connect
          });
        }
      } catch {
        // Ignore parse errors
      }
    }
  }
}

// Singleton instance
export const connectorManager = new ConnectorManager();
