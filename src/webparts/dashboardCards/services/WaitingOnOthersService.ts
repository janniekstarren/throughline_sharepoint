// ============================================
// WaitingOnOthersService - Tracks who owes you a response
// ============================================

import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  PendingResponse,
  PersonOwesGroup,
  GroupedPendingData,
  PendingTrendData,
  PendingTrendDataPoint,
  PersonRelationship,
  PendingFilter,
  WaitingOnOthersPersistedState
} from '../models/WaitingOnOthers';
import { GraphCacheService } from './GraphCacheService';
import { UserResolverService } from './UserResolverService';
import { PhotoService } from './PhotoService';
import {
  detectQuestion,
  detectActionRequest,
  detectDeadline,
  stripHtml
} from '../utils/textAnalysis';

export class WaitingOnOthersService {
  private graphClient: MSGraphClientV3;
  private currentUserId: string;
  private currentUserEmail: string;

  // Reuse existing services
  private cacheService: GraphCacheService;
  private userResolver: UserResolverService;
  private photoService: PhotoService;

  // Relationship lookups
  private managerId: string | null = null;
  private directReportIds: Set<string> = new Set();
  private frequentCollaboratorIds: Set<string> = new Set();

  constructor(
    graphClient: MSGraphClientV3,
    userId: string,
    userEmail: string,
    cacheService: GraphCacheService,
    userResolver: UserResolverService,
    photoService: PhotoService
  ) {
    this.graphClient = graphClient;
    this.currentUserId = userId;
    this.currentUserEmail = userEmail.toLowerCase();
    this.cacheService = cacheService;
    this.userResolver = userResolver;
    this.photoService = photoService;
  }

  // ============================================
  // Main Entry Point
  // ============================================

  public async getPendingData(
    filter: PendingFilter,
    persistedState: WaitingOnOthersPersistedState
  ): Promise<GroupedPendingData> {
    // Step 1: Load relationship context (cached, shared with WaitingOnYou)
    await this.loadRelationshipContext();

    // Step 2: Fetch sent messages awaiting response (parallel)
    const [emails, teamsChats] = await Promise.all([
      filter.includeEmail ? this.getPendingEmails(filter) : [],
      filter.includeTeamsChats ? this.getPendingTeamsChats(filter) : []
    ]);

    // Step 3: Combine all pending items
    let allPendingItems = [...emails, ...teamsChats];

    // Step 4: Resolve recipients to user IDs
    await this.resolveRecipients(allPendingItems);

    // Step 5: Enrich with relationships
    allPendingItems = allPendingItems.map(item => this.enrichWithRelationship(item));

    // Step 6: Apply persisted state
    allPendingItems = this.applyPersistedState(allPendingItems, persistedState, filter);

    // Step 7: Fetch photos
    const recipientIds = Array.from(new Set(allPendingItems.map(i => i.recipient.id).filter(Boolean)));
    await this.photoService.prefetchPhotos(recipientIds);

    for (const item of allPendingItems) {
      if (item.recipient.id) {
        item.recipient.photoUrl = await this.photoService.getPhotoUrl(item.recipient.id);
      }
    }

    // Step 8: Sort by wait duration (longest first)
    allPendingItems.sort((a, b) => b.waitingDuration - a.waitingDuration);

    // Step 9: Group by person
    const byPerson = this.groupByPerson(allPendingItems);

    // Step 10: Calculate stats
    const stats = this.calculateStats(allPendingItems, byPerson);

    return {
      byPerson: this.sortPersonGroups(byPerson),
      allPendingItems,
      ...stats
    };
  }

  // ============================================
  // Relationship Context (Shared)
  // ============================================

  private async loadRelationshipContext(): Promise<void> {
    try {
      const [manager, directReports, frequentCollaborators] = await Promise.all([
        this.cacheService.getManager(),
        this.cacheService.getDirectReports(),
        this.cacheService.getFrequentCollaborators()
      ]);

      this.managerId = manager?.id || null;
      this.directReportIds = new Set(directReports.map(p => p.id));
      this.frequentCollaboratorIds = new Set(frequentCollaborators.map(p => p.id));
    } catch (err) {
      console.warn('Failed to load relationship context:', err);
    }
  }

  // ============================================
  // Email Fetching (Sent, Awaiting Reply)
  // ============================================

  private async getPendingEmails(filter: PendingFilter): Promise<PendingResponse[]> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - filter.minWaitDuration);

    try {
      // Get sent messages
      const sentMessages = await this.graphClient
        .api('/me/mailFolders/sentItems/messages')
        .filter(`sentDateTime le ${thresholdDate.toISOString()}`)
        .select('id,subject,bodyPreview,toRecipients,sentDateTime,conversationId,webLink')
        .orderby('sentDateTime desc')
        .top(100)
        .get();

      // Get received messages to check for replies
      const receivedMessages = await this.graphClient
        .api('/me/messages')
        .filter(`receivedDateTime ge ${thresholdDate.toISOString()}`)
        .select('conversationId,from')
        .top(200)
        .get();

      // Build map of conversations where we received a reply
      const repliedConversations = new Map<string, Set<string>>();
      for (const msg of receivedMessages.value || []) {
        const fromEmail = msg.from?.emailAddress?.address?.toLowerCase();
        if (fromEmail && fromEmail !== this.currentUserEmail) {
          if (!repliedConversations.has(msg.conversationId)) {
            repliedConversations.set(msg.conversationId, new Set());
          }
          repliedConversations.get(msg.conversationId)!.add(fromEmail);
        }
      }

      // Filter to messages where recipient hasn't replied
      const pending: PendingResponse[] = [];

      for (const sent of sentMessages.value || []) {
        const recipients = sent.toRecipients || [];
        const repliers = repliedConversations.get(sent.conversationId) || new Set();

        for (const recipient of recipients) {
          const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
          if (recipientEmail && !repliers.has(recipientEmail) && recipientEmail !== this.currentUserEmail) {
            pending.push(this.mapSentEmailToPending(sent, recipient));
          }
        }
      }

      return pending;
    } catch (err) {
      console.error('Failed to fetch pending emails:', err);
      return [];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapSentEmailToPending(email: any, recipient: any): PendingResponse {
    const sentDate = new Date(email.sentDateTime);
    const hoursWaiting = Math.floor((Date.now() - sentDate.getTime()) / (1000 * 60 * 60));
    const preview = email.bodyPreview || '';

    return {
      id: `${email.id}-${recipient.emailAddress?.address}`,
      conversationType: 'email',
      subject: email.subject || '(No subject)',
      preview: preview.substring(0, 120),
      recipient: {
        id: '',
        displayName: recipient.emailAddress?.name || recipient.emailAddress?.address || 'Unknown',
        email: recipient.emailAddress?.address || '',
        relationship: 'other'
      },
      sentDateTime: sentDate,
      waitingDuration: hoursWaiting,
      webUrl: email.webLink,
      conversationId: email.conversationId,
      wasQuestion: detectQuestion(preview),
      requestedAction: detectActionRequest(preview),
      mentionedDeadline: detectDeadline(preview),
      reminderCount: 0
    };
  }

  // ============================================
  // Teams Chat Fetching (Sent, Awaiting Reply)
  // ============================================

  private async getPendingTeamsChats(filter: PendingFilter): Promise<PendingResponse[]> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - filter.minWaitDuration);

    try {
      const chats = await this.graphClient
        .api('/me/chats')
        .expand('lastMessagePreview,members')
        .top(50)
        .get();

      const pending: PendingResponse[] = [];

      for (const chat of chats.value || []) {
        const lastMsg = chat.lastMessagePreview;
        if (!lastMsg) continue;

        const msgDate = new Date(lastMsg.createdDateTime);
        const isOldEnough = msgDate.getTime() <= thresholdDate.getTime();
        const isFromMe = lastMsg.from?.user?.id === this.currentUserId;

        // If last message is from me and old enough, I'm waiting for a reply
        if (isOldEnough && isFromMe) {
          // Find the other person in the chat
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const otherMembers = (chat.members || []).filter((m: any) =>
            m.userId !== this.currentUserId
          );

          for (const member of otherMembers) {
            pending.push(this.mapChatToPending(chat, lastMsg, member));
          }
        }
      }

      return pending;
    } catch (err) {
      console.error('Failed to fetch pending Teams chats:', err);
      return [];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapChatToPending(chat: any, lastMsg: any, member: any): PendingResponse {
    const sentDate = new Date(lastMsg.createdDateTime);
    const hoursWaiting = Math.floor((Date.now() - sentDate.getTime()) / (1000 * 60 * 60));
    const content = stripHtml(lastMsg.body?.content) || '';

    return {
      id: `${chat.id}-${member.userId}`,
      conversationType: 'teams-chat',
      subject: chat.topic || 'Teams Chat',
      preview: content.substring(0, 120),
      recipient: {
        id: member.userId || '',
        displayName: member.displayName || 'Unknown',
        email: member.email || '',
        relationship: 'other'
      },
      sentDateTime: sentDate,
      waitingDuration: hoursWaiting,
      webUrl: chat.webUrl || `https://teams.microsoft.com/l/chat/${chat.id}`,
      chatId: chat.id,
      wasQuestion: detectQuestion(content),
      requestedAction: detectActionRequest(content),
      mentionedDeadline: detectDeadline(content),
      reminderCount: 0
    };
  }

  // ============================================
  // Recipient Resolution
  // ============================================

  private async resolveRecipients(items: PendingResponse[]): Promise<void> {
    const emailsToResolve = items
      .filter(i => i.conversationType === 'email' && i.recipient.email && !i.recipient.id)
      .map(i => i.recipient.email);

    if (emailsToResolve.length === 0) return;

    const resolved = await this.userResolver.resolveEmails(emailsToResolve);

    for (const item of items) {
      if (item.conversationType === 'email' && item.recipient.email) {
        const userId = resolved.get(item.recipient.email.toLowerCase());
        if (userId) {
          item.recipient.id = userId;
        }
      }
    }
  }

  // ============================================
  // Relationship Enrichment
  // ============================================

  private enrichWithRelationship(item: PendingResponse): PendingResponse {
    const recipientId = item.recipient.id;
    let relationship: PersonRelationship = 'other';

    if (recipientId) {
      if (recipientId === this.managerId) {
        relationship = 'manager';
      } else if (this.directReportIds.has(recipientId)) {
        relationship = 'direct-report';
      } else if (this.frequentCollaboratorIds.has(recipientId)) {
        relationship = 'frequent';
      }
    }

    if (relationship === 'other' && item.recipient.email) {
      if (this.userResolver.isExternal(item.recipient.email)) {
        relationship = 'external';
      }
    }

    return {
      ...item,
      recipient: { ...item.recipient, relationship }
    };
  }

  // ============================================
  // Persisted State Application
  // ============================================

  private applyPersistedState(
    items: PendingResponse[],
    persistedState: WaitingOnOthersPersistedState,
    filter: PendingFilter
  ): PendingResponse[] {
    const now = new Date();

    // Build lookup maps
    const resolvedIds = new Set(persistedState.resolved.map(r => r.pendingId));

    const snoozedMap = new Map(
      persistedState.snoozed
        .filter(s => new Date(s.snoozedUntil) > now)
        .map(s => [s.pendingId, s])
    );

    const reminderMap = new Map(
      persistedState.remindersSent.map(r => [r.pendingId, r])
    );

    return items
      .filter(item => !resolvedIds.has(item.id))
      .map(item => {
        const snoozed = snoozedMap.get(item.id);
        const reminder = reminderMap.get(item.id);

        return {
          ...item,
          snoozedUntil: snoozed ? new Date(snoozed.snoozedUntil) : undefined,
          reminderSentAt: reminder ? new Date(reminder.sentAt) : undefined,
          reminderCount: reminder ? 1 : 0
        };
      })
      .filter(item => {
        if (filter.hideSnoozed && item.snoozedUntil) return false;
        if (filter.hideReminded && item.reminderSentAt) return false;
        return true;
      });
  }

  // ============================================
  // Grouping Logic
  // ============================================

  private groupByPerson(items: PendingResponse[]): PersonOwesGroup[] {
    const groups = new Map<string, PersonOwesGroup>();

    for (const item of items) {
      const key = item.recipient.id || item.recipient.email || item.recipient.displayName;

      if (!groups.has(key)) {
        groups.set(key, {
          person: item.recipient,
          pendingItems: [],
          totalWaitHours: 0,
          longestWaitHours: 0,
          oldestItemDate: item.sentDateTime,
          itemCount: 0,
          snoozedCount: 0,
          reminderSentCount: 0
        });
      }

      const group = groups.get(key)!;
      group.pendingItems.push(item);
      group.totalWaitHours += item.waitingDuration;
      group.longestWaitHours = Math.max(group.longestWaitHours, item.waitingDuration);
      group.itemCount++;

      if (item.snoozedUntil) group.snoozedCount++;
      if (item.reminderSentAt) group.reminderSentCount++;

      if (item.sentDateTime < group.oldestItemDate) {
        group.oldestItemDate = item.sentDateTime;
      }
    }

    return Array.from(groups.values());
  }

  private sortPersonGroups(groups: PersonOwesGroup[]): PersonOwesGroup[] {
    return groups.sort((a, b) => {
      // Longest wait first
      if (b.longestWaitHours !== a.longestWaitHours) {
        return b.longestWaitHours - a.longestWaitHours;
      }
      // Then by item count
      if (b.itemCount !== a.itemCount) {
        return b.itemCount - a.itemCount;
      }
      // Then alphabetically
      return a.person.displayName.localeCompare(b.person.displayName);
    });
  }

  private calculateStats(items: PendingResponse[], byPerson: PersonOwesGroup[]): {
    totalPeopleOwing: number;
    totalItems: number;
    totalWaitHours: number;
    oldestWaitDays: number;
    snoozedCount: number;
  } {
    const longestWait = items.length > 0
      ? Math.max(...items.map(i => i.waitingDuration))
      : 0;

    return {
      totalPeopleOwing: byPerson.length,
      totalItems: items.length,
      totalWaitHours: items.reduce((sum, i) => sum + i.waitingDuration, 0),
      oldestWaitDays: Math.floor(longestWait / 24),
      snoozedCount: items.filter(i => i.snoozedUntil).length
    };
  }

  // ============================================
  // Trend Data
  // ============================================

  public async getPendingTrend(daysBack: number = 14): Promise<PendingTrendData> {
    const dataPoints: PendingTrendDataPoint[] = [];
    const today = new Date();

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseCount = isWeekend ? 1 : 2;
      const variance = Math.floor(Math.random() * 2);

      dataPoints.push({
        date: dateStr,
        peopleOwing: Math.max(0, baseCount + variance),
        itemCount: Math.max(0, (baseCount + variance) * 2),
        avgWaitDays: 2 + Math.random() * 3
      });
    }

    const midpoint = Math.floor(dataPoints.length / 2);
    const firstHalfAvg = dataPoints.slice(0, midpoint).reduce((s, d) => s + d.peopleOwing, 0) / midpoint;
    const secondHalfAvg = dataPoints.slice(midpoint).reduce((s, d) => s + d.peopleOwing, 0) / (dataPoints.length - midpoint);
    const changePercent = ((secondHalfAvg - firstHalfAvg) / Math.max(firstHalfAvg, 1)) * 100;

    const trend = changePercent > 15 ? 'worsening' : changePercent < -15 ? 'improving' : 'stable';

    return {
      dataPoints,
      trend,
      averagePeopleOwing: dataPoints.reduce((s, d) => s + d.peopleOwing, 0) / dataPoints.length,
      longestCurrentWait: 0 // Will be set from actual data
    };
  }

  // ============================================
  // Send Reminder
  // ============================================

  public async sendReminder(
    item: PendingResponse,
    subject: string,
    body: string
  ): Promise<boolean> {
    try {
      if (item.conversationType === 'email') {
        // Send follow-up email
        await this.graphClient
          .api('/me/sendMail')
          .post({
            message: {
              subject: subject,
              body: {
                contentType: 'Text',
                content: body
              },
              toRecipients: [
                {
                  emailAddress: {
                    address: item.recipient.email,
                    name: item.recipient.displayName
                  }
                }
              ]
            }
          });
        return true;
      } else if (item.conversationType === 'teams-chat' && item.chatId) {
        // Send Teams message
        await this.graphClient
          .api(`/chats/${item.chatId}/messages`)
          .post({
            body: {
              contentType: 'text',
              content: body
            }
          });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to send reminder:', err);
      return false;
    }
  }

}
