/**
 * Fetch available pages from Notion workspace
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { NotionClient } from "@/lib/notion/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const apiKey = session?.access_token || process.env.NOTION_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No Notion API key found" },
      { status: 401 }
    );
  }

  try {
    const client = new NotionClient({ accessToken: apiKey });
    const response = await client.searchPages();

    // Filter and format pages
    const pages = (response as any).results
      .filter((page: any) => page.object === "page")
      .map((page: any) => ({
        id: page.id,
        title: page.properties?.title?.title?.[0]?.plain_text || "Untitled",
        icon: page.icon?.emoji || page.icon?.external?.url || null,
      }));

    return NextResponse.json({ pages });
  } catch (error: any) {
    console.error("Failed to fetch pages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
