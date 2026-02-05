// ============================================
// AI Components - Premium AI Demo Mode UI
// ============================================
// Premium-feeling components for AI insights and onboarding
// Follows the card design system for consistency

import * as React from 'react';
import { useState } from 'react';
import {
  makeStyles,
  tokens,
  mergeClasses,
  Text,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Button,
  Badge,
} from '@fluentui/react-components';
import {
  Sparkle16Regular,
  Sparkle20Filled,
  ChevronRight16Regular,
  Info12Regular,
  Info16Regular,
  Warning12Filled,
  ErrorCircle12Filled,
  Dismiss20Regular,
  Lightbulb16Regular,
  BrainCircuit20Regular,
  TargetArrow16Regular,
  Checkmark16Regular,
} from '@fluentui/react-icons';
import { IAIInsight, IAICardSummary, AIPriorityLevel } from '../../models/AITypes';
import { semanticTokens } from '../../styles/designTokens';

// ============================================
// Styles - Premium design following card system
// ============================================
const useStyles = makeStyles({
  // AI Insight Banner - White with subtle shadow (no border)
  insightBannerWrapper: {
    position: 'relative',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: `0 2px 8px rgba(157, 79, 178, 0.12), 0 4px 16px rgba(157, 79, 178, 0.08)`,
    transition: 'box-shadow 0.2s ease',
    ':hover': {
      boxShadow: `0 4px 12px rgba(157, 79, 178, 0.18), 0 6px 20px rgba(157, 79, 178, 0.12)`,
    },
  },
  insightBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground1, // White background
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  insightBannerInfoIcon: {
    color: semanticTokens.ai.accent,
    fontSize: '14px',
    flexShrink: 0,
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 0.15s ease',
    ':hover': {
      opacity: 1,
    },
  },
  insightBannerIcon: {
    color: semanticTokens.ai.accent,
    fontSize: '14px',
    flexShrink: 0,
  },
  insightBannerText: {
    flex: 1,
    color: semanticTokens.ai.accent,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  insightBannerChevron: {
    color: semanticTokens.ai.accent,
    fontSize: '12px',
    flexShrink: 0,
    transition: 'transform 0.15s ease',
  },
  insightBannerChevronExpanded: {
    transform: 'rotate(90deg)',
  },
  insightBannerExpanded: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: tokens.spacingVerticalXS,
  },
  insightBannerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    paddingTop: tokens.spacingVerticalS,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    maxHeight: '160px',
    overflowY: 'auto',
  },

  // AI Badge - Small inline indicator
  aiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '2px 5px',
    backgroundColor: semanticTokens.ai.accentBackground,
    borderRadius: tokens.borderRadiusSmall,
    color: semanticTokens.ai.accent,
    fontSize: '10px',
    fontWeight: tokens.fontWeightSemibold,
    lineHeight: 1,
  },
  aiBadgeSmall: {
    padding: '1px 4px',
    fontSize: '9px',
    gap: '1px',
  },
  aiBadgeIcon: {
    fontSize: '10px',
  },
  aiBadgeIconSmall: {
    fontSize: '8px',
  },

  // AI Score - Compact priority indicator
  aiScore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '22px',
    height: '22px',
    borderRadius: tokens.borderRadiusSmall,
    fontSize: '10px',
    fontWeight: tokens.fontWeightBold,
    padding: '0 4px',
  },
  aiScoreCritical: {
    backgroundColor: semanticTokens.ai.criticalBackground,
    color: semanticTokens.ai.criticalForeground,
  },
  aiScoreHigh: {
    backgroundColor: semanticTokens.ai.warningBackground,
    color: semanticTokens.ai.warningForeground,
  },
  aiScoreMedium: {
    backgroundColor: semanticTokens.ai.accentBackground,
    color: semanticTokens.ai.accent,
  },
  aiScoreLow: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
  },

  // AI Insight chip
  insightChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '2px 6px',
    borderRadius: tokens.borderRadiusSmall,
    fontSize: '11px',
    fontWeight: tokens.fontWeightMedium,
  },
  insightChipInfo: {
    backgroundColor: semanticTokens.ai.infoBackground,
    color: semanticTokens.ai.infoForeground,
  },
  insightChipWarning: {
    backgroundColor: semanticTokens.ai.warningBackground,
    color: semanticTokens.ai.warningForeground,
  },
  insightChipCritical: {
    backgroundColor: semanticTokens.ai.criticalBackground,
    color: semanticTokens.ai.criticalForeground,
  },

  // Insight item row - clickable with deeper shadow on hover
  insightItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusSmall,
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: `0 1px 3px rgba(0, 0, 0, 0.08)`,
    transition: 'all 0.15s ease',
    ':hover': {
      boxShadow: `0 3px 8px rgba(157, 79, 178, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)`,
      transform: 'translateY(-1px)',
    },
  },
  insightItemIcon: {
    flexShrink: 0,
    fontSize: '14px',
  },
  insightItemText: {
    flex: 1,
    fontSize: '12px',
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  insightItemAction: {
    fontSize: '11px',
    color: semanticTokens.ai.accent,
    fontWeight: tokens.fontWeightMedium,
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flexShrink: 0,
  },
  // Confidence progress bar
  confidenceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexShrink: 0,
  },
  confidenceBar: {
    width: '40px',
    height: '4px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '2px',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  confidenceText: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
    minWidth: '28px',
  },

  // Popover
  popoverContent: {
    maxWidth: '260px',
    padding: tokens.spacingVerticalS,
  },
  popoverHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalXS,
  },
  popoverReasoning: {
    marginTop: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalXS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusSmall,
    fontSize: '11px',
    color: tokens.colorNeutralForeground2,
  },

  // Premium Onboarding Dialog - Card-based design
  onboardingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)',
  },
  onboardingCard: {
    width: '420px',
    maxWidth: '90vw',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow64,
    overflow: 'hidden',
    animation: 'slideIn 0.3s ease-out',
  },
  onboardingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  onboardingIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusMedium,
    background: `linear-gradient(135deg, ${semanticTokens.ai.accentBackground} 0%, ${semanticTokens.ai.accent}22 100%)`,
  },
  onboardingIcon: {
    color: semanticTokens.ai.accent,
    fontSize: '20px',
  },
  onboardingTitle: {
    flex: 1,
  },
  onboardingBody: {
    padding: tokens.spacingVerticalL,
  },
  onboardingFeature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalS,
  },
  onboardingFeatureIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    color: semanticTokens.ai.accent,
    fontSize: '16px',
    flexShrink: 0,
  },
  onboardingFeatureContent: {
    flex: 1,
  },
  onboardingFeatureTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    marginBottom: '2px',
  },
  onboardingFeatureDesc: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase200,
  },
  onboardingFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  onboardingDots: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  onboardingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralStroke2,
    transition: 'all 0.2s ease',
  },
  onboardingDotActive: {
    backgroundColor: semanticTokens.ai.accent,
    width: '20px',
    borderRadius: '4px',
  },

  // AI Mode Header - Premium inline banner
  modeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    background: `linear-gradient(90deg, ${semanticTokens.ai.accentBackground} 0%, transparent 100%)`,
    borderLeft: `3px solid ${semanticTokens.ai.accent}`,
  },
  modeHeaderIcon: {
    color: semanticTokens.ai.accent,
    fontSize: '16px',
  },
  modeHeaderText: {
    flex: 1,
    color: semanticTokens.ai.accent,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
  modeHeaderLink: {
    color: semanticTokens.ai.accent,
    fontSize: tokens.fontSizeBase100,
    cursor: 'pointer',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },

  // AI Insights Panel - White with subtle shadow (no border, same as banner)
  insightsPanelWrapper: {
    position: 'relative',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: `0 2px 8px rgba(157, 79, 178, 0.12), 0 4px 16px rgba(157, 79, 178, 0.08)`,
    marginBottom: tokens.spacingVerticalM,
  },
  insightsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1, // White background
    borderRadius: tokens.borderRadiusMedium,
  },
  insightsPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalXS,
  },
  insightsPanelIcon: {
    color: semanticTokens.ai.accent,
    fontSize: '14px',
  },
  insightsPanelTitle: {
    color: semanticTokens.ai.accent,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
  insightRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: `0 1px 3px rgba(0, 0, 0, 0.06)`,
    transition: 'all 0.15s ease',
    ':hover': {
      boxShadow: `0 3px 8px rgba(157, 79, 178, 0.18), 0 1px 3px rgba(0, 0, 0, 0.08)`,
      transform: 'translateY(-1px)',
    },
  },
  insightRowIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  insightRowContent: {
    flex: 1,
  },
  insightRowTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground1,
  },
  insightRowDesc: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground2,
    marginTop: '1px',
  },
});

// ============================================
// AI Insight Banner - Expandable inline with shadow
// ============================================
export interface IAIInsightBannerProps {
  summary: IAICardSummary;
  insights: IAIInsight[];
  defaultExpanded?: boolean;
  onInsightClick?: (insight: IAIInsight) => void;
  onLearnMore?: () => void;
}

export const AIInsightBanner: React.FC<IAIInsightBannerProps> = ({
  summary,
  insights,
  defaultExpanded = false,
  onInsightClick,
  onLearnMore,
}) => {
  const styles = useStyles();
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (insights.length === 0) return null;

  const criticalCount = insights.filter(i => i.severity === 'critical').length;

  const handleInfoClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onLearnMore) {
      onLearnMore();
    }
  };

  return (
    <div className={styles.insightBannerWrapper}>
      <div
        className={mergeClasses(styles.insightBanner, expanded && styles.insightBannerExpanded)}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, width: '100%' }}>
          <Sparkle16Regular className={styles.insightBannerIcon} />
          <Text className={styles.insightBannerText}>
            {summary.summary || `${insights.length} AI insight${insights.length > 1 ? 's' : ''}`}
          </Text>
          {criticalCount > 0 && (
            <Badge appearance="filled" color="danger" size="tiny">{criticalCount}</Badge>
          )}
          {onLearnMore && (
            <Tooltip content="Learn about AI insights" relationship="label">
              <Info16Regular
                className={styles.insightBannerInfoIcon}
                onClick={handleInfoClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                    onLearnMore();
                  }
                }}
              />
            </Tooltip>
          )}
          <ChevronRight16Regular
            className={mergeClasses(
              styles.insightBannerChevron,
              expanded && styles.insightBannerChevronExpanded
            )}
          />
        </div>
        {expanded && (
          <div className={styles.insightBannerContent} onClick={(e) => e.stopPropagation()}>
            {insights.slice(0, 5).map((insight) => (
              <AIInsightItem
                key={insight.id}
                insight={insight}
                onClick={onInsightClick ? () => onInsightClick(insight) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// AI Badge - Minimal inline
// ============================================
export interface IAIBadgeProps {
  label?: string;
  tooltip?: string;
  size?: 'small' | 'medium';
}

export const AIBadge: React.FC<IAIBadgeProps> = ({ label, tooltip, size = 'medium' }) => {
  const styles = useStyles();

  const badge = (
    <span className={mergeClasses(
      styles.aiBadge,
      size === 'small' && styles.aiBadgeSmall
    )}>
      <Sparkle16Regular className={mergeClasses(
        styles.aiBadgeIcon,
        size === 'small' && styles.aiBadgeIconSmall
      )} />
      {label && <span>{label}</span>}
    </span>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} relationship="description" showDelay={300}>
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

// ============================================
// AI Score - Priority indicator
// ============================================
export interface IAIScoreProps {
  score: number;
  showValue?: boolean;
  priority?: AIPriorityLevel;
  size?: 'small' | 'medium';
}

export const AIScore: React.FC<IAIScoreProps> = ({ score, showValue = true, priority }) => {
  const styles = useStyles();

  const getScoreClass = (): string => {
    if (priority) {
      switch (priority) {
        case 'critical': return styles.aiScoreCritical;
        case 'high': return styles.aiScoreHigh;
        case 'medium': return styles.aiScoreMedium;
        case 'low': return styles.aiScoreLow;
      }
    }
    if (score >= 80) return styles.aiScoreCritical;
    if (score >= 60) return styles.aiScoreHigh;
    if (score >= 40) return styles.aiScoreMedium;
    return styles.aiScoreLow;
  };

  const getPriorityLabel = (): string => {
    if (priority) return priority.charAt(0).toUpperCase() + priority.slice(1);
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <Tooltip content={`AI Priority: ${getPriorityLabel()} (${score})`} relationship="label">
      <div className={mergeClasses(styles.aiScore, getScoreClass())}>
        {showValue ? score : <Sparkle16Regular style={{ fontSize: '10px' }} />}
      </div>
    </Tooltip>
  );
};

// ============================================
// AI Insight Chip
// ============================================
export interface IAIInsightChipProps {
  insight: IAIInsight;
  compact?: boolean;
}

export const AIInsightChip: React.FC<IAIInsightChipProps> = ({ insight, compact = true }) => {
  const styles = useStyles();

  const getIcon = (): React.ReactNode => {
    switch (insight.severity) {
      case 'critical': return <ErrorCircle12Filled />;
      case 'warning': return <Warning12Filled />;
      default: return <Info12Regular />;
    }
  };

  const getChipClass = (): string => {
    switch (insight.severity) {
      case 'critical': return styles.insightChipCritical;
      case 'warning': return styles.insightChipWarning;
      default: return styles.insightChipInfo;
    }
  };

  const chip = (
    <span className={mergeClasses(styles.insightChip, getChipClass())}>
      {getIcon()}
      {insight.title}
    </span>
  );

  if (compact) {
    return (
      <Tooltip content={insight.description} relationship="description" showDelay={300}>
        {chip}
      </Tooltip>
    );
  }

  return chip;
};

// ============================================
// AI Insight Item - Clickable row in expanded list
// ============================================
export interface IAIInsightItemProps {
  insight: IAIInsight;
  onClick?: () => void;
}

export const AIInsightItem: React.FC<IAIInsightItemProps> = ({ insight, onClick }) => {
  const styles = useStyles();

  const getIcon = (): React.ReactNode => {
    switch (insight.severity) {
      case 'critical':
        return <ErrorCircle12Filled style={{ color: semanticTokens.ai.criticalForeground }} />;
      case 'warning':
        return <Warning12Filled style={{ color: semanticTokens.ai.warningForeground }} />;
      default:
        return <Info12Regular style={{ color: semanticTokens.ai.infoForeground }} />;
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return semanticTokens.ai.accent;
    if (confidence >= 60) return tokens.colorPaletteGreenForeground1;
    if (confidence >= 40) return tokens.colorPaletteYellowForeground1;
    return tokens.colorNeutralForeground3;
  };

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <Popover withArrow positioning="above-start">
      <PopoverTrigger disableButtonEnhancement>
        <div
          className={styles.insightItem}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        >
          <span className={styles.insightItemIcon}>{getIcon()}</span>
          <Text className={styles.insightItemText}>{insight.title}</Text>
          {insight.actionLabel && (
            <span className={styles.insightItemAction}>
              {insight.actionLabel}
              <ChevronRight16Regular style={{ fontSize: '10px' }} />
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverSurface>
        <div className={styles.popoverContent}>
          <div className={styles.popoverHeader}>
            <Sparkle16Regular style={{ color: semanticTokens.ai.accent }} />
            <Text weight="semibold" size={300}>{insight.title}</Text>
          </div>
          <Text size={200}>{insight.description}</Text>
          {insight.confidence && (
            <div style={{ marginTop: tokens.spacingVerticalS, display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
              <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Confidence:</Text>
              <div className={styles.confidenceBar} style={{ width: '60px' }}>
                <div
                  className={styles.confidenceFill}
                  style={{
                    width: `${insight.confidence}%`,
                    backgroundColor: getConfidenceColor(insight.confidence),
                  }}
                />
              </div>
              <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>{insight.confidence}%</Text>
            </div>
          )}
          {insight.reasoning && (
            <div className={styles.popoverReasoning}>
              <strong>Why:</strong> {insight.reasoning}
            </div>
          )}
        </div>
      </PopoverSurface>
    </Popover>
  );
};

// ============================================
// AI Insights Panel - For detail views with gradient border
// ============================================
export interface IAIInsightsPanelProps {
  insights: IAIInsight[];
  suggestion?: string;
  maxItems?: number;
  onInsightClick?: (insight: IAIInsight) => void;
}

export const AIInsightsPanel: React.FC<IAIInsightsPanelProps> = ({
  insights,
  suggestion,
  maxItems = 3,
  onInsightClick,
}) => {
  const styles = useStyles();

  if (insights.length === 0 && !suggestion) return null;

  const getIcon = (severity: string): React.ReactNode => {
    switch (severity) {
      case 'critical':
        return <ErrorCircle12Filled style={{ color: semanticTokens.ai.criticalForeground }} />;
      case 'warning':
        return <Warning12Filled style={{ color: semanticTokens.ai.warningForeground }} />;
      default:
        return <Info12Regular style={{ color: semanticTokens.ai.infoForeground }} />;
    }
  };

  return (
    <div className={styles.insightsPanelWrapper}>
      <div className={styles.insightsPanel}>
        <div className={styles.insightsPanelHeader}>
          <Sparkle16Regular className={styles.insightsPanelIcon} />
          <Text className={styles.insightsPanelTitle}>AI Insights</Text>
        </div>
        {suggestion && (
          <div className={styles.insightRow}>
            <Lightbulb16Regular className={styles.insightRowIcon} style={{ color: semanticTokens.ai.accent }} />
            <div className={styles.insightRowContent}>
              <Text className={styles.insightRowTitle}>Suggestion</Text>
              <Text className={styles.insightRowDesc}>{suggestion}</Text>
            </div>
          </div>
        )}
        {insights.slice(0, maxItems).map((insight) => (
          <div
            key={insight.id}
            className={styles.insightRow}
            onClick={onInsightClick ? () => onInsightClick(insight) : undefined}
            style={onInsightClick ? { cursor: 'pointer' } : undefined}
            role={onInsightClick ? 'button' : undefined}
            tabIndex={onInsightClick ? 0 : undefined}
            onKeyDown={onInsightClick ? (e) => e.key === 'Enter' && onInsightClick(insight) : undefined}
          >
            <span className={styles.insightRowIcon}>{getIcon(insight.severity)}</span>
            <div className={styles.insightRowContent}>
              <Text className={styles.insightRowTitle}>{insight.title}</Text>
              <Text className={styles.insightRowDesc}>{insight.description}</Text>
            </div>
            {insight.actionLabel && onInsightClick && (
              <span className={styles.insightItemAction}>
                {insight.actionLabel}
                <ChevronRight16Regular style={{ fontSize: '10px' }} />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// Premium AI Onboarding Dialog
// ============================================
export interface IAIOnboardingDialogProps {
  open: boolean;
  onClose: () => void;
  onDontShowAgain?: (checked: boolean) => void;
}

const ONBOARDING_FEATURES = [
  {
    icon: <Lightbulb16Regular />,
    title: 'Smart Prioritization',
    description: 'AI analyzes urgency, sender importance, and deadlines to rank your items.',
  },
  {
    icon: <TargetArrow16Regular />,
    title: 'Actionable Insights',
    description: 'Get specific suggestions like "Response needed by 2pm" or "Follow up required".',
  },
  {
    icon: <BrainCircuit20Regular />,
    title: 'Pattern Detection',
    description: 'Identifies unusual activity, blocked tasks, and items requiring attention.',
  },
];

export const AIOnboardingDialog: React.FC<IAIOnboardingDialogProps> = ({
  open,
  onClose,
  onDontShowAgain,
}) => {
  const styles = useStyles();
  const [dontShow, setDontShow] = useState(false);

  const handleClose = (): void => {
    if (dontShow && onDontShowAgain) {
      onDontShowAgain(true);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.onboardingOverlay} onClick={handleClose}>
      <div className={styles.onboardingCard} onClick={(e) => e.stopPropagation()}>
        {/* Header - Following card design */}
        <div className={styles.onboardingHeader}>
          <div className={styles.onboardingIconWrapper}>
            <Sparkle20Filled className={styles.onboardingIcon} />
          </div>
          <div className={styles.onboardingTitle}>
            <Text weight="semibold" size={400} block>AI Demo Mode</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
              Premium intelligence features
            </Text>
          </div>
          <Button
            appearance="subtle"
            icon={<Dismiss20Regular />}
            onClick={handleClose}
            size="small"
          />
        </div>

        {/* Body */}
        <div className={styles.onboardingBody}>
          {ONBOARDING_FEATURES.map((feature, index) => (
            <div key={index} className={styles.onboardingFeature}>
              <div className={styles.onboardingFeatureIcon}>
                {feature.icon}
              </div>
              <div className={styles.onboardingFeatureContent}>
                <Text className={styles.onboardingFeatureTitle}>{feature.title}</Text>
                <Text className={styles.onboardingFeatureDesc}>{feature.description}</Text>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.onboardingFooter}>
          <label style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              style={{ margin: 0 }}
            />
            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
              Don't show again
            </Text>
          </label>
          <Button
            appearance="primary"
            onClick={handleClose}
            icon={<Checkmark16Regular />}
            iconPosition="after"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// AI Mode Header - Premium inline banner
// ============================================
export interface IAIModeHeaderProps {
  showLearnMore?: boolean;
  onLearnMore?: () => void;
}

export const AIModeHeader: React.FC<IAIModeHeaderProps> = ({
  showLearnMore = true,
  onLearnMore,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.modeHeader}>
      <Sparkle16Regular className={styles.modeHeaderIcon} />
      <Text className={styles.modeHeaderText}>AI Demo Mode</Text>
      <Badge appearance="tint" color="important" size="small">Preview</Badge>
      {showLearnMore && (
        <Text
          className={styles.modeHeaderLink}
          onClick={onLearnMore}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onLearnMore?.()}
        >
          Learn more
        </Text>
      )}
    </div>
  );
};

// ============================================
// Export all components
// ============================================
export default {
  AIInsightBanner,
  AIBadge,
  AIScore,
  AIInsightChip,
  AIInsightItem,
  AIInsightsPanel,
  AIOnboardingDialog,
  AIModeHeader,
};
