// ============================================
// FlaggedEmailsCard - Displays flagged email messages
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  tokens,
  Caption1,
  Body1,
  Body1Strong,
  Theme,
} from '@fluentui/react-components';
import {
  Flag24Filled,
  Flag16Filled,
  FlagOff24Regular,
  Important16Filled,
  Attach16Regular,
  ArrowExpand20Regular,
} from '@fluentui/react-icons';
import { IEmailMessage } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { BaseCard, CardHeader, EmptyState } from './shared';
import { useCardStyles } from './cardStyles';

export interface IFlaggedEmailsCardProps {
  emails: IEmailMessage[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

import { Button, Tooltip } from '@fluentui/react-components';

export const FlaggedEmailsCard: React.FC<IFlaggedEmailsCardProps> = ({
  emails,
  loading,
  error,
  onAction,
  theme,
  title,
  onToggleSize,
}) => {
  const styles = useCardStyles();

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Expand button for switching to large card view
  const expandButton = onToggleSize ? (
    <Tooltip content="Expand to detailed view" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowExpand20Regular />}
        onClick={onToggleSize}
        aria-label="Expand card"
      />
    </Tooltip>
  ) : undefined;

  // Empty state
  if (!loading && !error && emails.length === 0) {
    return (
      <BaseCard testId="flagged-emails-card">
        <CardHeader
          icon={<Flag24Filled />}
          title={title || 'Flagged Emails'}
          actions={expandButton}
        />
        <EmptyState
          icon={<FlagOff24Regular />}
          title="No flagged emails"
          description="Flag important emails to see them here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={loading}
      error={error}
      loadingMessage="Loading flagged emails..."
      testId="flagged-emails-card"
    >
      <CardHeader
        icon={<Flag24Filled />}
        title={title || 'Flagged Emails'}
        badge={emails.length > 0 ? emails.length : undefined}
        badgeVariant="danger"
        actions={expandButton}
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div className={styles.itemList}>
            {emails.map(email => (
              <ItemHoverCard
                key={email.id}
                item={email}
                itemType="email"
                onAction={onAction}
                theme={theme}
              >
                <div
                  className={styles.item}
                  role="button"
                  tabIndex={0}
                  style={{ alignItems: 'flex-start', gap: tokens.spacingHorizontalM }}
                >
                  <Flag16Filled style={{
                    color: tokens.colorPaletteRedForeground1,
                    flexShrink: 0,
                    marginTop: '2px'
                  }} />
                  <div className={styles.itemContent}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: tokens.spacingHorizontalS,
                      marginBottom: tokens.spacingVerticalXS
                    }}>
                      <Body1Strong style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: tokens.colorNeutralForeground1
                      }}>
                        {email.from.name || email.from.email}
                      </Body1Strong>
                      <Caption1 style={{
                        color: tokens.colorNeutralForeground3,
                        flexShrink: 0
                      }}>
                        {formatDate(email.receivedDateTime)}
                      </Caption1>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacingHorizontalXS,
                      marginBottom: tokens.spacingVerticalXS
                    }}>
                      {email.importance === 'high' && (
                        <Important16Filled style={{
                          color: tokens.colorPaletteRedForeground1,
                          flexShrink: 0
                        }} />
                      )}
                      {email.hasAttachments && (
                        <Attach16Regular style={{
                          color: tokens.colorNeutralForeground3,
                          flexShrink: 0
                        }} />
                      )}
                      <Body1 style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {email.subject || '(No subject)'}
                      </Body1>
                    </div>
                    <Caption1 style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      color: tokens.colorNeutralForeground3
                    }}>
                      {email.bodyPreview}
                    </Caption1>
                  </div>
                </div>
              </ItemHoverCard>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </BaseCard>
  );
};

export default FlaggedEmailsCard;
