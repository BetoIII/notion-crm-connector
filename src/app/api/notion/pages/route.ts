/**
 * API endpoint to fetch pages from Notion workspace
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
          value: "page",
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
        { error: error.message || "Failed to fetch pages", pages: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Found ${data.results?.length || 0} pages`);

    // Format pages for dropdown
    const pages = data.results.map((page: any) => {
      // Extract title from different possible locations
      let title = "Untitled";

      if (page.properties?.title?.title?.[0]?.plain_text) {
        title = page.properties.title.title[0].plain_text;
      } else if (page.properties?.Name?.title?.[0]?.plain_text) {
        title = page.properties.Name.title[0].plain_text;
      } else if (page.title?.[0]?.plain_text) {
        title = page.title[0].plain_text;
      }

      return {
        id: page.id,
        title: title || "Untitled",
        icon: page.icon?.emoji || page.icon?.external?.url || null,
        lastEdited: page.last_edited_time,
      };
    });

    return NextResponse.json({ pages });
  } catch (error: any) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
