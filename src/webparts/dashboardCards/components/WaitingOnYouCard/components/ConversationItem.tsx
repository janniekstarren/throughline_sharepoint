// src/webparts/dashboardCards/components/WaitingOnYouCard/components/ConversationItem.tsx

import * as React from 'react';
import {
  Text,
  Badge,
  Button,
  Avatar,
  Tooltip,
  tokens,
  makeStyles,
  mergeClasses
} from '@fluentui/react-components';
import {
  MailRegular,
  ChatRegular,
  PeopleRegular,
  ClockRegular,
  DismissRegular,
  OpenRegular
} from '@fluentui/react-icons';
import { StaleConversation } from '../../../models/WaitingOnYou';
import { UrgencyExplainer } from './UrgencyExplainer';
import { QuickReplyInput } from './QuickReplyInput';
import { formatSnoozedUntil } from '../../../hooks/useSnooze';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    transition: 'background-color 0.1s ease',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  snoozed: {
    opacity: 0.7,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
  },
  typeIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginBottom: '2px',
  },
  subject: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  preview: {
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: tokens.spacingVerticalXS,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: tokens.colorNeutralForeground3,
  },
  snoozeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
  },
  teamContext: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXS,
  },
});

interface ConversationItemProps {
  conversation: StaleConversation;
  onDismiss: (id: string) => void;
  onSnooze: (conversation: StaleConversation) => void;
  onUnsnooze: (id: string) => void;
  onQuickReply?: (chatId: string, replyToId: string, message: string, isChannel: boolean) => Promise<boolean>;
  showSender?: boolean;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onDismiss,
  onSnooze,
  onUnsnooze,
  onQuickReply,
  showSender = false
}) => {
  const styles = useStyles();

  const getTypeIcon = () => {
    switch (conversation.conversationType) {
      case 'email':
        return <MailRegular />;
      case 'teams-chat':
        return <ChatRegular />;
      case 'teams-channel':
        return <PeopleRegular />;
      default:
        return <MailRegular />;
    }
  };

  const getTypeLabel = () => {
    switch (conversation.conversationType) {
      case 'email':
        return 'Email';
      case 'teams-chat':
        return 'Teams Chat';
      case 'teams-channel':
        return 'Channel';
      default:
        return 'Message';
    }
  };

  const formatWaitTime = (hours: number): string => {
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getUrgencyColor = (): 'danger' | 'warning' | 'informative' | 'subtle' => {
    if (conversation.urgencyScore >= 9) return 'danger';
    if (conversation.urgencyScore >= 7) return 'warning';
    if (conversation.urgencyScore >= 5) return 'informative';
    return 'subtle';
  };

  const handleQuickReply = async (message: string): Promise<boolean> => {
    if (!onQuickReply || !conversation.chatId || !conversation.replyToId) {
      return false;
    }
    return onQuickReply(
      conversation.chatId,
      conversation.replyToId,
      message,
      conversation.conversationType === 'teams-channel'
    );
  };

  const canQuickReply = conversation.conversationType !== 'email' && conversation.chatId && onQuickReply;
  const isSnoozed = !!conversation.snoozedUntil;

  return (
    <div className={mergeClasses(styles.container, isSnoozed && styles.snoozed)}>
      <div className={styles.header}>
        <Tooltip content={getTypeLabel()} relationship="label">
          <span className={styles.typeIcon}>
            {getTypeIcon()}
          </span>
        </Tooltip>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <Text weight="semibold" size={200} className={styles.subject}>
              {conversation.subject}
            </Text>
            <Badge
              appearance="filled"
              color={getUrgencyColor()}
              size="small"
            >
              {conversation.urgencyScore}
            </Badge>
            <UrgencyExplainer score={conversation.urgencyScore} factors={conversation.urgencyFactors} />
          </div>

          <Text size={200} className={styles.preview}>
            {conversation.preview}
          </Text>

          <div className={styles.metaRow}>
            {showSender && (
              <div className={styles.metaItem}>
                <Avatar
                  name={conversation.sender.displayName}
                  image={conversation.sender.photoUrl ? { src: conversation.sender.photoUrl } : undefined}
                  size={16}
                />
                <Text size={100}>{conversation.sender.displayName}</Text>
              </div>
            )}

            <div className={styles.metaItem}>
              <ClockRegular style={{ fontSize: '12px' }} />
              <Text size={100}>{formatWaitTime(conversation.staleDuration)}</Text>
            </div>

            {isSnoozed && conversation.snoozedUntil && (
              <Badge appearance="outline" color="subtle" size="small" className={styles.snoozeBadge}>
                <ClockRegular style={{ fontSize: '10px' }} />
                {formatSnoozedUntil(conversation.snoozedUntil)}
              </Badge>
            )}

            <div className={styles.actions}>
              {isSnoozed ? (
                <Tooltip content="Unsnooze" relationship="label">
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<ClockRegular />}
                    onClick={() => onUnsnooze(conversation.id)}
                  />
                </Tooltip>
              ) : (
                <Tooltip content="Snooze" relationship="label">
                  <Button
                    appearance="subtle"
                    size="small"
                    icon={<ClockRegular />}
                    onClick={() => onSnooze(conversation)}
                  />
                </Tooltip>
              )}

              <Tooltip content="Dismiss" relationship="label">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<DismissRegular />}
                  onClick={() => onDismiss(conversation.id)}
                />
              </Tooltip>

              <Tooltip content="Open" relationship="label">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<OpenRegular />}
                  as="a"
                  href={conversation.webUrl}
                  target="_blank"
                />
              </Tooltip>
            </div>
          </div>

          {conversation.teamName && (
            <div className={styles.teamContext}>
              <PeopleRegular style={{ fontSize: '12px' }} />
              <Text size={100}>
                {conversation.teamName}
                {conversation.channelName && ` > ${conversation.channelName}`}
              </Text>
            </div>
          )}
        </div>
      </div>

      {canQuickReply && (
        <QuickReplyInput onSend={handleQuickReply} />
      )}
    </div>
  );
};
