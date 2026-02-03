import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  mergeClasses,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverSurface,
} from '@fluentui/react-components';
import {
  Settings20Regular,
  Eye20Regular,
  EyeOff20Regular,
  Delete20Regular,
  Info16Regular,
  Image20Regular,
} from '@fluentui/react-icons';
import {
  createPresenceComponent,
  motionTokens,
} from '@fluentui/react-motion';

export interface IMiniCardProps {
  cardId: string;
  title: string;
  description?: string;
  icon: React.ReactElement;
  visible: boolean;
  onSettingsClick: () => void;
  onVisibilityToggle: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
  isDragging?: boolean;
}

// Motion for card entrance
const CardEnter = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.95) translateY(4px)' },
      { opacity: 1, transform: 'scale(1) translateY(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMid,
  },
  exit: {
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.95)' },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMid,
  },
});

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: '156px',
    height: '144px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
    cursor: 'grab',
    overflow: 'hidden',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    position: 'relative',
    transitionProperty: 'box-shadow, transform, opacity',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.67, 1)',
    ':hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)',
      transform: 'translateY(-2px)',
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
    },
    ':hover .card-actions': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  cardHidden: {
    opacity: 0.6,
  },
  cardDragging: {
    opacity: 0.9,
    boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
    transform: 'scale(1.03) rotate(1deg)',
    cursor: 'grabbing',
  },
  // Info button in top-right corner
  infoButton: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    minWidth: '20px',
    width: '20px',
    height: '20px',
    padding: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    backdropFilter: 'blur(4px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    borderRadius: '50%',
    color: tokens.colorNeutralForeground3,
    transitionProperty: 'background-color, color, transform',
    transitionDuration: '0.15s',
    zIndex: 2,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1,
      color: tokens.colorBrandForeground1,
      transform: 'scale(1.1)',
    },
  },
  // Card content area - clean, centered
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '19px 14px',
    gap: '12px', // Increased spacing between icon and title
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, rgba(0, 102, 204, 0.08) 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transitionProperty: 'transform, background-color',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.67, 1)',
  },
  icon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHidden: {
    color: tokens.colorNeutralForeground4,
  },
  iconContainerHidden: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  title: {
    fontSize: '12px',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    lineHeight: '1.3',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
  titleHidden: {
    color: tokens.colorNeutralForeground4,
  },
  // Actions bar
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px',
    background: `linear-gradient(transparent, ${tokens.colorNeutralBackground1})`,
    backdropFilter: 'blur(8px)',
    opacity: 0,
    transform: 'translateY(4px)',
    transitionProperty: 'opacity, transform',
    transitionDuration: '0.15s',
    transitionTimingFunction: 'cubic-bezier(0.33, 0, 0.67, 1)',
  },
  actionsVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  },
  actionButton: {
    minWidth: '26px',
    width: '26px',
    height: '26px',
    padding: 0,
    borderRadius: '6px',
    color: tokens.colorNeutralForeground2,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
    transitionProperty: 'background-color, color, transform, box-shadow',
    transitionDuration: '0.15s',
    ':hover': {
      color: tokens.colorBrandForeground1,
      backgroundColor: tokens.colorBrandBackground2,
      transform: 'scale(1.08)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
  },
  actionButtonDanger: {
    ':hover': {
      color: tokens.colorPaletteRedForeground1,
      backgroundColor: tokens.colorPaletteRedBackground2,
    },
  },
  // Info popover - includes preview image
  infoPopover: {
    maxWidth: '260px',
    padding: '0',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  infoPreview: {
    width: '100%',
    height: '100px',
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  infoPreviewPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    color: tokens.colorNeutralForeground4,
  },
  infoPreviewIcon: {
    fontSize: '32px',
    opacity: 0.4,
  },
  infoPreviewLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    opacity: 0.6,
  },
  infoContent: {
    padding: '12px 14px',
  },
  infoTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
    marginBottom: '6px',
  },
  infoDescription: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.5',
  },
});

// Default descriptions for cards
const cardDescriptions: Record<string, string> = {
  'todays-agenda': 'Shows your calendar events for today with quick access to join online meetings.',
  'unread-inbox': 'Displays your unread emails with sender info and quick preview.',
  'my-tasks': 'Lists your pending tasks from Microsoft To Do with due dates.',
  'recent-files': 'Shows recently accessed files from OneDrive and SharePoint.',
  'upcoming-week': 'Preview your calendar events for the next 7 days.',
  'flagged-emails': 'Emails you have flagged for follow-up.',
  'my-team': 'Quick access to your team members with contact options.',
  'shared-with-me': 'Files and documents shared with you by others.',
  'quick-links': 'Customizable shortcuts to frequently used sites and apps.',
  'site-activity': 'Recent activity on the current SharePoint site.',
  'todaysAgenda': 'Shows your calendar events for today with quick access to join online meetings.',
  'unreadInbox': 'Displays your unread emails with sender info and quick preview.',
  'myTasks': 'Lists your pending tasks from Microsoft To Do with due dates.',
  'recentFiles': 'Shows recently accessed files from OneDrive and SharePoint.',
  'upcomingWeek': 'Preview your calendar events for the next 7 days.',
  'flaggedEmails': 'Emails you have flagged for follow-up.',
  'myTeam': 'Quick access to your team members with contact options.',
  'sharedWithMe': 'Files and documents shared with you by others.',
  'quickLinks': 'Customizable shortcuts to frequently used sites and apps.',
  'siteActivity': 'Recent activity on the current SharePoint site.',
};

export const MiniCard: React.FC<IMiniCardProps> = ({
  cardId,
  title,
  description,
  icon,
  visible,
  onSettingsClick,
  onVisibilityToggle,
  onDelete,
  showDelete = false,
  isDragging = false,
}) => {
  const styles = useStyles();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleSettingsClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onSettingsClick();
  };

  const handleVisibilityClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onVisibilityToggle();
  };

  const handleDeleteClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const cardDescription = description || cardDescriptions[cardId] || 'Dashboard card for displaying information.';

  return (
    <CardEnter visible={true}>
      <div
        className={mergeClasses(
          styles.card,
          !visible && styles.cardHidden,
          isDragging && styles.cardDragging
        )}
        data-card-id={cardId}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Info button with popover containing preview */}
        <Popover withArrow positioning="above-end">
          <PopoverTrigger disableButtonEnhancement>
            <Button
              appearance="subtle"
              size="small"
              icon={<Info16Regular />}
              className={styles.infoButton}
              onClick={(e) => e.stopPropagation()}
            />
          </PopoverTrigger>
          <PopoverSurface className={styles.infoPopover}>
            {/* Preview image area in popover */}
            <div className={styles.infoPreview}>
              <div className={styles.infoPreviewPlaceholder}>
                <Image20Regular className={styles.infoPreviewIcon} />
                <span className={styles.infoPreviewLabel}>Card Preview</span>
              </div>
            </div>
            <div className={styles.infoContent}>
              <div className={styles.infoTitle}>{title}</div>
              <div className={styles.infoDescription}>{cardDescription}</div>
            </div>
          </PopoverSurface>
        </Popover>

        {/* Card content - icon and title */}
        <div className={styles.cardContent}>
          <div className={mergeClasses(
            styles.iconContainer,
            !visible && styles.iconContainerHidden
          )}>
            <span className={mergeClasses(styles.icon, !visible && styles.iconHidden)}>
              {icon}
            </span>
          </div>
          <Text className={mergeClasses(styles.title, !visible && styles.titleHidden)}>
            {title}
          </Text>
        </div>

        {/* Action buttons */}
        <div
          className={mergeClasses(
            styles.actions,
            'card-actions',
            (isHovered || isDragging) && styles.actionsVisible
          )}
        >
          <Tooltip content="Settings" relationship="label" positioning="above">
            <Button
              appearance="subtle"
              size="small"
              icon={<Settings20Regular />}
              className={styles.actionButton}
              onClick={handleSettingsClick}
            />
          </Tooltip>
          <Tooltip content={visible ? 'Hide' : 'Show'} relationship="label" positioning="above">
            <Button
              appearance="subtle"
              size="small"
              icon={visible ? <Eye20Regular /> : <EyeOff20Regular />}
              className={styles.actionButton}
              onClick={handleVisibilityClick}
            />
          </Tooltip>
          {showDelete && (
            <Tooltip content="Remove" relationship="label" positioning="above">
              <Button
                appearance="subtle"
                size="small"
                icon={<Delete20Regular />}
                className={mergeClasses(styles.actionButton, styles.actionButtonDanger)}
                onClick={handleDeleteClick}
              />
            </Tooltip>
          )}
        </div>
      </div>
    </CardEnter>
  );
};

export default MiniCard;
