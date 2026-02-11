import { getNotionClient } from "../notion-client.js";
import { DatabaseKey } from "./types.js";
import { loadSchema, updateSchemaDatabase } from "./loader.js";

export async function validateAndHealDatabase(dbKey: DatabaseKey): Promise<string> {
  const schema = loadSchema();
  const dbDef = schema.databases[dbKey];
  if (!dbDef) {
    throw new Error(`No database definition for key: ${dbKey}`);
  }

  const notion = getNotionClient();

  try {
    await notion.databases.query({
      database_id: dbDef.id,
      page_size: 1,
    });
    return dbDef.id;
  } catch (error: unknown) {
    const err = error as { status?: number };
    if (err.status !== 404) {
      throw error;
    }
  }

  console.error(`[self-heal] Database ${dbKey} (${dbDef.id}) returned 404. Searching by name...`);

  const namesToTry = schema.database_name_mappings[dbKey] || [dbDef.display_name, dbDef.name];

  for (const name of namesToTry) {
    try {
      const searchResult = await notion.search({
        query: name,
        filter: { property: "object", value: "database" },
      });

      if (searchResult.results.length > 0) {
        const newId = searchResult.results[0].id;
        console.error(`[self-heal] Found ${dbKey} database: ${newId} (matched "${name}")`);
        updateSchemaDatabase(dbKey, newId);
        return newId;
      }
    } catch (searchErr) {
      console.error(`[self-heal] Search failed for "${name}":`, searchErr);
    }
  }

  throw new Error(
    `Could not find database for ${dbKey}. Searched names: ${namesToTry.join(", ")}`
  );
}
