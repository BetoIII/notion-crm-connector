import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isMcpSchemaPresent, getMcpDatabases } from "@/lib/mcp/schema-reader";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const EXPECTED_DATABASES = ["contacts", "accounts", "opportunities", "activities"];

const MCP_BUILD_PATH = path.join(process.cwd(), "mcp-server", "build", "index.js");

interface DatabaseStatus {
  key: string;
  name: string;
  id: string | null;
  accessible: boolean;
  error: string | null;
  propertyCount: number;
}

export async function GET() {
  const session = await getSession();
  const apiKey = session?.access_token || process.env.NOTION_API_KEY;

  const hasApiKey = Boolean(apiKey);
  const schemaPresent = isMcpSchemaPresent();
  const mcpBuilt = fs.existsSync(MCP_BUILD_PATH);
  const schemaDatabases = getMcpDatabases();

  const databases: DatabaseStatus[] = [];

  for (const key of EXPECTED_DATABASES) {
    const schemaEntry = schemaDatabases.find((d) => d.key === key);

    if (!schemaEntry) {
      databases.push({
        key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        id: null,
        accessible: false,
        error: key === "activities" ? "Not yet configured — run setup_activities_database via Claude" : "Not found in schema",
        propertyCount: 0,
      });
      continue;
    }

    if (!apiKey) {
      databases.push({
        key,
        name: schemaEntry.name,
        id: schemaEntry.id,
        accessible: false,
        error: "No API key configured",
        propertyCount: schemaEntry.propertyCount,
      });
      continue;
    }

    // Test database accessibility by querying with page_size=1
    try {
      const res = await fetch(
        `https://api.notion.com/v1/databases/${schemaEntry.id}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ page_size: 1 }),
        }
      );

      if (res.ok) {
        databases.push({
          key,
          name: schemaEntry.name,
          id: schemaEntry.id,
          accessible: true,
          error: null,
          propertyCount: schemaEntry.propertyCount,
        });
      } else {
        const err = await res.json().catch(() => ({}));
        databases.push({
          key,
          name: schemaEntry.name,
          id: schemaEntry.id,
          accessible: false,
          error: (err as Record<string, string>).message || `HTTP ${res.status}`,
          propertyCount: schemaEntry.propertyCount,
        });
      }
    } catch (e: unknown) {
      databases.push({
        key,
        name: schemaEntry.name,
        id: schemaEntry.id,
        accessible: false,
        error: e instanceof Error ? e.message : "Connection failed",
        propertyCount: schemaEntry.propertyCount,
      });
    }
  }

  const allConnected = databases.every((d) => d.accessible);
  const someConnected = databases.some((d) => d.accessible);

  return NextResponse.json({
    hasApiKey,
    schemaPresent,
    mcpBuilt,
    databases,
    allConnected,
    someConnected,
    connectedCount: databases.filter((d) => d.accessible).length,
    totalCount: databases.length,
  });
}
