// ============================================
// MyTeamCardLarge - Large Card (Detail View)
// Master-detail layout showing team members with details
// ============================================

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Tooltip,
  Avatar,
  PresenceBadge,
} from '@fluentui/react-components';
import {
  People24Regular,
  ArrowMinimize20Regular,
  ArrowClockwiseRegular,
  Mail16Regular,
  Chat16Regular,
  Call16Regular,
  Calendar16Regular,
} from '@fluentui/react-icons';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
  useMyTeam,
  IMyTeamSettings,
  DEFAULT_MY_TEAM_SETTINGS,
} from '../../hooks/useMyTeam';
import { MyTeamData, TeamMember, PresenceStatus } from '../../models/MyTeam';
import { MasterDetailCard } from '../shared/MasterDetailCard';
import { DataMode } from '../../services/testData';
import { getTestMyTeamData } from '../../services/testData/myTeam';
import { AIInsightBanner, AIOnboardingDialog } from '../shared/AIComponents';
import { IAICardSummary, IAIInsight } from '../../models/AITypes';
import { getGenericAICardSummary, getGenericAIInsights } from '../../services/testData/aiDemoData';

// ============================================
// Styles
// ============================================
const useStyles = makeStyles({
  masterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
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
  memberTitle: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  presenceBadge: {
    marginLeft: 'auto',
    flexShrink: 0,
  },
  // Detail panel styles
  detailHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalL,
    textAlign: 'center',
  },
  detailAvatar: {
    marginBottom: tokens.spacingVerticalS,
  },
  detailName: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  detailTitle: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
  },
  detailPresence: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXS,
  },
  presenceText: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  detailSection: {
    marginTop: tokens.spacingVerticalL,
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: tokens.spacingVerticalS,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} 0`,
  },
  detailLabel: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    minWidth: '60px',
  },
  detailValue: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground4,
  },
  emptyText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
});

// ============================================
// Props Interface
// ============================================
interface MyTeamCardLargeProps {
  context: WebPartContext;
  settings?: IMyTeamSettings;
  dataMode?: DataMode;
  aiDemoMode?: boolean;
  onToggleSize?: () => void;
}

// ============================================
// Helper Functions
// ============================================
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

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() || '?';
};

// ============================================
// Component
// ============================================
export const MyTeamCardLarge: React.FC<MyTeamCardLargeProps> = ({
  context,
  settings = DEFAULT_MY_TEAM_SETTINGS,
  dataMode = 'api',
  aiDemoMode = false,
  onToggleSize,
}) => {
  const styles = useStyles();
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>(undefined);

  // Test data state
  const [testData, setTestData] = useState<MyTeamData | null>(null);
  const [testLoading, setTestLoading] = useState(dataMode === 'test');

  // Load test data
  React.useEffect(() => {
    if (dataMode === 'test') {
      setTestLoading(true);
      const timer = setTimeout(() => {
        setTestData(getTestMyTeamData());
        setTestLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dataMode]);

  // AI demo mode state
  const [aiCardSummary, setAiCardSummary] = React.useState<IAICardSummary | null>(null);
  const [aiInsights, setAiInsights] = React.useState<IAIInsight[]>([]);
  const [showAiOnboarding, setShowAiOnboarding] = React.useState(false);

  // Load AI demo data when enabled
  React.useEffect(() => {
    if (aiDemoMode) {
      setAiCardSummary(getGenericAICardSummary('myTeam'));
      setAiInsights(getGenericAIInsights('myTeam'));
    } else {
      setAiCardSummary(null);
      setAiInsights([]);
    }
  }, [aiDemoMode]);

  const handleAiLearnMore = useCallback(() => {
    setShowAiOnboarding(true);
  }, []);

  // API hook
  const apiHook = useMyTeam(context, settings);

  // Select data source
  const data = dataMode === 'test' ? testData : apiHook.data;
  const isLoading = dataMode === 'test' ? testLoading : apiHook.isLoading;
  const error = dataMode === 'test' ? null : apiHook.error;
  const refresh = dataMode === 'test'
    ? async () => {
        setTestLoading(true);
        setTimeout(() => {
          setTestData(getTestMyTeamData());
          setTestLoading(false);
        }, 500);
      }
    : apiHook.refresh;

  // Members list
  const members = useMemo(() => {
    if (!data) return [];
    return data.members;
  }, [data]);

  // Auto-select first member
  React.useEffect(() => {
    if (members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
    }
  }, [members, selectedMember]);

  const handleSelectMember = useCallback((member: TeamMember): void => {
    setSelectedMember(member);
  }, []);

  // Quick action handlers
  const handleEmailClick = (member: TeamMember): void => {
    window.open(`mailto:${member.email}`, '_blank');
  };

  const handleChatClick = (member: TeamMember): void => {
    window.open(`https://teams.microsoft.com/l/chat/0/0?users=${member.email}`, '_blank');
  };

  const handleCallClick = (member: TeamMember): void => {
    window.open(`https://teams.microsoft.com/l/call/0/0?users=${member.email}`, '_blank');
  };

  const handleMeetingClick = (member: TeamMember): void => {
    window.open(`https://outlook.office.com/calendar/deeplink/compose?to=${member.email}`, '_blank');
  };

  // Render master item
  const renderMasterItem = (member: TeamMember, isSelected: boolean): React.ReactNode => {
    return (
      <div className={styles.masterItem}>
        <Avatar
          name={member.displayName}
          image={member.photoUrl ? { src: member.photoUrl } : undefined}
          initials={getInitials(member.displayName)}
          size={36}
          badge={settings.showPresence ? {
            status: getPresenceBadgeStatus(member.presence),
          } : undefined}
        />
        <div className={styles.memberInfo}>
          <Text className={styles.memberName}>{member.displayName}</Text>
          {member.jobTitle && (
            <Text className={styles.memberTitle}>{member.jobTitle}</Text>
          )}
        </div>
      </div>
    );
  };

  // Render detail content
  const renderDetailContent = (member: TeamMember): React.ReactNode => {
    return (
      <>
        <div className={styles.detailHeader}>
          <Avatar
            name={member.displayName}
            image={member.photoUrl ? { src: member.photoUrl } : undefined}
            initials={getInitials(member.displayName)}
            size={72}
            className={styles.detailAvatar}
          />
          <Text className={styles.detailName}>{member.displayName}</Text>
          {member.jobTitle && (
            <Text className={styles.detailTitle}>{member.jobTitle}</Text>
          )}
          {settings.showPresence && (
            <div className={styles.detailPresence}>
              <PresenceBadge status={getPresenceBadgeStatus(member.presence)} size="medium" />
              <Text className={styles.presenceText}>{getPresenceText(member.presence)}</Text>
            </div>
          )}
        </div>

        <div className={styles.detailSection}>
          <Text className={styles.sectionTitle}>Contact Information</Text>
          <div className={styles.detailRow}>
            <Text className={styles.detailLabel}>Email</Text>
            <Text className={styles.detailValue}>{member.email}</Text>
          </div>
        </div>
      </>
    );
  };

  // Render detail actions
  const renderDetailActions = (member: TeamMember): React.ReactNode => {
    return (
      <>
        <Tooltip content="Send email" relationship="label">
          <Button
            appearance="subtle"
            icon={<Mail16Regular />}
            onClick={() => handleEmailClick(member)}
          >
            Email
          </Button>
        </Tooltip>
        <Tooltip content="Start chat" relationship="label">
          <Button
            appearance="subtle"
            icon={<Chat16Regular />}
            onClick={() => handleChatClick(member)}
          >
            Chat
          </Button>
        </Tooltip>
        <Tooltip content="Start call" relationship="label">
          <Button
            appearance="subtle"
            icon={<Call16Regular />}
            onClick={() => handleCallClick(member)}
          >
            Call
          </Button>
        </Tooltip>
        <Tooltip content="Schedule meeting" relationship="label">
          <Button
            appearance="primary"
            icon={<Calendar16Regular />}
            onClick={() => handleMeetingClick(member)}
          >
            Meet
          </Button>
        </Tooltip>
      </>
    );
  };

  // Render empty detail state
  const renderEmptyDetail = (): React.ReactNode => (
    <>
      <People24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>Select a team member to view details</Text>
    </>
  );

  // Render empty state
  const renderEmptyState = (): React.ReactNode => (
    <>
      <People24Regular className={styles.emptyIcon} />
      <Text className={styles.emptyText}>No team members found</Text>
    </>
  );

  // Header actions
  const headerActions = (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS }}>
      <Tooltip content="Refresh" relationship="label">
        <Button
          appearance="subtle"
          icon={<ArrowClockwiseRegular />}
          size="small"
          onClick={refresh}
        />
      </Tooltip>
      {onToggleSize && (
        <Tooltip content="Collapse to compact view" relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowMinimize20Regular />}
            onClick={onToggleSize}
            aria-label="Collapse card"
          />
        </Tooltip>
      )}
    </div>
  );

  // AI Insight Banner for header content
  const aiHeaderContent = aiDemoMode && aiCardSummary ? (
    <AIInsightBanner
      summary={aiCardSummary}
      insights={aiInsights}
      onLearnMore={handleAiLearnMore}
    />
  ) : undefined;

  return (
    <>
      <MasterDetailCard
        items={members}
        selectedItem={selectedMember}
        onItemSelect={handleSelectMember}
        getItemKey={(member: TeamMember) => member.id}
        renderMasterItem={renderMasterItem}
        renderDetailContent={renderDetailContent}
        renderDetailActions={renderDetailActions}
        renderEmptyDetail={renderEmptyDetail}
        renderEmptyState={renderEmptyState}
        icon={<People24Regular />}
        title="My Team"
        itemCount={members.length}
        loading={isLoading && !data}
        error={error?.message}
        emptyMessage="No team members found"
        emptyIcon={<People24Regular />}
        headerActions={headerActions}
        headerContent={aiHeaderContent}
      />

      {/* AI Onboarding Dialog */}
      <AIOnboardingDialog
        open={showAiOnboarding}
        onClose={() => setShowAiOnboarding(false)}
      />
    </>
  );
};

export default MyTeamCardLarge;
