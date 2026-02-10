// ============================================
// Base Connector — Shared logic for all connectors
// ============================================

import { IntegrationCategory, ConnectionStatus } from '../../models/Integration';
import {
  IConnector,
  ConnectorConfig,
  ConnectionTestResult,
  SignalFetchOptions,
  IntegrationSignal,
  ConnectorHealthMetrics,
} from './IConnector';

export abstract class BaseConnector implements IConnector {
  abstract readonly platformId: string;
  abstract readonly category: IntegrationCategory;

  protected config: ConnectorConfig | null = null;
  protected status: ConnectionStatus = ConnectionStatus.NotConnected;
  protected health: ConnectorHealthMetrics = {
    lastSuccessfulSync: null,
    lastFailedSync: null,
    consecutiveFailures: 0,
    averageLatencyMs: 0,
    totalSignalsFetched: 0,
  };

  async initialize(config: ConnectorConfig): Promise<void> {
    this.config = config;
    const test = await this.testConnection();
    this.status = test.success ? ConnectionStatus.Connected : ConnectionStatus.Error;
  }

  abstract testConnection(): Promise<ConnectionTestResult>;
  abstract disconnect(): Promise<void>;
  abstract fetchSignals(options: SignalFetchOptions): Promise<IntegrationSignal[]>;

  getConnectionStatus(): ConnectionStatus {
    return this.status;
  }

  getHealthMetrics(): ConnectorHealthMetrics {
    return { ...this.health };
  }

  getLastSyncTime(): Date | null {
    return this.health.lastSuccessfulSync;
  }

  protected async fetchWithHealthTracking(
    fetcher: () => Promise<IntegrationSignal[]>
  ): Promise<IntegrationSignal[]> {
    const start = Date.now();
    try {
      const signals = await fetcher();
      this.health.lastSuccessfulSync = new Date();
      this.health.consecutiveFailures = 0;
      this.health.totalSignalsFetched += signals.length;
      this.health.averageLatencyMs =
        (this.health.averageLatencyMs + (Date.now() - start)) / 2;
      return signals;
    } catch (error) {
      this.health.lastFailedSync = new Date();
      this.health.consecutiveFailures++;
      if (this.health.consecutiveFailures >= 3) {
        this.status = ConnectionStatus.Error;
      }
      throw error;
    }
  }
}
