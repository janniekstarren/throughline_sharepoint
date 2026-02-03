import * as React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { PersonOwesGroup as PersonOwesGroupType, PendingResponse } from '../../../models/WaitingOnOthers';
import { PersonOwesGroup } from '../components/PersonOwesGroup';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
});

interface PeopleViewProps {
  groups: PersonOwesGroupType[];
  expandedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onSendReminder: (item: PendingResponse) => void;
  onResolve: (itemId: string, resolution: 'responded' | 'gave-up' | 'no-longer-needed') => void;
  onSnooze: (item: PendingResponse) => void;
  onUnsnooze: (itemId: string) => void;
  onItemClick: (webUrl: string) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  groups,
  expandedGroups,
  onToggleGroup,
  onSendReminder,
  onResolve,
  onSnooze,
  onUnsnooze,
  onItemClick
}) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {groups.map(group => (
        <PersonOwesGroup
          key={group.person.id || group.person.email}
          group={group}
          isExpanded={expandedGroups.has(group.person.id || group.person.email)}
          onToggle={() => onToggleGroup(group.person.id || group.person.email)}
          onSendReminder={onSendReminder}
          onResolve={onResolve}
          onSnooze={onSnooze}
          onUnsnooze={onUnsnooze}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};

export default PeopleView;
