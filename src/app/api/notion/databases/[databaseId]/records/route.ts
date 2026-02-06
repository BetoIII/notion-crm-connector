/**
 * API endpoint to fetch all records from a specific Notion database
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Extract plain text from Notion rich text property
 */
function extractPlainText(property: any): string | undefined {
  if (!property) return undefined;

  // Title property
  if (property.title && Array.isArray(property.title)) {
    return property.title.map((t: any) => t.plain_text).join("");
  }

  // Rich text property
  if (property.rich_text && Array.isArray(property.rich_text)) {
    return property.rich_text.map((t: any) => t.plain_text).join("");
  }

  // Phone number property
  if (property.phone_number) {
    return property.phone_number;
  }

  // Email property
  if (property.email) {
    return property.email;
  }

  // URL property
  if (property.url) {
    return property.url;
  }

  // Select property
  if (property.select?.name) {
    return property.select.name;
  }

  // Number property
  if (property.number !== null && property.number !== undefined) {
    return String(property.number);
  }

  return undefined;
}

/**
 * Extract contact data from page properties
 */
function extractContactData(properties: any, pageId: string, pageUrl: string) {
  const contact: any = {
    id: pageId,
    url: pageUrl,
  };

  // Iterate through all properties to find common fields
  for (const [key, value] of Object.entries(properties)) {
    const keyLower = key.toLowerCase();
    const text = extractPlainText(value);

    if (!text) continue;

    // Map to standard fields
    if (keyLower === "name" || keyLower === "contact name" || keyLower === "full name") {
      contact.contact_name = text;
    } else if (
      keyLower === "phone" ||
      keyLower === "phone number" ||
      keyLower === "contact phone" ||
      keyLower === "contact phone number" ||
      keyLower === "mobile" ||
      keyLower === "cell" ||
      keyLower === "cell phone"
    ) {
      contact.phone = text;
    } else if (keyLower === "email" || keyLower === "email address" || keyLower === "contact email") {
      contact.email = text;
    } else if (keyLower === "company" || keyLower === "organization") {
      contact.company = text;
    }
  }

  // If no name found, try to get title property (typically the first property)
  if (!contact.contact_name) {
    for (const [key, value] of Object.entries(properties)) {
      const prop = value as any;
      if (prop.type === "title" && prop.title) {
        contact.contact_name = extractPlainText(prop);
        break;
      }
    }
  }

  return contact;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ databaseId: string }> }
) {
  const session = await getSession();
  const apiKey = session?.access_token || process.env.NOTION_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No Notion API key found" },
      { status: 401 }
    );
  }

  const { databaseId } = await params;

  try {
    // Fetch all pages from the database
    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Notion API error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch database records", records: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Found ${data.results?.length || 0} records in database ${databaseId}`);

    // Extract contact data from each page
    const records = data.results.map((page: any) => {
      const pageUrl = page.url || `https://notion.so/${page.id.replace(/-/g, "")}`;
      return extractContactData(page.properties, page.id, pageUrl);
    });

    return NextResponse.json({ records });
  } catch (error: any) {
    console.error("Error fetching database records:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch database records" },
      { status: 500 }
    );
  }
}
