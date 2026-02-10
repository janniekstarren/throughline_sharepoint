// ============================================
// Integration Models
// Defines third-party integration types, platform registration,
// connector types, and enrichment state
// ============================================

import { tokens } from '@fluentui/react-components';
import { LicenseTier } from './CardCatalog';

// ============================================
// Integration Category Enum (6 categories)
// ============================================
export enum IntegrationCategory {
  Microsoft365 = 'microsoft-365',
  CRM = 'crm',
  ProjectDevOps = 'project-devops',
  ITSMOperations = 'itsm-operations',
  Communication = 'communication',
  FinanceHR = 'finance-hr',
}

// ============================================
// Integration Category Metadata
// ============================================
export interface IntegrationCategoryMetadata {
  id: IntegrationCategory;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  isBuiltIn: boolean;
}

export const IntegrationCategoryMeta: Record<IntegrationCategory, IntegrationCategoryMetadata> = {
  [IntegrationCategory.Microsoft365]: {
    id: IntegrationCategory.Microsoft365,
    displayName: 'Microsoft 365',
    description: 'Built-in intelligence from your existing M365 tenant',
    icon: 'MicrosoftLogo',
    color: tokens.colorPaletteBlueBorderActive,
    sortOrder: 0,
    isBuiltIn: true,
  },
  [IntegrationCategory.CRM]: {
    id: IntegrationCategory.CRM,
    displayName: 'CRM',
    description: 'Customer relationship signals for deal and relationship intelligence',
    icon: 'PeopleCommunity24Regular',
    color: tokens.colorPaletteLightTealBorderActive,
    sortOrder: 1,
    isBuiltIn: false,
  },
  [IntegrationCategory.ProjectDevOps]: {
    id: IntegrationCategory.ProjectDevOps,
    displayName: 'Project & DevOps',
    description: 'Development and project management signals for delivery intelligence',
    icon: 'TaskListSquareLtr24Regular',
    color: tokens.colorPaletteGreenBorderActive,
    sortOrder: 2,
    isBuiltIn: false,
  },
  [IntegrationCategory.ITSMOperations]: {
    id: IntegrationCategory.ITSMOperations,
    displayName: 'ITSM & Operations',
    description: 'Service desk and operations signals for support intelligence',
    icon: 'Headset24Regular',
    color: tokens.colorPaletteMarigoldBorderActive,
    sortOrder: 3,
    isBuiltIn: false,
  },
  [IntegrationCategory.Communication]: {
    id: IntegrationCategory.Communication,
    displayName: 'Communication',
    description: 'Cross-platform communication signals beyond Teams',
    icon: 'Chat24Regular',
    color: tokens.colorPalettePurpleBorderActive,
    sortOrder: 4,
    isBuiltIn: false,
  },
  [IntegrationCategory.FinanceHR]: {
    id: IntegrationCategory.FinanceHR,
    displayName: 'Finance & HR',
    description: 'Workforce and financial signals for operational intelligence',
    icon: 'MoneyCalculator24Regular',
    color: tokens.colorPaletteRedBorderActive,
    sortOrder: 5,
    isBuiltIn: false,
  },
};

// ============================================
// Platform Status
// ============================================
export enum PlatformStatus {
  Available = 'available',
  ComingSoon = 'coming-soon',
  InDevelopment = 'in-development',
  Requested = 'requested',
}

// ============================================
// Connection Status
// ============================================
export enum ConnectionStatus {
  NotConnected = 'not-connected',
  Connected = 'connected',
  Error = 'error',
  Expired = 'expired',
  Disabled = 'disabled',
}

// ============================================
// Connector Type
// ============================================
export enum ConnectorType {
  OAuth2 = 'oauth2',
  ApiKey = 'api-key',
  Webhook = 'webhook',
  ServiceAccount = 'service-account',
  Manual = 'manual',
  Native = 'native',
}

// ============================================
// Auth Type
// ============================================
export enum AuthType {
  OAuth2AuthCode = 'oauth2-auth-code',
  OAuth2ClientCredentials = 'oauth2-client-credentials',
  ApiKey = 'api-key',
  BasicAuth = 'basic-auth',
  PersonalAccessToken = 'pat',
  None = 'none',
}

// ============================================
// Config Field (dynamic form fields per platform)
// ============================================
export interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'url' | 'select' | 'toggle' | 'password';
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: { key: string; text: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

// ============================================
// Platform Registration
// ============================================
export interface PlatformRegistration {
  id: string;
  name: string;
  vendor: string;
  category: IntegrationCategory;
  status: PlatformStatus;

  // Display
  description: string;
  logoUrl?: string;
  websiteUrl: string;

  // Cards
  unlockedCardIds: string[];
  enrichedCardIds: string[];

  // Technical
  connectorType: ConnectorType;
  authType: AuthType;
  requiredScopes?: string[];
  configFields?: ConfigField[];

  // Licensing
  minimumTier: LicenseTier;
  requiresIntelligence: boolean;

  // Metadata
  documentationUrl?: string;
  setupGuideUrl?: string;
  tags?: string[];
}

// ============================================
// Enrichment State (Mode 2 — computed at runtime)
// ============================================
export interface CardEnrichmentState {
  cardId: string;
  isEnriched: boolean;
  enrichmentSources: EnrichmentSource[];
  baseSource: 'microsoft-365';
}

export interface EnrichmentSource {
  platformId: string;
  platformName: string;
  category: IntegrationCategory;
  enrichmentDescription: string;
  signalCount: number;
  lastSignalAt: Date | null;
}
