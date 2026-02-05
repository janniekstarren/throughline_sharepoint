// ============================================
// MyTeamCard - Displays team members with presence
// Refactored to use shared components
// ============================================

import * as React from 'react';
import {
  Persona,
  PresenceBadgeStatus,
  Theme,
  Button,
  Tooltip,
} from '@fluentui/react-components';
import {
  People24Regular,
  PeopleProhibited24Regular,
  ArrowExpand20Regular,
} from '@fluentui/react-icons';
import { ITeamMember } from '../services/GraphService';
import { MotionWrapper } from './MotionWrapper';
import { ItemHoverCard, HoverCardItemType, IHoverCardItem } from './ItemHoverCard';
import { BaseCard, CardHeader, EmptyState } from './shared';
import { useCardStyles } from './cardStyles';

export interface IMyTeamCardProps {
  members: ITeamMember[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

export const MyTeamCard: React.FC<IMyTeamCardProps> = ({
  members,
  loading,
  error,
  onAction,
  theme,
  title,
  onToggleSize,
}) => {
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

  // Expand button for switching to large card view
  const expandButton = onToggleSize ? (
    <Tooltip content="Expand to detailed view" relationship="label">
      <Button
        appearance="subtle"
        size="small"
        icon={<ArrowExpand20Regular />}
        onClick={onToggleSize}
        aria-label="Expand card"
      />
    </Tooltip>
  ) : undefined;

  // Empty state
  if (!loading && !error && members.length === 0) {
    return (
      <BaseCard testId="my-team-card">
        <CardHeader
          icon={<People24Regular />}
          title={title || 'My Team'}
          cardId="myTeam"
          actions={expandButton}
        />
        <EmptyState
          icon={<PeopleProhibited24Regular />}
          title="No team members found"
          description="Your team will appear here"
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard
      loading={loading}
      error={error}
      loadingMessage="Loading team..."
      testId="my-team-card"
    >
      <CardHeader
        icon={<People24Regular />}
        title={title || 'My Team'}
        cardId="myTeam"
        badge={members.length > 0 ? members.length : undefined}
        actions={expandButton}
      />
      <div className={styles.cardContent}>
        <MotionWrapper visible={true}>
          <div className={styles.itemList}>
            {members.map(member => (
              <ItemHoverCard
                key={member.id}
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
            ))}
          </div>
        </MotionWrapper>
      </div>
    </BaseCard>
  );
};

export default MyTeamCard;
