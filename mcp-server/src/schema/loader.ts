import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { CrmSchema, DatabaseKey } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, "../../data/crm-schema.json");

let cachedSchema: CrmSchema | null = null;

export function loadSchema(): CrmSchema {
  if (!cachedSchema) {
    const raw = readFileSync(SCHEMA_PATH, "utf-8");
    cachedSchema = JSON.parse(raw) as CrmSchema;
  }
  return cachedSchema;
}

export function isSchemaStale(): boolean {
  const schema = loadSchema();
  const lastValidated = new Date(schema.last_validated);
  const maxDays = schema.validation_config.max_stale_days;
  const now = new Date();
  const diffDays = (now.getTime() - lastValidated.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > maxDays;
}

export function getDatabaseId(dbKey: DatabaseKey): string {
  const schema = loadSchema();
  const db = schema.databases[dbKey];
  if (!db) {
    throw new Error(`Unknown database key: ${dbKey}`);
  }
  return db.id;
}

export function getDatabaseDef(dbKey: DatabaseKey) {
  const schema = loadSchema();
  return schema.databases[dbKey];
}

export function updateSchemaDatabase(dbKey: DatabaseKey, newId: string): void {
  const schema = loadSchema();
  if (schema.databases[dbKey]) {
    schema.databases[dbKey].id = newId;
    schema.last_validated = new Date().toISOString();
    persistSchema(schema);
  }
}

export function persistSchema(schema?: CrmSchema): void {
  const s = schema || loadSchema();
  writeFileSync(SCHEMA_PATH, JSON.stringify(s, null, 2) + "\n", "utf-8");
  cachedSchema = s;
}

export function addDatabaseToSchema(
  dbKey: DatabaseKey,
  dbDef: CrmSchema["databases"][DatabaseKey]
): void {
  const schema = loadSchema();
  schema.databases[dbKey] = dbDef;
  schema.last_updated = new Date().toISOString();
  persistSchema(schema);
}
