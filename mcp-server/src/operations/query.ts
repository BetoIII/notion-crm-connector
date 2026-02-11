import { getNotionClient } from "../notion-client.js";
import { DatabaseKey } from "../schema/types.js";
import { getDatabaseId } from "../schema/loader.js";
import { validateAndHealDatabase } from "../schema/self-heal.js";
import { queryDatabaseAll, QueryOptions } from "../utils/pagination.js";

type NotionFilter = Record<string, unknown>;
type NotionSort = { property: string; direction: "ascending" | "descending" };

export async function queryDatabase(
  dbKey: DatabaseKey,
  filter?: NotionFilter,
  sorts?: NotionSort[],
  limit?: number
): Promise<unknown[]> {
  let dbId = getDatabaseId(dbKey);

  const options: QueryOptions = {
    database_id: dbId,
    filter,
    sorts,
    page_size: limit || 100,
    max_pages: limit ? 1 : 10,
  };

  try {
    const results = await queryDatabaseAll(options);
    return limit ? results.slice(0, limit) : results;
  } catch (error: unknown) {
    const err = error as { status?: number };
    if (err.status === 404) {
      console.error(`[query] 404 for ${dbKey}, attempting self-heal...`);
      dbId = await validateAndHealDatabase(dbKey);
      options.database_id = dbId;
      const results = await queryDatabaseAll(options);
      return limit ? results.slice(0, limit) : results;
    }
    throw error;
  }
}

export async function queryDatabaseSingle(
  dbKey: DatabaseKey,
  filter: NotionFilter
): Promise<unknown | null> {
  const results = await queryDatabase(dbKey, filter, undefined, 1);
  return results.length > 0 ? results[0] : null;
}

export async function getPage(pageId: string): Promise<unknown> {
  const notion = getNotionClient();
  return notion.pages.retrieve({ page_id: pageId });
}
