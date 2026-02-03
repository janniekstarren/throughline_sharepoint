import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Caption1,
  Body1,
  Body1Strong,
  Badge,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  Flag24Filled,
  Flag16Filled,
  ErrorCircle24Regular,
  FlagOff24Regular,
  Important16Filled,
  Attach16Regular,
} from '@fluentui/react-icons';
import { IEmailMessage } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IFlaggedEmailsCardProps {
  emails: IEmailMessage[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}

// Fluent UI 9 styles using makeStyles and design tokens
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
    color: tokens.colorPaletteRedForeground1,
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
  emptyIcon: {
    fontSize: '32px',
    color: tokens.colorNeutralForeground4,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    flex: 1,
  },
  emailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
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
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
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
  flagIcon: {
    color: tokens.colorPaletteRedForeground1,
    flexShrink: 0,
    marginTop: '2px',
  },
  emailContent: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  emailHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalXS,
  },
  sender: {
    fontWeight: tokens.fontWeightSemibold,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
  },
  date: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  subject: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground1,
    marginBottom: tokens.spacingVerticalXS,
  },
  importantIcon: {
    color: tokens.colorPaletteRedForeground1,
    flexShrink: 0,
  },
  attachIcon: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  preview: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
});

export const FlaggedEmailsCard: React.FC<IFlaggedEmailsCardProps> = ({ emails, loading, error, onAction, theme, title }) => {
  const styles = useStyles();

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Flag24Filled className={styles.cardIcon} />
        <Body1Strong className={styles.cardTitle}>{title || 'Flagged Emails'}</Body1Strong>
        {!loading && emails.length > 0 && (
          <Badge appearance="filled" color="danger" size="small">{emails.length}</Badge>
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
              <FlagOff24Regular className={styles.emptyIcon} />
              <Text>No flagged emails</Text>
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
                    <div className={styles.flagIcon}>
                      <Flag16Filled />
                    </div>
                    <div className={styles.emailContent}>
                      <div className={styles.emailHeader}>
                        <Body1Strong className={styles.sender}>{email.from.name || email.from.email}</Body1Strong>
                        <Caption1 className={styles.date}>{formatDate(email.receivedDateTime)}</Caption1>
                      </div>
                      <div className={styles.subject}>
                        {email.importance === 'high' && (
                          <Important16Filled className={styles.importantIcon} />
                        )}
                        {email.hasAttachments && (
                          <Attach16Regular className={styles.attachIcon} />
                        )}
                        <Body1>{email.subject || '(No subject)'}</Body1>
                      </div>
                      <Caption1 className={styles.preview}>{email.bodyPreview}</Caption1>
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

export default FlaggedEmailsCard;
