import { getNotionClient } from "../notion-client.js";
import { DatabaseKey } from "../schema/types.js";
import { getDatabaseId } from "../schema/loader.js";
import { buildProperties } from "../utils/property-builder.js";

export async function createPage(
  dbKey: DatabaseKey,
  data: Record<string, unknown>
): Promise<unknown> {
  const notion = getNotionClient();
  const dbId = getDatabaseId(dbKey);
  const properties = buildProperties(dbKey, data);

  const response = await notion.pages.create({
    parent: { database_id: dbId },
    properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
  });

  console.error(`[create] Created page in ${dbKey}: ${(response as { id: string }).id}`);
  return response;
}
