// ============================================
// AI Types - AI Demo Mode Data Structures
// ============================================
// Interfaces for AI-enhanced content displayed in demo mode

/**
 * Types of AI insights that can be generated
 */
export type AIInsightType = 'urgency' | 'pattern' | 'anomaly' | 'suggestion' | 'prediction';

/**
 * Severity levels for AI insights
 */
export type AIInsightSeverity = 'info' | 'warning' | 'critical';

/**
 * AI priority levels
 */
export type AIPriorityLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Individual AI insight that can appear on any item
 */
export interface IAIInsight {
  /** Unique identifier */
  id: string;
  /** Type of insight */
  type: AIInsightType;
  /** Severity level */
  severity: AIInsightSeverity;
  /** Short title (displayed in badge/chip) */
  title: string;
  /** Detailed description */
  description: string;
  /** Confidence score 0-100 */
  confidence: number;
  /** AI's reasoning/explanation (shown in tooltip) */
  reasoning?: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Action type identifier for handling */
  actionType?: string;
}

/**
 * Wrapper that adds AI metadata to any item type
 */
export interface IAIEnhancedItem<T> {
  /** The original item */
  item: T;
  /** AI-calculated priority score (0-100) */
  aiScore?: number;
  /** AI priority level */
  aiPriority?: AIPriorityLevel;
  /** List of AI insights for this item */
  aiInsights?: IAIInsight[];
  /** Quick suggestion text */
  aiSuggestion?: string;
}

/**
 * Card-level AI summary
 */
export interface IAICardSummary {
  /** Total number of insights */
  insightCount: number;
  /** Number of critical insights */
  criticalCount: number;
  /** Number of warning insights */
  warningCount?: number;
  /** Most important insight */
  topInsight?: IAIInsight;
  /** Summary text for banner */
  summary?: string;
}

// ============================================
// Email-specific AI Types
// ============================================

/**
 * AI insights specific to email items
 */
export interface IAIEmailInsights {
  /** AI-calculated importance beyond standard high/low */
  importanceScore: number;
  /** Detected sender pattern */
  senderPattern?: 'vip' | 'frequent' | 'new' | 'infrequent';
  /** Whether a response is needed */
  responseNeeded?: boolean;
  /** Suggested response timeframe */
  suggestedResponseTime?: string;
  /** Thread context information */
  threadContext?: string;
  /** Detected tone */
  detectedTone?: 'urgent' | 'neutral' | 'positive' | 'negative';
}

// ============================================
// Calendar/Event-specific AI Types
// ============================================

/**
 * AI insights specific to calendar events
 */
export interface IAIEventInsights {
  /** Whether preparation is recommended */
  prepRequired?: boolean;
  /** Preparation suggestions */
  prepSuggestions?: string[];
  /** Conflict detected with other events */
  conflictDetected?: boolean;
  /** Event conflicting with */
  conflictWith?: string;
  /** Travel time needed */
  travelTimeNeeded?: string;
  /** Important attendees */
  importantAttendees?: string[];
  /** Meeting prep materials */
  relatedItems?: Array<{ type: 'email' | 'file' | 'task'; title: string; id: string }>;
}

// ============================================
// Task-specific AI Types
// ============================================

/**
 * AI insights specific to task items
 */
export interface IAITaskInsights {
  /** AI urgency score */
  urgencyScore: number;
  /** Whether this task blocks others */
  blockerRisk?: boolean;
  /** Number of dependent tasks */
  dependentCount?: number;
  /** Estimated effort */
  estimatedEffort?: 'quick' | 'medium' | 'significant';
  /** Estimated duration */
  estimatedDuration?: string;
  /** Optimal time to work on this */
  optimalTimeToWork?: string;
  /** Related tasks */
  relatedTasks?: string[];
}

// ============================================
// Follow-up/Waiting specific AI Types
// ============================================

/**
 * AI insights for follow-up items (WaitingOnOthers)
 */
export interface IAIFollowUpInsights {
  /** Days since last contact */
  daysSinceLastContact: number;
  /** Response expectation */
  responseExpectation: 'overdue' | 'expected-soon' | 'normal';
  /** Suggested follow-up action */
  suggestedFollowUpAction?: string;
  /** Whether escalation is recommended */
  escalationRecommended?: boolean;
  /** Historical response time for this person */
  historicalResponseTime?: string;
  /** Pattern detected */
  patternDetected?: string;
}
