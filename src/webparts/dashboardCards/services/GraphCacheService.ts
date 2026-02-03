// src/webparts/dashboardCards/services/GraphCacheService.ts

import { MSGraphClientV3 } from '@microsoft/sp-http';
import { CacheEntry, GraphCache, Person, Team } from '../models/WaitingOnYou';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class GraphCacheService {
  private cache: GraphCache = {
    manager: null,
    directReports: null,
    frequentCollaborators: null,
    joinedTeams: null,
    userPhotos: new Map(),
    resolvedUsers: new Map()
  };

  private graphClient: MSGraphClientV3;

  constructor(graphClient: MSGraphClientV3) {
    this.graphClient = graphClient;
  }

  private isExpired<T>(entry: CacheEntry<T> | null): boolean {
    if (!entry) return true;
    return new Date() > entry.expiresAt;
  }

  private createEntry<T>(data: T): CacheEntry<T> {
    const now = new Date();
    return {
      data,
      cachedAt: now,
      expiresAt: new Date(now.getTime() + CACHE_TTL_MS)
    };
  }

  public async getManager(): Promise<Person | null> {
    if (!this.isExpired(this.cache.manager)) {
      return this.cache.manager!.data;
    }

    try {
      const result = await this.graphClient
        .api('/me/manager')
        .select('id,displayName,mail,userPrincipalName')
        .get();

      const person: Person = {
        id: result.id,
        displayName: result.displayName,
        email: result.mail || result.userPrincipalName,
        relationship: 'manager'
      };

      this.cache.manager = this.createEntry(person);
      return person;
    } catch (err) {
      // User may not have a manager
      this.cache.manager = this.createEntry(null);
      return null;
    }
  }

  public async getDirectReports(): Promise<Person[]> {
    if (!this.isExpired(this.cache.directReports)) {
      return this.cache.directReports!.data;
    }

    try {
      const result = await this.graphClient
        .api('/me/directReports')
        .select('id,displayName,mail,userPrincipalName')
        .top(50)
        .get();

      const people: Person[] = (result.value || []).map((r: { id: string; displayName: string; mail?: string; userPrincipalName?: string }) => ({
        id: r.id,
        displayName: r.displayName,
        email: r.mail || r.userPrincipalName || '',
        relationship: 'direct-report' as const
      }));

      this.cache.directReports = this.createEntry(people);
      return people;
    } catch (err) {
      this.cache.directReports = this.createEntry([]);
      return [];
    }
  }

  public async getFrequentCollaborators(): Promise<Person[]> {
    if (!this.isExpired(this.cache.frequentCollaborators)) {
      return this.cache.frequentCollaborators!.data;
    }

    try {
      const result = await this.graphClient
        .api('/me/people')
        .filter("personType/class eq 'Person'")
        .top(25)
        .get();

      const people: Person[] = (result.value || []).map((r: { id: string; displayName: string; scoredEmailAddresses?: Array<{ address: string }> }) => ({
        id: r.id,
        displayName: r.displayName,
        email: r.scoredEmailAddresses?.[0]?.address || '',
        relationship: 'frequent' as const
      }));

      this.cache.frequentCollaborators = this.createEntry(people);
      return people;
    } catch (err) {
      this.cache.frequentCollaborators = this.createEntry([]);
      return [];
    }
  }

  public async getJoinedTeams(): Promise<Team[]> {
    if (!this.isExpired(this.cache.joinedTeams)) {
      return this.cache.joinedTeams!.data;
    }

    try {
      const result = await this.graphClient
        .api('/me/joinedTeams')
        .select('id,displayName,webUrl')
        .get();

      const teams: Team[] = (result.value || []).map((t: { id: string; displayName: string; webUrl: string }) => ({
        id: t.id,
        displayName: t.displayName,
        webUrl: t.webUrl,
        type: 'team' as const
      }));

      this.cache.joinedTeams = this.createEntry(teams);
      return teams;
    } catch (err) {
      this.cache.joinedTeams = this.createEntry([]);
      return [];
    }
  }

  public invalidateAll(): void {
    this.cache = {
      manager: null,
      directReports: null,
      frequentCollaborators: null,
      joinedTeams: null,
      userPhotos: new Map(),
      resolvedUsers: new Map()
    };
  }
}
