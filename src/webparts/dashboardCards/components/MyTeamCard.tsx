import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Body1Strong,
  Persona,
  PresenceBadgeStatus,
  Theme,
  Spinner,
} from '@fluentui/react-components';
import {
  People24Regular,
  ErrorCircle24Regular,
  PeopleProhibited24Regular,
} from '@fluentui/react-icons';
import { ITeamMember } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IMyTeamCardProps {
  members: ITeamMember[];
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
    color: tokens.colorBrandForeground1,
  },
  cardTitle: {
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
  memberList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground2,
    textDecoration: 'none',
    color: 'inherit',
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
  persona: {
    width: '100%',
  },
});

export const MyTeamCard: React.FC<IMyTeamCardProps> = ({ members, loading, error, onAction, theme, title }) => {
  const styles = useStyles();

  const getPresenceBadgeStatus = (presence: ITeamMember['presence']): PresenceBadgeStatus => {
    const presenceMap: Record<NonNullable<ITeamMember['presence']>, PresenceBadgeStatus> = {
      'Available': 'available',
      'Busy': 'busy',
      'Away': 'away',
      'DoNotDisturb': 'do-not-disturb',
      'Offline': 'offline',
      'Unknown': 'offline',
    };
    return presenceMap[presence || 'Unknown'];
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <People24Regular className={styles.cardIcon} />
        <Body1Strong className={styles.cardTitle}>{title || 'My Team'}</Body1Strong>
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
        ) : members.length === 0 ? (
          <MotionWrapper visible={true}>
            <div className={styles.emptyState}>
              <PeopleProhibited24Regular className={styles.emptyIcon} />
              <Text>No team members found</Text>
            </div>
          </MotionWrapper>
        ) : (
          <MotionWrapper visible={true}>
            <div className={styles.memberList}>
              {members.map(member => (
                <ItemHoverCard
                  key={member.id}
                  item={member}
                  itemType="teamMember"
                  onAction={onAction}
                  theme={theme}
                >
                  <div
                    className={styles.memberItem}
                    role="button"
                    tabIndex={0}
                  >
                    <Persona
                      name={member.displayName}
                      secondaryText={member.jobTitle}
                      presence={{ status: getPresenceBadgeStatus(member.presence) }}
                      avatar={{
                        image: member.photoUrl ? { src: member.photoUrl } : undefined,
                      }}
                      className={styles.persona}
                    />
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

export default MyTeamCard;
