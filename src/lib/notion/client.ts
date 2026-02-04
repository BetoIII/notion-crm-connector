/**
 * Notion API client wrapper
 * Handles authentication, headers, and error responses
 */

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export class NotionAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "NotionAPIError";
  }
}

export interface NotionClientOptions {
  accessToken: string;
}

export class NotionClient {
  private accessToken: string;

  constructor(options: NotionClientOptions) {
    this.accessToken = options.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${NOTION_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new NotionAPIError(
        error.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        error.code
      );
    }

    return response.json();
  }

  async createPage(data: any) {
    return this.request("/pages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createDatabase(data: any) {
    return this.request("/databases", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDatabase(databaseId: string) {
    return this.request(`/databases/${databaseId}`, {
      method: "GET",
    });
  }

  async updateDataSource(dataSourceId: string, data: any) {
    return this.request(`/databases/${dataSourceId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async searchPages(query?: string) {
    return this.request("/search", {
      method: "POST",
      body: JSON.stringify({
        filter: {
          property: "object",
          value: "page",
        },
        ...(query && { query }),
      }),
    });
  }

  async appendBlockChildren(blockId: string, children: any[]) {
    return this.request(`/blocks/${blockId}/children`, {
      method: "PATCH",
      body: JSON.stringify({ children }),
    });
  }
}
