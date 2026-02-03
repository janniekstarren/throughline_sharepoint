import * as React from 'react';
import {
  tokens,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Avatar,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  Mail24Regular,
  ErrorCircle24Regular,
  MailInbox24Regular,
  Important16Filled,
  Attach16Regular,
} from '@fluentui/react-icons';
import { IEmailMessage } from '../services/GraphService';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { useCardStyles, CardEnter, ListItemEnter } from './cardStyles';

export interface IUnreadInboxCardProps {
  emails: IEmailMessage[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

export const UnreadInboxCard: React.FC<IUnreadInboxCardProps> = ({ emails, loading, error, onAction, theme, title }) => {
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

  return (
    <CardEnter visible={true}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconWrapper}>
            <Mail24Regular className={styles.cardIcon} />
          </div>
          <Body1Strong className={styles.cardTitle}>{title || 'Unread Inbox'}</Body1Strong>
          {!loading && emails.length > 0 && (
            <span className={styles.badge}>{emails.length}</span>
          )}
        </div>
        <div className={styles.cardContent}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spinner size="medium" />
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <ErrorCircle24Regular className={styles.errorIcon} />
              <Text>{error}</Text>
            </div>
          ) : emails.length === 0 ? (
            <div className={styles.emptyState}>
              <MailInbox24Regular className={styles.emptyIcon} />
              <Text>All caught up!</Text>
            </div>
          ) : (
            <div className={styles.itemList}>
              {emails.map((email, index) => (
                <ListItemEnter key={email.id} visible={true}>
                  <div style={{ animationDelay: `${index * 50}ms` }}>
                    <ItemHoverCard
                      item={email}
                      itemType="email"
                      onAction={onAction}
                      theme={theme}
                    >
                      <div
                        className={styles.item}
                        role="button"
                        tabIndex={0}
                      >
                        <Avatar
                          name={email.from.name}
                          size={36}
                          className={styles.avatar}
                        />
                        <div className={styles.itemContent}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <Body1Strong className={styles.itemTitle}>{email.from.name}</Body1Strong>
                            <Caption1 className={styles.timeSub} style={{ flexShrink: 0, marginLeft: '8px' }}>{formatDate(email.receivedDateTime)}</Caption1>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            {email.importance === 'high' && (
                              <Important16Filled style={{ color: tokens.colorPaletteRedForeground1, fontSize: '14px', flexShrink: 0 }} />
                            )}
                            {email.hasAttachments && (
                              <Attach16Regular style={{ color: tokens.colorNeutralForeground3, fontSize: '14px', flexShrink: 0 }} />
                            )}
                            <Body1 className={styles.itemTitle} style={{ fontWeight: '400' }}>{email.subject}</Body1>
                          </div>
                          <Caption1 className={styles.itemSubtitle} style={{
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            whiteSpace: 'normal'
                          }}>
                            {email.bodyPreview.substring(0, 80)}
                            {email.bodyPreview.length > 80 ? '...' : ''}
                          </Caption1>
                        </div>
                      </div>
                    </ItemHoverCard>
                  </div>
                </ListItemEnter>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardEnter>
  );
};

export default UnreadInboxCard;
