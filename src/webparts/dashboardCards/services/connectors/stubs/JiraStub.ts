// ============================================
// Jira Stub Connector — POC mock data
// Returns demo signals for both Mode 1 (dedicated) and Mode 2 (enrichment)
// ============================================

import { IntegrationCategory } from '../../../models/Integration';
import { BaseConnector } from '../BaseConnector';
import {
  ConnectionTestResult,
  SignalFetchOptions,
  IntegrationSignal,
} from '../IConnector';

export class JiraStub extends BaseConnector {
  readonly platformId = 'jira';
  readonly category = IntegrationCategory.ProjectDevOps;

  async testConnection(): Promise<ConnectionTestResult> {
    return {
      success: true,
      message: 'Connected as dev@yourorg.atlassian.net',
      platformVersion: 'Jira Cloud, API v3',
      userIdentity: 'dev@yourorg.atlassian.net',
      permissions: ['read:jira-work', 'read:sprint:jira-software'],
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
      if (!options.targetCardIds || options.targetCardIds.includes('sprint-drift')) {
        signals.push({
          id: 'jira-drift-001',
          sourcePlatformId: 'jira',
          signalType: 'sprint-scope-change',
          timestamp: now,
          severity: 'warning',
          mode: 'dedicated',
          targetCardIds: ['sprint-drift'],
          payload: {
            sprintName: 'Sprint 24.3',
            originalPoints: 42,
            currentPoints: 58,
            addedIssues: 4,
            removedIssues: 1,
            daysRemaining: 5,
          },
          title: 'Sprint scope creep: Sprint 24.3',
          description: '+16 story points added mid-sprint (38% increase), 5 days remaining',
        });
      }

      if (!options.targetCardIds || options.targetCardIds.includes('blocked-work-radar')) {
        signals.push({
          id: 'jira-blocked-001',
          sourcePlatformId: 'jira',
          signalType: 'issue-blocked',
          timestamp: now,
          severity: 'critical',
          mode: 'dedicated',
          targetCardIds: ['blocked-work-radar'],
          payload: {
            issueKey: 'PROJ-1234',
            summary: 'API rate limiting in production',
            blockedSince: '2024-12-20',
            blockerKey: 'INFRA-567',
            blockerAssignee: 'Platform Team',
            priority: 'High',
          },
          title: 'Blocked: PROJ-1234 — API rate limiting',
          description: 'Blocked for 5 days by INFRA-567, assigned to Platform Team',
        });

        signals.push({
          id: 'jira-blocked-002',
          sourcePlatformId: 'jira',
          signalType: 'issue-blocked',
          timestamp: new Date(now.getTime() - 172800000),
          severity: 'warning',
          mode: 'dedicated',
          targetCardIds: ['blocked-work-radar'],
          payload: {
            issueKey: 'PROJ-1198',
            summary: 'Database migration script',
            blockedSince: '2024-12-22',
            blockerKey: 'DBA-89',
            blockerAssignee: 'Data Engineering',
            priority: 'Medium',
          },
          title: 'Blocked: PROJ-1198 — Database migration',
          description: 'Blocked for 3 days by DBA-89, assigned to Data Engineering',
        });
      }

      // Mode 2: Enrichment signals
      if (!options.targetCardIds || options.targetCardIds.includes('broken-promises')) {
        signals.push({
          id: 'jira-enrich-001',
          sourcePlatformId: 'jira',
          signalType: 'overdue-ticket-correlation',
          timestamp: now,
          severity: 'info',
          mode: 'enrichment',
          targetCardIds: ['broken-promises'],
          payload: {
            issueKey: 'PROJ-1089',
            summary: 'Update API documentation',
            dueDate: '2024-12-18',
            daysOverdue: 7,
            relatedEmailSubject: 'Re: API docs update — will have it by Friday',
          },
          title: 'Overdue Jira ticket correlated with email commitment',
          description: 'PROJ-1089 overdue by 7 days, matches email promise from Dec 13',
        });
      }

      if (!options.targetCardIds || options.targetCardIds.includes('task-completion-velocity')) {
        signals.push({
          id: 'jira-enrich-002',
          sourcePlatformId: 'jira',
          signalType: 'velocity-data',
          timestamp: now,
          severity: 'info',
          mode: 'enrichment',
          targetCardIds: ['task-completion-velocity'],
          payload: {
            currentSprintVelocity: 38,
            averageVelocity: 42,
            completionRate: 0.82,
            cycleTimeDays: 3.2,
          },
          title: 'Sprint velocity data from Jira',
          description: 'Current velocity 38 points (avg 42), 82% completion rate',
        });
      }

      return signals;
    });
  }
}
