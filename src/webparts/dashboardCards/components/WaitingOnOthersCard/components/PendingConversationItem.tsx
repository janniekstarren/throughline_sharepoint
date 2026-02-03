import * as React from 'react';
import {
  Text,
  Badge,
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuDivider,
  Tooltip,
  tokens,
  makeStyles,
  mergeClasses
} from '@fluentui/react-components';
import {
  MailRegular,
  ChatRegular,
  ClockRegular,
  MoreHorizontalRegular,
  SendRegular,
  CheckmarkCircleRegular,
  OpenRegular,
  ClockAlarmRegular,
  DismissCircleRegular,
  AlertRegular
} from '@fluentui/react-icons';
import { PendingResponse } from '../../../models/WaitingOnOthers';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalXS,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusSmall,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  containerSnoozed: {
    opacity: 0.6,
  },
  containerReminded: {
    borderLeft: `2px solid ${tokens.colorPaletteGreenBorder2}`,
  },
  icon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '14px',
    marginTop: '2px',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  subject: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorNeutralForeground3,
  },
  longWait: {
    color: tokens.colorPaletteMarigoldForeground1,
  },
  badge: {
    height: '14px',
    fontSize: '9px',
  },
  reminderIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    color: tokens.colorPaletteGreenForeground1,
    fontSize: tokens.fontSizeBase200,
  },
});

interface PendingConversationItemProps {
  item: PendingResponse;
  onSendReminder: () => void;
  onResolve: (resolution: 'responded' | 'gave-up' | 'no-longer-needed') => void;
  onSnooze: () => void;
  onUnsnooze?: () => void;
  onClick: () => void;
}

export const PendingConversationItem: React.FC<PendingConversationItemProps> = ({
  item,
  onSendReminder,
  onResolve,
  onSnooze,
  onUnsnooze,
  onClick
}) => {
  const styles = useStyles();

  const isLongWait = item.waitingDuration > 72; // > 3 days
  const isSnoozed = !!item.snoozedUntil;
  const wasReminded = !!item.reminderSentAt;

  const formatDuration = (hours: number): string => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day' : `${days} days`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getTypeIcon = (): React.ReactElement => {
    switch (item.conversationType) {
      case 'email': return <MailRegular className={styles.icon} />;
      case 'teams-chat': return <ChatRegular className={styles.icon} />;
      default: return <MailRegular className={styles.icon} />;
    }
  };

  return (
    <div
      className={mergeClasses(
        styles.container,
        isSnoozed && styles.containerSnoozed,
        wasReminded && styles.containerReminded
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {getTypeIcon()}

      <div className={styles.content}>
        <Text size={300} className={styles.subject}>
          {item.subject}
        </Text>

        {wasReminded && item.reminderSentAt && (
          <div className={styles.reminderIndicator}>
            <CheckmarkCircleRegular style={{ fontSize: '12px' }} />
            <Text size={100}>Reminder sent {formatDate(item.reminderSentAt)}</Text>
          </div>
        )}

        {isSnoozed && item.snoozedUntil ? (
          <div className={styles.meta}>
            <ClockAlarmRegular style={{ fontSize: '12px' }} />
            <Text size={100}>Snoozed until {formatDate(item.snoozedUntil)}</Text>
          </div>
        ) : (
          <div className={mergeClasses(styles.meta, isLongWait && styles.longWait)}>
            <ClockRegular style={{ fontSize: '12px' }} />
            <Text size={100}>{formatDuration(item.waitingDuration)} waiting</Text>

            {item.wasQuestion && (
              <Badge className={styles.badge} appearance="tint" color="informative" size="tiny">?</Badge>
            )}

            {item.mentionedDeadline && (
              <Tooltip content="You mentioned a deadline" relationship="label">
                <AlertRegular style={{ fontSize: '12px', color: tokens.colorPaletteMarigoldForeground1 }} />
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* Quick action: Send reminder */}
      {!wasReminded && !isSnoozed && (
        <Tooltip content="Send reminder" relationship="label">
          <Button
            appearance="subtle"
            icon={<SendRegular />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onSendReminder();
            }}
          />
        </Tooltip>
      )}

      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            appearance="subtle"
            icon={<MoreHorizontalRegular />}
            size="small"
            onClick={(e) => e.stopPropagation()}
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem icon={<OpenRegular />} onClick={onClick}>
              Open conversation
            </MenuItem>
            {!wasReminded && (
              <MenuItem icon={<SendRegular />} onClick={onSendReminder}>
                Send reminder...
              </MenuItem>
            )}
            <MenuDivider />
            {isSnoozed ? (
              <MenuItem icon={<ClockAlarmRegular />} onClick={onUnsnooze}>
                Remove snooze
              </MenuItem>
            ) : (
              <MenuItem icon={<ClockAlarmRegular />} onClick={onSnooze}>
                Snooze...
              </MenuItem>
            )}
            <MenuDivider />
            <MenuItem
              icon={<CheckmarkCircleRegular />}
              onClick={() => onResolve('responded')}
            >
              They responded (elsewhere)
            </MenuItem>
            <MenuItem
              icon={<DismissCircleRegular />}
              onClick={() => onResolve('no-longer-needed')}
            >
              No longer needed
            </MenuItem>
            <MenuItem
              onClick={() => onResolve('gave-up')}
              style={{ color: tokens.colorNeutralForeground3 }}
            >
              Give up waiting
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default PendingConversationItem;
