// ============================================
// Salesforce Stub Connector — POC mock data
// Returns demo signals for both Mode 1 (dedicated) and Mode 2 (enrichment)
// ============================================

import { IntegrationCategory } from '../../../models/Integration';
import { BaseConnector } from '../BaseConnector';
import {
  ConnectionTestResult,
  SignalFetchOptions,
  IntegrationSignal,
} from '../IConnector';

export class SalesforceStub extends BaseConnector {
  readonly platformId = 'salesforce';
  readonly category = IntegrationCategory.CRM;

  async testConnection(): Promise<ConnectionTestResult> {
    return {
      success: true,
      message: 'Connected as admin@acme.salesforce.com',
      platformVersion: 'Salesforce API v58.0',
      userIdentity: 'admin@acme.salesforce.com',
      permissions: ['api', 'refresh_token', 'openid'],
    };
  }

  async disconnect(): Promise<void> {
    this.status = (await import('../../../models/Integration')).ConnectionStatus.NotConnected;
    this.config = null;
  }

  async fetchSignals(options: SignalFetchOptions): Promise<IntegrationSignal[]> {
    return this.fetchWithHealthTracking(async () => {
      const now = new Date();
      const signals: IntegrationSignal[] = [];

      // Mode 1: Dedicated card signals
      if (!options.targetCardIds || options.targetCardIds.includes('deal-stall-detector')) {
        signals.push({
          id: 'sf-deal-001',
          sourcePlatformId: 'salesforce',
          signalType: 'deal-stalled',
          timestamp: now,
          severity: 'warning',
          mode: 'dedicated',
          targetCardIds: ['deal-stall-detector'],
          payload: {
            opportunityName: 'Acme Corp - Enterprise Renewal',
            amount: 250000,
            daysSinceActivity: 14,
            stage: 'Negotiation',
            ownerName: 'Sarah Chen',
          },
          title: 'Deal stalled: Acme Corp Enterprise Renewal',
          description: 'No activity for 14 days on $250K opportunity in Negotiation stage',
        });

        signals.push({
          id: 'sf-deal-002',
          sourcePlatformId: 'salesforce',
          signalType: 'deal-stalled',
          timestamp: new Date(now.getTime() - 86400000),
          severity: 'critical',
          mode: 'dedicated',
          targetCardIds: ['deal-stall-detector'],
          payload: {
            opportunityName: 'Global Industries - Platform Migration',
            amount: 480000,
            daysSinceActivity: 21,
            stage: 'Proposal',
            ownerName: 'James Park',
          },
          title: 'Deal stalled: Global Industries Platform Migration',
          description: 'No activity for 21 days on $480K opportunity in Proposal stage',
        });
      }

      if (!options.targetCardIds || options.targetCardIds.includes('client-silence-alert')) {
        signals.push({
          id: 'sf-silence-001',
          sourcePlatformId: 'salesforce',
          signalType: 'client-silent',
          timestamp: now,
          severity: 'warning',
          mode: 'dedicated',
          targetCardIds: ['client-silence-alert'],
          payload: {
            accountName: 'TechStart Inc.',
            daysSilent: 30,
            lastActivity: 'Email: Q4 Review Follow-up',
            annualRevenue: 120000,
          },
          title: 'Client silent: TechStart Inc.',
          description: '30 days with no contact for $120K annual account',
        });
      }

      // Mode 2: Enrichment signals
      if (!options.targetCardIds || options.targetCardIds.includes('communication-debt')) {
        signals.push({
          id: 'sf-enrich-001',
          sourcePlatformId: 'salesforce',
          signalType: 'crm-contact-context',
          timestamp: now,
          severity: 'info',
          mode: 'enrichment',
          targetCardIds: ['communication-debt'],
          payload: {
            contactName: 'Maria Garcia',
            accountName: 'Acme Corp',
            accountTier: 'Enterprise',
            lastCrmActivity: '2024-12-15',
            opportunityValue: 250000,
          },
          title: 'CRM context: Maria Garcia (Acme Corp)',
          description: 'Key account contact with $250K opportunity — communication gap detected',
        });
      }

      return signals;
    });
  }
}
