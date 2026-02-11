import { DatabaseKey } from "./types.js";
import { isSchemaStale, loadSchema } from "./loader.js";
import { validateAndHealDatabase } from "./self-heal.js";

let validated = false;

export async function ensureSchemaValid(): Promise<void> {
  if (validated) return;

  const schema = loadSchema();
  if (!isSchemaStale()) {
    validated = true;
    return;
  }

  console.error("[validator] Schema is stale, validating databases...");

  const dbKeys = Object.keys(schema.databases) as DatabaseKey[];
  for (const dbKey of dbKeys) {
    try {
      await validateAndHealDatabase(dbKey);
      console.error(`[validator] Database ${dbKey} validated OK`);
    } catch (err) {
      console.error(`[validator] Database ${dbKey} validation failed:`, err);
    }
  }

  validated = true;
}
