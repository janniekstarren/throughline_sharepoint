// ============================================
// Connector Interface & Signal Types
// Contract for all third-party integrations
// ============================================

import { IntegrationCategory, ConnectionStatus } from '../../models/Integration';

// ============================================
// Connector Interface
// ============================================
export interface IConnector {
  readonly platformId: string;
  readonly category: IntegrationCategory;

  initialize(config: ConnectorConfig): Promise<void>;
  testConnection(): Promise<ConnectionTestResult>;
  disconnect(): Promise<void>;

  fetchSignals(options: SignalFetchOptions): Promise<IntegrationSignal[]>;
  getLastSyncTime(): Date | null;

  getConnectionStatus(): ConnectionStatus;
  getHealthMetrics(): ConnectorHealthMetrics;
}

// ============================================
// Configuration
// ============================================
export interface ConnectorConfig {
  platformId: string;
  authCredentials: Record<string, string>;
  configValues: Record<string, string>;
  syncInterval: number;
  dataScope: 'personal' | 'team' | 'org';
}

// ============================================
// Connection Test Result
// ============================================
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  platformVersion?: string;
  userIdentity?: string;
  permissions?: string[];
  warnings?: string[];
}

// ============================================
// Signal Fetch Options
// ============================================
export interface SignalFetchOptions {
  since?: Date;
  maxResults?: number;
  targetCardIds?: string[];
}

// ============================================
// Integration Signal
// ============================================
export interface IntegrationSignal {
  id: string;
  sourcePlatformId: string;
  signalType: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';

  mode: 'dedicated' | 'enrichment';
  targetCardIds: string[];

  payload: Record<string, unknown>;
  title: string;
  description: string;
}

// ============================================
// Health Metrics
// ============================================
export interface ConnectorHealthMetrics {
  lastSuccessfulSync: Date | null;
  lastFailedSync: Date | null;
  consecutiveFailures: number;
  averageLatencyMs: number;
  totalSignalsFetched: number;
}
