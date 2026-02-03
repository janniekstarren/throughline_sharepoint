// src/webparts/dashboardCards/components/WaitingOnYouCard/views/TeamsView.tsx

import * as React from 'react';
import {
  Text,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import { TeamGroup as TeamGroupType, PersonGroup as PersonGroupType, StaleConversation } from '../../../models/WaitingOnYou';
import { TeamGroup } from '../components/TeamGroup';
import { PersonGroup } from '../components/PersonGroup';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  section: {
    marginBottom: tokens.spacingVerticalS,
  },
  sectionTitle: {
    marginBottom: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground3,
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

interface TeamsViewProps {
  teamGroups: TeamGroupType[];
  ungroupedByPerson: PersonGroupType[];
  expandedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onDismiss: (id: string) => void;
  onSnooze: (conversation: StaleConversation) => void;
  onUnsnooze: (id: string) => void;
  onQuickReply?: (chatId: string, replyToId: string, message: string, isChannel: boolean) => Promise<boolean>;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teamGroups,
  ungroupedByPerson,
  expandedGroups,
  onToggleGroup,
  onDismiss,
  onSnooze,
  onUnsnooze,
  onQuickReply
}) => {
  const styles = useStyles();

  if (teamGroups.length === 0 && ungroupedByPerson.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text size={400} weight="semibold">All caught up!</Text>
        <Text size={200}>No teams are waiting on you right now.</Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {teamGroups.length > 0 && (
        <div className={styles.section}>
          <Text size={200} className={styles.sectionTitle}>By Team/Project</Text>
          {teamGroups.map(group => (
            <TeamGroup
              key={group.team.id}
              group={group}
              isExpanded={expandedGroups.has(group.team.id)}
              onToggle={() => onToggleGroup(group.team.id)}
              onDismiss={onDismiss}
              onSnooze={onSnooze}
              onUnsnooze={onUnsnooze}
              onQuickReply={onQuickReply}
            />
          ))}
        </div>
      )}

      {ungroupedByPerson.length > 0 && (
        <div className={styles.section}>
          <Text size={200} className={styles.sectionTitle}>Not associated with a team</Text>
          {ungroupedByPerson.map(group => (
            <PersonGroup
              key={group.person.id || group.person.email}
              group={group}
              isExpanded={expandedGroups.has(group.person.id || group.person.email)}
              onToggle={() => onToggleGroup(group.person.id || group.person.email)}
              onDismiss={onDismiss}
              onSnooze={onSnooze}
              onUnsnooze={onUnsnooze}
              onQuickReply={onQuickReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};
