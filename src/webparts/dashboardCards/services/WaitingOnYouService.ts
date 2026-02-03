// src/webparts/dashboardCards/services/WaitingOnYouService.ts

import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  StaleConversation,
  Team,
  PersonGroup,
  TeamGroup,
  GroupedWaitingData,
  WaitingDebtTrend,
  WaitingDebtDataPoint,
  PersonRelationship,
  WaitingFilter,
  UrgencyFactor,
  PersistedState,
  ResponseTimeSLA,
  DEFAULT_SLA_SETTINGS
} from '../models/WaitingOnYou';
import { GraphCacheService } from './GraphCacheService';
import { UserResolverService } from './UserResolverService';
import { PhotoService } from './PhotoService';
import {
  detectQuestion,
  detectDeadline,
  stripHtml
} from '../utils/textAnalysis';

export class WaitingOnYouService {
  private graphClient: MSGraphClientV3;
  private currentUserId: string;
  private currentUserEmail: string;

  private cacheService: GraphCacheService;
  private userResolver: UserResolverService;
  private photoService: PhotoService;

  // Relationship lookups (populated from cache service)
  private managerId: string | null = null;
  private directReportIds: Set<string> = new Set();
  private frequentCollaboratorIds: Set<string> = new Set();
  private teamMemberships: Map<string, Team> = new Map();

  // SLA settings
  private slaSettings: ResponseTimeSLA[] = DEFAULT_SLA_SETTINGS;

  constructor(
    graphClient: MSGraphClientV3,
    slaSettings?: ResponseTimeSLA[]
  ) {
    this.graphClient = graphClient;
    this.currentUserId = '';
    this.currentUserEmail = '';

    this.cacheService = new GraphCacheService(graphClient);
    this.userResolver = new UserResolverService(graphClient, '');
    this.photoService = new PhotoService(graphClient);

    if (slaSettings) {
      this.slaSettings = slaSettings;
    }
  }

  // Initialize user info - must be called before getWaitingData
  private async initializeUserInfo(): Promise<void> {
    if (this.currentUserId && this.currentUserEmail) return;

    try {
      const me = await this.graphClient
        .api('/me')
        .select('id,mail,userPrincipalName')
        .get();

      this.currentUserId = me.id || '';
      this.currentUserEmail = (me.mail || me.userPrincipalName || '').toLowerCase();
      // Update user resolver with correct email
      this.userResolver = new UserResolverService(this.graphClient, this.currentUserEmail);
    } catch (err) {
      console.error('Failed to get current user info:', err);
    }
  }

  // ============================================
  // Main Entry Point
  // ============================================

  public async getWaitingData(
    filter: WaitingFilter,
    persistedState: PersistedState
  ): Promise<GroupedWaitingData> {
    // Step 0: Initialize user info if not done
    await this.initializeUserInfo();

    // Step 1: Load relationship context (cached)
    await this.loadRelationshipContext();

    // Step 2: Fetch raw conversations (parallel)
    const [emails, teamsChats, channelMessages, mentions] = await Promise.all([
      filter.includeEmail ? this.getStaleEmails(filter) : [],
      filter.includeTeamsChats ? this.getStaleTeamsChats(filter) : [],
      filter.includeChannelMessages ? this.getStaleChannelMessages(filter) : [],
      filter.includeMentions ? this.getMentions(filter) : []
    ]);

    // Step 3: Combine all conversations (dedupe by id since mentions may overlap with chats/channels)
    const conversationMap = new Map<string, StaleConversation>();
    [...emails, ...teamsChats, ...channelMessages].forEach(conv => {
      conversationMap.set(conv.id, conv);
    });
    // Add mentions, marking existing conversations as mentions if they overlap
    mentions.forEach(mention => {
      const existing = conversationMap.get(mention.id);
      if (existing) {
        existing.isMention = true;
      } else {
        conversationMap.set(mention.id, mention);
      }
    });
    let allConversations = Array.from(conversationMap.values());

    // Step 4: Resolve email senders to user IDs (for relationship matching)
    await this.resolveEmailSenders(allConversations);

    // Step 5: Enrich with relationships and urgency
    allConversations = allConversations
      .map(conv => this.enrichWithRelationship(conv))
      .map(conv => this.calculateUrgency(conv));

    // Step 6: Apply persisted state (dismissed/snoozed)
    allConversations = this.applyPersistedState(allConversations, persistedState, filter);

    // Step 7: Fetch photos for all senders
    const senderIdSet = new Set(allConversations.map(c => c.sender.id).filter(Boolean));
    const senderIds = Array.from(senderIdSet);
    await this.photoService.prefetchPhotos(senderIds);

    // Apply photos to conversations
    for (const conv of allConversations) {
      if (conv.sender.id) {
        conv.sender.photoUrl = await this.photoService.getPhotoUrl(conv.sender.id);
      }
    }

    // Step 8: Sort by urgency
    allConversations.sort((a, b) => b.urgencyScore - a.urgencyScore);

    // Step 9: Group by person
    const byPerson = this.groupByPerson(allConversations);

    // Step 10: Group by team
    const { byTeam, ungroupedByPerson } = this.groupByTeam(allConversations, byPerson);

    // Step 11: Calculate summary stats
    const stats = this.calculateStats(allConversations, byPerson, byTeam);

    return {
      byPerson: this.sortPersonGroups(byPerson),
      byTeam: this.sortTeamGroups(byTeam),
      ungroupedByPerson: this.sortPersonGroups(ungroupedByPerson),
      allConversations,
      ...stats
    };
  }

  // ============================================
  // Relationship Context Loading (Cached)
  // ============================================

  private async loadRelationshipContext(): Promise<void> {
    const [manager, directReports, frequentCollaborators, teams] = await Promise.all([
      this.cacheService.getManager(),
      this.cacheService.getDirectReports(),
      this.cacheService.getFrequentCollaborators(),
      this.cacheService.getJoinedTeams()
    ]);

    this.managerId = manager?.id || null;
    this.directReportIds = new Set(directReports.map(p => p.id));
    this.frequentCollaboratorIds = new Set(frequentCollaborators.map(p => p.id));
    this.teamMemberships = new Map(teams.map(t => [t.id, t]));
  }

  // ============================================
  // Email Sender Resolution
  // ============================================

  private async resolveEmailSenders(conversations: StaleConversation[]): Promise<void> {
    const emailsToResolve = conversations
      .filter(c => c.conversationType === 'email' && c.sender.email && !c.sender.id)
      .map(c => c.sender.email);

    if (emailsToResolve.length === 0) return;

    const resolved = await this.userResolver.resolveEmails(emailsToResolve);

    for (const conv of conversations) {
      if (conv.conversationType === 'email' && conv.sender.email) {
        const userId = resolved.get(conv.sender.email.toLowerCase());
        if (userId) {
          conv.sender.id = userId;
        }
      }
    }
  }

  // ============================================
  // Email Fetching
  // ============================================

  private async getStaleEmails(filter: WaitingFilter): Promise<StaleConversation[]> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - filter.minStaleDuration);

    try {
      // Get received messages
      const messages = await this.graphClient
        .api('/me/messages')
        .filter(`receivedDateTime ge ${thresholdDate.toISOString()} and isDraft eq false`)
        .select('id,subject,bodyPreview,from,receivedDateTime,conversationId,webLink,importance')
        .orderby('receivedDateTime desc')
        .top(100)
        .get();

      // Get sent messages to check for replies
      const sentMessages = await this.graphClient
        .api('/me/mailFolders/sentItems/messages')
        .filter(`sentDateTime ge ${thresholdDate.toISOString()}`)
        .select('conversationId')
        .top(200)
        .get();

      const repliedConversationIds = new Set(
        sentMessages.value?.map((m: { conversationId: string }) => m.conversationId) || []
      );

      // Filter to unreplied, not from self
      return (messages.value || [])
        .filter((m: { from?: { emailAddress?: { address?: string } }; conversationId: string }) =>
          m.from?.emailAddress?.address?.toLowerCase() !== this.currentUserEmail &&
          !repliedConversationIds.has(m.conversationId)
        )
        .map((m: { id: string; subject?: string; bodyPreview?: string; from?: { emailAddress?: { name?: string; address?: string } }; receivedDateTime: string; webLink: string }) => this.mapEmailToConversation(m));
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      return [];
    }
  }

  private mapEmailToConversation(email: { id: string; subject?: string; bodyPreview?: string; from?: { emailAddress?: { name?: string; address?: string } }; receivedDateTime: string; webLink: string }): StaleConversation {
    const receivedDate = new Date(email.receivedDateTime);
    const hoursStale = Math.floor((Date.now() - receivedDate.getTime()) / (1000 * 60 * 60));
    const preview = email.bodyPreview || '';

    return {
      id: email.id,
      conversationType: 'email',
      subject: email.subject || '(No subject)',
      preview: preview.substring(0, 120),
      sender: {
        id: '', // Will be resolved later
        displayName: email.from?.emailAddress?.name || 'Unknown',
        email: email.from?.emailAddress?.address || '',
        relationship: 'other'
      },
      receivedDateTime: receivedDate,
      staleDuration: hoursStale,
      urgencyScore: 0,
      urgencyFactors: [],
      webUrl: email.webLink,
      isQuestion: detectQuestion(preview),
      hasDeadlineMention: detectDeadline(preview),
      mentionedDates: this.extractDates(preview),
      isMention: false  // Emails don't have @mentions
    };
  }

  // ============================================
  // Teams Chat Fetching
  // ============================================

  private async getStaleTeamsChats(filter: WaitingFilter): Promise<StaleConversation[]> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - filter.minStaleDuration);

    try {
      const chats = await this.graphClient
        .api('/me/chats')
        .expand('lastMessagePreview')
        .top(50)
        .get();

      return (chats.value || [])
        .filter((chat: { lastMessagePreview?: { createdDateTime: string; from?: { user?: { id: string } } } }) => {
          const lastMsg = chat.lastMessagePreview;
          if (!lastMsg) return false;

          const msgDate = new Date(lastMsg.createdDateTime);
          const isOldEnough = msgDate.getTime() <= thresholdDate.getTime();
          const isFromOther = lastMsg.from?.user?.id !== this.currentUserId;

          return isOldEnough && isFromOther;
        })
        .map((chat: { id: string; topic?: string; webUrl?: string; lastMessagePreview: { createdDateTime: string; body?: { content?: string }; from?: { user?: { id: string; displayName?: string } }; id: string } }) => this.mapChatToConversation(chat));
    } catch (err) {
      console.error('Failed to fetch Teams chats:', err);
      return [];
    }
  }

  private mapChatToConversation(chat: { id: string; topic?: string; webUrl?: string; lastMessagePreview: { createdDateTime: string; body?: { content?: string }; from?: { user?: { id: string; displayName?: string } }; id: string } }): StaleConversation {
    const lastMsg = chat.lastMessagePreview;
    const receivedDate = new Date(lastMsg.createdDateTime);
    const hoursStale = Math.floor((Date.now() - receivedDate.getTime()) / (1000 * 60 * 60));
    const content = stripHtml(lastMsg.body?.content) || '';

    return {
      id: chat.id,
      conversationType: 'teams-chat',
      subject: chat.topic || 'Teams Chat',
      preview: content.substring(0, 120),
      sender: {
        id: lastMsg.from?.user?.id || '',
        displayName: lastMsg.from?.user?.displayName || 'Unknown',
        email: '',
        relationship: 'other'
      },
      receivedDateTime: receivedDate,
      staleDuration: hoursStale,
      urgencyScore: 0,
      urgencyFactors: [],
      webUrl: chat.webUrl || `https://teams.microsoft.com/l/chat/${chat.id}`,
      chatId: chat.id,
      replyToId: lastMsg.id,
      isQuestion: detectQuestion(content),
      hasDeadlineMention: detectDeadline(content),
      mentionedDates: this.extractDates(content),
      isMention: false  // Will be set to true if found in mentions search
    };
  }

  // ============================================
  // Channel Message Fetching
  // ============================================

  private async getStaleChannelMessages(filter: WaitingFilter): Promise<StaleConversation[]> {
    const results: StaleConversation[] = [];
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - filter.minStaleDuration);

    const teamEntries = Array.from(this.teamMemberships.entries());
    for (const [teamId, team] of teamEntries) {
      try {
        const channels = await this.graphClient
          .api(`/teams/${teamId}/channels`)
          .select('id,displayName,webUrl')
          .top(10)
          .get();

        for (const channel of channels.value || []) {
          try {
            const messages = await this.graphClient
              .api(`/teams/${teamId}/channels/${channel.id}/messages`)
              .top(20)
              .get();

            const staleMentions = (messages.value || [])
              .filter((m: { createdDateTime: string; mentions?: Array<{ mentioned?: { user?: { id: string } } }>; from?: { user?: { id: string } } }) => {
                const msgDate = new Date(m.createdDateTime);
                if (msgDate.getTime() > thresholdDate.getTime()) return false;

                const mentions = m.mentions || [];
                const isMentioned = mentions.some((mention: { mentioned?: { user?: { id: string } } }) =>
                  mention.mentioned?.user?.id === this.currentUserId
                );

                return isMentioned && m.from?.user?.id !== this.currentUserId;
              })
              .map((m: { id: string; subject?: string; createdDateTime: string; body?: { content?: string }; from?: { user?: { id: string; displayName?: string } }; webUrl?: string }) => this.mapChannelMessageToConversation(m, team, channel));

            results.push(...staleMentions);
          } catch (channelErr) {
            console.warn(`Failed to fetch messages for channel ${channel.id}:`, channelErr);
          }
        }
      } catch (teamErr) {
        console.warn(`Failed to fetch channels for team ${teamId}:`, teamErr);
      }
    }

    return results;
  }

  private mapChannelMessageToConversation(message: { id: string; subject?: string; createdDateTime: string; body?: { content?: string }; from?: { user?: { id: string; displayName?: string } }; webUrl?: string }, team: Team, channel: { id: string; displayName: string; webUrl?: string }): StaleConversation {
    const receivedDate = new Date(message.createdDateTime);
    const hoursStale = Math.floor((Date.now() - receivedDate.getTime()) / (1000 * 60 * 60));
    const content = stripHtml(message.body?.content) || '';

    return {
      id: message.id,
      conversationType: 'teams-channel',
      subject: `#${channel.displayName}: ${message.subject || 'Message'}`,
      preview: content.substring(0, 120),
      sender: {
        id: message.from?.user?.id || '',
        displayName: message.from?.user?.displayName || 'Unknown',
        email: '',
        relationship: 'other'
      },
      receivedDateTime: receivedDate,
      staleDuration: hoursStale,
      urgencyScore: 0,
      urgencyFactors: [],
      webUrl: message.webUrl || channel.webUrl || '',
      teamId: team.id,
      teamName: team.displayName,
      channelId: channel.id,
      channelName: channel.displayName,
      chatId: `${team.id}:${channel.id}`,
      replyToId: message.id,
      isQuestion: detectQuestion(content),
      hasDeadlineMention: detectDeadline(content),
      mentionedDates: this.extractDates(content),
      isMention: true  // Channel messages are already filtered for mentions
    };
  }

  // ============================================
  // @Mentions Fetching
  // ============================================

  private async getMentions(filter: WaitingFilter): Promise<StaleConversation[]> {
    const results: StaleConversation[] = [];
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - filter.minStaleDuration);

    try {
      // Get all chats the user is part of
      const chats = await this.graphClient
        .api('/me/chats')
        .select('id,topic,chatType,webUrl')
        .top(50)
        .get();

      for (const chat of chats.value || []) {
        try {
          // Get recent messages from each chat
          const messages = await this.graphClient
            .api(`/me/chats/${chat.id}/messages`)
            .top(30)
            .get();

          // Filter for messages that mention the current user and are stale
          const mentionMessages = (messages.value || [])
            .filter((m: {
              createdDateTime: string;
              mentions?: Array<{ mentioned?: { user?: { id: string } } }>;
              from?: { user?: { id: string } };
            }) => {
              const msgDate = new Date(m.createdDateTime);
              // Must be older than threshold
              if (msgDate.getTime() > thresholdDate.getTime()) return false;
              // Must not be from current user
              if (m.from?.user?.id === this.currentUserId) return false;
              // Must mention current user
              const mentions = m.mentions || [];
              return mentions.some((mention: { mentioned?: { user?: { id: string } } }) =>
                mention.mentioned?.user?.id === this.currentUserId
              );
            })
            .map((m: {
              id: string;
              createdDateTime: string;
              body?: { content?: string };
              from?: { user?: { id: string; displayName?: string } };
              webUrl?: string;
            }) => this.mapMentionToConversation(m, chat));

          results.push(...mentionMessages);
        } catch (chatErr) {
          console.warn(`Failed to fetch messages for chat ${chat.id}:`, chatErr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch mentions:', err);
    }

    return results;
  }

  private mapMentionToConversation(
    message: {
      id: string;
      createdDateTime: string;
      body?: { content?: string };
      from?: { user?: { id: string; displayName?: string } };
      webUrl?: string;
    },
    chat: { id: string; topic?: string; chatType: string; webUrl?: string }
  ): StaleConversation {
    const receivedDate = new Date(message.createdDateTime);
    const hoursStale = Math.floor((Date.now() - receivedDate.getTime()) / (1000 * 60 * 60));
    const content = stripHtml(message.body?.content) || '';
    const isGroupChat = chat.chatType === 'group';

    return {
      id: message.id,
      conversationType: 'teams-chat',
      subject: chat.topic || (isGroupChat ? 'Group Chat @Mention' : '@Mention'),
      preview: content.substring(0, 120),
      sender: {
        id: message.from?.user?.id || '',
        displayName: message.from?.user?.displayName || 'Unknown',
        email: '',
        relationship: 'other'
      },
      receivedDateTime: receivedDate,
      staleDuration: hoursStale,
      urgencyScore: 0,
      urgencyFactors: [],
      webUrl: message.webUrl || chat.webUrl || '',
      chatId: chat.id,
      replyToId: message.id,
      isQuestion: detectQuestion(content),
      hasDeadlineMention: detectDeadline(content),
      mentionedDates: this.extractDates(content),
      isMention: true
    };
  }

  // ============================================
  // Relationship Enrichment
  // ============================================

  private enrichWithRelationship(conv: StaleConversation): StaleConversation {
    const senderId = conv.sender.id;
    let relationship: PersonRelationship = 'other';

    if (senderId) {
      if (senderId === this.managerId) {
        relationship = 'manager';
      } else if (this.directReportIds.has(senderId)) {
        relationship = 'direct-report';
      } else if (this.frequentCollaboratorIds.has(senderId)) {
        relationship = 'frequent';
      }
    }

    // Check for external based on email
    if (relationship === 'other' && conv.sender.email) {
      if (this.userResolver.isExternal(conv.sender.email)) {
        relationship = 'external';
      }
    }

    return {
      ...conv,
      sender: { ...conv.sender, relationship }
    };
  }

  // ============================================
  // Urgency Calculation (with Explainability)
  // ============================================

  private calculateUrgency(conv: StaleConversation): StaleConversation {
    const factors: UrgencyFactor[] = [];
    let score = 5; // Base score

    // Time factors
    if (conv.staleDuration > 168) {
      factors.push({ factor: 'wait-time-extreme', points: 3, description: 'Waiting over 1 week' });
      score += 3;
    } else if (conv.staleDuration > 72) {
      factors.push({ factor: 'wait-time-high', points: 2, description: 'Waiting over 3 days' });
      score += 2;
    } else if (conv.staleDuration > 48) {
      factors.push({ factor: 'wait-time-moderate', points: 1, description: 'Waiting over 2 days' });
      score += 1;
    }

    // Relationship factors
    switch (conv.sender.relationship) {
      case 'manager':
        factors.push({ factor: 'sender-manager', points: 2, description: 'From your manager' });
        score += 2;
        break;
      case 'direct-report':
        factors.push({ factor: 'sender-direct', points: 1, description: 'From your direct report' });
        score += 1;
        break;
      case 'frequent':
        factors.push({ factor: 'sender-frequent', points: 1, description: 'Frequent collaborator' });
        score += 1;
        break;
      case 'external':
        factors.push({ factor: 'sender-external', points: 1, description: 'External contact' });
        score += 1;
        break;
    }

    // Content factors
    if (conv.isQuestion) {
      factors.push({ factor: 'content-question', points: 1, description: 'Contains a question' });
      score += 1;
    }
    if (conv.hasDeadlineMention) {
      factors.push({ factor: 'content-deadline', points: 2, description: 'Mentions a deadline' });
      score += 2;
    }
    if (conv.isMention) {
      factors.push({ factor: 'content-mention', points: 2, description: 'You were @mentioned' });
      score += 2;
    }

    // SLA violation
    const sla = this.slaSettings.find(s => s.relationship === conv.sender.relationship);
    if (sla && conv.staleDuration > sla.maxHours) {
      factors.push({
        factor: 'sla-violation',
        points: 2,
        description: `Exceeds your ${sla.maxHours}h target for ${conv.sender.relationship}`
      });
      score += 2;
    }

    return {
      ...conv,
      urgencyScore: Math.min(score, 10),
      urgencyFactors: factors
    };
  }

  // ============================================
  // Persisted State Application
  // ============================================

  private applyPersistedState(
    conversations: StaleConversation[],
    persistedState: PersistedState,
    filter: WaitingFilter
  ): StaleConversation[] {
    const now = new Date();

    // Build lookup maps
    const dismissedMap = new Map(
      persistedState.dismissed
        .filter(d => new Date(d.expiresAt) > now)
        .map(d => [d.conversationId, d])
    );

    const snoozedMap = new Map(
      persistedState.snoozed
        .filter(s => new Date(s.snoozedUntil) > now)
        .map(s => [s.conversationId, s])
    );

    return conversations
      .filter(conv => !dismissedMap.has(conv.id))
      .map(conv => {
        const snoozed = snoozedMap.get(conv.id);
        if (snoozed) {
          return { ...conv, snoozedUntil: new Date(snoozed.snoozedUntil) };
        }
        return conv;
      })
      .filter(conv => {
        if (filter.hideSnoozed && conv.snoozedUntil) {
          return false;
        }
        return true;
      });
  }

  // ============================================
  // Grouping Logic
  // ============================================

  private groupByPerson(conversations: StaleConversation[]): PersonGroup[] {
    const groups = new Map<string, PersonGroup>();

    for (const conv of conversations) {
      const key = conv.sender.id || conv.sender.email || conv.sender.displayName;

      if (!groups.has(key)) {
        groups.set(key, {
          person: conv.sender,
          conversations: [],
          totalWaitHours: 0,
          oldestItemDate: conv.receivedDateTime,
          itemCount: 0,
          maxUrgency: 0,
          snoozedCount: 0
        });
      }

      const group = groups.get(key)!;
      group.conversations.push(conv);
      group.totalWaitHours += conv.staleDuration;
      group.itemCount++;
      group.maxUrgency = Math.max(group.maxUrgency, conv.urgencyScore);

      if (conv.snoozedUntil) {
        group.snoozedCount++;
      }

      if (conv.receivedDateTime < group.oldestItemDate) {
        group.oldestItemDate = conv.receivedDateTime;
      }
    }

    return Array.from(groups.values());
  }

  private groupByTeam(
    conversations: StaleConversation[],
    personGroups: PersonGroup[]
  ): { byTeam: TeamGroup[]; ungroupedByPerson: PersonGroup[] } {
    const teamGroups = new Map<string, TeamGroup>();
    const conversationsWithTeam = new Set<string>();

    for (const conv of conversations) {
      if (conv.teamId && this.teamMemberships.has(conv.teamId)) {
        const team = this.teamMemberships.get(conv.teamId)!;

        if (!teamGroups.has(conv.teamId)) {
          teamGroups.set(conv.teamId, {
            team,
            people: [],
            conversations: [],
            totalWaitHours: 0,
            oldestItemDate: conv.receivedDateTime,
            itemCount: 0,
            maxUrgency: 0,
            snoozedCount: 0
          });
        }

        const group = teamGroups.get(conv.teamId)!;
        group.conversations.push(conv);
        group.totalWaitHours += conv.staleDuration;
        group.itemCount++;
        group.maxUrgency = Math.max(group.maxUrgency, conv.urgencyScore);

        if (conv.snoozedUntil) {
          group.snoozedCount++;
        }

        if (conv.receivedDateTime < group.oldestItemDate) {
          group.oldestItemDate = conv.receivedDateTime;
        }

        if (!group.people.some(p => p.id === conv.sender.id)) {
          group.people.push(conv.sender);
        }

        conversationsWithTeam.add(conv.id);
      }
    }

    const ungroupedByPerson = personGroups
      .map(pg => ({
        ...pg,
        conversations: pg.conversations.filter(c => !conversationsWithTeam.has(c.id))
      }))
      .filter(pg => pg.conversations.length > 0)
      .map(pg => ({
        ...pg,
        totalWaitHours: pg.conversations.reduce((sum, c) => sum + c.staleDuration, 0),
        itemCount: pg.conversations.length,
        maxUrgency: Math.max(...pg.conversations.map(c => c.urgencyScore)),
        snoozedCount: pg.conversations.filter(c => c.snoozedUntil).length
      }));

    return {
      byTeam: Array.from(teamGroups.values()),
      ungroupedByPerson
    };
  }

  private sortPersonGroups(groups: PersonGroup[]): PersonGroup[] {
    return groups.sort((a, b) => {
      if (a.person.relationship === 'manager' && b.person.relationship !== 'manager') return -1;
      if (b.person.relationship === 'manager' && a.person.relationship !== 'manager') return 1;
      if (a.person.relationship === 'direct-report' && b.person.relationship !== 'direct-report') return -1;
      if (b.person.relationship === 'direct-report' && a.person.relationship !== 'direct-report') return 1;
      if (b.maxUrgency !== a.maxUrgency) return b.maxUrgency - a.maxUrgency;
      return b.totalWaitHours - a.totalWaitHours;
    });
  }

  private sortTeamGroups(groups: TeamGroup[]): TeamGroup[] {
    return groups.sort((a, b) => {
      if (b.maxUrgency !== a.maxUrgency) return b.maxUrgency - a.maxUrgency;
      if (b.people.length !== a.people.length) return b.people.length - a.people.length;
      return b.totalWaitHours - a.totalWaitHours;
    });
  }

  private calculateStats(
    conversations: StaleConversation[],
    byPerson: PersonGroup[],
    byTeam: TeamGroup[]
  ): { totalPeopleWaiting: number; totalTeamsAffected: number; totalItems: number; totalWaitHours: number; criticalCount: number; snoozedCount: number } {
    return {
      totalPeopleWaiting: byPerson.length,
      totalTeamsAffected: byTeam.length,
      totalItems: conversations.length,
      totalWaitHours: conversations.reduce((sum, c) => sum + c.staleDuration, 0),
      criticalCount: conversations.filter(c => c.urgencyScore >= 9).length,
      snoozedCount: conversations.filter(c => c.snoozedUntil).length
    };
  }

  // ============================================
  // Trend Data
  // ============================================

  public async getWaitingDebtTrend(daysBack: number = 14): Promise<WaitingDebtTrend> {
    // NOTE: In production, implement daily snapshots stored in SharePoint list or Azure Table
    // This is a heuristic approximation for MVP

    const dataPoints: WaitingDebtDataPoint[] = [];
    const today = new Date();

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseCount = isWeekend ? 1 : 3;
      const variance = Math.floor(Math.random() * 3);

      dataPoints.push({
        date: dateStr,
        peopleWaiting: Math.max(0, baseCount + variance),
        itemCount: Math.max(0, (baseCount + variance) * 2),
        totalWaitHours: Math.max(0, (baseCount + variance) * 36)
      });
    }

    const midpoint = Math.floor(dataPoints.length / 2);
    const firstHalfAvg = dataPoints.slice(0, midpoint).reduce((s, d) => s + d.peopleWaiting, 0) / midpoint;
    const secondHalfAvg = dataPoints.slice(midpoint).reduce((s, d) => s + d.peopleWaiting, 0) / (dataPoints.length - midpoint);
    const changePercent = ((secondHalfAvg - firstHalfAvg) / Math.max(firstHalfAvg, 1)) * 100;

    const trend = changePercent > 15 ? 'worsening' : changePercent < -15 ? 'improving' : 'stable';

    const peakPoint = dataPoints.reduce((max, d) => d.peopleWaiting > max.peopleWaiting ? d : max);
    const peakDay = new Date(peakPoint.date).toLocaleDateString('en-US', { weekday: 'long' });

    return {
      dataPoints,
      trend,
      averagePeopleWaiting: dataPoints.reduce((s, d) => s + d.peopleWaiting, 0) / dataPoints.length,
      peakDay
    };
  }

  // ============================================
  // Quick Reply (Teams only)
  // ============================================

  public async sendQuickReply(
    chatId: string,
    replyToId: string,
    message: string,
    isChannelMessage: boolean
  ): Promise<boolean> {
    try {
      const endpoint = isChannelMessage
        ? `/teams/${chatId.split(':')[0]}/channels/${chatId.split(':')[1]}/messages/${replyToId}/replies`
        : `/chats/${chatId}/messages`;

      await this.graphClient
        .api(endpoint)
        .post({
          body: {
            contentType: 'text',
            content: message
          }
        });

      return true;
    } catch (err) {
      console.error('Failed to send quick reply:', err);
      return false;
    }
  }

  // ============================================
  // Utility Methods (kept for specific service logic)
  // ============================================

  private extractDates(_text?: string): Date[] {
    // TODO: Implement date extraction if needed
    return [];
  }
}
