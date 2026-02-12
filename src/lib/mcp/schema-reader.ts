import fs from "fs";
import path from "path";

const SCHEMA_PATH = path.join(process.cwd(), "mcp-server", "data", "crm-schema.json");

export interface McpDatabaseEntry {
  id: string;
  collection_id?: string;
  name: string;
  display_name?: string;
  properties: Record<string, unknown>;
}

interface McpSchema {
  version: string;
  last_updated: string;
  last_validated: string;
  databases: Record<string, McpDatabaseEntry>;
}

export function isMcpSchemaPresent(): boolean {
  return fs.existsSync(SCHEMA_PATH);
}

export function loadMcpSchema(): McpSchema | null {
  if (!fs.existsSync(SCHEMA_PATH)) return null;
  try {
    const raw = fs.readFileSync(SCHEMA_PATH, "utf-8");
    return JSON.parse(raw) as McpSchema;
  } catch {
    return null;
  }
}

export function getMcpDatabases(): Array<{
  key: string;
  name: string;
  id: string;
  propertyCount: number;
}> {
  const schema = loadMcpSchema();
  if (!schema?.databases) return [];

  return Object.entries(schema.databases).map(([key, db]) => ({
    key,
    name: db.name || db.display_name || key,
    id: db.id,
    propertyCount: Object.keys(db.properties || {}).length,
  }));
}

export function addDatabaseToSchema(key: string, entry: McpDatabaseEntry): void {
  let schema = loadMcpSchema();

  if (!schema) {
    schema = {
      version: "1.0",
      last_updated: new Date().toISOString(),
      last_validated: new Date().toISOString(),
      databases: {},
    };
  }

  schema.databases[key] = entry;
  schema.last_updated = new Date().toISOString();

  const dir = path.dirname(SCHEMA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(SCHEMA_PATH, JSON.stringify(schema, null, 2), "utf-8");
}
