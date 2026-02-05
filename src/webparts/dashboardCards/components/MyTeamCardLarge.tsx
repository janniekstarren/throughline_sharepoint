// ============================================
// MyTeamCardLarge - Large card variant for My Team
// Master-detail layout with team member details panel
// ============================================

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Theme,
  Button,
  Tooltip,
  Avatar,
  Badge,
} from '@fluentui/react-components';
import {
  People24Regular,
  PersonAvailable24Regular,
  Mail24Regular,
  Chat24Regular,
  Calendar24Regular,
  ContractDownLeft20Regular,
} from '@fluentui/react-icons';
import { ITeamMember } from '../services/GraphService';
import { MasterDetailCard } from './shared/MasterDetailCard';
import { HoverCardItemType, IHoverCardItem } from './ItemHoverCard';

export interface IMyTeamCardLargeProps {
  members: ITeamMember[];
  loading: boolean;
  error?: string;
  onAction?: (action: string, item: IHoverCardItem, itemType: HoverCardItemType) => void;
  theme?: Theme;
  title?: string;
  /** Callback to toggle between large and medium card size */
  onToggleSize?: () => void;
}

const useStyles = makeStyles({
  // Master item styles
  masterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  memberInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  memberName: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  memberMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  jobTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  presenceIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  presenceAvailable: {
    backgroundColor: tokens.colorPaletteGreenForeground1,
  },
  presenceBusy: {
    backgroundColor: tokens.colorPaletteRedForeground1,
  },
  presenceAway: {
    backgroundColor: tokens.colorPaletteYellowForeground1,
  },
  presenceDnd: {
    backgroundColor: tokens.colorPaletteRedForeground1,
  },
  presenceOffline: {
    backgroundColor: tokens.colorNeutralForeground4,
  },
  // Detail panel styles
  detailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    alignItems: 'center',
  },
  detailHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    textAlign: 'center',
  },
  detailAvatarWrapper: {
    position: 'relative',
  },
  detailName: {
    fontSize: '20px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  detailJobTitle: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  presenceBadgeWrapper: {
    marginTop: tokens.spacingVerticalXS,
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    width: '100%',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
    padding: `${tokens.spacingVerticalXS} 0`,
  },
  contactIcon: {
    color: tokens.colorNeutralForeground3,
    fontSize: '16px',
    flexShrink: 0,
  },
  contactLink: {
    color: tokens.colorBrandForeground1,
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  // Action buttons
  actionButton: {
    minWidth: 'auto',
  },
  actionsRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'center',
  },
  // Empty states
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
});

// Presence status to badge status mapping
type PresenceStatus = 'Available' | 'Busy' | 'Away' | 'DoNotDisturb' | 'Offline' | 'Unknown';

const getPresenceBadgeStatus = (presence?: PresenceStatus): 'available' | 'busy' | 'away' | 'do-not-disturb' | 'offline' | 'unknown' => {
  switch (presence) {
    case 'Available':
      return 'available';
    case 'Busy':
      return 'busy';
    case 'Away':
      return 'away';
    case 'DoNotDisturb':
      return 'do-not-disturb';
    case 'Offline':
      return 'offline';
    default:
      return 'unknown';
  }
};

const getPresenceText = (presence?: PresenceStatus): string => {
  switch (presence) {
    case 'Available':
      return 'Available';
    case 'Busy':
      return 'Busy';
    case 'Away':
      return 'Away';
    case 'DoNotDisturb':
      return 'Do Not Disturb';
    case 'Offline':
      return 'Offline';
    default:
      return 'Unknown';
  }
};

const getPresenceColor = (presence?: PresenceStatus): 'success' | 'danger' | 'warning' | 'important' | undefined => {
  switch (presence) {
    case 'Available':
      return 'success';
    case 'Busy':
    case 'DoNotDisturb':
      return 'danger';
    case 'Away':
      return 'warning';
    default:
      return undefined;
  }
};

// Sort members by presence (available first) then by name
const sortMembers = (members: ITeamMember[]): ITeamMember[] => {
  const presenceOrder: Record<string, number> = {
    'Available': 0,
    'Busy': 1,
    'Away': 2,
    'DoNotDisturb': 3,
    'Offline': 4,
    'Unknown': 5,
  };

  return [...members].sort((a, b) => {
    const aOrder = presenceOrder[a.presence || 'Unknown'] || 5;
    const bOrder = presenceOrder[b.presence || 'Unknown'] || 5;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.displayName.localeCompare(b.displayName);
  });
};

export const MyTeamCardLarge: React.FC<IMyTeamCardLargeProps> = ({
  members,
  loading,
  error,
  onAction,
  theme,
  title = 'My Team',
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedMember, setSelectedMember] = React.useState<ITeamMember | undefined>(undefined);

  // Sort members
  const sortedMembers = React.useMemo(() => sortMembers(members), [members]);

  // Handler for selecting a member
  const handleSelectMember = React.useCallback((member: ITeamMember): void => {
    setSelectedMember(member);
  }, []);

  // Auto-select first member when members load
  React.useEffect(() => {
    if (sortedMembers.length > 0 && !selectedMember) {
      setSelectedMember(sortedMembers[0]);
    }
  }, [sortedMembers, selectedMember]);

  // Handle action callback
  const handleMemberAction = (action: string, member: ITeamMember): void => {
    if (onAction) {
      onAction(action, member as IHoverCardItem, 'teamMember');
    }
  };

  // Render master item (compact member display)
  const renderMasterItem = (member: ITeamMember, isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        <div className={styles.avatarWrapper}>
          <Avatar
            name={member.displayName}
            image={member.photoUrl ? { src: member.photoUrl } : undefined}
            size={32}
            color="brand"
            badge={{ status: getPresenceBadgeStatus(member.presence) }}
          />
        </div>
        <div className={styles.memberInfo}>
          <Text className={styles.memberName}>{member.displayName}</Text>
          <div className={styles.memberMeta}>
            <span className={styles.jobTitle}>{member.jobTitle || 'Team member'}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (member: ITeamMember): React.ReactNode => {
    const presenceColor = getPresenceColor(member.presence);

    return (
      <div className={styles.detailContainer}>
        {/* Member Header */}
        <div className={styles.detailHeader}>
          <div className={styles.detailAvatarWrapper}>
            <Avatar
              name={member.displayName}
              image={member.photoUrl ? { src: member.photoUrl } : undefined}
              size={72}
              color="brand"
              badge={{ status: getPresenceBadgeStatus(member.presence) }}
            />
          </div>
          <Text className={styles.detailName}>{member.displayName}</Text>
          <Text className={styles.detailJobTitle}>{member.jobTitle || 'Team member'}</Text>
          <div className={styles.presenceBadgeWrapper}>
            <Badge
              appearance="tint"
              color={presenceColor}
            >
              {getPresenceText(member.presence)}
            </Badge>
          </div>
        </div>

        {/* Contact Section */}
        <div className={styles.detailSection}>
          <Text className={styles.sectionLabel}>Contact</Text>
          <div className={styles.contactRow}>
            <Mail24Regular className={styles.contactIcon} />
            <a href={`mailto:${member.email}`} className={styles.contactLink}>
              {member.email}
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Render detail actions
  const renderDetailActions = (member: ITeamMember): React.ReactNode => {
    return (
      <>
        <Button
          appearance="primary"
          icon={<Chat24Regular />}
          className={styles.actionButton}
          onClick={() => {
            // Open Teams chat
            window.open(`https://teams.microsoft.com/l/chat/0/0?users=${member.email}`, '_blank', 'noopener,noreferrer');
          }}
        >
          Chat
        </Button>
        <Button
          appearance="secondary"
          icon={<Mail24Regular />}
          className={styles.actionButton}
          onClick={() => {
            window.open(`mailto:${member.email}`, '_blank');
          }}
        >
          Email
        </Button>
        <Button
          appearance="secondary"
          icon={<Calendar24Regular />}
          className={styles.actionButton}
          onClick={() => handleMemberAction('scheduleMeeting', member)}
        >
          Schedule
        </Button>
      </>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => {
    return (
      <>
        <People24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>Select a team member to view details</Text>
      </>
    );
  };

  // Render empty state (no members)
  const renderEmptyState = (): React.ReactNode => {
    return (
      <>
        <PersonAvailable24Regular className={styles.emptyIcon} />
        <Text className={styles.emptyText}>No team members found</Text>
      </>
    );
  };

  return (
    <MasterDetailCard
      items={sortedMembers}
      selectedItem={selectedMember}
      onItemSelect={handleSelectMember}
      getItemKey={(member: ITeamMember) => member.id}
      renderMasterItem={renderMasterItem}
      renderDetailContent={renderDetailContent}
      renderDetailActions={renderDetailActions}
      renderEmptyDetail={renderEmptyDetail}
      renderEmptyState={renderEmptyState}
      icon={<People24Regular />}
      title={title}
      itemCount={sortedMembers.length}
      loading={loading}
      error={error}
      emptyMessage="No team members found"
      emptyIcon={<PersonAvailable24Regular />}
      headerActions={
        onToggleSize && (
          <Tooltip content="Collapse to compact view" relationship="label">
            <Button
              appearance="subtle"
              size="small"
              icon={<ContractDownLeft20Regular />}
              onClick={onToggleSize}
              aria-label="Collapse card"
            />
          </Tooltip>
        )
      }
    />
  );
};

export default MyTeamCardLarge;
