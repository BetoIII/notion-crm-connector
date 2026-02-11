import fs from "fs";
import path from "path";

const SCHEMA_PATH = path.join(process.cwd(), "mcp-server", "data", "crm-schema.json");

interface McpDatabaseEntry {
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
