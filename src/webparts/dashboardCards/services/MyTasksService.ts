// ============================================
// MyTasks Service - API Integration
// Fetches tasks from Microsoft To Do and Planner
// ============================================

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import {
  MyTasksData,
  TaskItem,
  TaskStatus,
  TaskImportance,
  IMyTasksSettings,
} from '../models/MyTasks';

export class MyTasksService {
  private context: WebPartContext;
  private graphClient: MSGraphClientV3 | null = null;

  constructor(context: WebPartContext) {
    this.context = context;
  }

  /**
   * Get or create the Graph client
   */
  private async getGraphClient(): Promise<MSGraphClientV3> {
    if (!this.graphClient) {
      this.graphClient = await this.context.msGraphClientFactory.getClient('3');
    }
    return this.graphClient;
  }

  /**
   * Fetch tasks data from Microsoft To Do
   */
  public async getData(settings: IMyTasksSettings): Promise<MyTasksData> {
    const client = await this.getGraphClient();

    // Fetch To Do task lists
    const taskLists = await this.getTodoLists(client);

    // Fetch tasks from all lists
    const allTasks: TaskItem[] = [];

    for (const list of taskLists) {
      const tasks = await this.getTasksFromList(client, list.id, list.displayName, settings);
      allTasks.push(...tasks);
    }

    // Also try to fetch Planner tasks
    try {
      const plannerTasks = await this.getPlannerTasks(client, settings);
      allTasks.push(...plannerTasks);
    } catch (err) {
      // Planner may not be available, continue with To Do tasks
      console.warn('Could not fetch Planner tasks:', err);
    }

    // Sort by due date, then by importance
    allTasks.sort((a, b) => {
      // Overdue tasks first
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;

      // Then by importance
      const importanceOrder = { high: 0, normal: 1, low: 2 };
      const importanceDiff = importanceOrder[a.importance] - importanceOrder[b.importance];
      if (importanceDiff !== 0) return importanceDiff;

      // Then by due date
      if (a.dueDateTime && b.dueDateTime) {
        return a.dueDateTime.getTime() - b.dueDateTime.getTime();
      }
      if (a.dueDateTime) return -1;
      if (b.dueDateTime) return 1;

      return 0;
    });

    // Apply limit
    const limitedTasks = allTasks.slice(0, settings.maxItems);

    // Calculate counts
    const overdueCount = allTasks.filter(t => t.isOverdue).length;
    const inProgressCount = allTasks.filter(t => t.status === 'inProgress').length;
    const highPriorityCount = allTasks.filter(t => t.importance === 'high').length;

    // Calculate due today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueTodayCount = allTasks.filter(t => {
      if (!t.dueDateTime) return false;
      return t.dueDateTime >= today && t.dueDateTime < tomorrow;
    }).length;

    return {
      tasks: limitedTasks,
      totalCount: allTasks.length,
      overdueCount,
      inProgressCount,
      highPriorityCount,
      dueTodayCount,
    };
  }

  /**
   * Get all To Do task lists
   */
  private async getTodoLists(client: MSGraphClientV3): Promise<Array<{ id: string; displayName: string }>> {
    try {
      const response = await client
        .api('/me/todo/lists')
        .select('id,displayName')
        .get();

      return response.value || [];
    } catch (err) {
      console.error('Failed to fetch To Do lists:', err);
      return [];
    }
  }

  /**
   * Get tasks from a specific To Do list
   */
  private async getTasksFromList(
    client: MSGraphClientV3,
    listId: string,
    listName: string,
    settings: IMyTasksSettings
  ): Promise<TaskItem[]> {
    try {
      // Build filter based on settings
      const filters: string[] = [];

      if (!settings.showCompleted) {
        filters.push('status ne \'completed\'');
      }

      const apiCall = client
        .api(`/me/todo/lists/${listId}/tasks`)
        .select('id,title,status,importance,dueDateTime,body,createdDateTime,lastModifiedDateTime');

      if (filters.length > 0) {
        apiCall.filter(filters.join(' and '));
      }

      const response = await apiCall.top(50).get();

      return (response.value || []).map((task: any) => this.mapTodoTask(task, listName, settings));
    } catch (err) {
      console.error(`Failed to fetch tasks from list ${listId}:`, err);
      return [];
    }
  }

  /**
   * Map To Do API task to TaskItem
   */
  private mapTodoTask(task: any, listName: string, settings: IMyTasksSettings): TaskItem {
    const dueDateTime = task.dueDateTime?.dateTime
      ? new Date(task.dueDateTime.dateTime + 'Z')
      : undefined;

    const now = new Date();
    const isOverdue = dueDateTime ? dueDateTime < now && task.status !== 'completed' : false;

    const status = this.mapTodoStatus(task.status);
    const importance = this.mapTodoImportance(task.importance);

    // Apply filters
    if (!settings.showOverdue && isOverdue) {
      return null as any; // Will be filtered out
    }
    if (!settings.showInProgress && status === 'inProgress') {
      return null as any; // Will be filtered out
    }
    if (settings.importanceFilter && importance !== settings.importanceFilter) {
      return null as any; // Will be filtered out
    }

    return {
      id: task.id,
      title: task.title,
      status,
      importance,
      dueDateTime,
      listName,
      isOverdue,
      body: task.body?.content,
      createdDateTime: task.createdDateTime ? new Date(task.createdDateTime) : undefined,
      lastModifiedDateTime: task.lastModifiedDateTime ? new Date(task.lastModifiedDateTime) : undefined,
    };
  }

  /**
   * Map To Do status string to TaskStatus
   */
  private mapTodoStatus(status: string): TaskStatus {
    switch (status) {
      case 'notStarted':
        return 'notStarted';
      case 'inProgress':
        return 'inProgress';
      case 'completed':
        return 'completed';
      case 'waitingOnOthers':
        return 'deferred';
      case 'deferred':
        return 'deferred';
      default:
        return 'notStarted';
    }
  }

  /**
   * Map To Do importance string to TaskImportance
   */
  private mapTodoImportance(importance: string): TaskImportance {
    switch (importance) {
      case 'high':
        return 'high';
      case 'low':
        return 'low';
      default:
        return 'normal';
    }
  }

  /**
   * Get tasks from Planner
   */
  private async getPlannerTasks(client: MSGraphClientV3, settings: IMyTasksSettings): Promise<TaskItem[]> {
    try {
      const response = await client
        .api('/me/planner/tasks')
        .select('id,title,percentComplete,priority,dueDateTime,createdDateTime,planId')
        .top(50)
        .get();

      // Get plan names for context
      const planIds = Array.from(new Set((response.value || []).map((t: any) => t.planId)));
      const planNames = new Map<string, string>();

      for (const planId of planIds as string[]) {
        try {
          const plan = await client
            .api(`/planner/plans/${planId}`)
            .select('title')
            .get();
          planNames.set(planId, plan.title || 'Planner');
        } catch {
          planNames.set(planId, 'Planner');
        }
      }

      return (response.value || [])
        .map((task: any) => this.mapPlannerTask(task, planNames.get(task.planId) || 'Planner', settings))
        .filter((task: TaskItem | null) => task !== null);
    } catch (err) {
      console.warn('Failed to fetch Planner tasks:', err);
      return [];
    }
  }

  /**
   * Map Planner API task to TaskItem
   */
  private mapPlannerTask(task: any, planName: string, settings: IMyTasksSettings): TaskItem | null {
    const dueDateTime = task.dueDateTime ? new Date(task.dueDateTime) : undefined;
    const now = new Date();
    const isOverdue = dueDateTime ? dueDateTime < now && task.percentComplete < 100 : false;

    // Map Planner percentComplete to status
    let status: TaskStatus = 'notStarted';
    if (task.percentComplete === 100) {
      status = 'completed';
    } else if (task.percentComplete > 0) {
      status = 'inProgress';
    }

    // Map Planner priority (1-10, lower is higher priority) to importance
    let importance: TaskImportance = 'normal';
    if (task.priority <= 3) {
      importance = 'high';
    } else if (task.priority >= 7) {
      importance = 'low';
    }

    // Apply filters
    if (!settings.showCompleted && status === 'completed') {
      return null;
    }
    if (!settings.showOverdue && isOverdue) {
      return null;
    }
    if (!settings.showInProgress && status === 'inProgress') {
      return null;
    }
    if (settings.importanceFilter && importance !== settings.importanceFilter) {
      return null;
    }

    return {
      id: task.id,
      title: task.title,
      status,
      importance,
      dueDateTime,
      listName: planName,
      isOverdue,
      createdDateTime: task.createdDateTime ? new Date(task.createdDateTime) : undefined,
    };
  }
}
