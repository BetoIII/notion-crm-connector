/**
 * Rate limiter for Notion API requests
 * Handles 429 responses with retry-after and exponential backoff
 */

export class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 350; // ~3 req/sec with margin

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await this.executeWithRetry(fn);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    // Wait for minimum interval
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      await this.sleep(this.minInterval - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();

    try {
      return await fn();
    } catch (error: any) {
      // Handle 429 rate limit
      if (error.status === 429) {
        const retryAfter = error.headers?.get?.("retry-after");
        const waitTime = retryAfter
          ? parseInt(retryAfter) * 1000
          : Math.pow(2, retryCount) * 1000; // Exponential backoff

        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
        await this.sleep(waitTime);

        // Retry with incremented count
        if (retryCount < 5) {
          return this.executeWithRetry(fn, retryCount + 1);
        }
      }

      throw error;
    }
  }

  private async processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }

    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
