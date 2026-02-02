import * as React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Tooltip,
  Button,
  Badge,
  Persona,
  Divider,
  Text,
  Caption1,
  Caption1Strong,
  Body1,
  Body1Strong,
  makeStyles,
  tokens,
  mergeClasses,
  FluentProvider,
  webLightTheme,
  Theme,
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

// Fluent 2 styles using makeStyles and design tokens
// Following Fluent 2 design guidelines: softer shadows, larger radius, more whitespace
const useStyles = makeStyles({
  popoverSurface: {
    minWidth: '320px',
    maxWidth: '400px',
    padding: '0',
    borderRadius: tokens.borderRadiusLarge, // Fluent 2: larger border radius
    boxShadow: tokens.shadow8, // Fluent 2: softer shadow
    backgroundColor: tokens.colorNeutralBackground1,
    border: 'none', // Fluent 2: rely on shadow, not border
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`, // More padding
    backgroundColor: tokens.colorNeutralBackground1, // Same as content
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  headerIcon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
  },
  headerText: {
    color: tokens.colorNeutralForeground2,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontSize: tokens.fontSizeBase200,
  },
  content: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`, // More horizontal padding
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM, // More breathing room
  },
  title: {
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase400,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
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
  label: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  value: {
    color: tokens.colorNeutralForeground1,
  },
  subValue: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  overdue: {
    color: tokens.colorPaletteRedForeground1,
  },
  preview: {
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase300,
    maxHeight: '60px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalXS,
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
  personaSection: {
    marginBottom: tokens.spacingVerticalM,
  },
  divider: {
    margin: '0',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  actions: {
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

// Hover delay in milliseconds - prevents popover from appearing too quickly
const HOVER_DELAY = 400;

export const ItemHoverCard: React.FC<IItemHoverCardProps> = ({
  children,
  item,
  itemType,
  onAction,
  theme,
}) => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle hover with delay
  React.useEffect(() => {
    if (isHovering) {
      // Start timeout to open popover after delay
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, HOVER_DELAY);
    } else {
      // Clear timeout if mouse leaves before delay completes
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovering]);

  // Close popover on scroll
  React.useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (): void => {
      setIsOpen(false);
      setIsHovering(false);
    };

    // Listen for scroll events on all scrollable ancestors
    const scrollableParent = triggerRef.current?.closest('[class*="cardContent"]');
    if (scrollableParent) {
      scrollableParent.addEventListener('scroll', handleScroll, { passive: true });
    }
    // Also listen on window for any other scroll events
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      if (scrollableParent) {
        scrollableParent.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [isOpen]);

  const handleMouseEnter = (): void => {
    setIsHovering(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovering(false);
    // Close after a small delay to allow moving to popover
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Keep popover open when mouse enters the popover surface
  const handlePopoverMouseEnter = (): void => {
    setIsHovering(true);
  };

  // Close when mouse leaves the popover surface
  const handlePopoverMouseLeave = (): void => {
    setIsHovering(false);
    setIsOpen(false);
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

  // Email content and actions
  const renderEmailContent = (email: IEmailMessage): JSX.Element => (
    <>
      <div className={styles.header}>
        <Mail24Regular className={styles.headerIcon} />
        <Caption1Strong className={styles.headerText}>Email</Caption1Strong>
      </div>
      <div className={styles.content}>
        <div className={styles.field}>
          <Caption1 className={styles.label}>From</Caption1>
          <Body1Strong className={styles.value}>{email.from.name}</Body1Strong>
          <Caption1 className={styles.subValue}>{email.from.email}</Caption1>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.label}>Subject</Caption1>
          <Body1 className={styles.value}>{email.subject || '(No subject)'}</Body1>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.label}>Received</Caption1>
          <Caption1 className={styles.value}>{formatDateTime(email.receivedDateTime)}</Caption1>
        </div>
        {email.bodyPreview && (
          <Text size={200} className={styles.preview}>{email.bodyPreview}</Text>
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
      <Divider className={styles.divider} />
      <div className={styles.toolbar}>
        <div className={styles.actions}>
          <ActionButton
            icon={<ArrowReply20Regular />}
            label="Reply"
            onClick={() => handleAction('reply')}
          />
          <ActionButton
            icon={<ArrowForward20Regular />}
            label="Forward"
            onClick={() => handleAction('forward')}
          />
          <ActionButton
            icon={<Flag20Regular />}
            label="Flag"
            onClick={() => handleAction('flag')}
          />
          <ActionButton
            icon={<MailRead20Regular />}
            label={email.isRead ? 'Mark as unread' : 'Mark as read'}
            onClick={() => handleAction('markRead')}
          />
          <ActionButton
            icon={<Delete20Regular />}
            label="Delete"
            onClick={() => handleAction('delete')}
            dangerous
          />
        </div>
        <ActionButton
          icon={<Open20Regular />}
          label="Open in Outlook"
          onClick={() => openExternal(email.webLink)}
          primary
        />
      </div>
    </>
  );

  // Event content and actions
  const renderEventContent = (event: ICalendarEvent): JSX.Element => (
    <>
      <div className={styles.header}>
        <CalendarLtr24Regular className={styles.headerIcon} />
        <Caption1Strong className={styles.headerText}>Event</Caption1Strong>
      </div>
      <div className={styles.content}>
        <Body1Strong className={styles.title}>{event.subject}</Body1Strong>
        <div className={styles.fieldRow}>
          <CalendarLtr24Regular className={styles.fieldIcon} />
          <Body1 className={styles.value}>
            {event.isAllDay
              ? event.start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
              : event.start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
            }
          </Body1>
        </div>
        {!event.isAllDay && (
          <div className={styles.fieldRow}>
            <Clock16Regular className={styles.fieldIcon} />
            <Body1 className={styles.value}>{formatTime(event.start)} - {formatTime(event.end)}</Body1>
          </div>
        )}
        {event.location && (
          <div className={styles.fieldRow}>
            <Location16Regular className={styles.fieldIcon} />
            <Body1 className={styles.value}>{event.location}</Body1>
          </div>
        )}
        {event.isOnlineMeeting && (
          <Badge appearance="tint" color="brand" size="small" icon={<Video20Regular />}>
            Teams Meeting
          </Badge>
        )}
      </div>
      <Divider className={styles.divider} />
      <div className={styles.toolbar}>
        <div className={styles.actions}>
          {event.isOnlineMeeting && event.onlineMeetingUrl && (
            <ActionButton
              icon={<Video20Regular />}
              label="Join meeting"
              onClick={() => openExternal(event.onlineMeetingUrl!)}
              primary
            />
          )}
          <ActionButton
            icon={<CheckmarkCircle20Regular />}
            label="Accept"
            onClick={() => handleAction('accept')}
          />
          <ActionButton
            icon={<QuestionCircle20Regular />}
            label="Tentative"
            onClick={() => handleAction('tentative')}
          />
          <ActionButton
            icon={<DismissCircle20Regular />}
            label="Decline"
            onClick={() => handleAction('decline')}
          />
        </div>
        <ActionButton
          icon={<Open20Regular />}
          label="Open in Calendar"
          onClick={() => openExternal(event.webLink)}
          primary={!event.isOnlineMeeting}
        />
      </div>
    </>
  );

  // Task content and actions
  const renderTaskContent = (task: ITaskItem): JSX.Element => (
    <>
      <div className={styles.header}>
        <TaskListSquareLtr24Regular className={styles.headerIcon} />
        <Caption1Strong className={styles.headerText}>Task</Caption1Strong>
      </div>
      <div className={styles.content}>
        <Body1Strong className={styles.title}>{task.title}</Body1Strong>
        <div className={styles.field}>
          <Caption1 className={styles.label}>List</Caption1>
          <Body1 className={styles.value}>{task.listName}</Body1>
        </div>
        {task.dueDateTime && (
          <div className={styles.field}>
            <Caption1 className={styles.label}>Due</Caption1>
            <Body1 className={mergeClasses(styles.value, task.isOverdue && styles.overdue)}>
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
      <Divider className={styles.divider} />
      <div className={styles.toolbar}>
        <div className={styles.actions}>
          <ActionButton
            icon={<CheckmarkCircle24Regular />}
            label="Mark complete"
            onClick={() => handleAction('complete')}
            primary
          />
        </div>
        <ActionButton
          icon={<Open20Regular />}
          label="Open in Planner"
          onClick={() => openExternal('https://tasks.office.com')}
        />
      </div>
    </>
  );

  // File content and actions
  const renderFileContent = (file: IFileItem): JSX.Element => (
    <>
      <div className={styles.header}>
        <Document24Regular className={styles.headerIcon} />
        <Caption1Strong className={styles.headerText}>
          {file.isFolder ? 'Folder' : (file.fileType?.toUpperCase() || 'File')}
        </Caption1Strong>
      </div>
      <div className={styles.content}>
        <Body1Strong className={styles.title}>{file.name}</Body1Strong>
        {!file.isFolder && (
          <div className={styles.field}>
            <Caption1 className={styles.label}>Size</Caption1>
            <Body1 className={styles.value}>{formatFileSize(file.size)}</Body1>
          </div>
        )}
        <div className={styles.field}>
          <Caption1 className={styles.label}>Modified</Caption1>
          <Caption1 className={styles.value}>{formatDateTime(file.lastModifiedDateTime)}</Caption1>
        </div>
        {file.lastModifiedBy && (
          <div className={styles.field}>
            <Caption1 className={styles.label}>By</Caption1>
            <Body1 className={styles.value}>{file.lastModifiedBy}</Body1>
          </div>
        )}
      </div>
      <Divider className={styles.divider} />
      <div className={styles.toolbar}>
        <div className={styles.actions}>
          {!file.isFolder && (
            <>
              <ActionButton
                icon={<ArrowDownload20Regular />}
                label="Download"
                onClick={() => handleAction('download')}
              />
              <ActionButton
                icon={<Link20Regular />}
                label="Copy link"
                onClick={() => handleAction('copyLink')}
              />
            </>
          )}
        </div>
        <ActionButton
          icon={<Open20Regular />}
          label="Open in SharePoint"
          onClick={() => openExternal(file.webUrl)}
          primary
        />
      </div>
    </>
  );

  // Shared file content and actions
  const renderSharedFileContent = (file: ISharedFile): JSX.Element => (
    <>
      <div className={styles.header}>
        <Document24Regular className={styles.headerIcon} />
        <Caption1Strong className={styles.headerText}>
          {file.fileType?.toUpperCase() || 'File'}
        </Caption1Strong>
      </div>
      <div className={styles.content}>
        <Body1Strong className={styles.title}>{file.name}</Body1Strong>
        <div className={styles.field}>
          <Caption1 className={styles.label}>Size</Caption1>
          <Body1 className={styles.value}>{formatFileSize(file.size)}</Body1>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.label}>Shared by</Caption1>
          <Body1 className={styles.value}>{file.sharedBy}</Body1>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.label}>Shared</Caption1>
          <Caption1 className={styles.value}>{formatDateTime(file.sharedDateTime)}</Caption1>
        </div>
      </div>
      <Divider className={styles.divider} />
      <div className={styles.toolbar}>
        <div className={styles.actions}>
          <ActionButton
            icon={<ArrowDownload20Regular />}
            label="Download"
            onClick={() => handleAction('download')}
          />
          <ActionButton
            icon={<Link20Regular />}
            label="Copy link"
            onClick={() => handleAction('copyLink')}
          />
        </div>
        <ActionButton
          icon={<Open20Regular />}
          label="Open in SharePoint"
          onClick={() => openExternal(file.webUrl)}
          primary
        />
      </div>
    </>
  );

  // Team member content and actions
  const renderTeamMemberContent = (member: ITeamMember): JSX.Element => (
    <>
      <div className={styles.header}>
        <Person24Regular className={styles.headerIcon} />
        <Caption1Strong className={styles.headerText}>Team Member</Caption1Strong>
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
          <Caption1 className={styles.label}>Email</Caption1>
          <Body1 className={styles.value}>{member.email}</Body1>
        </div>
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
      <Divider className={styles.divider} />
      <div className={styles.toolbar}>
        <div className={styles.actions}>
          <ActionButton
            icon={<Chat20Regular />}
            label="Start chat"
            onClick={() => openExternal(`https://teams.microsoft.com/l/chat/0/0?users=${member.email}`)}
            primary
          />
          <ActionButton
            icon={<Mail20Regular />}
            label="Send email"
            onClick={() => openExternal(`mailto:${member.email}`)}
          />
          <ActionButton
            icon={<CalendarAdd20Regular />}
            label="Schedule meeting"
            onClick={() => handleAction('scheduleMeeting')}
          />
        </div>
      </div>
    </>
  );

  // Activity content and actions
  const renderActivityContent = (activity: ISiteActivity): JSX.Element => (
    <>
      <div className={styles.header}>
        <Pulse24Regular className={styles.headerIcon} />
        <Caption1Strong className={styles.headerText}>Activity</Caption1Strong>
      </div>
      <div className={styles.content}>
        <div className={styles.field}>
          <Caption1 className={styles.label}>Action</Caption1>
          <Badge appearance="tint" color="brand" size="small">{activity.action}</Badge>
        </div>
        <Body1Strong className={styles.title}>{activity.itemName}</Body1Strong>
        <div className={styles.field}>
          <Caption1 className={styles.label}>By</Caption1>
          <Body1 className={styles.value}>{activity.actor}</Body1>
        </div>
        <div className={styles.field}>
          <Caption1 className={styles.label}>When</Caption1>
          <Caption1 className={styles.value}>{formatDateTime(activity.timestamp)}</Caption1>
        </div>
      </div>
      {activity.itemUrl && (
        <>
          <Divider className={styles.divider} />
          <div className={styles.toolbar}>
            <div className={styles.actions} />
            <ActionButton
              icon={<Open20Regular />}
              label="View item"
              onClick={() => openExternal(activity.itemUrl!)}
              primary
            />
          </div>
        </>
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
        // Only allow closing through our custom handlers or popover's own close
        if (!data.open) {
          setIsOpen(false);
        }
      }}
      positioning="after"
      withArrow
    >
      <PopoverTrigger disableButtonEnhancement>
        <div
          ref={triggerRef}
          className={styles.triggerWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverSurface
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
