/**
 * API endpoint to fetch all databases from Notion workspace
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

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
    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          value: "database",
          property: "object",
        },
        sort: {
          direction: "descending",
          timestamp: "last_edited_time",
        },
        page_size: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Notion API error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch databases", databases: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Found ${data.results?.length || 0} databases`);

    // Format databases for dropdown
    const databases = data.results.map((db: any) => {
      // Extract title from different possible locations
      let title = "Untitled Database";

      if (db.title && Array.isArray(db.title)) {
        title = db.title.map((t: any) => t.plain_text).join("") || "Untitled Database";
      }

      return {
        id: db.id,
        title: title,
        icon: db.icon?.emoji || db.icon?.external?.url || null,
        lastEdited: db.last_edited_time,
      };
    });

    return NextResponse.json({ databases });
  } catch (error: any) {
    console.error("Error fetching databases:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch databases" },
      { status: 500 }
    );
  }
}
