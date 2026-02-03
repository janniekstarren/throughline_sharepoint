import * as React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Tooltip,
  Button,
  Badge,
  Persona,
  makeStyles,
  tokens,
  mergeClasses,
  FluentProvider,
  webLightTheme,
  Theme,
  Caption1,
  Body1,
  Body1Strong,
} from '@fluentui/react-components';
import {
  // Email actions
  ArrowReply20Regular,
  ArrowForward20Regular,
  Flag20Regular,
  MailRead20Regular,
  Delete20Regular,
  Mail24Regular,
  Attach16Regular,
  // Event actions
  Video20Regular,
  CheckmarkCircle20Regular,
  QuestionCircle20Regular,
  DismissCircle20Regular,
  CalendarLtr24Regular,
  Location16Regular,
  Clock16Regular,
  // Task actions
  TaskListSquareLtr24Regular,
  CheckmarkCircle24Regular,
  // File actions
  ArrowDownload20Regular,
  Link20Regular,
  Document24Regular,
  // Team actions
  Chat20Regular,
  Mail20Regular,
  CalendarAdd20Regular,
  Person24Regular,
  // Activity
  Pulse24Regular,
  // Common
  Open20Regular,
} from '@fluentui/react-icons';
import {
  IEmailMessage,
  ICalendarEvent,
  ITaskItem,
  IFileItem,
  ISharedFile,
  ITeamMember,
  ISiteActivity,
} from '../services/GraphService';

export type HoverCardItemType = 'email' | 'event' | 'task' | 'file' | 'sharedFile' | 'teamMember' | 'activity';

export type IHoverCardItem = IEmailMessage | ICalendarEvent | ITaskItem | IFileItem | ISharedFile | ITeamMember | ISiteActivity;

export interface IItemHoverCardProps {
  children: React.ReactNode;
  item: IHoverCardItem;
  itemType: HoverCardItemType;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
}

// Fluent 2 consistent styles - matches existing card patterns
const useStyles = makeStyles({
  popoverSurface: {
    minWidth: '320px',
    maxWidth: '380px',
    padding: '0',
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow16,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },

  headerIcon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },

  headerTextGroup: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },

  headerLabel: {
    color: tokens.colorNeutralForeground3,
  },

  headerTitle: {
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  content: {
    padding: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    maxHeight: '260px',
    overflowY: 'auto',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  fieldLabel: {
    color: tokens.colorNeutralForeground3,
  },

  fieldValue: {
    color: tokens.colorNeutralForeground1,
  },

  fieldValueSecondary: {
    color: tokens.colorNeutralForeground3,
  },

  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },

  fieldIcon: {
    fontSize: '16px',
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },

  overdue: {
    color: tokens.colorPaletteRedForeground1,
  },

  preview: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    lineHeight: '1.5',
    maxHeight: '60px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusSmall,
  },

  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
  },

  personaSection: {
    paddingBottom: tokens.spacingVerticalXS,
  },

  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    gap: tokens.spacingHorizontalS,
  },

  actionsLeft: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },

  actionsRight: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },

  dangerousButton: {
    color: tokens.colorPaletteRedForeground1,
    ':hover': {
      color: tokens.colorPaletteRedForeground2,
      backgroundColor: tokens.colorPaletteRedBackground1,
    },
  },

  triggerWrapper: {
    display: 'block',
    width: '100%',
  },
});

// Action button with tooltip
interface IActionButtonProps {
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
  primary?: boolean;
  dangerous?: boolean;
  className?: string;
}

const ActionButton: React.FC<IActionButtonProps> = ({ icon, label, onClick, primary, dangerous, className }) => {
  const styles = useStyles();

  return (
    <Tooltip content={label} relationship="label" showDelay={500} hideDelay={0}>
      <Button
        appearance={primary ? 'primary' : 'subtle'}
        size="small"
        icon={icon}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={dangerous ? mergeClasses(styles.dangerousButton, className) : className}
      />
    </Tooltip>
  );
};

// Hover delay in milliseconds
const HOVER_DELAY = 400;
const CLOSE_DELAY = 300;

export const ItemHoverCard: React.FC<IItemHoverCardProps> = ({
  children,
  item,
  itemType,
  onAction,
  theme,
}) => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const openTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimeouts = (): void => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => clearTimeouts();
  }, []);

  // Close popover on scroll
  React.useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (): void => {
      clearTimeouts();
      setIsOpen(false);
    };

    const scrollableParent = triggerRef.current?.closest('[class*="cardContent"]');
    if (scrollableParent) {
      scrollableParent.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      if (scrollableParent) {
        scrollableParent.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen]);

  const handleTriggerMouseEnter = (): void => {
    clearTimeouts();
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, HOVER_DELAY);
  };

  const handleTriggerMouseLeave = (): void => {
    clearTimeouts();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, CLOSE_DELAY);
  };

  const handlePopoverMouseEnter = (): void => {
    clearTimeouts();
  };

  const handlePopoverMouseLeave = (): void => {
    clearTimeouts();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, CLOSE_DELAY);
  };

  const handleAction = (action: string): void => {
    if (onAction) {
      onAction(action, item, itemType);
    }
  };

  const openExternal = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Email content
  const renderEmailContent = (email: IEmailMessage): JSX.Element => (
    <>
      <div className={styles.header}>
        <Mail24Regular className={styles.headerIcon} />
        <div className={styles.headerTextGroup}>
          <Caption1 className={styles.headerLabel}>Email</Caption1>
          <Body1Strong className={styles.headerTitle}>{email.subject || '(No subject)'}</Body1Strong>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>From</Caption1>
          <Body1 className={styles.fieldValue}>{email.from.name}</Body1>
          <Caption1 className={styles.fieldValueSecondary}>{email.from.email}</Caption1>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>Received</Caption1>
          <Body1 className={styles.fieldValue}>{formatDateTime(email.receivedDateTime)}</Body1>
        </div>
        {email.bodyPreview && (
          <div className={styles.preview}>{email.bodyPreview}</div>
        )}
        <div className={styles.badges}>
          {email.importance === 'high' && (
            <Badge appearance="filled" color="danger" size="small">Important</Badge>
          )}
          {email.hasAttachments && (
            <Badge appearance="tint" color="informative" size="small" icon={<Attach16Regular />}>
              Attachments
            </Badge>
          )}
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.actionsLeft}>
          <ActionButton icon={<ArrowReply20Regular />} label="Reply" onClick={() => handleAction('reply')} />
          <ActionButton icon={<ArrowForward20Regular />} label="Forward" onClick={() => handleAction('forward')} />
          <ActionButton icon={<Flag20Regular />} label="Flag" onClick={() => handleAction('flag')} />
          <ActionButton icon={<MailRead20Regular />} label={email.isRead ? 'Mark as unread' : 'Mark as read'} onClick={() => handleAction('markRead')} />
          <ActionButton icon={<Delete20Regular />} label="Delete" onClick={() => handleAction('delete')} dangerous />
        </div>
        <div className={styles.actionsRight}>
          <ActionButton icon={<Open20Regular />} label="Open in Outlook" onClick={() => openExternal(email.webLink)} primary />
        </div>
      </div>
    </>
  );

  // Event content
  const renderEventContent = (event: ICalendarEvent): JSX.Element => (
    <>
      <div className={styles.header}>
        <CalendarLtr24Regular className={styles.headerIcon} />
        <div className={styles.headerTextGroup}>
          <Caption1 className={styles.headerLabel}>Event</Caption1>
          <Body1Strong className={styles.headerTitle}>{event.subject}</Body1Strong>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>Date</Caption1>
          <Body1 className={styles.fieldValue}>
            {event.isAllDay
              ? event.start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
              : event.start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </Body1>
        </div>
        {!event.isAllDay && (
          <div className={styles.fieldRow}>
            <Clock16Regular className={styles.fieldIcon} />
            <Body1 className={styles.fieldValue}>{formatTime(event.start)} - {formatTime(event.end)}</Body1>
          </div>
        )}
        {event.location && (
          <div className={styles.fieldRow}>
            <Location16Regular className={styles.fieldIcon} />
            <Body1 className={styles.fieldValue}>{event.location}</Body1>
          </div>
        )}
        {event.isOnlineMeeting && (
          <div className={styles.badges}>
            <Badge appearance="tint" color="brand" size="small" icon={<Video20Regular />}>
              Teams Meeting
            </Badge>
          </div>
        )}
      </div>
      <div className={styles.toolbar}>
        <div className={styles.actionsLeft}>
          {event.isOnlineMeeting && event.onlineMeetingUrl && (
            <ActionButton icon={<Video20Regular />} label="Join meeting" onClick={() => openExternal(event.onlineMeetingUrl!)} primary />
          )}
          <ActionButton icon={<CheckmarkCircle20Regular />} label="Accept" onClick={() => handleAction('accept')} />
          <ActionButton icon={<QuestionCircle20Regular />} label="Tentative" onClick={() => handleAction('tentative')} />
          <ActionButton icon={<DismissCircle20Regular />} label="Decline" onClick={() => handleAction('decline')} />
        </div>
        <div className={styles.actionsRight}>
          <ActionButton icon={<Open20Regular />} label="Open in Calendar" onClick={() => openExternal(event.webLink)} primary={!event.isOnlineMeeting} />
        </div>
      </div>
    </>
  );

  // Task content
  const renderTaskContent = (task: ITaskItem): JSX.Element => (
    <>
      <div className={styles.header}>
        <TaskListSquareLtr24Regular className={styles.headerIcon} />
        <div className={styles.headerTextGroup}>
          <Caption1 className={styles.headerLabel}>Task</Caption1>
          <Body1Strong className={styles.headerTitle}>{task.title}</Body1Strong>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>List</Caption1>
          <Body1 className={styles.fieldValue}>{task.listName}</Body1>
        </div>
        {task.dueDateTime && (
          <div className={styles.field}>
            <Caption1 className={styles.fieldLabel}>Due</Caption1>
            <Body1 className={mergeClasses(styles.fieldValue, task.isOverdue && styles.overdue)}>
              {task.dueDateTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </Body1>
          </div>
        )}
        <div className={styles.badges}>
          <Badge
            appearance="tint"
            color={task.status === 'completed' ? 'success' : task.status === 'inProgress' ? 'brand' : 'warning'}
            size="small"
          >
            {task.status === 'notStarted' ? 'Not Started' : task.status === 'inProgress' ? 'In Progress' : 'Completed'}
          </Badge>
          {task.importance === 'high' && (
            <Badge appearance="filled" color="danger" size="small">High Priority</Badge>
          )}
          {task.isOverdue && (
            <Badge appearance="filled" color="danger" size="small">Overdue</Badge>
          )}
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.actionsLeft}>
          <ActionButton icon={<CheckmarkCircle24Regular />} label="Mark complete" onClick={() => handleAction('complete')} primary />
        </div>
        <div className={styles.actionsRight}>
          <ActionButton icon={<Open20Regular />} label="Open in Planner" onClick={() => openExternal('https://tasks.office.com')} />
        </div>
      </div>
    </>
  );

  // File content
  const renderFileContent = (file: IFileItem): JSX.Element => (
    <>
      <div className={styles.header}>
        <Document24Regular className={styles.headerIcon} />
        <div className={styles.headerTextGroup}>
          <Caption1 className={styles.headerLabel}>{file.isFolder ? 'Folder' : (file.fileType?.toUpperCase() || 'File')}</Caption1>
          <Body1Strong className={styles.headerTitle}>{file.name}</Body1Strong>
        </div>
      </div>
      <div className={styles.content}>
        {!file.isFolder && (
          <div className={styles.field}>
            <Caption1 className={styles.fieldLabel}>Size</Caption1>
            <Body1 className={styles.fieldValue}>{formatFileSize(file.size)}</Body1>
          </div>
        )}
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>Modified</Caption1>
          <Body1 className={styles.fieldValue}>{formatDateTime(file.lastModifiedDateTime)}</Body1>
        </div>
        {file.lastModifiedBy && (
          <div className={styles.field}>
            <Caption1 className={styles.fieldLabel}>By</Caption1>
            <Body1 className={styles.fieldValue}>{file.lastModifiedBy}</Body1>
          </div>
        )}
      </div>
      <div className={styles.toolbar}>
        <div className={styles.actionsLeft}>
          {!file.isFolder && (
            <>
              <ActionButton icon={<ArrowDownload20Regular />} label="Download" onClick={() => handleAction('download')} />
              <ActionButton icon={<Link20Regular />} label="Copy link" onClick={() => handleAction('copyLink')} />
            </>
          )}
        </div>
        <div className={styles.actionsRight}>
          <ActionButton icon={<Open20Regular />} label="Open in SharePoint" onClick={() => openExternal(file.webUrl)} primary />
        </div>
      </div>
    </>
  );

  // Shared file content
  const renderSharedFileContent = (file: ISharedFile): JSX.Element => (
    <>
      <div className={styles.header}>
        <Document24Regular className={styles.headerIcon} />
        <div className={styles.headerTextGroup}>
          <Caption1 className={styles.headerLabel}>{file.fileType?.toUpperCase() || 'File'}</Caption1>
          <Body1Strong className={styles.headerTitle}>{file.name}</Body1Strong>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>Size</Caption1>
          <Body1 className={styles.fieldValue}>{formatFileSize(file.size)}</Body1>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>Shared by</Caption1>
          <Body1 className={styles.fieldValue}>{file.sharedBy}</Body1>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>Shared</Caption1>
          <Body1 className={styles.fieldValue}>{formatDateTime(file.sharedDateTime)}</Body1>
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.actionsLeft}>
          <ActionButton icon={<ArrowDownload20Regular />} label="Download" onClick={() => handleAction('download')} />
          <ActionButton icon={<Link20Regular />} label="Copy link" onClick={() => handleAction('copyLink')} />
        </div>
        <div className={styles.actionsRight}>
          <ActionButton icon={<Open20Regular />} label="Open in SharePoint" onClick={() => openExternal(file.webUrl)} primary />
        </div>
      </div>
    </>
  );

  // Team member content
  const renderTeamMemberContent = (member: ITeamMember): JSX.Element => (
    <>
      <div className={styles.header}>
        <Person24Regular className={styles.headerIcon} />
        <div className={styles.headerTextGroup}>
          <Caption1 className={styles.headerLabel}>Team Member</Caption1>
          <Body1Strong className={styles.headerTitle}>{member.displayName}</Body1Strong>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.personaSection}>
          <Persona
            name={member.displayName}
            secondaryText={member.jobTitle}
            size="large"
            avatar={{
              image: member.photoUrl ? { src: member.photoUrl } : undefined,
            }}
          />
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>Email</Caption1>
          <Body1 className={styles.fieldValue}>{member.email}</Body1>
        </div>
        <div className={styles.badges}>
          <Badge
            appearance="tint"
            color={
              member.presence === 'Available' ? 'success' :
              member.presence === 'Busy' || member.presence === 'DoNotDisturb' ? 'danger' :
              member.presence === 'Away' ? 'warning' : 'subtle'
            }
            size="small"
          >
            {member.presence === 'DoNotDisturb' ? 'Do Not Disturb' : member.presence || 'Unknown'}
          </Badge>
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.actionsLeft}>
          <ActionButton icon={<Chat20Regular />} label="Start chat" onClick={() => openExternal(`https://teams.microsoft.com/l/chat/0/0?users=${member.email}`)} primary />
          <ActionButton icon={<Mail20Regular />} label="Send email" onClick={() => openExternal(`mailto:${member.email}`)} />
          <ActionButton icon={<CalendarAdd20Regular />} label="Schedule meeting" onClick={() => handleAction('scheduleMeeting')} />
        </div>
        <div className={styles.actionsRight} />
      </div>
    </>
  );

  // Activity content
  const renderActivityContent = (activity: ISiteActivity): JSX.Element => (
    <>
      <div className={styles.header}>
        <Pulse24Regular className={styles.headerIcon} />
        <div className={styles.headerTextGroup}>
          <Caption1 className={styles.headerLabel}>Activity</Caption1>
          <Body1Strong className={styles.headerTitle}>{activity.itemName}</Body1Strong>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>Action</Caption1>
          <div className={styles.badges}>
            <Badge appearance="tint" color="brand" size="small">{activity.action}</Badge>
          </div>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>By</Caption1>
          <Body1 className={styles.fieldValue}>{activity.actor}</Body1>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.fieldLabel}>When</Caption1>
          <Body1 className={styles.fieldValue}>{formatDateTime(activity.timestamp)}</Body1>
        </div>
      </div>
      {activity.itemUrl && (
        <div className={styles.toolbar}>
          <div className={styles.actionsLeft} />
          <div className={styles.actionsRight}>
            <ActionButton icon={<Open20Regular />} label="View item" onClick={() => openExternal(activity.itemUrl!)} primary />
          </div>
        </div>
      )}
    </>
  );

  const renderContent = (): JSX.Element | null => {
    switch (itemType) {
      case 'email':
        return renderEmailContent(item as IEmailMessage);
      case 'event':
        return renderEventContent(item as ICalendarEvent);
      case 'task':
        return renderTaskContent(item as ITaskItem);
      case 'file':
        return renderFileContent(item as IFileItem);
      case 'sharedFile':
        return renderSharedFileContent(item as ISharedFile);
      case 'teamMember':
        return renderTeamMemberContent(item as ITeamMember);
      case 'activity':
        return renderActivityContent(item as ISiteActivity);
      default:
        return null;
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(_, data) => {
        if (!data.open) {
          clearTimeouts();
          setIsOpen(false);
        }
      }}
      positioning={{
        position: 'after',
        align: 'start',
        offset: { mainAxis: 4, crossAxis: 0 },
      }}
      withArrow
      trapFocus={false}
    >
      <PopoverTrigger disableButtonEnhancement>
        <div
          ref={triggerRef}
          className={styles.triggerWrapper}
          onMouseEnter={handleTriggerMouseEnter}
          onMouseLeave={handleTriggerMouseLeave}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverSurface
        ref={popoverRef}
        className={styles.popoverSurface}
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
      >
        <FluentProvider theme={theme || webLightTheme}>
          {renderContent()}
        </FluentProvider>
      </PopoverSurface>
    </Popover>
  );
};

export default ItemHoverCard;
