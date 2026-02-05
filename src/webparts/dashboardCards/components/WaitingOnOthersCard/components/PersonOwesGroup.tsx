import * as React from 'react';
import {
  Avatar,
  Text,
  Badge,
  tokens,
  makeStyles,
  mergeClasses
} from '@fluentui/react-components';
import {
  ChevronDownRegular,
  ChevronRightRegular,
  SendRegular
} from '@fluentui/react-icons';
import { PersonOwesGroup as PersonOwesGroupType, PendingResponse } from '../../../models/WaitingOnOthers';
import { PendingConversationItem } from './PendingConversationItem';

const useStyles = makeStyles({
  container: {
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    overflow: 'hidden',
  },
  containerLongWait: {
    borderLeft: `3px solid ${tokens.colorPaletteMarigoldBorder2}`,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalM,            // Increased from spacingVerticalS for more breathing room
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  personInfo: {
    flex: 1,
    minWidth: 0,
  },
  personName: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  stats: {
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',         // Enable text truncation
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  expandIcon: {
    color: tokens.colorNeutralForeground3,
  },
  items: {
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalM,
    paddingBottom: tokens.spacingVerticalS,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  reminderBadge: {
    marginLeft: 'auto',
    marginRight: tokens.spacingHorizontalS,
  },
});

interface PersonOwesGroupProps {
  group: PersonOwesGroupType;
  isExpanded: boolean;
  onToggle: () => void;
  onSendReminder: (item: PendingResponse) => void;
  onResolve: (itemId: string, resolution: 'responded' | 'gave-up' | 'no-longer-needed') => void;
  onSnooze: (item: PendingResponse) => void;
  onUnsnooze: (itemId: string) => void;
  onItemClick: (webUrl: string) => void;
}

export const PersonOwesGroup: React.FC<PersonOwesGroupProps> = ({
  group,
  isExpanded,
  onToggle,
  onSendReminder,
  onResolve,
  onSnooze,
  onUnsnooze,
  onItemClick
}) => {
  const styles = useStyles();

  const isLongWait = group.longestWaitHours > 72;

  const formatWaitTime = (hours: number): string => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day' : `${days} days`;
  };

  const getRelationshipBadge = (): React.ReactElement | null => {
    switch (group.person.relationship) {
      case 'manager':
        return <Badge appearance="filled" color="brand" size="small">Manager</Badge>;
      case 'direct-report':
        return <Badge appearance="tint" color="informative" size="small">Direct</Badge>;
      case 'external':
        return <Badge appearance="outline" color="warning" size="small">External</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={mergeClasses(
      styles.container,
      isLongWait && styles.containerLongWait
    )}>
      <div
        className={styles.header}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
      >
        <Avatar
          name={group.person.displayName}
          image={group.person.photoUrl ? { src: group.person.photoUrl } : undefined}
          size={36}
        />

        <div className={styles.personInfo}>
          <div className={styles.personName}>
            <Text weight="semibold" size={300}>{group.person.displayName}</Text>
            {getRelationshipBadge()}
          </div>
          <Text size={200} className={styles.stats}>
            {group.itemCount} item{group.itemCount > 1 ? 's' : ''} · {formatWaitTime(group.longestWaitHours)} longest wait
          </Text>
        </div>

        {group.reminderSentCount > 0 && (
          <Badge
            appearance="tint"
            color="success"
            size="small"
            icon={<SendRegular />}
            className={styles.reminderBadge}
          >
            {group.reminderSentCount} reminded
          </Badge>
        )}

        {isExpanded ? (
          <ChevronDownRegular className={styles.expandIcon} />
        ) : (
          <ChevronRightRegular className={styles.expandIcon} />
        )}
      </div>

      {isExpanded && (
        <div className={styles.items}>
          {group.pendingItems.map(item => (
            <PendingConversationItem
              key={item.id}
              item={item}
              onSendReminder={() => onSendReminder(item)}
              onResolve={(resolution) => onResolve(item.id, resolution)}
              onSnooze={() => onSnooze(item)}
              onUnsnooze={() => onUnsnooze(item.id)}
              onClick={() => onItemClick(item.webUrl)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonOwesGroup;
