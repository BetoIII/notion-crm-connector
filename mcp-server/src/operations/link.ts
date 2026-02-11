import { getNotionClient } from "../notion-client.js";
import { sanitizeNotionUUID } from "../utils/uuid.js";
import { buildRelationProperty } from "../utils/property-builder.js";

export async function linkRelation(
  pageId: string,
  propertyName: string,
  targetIds: string[]
): Promise<void> {
  if (!targetIds.length) return;

  const notion = getNotionClient();
  const cleanPageId = sanitizeNotionUUID(pageId);
  const cleanTargetIds = targetIds.map(sanitizeNotionUUID);

  const properties = {
    [propertyName]: buildRelationProperty(cleanTargetIds),
  };

  await notion.pages.update({
    page_id: cleanPageId,
    properties: properties as Parameters<typeof notion.pages.update>[0]["properties"],
  });

  console.error(
    `[link] Linked ${propertyName} on ${cleanPageId} → [${cleanTargetIds.join(", ")}]`
  );
}

export async function appendRelation(
  pageId: string,
  propertyName: string,
  newTargetIds: string[]
): Promise<void> {
  if (!newTargetIds.length) return;

  const notion = getNotionClient();
  const cleanPageId = sanitizeNotionUUID(pageId);

  // First get existing relations
  const page = await notion.pages.retrieve({ page_id: cleanPageId });
  const properties = (page as Record<string, unknown>).properties as Record<string, unknown>;
  const prop = properties[propertyName] as { relation?: Array<{ id: string }> } | undefined;
  const existingIds = prop?.relation?.map((r) => r.id) || [];

  // Merge, deduplicate
  const allIds = [...new Set([...existingIds, ...newTargetIds.map(sanitizeNotionUUID)])];

  await linkRelation(pageId, propertyName, allIds);
}
