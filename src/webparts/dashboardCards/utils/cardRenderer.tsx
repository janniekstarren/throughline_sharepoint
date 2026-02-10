// ============================================
// Card Renderer
// Maps CardRegistration entries to React components.
// Implemented cards → real component
// Placeholder cards → PlaceholderCard
// Locked cards → LockedCard overlay
// ============================================

import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { CardRegistration, CardStatus, LicenseTier } from '../models/CardCatalog';
import { CardSize } from '../types/CardSize';
import { DataMode } from '../hooks/useDashboardData';

// Card components — medium/standard variants
import { TodaysAgendaCard, TodaysAgendaCardLarge } from '../components/TodaysAgendaCard';
import { UpcomingWeekCard, UpcomingWeekCardLarge } from '../components/UpcomingWeekCard';
import { MyTasksCard, MyTasksCardLarge } from '../components/MyTasksCard';
import { EmailCard, EmailCardLarge } from '../components/EmailCard';
import { RecentFilesCard, RecentFilesCardLarge } from '../components/RecentFilesCard';
import { MyTeamCard, MyTeamCardLarge } from '../components/MyTeamCard';
import { SharedWithMeCard, SharedWithMeCardLarge } from '../components/SharedWithMeCard';
import { SiteActivityCard } from '../components/SiteActivityCard';
import { QuickLinksCard } from '../components/QuickLinksCard';
import { WaitingOnYouCard, WaitingOnYouCardLarge } from '../components/WaitingOnYouCard';
import { WaitingOnOthersCard } from '../components/WaitingOnOthersCard';
import { WaitingOnOthersCardLarge } from '../components/WaitingOnOthersCardLarge';
import { ContextSwitchingCard, ContextSwitchingCardLarge } from '../components/ContextSwitchingCard';
import { ApprovalBottlenecksCard, ApprovalBottlenecksCardLarge } from '../components/ApprovalBottlenecksCard';
import { PreMeetingConflictsCard, PreMeetingConflictsCardLarge } from '../components/PreMeetingConflictsCard';
import { ContextualActionsCard, ContextualActionsCardLarge } from '../components/ContextualActionsCard';

// Productivity Patterns cards
import { PeakProductivityCard, PeakProductivityCardLarge } from '../components/PeakProductivityCard';
import { DeepWorkOpportunitiesCard, DeepWorkOpportunitiesCardLarge } from '../components/DeepWorkOpportunitiesCard';
import { AfterHoursFootprintCard, AfterHoursFootprintCardLarge } from '../components/AfterHoursFootprintCard';
import { MeetingPrepGapCard, MeetingPrepGapCardLarge } from '../components/MeetingPrepGapCard';
import { EmailResponseCard, EmailResponseCardLarge } from '../components/EmailResponseCard';
import { CollaborationOverloadCard, CollaborationOverloadCardLarge } from '../components/CollaborationOverloadCard';
import { CommitmentCapacityCard, CommitmentCapacityCardLarge } from '../components/CommitmentCapacityCard';
import { SeasonalWorkloadCard, SeasonalWorkloadCardLarge } from '../components/SeasonalWorkloadCard';
import { MeetingCreepCard, MeetingCreepCardLarge } from '../components/MeetingCreepCard';

// Placeholder and locked card components
import { PlaceholderCard } from '../components/cards/PlaceholderCard/PlaceholderCard';
import { LockedCard } from '../components/cards/LockedCard/LockedCard';

// Settings interfaces
import {
  IWaitingOnYouSettings,
  IWaitingOnOthersSettings,
  IContextSwitchingSettings,
} from '../components/DashboardCards';

// ============================================
// Props for the card renderer
// ============================================
export interface CardRenderProps {
  context: WebPartContext;
  graphClient: MSGraphClientV3 | null | undefined;
  dataMode: DataMode;
  aiDemoMode: boolean;
  size: CardSize;
  onSizeChange: (size: CardSize) => void;
  // Card-specific settings
  waitingOnYouSettings: IWaitingOnYouSettings;
  waitingOnOthersSettings: IWaitingOnOthersSettings;
  contextSwitchingSettings: IContextSwitchingSettings;
  // Custom title
  cardTitle?: string;
  /** Opens the Command Centre to a specific platform's detail page */
  onOpenIntegrations?: (platformId: string) => void;
  /** Opens the Card Store to a specific card's detail page */
  onStoreOpen?: (cardId: string) => void;
}

// ============================================
// Render a card from the registry
// ============================================

/**
 * Render a card from its CardRegistration entry.
 *
 * Decision tree:
 * 1. If the card is locked (tier insufficient) → LockedCard
 * 2. If the card has an existingCardId with a real component → real component
 * 3. Otherwise → PlaceholderCard
 */
export function renderCardFromRegistry(
  card: CardRegistration,
  props: CardRenderProps,
  currentTier: LicenseTier,
  isAccessible: boolean,
): React.ReactNode {
  const { size } = props;

  // 1. Locked card — tier insufficient
  if (!isAccessible) {
    return (
      <LockedCard
        card={card}
        size={size}
        currentTier={currentTier}
        onStoreOpen={props.onStoreOpen}
      />
    );
  }

  // 2. Implemented card — render real component
  if (card.status === CardStatus.Implemented && card.existingCardId) {
    const element = renderImplementedCard(card.existingCardId, props);
    if (element) return element;
  }

  // 3. Placeholder card — not yet built
  return (
    <PlaceholderCard
      card={card}
      size={size}
      onOpenIntegrations={card.isIntegrationCard ? props.onOpenIntegrations : undefined}
    />
  );
}

// ============================================
// Render an implemented card by legacy ID
// ============================================

function renderImplementedCard(
  existingCardId: string,
  props: CardRenderProps,
): React.ReactNode | null {
  const {
    context,
    graphClient,
    dataMode,
    aiDemoMode,
    size,
    onSizeChange,
    waitingOnYouSettings,
    waitingOnOthersSettings,
    contextSwitchingSettings,
    cardTitle,
  } = props;

  const effectiveAiDemo = dataMode === 'test' && aiDemoMode;

  // Standard props shared by most cards
  const standardProps = {
    context,
    dataMode,
    aiDemoMode: effectiveAiDemo,
    size,
    onSizeChange,
  };

  switch (existingCardId) {
    // --- Standard cards (context + dataMode pattern) ---
    case 'todaysAgenda':
      if (size === 'large') return <TodaysAgendaCardLarge {...standardProps} />;
      return <TodaysAgendaCard {...standardProps} />;

    case 'email':
      if (size === 'large') return <EmailCardLarge {...standardProps} />;
      return <EmailCard {...standardProps} />;

    case 'upcomingWeek':
      if (size === 'large') return <UpcomingWeekCardLarge {...standardProps} />;
      return <UpcomingWeekCard {...standardProps} />;

    case 'myTasks':
      if (size === 'large') return <MyTasksCardLarge {...standardProps} />;
      return <MyTasksCard {...standardProps} />;

    case 'recentFiles':
      if (size === 'large') return <RecentFilesCardLarge {...standardProps} />;
      return <RecentFilesCard {...standardProps} />;

    case 'myTeam':
      if (size === 'large') return <MyTeamCardLarge {...standardProps} />;
      return <MyTeamCard {...standardProps} />;

    case 'sharedWithMe':
      if (size === 'large') return <SharedWithMeCardLarge {...standardProps} />;
      return <SharedWithMeCard {...standardProps} />;

    case 'siteActivity':
      return <SiteActivityCard {...standardProps} />;

    case 'quickLinks':
      return <QuickLinksCard {...standardProps} />;

    // --- unreadInbox and flaggedEmails are separate conceptual cards ---
    // They were previously mapped to EmailCard, but that caused duplicates.
    // They should render as placeholders until their own components are built.
    // (My Urgent Items → unreadInbox, Broken Promises → flaggedEmails)

    // --- Waiting On You (uses graphClient, not context) ---
    case 'waitingOnYou':
      if (size === 'large') {
        return (
          <WaitingOnYouCardLarge
            graphClient={graphClient || null}
            showChart={waitingOnYouSettings.showChart}
            staleDays={waitingOnYouSettings.staleDays}
            includeEmail={waitingOnYouSettings.includeEmail}
            includeTeamsChats={waitingOnYouSettings.includeTeamsChats}
            includeChannels={waitingOnYouSettings.includeChannels}
            includeMentions={waitingOnYouSettings.includeMentions}
            dataMode={dataMode}
            aiDemoMode={effectiveAiDemo}
            onSizeChange={onSizeChange}
          />
        );
      }
      return (
        <WaitingOnYouCard
          graphClient={graphClient || null}
          showChart={waitingOnYouSettings.showChart}
          staleDays={waitingOnYouSettings.staleDays}
          includeEmail={waitingOnYouSettings.includeEmail}
          includeTeamsChats={waitingOnYouSettings.includeTeamsChats}
          includeChannels={waitingOnYouSettings.includeChannels}
          includeMentions={waitingOnYouSettings.includeMentions}
          dataMode={dataMode}
          aiDemoMode={effectiveAiDemo}
          size={size}
          onSizeChange={onSizeChange}
        />
      );

    // --- Waiting On Others (uses context + settings object) ---
    case 'waitingOnOthers':
      if (size === 'large') {
        return (
          <WaitingOnOthersCardLarge
            context={context}
            settings={{
              minWaitHours: waitingOnOthersSettings.minWaitHours,
              includeEmail: waitingOnOthersSettings.includeEmail,
              includeTeamsChats: waitingOnOthersSettings.includeTeamsChats,
              includeMentions: waitingOnOthersSettings.includeMentions,
              showChart: waitingOnOthersSettings.showChart,
            }}
            dataMode={dataMode}
            aiDemoMode={effectiveAiDemo}
            onSizeChange={onSizeChange}
          />
        );
      }
      return (
        <WaitingOnOthersCard
          context={context}
          settings={{
            minWaitHours: waitingOnOthersSettings.minWaitHours,
            includeEmail: waitingOnOthersSettings.includeEmail,
            includeTeamsChats: waitingOnOthersSettings.includeTeamsChats,
            includeMentions: waitingOnOthersSettings.includeMentions,
            showChart: waitingOnOthersSettings.showChart,
          }}
          dataMode={dataMode}
          aiDemoMode={effectiveAiDemo}
          size={size}
          onSizeChange={onSizeChange}
        />
      );

    // --- Context Switching (uses graphClient + settings) ---
    case 'contextSwitching': {
      const contextSettings = {
        minSwitchDuration: 30,
        trackEmail: contextSwitchingSettings.trackEmail,
        trackTeamsChat: contextSwitchingSettings.trackTeamsChat,
        trackTeamsChannel: contextSwitchingSettings.trackTeamsChannel,
        trackMeetings: contextSwitchingSettings.trackMeetings,
        trackFiles: contextSwitchingSettings.trackFiles,
        trackTasks: false,
        focusGoal: contextSwitchingSettings.focusGoal,
        workingHoursStart: 9,
        workingHoursEnd: 17,
        showFocusScore: contextSwitchingSettings.showFocusScore,
        showHourlyChart: contextSwitchingSettings.showHourlyChart,
        showDistribution: contextSwitchingSettings.showDistribution,
        trendDays: 7,
      };
      if (size === 'large') {
        return (
          <ContextSwitchingCardLarge
            graphClient={graphClient || undefined}
            dataMode={dataMode}
            aiDemoMode={effectiveAiDemo}
            title={cardTitle || 'Context Switching'}
            onSizeChange={onSizeChange}
            settings={contextSettings}
          />
        );
      }
      return (
        <ContextSwitchingCard
          graphClient={graphClient || undefined}
          dataMode={dataMode}
          aiDemoMode={effectiveAiDemo}
          title={cardTitle || 'Context Switching'}
          size={size}
          onSizeChange={onSizeChange}
          settings={contextSettings}
        />
      );
    }

    // --- Approval Bottlenecks (standard props) ---
    case 'approvalBottlenecks':
      if (size === 'large') return <ApprovalBottlenecksCardLarge {...standardProps} />;
      return <ApprovalBottlenecksCard {...standardProps} />;

    // --- Pre-Meeting Conflicts (standard props) ---
    case 'preMeetingConflicts':
      if (size === 'large') return <PreMeetingConflictsCardLarge {...standardProps} />;
      return <PreMeetingConflictsCard {...standardProps} />;

    // --- Contextual Action Suggestions (standard props) ---
    case 'contextualActions':
      if (size === 'large') return <ContextualActionsCardLarge {...standardProps} />;
      return <ContextualActionsCard {...standardProps} />;

    // --- Productivity Patterns cards (standard props) ---
    case 'peakProductivity':
      if (size === 'large') return <PeakProductivityCardLarge {...standardProps} />;
      return <PeakProductivityCard {...standardProps} />;

    case 'deepWorkOpportunities':
      if (size === 'large') return <DeepWorkOpportunitiesCardLarge {...standardProps} />;
      return <DeepWorkOpportunitiesCard {...standardProps} />;

    case 'afterHoursFootprint':
      if (size === 'large') return <AfterHoursFootprintCardLarge {...standardProps} />;
      return <AfterHoursFootprintCard {...standardProps} />;

    case 'meetingPrepGap':
      if (size === 'large') return <MeetingPrepGapCardLarge {...standardProps} />;
      return <MeetingPrepGapCard {...standardProps} />;

    case 'emailResponse':
      if (size === 'large') return <EmailResponseCardLarge {...standardProps} />;
      return <EmailResponseCard {...standardProps} />;

    case 'collaborationOverload':
      if (size === 'large') return <CollaborationOverloadCardLarge {...standardProps} />;
      return <CollaborationOverloadCard {...standardProps} />;

    case 'commitmentCapacity':
      if (size === 'large') return <CommitmentCapacityCardLarge {...standardProps} />;
      return <CommitmentCapacityCard {...standardProps} />;

    case 'seasonalWorkload':
      if (size === 'large') return <SeasonalWorkloadCardLarge {...standardProps} />;
      return <SeasonalWorkloadCard {...standardProps} />;

    case 'meetingCreep':
      if (size === 'large') return <MeetingCreepCardLarge {...standardProps} />;
      return <MeetingCreepCard {...standardProps} />;

    // --- organizationalHandoffMap (not yet a card, but registered as implemented) ---
    case 'organizationalHandoffMap':
      return null; // No component yet

    default:
      return null;
  }
}
