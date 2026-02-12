import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sanitizeNotionUUID } from "@/lib/mcp/sanitize-uuid";
import { addDatabaseToSchema } from "@/lib/mcp/schema-reader";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const apiKey = session?.access_token || process.env.NOTION_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 401 });
  }

  const body = await req.json();
  const { key, notionUrl } = body as { key?: string; notionUrl?: string };

  if (!key || !notionUrl) {
    return NextResponse.json({ error: "Missing key or notionUrl" }, { status: 400 });
  }

  // Parse the URL/ID into a UUID
  let databaseId: string;
  try {
    databaseId = sanitizeNotionUUID(notionUrl);
  } catch {
    return NextResponse.json({ error: "Invalid Notion database URL or ID" }, { status: 400 });
  }

  // Validate the database is accessible
  try {
    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
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

    if (!queryRes.ok) {
      const err = await queryRes.json().catch(() => ({}));
      const msg = (err as Record<string, string>).message || `HTTP ${queryRes.status}`;
      return NextResponse.json(
        { error: `Database not accessible: ${msg}` },
        { status: 400 }
      );
    }
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to reach Notion API" },
      { status: 502 }
    );
  }

  // Fetch database metadata
  let dbName = key;
  let properties: Record<string, unknown> = {};

  try {
    const metaRes = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    if (metaRes.ok) {
      const meta = await metaRes.json();
      const titleParts = meta.title as Array<{ plain_text: string }>;
      if (titleParts?.length) {
        dbName = titleParts.map((t: { plain_text: string }) => t.plain_text).join("");
      }
      properties = meta.properties || {};
    }
  } catch {
    // Non-critical — we already validated access above
  }

  // Write to schema
  addDatabaseToSchema(key, {
    id: databaseId,
    name: dbName,
    properties,
  });

  return NextResponse.json({
    success: true,
    key,
    id: databaseId,
    name: dbName,
    propertyCount: Object.keys(properties).length,
  });
}
