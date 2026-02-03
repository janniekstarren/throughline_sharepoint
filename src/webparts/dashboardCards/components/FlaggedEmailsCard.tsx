import * as React from 'react';
import {
  tokens,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  Flag24Filled,
  Flag16Filled,
  ErrorCircle24Regular,
  FlagOff24Regular,
  Important16Filled,
  Attach16Regular,
} from '@fluentui/react-icons';
import { IEmailMessage } from '../services/GraphService';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { useCardStyles, CardEnter, ListItemEnter } from './cardStyles';

export interface IFlaggedEmailsCardProps {
  emails: IEmailMessage[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}


export const FlaggedEmailsCard: React.FC<IFlaggedEmailsCardProps> = ({ emails, loading, error, onAction, theme, title }) => {
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

  return (
    <CardEnter visible={true}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconWrapper} style={{ background: `linear-gradient(135deg, ${tokens.colorPaletteRedBackground2} 0%, rgba(196, 49, 75, 0.08) 100%)` }}>
            <Flag24Filled className={styles.cardIcon} style={{ color: tokens.colorPaletteRedForeground1 }} />
          </div>
          <Body1Strong className={styles.cardTitle}>{title || 'Flagged Emails'}</Body1Strong>
          {!loading && emails.length > 0 && (
            <span className={styles.badge} style={{ backgroundColor: tokens.colorPaletteRedBackground2, color: tokens.colorPaletteRedForeground1 }}>{emails.length}</span>
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
              <FlagOff24Regular className={styles.emptyIcon} />
              <Text>No flagged emails</Text>
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
                        style={{ alignItems: 'flex-start' }}
                      >
                        <div style={{ color: tokens.colorPaletteRedForeground1, flexShrink: 0, marginTop: '2px' }}>
                          <Flag16Filled />
                        </div>
                        <div className={styles.itemContent}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                            <Body1Strong className={styles.itemTitle}>{email.from.name || email.from.email}</Body1Strong>
                            <Caption1 className={styles.itemMeta} style={{ flexShrink: 0 }}>{formatDate(email.receivedDateTime)}</Caption1>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                            {email.importance === 'high' && (
                              <Important16Filled style={{ color: tokens.colorPaletteRedForeground1, flexShrink: 0 }} />
                            )}
                            {email.hasAttachments && (
                              <Attach16Regular style={{ color: tokens.colorNeutralForeground3, flexShrink: 0 }} />
                            )}
                            <Body1 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.subject || '(No subject)'}</Body1>
                          </div>
                          <Caption1 className={styles.itemMeta} style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            whiteSpace: 'normal'
                          }}>{email.bodyPreview}</Caption1>
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

export default FlaggedEmailsCard;
