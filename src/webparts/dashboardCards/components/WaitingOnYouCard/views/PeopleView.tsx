// src/webparts/dashboardCards/components/WaitingOnYouCard/views/PeopleView.tsx

import * as React from 'react';
import {
  Text,
  tokens,
  makeStyles
} from '@fluentui/react-components';
import { PersonGroup as PersonGroupType, StaleConversation } from '../../../models/WaitingOnYou';
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

interface PeopleViewProps {
  groups: PersonGroupType[];
  ungrouped: PersonGroupType[];
  expandedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onDismiss: (id: string) => void;
  onSnooze: (conversation: StaleConversation) => void;
  onUnsnooze: (id: string) => void;
  onQuickReply?: (chatId: string, replyToId: string, message: string, isChannel: boolean) => Promise<boolean>;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  groups,
  ungrouped,
  expandedGroups,
  onToggleGroup,
  onDismiss,
  onSnooze,
  onUnsnooze,
  onQuickReply
}) => {
  const styles = useStyles();

  // Separate priority groups
  const managerGroups = groups.filter(g => g.person.relationship === 'manager');
  const directReportGroups = groups.filter(g => g.person.relationship === 'direct-report');
  const frequentGroups = groups.filter(g => g.person.relationship === 'frequent');
  const externalGroups = groups.filter(g => g.person.relationship === 'external');
  const otherGroups = groups.filter(g => g.person.relationship === 'other' || g.person.relationship === 'same-team');

  const allGroups = [...groups, ...ungrouped];

  if (allGroups.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text size={400} weight="semibold">All caught up!</Text>
        <Text size={200}>No one is waiting on you right now.</Text>
      </div>
    );
  }

  const renderSection = (title: string, sectionGroups: PersonGroupType[]) => {
    if (sectionGroups.length === 0) return null;

    return (
      <div className={styles.section}>
        <Text size={200} className={styles.sectionTitle}>{title}</Text>
        {sectionGroups.map(group => (
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
    );
  };

  return (
    <div className={styles.container}>
      {renderSection('From your manager', managerGroups)}
      {renderSection('From your direct reports', directReportGroups)}
      {renderSection('Frequent collaborators', frequentGroups)}
      {renderSection('External contacts', externalGroups)}
      {renderSection('Others', otherGroups)}
      {renderSection('Other conversations', ungrouped)}
    </div>
  );
};
