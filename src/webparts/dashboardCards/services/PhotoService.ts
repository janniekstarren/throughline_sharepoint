// src/webparts/dashboardCards/services/PhotoService.ts

import { MSGraphClientV3 } from '@microsoft/sp-http';

/**
 * Batched photo fetching with caching.
 * Photos are fetched in batches of 20 and converted to data URLs.
 */
export class PhotoService {
  private graphClient: MSGraphClientV3;
  private cache: Map<string, string> = new Map(); // userId -> dataUrl
  private pendingBatch: Set<string> = new Set();
  private batchTimer: number | null = null;
  private batchPromise: Promise<void> | null = null;

  constructor(graphClient: MSGraphClientV3) {
    this.graphClient = graphClient;
  }

  /**
   * Get photo URL for a user. Returns cached value or queues for batch fetch.
   */
  public async getPhotoUrl(userId: string): Promise<string | undefined> {
    if (!userId) return undefined;

    // Check cache
    if (this.cache.has(userId)) {
      const cached = this.cache.get(userId);
      return cached || undefined; // Empty string means no photo
    }

    // Queue for batch fetch
    this.pendingBatch.add(userId);

    // Debounce batch request
    if (!this.batchTimer) {
      this.batchPromise = new Promise((resolve) => {
        this.batchTimer = window.setTimeout(async () => {
          await this.processBatch();
          this.batchTimer = null;
          resolve();
        }, 50); // 50ms debounce
      });
    }

    await this.batchPromise;
    return this.cache.get(userId) || undefined;
  }

  /**
   * Prefetch photos for multiple users
   */
  public async prefetchPhotos(userIds: string[]): Promise<void> {
    const uncached = userIds.filter(id => id && !this.cache.has(id));
    if (uncached.length === 0) return;

    for (const id of uncached) {
      this.pendingBatch.add(id);
    }

    await this.processBatch();
  }

  private async processBatch(): Promise<void> {
    if (this.pendingBatch.size === 0) return;

    const userIds = Array.from(this.pendingBatch);
    this.pendingBatch.clear();

    // Process in batches of 20
    const batchSize = 20;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      await this.fetchPhotoBatch(batch);
    }
  }

  private async fetchPhotoBatch(userIds: string[]): Promise<void> {
    try {
      const batchRequest = {
        requests: userIds.map((userId, index) => ({
          id: String(index),
          method: 'GET',
          url: `/users/${userId}/photo/$value`
        }))
      };

      const batchResponse = await this.graphClient
        .api('/$batch')
        .post(batchRequest);

      for (const response of batchResponse.responses) {
        const userId = userIds[parseInt(response.id)];

        if (response.status === 200 && response.body) {
          // Convert to data URL
          const dataUrl = `data:image/jpeg;base64,${response.body}`;
          this.cache.set(userId, dataUrl);
        } else {
          // No photo or error - cache empty string to avoid re-fetching
          this.cache.set(userId, '');
        }
      }
    } catch (err) {
      console.warn('Photo batch fetch failed:', err);
      // Mark all as no-photo to avoid re-fetching
      for (const userId of userIds) {
        if (!this.cache.has(userId)) {
          this.cache.set(userId, '');
        }
      }
    }
  }
}
