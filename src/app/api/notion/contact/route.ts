/**
 * API endpoint to fetch contact data from a Notion page
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import type { ContactData, ContactResolutionResponse } from "@/lib/templates/types";

export const dynamic = "force-dynamic";

/**
 * Extract page ID from various Notion URL formats
 */
function extractPageId(url: string): string | null {
  try {
    // Remove whitespace
    url = url.trim();

    // Handle direct page IDs (32 or 36 characters with hyphens)
    if (/^[a-f0-9]{32}$/i.test(url.replace(/-/g, ""))) {
      return url.replace(/-/g, "");
    }

    // Parse URL
    const urlObj = new URL(url);
    
    // Extract from path - Notion URLs end with pageId
    // Format: https://notion.so/Page-Title-abc123def456...
    const pathParts = urlObj.pathname.split("-");
    const lastPart = pathParts[pathParts.length - 1];
    
    // Check if last part is a valid page ID (32 hex chars)
    if (lastPart && /^[a-f0-9]{32}$/i.test(lastPart)) {
      return lastPart;
    }

    // Try extracting from hash
    if (urlObj.hash) {
      const hashId = urlObj.hash.substring(1);
      if (/^[a-f0-9]{32}$/i.test(hashId.replace(/-/g, ""))) {
        return hashId.replace(/-/g, "");
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Format page ID for Notion API (add hyphens)
 */
function formatPageId(pageId: string): string {
  if (pageId.includes("-")) return pageId;
  return `${pageId.slice(0, 8)}-${pageId.slice(8, 12)}-${pageId.slice(12, 16)}-${pageId.slice(16, 20)}-${pageId.slice(20)}`;
}

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

  return undefined;
}

/**
 * Auto-detect contact fields from Notion page properties
 */
function extractContactData(properties: any): ContactData {
  const contactData: ContactData = {};

  // Iterate through all properties to find common fields
  for (const [key, value] of Object.entries(properties)) {
    const keyLower = key.toLowerCase();
    const text = extractPlainText(value);

    if (!text) continue;

    // Map to standard fields
    if (keyLower === "name" || keyLower === "contact name" || keyLower === "full name") {
      contactData.contact_name = text;
    } else if (keyLower === "first name" || keyLower === "firstname") {
      contactData.first_name = text;
    } else if (keyLower === "last name" || keyLower === "lastname" || keyLower === "surname") {
      contactData.last_name = text;
    } else if (
      keyLower === "phone" ||
      keyLower === "phone number" ||
      keyLower === "contact phone" ||
      keyLower === "contact phone number" ||
      keyLower === "mobile" ||
      keyLower === "cell" ||
      keyLower === "cell phone"
    ) {
      contactData.phone = text;
    } else if (keyLower === "email" || keyLower === "email address" || keyLower === "contact email") {
      contactData.email = text;
    } else if (keyLower === "company" || keyLower === "organization") {
      contactData.company = text;
    }
  }

  // If no name found, try to get title property (typically the first property)
  if (!contactData.contact_name && properties.title) {
    contactData.contact_name = extractPlainText(properties.title);
  }

  // If still no name, look for any title-type property
  if (!contactData.contact_name) {
    for (const [key, value] of Object.entries(properties)) {
      const prop = value as any;
      if (prop.type === "title" && prop.title) {
        contactData.contact_name = extractPlainText(prop);
        break;
      }
    }
  }

  // If we have first_name and last_name but no contact_name, construct it
  if (!contactData.contact_name && (contactData.first_name || contactData.last_name)) {
    contactData.contact_name = [contactData.first_name, contactData.last_name]
      .filter(Boolean)
      .join(" ");
  }

  return contactData;
}

/**
 * GET /api/notion/contact?url=<notion_page_url>
 * Fetch contact data from a Notion page
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  const apiKey = session?.access_token || process.env.NOTION_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "No Notion API key found" },
      { status: 401 }
    );
  }

  // Get URL parameter
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { success: false, error: "Missing 'url' parameter" },
      { status: 400 }
    );
  }

  // Extract page ID from URL
  const pageId = extractPageId(url);
  if (!pageId) {
    return NextResponse.json(
      { success: false, error: "Invalid Notion page URL" },
      { status: 400 }
    );
  }

  try {
    const formattedPageId = formatPageId(pageId);

    // Fetch page from Notion API
    const response = await fetch(
      `https://api.notion.com/v1/pages/${formattedPageId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Notion API error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to fetch page from Notion",
        },
        { status: response.status }
      );
    }

    const pageData = await response.json();

    // Extract contact data from page properties
    const contactData = extractContactData(pageData.properties);

    const result: ContactResolutionResponse = {
      success: true,
      contact: contactData,
      pageId: formattedPageId,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch contact" },
      { status: 500 }
    );
  }
}
