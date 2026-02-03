// src/webparts/dashboardCards/services/UserResolverService.ts

import { MSGraphClientV3 } from '@microsoft/sp-http';

/**
 * Resolves email addresses to Graph user IDs.
 * Required because email messages return sender email, not user ID,
 * but relationship matching requires user IDs.
 */
export class UserResolverService {
  private graphClient: MSGraphClientV3;
  private cache: Map<string, string> = new Map(); // email -> userId
  private pendingRequests: Map<string, Promise<string | null>> = new Map();
  private orgDomain: string;

  constructor(graphClient: MSGraphClientV3, currentUserEmail: string) {
    this.graphClient = graphClient;
    this.orgDomain = currentUserEmail.substring(currentUserEmail.indexOf('@') + 1).toLowerCase();
  }

  /**
   * Resolve a single email to user ID
   */
  public async resolveEmail(email: string): Promise<string | null> {
    const normalizedEmail = email.toLowerCase();

    // Check cache
    if (this.cache.has(normalizedEmail)) {
      return this.cache.get(normalizedEmail) || null;
    }

    // Check if request is already in flight
    if (this.pendingRequests.has(normalizedEmail)) {
      return this.pendingRequests.get(normalizedEmail)!;
    }

    // External users can't be resolved
    if (!normalizedEmail.endsWith(this.orgDomain)) {
      this.cache.set(normalizedEmail, '');
      return null;
    }

    // Make the request
    const promise = this.fetchUserId(normalizedEmail);
    this.pendingRequests.set(normalizedEmail, promise);

    try {
      const userId = await promise;
      this.cache.set(normalizedEmail, userId || '');
      return userId;
    } finally {
      this.pendingRequests.delete(normalizedEmail);
    }
  }

  /**
   * Batch resolve multiple emails
   */
  public async resolveEmails(emails: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    const toResolve: string[] = [];

    // Check cache first
    for (const email of emails) {
      const normalized = email.toLowerCase();
      if (this.cache.has(normalized)) {
        results.set(normalized, this.cache.get(normalized) || null);
      } else {
        toResolve.push(normalized);
      }
    }

    // Batch resolve uncached (using $batch endpoint for efficiency)
    if (toResolve.length > 0) {
      const batchResults = await this.batchResolve(toResolve);
      const batchEntries = Array.from(batchResults.entries());
      for (const [email, userId] of batchEntries) {
        this.cache.set(email, userId || '');
        results.set(email, userId);
      }
    }

    return results;
  }

  private async fetchUserId(email: string): Promise<string | null> {
    try {
      const result = await this.graphClient
        .api('/users')
        .filter(`mail eq '${email}' or userPrincipalName eq '${email}'`)
        .select('id')
        .top(1)
        .get();

      return result.value?.[0]?.id || null;
    } catch (err) {
      console.warn(`Failed to resolve email ${email}:`, err);
      return null;
    }
  }

  private async batchResolve(emails: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();

    // Graph batch limit is 20 requests
    const batchSize = 20;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      try {
        const batchRequest = {
          requests: batch.map((email, index) => ({
            id: String(index),
            method: 'GET',
            url: `/users?$filter=mail eq '${email}' or userPrincipalName eq '${email}'&$select=id`
          }))
        };

        const batchResponse = await this.graphClient
          .api('/$batch')
          .post(batchRequest);

        for (const response of batchResponse.responses) {
          const email = batch[parseInt(response.id)];
          const userId = response.body?.value?.[0]?.id || null;
          results.set(email, userId);
        }
      } catch (err) {
        console.warn('Batch resolve failed:', err);
        // Fallback to individual resolution
        for (const email of batch) {
          results.set(email, await this.fetchUserId(email));
        }
      }
    }

    return results;
  }

  public isExternal(email: string): boolean {
    return !email.toLowerCase().endsWith(this.orgDomain);
  }
}
