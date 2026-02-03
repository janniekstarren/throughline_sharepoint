import * as React from 'react';
import {
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
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { useCardStyles, CardEnter, ListItemEnter } from './cardStyles';

export interface IMyTeamCardProps {
  members: ITeamMember[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
}


export const MyTeamCard: React.FC<IMyTeamCardProps> = ({ members, loading, error, onAction, theme, title }) => {
  const styles = useCardStyles();

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
    <CardEnter visible={true}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIconWrapper}>
            <People24Regular className={styles.cardIcon} />
          </div>
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
            <div className={styles.emptyState}>
              <PeopleProhibited24Regular className={styles.emptyIcon} />
              <Text>No team members found</Text>
            </div>
          ) : (
            <div className={styles.itemList}>
              {members.map((member, index) => (
                <ListItemEnter key={member.id} visible={true}>
                  <div style={{ animationDelay: `${index * 50}ms` }}>
                    <ItemHoverCard
                      item={member}
                      itemType="teamMember"
                      onAction={onAction}
                      theme={theme}
                    >
                      <div
                        className={styles.item}
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
                          style={{ width: '100%' }}
                        />
                      </div>
                    </ItemHoverCard>
                  </div>
                </ListItemEnter>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardEnter>
  );
};

export default MyTeamCard;
