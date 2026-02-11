import { getNotionClient } from "../notion-client.js";

type NotionFilter = Record<string, unknown>;
type NotionSort = { property: string; direction: "ascending" | "descending" };

export interface QueryOptions {
  database_id: string;
  filter?: NotionFilter;
  sorts?: NotionSort[];
  page_size?: number;
  max_pages?: number;
}

export async function queryDatabaseAll(options: QueryOptions): Promise<unknown[]> {
  const notion = getNotionClient();
  const results: unknown[] = [];
  let cursor: string | undefined = undefined;
  let pages = 0;
  const maxPages = options.max_pages || 10;

  do {
    const response = await notion.databases.query({
      database_id: options.database_id,
      filter: options.filter as Parameters<typeof notion.databases.query>[0]["filter"],
      sorts: options.sorts as Parameters<typeof notion.databases.query>[0]["sorts"],
      page_size: options.page_size || 100,
      start_cursor: cursor,
    });

    results.push(...response.results);
    cursor = response.next_cursor ?? undefined;
    pages++;
  } while (cursor && pages < maxPages);

  return results;
}
