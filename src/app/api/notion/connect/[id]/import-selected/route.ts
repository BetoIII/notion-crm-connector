import { NextRequest, NextResponse } from "next/server";
import { connectedDBsDB, contactDB } from "@/lib/db/client";
import type { FieldMapping } from "@/lib/templates/types";

/**
 * POST /api/notion/connect/[id]/import-selected
 * Import specific contacts by their Notion page IDs
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connectionId = parseInt(id, 10);
    const body = await request.json();
    const { page_ids } = body;

    if (isNaN(connectionId)) {
      return NextResponse.json(
        { error: "Invalid connection ID" },
        { status: 400 }
      );
    }

    if (!Array.isArray(page_ids) || page_ids.length === 0) {
      return NextResponse.json(
        { error: "No page IDs provided" },
        { status: 400 }
      );
    }

    const connection = connectedDBsDB.getById(connectionId) as any;
    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    const fieldMapping: FieldMapping = JSON.parse(connection.field_mapping);

    // Fetch records from Notion
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/notion/databases/${connection.database_id}/records?raw=true`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Notion records: ${response.status}`);
    }

    const data = await response.json();
    const allRecords = data.records || [];

    // Filter to only requested page IDs
    const selectedPageIds = new Set(page_ids);
    const selectedRecords = allRecords.filter((r: any) =>
      selectedPageIds.has(r.id)
    );

    // Map to contacts
    const contacts = selectedRecords.map((record: any) => {
      const properties = record.properties || {};

      const getValue = (notionPropertyName: string | undefined) => {
        if (!notionPropertyName) return undefined;
        if (notionPropertyName === "__AUTO_SPLIT_FROM_NAME__") return undefined;
        const prop = properties[notionPropertyName];
        if (!prop) return undefined;

        if (prop.title?.length > 0) return prop.title[0]?.plain_text;
        if (prop.rich_text?.length > 0) return prop.rich_text[0]?.plain_text;
        if (prop.email) return prop.email;
        if (prop.phone_number) return prop.phone_number;
        if (prop.select?.name) return prop.select.name;
        if (prop.number) return String(prop.number);

        return undefined;
      };

      const fullName = getValue(fieldMapping.name);
      let firstName = getValue(fieldMapping.first_name);
      let lastName = getValue(fieldMapping.last_name);

      if (fieldMapping.first_name === "__AUTO_SPLIT_FROM_NAME__" && fullName) {
        const parts = fullName.trim().split(/\s+/);
        firstName = parts[0] || "";
      }
      if (fieldMapping.last_name === "__AUTO_SPLIT_FROM_NAME__" && fullName) {
        const parts = fullName.trim().split(/\s+/);
        lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
      }

      return {
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        email: getValue(fieldMapping.email),
        phone: getValue(fieldMapping.phone),
        company: getValue(fieldMapping.company),
        title: getValue(fieldMapping.title),
        city: getValue(fieldMapping.city),
        state: getValue(fieldMapping.state),
        source: "notion" as const,
        source_id: record.id,
        source_database_id: connection.database_id,
        source_url: record.url,
      };
    });

    contactDB.createMany(contacts);
    connectedDBsDB.updateLastSynced(connectionId);

    return NextResponse.json({
      success: true,
      importedCount: contacts.length,
    });
  } catch (error) {
    console.error("Error importing selected records:", error);
    return NextResponse.json(
      { error: "Failed to import selected records" },
      { status: 500 }
    );
  }
}
