import { getNotionClient } from "../notion-client.js";
import { DatabaseKey } from "../schema/types.js";
import { buildProperties } from "../utils/property-builder.js";
import { sanitizeNotionUUID } from "../utils/uuid.js";

export async function updatePage(
  pageId: string,
  dbKey: DatabaseKey,
  data: Record<string, unknown>
): Promise<unknown> {
  const notion = getNotionClient();
  const cleanId = sanitizeNotionUUID(pageId);
  const properties = buildProperties(dbKey, data);

  const response = await notion.pages.update({
    page_id: cleanId,
    properties: properties as Parameters<typeof notion.pages.update>[0]["properties"],
  });

  console.error(`[update] Updated page ${cleanId} in ${dbKey}`);
  return response;
}
