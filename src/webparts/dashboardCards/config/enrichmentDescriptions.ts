// ============================================
// Enrichment Descriptions
// Human-readable descriptions of what each platform adds to each card
// Map: platformId → cardId → description
// ============================================

import { IntegrationCategoryMeta } from '../models/Integration';
import { INTEGRATION_REGISTRY } from './integrationRegistry';

export const ENRICHMENT_DESCRIPTIONS: Record<string, Record<string, string>> = {
  salesforce: {
    'communication-debt': 'Adds CRM account context — flags cold key accounts, not just cold colleagues',
    'network-drift': 'Adds CRM opportunity owner data — prioritises revenue-linked relationships',
    'silent-stakeholders': 'Adds CRM contact activity — detects silent decision-makers in active deals',
  },
  hubspot: {
    'communication-debt': 'Merges HubSpot contact engagement with M365 signals',
    'network-drift': 'Adds deal pipeline context to relationship drift detection',
  },
  'dynamics-365': {
    'communication-debt': 'Merges Dynamics 365 account interactions with M365 signals',
    'network-drift': 'Adds CRM relationship scoring to network health monitoring',
    'silent-stakeholders': 'Identifies Dynamics 365 contacts viewing without engaging',
    'stale-conversations': 'Cross-references Dynamics 365 activity with email/Teams threads',
  },
  jira: {
    'broken-promises': 'Correlates overdue Jira tickets with email/chat commitments',
    'task-completion-velocity': 'Adds sprint velocity data for more accurate task predictions',
    'commitment-vs-capacity': 'Includes Jira story points in workload capacity calculation',
  },
  'azure-devops': {
    'broken-promises': 'Correlates overdue work items with email/chat commitments',
    'task-completion-velocity': 'Adds work item cycle time data for better predictions',
    'commitment-vs-capacity': 'Includes Azure DevOps capacity data in workload calculation',
  },
  monday: {
    'task-completion-velocity': 'Adds Monday.com board item completion data to task velocity',
  },
  trello: {
    'task-completion-velocity': 'Adds Trello card completion data to task velocity tracking',
  },
  servicenow: {
    'broken-promises': 'Correlates overdue incidents with escalation commitments',
    'approval-bottlenecks': 'Adds ServiceNow approval workflows to bottleneck detection',
  },
  zendesk: {
    'communication-debt': 'Includes Zendesk ticket response times in communication health',
  },
  slack: {
    'stale-conversations': 'Detects Slack DMs and channel threads waiting on you (in addition to Teams)',
    'communication-debt': 'Includes Slack messaging frequency in relationship health calculation',
    'one-way-conversations': 'Tracks one-sided messaging patterns across both Teams and Slack',
    'silent-stakeholders': 'Detects stakeholders reading Slack channels without engaging',
  },
  zoom: {
    'meeting-roi-tracker': 'Includes Zoom meetings in meeting frequency and follow-up analysis',
    'focus-time-defender': 'Counts Zoom meetings alongside Teams in fragmentation analysis',
    'after-hours-footprint': 'Detects after-hours Zoom calls in work-boundary tracking',
  },
  webex: {
    'meeting-roi-tracker': 'Includes Webex meetings in meeting analysis alongside Teams',
  },
  'sap-successfactors': {
    'attrition-risk-signals': 'Adds HR system data to attrition risk detection',
    'new-joiners-in-your-orbit': 'Identifies new hires from HR system for onboarding support',
  },
  bamboohr: {
    'new-joiners-in-your-orbit': 'Identifies new hires from BambooHR for onboarding support',
  },
};

/**
 * Get a human-readable description of what a platform adds to a card.
 * Falls back to a generic description based on the platform's integration category.
 */
export function getEnrichmentDescription(platformId: string, cardId: string): string {
  const desc = ENRICHMENT_DESCRIPTIONS[platformId]?.[cardId];
  if (desc) return desc;

  // Fallback: generic description based on platform category
  const platform = INTEGRATION_REGISTRY.find(p => p.id === platformId);
  if (platform) {
    const categoryMeta = IntegrationCategoryMeta[platform.category];
    return `Adds additional ${categoryMeta.displayName} signals`;
  }

  return 'Adds additional third-party signals';
}
