// ============================================
// Context Switching Service
// Tracks context switches using Microsoft Graph API
// Analyzes user activity across Mail, Teams, Calendar, and Files
// ============================================

import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  ContextSwitchingData,
  ContextSwitch,
  DailySummary,
  ContextSwitchingTrend,
  HourlySwitchData,
  ContextDistribution,
  FocusSession,
  CurrentContextState,
  ContextType,
  ContextSwitchingSettings,
  DEFAULT_CONTEXT_SWITCHING_SETTINGS,
  getContextTypeColor,
  calculateFocusScore
} from '../models/ContextSwitching';

/**
 * Raw activity item from Graph API
 */
interface ActivityItem {
  id: string;
  type: ContextType;
  name: string;
  timestamp: Date;
  webUrl?: string;
  person?: {
    id: string;
    displayName: string;
    email: string;
  };
  project?: string;
}

/**
 * Service for tracking and analyzing context switches
 */
export class ContextSwitchingService {
  private graphClient: MSGraphClientV3;
  private settings: ContextSwitchingSettings;
  private activityCache: Map<string, ActivityItem[]> = new Map();
  private cacheTimestamp: Date | undefined;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    graphClient: MSGraphClientV3,
    _userId: string, // Reserved for future use with delegated permissions
    settings: ContextSwitchingSettings = DEFAULT_CONTEXT_SWITCHING_SETTINGS
  ) {
    this.graphClient = graphClient;
    this.settings = settings;
  }

  /**
   * Get complete context switching data for the dashboard
   */
  public async getContextSwitchingData(): Promise<ContextSwitchingData> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Fetch all activity data
    const activities = await this.fetchAllActivities(todayStart);

    // Process into context switches
    const switches = this.processActivitiesIntoSwitches(activities);

    // Generate all the data structures
    const todaySummary = this.generateDailySummary(switches, todayStart);
    const hourlyData = this.generateHourlyData(switches, todayStart);
    const distribution = this.generateDistribution(switches);
    const recentSessions = this.generateFocusSessions(switches);
    const trendData = await this.getTrendData();
    const currentState = this.getCurrentState(switches, now);

    return {
      currentState,
      todaySummary,
      trendData,
      hourlyData,
      distribution,
      recentSessions,
      recentSwitches: switches.slice(0, 20) // Most recent 20
    };
  }

  /**
   * Fetch all activities from various Graph endpoints
   */
  private async fetchAllActivities(since: Date): Promise<ActivityItem[]> {
    // Check cache
    if (this.cacheTimestamp &&
        (new Date().getTime() - this.cacheTimestamp.getTime()) < this.CACHE_DURATION_MS) {
      const cached = this.activityCache.get(since.toISOString());
      if (cached) return cached;
    }

    const activities: ActivityItem[] = [];
    const isoDate = since.toISOString();

    // Parallel fetch from all sources
    const fetchPromises: Promise<void>[] = [];

    // Fetch emails if enabled
    if (this.settings.trackEmail) {
      fetchPromises.push(
        this.fetchEmailActivity(isoDate).then(items => { activities.push(...items); })
      );
    }

    // Fetch Teams chats if enabled
    if (this.settings.trackTeamsChat) {
      fetchPromises.push(
        this.fetchTeamsChatActivity(isoDate).then(items => { activities.push(...items); })
      );
    }

    // Fetch Teams channels if enabled
    if (this.settings.trackTeamsChannel) {
      fetchPromises.push(
        this.fetchTeamsChannelActivity(isoDate).then(items => { activities.push(...items); })
      );
    }

    // Fetch meetings if enabled
    if (this.settings.trackMeetings) {
      fetchPromises.push(
        this.fetchMeetingActivity(isoDate).then(items => { activities.push(...items); })
      );
    }

    // Fetch file access if enabled
    if (this.settings.trackFiles) {
      fetchPromises.push(
        this.fetchFileActivity(isoDate).then(items => { activities.push(...items); })
      );
    }

    await Promise.all(fetchPromises);

    // Sort by timestamp
    activities.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Cache results
    this.activityCache.set(since.toISOString(), activities);
    this.cacheTimestamp = new Date();

    return activities;
  }

  /**
   * Fetch email activity (sent/read emails)
   */
  private async fetchEmailActivity(since: string): Promise<ActivityItem[]> {
    try {
      // Get recently read/sent emails
      const response = await this.graphClient
        .api('/me/messages')
        .filter(`receivedDateTime ge ${since}`)
        .select('id,subject,receivedDateTime,from,webLink,isRead')
        .top(50)
        .orderby('receivedDateTime desc')
        .get();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response.value || []).map((email: any) => ({
        id: `email-${email.id}`,
        type: 'email' as ContextType,
        name: email.subject || 'Email',
        timestamp: new Date(email.receivedDateTime),
        webUrl: email.webLink,
        person: email.from?.emailAddress ? {
          id: email.from.emailAddress.address,
          displayName: email.from.emailAddress.name || email.from.emailAddress.address,
          email: email.from.emailAddress.address
        } : undefined
      }));
    } catch (err) {
      console.error('Failed to fetch email activity:', err);
      return [];
    }
  }

  /**
   * Fetch Teams chat activity
   */
  private async fetchTeamsChatActivity(since: string): Promise<ActivityItem[]> {
    try {
      // Get recent chat messages
      const chatsResponse = await this.graphClient
        .api('/me/chats')
        .select('id,topic,chatType,webUrl')
        .top(20)
        .get();

      const activities: ActivityItem[] = [];

      for (const chat of chatsResponse.value || []) {
        try {
          const messagesResponse = await this.graphClient
            .api(`/me/chats/${chat.id}/messages`)
            .filter(`createdDateTime ge ${since}`)
            .select('id,createdDateTime,from,body')
            .top(10)
            .orderby('createdDateTime desc')
            .get();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const message of messagesResponse.value || []) {
            activities.push({
              id: `chat-${message.id}`,
              type: 'teams-chat' as ContextType,
              name: chat.topic || `Chat`,
              timestamp: new Date(message.createdDateTime),
              webUrl: chat.webUrl,
              person: message.from?.user ? {
                id: message.from.user.id,
                displayName: message.from.user.displayName,
                email: message.from.user.email || ''
              } : undefined
            });
          }
        } catch {
          // Skip chats we can't access
        }
      }

      return activities;
    } catch (err) {
      console.error('Failed to fetch Teams chat activity:', err);
      return [];
    }
  }

  /**
   * Fetch Teams channel activity
   */
  private async fetchTeamsChannelActivity(since: string): Promise<ActivityItem[]> {
    try {
      // Get teams the user is a member of
      const teamsResponse = await this.graphClient
        .api('/me/joinedTeams')
        .select('id,displayName,webUrl')
        .top(10)
        .get();

      const activities: ActivityItem[] = [];

      for (const team of teamsResponse.value || []) {
        try {
          // Get channels
          const channelsResponse = await this.graphClient
            .api(`/teams/${team.id}/channels`)
            .select('id,displayName,webUrl')
            .top(5)
            .get();

          for (const channel of channelsResponse.value || []) {
            try {
              const messagesResponse = await this.graphClient
                .api(`/teams/${team.id}/channels/${channel.id}/messages`)
                .filter(`createdDateTime ge ${since}`)
                .select('id,createdDateTime,from')
                .top(5)
                .orderby('createdDateTime desc')
                .get();

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              for (const message of messagesResponse.value || []) {
                activities.push({
                  id: `channel-${message.id}`,
                  type: 'teams-channel' as ContextType,
                  name: `${team.displayName} > ${channel.displayName}`,
                  timestamp: new Date(message.createdDateTime),
                  webUrl: channel.webUrl,
                  project: team.displayName
                });
              }
            } catch {
              // Skip channels we can't access
            }
          }
        } catch {
          // Skip teams we can't access
        }
      }

      return activities;
    } catch (err) {
      console.error('Failed to fetch Teams channel activity:', err);
      return [];
    }
  }

  /**
   * Fetch meeting activity (calendar events attended)
   */
  private async fetchMeetingActivity(since: string): Promise<ActivityItem[]> {
    try {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const response = await this.graphClient
        .api('/me/calendarView')
        .query({
          startDateTime: since,
          endDateTime: endOfDay.toISOString()
        })
        .select('id,subject,start,end,webLink,isOnlineMeeting,onlineMeetingUrl')
        .top(20)
        .get();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response.value || []).map((event: any) => ({
        id: `meeting-${event.id}`,
        type: 'meeting' as ContextType,
        name: event.subject || 'Meeting',
        timestamp: new Date(event.start.dateTime),
        webUrl: event.onlineMeetingUrl || event.webLink
      }));
    } catch (err) {
      console.error('Failed to fetch meeting activity:', err);
      return [];
    }
  }

  /**
   * Fetch file access activity
   */
  private async fetchFileActivity(since: string): Promise<ActivityItem[]> {
    try {
      // Get recently accessed files via insights
      const response = await this.graphClient
        .api('/me/insights/used')
        .filter(`lastUsed/lastAccessedDateTime ge ${since}`)
        .select('id,resourceReference,lastUsed')
        .top(30)
        .orderby('lastUsed/lastAccessedDateTime desc')
        .get();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response.value || []).map((item: any) => ({
        id: `file-${item.id}`,
        type: 'file' as ContextType,
        name: item.resourceReference?.id?.split('/').pop() || 'File',
        timestamp: new Date(item.lastUsed?.lastAccessedDateTime || new Date()),
        webUrl: item.resourceReference?.webUrl
      }));
    } catch (err) {
      console.error('Failed to fetch file activity:', err);
      return [];
    }
  }

  /**
   * Process raw activities into context switches
   * A context switch occurs when the user moves to a different context type
   */
  private processActivitiesIntoSwitches(activities: ActivityItem[]): ContextSwitch[] {
    if (activities.length === 0) return [];

    const switches: ContextSwitch[] = [];
    let currentContext: ContextType | undefined;
    let contextStartTime: Date | undefined;

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];

      // If context type changed, record the switch
      if (currentContext !== activity.type) {
        // Calculate duration of previous context
        if (currentContext && contextStartTime && switches.length > 0) {
          const lastSwitch = switches[switches.length - 1];
          lastSwitch.duration = Math.round(
            (activity.timestamp.getTime() - contextStartTime.getTime()) / 60000
          );
        }

        // Record new context switch
        switches.push({
          id: activity.id,
          contextType: activity.type,
          contextName: activity.name,
          timestamp: activity.timestamp,
          duration: 0, // Will be calculated when next switch occurs
          webUrl: activity.webUrl,
          person: activity.person,
          project: activity.project
        });

        currentContext = activity.type;
        contextStartTime = activity.timestamp;
      }
    }

    // Set duration for last switch (assume ongoing)
    if (switches.length > 0) {
      const lastSwitch = switches[switches.length - 1];
      lastSwitch.duration = Math.round(
        (new Date().getTime() - lastSwitch.timestamp.getTime()) / 60000
      );
    }

    return switches;
  }

  /**
   * Generate daily summary from switches
   */
  private generateDailySummary(switches: ContextSwitch[], date: Date): DailySummary {
    const dateStr = date.toISOString().split('T')[0];
    const totalSwitches = switches.length;
    const totalFocusTime = switches.reduce((sum, s) => sum + s.duration, 0);
    const avgFocusTime = totalSwitches > 0 ? Math.round(totalFocusTime / totalSwitches) : 0;
    const longestFocus = switches.length > 0 ? Math.max(...switches.map(s => s.duration)) : 0;

    // Count by type
    const switchesByType: Record<ContextType, number> = {
      'email': 0,
      'teams-chat': 0,
      'teams-channel': 0,
      'meeting': 0,
      'file': 0,
      'task': 0,
      'calendar': 0
    };

    switches.forEach(s => {
      switchesByType[s.contextType]++;
    });

    // Count by hour
    const hourCounts: Record<number, number> = {};
    switches.forEach(s => {
      const hour = s.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const switchesByHour = Object.entries(hourCounts).map(([hour, count]) => ({
      hour: parseInt(hour),
      count
    }));

    // Find peak hour
    let peakHour = 0;
    let peakCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = parseInt(hour);
      }
    });

    // Calculate focus score
    const workingHours = this.settings.workingHoursEnd - this.settings.workingHoursStart;
    const focusScore = calculateFocusScore(totalSwitches, avgFocusTime, workingHours);

    return {
      date: dateStr,
      totalSwitches,
      totalFocusTime,
      avgFocusTime,
      longestFocus,
      switchesByType,
      switchesByHour,
      peakSwitchingHour: peakHour,
      focusScore
    };
  }

  /**
   * Generate hourly breakdown data
   */
  private generateHourlyData(switches: ContextSwitch[], date: Date): HourlySwitchData[] {
    const data: HourlySwitchData[] = [];
    const { workingHoursStart, workingHoursEnd } = this.settings;

    for (let hour = workingHoursStart; hour <= workingHoursEnd; hour++) {
      const hourSwitches = switches.filter(s => s.timestamp.getHours() === hour);
      const switchCount = hourSwitches.length;

      // Find dominant context type for this hour
      const typeCounts: Record<ContextType, number> = {
        'email': 0, 'teams-chat': 0, 'teams-channel': 0,
        'meeting': 0, 'file': 0, 'task': 0, 'calendar': 0
      };
      hourSwitches.forEach(s => typeCounts[s.contextType]++);

      let dominantContext: ContextType = 'email';
      let maxCount = 0;
      (Object.entries(typeCounts) as [ContextType, number][]).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantContext = type;
        }
      });

      // Calculate focus time this hour
      const focusTime = hourSwitches.reduce((sum, s) => sum + Math.min(s.duration, 60), 0);

      data.push({
        hour,
        switchCount,
        dominantContext,
        focusTime
      });
    }

    return data;
  }

  /**
   * Generate context type distribution
   */
  private generateDistribution(switches: ContextSwitch[]): ContextDistribution[] {
    const typeCounts: Record<ContextType, { count: number; duration: number }> = {
      'email': { count: 0, duration: 0 },
      'teams-chat': { count: 0, duration: 0 },
      'teams-channel': { count: 0, duration: 0 },
      'meeting': { count: 0, duration: 0 },
      'file': { count: 0, duration: 0 },
      'task': { count: 0, duration: 0 },
      'calendar': { count: 0, duration: 0 }
    };

    switches.forEach(s => {
      typeCounts[s.contextType].count++;
      typeCounts[s.contextType].duration += s.duration;
    });

    const totalCount = switches.length || 1;

    const labels: Record<ContextType, string> = {
      'email': 'Email',
      'teams-chat': 'Teams Chat',
      'teams-channel': 'Channels',
      'meeting': 'Meetings',
      'file': 'Files',
      'task': 'Tasks',
      'calendar': 'Calendar'
    };

    return (Object.entries(typeCounts) as [ContextType, { count: number; duration: number }][])
      .filter(([_, data]) => data.count > 0)
      .map(([type, data]) => ({
        contextType: type,
        label: labels[type],
        count: data.count,
        percentage: Math.round((data.count / totalCount) * 100),
        totalDuration: data.duration,
        color: getContextTypeColor(type)
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Generate focus sessions from switches
   */
  private generateFocusSessions(switches: ContextSwitch[]): FocusSession[] {
    return switches
      .filter(s => s.duration >= 15) // At least 15 minutes to be a focus session
      .map((s, i) => ({
        id: `session-${i}`,
        startTime: s.timestamp,
        endTime: new Date(s.timestamp.getTime() + s.duration * 60000),
        duration: s.duration,
        contextType: s.contextType,
        contextName: s.contextName,
        interrupted: s.duration < this.settings.focusGoal,
        interruptedBy: switches[i + 1]?.contextType
      }))
      .slice(0, 10);
  }

  /**
   * Get current context state
   */
  private getCurrentState(switches: ContextSwitch[], now: Date): CurrentContextState {
    const todaySwitches = switches.length;
    const todayFocusTime = switches.reduce((sum, s) => sum + s.duration, 0);

    if (switches.length === 0) {
      return {
        currentContext: 'file',
        currentContextName: 'No activity detected',
        startedAt: now,
        todaySwitches: 0,
        todayFocusTime: 0,
        currentFocusStreak: 0,
        isInFocusMode: false
      };
    }

    const lastSwitch = switches[switches.length - 1];
    const currentFocusStreak = Math.round(
      (now.getTime() - lastSwitch.timestamp.getTime()) / 60000
    );

    return {
      currentContext: lastSwitch.contextType,
      currentContextName: lastSwitch.contextName,
      startedAt: lastSwitch.timestamp,
      todaySwitches,
      todayFocusTime,
      currentFocusStreak,
      isInFocusMode: currentFocusStreak >= this.settings.focusGoal
    };
  }

  /**
   * Get trend data for the past N days
   */
  public async getTrendData(): Promise<ContextSwitchingTrend> {
    const dataPoints: DailySummary[] = [];
    const now = new Date();

    // Fetch data for each day
    for (let i = this.settings.trendDays - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      try {
        const activities = await this.fetchAllActivities(date);
        const switches = this.processActivitiesIntoSwitches(activities);
        const summary = this.generateDailySummary(switches, date);
        dataPoints.push(summary);
      } catch {
        // Add empty data point for days we can't fetch
        dataPoints.push({
          date: date.toISOString().split('T')[0],
          totalSwitches: 0,
          totalFocusTime: 0,
          avgFocusTime: 0,
          longestFocus: 0,
          switchesByType: {
            'email': 0, 'teams-chat': 0, 'teams-channel': 0,
            'meeting': 0, 'file': 0, 'task': 0, 'calendar': 0
          },
          switchesByHour: [],
          peakSwitchingHour: 0,
          focusScore: 50
        });
      }
    }

    // Calculate averages (excluding weekends)
    const workdayData = dataPoints.filter(d => {
      const date = new Date(d.date);
      return date.getDay() !== 0 && date.getDay() !== 6;
    });

    const weeklyAvgSwitches = workdayData.length > 0
      ? Math.round(workdayData.reduce((sum, d) => sum + d.totalSwitches, 0) / workdayData.length)
      : 0;

    const weeklyAvgFocusTime = workdayData.length > 0
      ? Math.round(workdayData.reduce((sum, d) => sum + d.avgFocusTime, 0) / workdayData.length)
      : 0;

    const weeklyFocusScore = workdayData.length > 0
      ? Math.round(workdayData.reduce((sum, d) => sum + d.focusScore, 0) / workdayData.length)
      : 50;

    // Find best and worst days
    const sortedByScore = [...workdayData].sort((a, b) => b.focusScore - a.focusScore);
    const bestDay = sortedByScore[0]?.date || dataPoints[0]?.date || '';
    const worstDay = sortedByScore[sortedByScore.length - 1]?.date || dataPoints[0]?.date || '';

    // Determine trend
    const halfPoint = Math.floor(dataPoints.length / 2);
    const firstHalf = dataPoints.slice(0, halfPoint);
    const secondHalf = dataPoints.slice(halfPoint);

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, d) => sum + d.focusScore, 0) / firstHalf.length
      : 50;
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, d) => sum + d.focusScore, 0) / secondHalf.length
      : 50;

    let trend: 'improving' | 'worsening' | 'stable';
    if (secondHalfAvg > firstHalfAvg + 5) {
      trend = 'improving';
    } else if (secondHalfAvg < firstHalfAvg - 5) {
      trend = 'worsening';
    } else {
      trend = 'stable';
    }

    return {
      dataPoints,
      trend,
      weeklyAvgSwitches,
      weeklyAvgFocusTime,
      weeklyFocusScore,
      bestDay,
      worstDay,
      comparisonToLastWeek: {
        switchesChange: 0, // Would need previous week data
        focusTimeChange: 0
      }
    };
  }

  /**
   * Clear cache to force fresh data
   */
  public clearCache(): void {
    this.activityCache.clear();
    this.cacheTimestamp = undefined;
  }

  /**
   * Update settings
   */
  public updateSettings(settings: Partial<ContextSwitchingSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }
}

export default ContextSwitchingService;
