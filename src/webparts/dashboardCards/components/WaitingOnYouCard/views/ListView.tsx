// src/webparts/dashboardCards/components/WaitingOnYouCard/views/ListView.tsx

import * as React from 'react';
import {
  Text,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import { StaleConversation } from '../../../models/WaitingOnYou';
import { ConversationItem } from '../components/ConversationItem';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
});

interface ListViewProps {
  conversations: StaleConversation[];
  onDismiss: (id: string) => void;
  onSnooze: (conversation: StaleConversation) => void;
  onUnsnooze: (id: string) => void;
  onQuickReply?: (chatId: string, replyToId: string, message: string, isChannel: boolean) => Promise<boolean>;
}

export const ListView: React.FC<ListViewProps> = ({
  conversations,
  onDismiss,
  onSnooze,
  onUnsnooze,
  onQuickReply
}) => {
  const styles = useStyles();

  // Sort by urgency score (highest first), then by stale duration
  const sortedConversations = React.useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (b.urgencyScore !== a.urgencyScore) {
        return b.urgencyScore - a.urgencyScore;
      }
      return b.staleDuration - a.staleDuration;
    });
  }, [conversations]);

  if (sortedConversations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text size={400} weight="semibold">All caught up!</Text>
        <Text size={200}>No pending conversations right now.</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {sortedConversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          onDismiss={onDismiss}
          onSnooze={onSnooze}
          onUnsnooze={onUnsnooze}
          onQuickReply={onQuickReply}
          showSender={true}
        />
      ))}
    </div>
  );
};
