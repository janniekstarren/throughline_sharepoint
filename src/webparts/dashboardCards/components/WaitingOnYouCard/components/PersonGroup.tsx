// src/webparts/dashboardCards/components/WaitingOnYouCard/components/PersonGroup.tsx

import * as React from 'react';
import {
  Text,
  Badge,
  Avatar,
  tokens,
  makeStyles,
  mergeClasses
} from '@fluentui/react-components';
import {
  ChevronDownRegular,
  ChevronRightRegular,
  ClockRegular,
  PersonRegular,
  BriefcaseRegular,
  PeopleTeamRegular
} from '@fluentui/react-icons';
import { PersonGroup as PersonGroupType, StaleConversation } from '../../../models/WaitingOnYou';
import { ConversationItem } from './ConversationItem';

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
  managerHighlight: {
    borderLeft: `3px solid ${tokens.colorPaletteDarkOrangeBorder1}`,
  },
  directReportHighlight: {
    borderLeft: `3px solid ${tokens.colorPaletteMarigoldBorder1}`,
  },
  expandIcon: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  avatarSection: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  relationshipBadge: {
    flexShrink: 0,
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
});

interface PersonGroupProps {
  group: PersonGroupType;
  isExpanded: boolean;
  onToggle: () => void;
  onDismiss: (id: string) => void;
  onSnooze: (conversation: StaleConversation) => void;
  onUnsnooze: (id: string) => void;
  onQuickReply?: (chatId: string, replyToId: string, message: string, isChannel: boolean) => Promise<boolean>;
}

export const PersonGroup: React.FC<PersonGroupProps> = ({
  group,
  isExpanded,
  onToggle,
  onDismiss,
  onSnooze,
  onUnsnooze,
  onQuickReply
}) => {
  const styles = useStyles();

  const getRelationshipIcon = () => {
    switch (group.person.relationship) {
      case 'manager':
        return <BriefcaseRegular />;
      case 'direct-report':
        return <PersonRegular />;
      case 'frequent':
        return <PeopleTeamRegular />;
      default:
        return null;
    }
  };

  const getRelationshipLabel = (): string | null => {
    switch (group.person.relationship) {
      case 'manager':
        return 'Manager';
      case 'direct-report':
        return 'Report';
      case 'frequent':
        return 'Frequent';
      case 'external':
        return 'External';
      default:
        return null;
    }
  };

  const getRelationshipColor = (): 'danger' | 'warning' | 'informative' | 'subtle' => {
    switch (group.person.relationship) {
      case 'manager':
        return 'danger';
      case 'direct-report':
        return 'warning';
      case 'external':
        return 'informative';
      default:
        return 'subtle';
    }
  };

  const formatWaitTime = (hours: number): string => {
    if (hours < 24) {
      return `${hours}h total wait`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d total wait`;
  };

  const getContainerClass = () => {
    const classes = [styles.container];
    if (group.person.relationship === 'manager') {
      classes.push(styles.managerHighlight);
    } else if (group.person.relationship === 'direct-report') {
      classes.push(styles.directReportHighlight);
    }
    return mergeClasses(...classes);
  };

  const relationshipLabel = getRelationshipLabel();
  const criticalCount = group.conversations.filter(c => c.urgencyScore >= 9).length;
  const highCount = group.conversations.filter(c => c.urgencyScore >= 7 && c.urgencyScore < 9).length;

  return (
    <div className={getContainerClass()}>
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

        <div className={styles.avatarSection}>
          <Avatar
            name={group.person.displayName}
            image={group.person.photoUrl ? { src: group.person.photoUrl } : undefined}
            size={32}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.nameRow}>
            <Text weight="semibold" size={300} className={styles.name}>
              {group.person.displayName}
            </Text>
            {relationshipLabel && (
              <Badge
                appearance="outline"
                color={getRelationshipColor()}
                size="small"
                className={styles.relationshipBadge}
                icon={getRelationshipIcon()}
              >
                {relationshipLabel}
              </Badge>
            )}
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
          {group.conversations
            .sort((a, b) => b.urgencyScore - a.urgencyScore)
            .map(conversation => (
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
      )}
    </div>
  );
};
