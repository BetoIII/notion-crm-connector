import { NextRequest, NextResponse } from "next/server";
import { connectedDBsDB, contactDB } from "@/lib/db/client";
import type { FieldMapping } from "@/lib/templates/types";

/**
 * GET /api/notion/connect/[id]/preview
 * Fetch records from a connected Notion database and mark which are already imported
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connectionId = parseInt(id, 10);

    if (isNaN(connectionId)) {
      return NextResponse.json(
        { error: "Invalid connection ID" },
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
    const rawRecords = data.records || [];

    // Map records to contact previews
    const records = rawRecords.map((record: any) => {
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
        page_id: record.id,
        name: fullName || `${firstName || ""} ${lastName || ""}`.trim() || "Unknown",
        email: getValue(fieldMapping.email) || null,
        phone: getValue(fieldMapping.phone) || null,
        company: getValue(fieldMapping.company) || null,
        title: getValue(fieldMapping.title) || null,
      };
    });

    // Get already-imported page IDs for this database
    const existingContacts = contactDB.getAll({
      source: "notion",
    }) as any[];

    const importedPageIds = new Set(
      existingContacts
        .filter((c: any) => c.source_database_id === connection.database_id)
        .map((c: any) => c.source_id)
    );

    return NextResponse.json({
      records,
      alreadyImported: Array.from(importedPageIds),
      connectionId: connection.id,
      databaseId: connection.database_id,
    });
  } catch (error) {
    console.error("Error previewing records:", error);
    return NextResponse.json(
      { error: "Failed to preview records" },
      { status: 500 }
    );
  }
}
