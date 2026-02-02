import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Badge,
  Avatar,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  Mail24Regular,
  ErrorCircle24Regular,
  MailInbox24Regular,
  Important16Filled,
  Attach16Regular,
} from '@fluentui/react-icons';
import { IEmailMessage } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IUnreadInboxCardProps {
  emails: IEmailMessage[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
    flexShrink: 0,
  },
  cardIcon: {
    fontSize: '20px',
    color: tokens.colorBrandForeground1,
  },
  cardTitle: {
    flex: 1,
    color: tokens.colorNeutralForeground1,
  },
  cardContent: {
    flex: 1,
    padding: tokens.spacingVerticalM,
    overflowY: 'auto',
    minHeight: 0,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalS,
  },
  errorIcon: {
    fontSize: '24px',
    color: tokens.colorPaletteRedForeground1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    gap: tokens.spacingVerticalS,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    flex: 1,
  },
  emptyIcon: {
    fontSize: '32px',
    color: tokens.colorPaletteGreenForeground1,
  },
  emailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  emailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground2,
    textDecoration: 'none',
    color: 'inherit',
    gap: tokens.spacingHorizontalM,
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandStroke1,
      outlineOffset: '2px',
    },
  },
  avatar: {
    flexShrink: 0,
  },
  emailContent: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  emailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalXS,
  },
  senderName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
  },
  receivedTime: {
    flexShrink: 0,
    marginLeft: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
  },
  emailSubject: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalXS,
    color: tokens.colorNeutralForeground1,
  },
  subjectText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  importanceIcon: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: '14px',
    flexShrink: 0,
  },
  attachmentIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '14px',
    flexShrink: 0,
  },
  emailPreview: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    color: tokens.colorNeutralForeground3,
    lineHeight: tokens.lineHeightBase200,
  },
});

export const UnreadInboxCard: React.FC<IUnreadInboxCardProps> = ({ emails, loading, error, onAction, theme, title }) => {
  const styles = useStyles();

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Mail24Regular className={styles.cardIcon} />
        <Body1Strong className={styles.cardTitle}>{title || 'Unread Inbox'}</Body1Strong>
        {!loading && emails.length > 0 && (
          <Badge appearance="filled" color="brand" size="small">{emails.length}</Badge>
        )}
      </div>
      <div className={styles.cardContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner size="medium" />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <ErrorCircle24Regular className={styles.errorIcon} />
            <Text>{error}</Text>
          </div>
        ) : emails.length === 0 ? (
          <MotionWrapper visible={true}>
            <div className={styles.emptyState}>
              <MailInbox24Regular className={styles.emptyIcon} />
              <Text>All caught up!</Text>
            </div>
          </MotionWrapper>
        ) : (
          <MotionWrapper visible={true}>
            <div className={styles.emailList}>
              {emails.map(email => (
                <ItemHoverCard
                  key={email.id}
                  item={email}
                  itemType="email"
                  onAction={onAction}
                  theme={theme}
                >
                  <div
                    className={styles.emailItem}
                    role="button"
                    tabIndex={0}
                  >
                    <Avatar
                      name={email.from.name}
                      size={32}
                      className={styles.avatar}
                    />
                    <div className={styles.emailContent}>
                      <div className={styles.emailHeader}>
                        <Body1Strong className={styles.senderName}>{email.from.name}</Body1Strong>
                        <Caption1 className={styles.receivedTime}>{formatDate(email.receivedDateTime)}</Caption1>
                      </div>
                      <div className={styles.emailSubject}>
                        {email.importance === 'high' && (
                          <Important16Filled className={styles.importanceIcon} />
                        )}
                        {email.hasAttachments && (
                          <Attach16Regular className={styles.attachmentIcon} />
                        )}
                        <Body1 className={styles.subjectText}>{email.subject}</Body1>
                      </div>
                      <Caption1 className={styles.emailPreview}>
                        {email.bodyPreview.substring(0, 80)}
                        {email.bodyPreview.length > 80 ? '...' : ''}
                      </Caption1>
                    </div>
                  </div>
                </ItemHoverCard>
              ))}
            </div>
          </MotionWrapper>
        )}
      </div>
    </div>
  );
};

export default UnreadInboxCard;
