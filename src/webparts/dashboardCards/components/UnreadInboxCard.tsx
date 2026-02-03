// ============================================
// UnreadInboxCard - Displays unread email messages
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  tokens,
  Caption1,
  Body1,
  Body1Strong,
  Avatar,
  Theme,
} from '@fluentui/react-components';
import {
  Mail24Regular,
  MailInbox24Regular,
  Important16Filled,
  Attach16Regular,
} from '@fluentui/react-icons';
import { IEmailMessage } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { BaseCard, CardHeader, EmptyState } from './shared';
import { useCardStyles } from './cardStyles';

export interface IUnreadInboxCardProps {
  emails: IEmailMessage[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

export const UnreadInboxCard: React.FC<IUnreadInboxCardProps> = ({
  emails,
  loading,
  error,
  onAction,
  theme,
  title
}) => {
  const styles = useCardStyles();

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Empty state
  if (!loading && !error && emails.length === 0) {
    return (
      <BaseCard testId="unread-inbox-card">
        <CardHeader
          icon={<Mail24Regular />}
          title={title || 'Unread Inbox'}
          iconWrapperStyle={{ backgroundColor: tokens.colorBrandForeground1 }}
        />
        <EmptyState
          icon={<MailInbox24Regular />}
          title="All caught up!"
          description="No unread emails in your inbox"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={loading}
      error={error}
      loadingMessage="Loading emails..."
      testId="unread-inbox-card"
    >
      <CardHeader
        icon={<Mail24Regular />}
        title={title || 'Unread Inbox'}
        badge={emails.length > 0 ? emails.length : undefined}
        badgeVariant="brand"
        iconWrapperStyle={{ backgroundColor: tokens.colorBrandForeground1 }}
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
                  <Avatar
                    name={email.from.name}
                    size={32}
                    style={{ flexShrink: 0 }}
                  />
                  <div className={styles.itemContent}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacingVerticalXS
                    }}>
                      <Body1Strong style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: tokens.colorNeutralForeground1
                      }}>
                        {email.from.name}
                      </Body1Strong>
                      <Caption1 style={{
                        flexShrink: 0,
                        marginLeft: tokens.spacingHorizontalS,
                        color: tokens.colorNeutralForeground3
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
                          fontSize: '14px',
                          flexShrink: 0
                        }} />
                      )}
                      {email.hasAttachments && (
                        <Attach16Regular style={{
                          color: tokens.colorNeutralForeground3,
                          fontSize: '14px',
                          flexShrink: 0
                        }} />
                      )}
                      <Body1 style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {email.subject}
                      </Body1>
                    </div>
                    <Caption1 style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      color: tokens.colorNeutralForeground3,
                      lineHeight: tokens.lineHeightBase200
                    }}>
                      {email.bodyPreview.substring(0, 80)}
                      {email.bodyPreview.length > 80 ? '...' : ''}
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

export default UnreadInboxCard;
