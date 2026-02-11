import { DatabaseKey } from "../schema/types.js";
import { getDatabaseDef } from "../schema/loader.js";
import { queryDatabase } from "./query.js";
import { buildEmailFilter, buildTitleContainsFilter } from "../utils/filter-builder.js";

function getTitleProperty(dbKey: DatabaseKey): string {
  const dbDef = getDatabaseDef(dbKey);
  for (const [name, prop] of Object.entries(dbDef.properties)) {
    if (prop.type === "title") return name;
  }
  throw new Error(`No title property found for ${dbKey}`);
}

function getEmailProperty(dbKey: DatabaseKey): string | null {
  const dbDef = getDatabaseDef(dbKey);
  for (const [name, prop] of Object.entries(dbDef.properties)) {
    if (prop.type === "email") return name;
  }
  return null;
}

export async function searchByTitle(
  dbKey: DatabaseKey,
  query: string,
  limit?: number
): Promise<unknown[]> {
  const titleProp = getTitleProperty(dbKey);
  const filter = buildTitleContainsFilter(titleProp, query);
  return queryDatabase(dbKey, filter, undefined, limit || 10);
}

export async function searchByEmail(
  dbKey: DatabaseKey,
  email: string
): Promise<unknown | null> {
  const emailProp = getEmailProperty(dbKey);
  if (!emailProp) return null;

  const filter = buildEmailFilter(emailProp, email);
  const results = await queryDatabase(dbKey, filter, undefined, 1);
  return results.length > 0 ? results[0] : null;
}

export async function searchByFilter(
  dbKey: DatabaseKey,
  filter: Record<string, unknown>,
  sorts?: Array<{ property: string; direction: "ascending" | "descending" }>,
  limit?: number
): Promise<unknown[]> {
  return queryDatabase(dbKey, filter, sorts, limit);
}
