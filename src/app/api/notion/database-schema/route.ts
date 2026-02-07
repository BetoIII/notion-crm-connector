import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const databaseId = searchParams.get("databaseId");

    if (!databaseId) {
      return NextResponse.json(
        { error: "databaseId is required" },
        { status: 400 }
      );
    }

    const session = await getSession();
    const apiKey = session?.access_token || process.env.NOTION_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "No Notion API key found" },
        { status: 401 }
      );
    }

    // Fetch database schema using Notion REST API
    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Notion API error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch database schema" },
        { status: response.status }
      );
    }

    const database = await response.json();

    // Convert properties to a more usable format
    const properties = Object.entries(database.properties || {}).map(
      ([name, prop]: [string, any]) => ({
        name,
        type: prop.type,
        id: prop.id,
      })
    );

    return NextResponse.json({
      id: database.id,
      title: database.title?.[0]?.plain_text || "Untitled",
      properties,
    });
  } catch (error: any) {
    console.error("Error fetching database schema:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch database schema" },
      { status: 500 }
    );
  }
}
