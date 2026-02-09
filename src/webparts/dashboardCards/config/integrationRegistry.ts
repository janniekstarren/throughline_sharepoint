// ============================================
// Integration Registry — All 15 platforms + M365
// ============================================

import {
  PlatformRegistration,
  IntegrationCategory,
  PlatformStatus,
  ConnectorType,
  AuthType,
} from '../models/Integration';
import { LicenseTier } from '../models/CardCatalog';

export const INTEGRATION_REGISTRY: PlatformRegistration[] = [

  // ═══════════════════════════════════════════
  // MICROSOFT 365 (Built-in)
  // ═══════════════════════════════════════════
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    vendor: 'Microsoft',
    category: IntegrationCategory.Microsoft365,
    status: PlatformStatus.Available,
    description: 'Email, Teams, SharePoint, Calendar, Planner — the foundation of all Throughline intelligence',
    websiteUrl: 'https://www.microsoft.com/microsoft-365',
    unlockedCardIds: [],
    enrichedCardIds: [],
    connectorType: ConnectorType.Native,
    authType: AuthType.None,
    minimumTier: LicenseTier.Individual,
    requiresIntelligence: false,
    tags: ['email', 'teams', 'sharepoint', 'calendar', 'planner', 'graph-api'],
  },

  // ═══════════════════════════════════════════
  // CRM
  // ═══════════════════════════════════════════
  {
    id: 'salesforce',
    name: 'Salesforce',
    vendor: 'Salesforce, Inc.',
    category: IntegrationCategory.CRM,
    status: PlatformStatus.ComingSoon,
    description: 'Connect opportunity and account data for deal and relationship intelligence',
    websiteUrl: 'https://www.salesforce.com',
    unlockedCardIds: ['deal-stall-detector', 'client-silence-alert', 'relationship-decay'],
    enrichedCardIds: ['communication-debt', 'network-drift', 'silent-stakeholders'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    requiredScopes: ['api', 'refresh_token', 'openid'],
    configFields: [
      {
        id: 'instanceUrl',
        label: 'Salesforce Instance URL',
        type: 'url',
        placeholder: 'https://yourorg.my.salesforce.com',
        required: true,
        helpText: 'Your Salesforce organisation URL (not login.salesforce.com)',
        validation: { pattern: '^https:\\/\\/[a-zA-Z0-9-]+\\.my\\.salesforce\\.com$' },
      },
      {
        id: 'syncScope',
        label: 'Data scope',
        type: 'select',
        required: true,
        options: [
          { key: 'my-accounts', text: 'My accounts only' },
          { key: 'my-team', text: "My team's accounts" },
          { key: 'all', text: 'All accounts (admin)' },
        ],
      },
    ],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['crm', 'deals', 'accounts', 'opportunities', 'pipeline'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    vendor: 'HubSpot, Inc.',
    category: IntegrationCategory.CRM,
    status: PlatformStatus.ComingSoon,
    description: 'Connect deal pipeline and contact engagement for marketing and sales intelligence',
    websiteUrl: 'https://www.hubspot.com',
    unlockedCardIds: ['deal-stall-detector', 'client-silence-alert', 'relationship-decay'],
    enrichedCardIds: ['communication-debt', 'network-drift'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    requiredScopes: ['crm.objects.contacts.read', 'crm.objects.deals.read'],
    configFields: [],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['crm', 'marketing', 'deals', 'contacts'],
  },
  {
    id: 'dynamics-365',
    name: 'Dynamics 365',
    vendor: 'Microsoft',
    category: IntegrationCategory.CRM,
    status: PlatformStatus.ComingSoon,
    description: 'Native Microsoft CRM signals for unified relationship and deal intelligence',
    websiteUrl: 'https://dynamics.microsoft.com',
    unlockedCardIds: ['deal-stall-detector', 'client-silence-alert', 'relationship-decay'],
    enrichedCardIds: ['communication-debt', 'network-drift', 'silent-stakeholders', 'stale-conversations'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    requiredScopes: ['user_impersonation'],
    configFields: [
      {
        id: 'environmentUrl',
        label: 'Dynamics 365 Environment URL',
        type: 'url',
        placeholder: 'https://yourorg.crm.dynamics.com',
        required: true,
      },
    ],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['crm', 'microsoft', 'dynamics', 'deals'],
  },

  // ═══════════════════════════════════════════
  // PROJECT & DEVOPS
  // ═══════════════════════════════════════════
  {
    id: 'jira',
    name: 'Jira',
    vendor: 'Atlassian',
    category: IntegrationCategory.ProjectDevOps,
    status: PlatformStatus.ComingSoon,
    description: 'Connect sprint and issue data for delivery velocity and blocked work intelligence',
    websiteUrl: 'https://www.atlassian.com/software/jira',
    unlockedCardIds: ['sprint-drift', 'blocked-work-radar', 'delivery-vs-commitment-gap'],
    enrichedCardIds: ['broken-promises', 'task-completion-velocity', 'commitment-vs-capacity'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    requiredScopes: ['read:jira-work', 'read:sprint:jira-software'],
    configFields: [
      {
        id: 'cloudId',
        label: 'Jira Cloud Site',
        type: 'text',
        placeholder: 'yourorg.atlassian.net',
        required: true,
      },
      {
        id: 'defaultProject',
        label: 'Default project key',
        type: 'text',
        placeholder: 'PROJ',
        required: false,
        helpText: 'Optional: focus signals on one project',
      },
    ],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['project', 'agile', 'sprints', 'issues', 'devops'],
  },
  {
    id: 'azure-devops',
    name: 'Azure DevOps',
    vendor: 'Microsoft',
    category: IntegrationCategory.ProjectDevOps,
    status: PlatformStatus.ComingSoon,
    description: 'Connect work items, pipelines, and sprints for native Microsoft delivery intelligence',
    websiteUrl: 'https://azure.microsoft.com/products/devops',
    unlockedCardIds: ['sprint-drift', 'blocked-work-radar', 'delivery-vs-commitment-gap'],
    enrichedCardIds: ['broken-promises', 'task-completion-velocity', 'commitment-vs-capacity'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    requiredScopes: ['vso.work', 'vso.project'],
    configFields: [
      {
        id: 'organizationUrl',
        label: 'Azure DevOps Organisation URL',
        type: 'url',
        placeholder: 'https://dev.azure.com/yourorg',
        required: true,
      },
    ],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['devops', 'work-items', 'pipelines', 'sprints', 'microsoft'],
  },
  {
    id: 'monday',
    name: 'Monday.com',
    vendor: 'Monday.com Ltd.',
    category: IntegrationCategory.ProjectDevOps,
    status: PlatformStatus.ComingSoon,
    description: 'Connect boards and work management data for cross-team delivery intelligence',
    websiteUrl: 'https://monday.com',
    unlockedCardIds: ['sprint-drift', 'blocked-work-radar', 'delivery-vs-commitment-gap'],
    enrichedCardIds: ['task-completion-velocity'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    configFields: [],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['project', 'work-management', 'boards'],
  },
  {
    id: 'trello',
    name: 'Trello',
    vendor: 'Atlassian',
    category: IntegrationCategory.ProjectDevOps,
    status: PlatformStatus.ComingSoon,
    description: 'Connect boards and card activity for lightweight project intelligence',
    websiteUrl: 'https://trello.com',
    unlockedCardIds: ['blocked-work-radar'],
    enrichedCardIds: ['task-completion-velocity'],
    connectorType: ConnectorType.ApiKey,
    authType: AuthType.ApiKey,
    configFields: [
      {
        id: 'apiKey',
        label: 'Trello API Key',
        type: 'text',
        required: true,
        helpText: 'Get your key at https://trello.com/power-ups/admin',
      },
      {
        id: 'apiToken',
        label: 'Trello API Token',
        type: 'password',
        required: true,
      },
    ],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['project', 'boards', 'kanban'],
  },

  // ═══════════════════════════════════════════
  // ITSM & OPERATIONS
  // ═══════════════════════════════════════════
  {
    id: 'servicenow',
    name: 'ServiceNow',
    vendor: 'ServiceNow, Inc.',
    category: IntegrationCategory.ITSMOperations,
    status: PlatformStatus.ComingSoon,
    description: 'Connect incident, change, and request data for operational intelligence',
    websiteUrl: 'https://www.servicenow.com',
    unlockedCardIds: ['ticket-escalation-patterns', 'repeat-issue-clusters', 'sla-breach-forecast'],
    enrichedCardIds: ['broken-promises', 'approval-bottlenecks'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    configFields: [
      {
        id: 'instanceUrl',
        label: 'ServiceNow Instance URL',
        type: 'url',
        placeholder: 'https://yourorg.service-now.com',
        required: true,
      },
    ],
    minimumTier: LicenseTier.Manager,
    requiresIntelligence: false,
    tags: ['itsm', 'incidents', 'change-management', 'service-desk'],
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    vendor: 'Zendesk, Inc.',
    category: IntegrationCategory.ITSMOperations,
    status: PlatformStatus.ComingSoon,
    description: 'Connect ticket and customer support data for service quality intelligence',
    websiteUrl: 'https://www.zendesk.com',
    unlockedCardIds: ['ticket-escalation-patterns', 'repeat-issue-clusters', 'sla-breach-forecast'],
    enrichedCardIds: ['communication-debt'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    configFields: [
      {
        id: 'subdomain',
        label: 'Zendesk Subdomain',
        type: 'text',
        placeholder: 'yourorg',
        required: true,
        helpText: 'The "yourorg" part of yourorg.zendesk.com',
      },
    ],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['support', 'tickets', 'helpdesk'],
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    vendor: 'Freshworks',
    category: IntegrationCategory.ITSMOperations,
    status: PlatformStatus.ComingSoon,
    description: 'Connect helpdesk and ticket data for service intelligence',
    websiteUrl: 'https://www.freshworks.com/freshdesk',
    unlockedCardIds: ['ticket-escalation-patterns', 'repeat-issue-clusters'],
    enrichedCardIds: [],
    connectorType: ConnectorType.ApiKey,
    authType: AuthType.ApiKey,
    configFields: [
      {
        id: 'domain',
        label: 'Freshdesk Domain',
        type: 'text',
        placeholder: 'yourorg.freshdesk.com',
        required: true,
      },
      {
        id: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
      },
    ],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['support', 'tickets', 'helpdesk'],
  },

  // ═══════════════════════════════════════════
  // COMMUNICATION
  // ═══════════════════════════════════════════
  {
    id: 'slack',
    name: 'Slack',
    vendor: 'Salesforce, Inc.',
    category: IntegrationCategory.Communication,
    status: PlatformStatus.ComingSoon,
    description: 'Connect Slack channel and DM signals for cross-platform communication intelligence',
    websiteUrl: 'https://slack.com',
    unlockedCardIds: ['cross-platform-silence', 'channel-sprawl-index', 'meeting-to-chat-ratio'],
    enrichedCardIds: ['stale-conversations', 'communication-debt', 'one-way-conversations', 'silent-stakeholders'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    requiredScopes: ['channels:history', 'channels:read', 'im:history', 'users:read'],
    configFields: [],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['messaging', 'channels', 'communication'],
  },
  {
    id: 'zoom',
    name: 'Zoom',
    vendor: 'Zoom Video Communications',
    category: IntegrationCategory.Communication,
    status: PlatformStatus.ComingSoon,
    description: 'Connect meeting frequency, duration, and participation signals',
    websiteUrl: 'https://zoom.us',
    unlockedCardIds: ['meeting-to-chat-ratio'],
    enrichedCardIds: ['meeting-roi-tracker', 'focus-time-defender', 'after-hours-footprint'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    requiredScopes: ['meeting:read:list_meetings', 'report:read:list_meeting_participants'],
    configFields: [],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['meetings', 'video', 'communication'],
  },
  {
    id: 'webex',
    name: 'Webex',
    vendor: 'Cisco',
    category: IntegrationCategory.Communication,
    status: PlatformStatus.Requested,
    description: 'Connect Webex meeting and messaging signals for unified communication intelligence',
    websiteUrl: 'https://www.webex.com',
    unlockedCardIds: ['cross-platform-silence', 'meeting-to-chat-ratio'],
    enrichedCardIds: ['meeting-roi-tracker'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    configFields: [],
    minimumTier: LicenseTier.Team,
    requiresIntelligence: false,
    tags: ['meetings', 'messaging', 'communication'],
  },

  // ═══════════════════════════════════════════
  // FINANCE & HR
  // ═══════════════════════════════════════════
  {
    id: 'xero',
    name: 'Xero',
    vendor: 'Xero Limited',
    category: IntegrationCategory.FinanceHR,
    status: PlatformStatus.ComingSoon,
    description: 'Connect financial data for budget and utilisation intelligence',
    websiteUrl: 'https://www.xero.com',
    unlockedCardIds: ['utilisation-vs-capacity', 'budget-burn-anomaly'],
    enrichedCardIds: [],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2AuthCode,
    requiredScopes: ['accounting.reports.read', 'accounting.transactions.read'],
    configFields: [],
    minimumTier: LicenseTier.Manager,
    requiresIntelligence: false,
    tags: ['finance', 'accounting', 'budget'],
  },
  {
    id: 'sap-successfactors',
    name: 'SAP SuccessFactors',
    vendor: 'SAP SE',
    category: IntegrationCategory.FinanceHR,
    status: PlatformStatus.ComingSoon,
    description: 'Connect HR and workforce data for people intelligence',
    websiteUrl: 'https://www.sap.com/products/hcm.html',
    unlockedCardIds: ['onboarding-velocity', 'utilisation-vs-capacity'],
    enrichedCardIds: ['attrition-risk-signals', 'new-joiners-in-your-orbit'],
    connectorType: ConnectorType.OAuth2,
    authType: AuthType.OAuth2ClientCredentials,
    configFields: [
      {
        id: 'apiServer',
        label: 'API Server URL',
        type: 'url',
        placeholder: 'https://apiXX.successfactors.com',
        required: true,
      },
      {
        id: 'companyId',
        label: 'Company ID',
        type: 'text',
        required: true,
      },
    ],
    minimumTier: LicenseTier.Leader,
    requiresIntelligence: false,
    tags: ['hr', 'workforce', 'people'],
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    vendor: 'BambooHR',
    category: IntegrationCategory.FinanceHR,
    status: PlatformStatus.Requested,
    description: 'Connect HR data for onboarding and workforce intelligence',
    websiteUrl: 'https://www.bamboohr.com',
    unlockedCardIds: ['onboarding-velocity'],
    enrichedCardIds: ['new-joiners-in-your-orbit'],
    connectorType: ConnectorType.ApiKey,
    authType: AuthType.ApiKey,
    configFields: [
      {
        id: 'subdomain',
        label: 'BambooHR Subdomain',
        type: 'text',
        placeholder: 'yourcompany',
        required: true,
      },
      {
        id: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
      },
    ],
    minimumTier: LicenseTier.Manager,
    requiresIntelligence: false,
    tags: ['hr', 'onboarding', 'people'],
  },
];

// ============================================
// Helper Functions
// ============================================

export function getPlatformById(platformId: string): PlatformRegistration | undefined {
  return INTEGRATION_REGISTRY.find(p => p.id === platformId);
}

export function getPlatformsByCategory(category: IntegrationCategory): PlatformRegistration[] {
  return INTEGRATION_REGISTRY.filter(p => p.category === category);
}

export function getThirdPartyPlatforms(): PlatformRegistration[] {
  return INTEGRATION_REGISTRY.filter(p => p.category !== IntegrationCategory.Microsoft365);
}

export function getTotalIntegrationCardCount(): number {
  const uniqueCardIds = new Set<string>();
  for (const platform of INTEGRATION_REGISTRY) {
    for (const cardId of platform.unlockedCardIds) {
      uniqueCardIds.add(cardId);
    }
  }
  return uniqueCardIds.size;
}
