import { Client } from "@notionhq/client";

let client: Client | null = null;

export function getNotionClient(): Client {
  if (!client) {
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      throw new Error(
        "NOTION_API_KEY environment variable is required. Set it in your Claude Desktop MCP config."
      );
    }
    client = new Client({ auth: apiKey });
  }
  return client;
}
