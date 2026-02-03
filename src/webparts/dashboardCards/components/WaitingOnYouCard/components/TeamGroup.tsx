// src/webparts/dashboardCards/components/WaitingOnYouCard/components/TeamGroup.tsx

import * as React from 'react';
import {
  Text,
  Badge,
  Avatar,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import {
  ChevronDownRegular,
  ChevronRightRegular,
  ClockRegular,
  PeopleTeamRegular
} from '@fluentui/react-icons';
import { TeamGroup as TeamGroupType, StaleConversation } from '../../../models/WaitingOnYou';
import { ConversationItem } from './ConversationItem';
import { AvatarStack } from './AvatarStack';

const useStyles = makeStyles({
  container: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  expandIcon: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  teamIcon: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginTop: '2px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: tokens.colorNeutralForeground3,
  },
  peopleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  urgencyBadges: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    marginLeft: 'auto',
  },
  conversationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalS,
    paddingTop: 0,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  personSubgroup: {
    marginBottom: tokens.spacingVerticalS,
  },
  personHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },
});

interface TeamGroupProps {
  group: TeamGroupType;
  isExpanded: boolean;
  onToggle: () => void;
  onDismiss: (id: string) => void;
  onSnooze: (conversation: StaleConversation) => void;
  onUnsnooze: (id: string) => void;
  onQuickReply?: (chatId: string, replyToId: string, message: string, isChannel: boolean) => Promise<boolean>;
}

export const TeamGroup: React.FC<TeamGroupProps> = ({
  group,
  isExpanded,
  onToggle,
  onDismiss,
  onSnooze,
  onUnsnooze,
  onQuickReply
}) => {
  const styles = useStyles();

  const formatWaitTime = (hours: number): string => {
    if (hours < 24) {
      return `${hours}h total wait`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d total wait`;
  };

  // Group conversations by person within the team
  const conversationsByPerson = React.useMemo(() => {
    const map = new Map<string, typeof group.conversations>();

    for (const conv of group.conversations) {
      const key = conv.sender.id || conv.sender.email || conv.sender.displayName;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(conv);
    }

    return Array.from(map.entries()).map(([_, convs]) => ({
      person: convs[0].sender,
      conversations: convs.sort((a, b) => b.urgencyScore - a.urgencyScore)
    }));
  }, [group.conversations]);

  const criticalCount = group.conversations.filter(c => c.urgencyScore >= 9).length;
  const highCount = group.conversations.filter(c => c.urgencyScore >= 7 && c.urgencyScore < 9).length;

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        aria-expanded={isExpanded}
      >
        <span className={styles.expandIcon}>
          {isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
        </span>

        <div className={styles.teamIcon}>
          {group.team.photoUrl ? (
            <Avatar
              image={{ src: group.team.photoUrl }}
              size={32}
            />
          ) : (
            <Avatar
              icon={<PeopleTeamRegular />}
              size={32}
              color="colorful"
            />
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.nameRow}>
            <Text weight="semibold" size={300} className={styles.name}>
              {group.team.displayName}
            </Text>
            <div className={styles.peopleSection}>
              <AvatarStack people={group.people} maxVisible={3} size={20} />
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                {group.people.length} {group.people.length === 1 ? 'person' : 'people'}
              </Text>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <Text size={200}>
                {group.itemCount} item{group.itemCount !== 1 ? 's' : ''}
              </Text>
            </div>
            <div className={styles.stat}>
              <ClockRegular style={{ fontSize: '12px' }} />
              <Text size={200}>{formatWaitTime(group.totalWaitHours)}</Text>
            </div>
            {group.snoozedCount > 0 && (
              <div className={styles.stat}>
                <Text size={200}>({group.snoozedCount} snoozed)</Text>
              </div>
            )}
          </div>
        </div>

        <div className={styles.urgencyBadges}>
          {criticalCount > 0 && (
            <Badge appearance="filled" color="danger" size="small">
              {criticalCount} critical
            </Badge>
          )}
          {highCount > 0 && (
            <Badge appearance="filled" color="warning" size="small">
              {highCount} high
            </Badge>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.conversationList}>
          {conversationsByPerson.map(({ person, conversations }) => (
            <div key={person.id || person.email} className={styles.personSubgroup}>
              <div className={styles.personHeader}>
                <Avatar
                  name={person.displayName}
                  image={person.photoUrl ? { src: person.photoUrl } : undefined}
                  size={24}
                />
                <Text weight="medium" size={200}>
                  {person.displayName}
                </Text>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                  ({conversations.length} item{conversations.length !== 1 ? 's' : ''})
                </Text>
              </div>

              {conversations.map(conversation => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  onDismiss={onDismiss}
                  onSnooze={onSnooze}
                  onUnsnooze={onUnsnooze}
                  onQuickReply={onQuickReply}
                  showSender={false}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
